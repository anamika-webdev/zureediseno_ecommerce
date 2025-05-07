import type { Metadata } from "next";
import { interFont, playfairFont } from "./fonts";
import dynamic from "next/dynamic";
import "./globals.css";
import { ThemeProvider } from "next-themes";

// Dynamically import ClerkProvider with SSR disabled
const ClerkProviderDynamic = dynamic(() => import("@clerk/nextjs").then((mod) => mod.ClerkProvider), {
  ssr: false,
});

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
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body className={`${interFont.className} ${playfairFont.variable}`}>
        <ClerkProviderDynamic>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ClerkProviderDynamic>
      </body>
    </html>
  );
}