import Header from "../components/Header";
import Footer from "../components/Footer";
import { MapPin, Phone, Mail, Send, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-4">
              Liên hệ với chúng tôi
            </h1>
            <p className="text-xl text-slate-600 font-bold max-w-2xl mx-auto">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Hãy liên hệ để được tư vấn miễn phí!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-blue-600 to-slate-900 rounded-3xl p-8 text-white">
                <h2 className="text-2xl font-black mb-6">Thông tin liên hệ</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="font-black mb-1">Địa chỉ</h3>
                      <p className="text-blue-100">123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h3 className="font-black mb-1">Hotline</h3>
                      <p className="text-blue-100">1900 1234</p>
                      <p className="text-blue-100">0987 654 321</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h3 className="font-black mb-1">Email</h3>
                      <p className="text-blue-100">support@viettravel.com</p>
                      <p className="text-blue-100">booking@viettravel.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h3 className="font-black mb-1">Giờ làm việc</h3>
                      <p className="text-blue-100">Thứ 2 - Thứ 7: 8:00 - 18:00</p>
                      <p className="text-blue-100">Chủ nhật: 9:00 - 17:00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="bg-slate-100 rounded-3xl h-64 flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <MapPin size={48} className="mx-auto mb-2" />
                  <p className="font-bold">Bản đồ</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Gửi tin nhắn</h2>
              
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập họ tên của bạn"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    placeholder="0987 654 321"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">
                    Chủ đề
                  </label>
                  <select
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                  >
                    <option>Đặt tour</option>
                    <option>Hỏi về tour</option>
                    <option>Hỗ trợ thanh toán</option>
                    <option>Đổi/Hủy tour</option>
                    <option>Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">
                    Nội dung
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Nhập nội dung tin nhắn..."
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-slate-900 text-white py-4 rounded-xl font-black text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Gửi tin nhắn
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
