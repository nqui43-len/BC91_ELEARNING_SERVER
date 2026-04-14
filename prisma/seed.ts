/// <reference types="node" />
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("BẮT ĐẦU QUÁ TRÌNH GIEO MẦM DỮ LIỆU ĐỘNG... 🌱");
  const dataDir = path.join(__dirname, "data");

  if (!fs.existsSync(dataDir)) {
    console.log(
      "❌ Không tìm thấy thư mục prisma/data. Vui lòng tạo thư mục và bỏ file JSON vào!",
    );
    return;
  }

  const files = fs
    .readdirSync(dataDir)
    .filter((file: string) => file.endsWith(".json"));

  if (files.length === 0) {
    console.log("⚠️ Thư mục data đang trống, không có file JSON nào để nạp.");
    return;
  }

  let danhMucData: any[] = [];
  let nguoiDungData: any[] = [];
  let khoaHocData: any[] = [];

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const rawData = fs.readFileSync(filePath, "utf-8");

    try {
      const parsedData = JSON.parse(rawData);
      if (!Array.isArray(parsedData) || parsedData.length === 0) continue;

      const sample = parsedData[0];

      if ("maDanhMucKhoahoc" in sample && !("maKhoaHoc" in sample)) {
        danhMucData = danhMucData.concat(parsedData);
        console.log(`📄 Đã nhận diện [${file}] chứa dữ liệu: Danh Mục`);
      } else if (
        "taiKhoan" in sample &&
        "matKhau" in sample &&
        !("maKhoaHoc" in sample)
      ) {
        nguoiDungData = nguoiDungData.concat(parsedData);
        console.log(`📄 Đã nhận diện [${file}] chứa dữ liệu: Người Dùng`);
      } else if ("maKhoaHoc" in sample && "tenKhoaHoc" in sample) {
        khoaHocData = khoaHocData.concat(parsedData);
        console.log(`📄 Đã nhận diện [${file}] chứa dữ liệu: Khóa Học`);
      }
    } catch (err) {
      console.log(`❌ Lỗi đọc file [${file}]`);
    }
  }

  console.log("----------------------------------------------------");

  if (danhMucData.length > 0) {
    console.log(`⏳ Đang nạp ${danhMucData.length} Danh mục...`);
    for (const dm of danhMucData) {
      if (!dm.maDanhMucKhoahoc) continue;
      try {
        await prisma.danhMucKhoaHoc.upsert({
          where: { maDanhMuc: dm.maDanhMucKhoahoc },
          update: {},
          create: {
            maDanhMuc: dm.maDanhMucKhoahoc,
            tenDanhMuc: dm.tenDanhMucKhoaHoc || "Chưa có tên",
          },
        });
      } catch (e) {}
    }
  }

  if (nguoiDungData.length > 0) {
    console.log(`⏳ Đang nạp ${nguoiDungData.length} Người dùng...`);
    for (const nd of nguoiDungData) {
      if (!nd.taiKhoan) continue;
      try {
        const safeEmail =
          nd.email ||
          `${nd.taiKhoan.replace(/\s+/g, "")}_${Math.floor(Math.random() * 99999)}@gmail.com`;
        await prisma.nguoiDung.upsert({
          where: { taiKhoan: nd.taiKhoan },
          update: {},
          create: {
            taiKhoan: nd.taiKhoan,
            hoTen: nd.hoTen || nd.taiKhoan,
            matKhau: "$2b$10$xn3...",
            email: safeEmail,
            soDT: nd.soDt || "0901234567",
            maLoaiNguoiDung: nd.maLoaiNguoiDung || "HV",
          },
        });
      } catch (e) {
        console.log(`⚠️ Bỏ qua user [${nd.taiKhoan}] do trùng lặp dữ liệu.`);
      }
    }
  }

  if (khoaHocData.length > 0) {
    console.log(
      `⏳ Đang nạp ${khoaHocData.length} Khóa học... (Quá trình này có thể mất 1-2 phút)`,
    );
    let successCount = 0;

    for (const course of khoaHocData) {
      if (!course.maKhoaHoc) continue;

      try {
        if (course.danhMucKhoaHoc) {
          await prisma.danhMucKhoaHoc.upsert({
            where: { maDanhMuc: course.danhMucKhoaHoc.maDanhMucKhoahoc },
            update: {},
            create: {
              maDanhMuc: course.danhMucKhoaHoc.maDanhMucKhoahoc,
              tenDanhMuc: course.danhMucKhoaHoc.tenDanhMucKhoaHoc,
            },
          });
        }
        if (course.nguoiTao) {
          const safeEmail = `${course.nguoiTao.taiKhoan.replace(/\s+/g, "")}_${Math.floor(Math.random() * 99999)}@gmail.com`;
          await prisma.nguoiDung.upsert({
            where: { taiKhoan: course.nguoiTao.taiKhoan },
            update: {},
            create: {
              taiKhoan: course.nguoiTao.taiKhoan,
              hoTen: course.nguoiTao.hoTen,
              matKhau: "$2b$10$xn3...",
              email: safeEmail,
              soDT: "0901234567",
              maLoaiNguoiDung: course.nguoiTao.maLoaiNguoiDung,
            },
          });
        }

        await prisma.khoaHoc.upsert({
          where: { maKhoaHoc: course.maKhoaHoc },
          update: {},
          create: {
            maKhoaHoc: course.maKhoaHoc,
            tenKhoaHoc: course.tenKhoaHoc,
            biDanh: course.biDanh,
            moTa: course.moTa || "Không có mô tả",
            hinhAnh: course.hinhAnh,
            ngayTao: course.ngayTao,
            maDanhMuc: course.danhMucKhoaHoc
              ? course.danhMucKhoaHoc.maDanhMucKhoahoc
              : "BE",
            taiKhoanNguoiTao: course.nguoiTao
              ? course.nguoiTao.taiKhoan
              : "admin_gv",
          },
        });
        successCount++;
      } catch (error) {
        console.log(
          `⚠️ Bỏ qua khóa học [${course.maKhoaHoc}] do dữ liệu không hợp lệ.`,
        );
      }
    }
    console.log(
      `✅ Nạp thành công ${successCount}/${khoaHocData.length} khóa học!`,
    );
  }

  console.log("🎉 TẤT CẢ DỮ LIỆU ĐÃ ĐƯỢC GIEO MẦM THÀNH CÔNG! 🚀");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi hệ thống:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
