import type { ImageMetadata } from "astro";

import caoHoaiNhon from "@/assets/teachers/cao-hoai-nhon.webp";
import duongMaiPhuong from "@/assets/teachers/duong-mai-phuong.webp";
import huynhThiMyChinh from "@/assets/teachers/huynh-thi-my-chinh.webp";
import leTuanMinh from "@/assets/teachers/le-tuan-minh.webp";
import lyHienTin from "@/assets/teachers/ly-hien-tin.webp";
import nguyenTuanCanh from "@/assets/teachers/nguyen-tuan-canh.webp";
import tranHongHuyen from "@/assets/teachers/tran-hong-huyen.webp";
import voThiQuynhTrang from "@/assets/teachers/vo-thi-quynh-trang.webp";

import chiNguyen from "@/assets/reviews/chi-nguyen.jpg";
import danhGiau from "@/assets/reviews/danh-giau.jpg";
import doanPhuongThao from "@/assets/reviews/doan-phuong-thao.png";
import longChanPhat from "@/assets/reviews/long-chan-phat.png";
import nguyenThiPhuongThao from "@/assets/reviews/nguyen-thi-phuong-thao.jpg";
import phoiMy from "@/assets/reviews/phoi-my.jpg";
import thanhTram from "@/assets/reviews/thanh-tram.jpg";
import tranGiaTue from "@/assets/reviews/tran-gia-tue.jpg";
import tuongQuy from "@/assets/reviews/tuong-quy.jpg";

const ASSETS: Record<string, ImageMetadata> = {
  "/images/teachers/cao-hoai-nhon.webp": caoHoaiNhon,
  "/images/teachers/duong-mai-phuong.webp": duongMaiPhuong,
  "/images/teachers/huynh-thi-my-chinh.webp": huynhThiMyChinh,
  "/images/teachers/le-tuan-minh.webp": leTuanMinh,
  "/images/teachers/ly-hien-tin.webp": lyHienTin,
  "/images/teachers/nguyen-tuan-canh.webp": nguyenTuanCanh,
  "/images/teachers/tran-hong-huyen.webp": tranHongHuyen,
  "/images/teachers/vo-thi-quynh-trang.webp": voThiQuynhTrang,

  "/images/reviews/chi-nguyen.jpg": chiNguyen,
  "/images/reviews/danh-giau.jpg": danhGiau,
  "/images/reviews/doan-phuong-thao.png": doanPhuongThao,
  "/images/reviews/long-chan-phat.png": longChanPhat,
  "/images/reviews/nguyen-thi-phuong-thao.jpg": nguyenThiPhuongThao,
  "/images/reviews/phoi-my.jpg": phoiMy,
  "/images/reviews/thanh-tram.jpg": thanhTram,
  "/images/reviews/tran-gia-tue.jpg": tranGiaTue,
  "/images/reviews/tuong-quy.jpg": tuongQuy,
};

export const imageAsset = (path: string | null | undefined): ImageMetadata | undefined =>
  path ? ASSETS[path] : undefined;
