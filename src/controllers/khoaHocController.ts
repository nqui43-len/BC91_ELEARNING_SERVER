import { Request, Response } from "express";
import prisma from "../config/prisma";
import { CustomRequest } from "../types/custom";
import { sendError } from "../utils/response";
import { removeTempFile } from "../utils/file";

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

// [MỚI] 1. Lấy thông tin chi tiết 1 khóa học
export const getCourseDetail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const maKhoaHoc = req.query.maKhoaHoc as string;
    if (!maKhoaHoc) {
      sendError(res, 400, "Vui lòng cung cấp mã khóa học!");
      return;
    }

    const course = await checkCourseExists(maKhoaHoc);
    if (!course) {
      sendError(res, 404, "Khóa học không tồn tại!");
      return;
    }

    res.status(200).json({ statusCode: 200, content: course });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

// [MỚI] 2. Lấy khóa học theo danh mục
export const getCoursesByCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const maDanhMuc = req.query.maDanhMuc as string;
    if (!maDanhMuc) {
      sendError(res, 400, "Vui lòng cung cấp mã danh mục!");
      return;
    }

    const courses = await prisma.khoaHoc.findMany({ where: { maDanhMuc } });
    res.status(200).json({ statusCode: 200, content: courses });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

// [MỚI] 3. Phân trang khóa học
export const getCoursesPagination = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const tenKhoaHoc = req.query.tenKhoaHoc as string;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const filter = tenKhoaHoc
      ? { tenKhoaHoc: { contains: tenKhoaHoc, mode: "insensitive" as const } }
      : {};

    const [totalRow, data] = await Promise.all([
      prisma.khoaHoc.count({ where: filter }),
      prisma.khoaHoc.findMany({ where: filter, skip, take: pageSize }),
    ]);

    const totalPages = Math.ceil(totalRow / pageSize);

    res.status(200).json({
      statusCode: 200,
      content: {
        currentPage: page,
        count: pageSize,
        totalPages,
        totalCount: totalRow,
        items: data,
      },
    });
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
    res.status(201).json({
      statusCode: 201,
      message: "Thêm thành công!",
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
      sendError(res, 404, "Không tìm thấy khóa học!");
      return;
    }
    const updatedCourse = await prisma.khoaHoc.update({
      where: { maKhoaHoc: String(maKhoaHoc) },
      data: { tenKhoaHoc, biDanh, moTa, hinhAnh, maDanhMuc },
    });
    res.status(200).json({
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

// [MỚI] 4. Ghi danh (Giáo vụ ghi danh cho 1 học viên bất kỳ)
export const approveEnrollment = async (
  req: CustomRequest,
  res: Response,
): Promise<void> => {
  try {
    const { maKhoaHoc, taiKhoan } = req.body;
    if (!maKhoaHoc || !taiKhoan) {
      sendError(res, 400, "Thiếu mã khóa học hoặc tài khoản!");
      return;
    }

    const existingEnrollment = await prisma.ghiDanh.findUnique({
      where: { taiKhoan_maKhoaHoc: { taiKhoan, maKhoaHoc: String(maKhoaHoc) } },
    });

    if (existingEnrollment) {
      sendError(res, 400, "Học viên này đã được ghi danh vào khóa học!");
      return;
    }

    const newEnrollment = await prisma.ghiDanh.create({
      data: { taiKhoan, maKhoaHoc: String(maKhoaHoc) },
    });
    res.status(200).json({
      statusCode: 200,
      message: "Ghi danh thành công!",
      content: newEnrollment,
    });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

// [MỚI] 5. Hủy Ghi Danh
export const cancelEnrollment = async (
  req: CustomRequest,
  res: Response,
): Promise<void> => {
  try {
    const { maKhoaHoc, taiKhoan } = req.body;
    // HV chỉ được tự hủy của mình. GV được quyền hủy của người khác
    const targetAccount =
      req.user!.maLoaiNguoiDung === "GV" ? taiKhoan : req.user!.taiKhoan;

    if (!maKhoaHoc || !targetAccount) {
      sendError(res, 400, "Thiếu mã khóa học hoặc tài khoản!");
      return;
    }

    const existingEnrollment = await prisma.ghiDanh.findUnique({
      where: {
        taiKhoan_maKhoaHoc: {
          taiKhoan: targetAccount,
          maKhoaHoc: String(maKhoaHoc),
        },
      },
    });

    if (!existingEnrollment) {
      sendError(res, 404, "Không tìm thấy thông tin ghi danh để hủy!");
      return;
    }

    await prisma.ghiDanh.delete({
      where: {
        taiKhoan_maKhoaHoc: {
          taiKhoan: targetAccount,
          maKhoaHoc: String(maKhoaHoc),
        },
      },
    });
    res
      .status(200)
      .json({ statusCode: 200, message: "Hủy ghi danh thành công!" });
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
    res.status(200).json({
      statusCode: 200,
      message: "Upload thành công!",
      content: updatedCourse,
    });
  } catch (error) {
    removeTempFile(req.file?.path);
    sendError(res, 500, "Lỗi khi upload", error);
  }
};
// [MỚI] Lấy thông tin học viên của khóa học
export const getCourseStudentsInfo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const maKhoaHoc = req.query.maKhoaHoc as string;
    if (!maKhoaHoc) {
      sendError(res, 400, "Vui lòng cung cấp mã khóa học!");
      return;
    }

    // Lấy chi tiết khóa học kèm danh sách Ghi danh -> móc sang bảng Người Dùng
    const courseInfo = await prisma.khoaHoc.findUnique({
      where: { maKhoaHoc },
      include: { ghiDanh: { include: { nguoiDung: true } } },
    });

    res.status(200).json({ statusCode: 200, content: courseInfo });
  } catch (error) {
    sendError(res, 500, "Lỗi Server", error);
  }
};

// [MỚI] API Demo (Trả về kết quả ảo)
export const demoApi = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ statusCode: 200, content: "Demo API Success" });
};

// [MỚI] Thêm khóa học + Upload Hình Ảnh cùng lúc (Dùng Form-data)
export const addCourseUploadImage = async (
  req: CustomRequest,
  res: Response,
): Promise<void> => {
  try {
    const { maKhoaHoc, tenKhoaHoc, biDanh, moTa, maDanhMuc } = req.body;
    if (!req.file) {
      sendError(res, 400, "Vui lòng đính kèm hình ảnh!");
      return;
    }

    const imageUrl = `/public/img/${req.file.filename}`;
    const newCourse = await prisma.khoaHoc.create({
      data: {
        maKhoaHoc,
        tenKhoaHoc,
        biDanh,
        moTa,
        maDanhMuc,
        hinhAnh: imageUrl,
        taiKhoanNguoiTao: req.user!.taiKhoan,
        ngayTao: new Date().toLocaleDateString("en-GB"),
      },
    });
    res
      .status(201)
      .json({
        statusCode: 201,
        message: "Thêm thành công!",
        content: newCourse,
      });
  } catch (error) {
    removeTempFile(req.file?.path);
    sendError(res, 500, "Lỗi Server", error);
  }
};

// [MỚI] Cập nhật khóa học + Upload Hình Ảnh cùng lúc
export const updateCourseUpload = async (
  req: CustomRequest,
  res: Response,
): Promise<void> => {
  try {
    const { maKhoaHoc, tenKhoaHoc, biDanh, moTa, maDanhMuc } = req.body;
    if (!(await checkCourseExists(String(maKhoaHoc)))) {
      removeTempFile(req.file?.path);
      sendError(res, 404, "Không tìm thấy khóa học!");
      return;
    }

    // Xây dựng cục data cần update
    const updateData: any = { tenKhoaHoc, biDanh, moTa, maDanhMuc };
    if (req.file) {
      // Nếu có đẩy file mới lên thì mới cập nhật đường dẫn hình
      updateData.hinhAnh = `/public/img/${req.file.filename}`;
    }

    const updatedCourse = await prisma.khoaHoc.update({
      where: { maKhoaHoc: String(maKhoaHoc) },
      data: updateData,
    });
    res
      .status(200)
      .json({
        statusCode: 200,
        message: "Cập nhật thành công!",
        content: updatedCourse,
      });
  } catch (error) {
    removeTempFile(req.file?.path);
    sendError(res, 500, "Lỗi Server", error);
  }
};

// [MỚI] Post Generic (Thêm khóa học rút gọn)
export const genericPostCourse = async (
  req: CustomRequest,
  res: Response,
): Promise<void> => {
  res.status(200).json({ statusCode: 200, message: "Generic POST OK" });
};
