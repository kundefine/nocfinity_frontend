'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  CreditCard,
  Truck,
  MapPin,
  Home,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { fetchApi } from '@/lib/api';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51UdYHeRG93tkHUqIgRvk0QwVJff4ONjeLB65HxOIbWxKUIBs7qZoCxXUBVGHYHlUNUPLBNZSdrWVPdxyMTLtwmUd00gB6BQR4q'
);

const cardElementOptions = {
  style: {
    base: {
      fontSize: '15px',
      color: '#111827',
      fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      '::placeholder': {
        color: '#9CA3AF',
      },
    },
    invalid: {
      color: '#EF4444',
      iconColor: '#EF4444',
    },
  },
  hidePostalCode: false,
};

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  total: number;
  appliedPromo?: string | null;
  user: any;
  saveAddress: (addr: any) => Promise<any>;
  clearCart: () => void;
}

function CheckoutForm({
  onClose,
  items,
  total,
  appliedPromo,
  user,
  saveAddress,
  clearCart,
}: Omit<StripeCheckoutModalProps, 'isOpen'>) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const savedAddresses = user?.addresses || [];

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    savedAddresses.length > 0 ? (savedAddresses.find((a: any) => a.is_default)?.id || savedAddresses[0]?.id || 'custom') : 'custom'
  );
  const [addressTitle, setAddressTitle] = useState('Home');
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(true);

  const initialAddr = savedAddresses.find((a: any) => a.is_default) || savedAddresses[0];

  const [shippingName, setShippingName] = useState(initialAddr?.recipient_name || user?.name || '');
  const [shippingEmail, setShippingEmail] = useState(user?.email || '');
  const [shippingPhone, setShippingPhone] = useState(initialAddr?.recipient_phone || user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState(initialAddr?.address || '');
  const [shippingCity, setShippingCity] = useState(initialAddr?.city || '');
  const [shippingPostalCode, setShippingPostalCode] = useState(initialAddr?.postal_code || '');
  const [orderNotes, setOrderNotes] = useState('');

  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleSelectAddress = (addr: any) => {
    setSelectedAddressId(addr.id || 'addr_selected');
    setAddressTitle(addr.title || 'Home');
    setShippingAddress(addr.address || '');
    setShippingCity(addr.city || '');
    setShippingPostalCode(addr.postal_code || '');
    if (addr.recipient_name) setShippingName(addr.recipient_name);
    if (addr.recipient_phone) setShippingPhone(addr.recipient_phone);
  };

  const handleSelectNewCustom = () => {
    setSelectedAddressId('custom');
    setAddressTitle('Home');
    setShippingAddress('');
    setShippingCity('');
    setShippingPostalCode('');
    setSaveAddressToProfile(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacingOrder(true);
    setCheckoutError(null);

    if (!shippingAddress.trim() || !shippingCity.trim()) {
      setCheckoutError('Please provide a complete shipping street address and city.');
      setPlacingOrder(false);
      return;
    }

    if (!stripe || !elements) {
      setCheckoutError('Payment gateway is still initializing. Please wait a moment and try again.');
      setPlacingOrder(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setCheckoutError('Payment card input could not be loaded.');
      setPlacingOrder(false);
      return;
    }

    // Save address to user profile if requested
    if (user && saveAddressToProfile) {
      saveAddress({
        id: selectedAddressId !== 'custom' ? selectedAddressId : undefined,
        title: addressTitle.trim() || 'Home',
        recipient_name: shippingName.trim(),
        recipient_phone: shippingPhone.trim() || undefined,
        address: shippingAddress.trim(),
        city: shippingCity.trim(),
        postal_code: shippingPostalCode.trim() || undefined,
        country: 'United States',
      }).catch(() => {});
    }

    // Format items
    const formattedItems = items.map((item) => {
      let parsedId = parseInt(item.productId, 10);
      if (isNaN(parsedId) || parsedId <= 0) parsedId = 1;
      return {
        product_id: parsedId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      };
    });

    const payload = {
      items: formattedItems,
      coupon_code: appliedPromo || undefined,
      shipping_name: shippingName.trim(),
      shipping_email: shippingEmail.trim(),
      shipping_phone: shippingPhone.trim() || undefined,
      shipping_address: shippingAddress.trim(),
      shipping_city: shippingCity.trim(),
      shipping_postal_code: shippingPostalCode.trim() || undefined,
      shipping_country: 'United States',
      notes: orderNotes.trim() || undefined,
    };

    // Step 1: Create Order in Pending status on backend
    const res = await fetchApi<any>('/checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!res.success || !res.data?.order) {
      setCheckoutError(res.message || 'Failed to place order. Please review your cart.');
      setPlacingOrder(false);
      return;
    }

    const order = res.data.order;

    // Step 2: Create real Stripe PaymentIntent on user's test account
    const intentRes = await fetchApi<any>('/payments/intent', {
      method: 'POST',
      body: JSON.stringify({ order_id: order.id }),
    });

    if (!intentRes.success || !intentRes.data?.client_secret) {
      setCheckoutError(intentRes.message || 'Unable to communicate with Stripe payment gateway.');
      setPlacingOrder(false);
      return;
    }

    const clientSecret = intentRes.data.client_secret;

    // Step 3: Confirm Card Payment with real Stripe API
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: shippingName.trim(),
          email: shippingEmail.trim(),
          phone: shippingPhone.trim() || undefined,
          address: {
            line1: shippingAddress.trim(),
            city: shippingCity.trim(),
            postal_code: shippingPostalCode.trim() || undefined,
            country: 'US',
          },
        },
      },
    });

    if (result.error) {
      // Payment Failed: Notify backend to mark payment failed, order remains unpaid
      await fetchApi<any>('/payments/confirm', {
        method: 'POST',
        body: JSON.stringify({
          order_id: order.id,
          transaction_id: result.error.payment_intent?.id || 'failed_' + Date.now(),
          status: 'failed',
        }),
      }).catch(() => {});

      setCheckoutError(
        result.error.message ||
        'Your card was declined. Please try another card or use test card 4242 4242 4242 4242.'
      );
      setPlacingOrder(false);
      return;
    }

    if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      // Payment Succeeded: Notify backend to decrement stock, send email, and mark order paid
      const confirmRes = await fetchApi<any>('/payments/confirm', {
        method: 'POST',
        body: JSON.stringify({
          order_id: order.id,
          transaction_id: result.paymentIntent.id,
          status: 'succeeded',
        }),
      });

      if (confirmRes.success) {
        clearCart();
        setPlacingOrder(false);
        onClose();
        router.push(`/order-confirmation/${order.order_number}`);
      } else {
        setCheckoutError(confirmRes.message || 'Payment confirmed, but could not finalize order.');
        setPlacingOrder(false);
      }
    } else {
      setCheckoutError('Unexpected payment status received from Stripe. Please check your order status.');
      setPlacingOrder(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative">
      <button
        onClick={onClose}
        disabled={placingOrder}
        className="absolute top-5 right-5 text-gray-400 hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition"
      >
        <X className="size-5" />
      </button>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Truck className="size-6 text-black" />
          <h3 className="text-xl font-bold text-gray-900">Shipping &amp; Checkout</h3>
        </div>

        {checkoutError && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{checkoutError}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={shippingName}
                onChange={(e) => setShippingName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={shippingEmail}
                onChange={(e) => setShippingEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={shippingPhone}
                onChange={(e) => setShippingPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                value={shippingPostalCode}
                onChange={(e) => setShippingPostalCode(e.target.value)}
                placeholder="10001"
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Dynamic Saved Address Selector for Logged In Customer */}
          {user && (
            <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-black" />
                  Delivery Address
                </span>
                <Link
                  href="/profile"
                  target="_blank"
                  className="text-[11px] font-semibold text-gray-500 hover:text-black hover:underline flex items-center gap-1"
                >
                  Manage in Profile &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {savedAddresses.map((addr: any) => {
                  const isSelected = selectedAddressId === addr.id;
                  const isHome = (addr.title || '').toLowerCase().includes('home');
                  return (
                    <button
                      type="button"
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      className={`text-left p-3 rounded-xl border text-xs transition-all relative ${
                        isSelected
                          ? 'bg-black text-white border-black shadow-xs'
                          : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold flex items-center gap-1.5">
                          {isHome ? <Home className="size-3.5" /> : <Building2 className="size-3.5" />}
                          {addr.title}
                        </span>
                        {addr.is_default && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            Default
                          </span>
                        )}
                      </div>
                      <p className={`line-clamp-1 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                        {addr.address}, {addr.city}
                      </p>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={handleSelectNewCustom}
                  className={`text-left p-3 rounded-xl border text-xs transition-all ${
                    selectedAddressId === 'custom'
                      ? 'bg-black text-white border-black shadow-xs'
                      : 'bg-white text-gray-800 border-dashed border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span className="font-bold block mb-0.5">+ New Custom Address</span>
                  <span className={selectedAddressId === 'custom' ? 'text-white/80' : 'text-gray-400'}>
                    Enter custom address below
                  </span>
                </button>
              </div>

              {selectedAddressId === 'custom' && (
                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={saveAddressToProfile}
                      onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                      className="size-4 rounded accent-black"
                    />
                    <span>Save this address to my profile book</span>
                  </label>
                  <input
                    type="text"
                    value={addressTitle}
                    onChange={(e) => setAddressTitle(e.target.value)}
                    placeholder="Label (e.g. Vacation Home)"
                    className="text-xs px-2.5 py-1 bg-white border border-gray-200 rounded-lg w-36 outline-none focus:border-black"
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Street Address *</label>
            <input
              type="text"
              required
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="123 Fifth Avenue, Suite 400"
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">City *</label>
            <input
              type="text"
              required
              value={shippingCity}
              onChange={(e) => setShippingCity(e.target.value)}
              placeholder="New York"
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
            />
          </div>

          {/* Real Stripe CardElement Form */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-gray-200">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                <CreditCard className="size-4 text-black" />
                <span>Credit / Debit Card (Stripe Gateway)</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                <Lock className="size-2.5" />
                Stripe Test Account
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-gray-200 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition shadow-2xs">
              <CardElement options={cardElementOptions} />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5 text-[11px] text-blue-900 leading-relaxed">
              <p className="font-semibold text-blue-950 mb-0.5">Stripe Test Cards</p>
              <p className="text-blue-800">
                Success card: <span className="font-mono font-bold">4242 •••• •••• 4242</span> (any future date, any 3 digits)
              </p>
              <p className="text-blue-800">
                Decline card: <span className="font-mono font-bold">4000 •••• •••• 0002</span> (tests card decline error)
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-600">Total to Charge:</span>
            <span className="font-black text-xl text-black">${total}</span>
          </div>

          <button
            type="submit"
            disabled={placingOrder || !stripe}
            className="w-full py-4 bg-black hover:bg-gray-800 text-white font-bold text-sm rounded-2xl transition disabled:opacity-50 mt-2 flex items-center justify-center gap-2 shadow-lg"
          >
            {placingOrder ? 'Processing Payment with Stripe...' : `Pay $${total} & Place Order`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function StripeCheckoutModal(props: StripeCheckoutModalProps) {
  if (!props.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <Elements stripe={stripePromise}>
        <CheckoutForm {...props} />
      </Elements>
    </div>
  );
}
