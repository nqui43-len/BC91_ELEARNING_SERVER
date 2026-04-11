// src/index.ts
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import path from "path";

// Trình điều hướng (Routers)
import nguoiDungRoutes from "./routes/nguoiDungRoutes";
import khoaHocRoutes from "./routes/khoaHocRoutes";

// Cấu hình (Configs)
import { setupSwagger } from "./config/swagger";

dotenv.config();

const app = express();

// Middlewares toàn cục
app.use(cors());
app.use(express.json());
app.use("/public", express.static(path.join(process.cwd(), "public")));

// Đăng ký API Routes
app.use("/api/QuanLyNguoiDung", nguoiDungRoutes);
app.use("/api/QuanLyKhoaHoc", khoaHocRoutes);

// Khởi tạo tài liệu Swagger
setupSwagger(app);

// Lắng nghe máy chủ
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📚 Swagger Docs: http://localhost:${PORT}/swagger`);
});
