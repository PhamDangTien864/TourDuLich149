import { MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function TourCard({ tour }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-100 group">
      <div className="relative h-48 overflow-hidden">
        <Image 
          src={tour.image_url || "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=500"} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          fill
          sizes="(max-width: 400px)"
          alt={tour.title}
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-blue-600 font-bold text-sm">
          {Number(tour.price).toLocaleString('vi-VN')}đ
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 line-clamp-1">{tour.title}</h3>
        <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
          <span className="flex items-center gap-1"><MapPin size={14}/> {tour.location || 'Việt Nam'}</span>
          <span className="flex items-center gap-1"><Clock size={14}/> {tour.duration || '3 ngày'}</span>
        </div>
        <Link href={`/tour/${tour.id}`}>
          <button className="w-full bg-blue-50 text-blue-600 font-bold py-2 rounded-xl hover:bg-blue-600 hover:text-white transition">
            Xem chi tiết
          </button>
        </Link>
      </div>
    </div>
  );
}