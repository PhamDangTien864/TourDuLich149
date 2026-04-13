# 🔧 Fix Login 401 Error - Hướng Dẫn Nhanh

## 🚨 Vấn đề
Login trả về 401 dù database connection OK.

## 🔍 Phân Tích
Database query đang chạy nhưng không tìm thấy user hoặc password không match.

## ⚡ Giải Pháp Nhanh

### Bước 1: Tạo Admin User
Chạy script sau:
```bash
cd travel-website
node scripts/quick-seed.js
```

### Bước 2: Test Login
- Username: `admin`
- Password: `admin123`

### Bước 3: Kiểm Tra Kết Quả
Nếu thành công, sẽ thấy:
- Token được tạo
- Cookie được set
- Redirect về trang chủ

## 📝 Log Debug
Kiểm tra console output để thấy:
- User có được tìm thấy không
- Password có match không
- Error message chi tiết

## 🛠️ Nếu Vẫn Lỗi

1. **Kiểm tra database connection:**
   - Verify DATABASE_URL trong `.env`
   - Test connection với MySQL client

2. **Kiểm tra user data:**
   - User có tồn tại trong database?
   - `is_deleted` có = false không?
   - Password có được hash đúng không?

3. **Restart server:**
   ```bash
   npm run dev
   ```

## ✅ Files Đã Tạo
- `scripts/quick-seed.js` - Script tạo admin user nhanh
- `FIX-LOGIN.md` - Hướng dẫn này

**Chạy script và test lại login ngay!** 🚀
