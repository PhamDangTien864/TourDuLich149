export interface TourStructuredData {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  image: string[];
  price: string;
  priceCurrency: string;
  duration: string;
  location: {
    name: string;
    address: {
      streetAddress?: string;
      addressLocality?: string;
      addressRegion?: string;
      addressCountry?: string;
    };
    geo?: {
      latitude: number;
      longitude: number;
    };
  };
  offers?: Array<{
    '@type': string;
    price: string;
    priceCurrency: string;
    availability: string;
    url: string;
  }>;
  aggregateRating?: {
    '@type': string;
    ratingValue: number;
    reviewCount: number;
  };
}

export function generateTourStructuredData(tour: any, baseUrl: string): string {
  const structuredData: TourStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: tour.description || '',
    image: tour.tour_images?.map((img: any) => img.image_url) || [],
    price: `${Number(tour.price).toLocaleString()} VND`,
    priceCurrency: 'VND',
    duration: tour.duration_days ? `P${tour.duration_days}D` : 'P1D',
    location: {
      name: tour.location_name || '',
      address: {
        addressCountry: 'Vietnam'
      }
    }
  };

  if (tour.latitude && tour.longitude) {
    structuredData.location.geo = {
      latitude: tour.latitude,
      longitude: tour.longitude
    };
  }

  if (tour.tour_images && tour.tour_images.length > 0) {
    structuredData.offers = [
      {
        '@type': 'Offer',
        price: Number(tour.price).toString(),
        priceCurrency: 'VND',
        availability: 'https://schema.org/InStock',
        url: `${baseUrl}/tour/${tour.id}`
      }
    ];
  }

  // Add aggregate rating if available
  if (tour.reviews && tour.reviews.length > 0) {
    const avgRating = tour.reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / tour.reviews.length;
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avgRating,
      reviewCount: tour.reviews.length
    };
  }

  return JSON.stringify(structuredData);
}

export function generateOrganizationStructuredData(baseUrl: string): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VietTravel',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Hệ thống đặt tour du lịch thông minh số 1 Việt Nam',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'VN'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+84-1900-XXXX',
      contactType: 'customer service'
    },
    sameAs: [
      'https://facebook.com/viettravel',
      'https://twitter.com/viettravel'
    ]
  };

  return JSON.stringify(structuredData);
}

export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return JSON.stringify(structuredData);
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  return JSON.stringify(structuredData);
}

export function generateProductStructuredData(tour: any, baseUrl: string): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: tour.title,
    description: tour.description || '',
    image: tour.tour_images?.map((img: any) => img.image_url) || [],
    offers: {
      '@type': 'Offer',
      price: Number(tour.price).toString(),
      priceCurrency: 'VND',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/tour/${tour.id}`,
      seller: {
        '@type': 'Organization',
        name: 'VietTravel'
      }
    },
    aggregateRating: tour.reviews && tour.reviews.length > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: tour.reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / tour.reviews.length,
      reviewCount: tour.reviews.length
    } : undefined
  };

  return JSON.stringify(structuredData);
}
