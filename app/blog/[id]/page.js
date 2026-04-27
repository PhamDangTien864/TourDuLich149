import { FileText, Calendar, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default async function BlogDetailPage({ params }) {
  const { id } = await params;

  // Fetch post from API
  let post = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/posts`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const posts = await res.json();
      post = posts.find(p => p.id === Number(id));
    }
  } catch (error) {
    console.error('Error fetching post:', error);
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pt-32 pb-16">
        <Header />
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-black text-slate-800 mb-4">Bài viết không tồn tại</h1>
          <Link href="/blog" className="text-pink-600 hover:text-pink-700 font-bold">
            Quay lại danh sách bài viết
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-24">
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-slate-600 hover:text-pink-600 font-bold mb-8"
        >
          <ArrowLeft size={20} />
          Quay lại
        </Link>

        <article className="max-w-4xl mx-auto">
          <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden mb-8">
            <img 
              src={post.image_url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200"} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mb-6">
            <span className="bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold uppercase">
              {post.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-slate-500 font-bold mb-8">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={18} />
              <span>{post.views} lượt xem</span>
            </div>
          </div>

          {post.excerpt && (
            <p className="text-xl text-slate-600 font-bold mb-8 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          <div className="prose prose-lg max-w-none">
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
