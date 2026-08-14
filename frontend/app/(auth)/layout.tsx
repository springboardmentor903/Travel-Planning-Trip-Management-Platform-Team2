import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex font-sans">

      {/* ── Left panel ── */}
      <div className="w-full md:w-[45%] flex flex-col bg-[#f0f2f5] px-12 py-8">

        {/* Back arrow */}
        <Link href="/" className="text-gray-400 hover:text-gray-600 w-fit mb-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-1 mb-8">
          <span className="text-xl font-bold text-gray-900 tracking-tight">TripNest</span>
          <span className="w-2 h-2 rounded-full bg-orange-500 mb-3" />
        </div>

        {/* Page content */}
        <div className="flex-1">{children}</div>
      </div>

      {/* ── Right panel — real travel image ── */}
      <div className="hidden md:block md:w-[55%] relative overflow-hidden bg-[#5ecfef]">
        <Image
          src="/travel-hero.png"
          alt="Travel illustration"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

    </div>
  );
}
