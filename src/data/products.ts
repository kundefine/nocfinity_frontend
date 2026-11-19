import { Product, Review } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'T-shirt with Tape Details',
    category: 't-shirts',
    dressStyle: 'casual',
    price: 120,
    rating: 4.5,
    reviewCount: 150,
    image: '/figma/imgImage7_8ad0bca2.png',
    thumbnails: [
      '/figma/imgImage7_8ad0bca2.png',
      '/figma/imgImage5_692d8673.png',
      '/figma/imgImage6_81b2425e.png'
    ],
    description: 'This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.',
    colors: [
      { name: 'Brown', hex: '#4F4631' },
      { name: 'Green', hex: '#314F4A' },
      { name: 'Navy', hex: '#31344F' }
    ],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
    isNewArrival: true,
  },
  {
    id: '2',
    name: 'Skinny Fit Jeans',
    category: 'jeans',
    dressStyle: 'casual',
    price: 240,
    originalPrice: 260,
    discountPercent: 20,
    rating: 3.5,
    reviewCount: 95,
    image: '/figma/imgImage8_e99f7761.png',
    thumbnails: ['/figma/imgImage8_e99f7761.png'],
    description: 'Classic skinny fit jeans tailored for maximum comfort and style with flexible premium denim.',
    colors: [
      { name: 'Denim Blue', hex: '#2B3D52' },
      { name: 'Black', hex: '#1C1C1E' }
    ],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
    isNewArrival: true,
  },
  {
    id: '3',
    name: 'Checkered Shirt',
    category: 'shirts',
    dressStyle: 'casual',
    price: 180,
    rating: 4.5,
    reviewCount: 120,
    image: '/figma/imgImage9_d39ca11e.png',
    thumbnails: ['/figma/imgImage9_d39ca11e.png'],
    description: 'A stylish checkered pattern button-up shirt crafted with lightweight cotton for effortless everyday style.',
    colors: [
      { name: 'Red Check', hex: '#8B263E' },
      { name: 'Blue Check', hex: '#2C497F' }
    ],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
    isNewArrival: true,
  },
  {
    id: '4',
    name: 'Sleeve Striped T-shirt',
    category: 't-shirts',
    dressStyle: 'casual',
    price: 130,
    originalPrice: 160,
    discountPercent: 30,
    rating: 4.5,
    reviewCount: 88,
    image: '/figma/imgImage10_319b7e46.png',
    thumbnails: ['/figma/imgImage10_319b7e46.png'],
    description: 'Contrast sleeve striped t-shirt delivering a modern sporty vibe with everyday comfort.',
    colors: [
      { name: 'Orange', hex: '#E56B3A' },
      { name: 'Navy', hex: '#223843' }
    ],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
    isNewArrival: true,
  },
  {
    id: '5',
    name: 'Vertical Striped Shirt',
    category: 'shirts',
    dressStyle: 'formal',
    price: 212,
    originalPrice: 232,
    discountPercent: 20,
    rating: 5.0,
    reviewCount: 210,
    image: '/figma/imgImage11_2351479d.png',
    thumbnails: ['/figma/imgImage11_2351479d.png'],
    description: 'Sharp vertical striped casual shirt that elongates the silhouette, suitable for both business casual and weekend events.',
    colors: [
      { name: 'Green Striped', hex: '#315243' },
      { name: 'Navy Striped', hex: '#1D2A44' }
    ],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
    isTopSelling: true,
  },
  {
    id: '6',
    name: 'Courage Graphic T-shirt',
    category: 't-shirts',
    dressStyle: 'casual',
    price: 145,
    rating: 4.0,
    reviewCount: 76,
    image: '/figma/imgImage12_98e907e6.png',
    thumbnails: ['/figma/imgImage12_98e907e6.png'],
    description: 'Bold statement typography print on premium combed cotton. Built to last wash after wash.',
    colors: [
      { name: 'Orange', hex: '#C85A32' },
      { name: 'White', hex: '#FFFFFF' }
    ],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
    isTopSelling: true,
  },
  {
    id: '7',
    name: 'Loose Fit Bermuda Shorts',
    category: 'shorts',
    dressStyle: 'casual',
    price: 80,
    rating: 3.0,
    reviewCount: 42,
    image: '/figma/imgImage13_80b3495a.png',
    thumbnails: ['/figma/imgImage13_80b3495a.png'],
    description: 'Breezy and relaxed Bermuda cut shorts with deep pockets and an elastic drawstring waist.',
    colors: [
      { name: 'Navy', hex: '#273C4E' },
      { name: 'Khaki', hex: '#A89F91' }
    ],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
    isTopSelling: true,
  },
  {
    id: '8',
    name: 'Faded Skinny Jeans',
    category: 'jeans',
    dressStyle: 'casual',
    price: 210,
    rating: 4.5,
    reviewCount: 164,
    image: '/figma/imgImage14_703bf2aa.png',
    thumbnails: ['/figma/imgImage14_703bf2aa.png'],
    description: 'Artfully faded wash denim jeans designed with stretch fibers for maximum freedom of motion.',
    colors: [
      { name: 'Light Blue', hex: '#58738D' },
      { name: 'Dark Wash', hex: '#1C2936' }
    ],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
    isTopSelling: true,
  },
  {
    id: '9',
    name: 'One Life Graphic T-shirt',
    category: 't-shirts',
    dressStyle: 'casual',
    price: 260,
    originalPrice: 300,
    discountPercent: 40,
    rating: 4.5,
    reviewCount: 451,
    image: '/figma/imgImage1_99e98133.png',
    thumbnails: [
      '/figma/imgImage1_99e98133.png',
      '/figma/imgImage5_692d8673.png',
      '/figma/imgImage6_81b2425e.png'
    ],
    description: 'This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.',
    colors: [
      { name: 'Olive Green', hex: '#4F4631' },
      { name: 'Forest Green', hex: '#314F4A' },
      { name: 'Navy Blue', hex: '#31344F' }
    ],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
    isNewArrival: true,
  },
  {
    id: '10',
    name: 'Polo with Tipping Details',
    category: 'shirts',
    dressStyle: 'formal',
    price: 180,
    rating: 4.5,
    reviewCount: 110,
    image: '/figma/imgImage9_b0eef762.png',
    thumbnails: ['/figma/imgImage9_b0eef762.png'],
    description: 'Elevated polo shirt with tipped rib collar and sleeve cuffs. Crisp and modern silhouette.',
    colors: [
      { name: 'Pink', hex: '#E07A5F' },
      { name: 'White', hex: '#FFFFFF' }
    ],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
  },
  {
    id: '11',
    name: 'Black Striped T-shirt',
    category: 't-shirts',
    dressStyle: 'casual',
    price: 120,
    originalPrice: 150,
    discountPercent: 30,
    rating: 5.0,
    reviewCount: 132,
    image: '/figma/imgImage10_51859230.png',
    thumbnails: ['/figma/imgImage10_51859230.png'],
    description: 'Timeless horizontal striped tee in monochrome black and white. Ultra-soft combed cotton.',
    colors: [
      { name: 'Black Striped', hex: '#1C1C1E' }
    ],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
  },
  {
    id: '12',
    name: 'Gradient Graphic T-shirt',
    category: 't-shirts',
    dressStyle: 'party',
    price: 145,
    rating: 4.0,
    reviewCount: 89,
    image: '/figma/imgImage8_30fc2006.png',
    thumbnails: ['/figma/imgImage8_30fc2006.png'],
    description: 'Vibrant gradient graphic artwork on a comfortable, relaxed-fit streetwear staple.',
    colors: [
      { name: 'Multi', hex: '#E07A5F' }
    ],
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
  }
];

export const customerReviews: Review[] = [
  {
    id: 'r1',
    author: 'Sarah M.',
    verified: true,
    rating: 5,
    comment: "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations.",
    date: 'Posted on August 14, 2023'
  },
  {
    id: 'r2',
    author: 'Alex K.',
    verified: true,
    rating: 5,
    comment: "Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions.",
    date: 'Posted on August 15, 2023'
  },
  {
    id: 'r3',
    author: 'James L.',
    verified: true,
    rating: 5,
    comment: "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends.",
    date: 'Posted on August 16, 2023'
  },
  {
    id: 'r4',
    author: 'Samantha D.',
    verified: true,
    rating: 4.5,
    comment: "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It's become my favorite go-to shirt.",
    date: 'Posted on August 14, 2023'
  },
  {
    id: 'r5',
    author: 'Ethan R.',
    verified: true,
    rating: 5,
    comment: "This t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I'm quite picky about aesthetics, and this shirt definitely gets a thumbs up from me.",
    date: 'Posted on August 16, 2023'
  },
  {
    id: 'r6',
    author: 'Olivia P.',
    verified: true,
    rating: 5,
    comment: "The t-shirt is fantastic! The blend of colors and the quality of the fabric makes it stand out. It fits perfectly and keeps its shape after multiple washes.",
    date: 'Posted on August 17, 2023'
  }
];
