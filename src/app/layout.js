import "./globals.css";

export const metadata = {
  title: "Oakland Community Hub",
  description: "A community app for Oakland residents",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}