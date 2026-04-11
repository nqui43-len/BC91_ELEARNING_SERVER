// src/index.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import multer from "multer";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ==========================================
// [THƯ MỤC: src/types]
// ==========================================

export interface CustomRequest extends Request {
  user?: {
    taiKhoan: string;
    maLoaiNguoiDung: string;
  };
}

// ==========================================
// [THƯ MỤC: src/utils]
// ==========================================

const sendError = (
  res: Response,
  status: number,
  message: string,
  error?: unknown,
): void => {
  const errorMessage = error instanceof Error ? error.message : error;
  res.status(status).json({ message, error: errorMessage });
};

const removeTempFile = (filePath?: string): void => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const checkUserExists = async (taiKhoan: string) => {
  return await prisma.nguoiDung.findUnique({ where: { taiKhoan } });
};

const checkCourseExists = async (maKhoaHoc: string) => {
  return await prisma.khoaHoc.findUnique({ where: { maKhoaHoc } });
};

// ==========================================
// [THƯ MỤC: src/config]
// ==========================================

const setupUploadDirectory = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const uploadDir = path.join(process.cwd(), "public", "img");
setupUploadDirectory(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });
app.use("/public", express.static(path.join(process.cwd(), "public")));

// ==========================================
// [THƯ MỤC: src/middlewares]
// ==========================================

const authenticateToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    sendError(res, 401, "Vui lòng xuất trình thẻ Token hợp lệ!");
    return;
  }

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET || "BI_MAT_ELEARNING",
    ) as CustomRequest["user"];
    next();
  } catch (error) {
    sendError(res, 403, "Thẻ giả hoặc đã hết hạn!", error);
  }
};

const requireRole = (role: string) => {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    if (req.user?.maLoaiNguoiDung !== role) {
      sendError(res, 403, `Chỉ ${role} mới có quyền thực hiện hành động này!`);
      return;
    }
    next();
  };
};

// ==========================================
// [THƯ MỤC: src/controllers]
// ==========================================

const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taiKhoan, matKhau, hoTen, email, soDT } = req.body;

    if (await checkUserExists(taiKhoan)) {
      sendError(res, 400, "Tài khoản này đã có người sử dụng!");
      return;
    }

    const hashedPassword = await bcrypt.hash(matKhau, 10);
    const newUser = await prisma.nguoiDung.create({
      data: {
        taiKhoan,
        matKhau: hashedPassword,
        hoTen,
        email,
        soDT,
        maLoaiNguoiDung: "HV",
      },
    });

    res.status(201).json({ message: "Đăng ký thành công!", content: newUser });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taiKhoan, matKhau } = req.body;

    const user = await checkUserExists(taiKhoan);
    if (!user) {
      sendError(res, 404, "Tài khoản không tồn tại!");
      return;
    }

    const isPasswordValid = await bcrypt.compare(matKhau, user.matKhau);
    if (!isPasswordValid) {
      sendError(res, 400, "Mật khẩu không chính xác!");
      return;
    }

    const payload = {
      taiKhoan: user.taiKhoan,
      maLoaiNguoiDung: user.maLoaiNguoiDung,
    };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "BI_MAT_ELEARNING",
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: "Đăng nhập thành công!",
      content: {
        ...payload,
        hoTen: user.hoTen,
        email: user.email,
        accessToken: token,
      },
    });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

const getCourseCategories = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const categories = await prisma.danhMucKhoaHoc.findMany();
    res.status(200).json({ statusCode: 200, content: categories });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenKhoaHoc = req.query.tenKhoaHoc as string;
    const filterCondition = tenKhoaHoc
      ? { tenKhoaHoc: { contains: tenKhoaHoc, mode: "insensitive" as const } }
      : {};

    const courses = await prisma.khoaHoc.findMany({ where: filterCondition });
    res.status(200).json({ statusCode: 200, content: courses });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

const createCourse = async (
  req: CustomRequest,
  res: Response,
): Promise<void> => {
  try {
    const { maKhoaHoc, tenKhoaHoc, biDanh, moTa, hinhAnh, maDanhMuc } =
      req.body;

    const newCourse = await prisma.khoaHoc.create({
      data: {
        maKhoaHoc,
        tenKhoaHoc,
        biDanh,
        moTa,
        hinhAnh,
        maDanhMuc,
        taiKhoanNguoiTao: req.user!.taiKhoan,
        ngayTao: new Date().toLocaleDateString("en-GB"),
      },
    });

    res
      .status(201)
      .json({
        statusCode: 201,
        message: "Thêm khóa học thành công!",
        content: newCourse,
      });
  } catch (error) {
    sendError(res, 500, "Lỗi khi thêm khóa học", error);
  }
};

const updateCourse = async (
  req: CustomRequest,
  res: Response,
): Promise<void> => {
  try {
    const { maKhoaHoc, tenKhoaHoc, biDanh, moTa, hinhAnh, maDanhMuc } =
      req.body;

    if (!(await checkCourseExists(String(maKhoaHoc)))) {
      sendError(res, 404, "Không tìm thấy khóa học này trên hệ thống!");
      return;
    }

    const updatedCourse = await prisma.khoaHoc.update({
      where: { maKhoaHoc: String(maKhoaHoc) },
      data: { tenKhoaHoc, biDanh, moTa, hinhAnh, maDanhMuc },
    });

    res
      .status(200)
      .json({
        statusCode: 200,
        message: "Cập nhật thành công!",
        content: updatedCourse,
      });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

const deleteCourse = async (
  req: CustomRequest,
  res: Response,
): Promise<void> => {
  try {
    const maKhoaHoc = req.query.maKhoaHoc as string;

    if (!maKhoaHoc) {
      sendError(res, 400, "Vui lòng cung cấp mã khóa học!");
      return;
    }

    if (!(await checkCourseExists(maKhoaHoc))) {
      sendError(res, 404, "Khóa học không tồn tại!");
      return;
    }

    await prisma.khoaHoc.delete({ where: { maKhoaHoc } });
    res
      .status(200)
      .json({ statusCode: 200, message: `Đã xóa khóa học: ${maKhoaHoc}` });
  } catch (error) {
    sendError(res, 500, "Lỗi khi xóa khóa học", error);
  }
};

const enrollCourse = async (
  req: CustomRequest,
  res: Response,
): Promise<void> => {
  try {
    const { maKhoaHoc } = req.body;
    const taiKhoan = req.user!.taiKhoan;

    const existingEnrollment = await prisma.ghiDanh.findUnique({
      where: { taiKhoan_maKhoaHoc: { taiKhoan, maKhoaHoc: String(maKhoaHoc) } },
    });

    if (existingEnrollment) {
      sendError(res, 400, "Bạn đã đăng ký khóa học này rồi!");
      return;
    }

    const newEnrollment = await prisma.ghiDanh.create({
      data: { taiKhoan, maKhoaHoc: String(maKhoaHoc) },
    });

    res
      .status(200)
      .json({ message: "Đăng ký thành công!", content: newEnrollment });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

const uploadCourseImage = async (
  req: CustomRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      sendError(res, 400, "Vui lòng đính kèm một file hình ảnh!");
      return;
    }

    const { maKhoaHoc } = req.body;
    if (!maKhoaHoc) {
      removeTempFile(req.file.path);
      sendError(res, 400, "Vui lòng cung cấp maKhoaHoc!");
      return;
    }

    if (!(await checkCourseExists(String(maKhoaHoc)))) {
      removeTempFile(req.file.path);
      sendError(res, 404, "Khóa học không tồn tại!");
      return;
    }

    const imageUrl = `/public/img/${req.file.filename}`;
    const updatedCourse = await prisma.khoaHoc.update({
      where: { maKhoaHoc: String(maKhoaHoc) },
      data: { hinhAnh: imageUrl },
    });

    res
      .status(200)
      .json({
        statusCode: 200,
        message: "Upload thành công!",
        content: updatedCourse,
      });
  } catch (error) {
    removeTempFile(req.file?.path);
    sendError(res, 500, "Lỗi khi upload", error);
  }
};

// ==========================================
// [THƯ MỤC: src/routes]
// ==========================================

app.post("/api/QuanLyNguoiDung/DangKy", registerUser);
app.post("/api/QuanLyNguoiDung/DangNhap", loginUser);
app.get("/api/QuanLyKhoaHoc/LayDanhMucKhoaHoc", getCourseCategories);
app.get("/api/QuanLyKhoaHoc/LayDanhSachKhoaHoc", getCourses);

app.post(
  "/api/QuanLyKhoaHoc/ThemKhoaHoc",
  authenticateToken,
  requireRole("GV"),
  createCourse,
);
app.put(
  "/api/QuanLyKhoaHoc/CapNhatKhoaHoc",
  authenticateToken,
  requireRole("GV"),
  updateCourse,
);
app.delete(
  "/api/QuanLyKhoaHoc/XoaKhoaHoc",
  authenticateToken,
  requireRole("GV"),
  deleteCourse,
);
app.post("/api/QuanLyKhoaHoc/DangKyKhoaHoc", authenticateToken, enrollCourse);
app.post(
  "/api/QuanLyKhoaHoc/UploadHinhAnhKhoaHoc",
  authenticateToken,
  requireRole("GV"),
  upload.single("file"),
  uploadCourseImage,
);

// ==========================================
// [THƯ MỤC: src/docs]
// ==========================================

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hệ Thống E-Learning API",
      version: "1.0.0",
      description: "Tài liệu API chuẩn Swagger dành cho Team Frontend",
    },
    servers: [
      { url: "http://localhost:8080", description: "Local Development Server" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    paths: {
      "/api/QuanLyNguoiDung/DangNhap": {
        post: {
          summary: "Học viên hoặc Giáo vụ đăng nhập",
          tags: ["QuanLyNguoiDung"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    taiKhoan: { type: "string", example: "admin_gv" },
                    matKhau: { type: "string", example: "123456" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Đăng nhập thành công" } },
        },
      },
      "/api/QuanLyKhoaHoc/LayDanhSachKhoaHoc": {
        get: {
          summary: "Lấy danh sách khóa học",
          tags: ["QuanLyKhoaHoc"],
          parameters: [
            { name: "tenKhoaHoc", in: "query", schema: { type: "string" } },
          ],
          responses: { "200": { description: "Thành công" } },
        },
      },
      "/api/QuanLyKhoaHoc/UploadHinhAnhKhoaHoc": {
        post: {
          summary: "Upload hình ảnh cho khóa học",
          tags: ["QuanLyKhoaHoc"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    file: { type: "string", format: "binary" },
                    maKhoaHoc: { type: "string", example: "NODE01" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Upload thành công" } },
        },
      },
    },
  },
  apis: [],
};

app.use(
  "/swagger",
  swaggerUi.serve,
  swaggerUi.setup(swaggerJsdoc(swaggerOptions)),
);

// ==========================================
// KHỞI ĐỘNG SERVER
// ==========================================

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📚 Swagger Docs: http://localhost:${PORT}/swagger`);
});
