
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";

export function Header() {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith("/admin");

  return (
    <header className="w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Logo className="h-8 w-8 text-primary" />
          <span className="hidden sm:inline">Pace's ProcessFit Analyser</span>
        </Link>

        {!isAdminPath && (
          <Button asChild variant="outline">
            <Link href="/admin/login">
              <LogIn className="mr-2 h-4 w-4" />
              Admin Login
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
