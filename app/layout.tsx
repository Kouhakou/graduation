import type { Metadata, Viewport } from "next";
import { serif, sans } from "@/lib/fonts";
import { config } from "@/lib/config";
import "./globals.css";

const title = `Lễ tốt nghiệp của ${config.name}`;
const description = `${[config.degree, config.school].filter(Boolean).join(" · ")}. Trân trọng kính mời bạn đến chung vui và để lại đôi dòng lưu bút.`;

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#05060d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
