import Header from "../components/Header";
import Footer from "../components/Footer";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Liên hệ VietTravel Luxury - Hỗ trợ 24/7",
  description: "Liên hệ với VietTravel Luxury để được tư vấn miễn phí. Hotline 1900 1234, địa chỉ 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh.",
  keywords: "liên hệ VietTravel, hotline, địa chỉ, email, hỗ trợ khách hàng",
  openGraph: {
    title: "Liên hệ VietTravel Luxury - Hỗ trợ 24/7",
    description: "Liên hệ với VietTravel Luxury để được tư vấn miễn phí.",
    type: 'website',
  },
};

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
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
