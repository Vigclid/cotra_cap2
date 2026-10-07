# Trạm Sạc Ngữ Văn – Backend API

Express 5 + TypeScript + MongoDB (Mongoose 9) + JWT, phân quyền 3 role: `student`, `teacher`, `admin`.

## Chạy nhanh

```bash
cd backend
npm install
cp .env.example .env          # Windows PowerShell: Copy-Item .env.example .env
# Chưa có MongoDB? Chạy bằng Docker:
docker run -d --name tramsac-mongo -p 27017:27017 mongo:7
npm run seed                  # nạp 10 bài học + 3 tài khoản mẫu
npm run dev                   # http://localhost:5000/api
```

Build production: `npm run build && npm start`.

Tài khoản mẫu: `admin / admin123`, `teacher / teacher123`, `student / student123`.

## Cấu trúc

```
src/
├── server.ts              # Khởi tạo Express, middleware, kết nối DB
├── config/                # env.ts (biến môi trường), db.ts (Mongoose)
├── models/                # User, Lesson, StudentProgress
├── middlewares/           # auth.ts (verifyToken, checkRole), errorHandler.ts
├── controllers/           # auth, lesson, progress, admin
├── routes/                # Gắn middleware phân quyền cho từng nhóm route
├── utils/                 # levels (bảng cấp độ), HttpError, validate
└── scripts/               # seed.ts + lessonsData.ts (10 chặng SGK)
```

## Endpoints

Mọi route (trừ login/health) cần header `Authorization: Bearer <token>`.

| Method | Path | Quyền | Body / Ghi chú |
|---|---|---|---|
| POST | `/api/auth/login` | Công khai | `{ username, password }` → `{ token, user }` |
| GET | `/api/auth/me` | Đã đăng nhập | Thông tin user hiện tại |
| GET | `/api/lessons` | Mọi role | Roadmap (không kèm toàn văn), có cờ `completed` cho học sinh |
| GET | `/api/lessons/:id` | Mọi role | `:id` = `lessonId` (1–10) |
| GET | `/api/progress/me` | student | Bài đã xong, nháp, lịch sử WPM |
| GET | `/api/progress/draft/:lessonId` | student | Các bài nháp của một chặng |
| POST | `/api/progress/draft` | student | `{ lessonId, textIndex?, questionIndex, draftContent }` |
| POST | `/api/progress/exp` | student | `{ amount? (1–50, mặc định 10), lessonId? }` – chặng đã xong thì không cộng lại |
| POST | `/api/progress/wpm` | student | `{ wpm, accuracy?, game? }` |
| GET | `/api/admin/lessons` | teacher, admin | Danh sách đầy đủ |
| POST | `/api/admin/lessons` | teacher, admin | Bỏ trống `lessonId` → tự tăng |
| PUT | `/api/admin/lessons/:id` | teacher, admin | `lessonId` không đổi được |
| DELETE | `/api/admin/lessons/:id` | teacher, admin | Dọn luôn tiến độ liên quan |
| GET | `/api/admin/students` | teacher, admin | `?search=&page=&limit=` |
