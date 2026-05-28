/**
 * Structured Data (JSON-LD) Generator for SEO
 * Provides schema.org markup for rich snippets
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://viettravel.vn';

/**
 * Generate Tour structured data for a tour page
 */
export function generateTourSchema(tour) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: tour.description || tour.short_description || '',
    image: tour.tour_images?.[0]?.image_url || '',
    url: `${BASE_URL}/tour/${tour.id}`,
    offers: {
      '@type': 'Offer',
      price: tour.price,
      priceCurrency: 'VND',
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/tour/${tour.id}`,
    },
    duration: tour.duration || '',
    itinerary: tour.itinerary ? tour.itinerary.split('\n').map((item, index) => ({
      '@type': 'TouristTrip',
      name: `Ngày ${index + 1}`,
      description: item.trim(),
    })) : [],
    location: tour.location_name ? {
      '@type': 'Place',
      name: tour.location_name,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'VN',
      },
    } : undefined,
  };
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Review structured data
 */
export function generateReviewSchema(tour, reviews) {
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length 
    : 0;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: tour.title,
    image: tour.tour_images?.[0]?.image_url || '',
    description: tour.description || tour.short_description || '',
    url: `${BASE_URL}/tour/${tour.id}`,
    aggregateRating: reviews.length > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount: reviews.length,
      bestRating: '5',
      worstRating: '1',
    } : undefined,
    review: reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.accounts?.full_name || 'Khách hàng',
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: '5',
        worstRating: '1',
      },
      reviewBody: review.comment,
      datePublished: review.created_at,
    })),
  };
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VietTravel Luxury',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'Hệ thống đặt tour du lịch cao cấp Việt Nam',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+84-862-640-720',
      contactType: 'customer service',
      availableLanguage: 'Vietnamese',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '484 Lạch Tray, Đổng Quốc Bình',
      addressLocality: 'Hải Phòng',
      addressCountry: 'VN',
    },
    sameAs: [
      'https://www.facebook.com/phamdangtien888/',
      'https://zalo.me/0862640720',
    ],
  };
}

/**
 * Generate LocalBusiness structured data
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'VietTravel Luxury',
    url: BASE_URL,
    telephone: '+84-862-640-720',
    email: 'info@viettravel.vn',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '484 Lạch Tray, Đổng Quốc Bình',
      addressLocality: 'Hải Phòng',
      addressCountry: 'VN',
    },
    openingHours: 'Mo-Su 08:00-22:00',
    priceRange: '$$',
  };
}

/**
 * Render JSON-LD script tag
 */
export function StructuredData({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
