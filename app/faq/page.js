import Header from "../components/Header";
import Footer from "../components/Footer";
import { HelpCircle } from "lucide-react";
import FAQContent from "./FAQContent";

export const metadata = {
  title: "Câu hỏi thường gặp - VietTravel Luxury",
  description: "Tìm câu trả lời cho các câu hỏi thường gặp về đặt tour, thanh toán, hủy đổi tour, và các dịch vụ của VietTravel Luxury.",
  keywords: "FAQ, câu hỏi thường gặp, đặt tour, thanh toán, hủy tour, đổi tour",
  openGraph: {
    title: "Câu hỏi thường gặp - VietTravel Luxury",
    description: "Tìm câu trả lời cho các câu hỏi thường gặp về đặt tour và dịch vụ.",
    type: 'website',
  },
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="text-blue-600" size={40} />
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-4">
              Câu hỏi thường gặp
            </h1>
            <p className="text-xl text-slate-600 font-bold max-w-2xl mx-auto">
              Tìm câu trả lời cho các thắc mắc phổ biến về dịch vụ của chúng tôi
            </p>
          </div>

          <FAQContent />
        </div>
      </main>
      <Footer />
    </div>
  );
}
