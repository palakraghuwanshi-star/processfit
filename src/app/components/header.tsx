
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { useUser } from "@/firebase";

export function Header() {
  const pathname = usePathname();
  const { user } = useUser();
  const isAdminPath = pathname.startsWith("/admin");
  const isLoginPage = pathname === '/admin/login';

  return (
    <header className="w-full border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-3 font-bold text-xl">
          <Logo className="h-8 w-auto text-primary" />
        </Link>

        {!isAdminPath && (
          <Button asChild variant="outline">
            <Link href="/admin/login">
              <LogIn className="mr-2 h-4 w-4" />
              Admin Login
            </Link>
          </Button>
        )}
        {isAdminPath && user && !isLoginPage && (
          // This will be shown on dashboard, but not login
          <div></div> 
        )}
      </div>
    </header>
  );
}
