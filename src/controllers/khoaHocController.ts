import { Request, Response } from "express";
import prisma from "../config/prisma";
import { CustomRequest } from "../types/custom";
import { sendError } from "../utils/response";
import { removeTempFile } from "../utils/file";

// Hàm kiểm tra khóa học tồn tại
const checkCourseExists = async (maKhoaHoc: string) => {
  return await prisma.khoaHoc.findUnique({ where: { maKhoaHoc } });
};

export const getCourseCategories = async (
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

export const getCourses = async (
  req: Request,
  res: Response,
): Promise<void> => {
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

export const createCourse = async (
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

export const updateCourse = async (
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

export const deleteCourse = async (
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

export const enrollCourse = async (
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

export const uploadCourseImage = async (
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
