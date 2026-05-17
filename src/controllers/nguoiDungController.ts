// src/controllers/nguoiDungController.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { CustomRequest } from "../types/custom";
import { sendError } from "../utils/response";

const checkUserExists = async (taiKhoan: string) => {
  return await prisma.nguoiDung.findUnique({ where: { taiKhoan } });
};

export const registerUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { taiKhoan, matKhau, hoTen, email, soDT } = req.body;
    if (await checkUserExists(taiKhoan)) {
      sendError(res, 400, "Tài khoản đã tồn tại!");
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

export const loginUser = async (req: Request, res: Response): Promise<void> => {
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

// Lấy thông tin tài khoản (Dùng Token)
export const getAccountInfo = async (
  req: CustomRequest,
  res: Response,
): Promise<void> => {
  try {
    const taiKhoan = req.user!.taiKhoan;

    // 1. Kéo dữ liệu từ DB (Phải join sâu 2 tầng: NguoiDung -> GhiDanh -> KhoaHoc)
    const userInfo = await prisma.nguoiDung.findUnique({
      where: { taiKhoan },
      include: {
        ghiDanh: {
          include: {
            khoaHoc: true, // Kéo theo thông tin chi tiết của khóa học từ bảng KhoaHoc
          },
        },
      },
    });

    if (!userInfo) {
      sendError(res, 404, "Không tìm thấy thông tin tài khoản!");
      return;
    }

    // 2. Tách dữ liệu: Bỏ mật khẩu cho an toàn, bóc tách mảng ghiDanh ra riêng
    const { matKhau, ghiDanh, ...safeUserInfo } = userInfo;

    // 3. "Biến hình" dữ liệu: Map cái mảng ghiDanh của Prisma thành mảng chứa nguyên cục KhoaHoc
    const chiTietKhoaHocGhiDanh = ghiDanh.map((item) => item.khoaHoc);

    // 4. Trả về đúng cấu trúc mà Frontend đang chờ đợi
    res.status(200).json({
      statusCode: 200,
      content: {
        ...safeUserInfo,
        chiTietKhoaHocGhiDanh, // Ghép đúng cái tên key này vào
      },
    });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

// [MỚI] 2. Lấy danh sách loại người dùng (Trả về cứng để FrontEnd làm Menu)
export const getUserTypes = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userTypes = [
      { maLoaiNguoiDung: "HV", tenLoaiNguoiDung: "Học viên" },
      { maLoaiNguoiDung: "GV", tenLoaiNguoiDung: "Giáo vụ" },
    ];
    res.status(200).json({ statusCode: 200, content: userTypes });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const tuKhoa = req.query.tuKhoa as string;
    const filter = tuKhoa
      ? { hoTen: { contains: tuKhoa, mode: "insensitive" as const } }
      : {};
    const users = await prisma.nguoiDung.findMany({ where: filter });
    res.status(200).json({ statusCode: 200, content: users });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

// [MỚI] 3. Phân trang người dùng (Có hỗ trợ tìm kiếm)
export const getUsersPagination = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const tuKhoa = req.query.tuKhoa as string;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const filter = tuKhoa
      ? { hoTen: { contains: tuKhoa, mode: "insensitive" as const } }
      : {};

    // Chạy song song 2 lệnh: Đếm tổng số lượng và Lấy dữ liệu của 1 trang
    const [totalRow, data] = await Promise.all([
      prisma.nguoiDung.count({ where: filter }),
      prisma.nguoiDung.findMany({ where: filter, skip, take: pageSize }),
    ]);

    const totalPages = Math.ceil(totalRow / pageSize);

    res.status(200).json({
      statusCode: 200,
      content: {
        currentPage: page,
        count: pageSize,
        totalPages: totalPages,
        totalCount: totalRow,
        items: data,
      },
    });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

export const addUser = async (
  req: CustomRequest,
  res: Response,
): Promise<void> => {
  try {
    const { taiKhoan, matKhau, hoTen, email, soDT, maLoaiNguoiDung } = req.body;
    if (await checkUserExists(taiKhoan)) {
      sendError(res, 400, "Tài khoản đã tồn tại!");
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
        maLoaiNguoiDung: maLoaiNguoiDung || "HV",
      },
    });
    res
      .status(201)
      .json({ statusCode: 201, message: "Thêm thành công!", content: newUser });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

export const updateUser = async (
  req: CustomRequest,
  res: Response,
): Promise<void> => {
  try {
    const { taiKhoan, matKhau, hoTen, email, soDT, maLoaiNguoiDung } = req.body;
    if (!(await checkUserExists(taiKhoan))) {
      sendError(res, 404, "Không tìm thấy người dùng!");
      return;
    }

    const hashedPassword = await bcrypt.hash(matKhau, 10);
    const updatedUser = await prisma.nguoiDung.update({
      where: { taiKhoan },
      data: { matKhau: hashedPassword, hoTen, email, soDT, maLoaiNguoiDung },
    });
    res.status(200).json({
      statusCode: 200,
      message: "Cập nhật thành công!",
      content: updatedUser,
    });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

export const deleteUser = async (
  req: CustomRequest,
  res: Response,
): Promise<void> => {
  try {
    const taiKhoan = req.query.TaiKhoan as string;
    if (!taiKhoan) {
      sendError(res, 400, "Vui lòng cung cấp tài khoản!");
      return;
    }
    if (!(await checkUserExists(taiKhoan))) {
      sendError(res, 404, "Tài khoản không tồn tại!");
      return;
    }

    await prisma.nguoiDung.delete({ where: { taiKhoan } });
    res
      .status(200)
      .json({ statusCode: 200, message: `Đã xóa tài khoản: ${taiKhoan}` });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

// ==========================================
// [MỚI] QUẢN LÝ GHI DANH TỪ PHÍA NGƯỜI DÙNG (YÊU CẦU QUYỀN GIÁO VỤ)
// ==========================================

// 1. Danh sách khóa học chưa ghi danh
export const getUnenrolledCourses = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const taiKhoan = req.body.taiKhoan || (req.query.taiKhoan as string);
    if (!taiKhoan) {
      sendError(res, 400, "Vui lòng cung cấp tài khoản!");
      return;
    }

    // Lấy các mã khóa học mà người này đã ghi danh
    const enrolled = await prisma.ghiDanh.findMany({
      where: { taiKhoan },
      select: { maKhoaHoc: true },
    });
    const enrolledIds = enrolled.map((e) => e.maKhoaHoc);

    // Tìm các khóa học KHÔNG NẰM TRONG danh sách đã ghi danh
    const courses = await prisma.khoaHoc.findMany({
      where: { maKhoaHoc: { notIn: enrolledIds } },
    });
    res.status(200).json({ statusCode: 200, content: courses });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

// 2. Danh sách khóa học đã xét duyệt
export const getApprovedCourses = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const taiKhoan = req.body.taiKhoan || (req.query.taiKhoan as string);
    if (!taiKhoan) {
      sendError(res, 400, "Vui lòng cung cấp tài khoản!");
      return;
    }

    const enrolled = await prisma.ghiDanh.findMany({
      where: { taiKhoan },
      include: { khoaHoc: true }, // Kéo theo thông tin chi tiết khóa học
    });

    // Chỉ bóc lấy phần thông tin khóa học trả về cho đẹp
    const courses = enrolled.map((e) => e.khoaHoc);
    res.status(200).json({ statusCode: 200, content: courses });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

// 3. Danh sách khóa học chờ xét duyệt (Mặc định trả mảng rỗng vì hệ thống duyệt tự động)
export const getPendingCourses = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  res.status(200).json({ statusCode: 200, content: [] });
};

// 4. Danh sách học viên chưa ghi danh khóa học X
export const getUnenrolledUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const maKhoaHoc = req.body.maKhoaHoc || (req.query.maKhoaHoc as string);
    if (!maKhoaHoc) {
      sendError(res, 400, "Vui lòng cung cấp mã khóa học!");
      return;
    }

    const enrolled = await prisma.ghiDanh.findMany({
      where: { maKhoaHoc },
      select: { taiKhoan: true },
    });
    const enrolledUsers = enrolled.map((e) => e.taiKhoan);

    const users = await prisma.nguoiDung.findMany({
      where: { taiKhoan: { notIn: enrolledUsers }, maLoaiNguoiDung: "HV" }, // Chỉ lấy Học viên
    });
    res.status(200).json({ statusCode: 200, content: users });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

// 5. Danh sách học viên khóa học (Đã duyệt)
export const getCourseStudents = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const maKhoaHoc = req.body.maKhoaHoc || (req.query.maKhoaHoc as string);
    if (!maKhoaHoc) {
      sendError(res, 400, "Vui lòng cung cấp mã khóa học!");
      return;
    }

    const enrolled = await prisma.ghiDanh.findMany({
      where: { maKhoaHoc },
      include: { nguoiDung: true },
    });

    const users = enrolled.map((e) => e.nguoiDung);
    res.status(200).json({ statusCode: 200, content: users });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

// 6. Danh sách học viên chờ xét duyệt (Mặc định trả mảng rỗng)
export const getPendingStudents = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  res.status(200).json({ statusCode: 200, content: [] });
};

// [MỚI] Lấy thông tin của 1 người dùng bất kỳ (Cybersoft dùng POST)
export const getUserInfo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Ưu tiên lấy từ query URL (?taiKhoan=...), nếu không có thì lấy từ body JSON
    const taiKhoan = (req.query.taiKhoan as string) || req.body.taiKhoan;
    if (!taiKhoan) {
      sendError(res, 400, "Vui lòng cung cấp tài khoản cần xem!");
      return;
    }

    const user = await prisma.nguoiDung.findUnique({
      where: { taiKhoan },
      include: { ghiDanh: true }, // Kéo theo các khóa học người này đã tham gia
    });

    if (!user) {
      sendError(res, 404, "Không tìm thấy người dùng này!");
      return;
    }

    // Giấu mật khẩu trước khi trả về
    const { matKhau, ...safeUserInfo } = user;
    res.status(200).json({ statusCode: 200, content: safeUserInfo });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

// [MỚI] Tìm kiếm người dùng (Cybersoft tách riêng một API GET)
export const searchUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const tuKhoa = req.query.tuKhoa as string;
    if (!tuKhoa) {
      sendError(res, 400, "Vui lòng nhập từ khóa tìm kiếm (tuKhoa)!");
      return;
    }

    const users = await prisma.nguoiDung.findMany({
      where: { hoTen: { contains: tuKhoa, mode: "insensitive" as const } },
    });

    res.status(200).json({ statusCode: 200, content: users });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};
