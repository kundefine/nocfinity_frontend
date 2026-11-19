import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  max?: number;
  showText?: boolean;
}

export default function RatingStars({ rating, max = 5, showText = true }: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.3 && rating % 1 <= 0.8;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-[#FFC633]">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="size-[18px] fill-[#FFC633] text-[#FFC633]" />;
          }
          if (i === fullStars && hasHalfStar) {
            return (
              <div key={i} className="relative size-[18px]">
                <Star className="absolute inset-0 size-[18px] text-[#FFC633]" />
                <StarHalf className="absolute inset-0 size-[18px] fill-[#FFC633] text-[#FFC633]" />
              </div>
            );
          }
          if (i === fullStars && rating % 1 > 0.8) {
            return <Star key={i} className="size-[18px] fill-[#FFC633] text-[#FFC633]" />;
          }
          return <Star key={i} className="size-[18px] text-[#D9D9D9] fill-[#D9D9D9]" />;
        })}
      </div>
      {showText && (
        <span className="text-[14px] text-black">
          {rating.toFixed(1)}/<span className="text-black/60">5</span>
        </span>
      )}
    </div>
  );
}
