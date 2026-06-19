import { ZodError, z } from 'zod';
import { validationErrorResponse } from './api-response';
import { ErrorHandler } from './errors';

// Validation result interface
export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: string[];
  errorDetails?: any;
}

// Centralized validation handler
export class ValidationHandler {
  /**
   * Validate data against a Zod schema
   * @param schema - Zod schema to validate against
   * @param data - Data to validate
   * @returns Validation result with data or errors
   */
  static validate<T>(schema: z.ZodSchema<T>, data: any): ValidationResult<T> {
    try {
      const validatedData = schema.parse(data);
      return {
        success: true,
        data: validatedData
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((e: any) => e.message);
        return {
          success: false,
          errors,
          errorDetails: error.issues
        };
      }
      return {
        success: false,
        errors: ['Lỗi validation không xác định']
      };
    }
  }

  /**
   * Validate and return error response if validation fails
   * @param schema - Zod schema to validate against
   * @param data - Data to validate
   * @returns NextResponse with validation error or null if validation passes
   */
  static validateOrErrorResponse<T>(
    schema: z.ZodSchema<T>,
    data: any
  ): ReturnType<typeof validationErrorResponse> | null {
    const result = this.validate(schema, data);
    
    if (!result.success) {
      return validationErrorResponse(
        result.errors || ['Dữ liệu không hợp lệ'],
        'Dữ liệu không hợp lệ'
      );
    }
    
    return null;
  }

  /**
   * Validate request body and return validated data or throw error
   * @param schema - Zod schema to validate against
   * @param body - Request body to validate
   * @returns Validated data
   * @throws ZodError if validation fails
   */
  static validateOrThrow<T>(schema: z.ZodSchema<T>, body: any): T {
    return schema.parse(body);
  }

  /**
   * Safe validate with default value
   * @param schema - Zod schema to validate against
   * @param data - Data to validate
   * @param defaultValue - Default value if validation fails
   * @returns Validated data or default value
   */
  static validateOrDefault<T>(
    schema: z.ZodSchema<T>,
    data: any,
    defaultValue: T
  ): T {
    const result = this.validate(schema, data);
    return result.success ? result.data! : defaultValue;
  }
}

// Higher-order function to wrap API handlers with validation
export function withValidation<T>(
  schema: z.ZodSchema<T>
) {
  return function (
    handler: (validatedData: T, req: Request) => Promise<Response>
  ) {
    return async (req: Request) => {
      try {
        const body = await req.json();
        const validationResult = ValidationHandler.validateOrErrorResponse(schema, body);
        
        if (validationResult) {
          return validationResult;
        }
        
        const validatedData = ValidationHandler.validateOrThrow(schema, body);
        return await handler(validatedData, req);
      } catch (error) {
        ErrorHandler.log(ErrorHandler.handle(error), 'Validation wrapper error');
        return validationErrorResponse(['Lỗi xử lý request']);
      }
    };
  };
}

// Common validation schemas (can be extended)
export const commonValidations = {
  // Pagination
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20)
  }),

  // ID validation
  id: z.coerce.number().positive('ID phải là số dương'),

  // Phone number
  phone: z.string().regex(/^[0-9]{10}$/, 'Số điện thoại phải 10 số'),

  // Email
  email: z.string().email('Email không đúng định dạng'),

  // Date
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Ngày không hợp lệ'),

  // Future date
  futureDate: z.string().refine((val) => new Date(val) > new Date(), 'Ngày phải trong tương lai')
};

// Helper to create validation error response
export function createValidationError(field: string, message: string): Record<string, string> {
  return { [field]: message };
}

// Helper to format Zod errors for API response
export function formatZodErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  
  error.issues.forEach((err: any) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return errors;
}
