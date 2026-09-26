import type { Metadata, Viewport } from "next";
import "../components/style/globals.css";
import { Navbar } from "../components/molecules/Navbar/Navbar";
import { getUser } from "../lib/dal";
import { logout } from "./actions/auth";

export const metadata: Metadata = {
  title: "Linguo",
  description: "Language learning app",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  
  return (
    <html lang="en">
      <body
        className={`antialiased flex flex-col min-h-screen bg-[var(--color-neutral-lighter)]`}
      >
        <div className="w-full px-3 py-4">
          <Navbar
          content={ user ?  [
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
            { label: "Learn", href: "/learn" },
            { label: "Dictionary", href: "/dictionary" },
            { label: "List", href: "/list" },
          ]
            : [
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
          ]}
          username={user?.username ?? undefined} 
          onLogout={logout}
          />
        </div>
        {children}
      </body>
    </html>
  );
}
