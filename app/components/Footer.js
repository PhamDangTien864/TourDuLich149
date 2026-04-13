import { Mail, Phone, MapPin, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-white">Viet<span className="text-blue-400">Travel</span></h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Trải nghiệm du lịch Luxury cùng trí tuệ nhân tạo số 1 Việt Nam. Khám phá những hành trình đáng nhớ.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://www.facebook.com/penixillin/" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                title="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12 5.373 12 12 12zm0-10.444c-4.971 0-9 4.029-9 9s4.029 9 9 9-4.971 0-9-4.029-9-9 4.029-9 9-9zm-5.764 14.236l-2.201-2.201c-.413-.413-1.082-.413-1.495 0l-2.611 2.61c-.413.413-.413 1.082 0 1.495l2.201 2.201c.414.414 1.082.414 1.495 0l2.611-2.201c.414-.414.414-1.082 0-1.495l-2.201-2.201zm5.764-14.236l2.201 2.201c.413.413 1.082.413 1.495 0l2.611-2.61c.414-.414.414-1.082 0-1.495l-2.201-2.201c-.413-.413-1.082-.413-1.495 0l-2.611 2.61c-.414.414-.414 1.082 0 1.495l2.201 2.201z"/>
                </svg>
              </a>
              <a 
                href="/" 
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                title="Website"
              >
                <Globe size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-black text-white">Liên kết nhanh</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="/" className="hover:text-blue-400 transition-colors">Trang chủ</a></li>
              <li><a href="/search" className="hover:text-blue-400 transition-colors">Tìm tour</a></li>
              <li><a href="/history" className="hover:text-blue-400 transition-colors">Lịch sử đặt tour</a></li>
              <li><a href="/login" className="hover:text-blue-400 transition-colors">Đăng nhập</a></li>
            </ul>
          </div>

          {/* Popular Destinations */}
          <div className="space-y-4">
            <h4 className="text-lg font-black text-white">Điểm đến nổi bật</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="/search?q=Đà Nẵng" className="hover:text-blue-400 transition-colors">Tour Đà Nẵng</a></li>
              <li><a href="/search?q=Phú Quốc" className="hover:text-blue-400 transition-colors">Tour Phú Quốc</a></li>
              <li><a href="/search?q=Hà Nội" className="hover:text-blue-400 transition-colors">Tour Hà Nội</a></li>
              <li><a href="/search?q=TP.HCM" className="hover:text-blue-400 transition-colors">Tour TP.HCM</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-black text-white">Liên hệ</h4>
            <div className="space-y-3 text-slate-400 text-sm">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-blue-400" />
                <span>0862 640 720</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-blue-400" />
                <span>info@viettravel.vn</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-blue-400" />
                <span>484 Lạch Tray, Đổng Quốc Bình, Hải Phòng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400 text-sm">
          <p> 2026 VietTravel - Hệ thống đặt tour du lịch</p>
          <p className="mt-2"> VietTravel - Hướng tới trải nghiệm du lịch tốt nhất</p>
        </div>
      </div>
    </footer>
  );
}