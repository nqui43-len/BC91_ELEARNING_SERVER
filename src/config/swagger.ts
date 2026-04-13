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
    servers:
      process.env.NODE_ENV === "production"
        ? [
            {
              url: "https://elearning-api-bc91.onrender.com",
              description: "Production Server",
            },
          ]
        : [
            {
              url: "http://localhost:8080",
              description: "Local Development Server",
            },
            {
              url: "https://elearning-api-bc91.onrender.com",
              description: "Production Server",
            },
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
      // ===================================
      // QUẢN LÝ KHÓA HỌC
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
      "/api/QuanLyKhoaHoc/LayDanhMucKhoaHoc": {
        get: {
          summary: "Lấy danh mục",
          tags: ["QuanLyKhoaHoc"],
          responses: { "200": { description: "Thành công" } },
        },
      },
      "/api/QuanLyKhoaHoc/LayKhoaHocTheoDanhMuc": {
        get: {
          summary: "Lấy khóa học theo danh mục",
          tags: ["QuanLyKhoaHoc"],
          parameters: [
            {
              name: "maDanhMuc",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { "200": { description: "Thành công" } },
        },
      },
      "/api/QuanLyKhoaHoc/LayDanhSachKhoaHoc_PhanTrang": {
        get: {
          summary: "Lấy danh sách khóa học phân trang",
          tags: ["QuanLyKhoaHoc"],
          parameters: [
            { name: "tenKhoaHoc", in: "query", schema: { type: "string" } },
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
            },
            {
              name: "pageSize",
              in: "query",
              schema: { type: "integer", default: 10 },
            },
          ],
          responses: { "200": { description: "Thành công" } },
        },
      },
      "/api/QuanLyKhoaHoc/LayThongTinKhoaHoc": {
        get: {
          summary: "Lấy thông tin chi tiết khóa học",
          tags: ["QuanLyKhoaHoc"],
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
      "/api/QuanLyKhoaHoc/LayThongTinHocVienKhoaHoc": {
        get: {
          summary: "Lấy thông tin học viên khóa học",
          tags: ["QuanLyKhoaHoc"],
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
      "/api/QuanLyKhoaHoc/GhiDanhKhoaHoc": {
        post: {
          summary: "Giáo vụ ghi danh khóa học cho Học viên",
          tags: ["QuanLyKhoaHoc"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ThongTinDangKy" },
              },
            },
          },
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
      "/api/QuanLyKhoaHoc/HuyGhiDanh": {
        post: {
          summary: "Hủy ghi danh khóa học",
          tags: ["QuanLyKhoaHoc"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ThongTinDangKy" },
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
      "/api/QuanLyKhoaHoc/demo": {
        put: {
          summary: "Demo",
          tags: ["QuanLyKhoaHoc"],
          responses: { "200": { description: "Thành công" } },
        },
      },
      "/api/QuanLyKhoaHoc/CapNhatKhoaHocUpload": {
        post: {
          summary: "Cập nhật khóa học + Upload",
          tags: ["QuanLyKhoaHoc"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    maKhoaHoc: { type: "string" },
                    tenKhoaHoc: { type: "string" },
                    biDanh: { type: "string" },
                    moTa: { type: "string" },
                    maDanhMuc: { type: "string" },
                    hinhAnh: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Thành công" } },
        },
      },
      "/api/QuanLyKhoaHoc/ThemKhoaHocUploadHinh": {
        post: {
          summary: "Thêm khóa học + Upload",
          tags: ["QuanLyKhoaHoc"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    maKhoaHoc: { type: "string" },
                    tenKhoaHoc: { type: "string" },
                    biDanh: { type: "string" },
                    moTa: { type: "string" },
                    maDanhMuc: { type: "string" },
                    hinhAnh: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: { "201": { description: "Thành công" } },
        },
      },
      "/api/QuanLyKhoaHoc": {
        post: {
          summary: "Thêm khóa học (Alternative)",
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
      // --- SWAGGER QUẢN LÝ NGƯỜI DÙNG ---
      "/api/QuanLyNguoiDung/LayDanhSachLoaiNguoiDung": {
        get: {
          summary: "Lấy danh sách loại người dùng",
          tags: ["QuanLyNguoiDung"],
          responses: { "200": { description: "Thành công" } },
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
      "/api/QuanLyNguoiDung/ThongTinNguoiDung": {
        post: {
          summary: "Lấy thông tin của một người dùng bất kỳ",
          tags: ["QuanLyNguoiDung"],
          parameters: [
            { name: "taiKhoan", in: "query", schema: { type: "string" } },
          ],
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
      "/api/QuanLyNguoiDung/LayDanhSachNguoiDung_PhanTrang": {
        get: {
          summary: "Lấy danh sách người dùng phân trang",
          tags: ["QuanLyNguoiDung"],
          parameters: [
            {
              name: "tuKhoa",
              in: "query",
              schema: { type: "string" },
              description: "Tìm kiếm theo họ tên",
            },
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
              description: "Số trang",
            },
            {
              name: "pageSize",
              in: "query",
              schema: { type: "integer", default: 10 },
              description: "Số phần tử trên trang",
            },
          ],
          responses: { "200": { description: "Thành công" } },
        },
      },
      "/api/QuanLyNguoiDung/TimKiemNguoiDung": {
        get: {
          summary: "Tìm kiếm người dùng",
          tags: ["QuanLyNguoiDung"],
          parameters: [
            {
              name: "tuKhoa",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { "200": { description: "Thành công" } },
        },
      },
      "/api/QuanLyNguoiDung/ThongTinTaiKhoan": {
        post: {
          summary: "Lấy thông tin tài khoản (Yêu cầu đăng nhập)",
          tags: ["QuanLyNguoiDung"],
          security: [{ bearerAuth: [] }],
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
      "/api/QuanLyNguoiDung/LayDanhSachKhoaHocChuaGhiDanh": {
        post: {
          summary: "Lấy danh sách khóa học người dùng chưa ghi danh",
          tags: ["QuanLyNguoiDung"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { taiKhoan: { type: "string" } },
                },
              },
            },
          },
          responses: { "200": { description: "Thành công" } },
        },
      },
      "/api/QuanLyNguoiDung/LayDanhSachKhoaHocChoXetDuyet": {
        post: {
          summary: "Lấy danh sách khóa học chờ xét duyệt",
          tags: ["QuanLyNguoiDung"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { taiKhoan: { type: "string" } },
                },
              },
            },
          },
          responses: { "200": { description: "Thành công" } },
        },
      },
      "/api/QuanLyNguoiDung/LayDanhSachKhoaHocDaXetDuyet": {
        post: {
          summary: "Lấy danh sách khóa học đã xét duyệt",
          tags: ["QuanLyNguoiDung"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { taiKhoan: { type: "string" } },
                },
              },
            },
          },
          responses: { "200": { description: "Thành công" } },
        },
      },
      "/api/QuanLyNguoiDung/LayDanhSachNguoiDungChuaGhiDanh": {
        post: {
          summary: "Lấy danh sách người dùng chưa ghi danh khóa học",
          tags: ["QuanLyNguoiDung"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { maKhoaHoc: { type: "string" } },
                },
              },
            },
          },
          responses: { "200": { description: "Thành công" } },
        },
      },
      "/api/QuanLyNguoiDung/LayDanhSachHocVienChoXetDuyet": {
        post: {
          summary: "Lấy danh sách học viên chờ xét duyệt",
          tags: ["QuanLyNguoiDung"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { maKhoaHoc: { type: "string" } },
                },
              },
            },
          },
          responses: { "200": { description: "Thành công" } },
        },
      },
      "/api/QuanLyNguoiDung/LayDanhSachHocVienKhoaHoc": {
        post: {
          summary: "Lấy danh sách học viên đã tham gia khóa học",
          tags: ["QuanLyNguoiDung"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { maKhoaHoc: { type: "string" } },
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
