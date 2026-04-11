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
  getCourseStudentsInfo,
  demoApi,
  addCourseUploadImage,
  updateCourseUpload,
  genericPostCourse, // Import 5 hàm mới
} from "../controllers/khoaHocController";
import { authenticateToken, requireRole } from "../middlewares/authMiddleware";
import { upload } from "../config/upload";

const router = Router();

// API Lấy dữ liệu
router.get("/LayDanhSachKhoaHoc", getCourses);
router.get("/LayDanhMucKhoaHoc", getCourseCategories);
router.get("/LayKhoaHocTheoDanhMuc", getCoursesByCategory);
router.get("/LayDanhSachKhoaHoc_PhanTrang", getCoursesPagination);
router.get("/LayThongTinKhoaHoc", getCourseDetail);
router.get("/LayThongTinHocVienKhoaHoc", getCourseStudentsInfo); // Mới

// API Xử lý dữ liệu
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
  "/GhiDanhKhoaHoc",
  authenticateToken,
  requireRole("GV"),
  approveEnrollment,
);
router.post("/DangKyKhoaHoc", authenticateToken, enrollCourse);
router.post("/HuyGhiDanh", authenticateToken, cancelEnrollment);
router.post(
  "/UploadHinhAnhKhoaHoc",
  authenticateToken,
  requireRole("GV"),
  upload.single("file"),
  uploadCourseImage,
);

// 4 API Mới
router.put("/demo", demoApi);
router.post(
  "/CapNhatKhoaHocUpload",
  authenticateToken,
  requireRole("GV"),
  upload.single("hinhAnh"),
  updateCourseUpload,
);
router.post(
  "/ThemKhoaHocUploadHinh",
  authenticateToken,
  requireRole("GV"),
  upload.single("hinhAnh"),
  addCourseUploadImage,
);
router.post("/", authenticateToken, requireRole("GV"), genericPostCourse);

export default router;
