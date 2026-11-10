import { Schibsted_Grotesk, Public_Sans } from "next/font/google";
import "./globals.css";

const displayFont = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
});

const bodyFont = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata = {
  title: "Oakland Community Hub",
  description: "A community app for Oakland residents",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
