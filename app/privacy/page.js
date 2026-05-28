import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShieldCheck, Lock, Eye, Database, Cookie, UserCheck, AlertCircle, CheckCircle, Mail, Phone, MapPin } from 'lucide-react';

// Cache this static page for 1 day (86400 seconds)
export const revalidate = 86400;
export const dynamic = 'force-static';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-24 max-w-5xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <ShieldCheck className="text-white" size={40} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter">
            Chính Sách Bảo Mật
          </h1>
          <p className="text-slate-600 font-bold text-lg">
            Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          {/* Introduction */}
          <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-8 md:p-12 border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <ShieldCheck className="text-green-600" /> Giới Thiệu
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Tại <strong>VietTravel Luxury</strong>, chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. Chính sách Bảo Mật này giải thích cách chúng tôi thu thập, sử dụng, và bảo vệ thông tin của bạn khi bạn sử dụng dịch vụ của chúng tôi.
            </p>
          </section>

          {/* 1. Thông Tin Chúng Tôi Thu Thập */}
          <section className="bg-white rounded-3xl p-8 md:p-12 border-2 border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Database className="text-blue-600" /> 1. Thông Tin Chúng Tôi Thu Thập
            </h2>
            <div className="space-y-4 text-slate-700">
              <h3 className="font-black text-slate-900">1.1. Thông Tin Cá Nhân</h3>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <UserCheck size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Họ và tên</span>
                </li>
                <li className="flex items-start gap-2">
                  <UserCheck size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Địa chỉ email</span>
                </li>
                <li className="flex items-start gap-2">
                  <UserCheck size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Số điện thoại</span>
                </li>
                <li className="flex items-start gap-2">
                  <UserCheck size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Ngày sinh</span>
                </li>
                <li className="flex items-start gap-2">
                  <UserCheck size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Địa chỉ nhà</span>
                </li>
                <li className="flex items-start gap-2">
                  <UserCheck size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Số CMND/CCCD/Hộ chiếu</span>
                </li>
              </ul>

              <h3 className="font-black text-slate-900 mt-6">1.2. Thông Tin Đặt Tour</h3>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-blue-600 flex-shrink-0 mt-1" />
                  <span>Lịch trình tour đã chọn</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-blue-600 flex-shrink-0 mt-1" />
                  <span>Ngày khởi hành và kết thúc</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-blue-600 flex-shrink-0 mt-1" />
                  <span>Số lượng hành khách</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-blue-600 flex-shrink-0 mt-1" />
                  <span>Yêu cầu đặc biệt</span>
                </li>
              </ul>

              <h3 className="font-black text-slate-900 mt-6">1.3. Thông Tin Thanh Toán</h3>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <Lock size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                  <span>Thông tin thẻ tín dụng (được mã hóa)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                  <span>Lịch sử giao dịch</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                  <span>Hóa đơn và biên lai</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 2. Cách Chúng Tôi Sử Dụng Thông Tin */}
          <section className="bg-white rounded-3xl p-8 md:p-12 border-2 border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Eye className="text-blue-600" /> 2. Cách Chúng Tôi Sử Dụng Thông Tin
            </h2>
            <div className="space-y-4 text-slate-700">
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Xử lý và xác nhận đặt tour của bạn</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Gửi thông báo và cập nhật về tour</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Cải thiện dịch vụ và trải nghiệm người dùng</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Gửi khuyến mãi và ưu đãi đặc biệt</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Phân tích xu hướng và hành vi người dùng</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Đảm bảo an toàn và ngăn chặn gian lận</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 3. Chia Sẻ Thông Tin */}
          <section className="bg-white rounded-3xl p-8 md:p-12 border-2 border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <UserCheck className="text-purple-600" /> 3. Chia Sẻ Thông Tin
            </h2>
            <div className="space-y-4 text-slate-700">
              <p>Chúng tôi không bán, cho thuê, hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba, ngoại trừ trong các trường hợp sau:</p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                  <span>Với sự đồng ý của bạn</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                  <span>Để hoàn thành dịch vụ (đối tác du lịch, khách sạn, vận chuyển...)</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                  <span>Khi được yêu cầu bởi pháp luật</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                  <span>Để bảo vệ quyền lợi và an toàn của chúng tôi</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 4. Bảo Mật Thông Tin */}
          <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-8 md:p-12 border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Lock className="text-green-600" /> 4. Bảo Mật Thông Tin
            </h2>
            <div className="space-y-4 text-slate-700">
              <p>Chúng tôi sử dụng các biện pháp bảo mật tiên tiến để bảo vệ thông tin của bạn:</p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Mã hóa dữ liệu với SSL/TLS 256-bit</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Hệ thống firewall và intrusion detection</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Quy truy cập hạn chế cho nhân viên</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Backup dữ liệu định kỳ</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Đánh giá bảo mật thường xuyên</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 5. Cookies */}
          <section className="bg-white rounded-3xl p-8 md:p-12 border-2 border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Cookie className="text-orange-600" /> 5. Cookies
            </h2>
            <div className="space-y-4 text-slate-700">
              <p>Chúng tôi sử dụng cookies để cải thiện trải nghiệm của bạn:</p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Cookies thiết yếu - cần thiết cho hoạt động của website</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Cookies hiệu suất - cải thiện tốc độ và hiệu suất</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Cookies chức năng - ghi nhớ preferences của bạn</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Cookies targeting - cho quảng cáo cá nhân hóa</span>
                </li>
              </ul>
              <p className="mt-4">Bạn có thể quản lý cookies thông qua cài đặt trình duyệt của mình.</p>
            </div>
          </section>

          {/* 6. Quyền Của Bạn */}
          <section className="bg-white rounded-3xl p-8 md:p-12 border-2 border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <UserCheck className="text-blue-600" /> 6. Quyền Của Bạn
            </h2>
            <div className="space-y-4 text-slate-700">
              <p>Bạn có các quyền sau đối với thông tin cá nhân của mình:</p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Truy cập và xem thông tin cá nhân</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Chính sửa hoặc cập nhật thông tin</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Xóa tài khoản và thông tin liên quan</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Opt-out khỏi email marketing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Rút lại sự đồng ý bất cứ lúc nào</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Yêu cầu bản sao dữ liệu của bạn</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 7. Lưu Trữ Dữ Liệu */}
          <section className="bg-white rounded-3xl p-8 md:p-12 border-2 border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Database className="text-purple-600" /> 7. Lưu Trữ Dữ Liệu
            </h2>
            <div className="space-y-4 text-slate-700">
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Thông tin cá nhân được lưu trữ trong suốt thời gian bạn sử dụng dịch vụ</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Sau khi xóa tài khoản, dữ liệu sẽ được giữ trong 30 ngày cho mục đích backup</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Dữ liệu giao dịch được lưu trữ theo quy định pháp luật (thường là 7 năm)</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                  <span>Chúng tôi có thể giữ lại một số thông tin cần thiết cho mục đích pháp lý</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 8. Trẻ Em */}
          <section className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-3xl p-8 md:p-12 border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <AlertCircle className="text-orange-600" /> 8. Bảo Vệ Trẻ Em
            </h2>
            <div className="space-y-4 text-slate-700">
              <p>Chúng tôi không thu thập thông tin cá nhân của trẻ em dưới 16 tuổi. Nếu bạn là phụ huynh/người giám hộ, vui lòng giám sát việc sử dụng internet của con em bạn.</p>
            </div>
          </section>

          {/* 9. Thay Đổi Chính Sách */}
          <section className="bg-white rounded-3xl p-8 md:p-12 border-2 border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Eye className="text-blue-600" /> 9. Thay Đổi Chính Sách
            </h2>
            <div className="space-y-4 text-slate-700">
              <p>Chúng tôi có thể cập nhật Chính sách Bảo Mật này theo thời gian. Các thay đổi sẽ được thông báo qua:</p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Email cho người dùng đăng ký</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Thông báo trên website</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Cập nhật ngày hiệu lực ở đầu trang</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 10. Liên Hệ */}
          <section className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 md:p-12 text-white">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <Mail /> 10. Liên Hệ
            </h2>
            <div className="space-y-4">
              <p className="font-bold">Nếu bạn có bất kỳ câu hỏi nào về Chính sách Bảo Mật, vui lòng liên hệ:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Mail size={20} />
                  <span>Email: privacy@viettravel.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={20} />
                  <span>Hotline: 1900 1234</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={20} />
                  <span>Địa chỉ: 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
