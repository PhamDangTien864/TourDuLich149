import Image from 'next/image';

export default function Hero({ 
  title = "Website Đặt Tour Du Lịch", 
  subTitle = "Chào mừng bạn đến với hệ thống đặt tour hàng đầu Việt Nam",
  imageUrl = "https://images.pexels.com/photos/161251/sen-lake-flower-nature-161251.jpeg?auto=compress&cs=tinysrgb&w=1600" 
}) {
  return (
    <section className="relative h-[500px] flex items-center justify-center text-white">
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      <Image 
        src={imageUrl} 
        className="absolute inset-0 w-full h-full object-cover" 
        alt={title}
        fill
        priority
        sizes="100vw"
      />
      <div className="relative z-20 text-center px-4">
        <h1 className="text-5xl font-extrabold mb-4 shadow-lg">{title}</h1>
        <p className="text-xl mb-8 opacity-90">{subTitle}</p>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-lg">
          Khám phá ngay
        </button>
      </div>
    </section>
  );
}