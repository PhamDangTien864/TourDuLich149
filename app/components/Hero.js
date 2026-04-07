export default function Hero() {
  return (
    <section className="relative h-[500px] flex items-center justify-center text-white">
      <div className="absolute inset-0 bg-black/40 z-10"></div>
      <img 
        src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1600" 
        className="absolute inset-0 w-full h-full object-cover" 
        alt="Vietnam Travel"
      />
      <div className="relative z-20 text-center px-4">
        <h1 className="text-5xl font-extrabold mb-4 shadow-sm">Website Đặt Tour Du Lịch</h1>
        <p className="text-xl mb-8 opacity-90">Chào mừng bạn đến với hệ thống đặt tour hàng đầu Việt Nam</p>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-lg">
          Khám phá ngay
        </button>
      </div>
    </section>
  );
}