import type { Metadata } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/inter";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin · The Deenway School",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="bg-sand">{children}</body>
    </html>
  );
}
