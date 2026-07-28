import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { Logo } from "@/components/shared/logo"
import { RotatingText } from "@/components/shared/rotating-text"

export function AuthLayout({
  title, subtitle, children,
}: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="relative hidden w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <Link to="/" className="text-primary-foreground">
          <Logo />
        </Link>
        <div>
          <p className="text-sm uppercase tracking-widest opacity-70">Save together as</p>
          <RotatingText className="mt-3 font-serif text-5xl font-semibold" />
          <p className="mt-8 max-w-sm text-pretty leading-relaxed opacity-80">
            Transparent auctions, trust scoring, and instant payouts for community savings pools everywhere.
          </p>
        </div>
        <p className="text-sm opacity-60">© {new Date().getFullYear()} Circl</p>
      </div>
      <div className="flex w-full flex-col items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link to="/"><Logo /></Link>
          </div>
          <h1 className="text-balance font-serif text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}