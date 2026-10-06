import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cho điện thoại/máy khác trong cùng mạng LAN mở dev server (VD quét QR "Đua Tốc Độ Gõ") – chỉ ảnh hưởng `next dev`.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
};

export default nextConfig;
