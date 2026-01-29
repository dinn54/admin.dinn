import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { GlobalBreadcrumb } from "@/components/global-breadcrumb";
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
        <BProgressBar>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="sticky top-0 z-50 bg-background flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <GlobalBreadcrumb />
              </header>
              <div className="flex flex-1 flex-col gap-4 p-4 md:p-4 lg:p-6 max-w-7xl mx-auto w-full">
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
          <Toaster position="top-right" />
        </BProgressBar>
      </body>
    </html>
  );
}
