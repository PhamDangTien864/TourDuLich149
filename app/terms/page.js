import Header from '../components/Header';
import Footer from '../components/Footer';
import { FileText, ShieldCheck, AlertCircle, CheckCircle, Users, CreditCard, Calendar, MapPin } from 'lucide-react';

// Cache this static page for 1 day (86400 seconds)
export const revalidate = 86400;
export const dynamic = 'force-static';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-24 max-w-5xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <FileText className="text-white" size={40} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter">
            Điều Khoản Sử Dụng
          </h1>
          <p className="text-slate-600 font-bold text-lg">
            Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          {/* Introduction */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12 border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <ShieldCheck className="text-blue-600" /> Giới Thiệu
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Chào mừng bạn đến với <strong>VietTravel Luxury</strong>. Bằng việc truy cập và sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện được quy định dưới đây. Vui lòng đọc kỹ các điều khoản này trước khi sử dụng dịch vụ.
            </p>
          </section>

          {/* 1. Chấp Nhận Điều Khoản */}
          <section className="bg-white rounded-3xl p-8 md:p-12 border-2 border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <CheckCircle className="text-green-600" /> 1. Chấp Nhận Điều Khoản
            </h2>
            <div className="space-y-4 text-slate-700">
              <p>Bằng việc sử dụng dịch vụ của VietTravel Luxury, bạn xác nhận rằng bạn:</p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Đã đọc, hiểu và đồng ý với các điều khoản này</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Có đủ năng lực pháp lý để ký kết hợp đồng</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Cung cấp thông tin chính xác và đầy đủ</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Tuân thủ tất cả các quy định pháp luật hiện hành</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 2. Đặt Tour & Thanh Toán */}
          <section className="bg-white rounded-3xl p-8 md:p-12 border-2 border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <CreditCard className="text-blue-600" /> 2. Đặt Tour & Thanh Toán
            </h2>
            <div className="space-y-4 text-slate-700">
              <h3 className="font-black text-slate-900">2.1. Quy Trình Đặt Tour</h3>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <Calendar size={20} className="text-blue-600 flex-shrink-0 mt-1" />
                  <span>Khách hàng chọn tour và điền thông tin đặt chỗ</span>
                </li>
                <li className="flex items-start gap-2">
                  <Calendar size={20} className="text-blue-600 flex-shrink-0 mt-1" />
                  <span>Xác nhận đặt tour qua email hoặc SMS</span>
                </li>
                <li className="flex items-start gap-2">
                  <Calendar size={20} className="text-blue-600 flex-shrink-0 mt-1" />
                  <span>Thanh toán cọc 30% hoặc thanh toán đầy đủ</span>
                </li>
                <li className="flex items-start gap-2">
                  <Calendar size={20} className="text-blue-600 flex-shrink-0 mt-1" />
                  <span>Nhận vé điện tử và thông tin tour</span>
                </li>
              </ul>

              <h3 className="font-black text-slate-900 mt-6">2.2. Phương Thức Thanh Toán</h3>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <CreditCard size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                  <span>Thanh toán qua VNPay</span>
                </li>
                <li className="flex items-start gap-2">
                  <CreditCard size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                  <span>Thanh toán qua QR Code</span>
                </li>
                <li className="flex items-start gap-2">
                  <CreditCard size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                  <span>Chuyển khoản ngân hàng</span>
                </li>
                <li className="flex items-start gap-2">
                  <CreditCard size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                  <span>Thanh toán tại văn phòng</span>
                </li>
              </ul>

              <h3 className="font-black text-slate-900 mt-6">2.3. Chính Sách Giá</h3>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                  <span>Giá tour có thể thay đổi tùy theo mùa và tình trạng chỗ</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                  <span>Giá hiển thị chưa bao gồm các chi phí phát sinh</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                  <span>Khuyến mãi không áp dụng đồng thời với các ưu đãi khác</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 3. Chính Sách Hủy & Hoàn Tiền */}
          <section className="bg-white rounded-3xl p-8 md:p-12 border-2 border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <AlertCircle className="text-red-600" /> 3. Chính Sách Hủy & Hoàn Tiền
            </h2>
            <div className="space-y-4 text-slate-700">
              <h3 className="font-black text-slate-900">3.1. Chính Sách Hủy Tour</h3>
              <div className="bg-slate-50 rounded-2xl p-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-3 font-black text-slate-900">Thời Gian Hủy</th>
                      <th className="text-left py-3 font-black text-slate-900">Phí Hủy</th>
                      <th className="text-left py-3 font-black text-slate-900">Hoàn Tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="py-3">Trước 30 ngày</td>
                      <td className="py-3">0%</td>
                      <td className="py-3 text-green-600 font-black">100%</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-3">15-29 ngày</td>
                      <td className="py-3">10%</td>
                      <td className="py-3 text-green-600 font-black">90%</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-3">7-14 ngày</td>
                      <td className="py-3">30%</td>
                      <td className="py-3 text-green-600 font-black">70%</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-3">3-6 ngày</td>
                      <td className="py-3">50%</td>
                      <td className="py-3 text-green-600 font-black">50%</td>
                    </tr>
                    <tr>
                      <td className="py-3">Dưới 3 ngày</td>
                      <td className="py-3">100%</td>
                      <td className="py-3 text-red-600 font-black">0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="font-black text-slate-900 mt-6">3.2. Quy Trình Hoàn Tiền</h3>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Hoàn tiền trong vòng 7-14 ngày làm việc</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Hoàn về cùng phương thức thanh toán ban đầu</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                  <span>Phí giao dịch ngân hàng có thể được trừ</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 4. Trách Nhiệm Của Khách Hàng */}
          <section className="bg-white rounded-3xl p-8 md:p-12 border-2 border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Users className="text-blue-600" /> 4. Trách Nhiệm Của Khách Hàng
            </h2>
            <div className="space-y-4 text-slate-700">
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Cung cấp thông tin cá nhân chính xác và đầy đủ</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Chuẩn bị giấy tờ tùy thân hợp lệ (CMND/CCCD/Hộ chiếu)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Tuân thủ lịch trình và hướng dẫn của hướng dẫn viên</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Đúng giờ tại điểm tập kết</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                  <span>Bảo vệ tài sản cá nhân trong suốt chuyến đi</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                  <span>Tuân thủ các quy định của địa phương và điểm đến</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 5. Trách Nhiệm Của VietTravel */}
          <section className="bg-white rounded-3xl p-8 md:p-12 border-2 border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <ShieldCheck className="text-purple-600" /> 5. Trách Nhiệm Của VietTravel
            </h2>
            <div className="space-y-4 text-slate-700">
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Cung cấp dịch vụ đúng như cam kết trong hợp đồng</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Đảm bảo an toàn cho khách hàng trong suốt chuyến đi</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Cung cấp hướng dẫn viên chuyên nghiệp và có kinh nghiệm</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Hỗ trợ khách hàng 24/7 trong suốt chuyến đi</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Bảo hiểm du lịch cho tất cả khách hàng</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                  <span>Xử lý kịp thời các sự cố phát sinh</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 6. Bảo Mật Thông Tin */}
          <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-8 md:p-12 border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <ShieldCheck className="text-green-600" /> 6. Bảo Mật Thông Tin
            </h2>
            <div className="space-y-4 text-slate-700">
              <p>Chúng tôi cam kết bảo mật thông tin cá nhân của bạn theo Chính sách Bảo Mật. Thông tin của bạn sẽ:</p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Chỉ được sử dụng cho mục đích cung cấp dịch vụ</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Không được chia sẻ với bên thứ ba nếu không có sự đồng ý</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Được bảo vệ bằng các biện pháp an ninh tiên tiến</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 7. Giới Hạn Trách Nhiệm */}
          <section className="bg-white rounded-3xl p-8 md:p-12 border-2 border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <AlertCircle className="text-red-600" /> 7. Giới Hạn Trách Nhiệm
            </h2>
            <div className="space-y-4 text-slate-700">
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                  <span>Chúng tôi không chịu trách nhiệm cho các sự kiện bất khả kháng (thiên tai, chiến tranh, đình công...)</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                  <span>Không chịu trách nhiệm cho tài sản cá nhân bị mất/mất cắp</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                  <span>Không chịu trách nhiệm cho các chi phí phát sinh do khách hàng tự ý</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                  <span>Không chịu trách nhiệm cho các vấn đề sức khỏe của khách hàng</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 8. Giải Quyết Tranh Chấp */}
          <section className="bg-white rounded-3xl p-8 md:p-12 border-2 border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <MapPin className="text-blue-600" /> 8. Giải Quyết Tranh Chấp
            </h2>
            <div className="space-y-4 text-slate-700">
              <p>Mọi tranh chấp phát sinh sẽ được giải quyết theo quy trình sau:</p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Thương lượng và đàm phán giữa hai bên</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Nếu không giải quyết được, sẽ đưa ra Tòa án có thẩm quyền</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-1" />
                  <span>Áp dụng pháp luật Việt Nam</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 9. Liên Hệ */}
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <MapPin /> 9. Liên Hệ
            </h2>
            <div className="space-y-4">
              <p className="font-bold">Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <MapPin size={20} />
                  <span>Địa chỉ: 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
                </li>
                <li className="flex items-center gap-2">
                  <Users size={20} />
                  <span>Hotline: 1900 1234</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileText size={20} />
                  <span>Email: support@viettravel.com</span>
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
