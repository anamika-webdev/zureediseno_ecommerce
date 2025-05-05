import { Inter, Barlow, Playfair_Display } from "next/font/google";

export const interFont = Inter({ subsets: ["latin"] });
export const barlowFont = Barlow({
  subsets: ["latin"],
  weight: ["500", "700"],
});
export const playfairFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
});