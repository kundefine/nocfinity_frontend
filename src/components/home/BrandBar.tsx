import React from 'react';

export default function BrandBar() {
  const brands = [
    { name: 'Versace', src: '/figma/imgGroup_592b4b19.svg', h: 'h-6 md:h-8' },
    { name: 'Zara', src: '/figma/imgZaraLogo11_c8e4fb46.svg', h: 'h-6 md:h-8' },
    { name: 'Gucci', src: '/figma/imgGucciLogo11_236acd7b.svg', h: 'h-6 md:h-8' },
    { name: 'Prada', src: '/figma/imgGroup1_9aa508fe.svg', h: 'h-6 md:h-8' },
    { name: 'Calvin Klein', src: '/figma/imgGroup2_27b4abec.svg', h: 'h-6 md:h-8' },
  ];

  return (
    <section id="brands" className="bg-black py-8 md:py-11">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-wrap items-center justify-around gap-6 md:gap-12">
          {brands.map((brand) => (
            <div key={brand.name} className="flex items-center justify-center p-2 opacity-90 hover:opacity-100 transition-opacity">
              <img
                src={brand.src}
                alt={`${brand.name} logo`}
                className={`${brand.h} w-auto object-contain filter invert brightness-0`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
