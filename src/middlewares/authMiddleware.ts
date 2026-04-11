import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomRequest } from "../types/custom";
import { sendError } from "../utils/response";

export const authenticateToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    sendError(res, 401, "Vui lòng xuất trình thẻ Token hợp lệ!");
    return;
  }

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET || "BI_MAT_ELEARNING",
    ) as CustomRequest["user"];
    next();
  } catch (error) {
    sendError(res, 403, "Thẻ giả hoặc đã hết hạn!", error);
  }
};

export const requireRole = (role: string) => {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    if (req.user?.maLoaiNguoiDung !== role) {
      sendError(res, 403, `Chỉ ${role} mới có quyền thực hiện hành động này!`);
      return;
    }
    next();
  };
};
