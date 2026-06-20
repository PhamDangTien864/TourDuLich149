import { prisma } from '@/lib/prisma';
import { comparePassword, hashPassword, generateToken } from '@/lib/auth';
import { resend } from '@/lib/resend';
import { AuthenticationError, ValidationError, ErrorHandler } from '@/lib/errors';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
  birth_date: string;
}

export interface AuthResult {
  user: {
    id: number;
    name: string;
    role_id: number;
    is_verified: boolean;
  };
  clientToken: string;
}

export class AuthService {
  /**
   * Authenticate user with username and password
   * Extracts business logic from login API route
   */
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    const { username, password } = credentials;

    // Find user in accounts table
    const user = await prisma.accounts.findFirst({
      where: { 
        username: username,
        is_deleted: false 
      }
    });

    if (!user) {
      throw new AuthenticationError('Sai tài khoản hoặc mật khẩu!');
    }

    // Check password (handle null password for social login users)
    if (!user.password) {
      throw new AuthenticationError('Tài khoản này sử dụng đăng ký xã hội, vui lòng đăng nhập bằng mạng xã hội');
    }

    const isPasswordValid = await comparePassword(password, user.password as string);

    if (!isPasswordValid) {
      throw new AuthenticationError('Sai tài khoản hoặc mật khẩu!');
    }

    // Check verification status
    if (!user.is_verified) {
      throw new AuthenticationError('Tài khoản chưa kích hoạt!');
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      name: user.full_name,
      role_id: user.role_id ?? 2,
      is_verified: user.is_verified
    });

    return {
      user: {
        id: user.id,
        name: user.full_name,
        role_id: user.role_id ?? 2,
        is_verified: user.is_verified
      },
      clientToken: token
    };
  }

  /**
   * Register a new user
   * Extracts business logic from register API route
   */
  static async register(data: RegisterData): Promise<{ userId: number }> {
    const { username, email, password, full_name, phone_number, birth_date } = data;

    // Check for duplicate Username, Email, or Phone number
    const existing = await prisma.accounts.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email },
          { phone_number: phone_number }
        ],
        is_deleted: false // Only check active accounts, allow reuse of deleted account info
      }
    });

    if (existing) {
      let message;
      if (existing.username === username) {
        message = "Tên tài khoản này đã được sử dụng! Vui lòng chọn tên tài khoản khác.";
      } else if (existing.email === email) {
        message = "Email này đã được sử dụng! Vui lòng sử dụng email khác hoặc kiểm tra lại email.";
      } else {
        message = "Số điện thoại này đã được sử dụng! Vui lòng sử dụng số điện thoại khác.";
      }
      throw new ValidationError([message]);
    }

    const hashedPassword = await hashPassword(password);

    // Create customer account (role_id = 2)
    const user = await prisma.accounts.create({
      data: {
        full_name,
        username,
        email, 
        password: hashedPassword,
        phone_number,
        birth_date: new Date(birth_date),
        role_id: 2, // Customer role
        is_verified: false,
      }
    });

    // Send verification email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify-email?id=${user.id}`;

    try {
      const emailData = {
        from: 'VietTravel Luxury <verify@travelluxury.id.vn>',
        to: [email],
        subject: 'Xác thực tài khoản VietTravel Luxury',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #2563eb; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">VietTravel Luxury</h1>
            </div>
            <div style="padding: 30px; color: #333;">
              <h2 style="color: #2563eb;">Xác thực tài khoản của bạn</h2>
              <p>Chào <strong>${full_name}</strong>,</p>
              <p>Cảm ơn bạn đã tin tưởng và đăng ký tài khoản tại VietTravel Luxury. Vui lòng nhấn vào nút bên dưới để kích hoạt tài khoản ngay nhé:</p>
              <div style="text-align: center; margin: 35px 0;">
                <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Kích hoạt tài khoản
                </a>
              </div>
              <p>Nếu nút không hoạt động, bạn có thể copy link này dán vào trình duyệt:</p>
              <p style="word-break: break-all;"><a href="${verifyUrl}" style="color: #2563eb;">${verifyUrl}</a></p>
              <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;">
              <p style="color: #6b7280; font-size: 12px; text-align: center;">
                Đây là email tự động từ hệ thống VietTravel Luxury. Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.
              </p>
            </div>
          </div>
        `
      };

      await resend.emails.send(emailData);
    } catch (emailError) {
      ErrorHandler.log(ErrorHandler.handle(emailError), 'Failed to send verification email');
    }

    return { userId: user.id };
  }

  /**
   * Verify user account
   */
  static async verifyAccount(userId: number): Promise<void> {
    const user = await prisma.accounts.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AuthenticationError('Người dùng không tồn tại');
    }

    if (user.is_verified) {
      throw new ValidationError(['Tài khoản đã được kích hoạt']);
    }

    await prisma.accounts.update({
      where: { id: userId },
      data: { is_verified: true }
    });
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: number): Promise<any> {
    const user = await prisma.accounts.findUnique({
      where: { id: userId, is_deleted: false },
      select: {
        id: true,
        full_name: true,
        username: true,
        email: true,
        phone_number: true,
        role_id: true,
        is_verified: true,
        avatar_url: true,
        birth_date: true
      }
    });

    if (!user) {
      throw new AuthenticationError('Người dùng không tồn tại');
    }

    return user;
  }

  /**
   * Change user password
   */
  static async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.accounts.findUnique({
      where: { id: userId, is_deleted: false }
    });

    if (!user) {
      throw new AuthenticationError('Người dùng không tồn tại');
    }

    if (!user.password) {
      throw new AuthenticationError('Tài khoản này sử dụng đăng ký xã hội, không thể đổi mật khẩu');
    }

    const isPasswordValid = await comparePassword(currentPassword, user.password as string);

    if (!isPasswordValid) {
      throw new AuthenticationError('Mật khẩu hiện tại không đúng');
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.accounts.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: number, data: Partial<{
    full_name: string;
    phone_number: string;
    avatar_url: string;
  }>): Promise<any> {
    const user = await prisma.accounts.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        full_name: true,
        username: true,
        email: true,
        phone_number: true,
        role_id: true,
        is_verified: true,
        avatar_url: true,
        birth_date: true
      }
    });

    return user;
  }
}