# OAuth Setup Guide

## 🚀 Đã tích hợp thành công!

Dự án của bạn đã được tích hợp đăng nhập với Google và Facebook OAuth. Dưới đây là hướng dẫn để hoàn tất cấu hình:

## 📋 Các endpoint OAuth đã có sẵn:

### Google OAuth:

- **Bắt đầu đăng nhập**: `GET /api/v1/auth/google`
- **Callback URL**: `GET /api/v1/auth/google/callback`

### Facebook OAuth:

- **Bắt đầu đăng nhập**: `GET /api/v1/auth/facebook`
- **Callback URL**: `GET /api/v1/auth/facebook/callback`

## 🔧 Cấu hình Google OAuth:

### 1. Tạo Google OAuth App:

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Bật Google+ API
4. Tạo OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: MangaHub
   - Authorized redirect URIs: `http://localhost:5000/api/v1/auth/google/callback`

### 2. Cấu hình .env:

```env
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 🔧 Cấu hình Facebook OAuth:

### 1. Tạo Facebook App:

1. Vào [Facebook Developers](https://developers.facebook.com/)
2. Tạo app mới
3. Thêm Facebook Login product
4. Cấu hình Valid OAuth Redirect URIs: `http://localhost:5000/api/v1/auth/facebook/callback`

### 2. Cấu hình .env:

```env
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

## 🖥️ Frontend Integration:

### Google Login Button:

```html
<a href="http://localhost:5000/api/v1/auth/google"> Đăng nhập với Google </a>
```

### Facebook Login Button:

```html
<a href="http://localhost:5000/api/v1/auth/facebook">
  Đăng nhập với Facebook
</a>
```

## 🔄 OAuth Flow:

1. **User clicks login button** → Redirects to `/api/v1/auth/google` or `/api/v1/auth/facebook`
2. **OAuth provider authentication** → User logs in with Google/Facebook
3. **Callback handling** → Returns to your callback URL
4. **User creation/login** → Creates new user or logs in existing user
5. **JWT token generation** → Generates access + refresh tokens
6. **Frontend redirect** → Redirects to frontend with tokens

## 📱 Success Redirect:

Sau khi đăng nhập thành công, user sẽ được redirect về:

```
http://localhost:3000/login/success?token=ACCESS_TOKEN&user=USER_DATA
```

## ❌ Error Redirect:

Nếu có lỗi, user sẽ được redirect về:

```
http://localhost:3000/login?error=ERROR_TYPE
```

Các error types:

- `auth_failed`: Xác thực thất bại
- `user_not_found`: Không tìm thấy user
- `server_error`: Lỗi server

## 🗄️ Database Changes:

User model đã được cập nhật với các field mới:

- `googleId`: Google user ID
- `facebookId`: Facebook user ID
- `avatar`: Profile picture URL
- `provider`: Authentication provider (local/google/facebook)

## 🧪 Testing:

1. Cập nhật các OAuth credentials trong .env
2. Start server: `npm run dev`
3. Truy cập: `http://localhost:5000/api/v1/auth/google`
4. Kiểm tra redirect và token generation

## 🔐 Security Notes:

- Tất cả OAuth tokens được lưu secure cookies
- JWT tokens có thời gian hết hạn
- Refresh tokens được lưu trong database
- Email verification tự động cho OAuth users

## 🎉 Hoàn tất!

Bây giờ bạn có thể:

- ✅ Đăng nhập với Google
- ✅ Đăng nhập với Facebook
- ✅ Tự động tạo user mới
- ✅ JWT token authentication
- ✅ Secure cookie handling
