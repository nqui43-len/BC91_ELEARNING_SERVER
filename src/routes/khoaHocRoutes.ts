import { Router } from "express";
import {
  getCourseCategories,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  uploadCourseImage,
} from "../controllers/khoaHocController";
import { authenticateToken, requireRole } from "../middlewares/authMiddleware";
import { upload } from "../config/upload";

const router = Router();

router.get("/LayDanhMucKhoaHoc", getCourseCategories);
router.get("/LayDanhSachKhoaHoc", getCourses);
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
router.post("/DangKyKhoaHoc", authenticateToken, enrollCourse);
router.post(
  "/UploadHinhAnhKhoaHoc",
  authenticateToken,
  requireRole("GV"),
  upload.single("file"),
  uploadCourseImage,
);

export default router;
