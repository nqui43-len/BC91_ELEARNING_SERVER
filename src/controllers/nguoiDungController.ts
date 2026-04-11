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
    res
      .status(200)
      .json({
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
    res
      .status(200)
      .json({
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
