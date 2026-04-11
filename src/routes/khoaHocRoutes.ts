import { Router } from "express";
import {
  getCourseCategories,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  uploadCourseImage,
  getCourseDetail,
  getCoursesByCategory,
  getCoursesPagination,
  approveEnrollment,
  cancelEnrollment,
} from "../controllers/khoaHocController";
import { authenticateToken, requireRole } from "../middlewares/authMiddleware";
import { upload } from "../config/upload";

const router = Router();

// Lấy dữ liệu (Không cần Token)
router.get("/LayDanhMucKhoaHoc", getCourseCategories);
router.get("/LayDanhSachKhoaHoc", getCourses);
router.get("/LayThongTinKhoaHoc", getCourseDetail);
router.get("/LayKhoaHocTheoDanhMuc", getCoursesByCategory);
router.get("/LayDanhSachKhoaHoc_PhanTrang", getCoursesPagination);

// Thêm, Xóa, Sửa, Upload (Yêu cầu Giáo vụ)
router.post("/ThemKhoaHoc", authenticateToken, requireRole("GV"), createCourse);
router.put(
  "/CapNhatKhoaHoc",
  authenticateToken,
  requireRole("GV"),
  updateCourse,
);
router.delete(
  "/XoaKhoaHoc",
  authenticateToken,
  requireRole("GV"),
  deleteCourse,
);
router.post(
  "/UploadHinhAnhKhoaHoc",
  authenticateToken,
  requireRole("GV"),
  upload.single("file"),
  uploadCourseImage,
);

// Quản lý Ghi danh
router.post("/DangKyKhoaHoc", authenticateToken, enrollCourse); // HV tự đăng ký
router.post(
  "/GhiDanhKhoaHoc",
  authenticateToken,
  requireRole("GV"),
  approveEnrollment,
); // GV ghi danh cho HV
router.post("/HuyGhiDanh", authenticateToken, cancelEnrollment); // HV/GV hủy

export default router;
