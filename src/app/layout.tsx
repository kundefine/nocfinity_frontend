import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { CustomerAuthProvider } from '@/context/CustomerAuthContext';
import TopBanner from '@/components/layout/TopBanner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'SHOP.CO | Find Clothes That Match Your Style',
  description: 'Shop through our diverse range of meticulously crafted garments, designed to bring out your individuality.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&f[]=clash-display@700,600,500&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-black font-satoshi">
        <CustomerAuthProvider>
          <CartProvider>
            <TopBanner />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
