import React, { Suspense } from 'react';
import OrderConfirmationClient from './OrderConfirmationClient';

export function generateStaticParams() {
  return [{ orderNumber: 'sample' }];
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F0F0F0]/50 py-16 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 font-medium">Loading your receipt...</p>
          </div>
        </div>
      }
    >
      <OrderConfirmationClient orderNumber={orderNumber} />
    </Suspense>
  );
}
