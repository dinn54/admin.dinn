import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import BProgressBar from "@/lib/bprogressBar";
import { Toaster } from "@/components/ui/sonner";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-code",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin Dinn",
  description: "내부 서비스 관리 시스템",
  icons: 'https://mowzqxruruhcvjgpzzdb.supabase.co/storage/v1/object/public/dinn_dev/logo_dinn.png'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${jetbrainsMono.variable}`}>
      <head>
        <link
          href="//spoqa.github.io/spoqa-han-sans/css/SpoqaHanSansNeo.css"
          rel="stylesheet"
          type="text/css"
        />
      </head>
      <body
        className="antialiased font-sans lg:min-h-[800px]"
        style={{ fontFamily: "'Spoqa Han Sans Neo', 'sans-serif'" }}
      >
        <SessionProvider>
          <BProgressBar>
            <AuthenticatedLayout>{children}</AuthenticatedLayout>
            <Toaster position="top-right" />
          </BProgressBar>
        </SessionProvider>
      </body>
    </html>
  );
}
