import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Trạm Sạc Ngữ Văn 🚀",
  description: "Lập dàn ý, gỡ bí diễn đạt và trò chuyện với nhân vật văn học cho học sinh THCS lớp 6–9",
};

// Set class "dark" trước khi trang hiển thị để không bị nháy màu.
const themeScript = `(function(){try{var t=localStorage.getItem("tram-sac-theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={nunito.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
