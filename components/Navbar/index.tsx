"use client";

import { useEffect, useState } from "react";
import { Menu, X, Search, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getAuthToken, removeAuthToken } from "@/lib/auth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Showcase", href: "#" },
    { name: "Docs", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Analytics", href: "#" },
    { name: "Templates", href: "#" },
    { name: "Enterprise", href: "#" },
  ];

  const checkAuth = () => {
    const token = getAuthToken();
    const isAuthenticated = !!token;
    setIsLoggedIn(isAuthenticated);
  };

  useEffect(() => {
    checkAuth();

    // Check auth state periodically
    const interval = setInterval(checkAuth, 1000);

    // Add event listener for storage changes
    window.addEventListener("storage", checkAuth);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    setIsLoggedIn(false);
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      {/* Mobile Navbar */}
      <div className="md:hidden flex justify-between items-center p-4">
        <Link href="/" className="font-bold text-lg">
          AEON
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Navbar */}
      <div className="max-w-6xl mx-auto hidden md:flex items-center justify-between p-4">
        <Link href="/" className="font-bold text-lg">
          AEON
        </Link>

        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="hover:text-blue-600"
            >
              {item.name}
            </Link>
          ))}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
            >
              <LogOut size={18} />
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className={`px-4 py-2 rounded-lg ${
                pathname === "/login"
                  ? "bg-gray-100"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu (Conditional) */}
      {isOpen && (
        <div className="md:hidden bg-white p-4 space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block py-2 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200"
            />
          </div>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
            >
              <LogOut size={18} />
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
