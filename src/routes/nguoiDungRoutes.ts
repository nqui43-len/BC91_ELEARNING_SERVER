import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUsers,
  addUser,
  updateUser,
  deleteUser,
} from "../controllers/nguoiDungController";
import { authenticateToken, requireRole } from "../middlewares/authMiddleware";

const router = Router();

router.post("/DangKy", registerUser);
router.post("/DangNhap", loginUser);
router.get("/LayDanhSachNguoiDung", getUsers);
router.post("/ThemNguoiDung", authenticateToken, requireRole("GV"), addUser);
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

export default router;
