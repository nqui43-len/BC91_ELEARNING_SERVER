-- CreateTable
CREATE TABLE "NguoiDung" (
    "taiKhoan" TEXT NOT NULL,
    "matKhau" TEXT NOT NULL,
    "hoTen" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "soDT" TEXT,
    "maLoaiNguoiDung" TEXT NOT NULL DEFAULT 'HV',

    CONSTRAINT "NguoiDung_pkey" PRIMARY KEY ("taiKhoan")
);

-- CreateTable
CREATE TABLE "DanhMucKhoaHoc" (
    "maDanhMuc" TEXT NOT NULL,
    "tenDanhMuc" TEXT NOT NULL,

    CONSTRAINT "DanhMucKhoaHoc_pkey" PRIMARY KEY ("maDanhMuc")
);

-- CreateTable
CREATE TABLE "KhoaHoc" (
    "maKhoaHoc" TEXT NOT NULL,
    "tenKhoaHoc" TEXT NOT NULL,
    "biDanh" TEXT,
    "moTa" TEXT,
    "luotXem" INTEGER NOT NULL DEFAULT 0,
    "danhGia" INTEGER NOT NULL DEFAULT 0,
    "hinhAnh" TEXT,
    "ngayTao" TEXT,
    "maDanhMuc" TEXT,
    "taiKhoanNguoiTao" TEXT,

    CONSTRAINT "KhoaHoc_pkey" PRIMARY KEY ("maKhoaHoc")
);

-- CreateTable
CREATE TABLE "GhiDanh" (
    "taiKhoan" TEXT NOT NULL,
    "maKhoaHoc" TEXT NOT NULL,
    "ngayGhiDanh" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GhiDanh_pkey" PRIMARY KEY ("taiKhoan","maKhoaHoc")
);

-- CreateIndex
CREATE UNIQUE INDEX "NguoiDung_email_key" ON "NguoiDung"("email");

-- AddForeignKey
ALTER TABLE "KhoaHoc" ADD CONSTRAINT "KhoaHoc_maDanhMuc_fkey" FOREIGN KEY ("maDanhMuc") REFERENCES "DanhMucKhoaHoc"("maDanhMuc") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KhoaHoc" ADD CONSTRAINT "KhoaHoc_taiKhoanNguoiTao_fkey" FOREIGN KEY ("taiKhoanNguoiTao") REFERENCES "NguoiDung"("taiKhoan") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GhiDanh" ADD CONSTRAINT "GhiDanh_taiKhoan_fkey" FOREIGN KEY ("taiKhoan") REFERENCES "NguoiDung"("taiKhoan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GhiDanh" ADD CONSTRAINT "GhiDanh_maKhoaHoc_fkey" FOREIGN KEY ("maKhoaHoc") REFERENCES "KhoaHoc"("maKhoaHoc") ON DELETE CASCADE ON UPDATE CASCADE;
