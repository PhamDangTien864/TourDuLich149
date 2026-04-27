import Header from "../components/Header";
import Footer from "../components/Footer";
import { Award, Users, Globe, ShieldCheck, Target, Heart } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600"
            className="absolute inset-0 w-full h-full object-cover"
            alt="About VietTravel"
            fill
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 to-slate-900/90" />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
              Về VietTravel
            </h1>
            <p className="text-xl text-white/90 font-bold max-w-2xl mx-auto">
              Hành trình hơn 20 năm đồng hành cùng du khách Việt khám phá đất nước
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">
              Câu chuyện của chúng tôi
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Được thành lập từ năm 2004, VietTravel đã trở thành một trong những công ty du lịch hàng đầu Việt Nam. 
              Với sứ mệnh mang đến những trải nghiệm du lịch đẳng cấp và đáng nhớ, chúng tôi đã phục vụ hơn 
              500.000 khách hàng từ khắp nơi trên thế giới.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              Chúng tôi tin rằng mỗi chuyến đi là một câu chuyện, và chúng tôi ở đây để giúp bạn viết nên 
              những chương tuyệt đẹp nhất trong hành trình khám phá Việt Nam và thế giới.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-slate-50 py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                Giá trị cốt lõi
              </h2>
              <p className="text-slate-600 font-bold">Những điều chúng tôi tin tưởng và theo đuổi</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <Award className="text-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">Chất lượng hàng đầu</h3>
                <p className="text-slate-600">
                  Cam kết mang đến dịch vụ và trải nghiệm du lịch đẳng cấp nhất cho mọi khách hàng.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">Khách hàng là trung tâm</h3>
                <p className="text-slate-600">
                  Mọi quyết định của chúng tôi đều xuất phát từ nhu cầu và mong muốn của khách hàng.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <Globe className="text-purple-600" size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">Kết nối toàn cầu</h3>
                <p className="text-slate-600">
                  Mở rộng thế giới quan và kết nối văn hóa qua những hành trình khám phá.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck className="text-orange-600" size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">Uy tín và trách nhiệm</h3>
                <p className="text-slate-600">
                  Luôn giữ lời hứa và chịu trách nhiệm với mọi cam kết đã đưa ra.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="text-red-600" size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">Đổi mới sáng tạo</h3>
                <p className="text-slate-600">
                  Không ngừng cải tiến và tạo ra những trải nghiệm du lịch mới mẻ.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="text-pink-600" size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">Đam mê Việt Nam</h3>
                <p className="text-slate-600">
                  Yêu và tự hào về vẻ đẹp của đất nước, muốn chia sẻ với cả thế giới.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-24">
          <div className="bg-gradient-to-r from-blue-600 to-slate-900 rounded-3xl p-12 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-black mb-2">20+</div>
                <div className="text-blue-100 font-bold">Năm kinh nghiệm</div>
              </div>
              <div>
                <div className="text-5xl font-black mb-2">500K+</div>
                <div className="text-blue-100 font-bold">Khách hàng</div>
              </div>
              <div>
                <div className="text-5xl font-black mb-2">100+</div>
                <div className="text-blue-100 font-bold">Tour du lịch</div>
              </div>
              <div>
                <div className="text-5xl font-black mb-2">50+</div>
                <div className="text-blue-100 font-bold">Đối tác quốc tế</div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="bg-slate-50 py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                Đội ngũ của chúng tôi
              </h2>
              <p className="text-slate-600 font-bold">Những người làm nên thành công của VietTravel</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-3xl p-6 text-center shadow-lg border border-slate-100">
                <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-black text-slate-900 mb-1">Nguyễn Văn A</h3>
                <p className="text-blue-600 font-bold mb-2">CEO & Founder</p>
                <p className="text-slate-600 text-sm">20 năm kinh nghiệm trong ngành du lịch</p>
              </div>

              <div className="bg-white rounded-3xl p-6 text-center shadow-lg border border-slate-100">
                <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-black text-slate-900 mb-1">Trần Thị B</h3>
                <p className="text-blue-600 font-bold mb-2">COO</p>
                <p className="text-slate-600 text-sm">Chuyên gia vận hành và quản lý chất lượng</p>
              </div>

              <div className="bg-white rounded-3xl p-6 text-center shadow-lg border border-slate-100">
                <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-black text-slate-900 mb-1">Lê Văn C</h3>
                <p className="text-blue-600 font-bold mb-2">CTO</p>
                <p className="text-slate-600 text-sm">Đứng sau công nghệ và trải nghiệm số</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
