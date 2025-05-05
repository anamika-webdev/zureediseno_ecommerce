// Next.js
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { interFont, playfairFont } from "./fonts";
import "./globals.css";

// Metadata
export const metadata: Metadata = {
  title: "ZureeDiseno",
  description: "Welcome to zuree Diseno ecommerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${interFont.className} ${playfairFont.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}