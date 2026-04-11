import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  getAccountInfo,
  getUserTypes,
  getUsersPagination,
  getUnenrolledCourses,
  getApprovedCourses,
  getPendingCourses,
  getUnenrolledUsers,
  getCourseStudents,
  getPendingStudents,
  getUserInfo,
  searchUsers
} from "../controllers/nguoiDungController";
import { authenticateToken, requireRole } from "../middlewares/authMiddleware";

const router = Router();

// Các API cũ...
router.post("/DangKy", registerUser);
router.post("/DangNhap", loginUser);
router.get("/LayDanhSachLoaiNguoiDung", getUserTypes);
router.get("/LayDanhSachNguoiDung", getUsers);
router.get("/LayDanhSachNguoiDung_PhanTrang", getUsersPagination);
router.post("/ThongTinTaiKhoan", authenticateToken, getAccountInfo);
router.post("/ThemNguoiDung", authenticateToken, requireRole("GV"), addUser);
// Bổ sung 2 API còn thiếu để giống hệt Cybersoft
router.post("/ThongTinNguoiDung", getUserInfo); 
router.get("/TimKiemNguoiDung", searchUsers);
router.put(
  "/CapNhatThongTinNguoiDung",
  authenticateToken,
  requireRole("GV"),
  updateUser,
);
router.delete(
  "/XoaNguoiDung",
  authenticateToken,
  requireRole("GV"),
  deleteUser,
);

// [MỚI] Cụm API Danh sách Khóa Học của Học Viên (Cybersoft dùng POST)
router.post(
  "/LayDanhSachKhoaHocChuaGhiDanh",
  authenticateToken,
  requireRole("GV"),
  getUnenrolledCourses,
);
router.post(
  "/LayDanhSachKhoaHocChoXetDuyet",
  authenticateToken,
  requireRole("GV"),
  getPendingCourses,
);
router.post(
  "/LayDanhSachKhoaHocDaXetDuyet",
  authenticateToken,
  requireRole("GV"),
  getApprovedCourses,
);

// [MỚI] Cụm API Danh sách Học Viên của Khóa Học
router.post(
  "/LayDanhSachNguoiDungChuaGhiDanh",
  authenticateToken,
  requireRole("GV"),
  getUnenrolledUsers,
);
router.post(
  "/LayDanhSachHocVienChoXetDuyet",
  authenticateToken,
  requireRole("GV"),
  getPendingStudents,
);
router.post(
  "/LayDanhSachHocVienKhoaHoc",
  authenticateToken,
  requireRole("GV"),
  getCourseStudents,
);

export default router;
