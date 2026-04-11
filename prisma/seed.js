// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu gieo mầm dữ liệu E-learning...");

  // 1. Dọn dẹp DB (Xóa từ bảng con lên bảng cha)
  await prisma.ghiDanh.deleteMany();
  await prisma.khoaHoc.deleteMany();
  await prisma.danhMucKhoaHoc.deleteMany();
  await prisma.nguoiDung.deleteMany();

  // 2. Tạo Mật khẩu đã mã hóa cho tài khoản mẫu (Pass chung là: 123456)
  const hashedPass = await bcrypt.hash("123456", 10);

  // 3. Tạo 2 Người dùng (1 Giáo vụ, 1 Học viên)
  await prisma.nguoiDung.createMany({
    data: [
      {
        taiKhoan: "admin_gv",
        matKhau: hashedPass,
        hoTen: "Giáo Vụ Tối Cao",
        email: "admin@gmail.com",
        maLoaiNguoiDung: "GV",
      },
      {
        taiKhoan: "hocvien_01",
        matKhau: hashedPass,
        hoTen: "Học Viên Chăm Chỉ",
        email: "hocvien@gmail.com",
        soDT: "0901234567",
        maLoaiNguoiDung: "HV",
      },
    ],
  });

  // 4. Tạo Danh Mục Khóa Học
  await prisma.danhMucKhoaHoc.createMany({
    data: [
      { maDanhMuc: "FE", tenDanhMuc: "Lập trình FrontEnd" },
      { maDanhMuc: "BE", tenDanhMuc: "Lập trình BackEnd" },
      { maDanhMuc: "MOBILE", tenDanhMuc: "Lập trình Di Động" },
    ],
  });

  // 5. Tạo Khóa Học mẫu
  await prisma.khoaHoc.create({
    data: {
      maKhoaHoc: "REACT01",
      tenKhoaHoc: "Lập trình ReactJS Thực Chiến",
      biDanh: "lap-trinh-reactjs-thuc-chien",
      moTa: "Khóa học ReactJS từ cơ bản đến nâng cao, xây dựng dự án Airbnb.",
      luotXem: 150,
      danhGia: 5,
      hinhAnh:
        "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
      ngayTao: "11/04/2026",
      maDanhMuc: "FE",
      taiKhoanNguoiTao: "admin_gv", // Do Admin tạo
    },
  });

  console.log("✅ Gieo mầm thành công! Tài khoản test: admin_gv / 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
