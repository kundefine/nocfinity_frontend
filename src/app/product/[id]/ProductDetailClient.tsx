'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Minus,
  Plus,
  Check,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  Star,
  AlertTriangle,
} from 'lucide-react';
import { products as fallbackProducts, customerReviews as fallbackReviews } from '@/data/products';
import { useCart } from '@/context/CartContext';
import RatingStars from '@/components/ui/RatingStars';
import ProductCard from '@/components/ui/ProductCard';
import { fetchApi } from '@/lib/api';
import { formatApiProduct } from '@/lib/products';
import { Product } from '@/types';

export default function ProductDetailClient({ productId }: { productId?: string }) {
  const id = productId || '9';

  const [liveProduct, setLiveProduct] = useState<Product | null>(null);
  const [liveReviews, setLiveReviews] = useState<any[] | null>(null);
  const [liveRelated, setLiveRelated] = useState<Product[] | null>(null);

  const product = liveProduct || fallbackProducts.find((p) => p.id === id) || fallbackProducts[8];

  const { addToCart } = useCart();

  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Olive Green');
  const [selectedSize, setSelectedSize] = useState('Large');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'faqs'>('reviews');
  const [addedToast, setAddedToast] = useState(false);

  // Review Form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      fetchApi(`/products/${productId}`).then((res) => {
        if (res.success && res.data?.product) {
          const formatted = formatApiProduct(res.data.product);
          setLiveProduct(formatted);
          setSelectedImage(formatted.image);
          if (formatted.colors?.[0]) setSelectedColor(formatted.colors[0].name);
          if (formatted.sizes?.[0]) setSelectedSize(formatted.sizes[0]);

          if (Array.isArray(res.data.product.reviews) && res.data.product.reviews.length > 0) {
            setLiveReviews(res.data.product.reviews);
          }
          if (Array.isArray(res.data.related) && res.data.related.length > 0) {
            setLiveRelated(res.data.related.map(formatApiProduct));
          }
        }
      }).catch(() => {});
    }
  }, [productId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;
    setSubmittingReview(true);
    setReviewMessage(null);

    const res = await fetchApi(`/products/${product.id}/reviews`, {
      method: 'POST',
      body: JSON.stringify({
        rating: newReviewRating,
        comment: newReviewComment.trim(),
      }),
    });

    if (res.success) {
      setReviewMessage('Thank you! Your verified review has been submitted.');
      setNewReviewComment('');
      setShowReviewForm(false);
      // Reload product
      fetchApi(`/products/${productId}`).then((r) => {
        if (r.success && r.data?.product?.reviews) {
          setLiveReviews(r.data.product.reviews);
        }
      });
    } else {
      setReviewMessage(res.message || 'Only verified purchasers who ordered this item can submit a review.');
    }
    setSubmittingReview(false);
  };

  const images = product.thumbnails && product.thumbnails.length > 0
    ? product.thumbnails
    : [product.image];

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const relatedProducts = liveRelated && liveRelated.length > 0
    ? liveRelated
    : fallbackProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-6">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-black px-6 py-4 text-white shadow-2xl animate-in slide-in-from-bottom-4 flex items-center gap-3">
          <CheckCircle2 className="size-5 text-[#01AB31]" />
          <span>Added {quantity}x &ldquo;{product.name}&rdquo; to your cart!</span>
          <Link href="/cart" className="underline font-bold text-white hover:text-white/80">
            View Cart
          </Link>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[14px] text-black/60 mb-8">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight className="size-4" />
        <Link href="/shop" className="hover:text-black">Shop</Link>
        <ChevronRight className="size-4" />
        <Link href={`/shop?category=${product.category}`} className="hover:text-black capitalize">
          {product.category}
        </Link>
        <ChevronRight className="size-4" />
        <span className="font-semibold text-black">{product.name}</span>
      </div>

      {/* Product Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-16">
        {/* Gallery */}
        <div className="flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-3 justify-center sm:justify-start">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`relative size-[100px] sm:size-[120px] rounded-[16px] bg-[#F0EEED] overflow-hidden border-2 transition-all p-2 flex items-center justify-center ${
                  selectedImage === img ? 'border-black' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="size-full object-contain" />
              </button>
            ))}
          </div>

          {/* Main Hero Image */}
          <div className="flex-1 aspect-square rounded-[20px] bg-[#F0EEED] overflow-hidden flex items-center justify-center p-6">
            <img
              src={selectedImage}
              alt={product.name}
              className="size-full object-contain max-h-[500px] transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>

        {/* Product Details & Ordering */}
        <div className="flex flex-col gap-4">
          <h1 className="text-[28px] sm:text-[36px] md:text-[40px] font-black uppercase text-black leading-tight font-integral">
            {product.name}
          </h1>

          <div className="flex items-center gap-3">
            <RatingStars rating={product.rating} />
            <span className="text-[14px] text-black/60">
              ({product.reviewCount} Reviews)
            </span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="text-[28px] md:text-[32px] font-bold text-black">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-[28px] md:text-[32px] font-bold text-black/40 line-through">
                ${product.originalPrice}
              </span>
            )}
            {product.discountPercent && (
              <span className="rounded-full bg-[#FF3333]/10 px-3.5 py-1.5 text-[14px] font-medium text-[#FF3333]">
                -{product.discountPercent}%
              </span>
            )}

            {/* Stock status badge */}
            <span
              className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                (product.stock ?? 1) > 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {(product.stock ?? 1) > 0
                ? (product.stock !== undefined && product.stock <= 5
                    ? `Only ${product.stock} left in stock!`
                    : `In Stock (${product.stock ?? 'Available'})`)
                : 'Out of Stock'}
            </span>
          </div>

          <p className="text-[15px] text-black/60 leading-relaxed border-b border-black/10 pb-6 pt-1">
            {product.description}
          </p>

          {/* Select Colors */}
          <div className="flex flex-col gap-3 py-2 border-b border-black/10 pb-6">
            <span className="text-[14px] text-black/60">Select Colors</span>
            <div className="flex items-center gap-4">
              {product.colors.map((color) => {
                const isSelected = selectedColor === color.name;
                return (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    style={{ backgroundColor: color.hex }}
                    className="relative size-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-xs"
                    aria-label={color.name}
                  >
                    {isSelected && <Check className="size-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Choose Size */}
          <div className="flex flex-col gap-3 py-2 border-b border-black/10 pb-6">
            <span className="text-[14px] text-black/60">Choose Size</span>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-full px-6 py-2.5 text-[14px] font-medium transition-all ${
                      isSelected
                        ? 'bg-black text-white'
                        : 'bg-[#F0F0F0] text-black/60 hover:bg-black/10 hover:text-black'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity and Add to Cart */}
          {(() => {
            const isOutOfStock = product.stock !== undefined && product.stock <= 0;
            const maxAvailable = product.stock !== undefined ? product.stock : 99;
            return (
              <div className="flex items-center gap-4 pt-4">
                <div className={`flex items-center justify-between rounded-full bg-[#F0F0F0] px-5 py-3 w-[150px] ${isOutOfStock ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={isOutOfStock}
                    className="text-black hover:opacity-70 p-1 disabled:cursor-not-allowed"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="text-[16px] font-bold text-black">{isOutOfStock ? 0 : quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(maxAvailable, q + 1))}
                    disabled={isOutOfStock || quantity >= maxAvailable}
                    className="text-black hover:opacity-70 p-1 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 rounded-full py-4 text-[16px] font-medium transition-all ${
                    isOutOfStock
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-black/85 hover:shadow-lg active:scale-[0.99]'
                  }`}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Tabs Section: Product Details, Rating & Reviews, FAQs */}
      <div className="border-t border-black/10 pt-8">
        <div className="flex items-center justify-around border-b border-black/10 pb-4 text-center">
          <button
            onClick={() => setActiveTab('details')}
            className={`text-[16px] md:text-[20px] pb-4 -mb-4 font-medium transition-colors ${
              activeTab === 'details'
                ? 'border-b-2 border-black font-bold text-black'
                : 'text-black/60 hover:text-black'
            }`}
          >
            Product Details
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`text-[16px] md:text-[20px] pb-4 -mb-4 font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'border-b-2 border-black font-bold text-black'
                : 'text-black/60 hover:text-black'
            }`}
          >
            Rating &amp; Reviews
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`text-[16px] md:text-[20px] pb-4 -mb-4 font-medium transition-colors ${
              activeTab === 'faqs'
                ? 'border-b-2 border-black font-bold text-black'
                : 'text-black/60 hover:text-black'
            }`}
          >
            FAQs
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'reviews' && (
          <div className="py-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-2">
                <h3 className="text-[20px] md:text-[24px] font-bold text-black">
                  All Reviews
                </h3>
                <span className="text-[14px] text-black/60">({product.reviewCount})</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="rounded-full bg-black px-6 py-2.5 text-[14px] font-medium text-white hover:bg-black/85 transition"
                >
                  {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                </button>
              </div>
            </div>

            {reviewMessage && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-800 flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>{reviewMessage}</span>
              </div>
            )}

            {/* Write Review Form */}
            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="mb-8 p-6 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                <h4 className="font-bold text-sm text-black">Write Your Review</h4>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewReviewRating(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`size-6 ${
                            star <= newReviewRating
                              ? 'fill-[#FFC633] text-[#FFC633]'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-gray-700 ml-2">{newReviewRating} / 5</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Feedback</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Share your experience regarding sizing, fabric quality, and fit..."
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full p-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(liveReviews && liveReviews.length > 0 ? liveReviews : fallbackReviews).map((rev: any) => {
                const authorName = rev.user?.name || rev.author || 'Verified Customer';
                const dateStr = rev.created_at ? new Date(rev.created_at).toLocaleDateString() : rev.date;
                const isVerified = rev.is_verified_purchase ?? rev.verified ?? true;

                return (
                  <div
                    key={rev.id}
                    className="rounded-[20px] border border-black/10 p-6 flex flex-col gap-3 bg-white"
                  >
                    <RatingStars rating={rev.rating} showText={false} />

                    <div className="flex items-center gap-1.5 font-bold text-[18px] text-black">
                      <span>{authorName}</span>
                      {isVerified && (
                        <CheckCircle2 className="size-5 fill-[#01AB31] text-white" />
                      )}
                    </div>

                    <p className="text-[14px] text-black/60 leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>

                    <span className="text-[13px] text-black/40 pt-2 font-medium">
                      Posted on {dateStr}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <button className="rounded-full border border-black/10 px-8 py-3 text-[14px] font-medium text-black hover:bg-black hover:text-white transition-colors">
                Load More Reviews
              </button>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="py-8 max-w-2xl text-[15px] text-black/70 space-y-4">
            <h3 className="text-[20px] font-bold text-black">Specifications</h3>
            <p><strong>Material:</strong> 100% Combed Compact Cotton (Single Jersey)</p>
            <p><strong>Weight:</strong> 220 GSM heavyweight durable construction</p>
            <p><strong>Fit:</strong> Contemporary Streetwear Oversized Silhouette</p>
            <p><strong>Care Instructions:</strong> Machine wash cold with like colors, tumble dry low.</p>
          </div>
        )}

        {activeTab === 'faqs' && (
          <div className="py-8 max-w-2xl space-y-4">
            <div className="rounded-xl border border-black/10 p-4">
              <h4 className="font-bold text-black">What is the return policy?</h4>
              <p className="text-[14px] text-black/60 mt-1">We offer a 30-day no-hassle return window on unworn items with tags attached.</p>
            </div>
            <div className="rounded-xl border border-black/10 p-4">
              <h4 className="font-bold text-black">How long does shipping take?</h4>
              <p className="text-[14px] text-black/60 mt-1">Standard shipping takes 3-5 business days. Express shipping takes 1-2 days.</p>
            </div>
          </div>
        )}
      </div>

      {/* "YOU MIGHT ALSO LIKE" Section */}
      <div className="pt-16 pb-12">
        <h2 className="text-center text-[32px] md:text-[48px] font-black uppercase tracking-tight text-black mb-10 font-integral">
          YOU MIGHT ALSO LIKE
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
