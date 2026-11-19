import React from 'react';
import Link from 'next/link';

export interface DressStyleItem {
  name: string;
  slug?: string;
  href: string;
  image: string;
  colSpan?: string;
  col_span?: string;
  products_count?: number;
}

interface DressStyleSectionProps {
  styles?: DressStyleItem[];
}

const DEFAULT_STYLES: DressStyleItem[] = [
  {
    name: 'Casual',
    href: '/shop?style=casual',
    image: '/figma/imgImage15_8433b976.png',
    colSpan: 'lg:col-span-4',
  },
  {
    name: 'Formal',
    href: '/shop?style=formal',
    image: '/figma/imgImage16_f8900dc6.png',
    colSpan: 'lg:col-span-8',
  },
  {
    name: 'Party',
    href: '/shop?style=party',
    image: '/figma/imgImage17_3c5517f0.png',
    colSpan: 'lg:col-span-8',
  },
  {
    name: 'Gym',
    href: '/shop?style=gym',
    image: '/figma/imgImage18_ed57d863.png',
    colSpan: 'lg:col-span-4',
  },
];

export default function DressStyleSection({ styles }: DressStyleSectionProps) {
  const items = styles && styles.length > 0 ? styles : DEFAULT_STYLES;

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="rounded-[30px] md:rounded-[40px] bg-[#F0F0F0] px-6 py-10 md:px-16 md:py-16">
          <h2 className="text-center text-[28px] sm:text-[36px] md:text-[48px] font-black uppercase tracking-tight text-black mb-8 md:mb-14 font-integral">
            BROWSE BY DRESS STYLE
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
            {items.map((style) => {
              const spanClass = style.colSpan || style.col_span || 'lg:col-span-6';

              return (
                <Link
                  key={style.name}
                  href={style.href}
                  className={`group relative h-[200px] sm:h-[240px] md:h-[289px] overflow-hidden rounded-[20px] bg-white transition-transform duration-300 hover:scale-[1.01] ${spanClass}`}
                >
                  <span className="absolute top-6 left-6 z-10 text-[24px] md:text-[36px] font-bold text-black font-satoshi group-hover:text-black/80">
                    {style.name}
                  </span>

                  <img
                    src={style.image}
                    alt={style.name}
                    className="absolute right-0 top-0 h-full w-auto object-cover object-right transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
