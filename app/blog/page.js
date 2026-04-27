import { FileText, Calendar, Eye } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  // Fetch posts from API
  let posts = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/posts`, {
      cache: 'no-store'
    });
    if (res.ok) {
      posts = await res.json();
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
  }

  // Fallback to mock data if API fails
  if (!posts || posts.length === 0) {
    posts = [
      {
        id: 1,
        title: 'Top 5 điểm đến mùa hè 2024 không thể bỏ qua',
        excerpt: 'Khám phá những điểm đến tuyệt vời nhất cho kỳ nghỉ hè của bạn cùng gia đình và bạn bè...',
        category: 'Du lịch',
        image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        created_at: '2024-01-15',
        views: 1234
      },
      {
        id: 2,
        title: 'Kinh nghiệm đi Đà Nẵng tự túc tiết kiệm nhất',
        excerpt: 'Hướng dẫn chi tiết cách đi Đà Nẵng tự túc với chi phí thấp nhưng trải nghiệm tuyệt vời...',
        category: 'Hướng dẫn',
        image_url: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800',
        created_at: '2024-01-10',
        views: 856
      },
      {
        id: 3,
        title: 'Những món ăn đặc sản Hà Nội phải thử',
        excerpt: 'Tổng hợp những món ăn ngon nhất, đặc sản nhất của thủ đô Hà Nội mà du khách không thể bỏ qua...',
        category: 'Ẩm thực',
        image_url: 'https://images.unsplash.com/photo-1569550270262-13c28e2e56c6?w=800',
        created_at: '2024-01-05',
        views: 2341
      }
    ];
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pt-32 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-800 mb-4 flex items-center justify-center gap-3">
            <FileText className="text-pink-500" size={40} />
            Tin Tức & Blog
          </h1>
          <p className="text-slate-600 font-bold text-lg">Cập nhật thông tin du lịch và kinh nghiệm hữu ích</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`} className="bg-white rounded-2xl shadow-lg border border-pink-100 overflow-hidden hover:shadow-xl transition-shadow group block">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={post.image_url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {post.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-black text-slate-800 text-lg mb-3 line-clamp-2 group-hover:text-pink-600 transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye size={14} />
                    <span>{post.views} lượt xem</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-16">
            <FileText className="text-slate-300 mx-auto mb-4" size={64} />
            <p className="text-slate-500 font-bold text-lg">Chưa có bài viết nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
