import React from 'react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#F2F0F1]">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center min-h-[600px] lg:min-h-[663px] pt-8 lg:pt-0">
          {/* Left: Copy & Stats */}
          <div className="flex flex-col gap-6 lg:gap-8 z-10 py-8">
            <h1 className="text-[36px] sm:text-[48px] lg:text-[64px] font-black uppercase leading-[1.05] text-black font-integral">
              FIND CLOTHES THAT MATCHES YOUR STYLE
            </h1>

            <p className="text-[14px] md:text-[16px] text-black/60 max-w-xl leading-relaxed">
              Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.
            </p>

            <div>
              <Link
                href="/shop"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-black px-12 py-4 text-[16px] font-medium text-white transition-all hover:bg-black/80 hover:shadow-lg"
              >
                Shop Now
              </Link>
            </div>

            {/* Metrics / Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-black/10">
              <div className="flex flex-col">
                <span className="text-[28px] sm:text-[40px] font-bold text-black font-integral">200+</span>
                <span className="text-[12px] sm:text-[14px] text-black/60">International Brands</span>
              </div>
              <div className="flex flex-col sm:border-l sm:border-black/10 sm:pl-6">
                <span className="text-[28px] sm:text-[40px] font-bold text-black font-integral">2,000+</span>
                <span className="text-[12px] sm:text-[14px] text-black/60">High-Quality Products</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex flex-col sm:border-l sm:border-black/10 sm:pl-6">
                <span className="text-[28px] sm:text-[40px] font-bold text-black font-integral">30,000+</span>
                <span className="text-[12px] sm:text-[14px] text-black/60">Happy Customers</span>
              </div>
            </div>
          </div>

          {/* Right: Hero Image with Sparkles */}
          <div className="relative flex justify-center lg:justify-end items-end h-full">
            {/* Sparkle Star 1 (Top-Right) */}
            <img
              src="/figma/imgVector_57b4dfe0.svg"
              alt="Sparkle"
              className="absolute top-12 right-4 lg:right-10 size-16 lg:size-24 animate-pulse pointer-events-none z-20"
            />

            {/* Sparkle Star 2 (Middle-Left) */}
            <img
              src="/figma/imgVector1_8355533a.svg"
              alt="Sparkle"
              className="absolute top-1/2 left-4 lg:left-10 size-10 lg:size-14 animate-pulse pointer-events-none z-20"
            />

            {/* Main Model Photography */}
            <div className="relative w-full max-w-[500px] lg:max-w-none flex justify-center">
              <img
                src="/figma/imgRectangle2_c4950cd0.png"
                alt="Shop.co Fashion Collection"
                className="w-full h-auto object-contain max-h-[600px] lg:max-h-[660px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
