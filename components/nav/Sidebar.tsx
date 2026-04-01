"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
    icon: string;
    label: string;
    href: string;
}

const mainNav: NavItem[] = [
    { icon: "dashboard", label: "Dashboard", href: "/dashboard" },
    { icon: "psychology", label: "Anatomy", href: "/learn" },
    { icon: "biotech", label: "Pathology", href: "/pathology" },
    { icon: "model_training", label: "Simulations", href: "/test" },
];

const bottomNav: NavItem[] = [
    { icon: "settings", label: "Settings", href: "/settings" },
    { icon: "help", label: "Support", href: "/support" },
];

const Sidebar = () => {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    return (
        <aside className="hidden lg:flex flex-col h-full border-r border-[#333538] bg-[#1e2023] w-64 shrink-0">
            <div className="p-6 border-b border-[#333538]">
                <h2 className="text-[#00d4ff] font-bold font-mono text-xs uppercase tracking-widest">
                    NEURO_CORE
                </h2>
                <p className="text-slate-500 font-mono text-[10px] mt-1">
                    V3.2.0_ACTIVE
                </p>
            </div>

            <nav className="flex-1 py-4">
                <div className="space-y-1">
                    {mainNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-6 py-3 font-mono text-xs uppercase transition-all",
                                isActive(item.href)
                                    ? "bg-[#00d4ff]/10 text-[#00d4ff] border-r-2 border-[#00d4ff]"
                                    : "text-slate-500 hover:bg-[#333538] hover:translate-x-1",
                            )}
                        >
                            <span className="material-symbols-outlined">
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            <div className="p-4 border-t border-[#333538]">
                <div className="space-y-1">
                    {bottomNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-4 px-4 py-2 text-slate-500 hover:bg-[#333538] font-mono text-xs uppercase transition-colors"
                        >
                            <span className="material-symbols-outlined">
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
