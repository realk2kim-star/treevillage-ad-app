import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full border-b border-[#eaeaea] bg-white pt-6 pb-4 px-8 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo / Brandmark */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-light tracking-[0.2em] text-[#1f1d1d] uppercase">
              TreeVillage
            </h1>
            <p className="text-[10px] text-brand-brown tracking-widest mt-1">
              Search Ad Analytics
            </p>
          </div>
        </div>
        
        <nav className="hidden md:flex gap-8 text-sm text-[#4a4a4a] tracking-wide">
          <Link href="/dashboard" className="hover:text-black transition-colors border-b-2 border-transparent hover:border-black pb-1">Dashboard</Link>
          <Link href="/dashboard#action-plan" className="hover:text-black transition-colors border-b-2 border-transparent hover:border-black pb-1">Action Plan</Link>
          <Link href="/" className="hover:text-black transition-colors border-b-2 border-transparent hover:border-black pb-1">Upload New</Link>
        </nav>
      </div>
    </header>
  );
}
