'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { customerReviews as fallbackReviews } from '@/data/products';
import RatingStars from '@/components/ui/RatingStars';
import { Review } from '@/types';

interface CustomerReviewsProps {
  initialReviews?: Review[];
}

export default function CustomerReviews({ initialReviews }: CustomerReviewsProps) {
  const reviews = initialReviews && initialReviews.length > 0 ? initialReviews : fallbackReviews;
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevReview = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : reviews.length - 1));
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev < reviews.length - 1 ? prev + 1 : 0));
  };

  return (
    <section className="py-12 md:py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header with Title and Navigation Arrows */}
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <h2 className="text-[28px] sm:text-[36px] md:text-[48px] font-black uppercase tracking-tight text-black font-integral">
            OUR HAPPY CUSTOMERS
          </h2>

          <div className="flex items-center gap-3">
            <button
              onClick={prevReview}
              className="p-2 md:p-3 rounded-full hover:bg-black/5 transition-colors border border-black/10"
              aria-label="Previous review"
            >
              <ArrowLeft className="size-5 md:size-6 text-black" />
            </button>
            <button
              onClick={nextReview}
              className="p-2 md:p-3 rounded-full hover:bg-black/5 transition-colors border border-black/10"
              aria-label="Next review"
            >
              <ArrowRight className="size-5 md:size-6 text-black" />
            </button>
          </div>
        </div>

        {/* Reviews Carousel Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.slice(0, 3).map((review, i) => {
            const actualReview = reviews[(currentIndex + i) % reviews.length];
            return (
              <div
                key={actualReview.id || i}
                className="flex flex-col gap-3 rounded-[20px] border border-black/10 p-6 md:p-8 bg-white transition-all hover:shadow-md"
              >
                <RatingStars rating={actualReview.rating} showText={false} />

                <div className="flex items-center gap-1.5 font-bold text-[18px] md:text-[20px] text-black">
                  <span>{actualReview.author}</span>
                  {actualReview.verified && (
                    <CheckCircle2 className="size-5 fill-[#01AB31] text-white" />
                  )}
                </div>

                <p className="text-[14px] md:text-[16px] text-black/60 leading-relaxed">
                  &ldquo;{actualReview.comment}&rdquo;
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
