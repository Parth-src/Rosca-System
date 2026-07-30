import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { Logo } from "@/components/shared/logo"
import { RotatingText } from "@/components/shared/rotating-text"

export function AuthLayout({
  title, subtitle, children,
}: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side branded panel (Visible on Desktop) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-primary p-12 lg:p-16 text-primary-foreground lg:flex">
        
        {/* Top Left Big Logo & White Name */}
        <div className="flex items-center gap-3">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <Logo
              imageClassName="h-14 w-14 border-2 border-primary-foreground/30 shadow-md transition-transform group-hover:scale-105"
              textClassName="text-3xl font-bold font-serif text-primary-foreground tracking-tight"
            />
          </Link>
        </div>

        {/* Middle Content with Animated Rotating Text */}
        <div className="my-auto py-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground/90">
            A Modern Community ROSCA
          </span>
          <h2 className="mt-6 font-serif text-4xl lg:text-5xl font-bold text-primary-foreground">
            Save together as a
          </h2>
          <RotatingText className="mt-3 font-serif text-4xl lg:text-5xl font-bold text-primary-foreground drop-shadow-sm" />
          <p className="mt-8 max-w-md text-pretty text-base leading-relaxed text-primary-foreground/85">
            Transparent auctions, verified trust scoring, and instant payouts for community savings pools everywhere.
          </p>
        </div>

        {/* Bottom Tagline */}
        <p className="text-xs font-medium text-primary-foreground/70">
          Circl. Community savings, transparently reinvented.
        </p>
      </div>

      {/* Right side form container */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        {/* Mobile Top Logo Header */}
        <div className="mb-8 lg:hidden">
          <Link to="/">
            <Logo
              imageClassName="h-12 w-12 border border-border"
              textClassName="text-2xl font-bold text-foreground"
            />
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-balance font-serif text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}