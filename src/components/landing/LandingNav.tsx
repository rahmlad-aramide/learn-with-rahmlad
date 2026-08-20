"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";

interface LandingNavProps {
  isLoggedIn: boolean;
}

export default function LandingNav({ isLoggedIn }: LandingNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-border bg-background/50 sticky top-0 z-20 border-b backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" onClick={() => setMenuOpen(false)}>
          <Image
            className="dark:hidden"
            src="/images/logo/logo.svg"
            alt="Logo"
            width={150}
            height={40}
          />
          <Image
            className="hidden dark:block"
            src="/images/logo/logo-dark.svg"
            alt="Logo"
            width={150}
            height={40}
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/browse">
            <Button variant={isLoggedIn ? "outline" : "ghost"} size="sm">
              Browse Resources
            </Button>
          </Link>
          {isLoggedIn ? (
            <Link href="/my-learning">
              <Button variant="primary" size="sm">
                My Learning
              </Button>
            </Link>
          ) : (
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          )}
          <ThemeToggleButton />
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggleButton />
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="border-border bg-background border-t px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-2 pt-3">
            <Link href="/browse" onClick={() => setMenuOpen(false)}>
              <Button
                variant={isLoggedIn ? "outline" : "ghost"}
                size="sm"
                className="w-full justify-start"
              >
                Browse Resources
              </Button>
            </Link>
            {isLoggedIn ? (
              <Link href="/my-learning" onClick={() => setMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">
                  My Learning
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signin" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)}>
                  <Button size="sm" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
