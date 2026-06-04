import { prisma } from "@/lib/prisma";
import { MetadataRoute } from 'next';
import { ErrorHandler } from '@/lib/errors';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://viettravel.vn';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/promotions`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Dynamic tour pages
  const tourUrls: MetadataRoute.Sitemap = [];
  try {
    const tours = await prisma.tours.findMany({
      where: { is_active: true, is_deleted: false },
      select: { id: true, updated_at: true },
    });

    tourUrls.push(...tours.map((tour) => ({
      url: `${baseUrl}/tour/${tour.id}`,
      lastModified: tour.updated_at || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })));
  } catch (error) {
    ErrorHandler.log(ErrorHandler.handle(error), 'Error fetching tours for sitemap');
  }

  // Dynamic category pages
  const categoryUrls: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.tour_categories.findMany({
      select: { id: true, updated_at: true },
    });

    categoryUrls.push(...categories.map((category) => ({
      url: `${baseUrl}/category/${category.id}`,
      lastModified: category.updated_at || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })));
  } catch (error) {
    ErrorHandler.log(ErrorHandler.handle(error), 'Error fetching categories for sitemap');
  }

  return [...staticPages, ...tourUrls, ...categoryUrls];
}
