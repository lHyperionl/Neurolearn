"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const pathname = usePathname();

  const navLinks = [
    { name: "Learn", href: "/learn" },
    { name: "Test Yourself", href: "/test" },
    { name: "MRI Viewer", href: "/viewerMRI" },
    { name: "Test test", href: "/testtest" },
  ];

  return (
    <header className="bg-[#0c0e11] backdrop-blur-xl bg-opacity-80 border-b border-[#00d4ff]/30 shadow-[0_1px_10px_rgba(0,212,255,0.2)] sticky top-0 z-50 flex justify-between items-center w-full px-6 py-4">
      <div className="text-xl font-bold text-[#00d4ff] tracking-tighter flex items-center gap-2">
        <span className="material-symbols-outlined text-[#00d4ff]">
          psychology
        </span>
        <span className="font-syne uppercase tracking-widest text-sm">
          NeuroLearn
        </span>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-syne uppercase tracking-widest text-sm transition-colors",
                isActive
                  ? "text-[#00d4ff] border-b-2 border-[#00d4ff] pb-1"
                  : "text-slate-400 hover:text-[#00d4ff]",
              )}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center">
        <button className="hover:bg-[#00d4ff]/10 transition-all duration-300 p-2">
          <span className="material-symbols-outlined text-[#00d4ff]">
            account_circle
          </span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
