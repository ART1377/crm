"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CheckSquare,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

const navigation = [
  { name: "داشبورد", href: "/", icon: LayoutDashboard },
  { name: "سرنخ‌ها", href: "/leads", icon: Users },
  { name: "تسک‌ها", href: "/tasks", icon: CheckSquare },
  { name: "قالب‌های پیام", href: "/templates", icon: MessageSquare },
  { name: "تنظیمات", href: "/settings", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close on link click instead of pathname effect
  const handleLinkClick = () => setIsOpen(false);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile trigger */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "bg-background fixed top-4 z-50 border shadow-md transition-all duration-300 lg:hidden",
          isOpen ? "right-52 bg-gray-200" : "right-4"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-card fixed inset-y-0 right-0 z-40 flex w-64 flex-col border-l transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="border-b p-6 pb-8">
          <div className="mb-1 flex items-center gap-2">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Sparkles className="text-primary-foreground h-4 w-4" />
            </div>
            <h1 className="text-lg font-bold">CRM سرنخ‌ها</h1>
          </div>
          <p className="text-muted-foreground text-xs">مدیریت فروش تلفنی</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1 p-3">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {item.name}
                {isActive && <span className="bg-primary mr-auto h-1.5 w-1.5 rounded-full" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            CRM v1.0
          </div>
        </div>
      </aside>
    </>
  );
}
