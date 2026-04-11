import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { Express } from "express";

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
      schemas: {
        KhoaHocModel: {
          type: "object",
          properties: {
            maKhoaHoc: { type: "string", example: "JAVA01" },
            biDanh: { type: "string", example: "lap-trinh-java" },
            tenKhoaHoc: { type: "string", example: "Lập trình Java" },
            moTa: { type: "string", example: "Mô tả khóa học" },
            luotXem: { type: "integer", format: "int32", example: 0 },
            danhGia: { type: "integer", format: "int32", example: 0 },
            hinhAnh: { type: "string", example: "link-anh.jpg" },
            maNhom: { type: "string", example: "GP01" },
            ngayTao: { type: "string", example: "11/04/2026" },
            maDanhMucKhoaHoc: { type: "string", example: "BE" },
            taiKhoanNguoiTao: { type: "string", example: "admin_gv" },
          },
        },
        ThongTinDangKy: {
          type: "object",
          properties: {
            maKhoaHoc: { type: "string", example: "REACT01" },
            taiKhoan: { type: "string", example: "hocvien_01" },
          },
        },
        "KeyValuePair[String,StringValues]": {
          type: "object",
          properties: {
            key: { type: "string", readOnly: true },
            value: {
              type: "array",
              items: { type: "string" },
              uniqueItems: false,
              readOnly: true,
            },
          },
        },
        ThongTinDangNhap: {
          type: "object",
          properties: {
            taiKhoan: { type: "string", example: "admin_gv" },
            matKhau: { type: "string", example: "123456" },
          },
        },
        NguoiDungVMM: {
          type: "object",
          properties: {
            taiKhoan: { type: "string", example: "hocvien_new" },
            matKhau: { type: "string", example: "123456" },
            hoTen: { type: "string", example: "Nguyễn Văn Mới" },
            soDT: { type: "string", example: "0901234567" },
            maNhom: { type: "string", example: "GP01" },
            email: { type: "string", example: "moi@gmail.com" },
          },
        },
        NguoiDungVM: {
          type: "object",
          properties: {
            taiKhoan: { type: "string", example: "hocvien_new" },
            matKhau: { type: "string", example: "123456" },
            hoTen: { type: "string", example: "Nguyễn Văn Mới" },
            soDT: { type: "string", example: "0901234567" },
            maLoaiNguoiDung: { type: "string", example: "HV" },
            maNhom: { type: "string", example: "GP01" },
            email: { type: "string", example: "moi@gmail.com" },
          },
        },
        TaiKhoanVM: {
          type: "object",
          properties: { taiKhoan: { type: "string", example: "hocvien_01" } },
        },
        MaKhoaHocVM: {
          type: "object",
          properties: { maKhoaHoc: { type: "string", example: "NODE01" } },
        },
      },
    },
    paths: {
      // --- SWAGGER QUẢN LÝ NGƯỜI DÙNG ---
      "/api/QuanLyNguoiDung/DangKy": {
        post: {
          summary: "Học viên tự đăng ký",
          tags: ["QuanLyNguoiDung"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/NguoiDungVMM" },
              },
            },
          },
          responses: { "201": { description: "Thành công" } },
        },
      },
      "/api/QuanLyNguoiDung/DangNhap": {
        post: {
          summary: "Đăng nhập",
          tags: ["QuanLyNguoiDung"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ThongTinDangNhap" },
              },
            },
          },
          responses: { "200": { description: "Thành công" } },
        },
      },
      "/api/QuanLyNguoiDung/LayDanhSachNguoiDung": {
        get: {
          summary: "Lấy danh sách người dùng",
          tags: ["QuanLyNguoiDung"],
          parameters: [
            { name: "tuKhoa", in: "query", schema: { type: "string" } },
          ],
          responses: { "200": { description: "Thành công" } },
        },
      },
      "/api/QuanLyNguoiDung/ThemNguoiDung": {
        post: {
          summary: "Thêm người dùng (Giáo vụ)",
          tags: ["QuanLyNguoiDung"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/NguoiDungVM" },
              },
            },
          },
          responses: { "201": { description: "Thành công" } },
        },
      },
      "/api/QuanLyNguoiDung/CapNhatThongTinNguoiDung": {
        put: {
          summary: "Cập nhật thông tin (Giáo vụ)",
          tags: ["QuanLyNguoiDung"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/NguoiDungVM" },
              },
            },
          },
          responses: { "200": { description: "Thành công" } },
        },
      },
      "/api/QuanLyNguoiDung/XoaNguoiDung": {
        delete: {
          summary: "Xóa người dùng (Giáo vụ)",
          tags: ["QuanLyNguoiDung"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "TaiKhoan",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { "200": { description: "Thành công" } },
        },
      },

      // --- SWAGGER QUẢN LÝ KHÓA HỌC ---
      "/api/QuanLyKhoaHoc/LayDanhMucKhoaHoc": {
        get: {
          summary: "Lấy danh mục",
          tags: ["QuanLyKhoaHoc"],
          responses: { "200": { description: "Thành công" } },
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
      "/api/QuanLyKhoaHoc/ThemKhoaHoc": {
        post: {
          summary: "Thêm khóa học (Giáo vụ)",
          tags: ["QuanLyKhoaHoc"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/KhoaHocModel" },
              },
            },
          },
          responses: { "201": { description: "Thành công" } },
        },
      },
      "/api/QuanLyKhoaHoc/CapNhatKhoaHoc": {
        put: {
          summary: "Cập nhật khóa học (Giáo vụ)",
          tags: ["QuanLyKhoaHoc"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/KhoaHocModel" },
              },
            },
          },
          responses: { "200": { description: "Thành công" } },
        },
      },
      "/api/QuanLyKhoaHoc/XoaKhoaHoc": {
        delete: {
          summary: "Xóa khóa học (Giáo vụ)",
          tags: ["QuanLyKhoaHoc"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "maKhoaHoc",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { "200": { description: "Thành công" } },
        },
      },
      "/api/QuanLyKhoaHoc/DangKyKhoaHoc": {
        post: {
          summary: "Đăng ký khóa học",
          tags: ["QuanLyKhoaHoc"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MaKhoaHocVM" },
              },
            },
          },
          responses: { "200": { description: "Thành công" } },
        },
      },
      "/api/QuanLyKhoaHoc/UploadHinhAnhKhoaHoc": {
        post: {
          summary: "Upload hình ảnh (Giáo vụ)",
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
                    maKhoaHoc: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Thành công" } },
        },
      },
    },
  },
  apis: [],
};

export const setupSwagger = (app: Express): void => {
  const swaggerSpecs = swaggerJsdoc(swaggerOptions);
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
};
