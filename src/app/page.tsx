import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16" style={{ backgroundColor: 'var(--color-card)' }}>
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
            <span className="text-2xl font-bold" style={{ color: 'var(--color-primary-foreground)' }}>F</span>
          </div>
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight" style={{ color: 'var(--color-card-foreground)' }}>
            Welcome to FinanceFlow
          </h1>
          <p className="max-w-md text-lg leading-8" style={{ color: 'var(--color-muted-foreground)' }}>
            Complete banking solution with FD & RD management, loan processing, EMI tracking, and comprehensive financial analytics.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-background transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
            href="/login"
          >
            Get Started
          </Link>
          <Link
            className="flex h-12 w-full items-center justify-center rounded-full border px-5 transition-all duration-300 hover:scale-105"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-card-foreground)' }}
            href="/login"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
