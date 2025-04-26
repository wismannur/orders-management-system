import Header from "@/components/Header";
import Providers from "@/components/Providers";
import { AuthProvider } from "@/context/auth-context";
import { OrderProviderWithClient } from "@/context/order-context";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Orders Management System",
  description: "A CRUD application for managing orders",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <OrderProviderWithClient>
              <div className="min-h-screen bg-gray-50">
                <Header />
                <main>{children}</main>
              </div>
            </OrderProviderWithClient>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
