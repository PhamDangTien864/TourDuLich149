import { Calendar, Umbrella, Sun, Cloud, Snowflake, Shirt, Backpack, Camera, HeartPulse, CheckCircle } from 'lucide-react';

export default function PreparationTips({ tips }) {
  if (!tips) return null;

  let tipsData = {};
  try {
    tipsData = JSON.parse(tips);
  } catch {
    // If not JSON, treat as simple text
    return (
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-[40px] p-8 md:p-12 border border-teal-100">
        <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-teal-700">
          <Backpack className="text-teal-600" size={28} />
          Chuẩn bị hành trang
        </h3>
        <p className="text-slate-700 leading-relaxed">{tips}</p>
      </div>
    );
  }

  const { best_time, difficulty, packing_list, weather_note } = tipsData;

  const getWeatherIcon = (note) => {
    const lower = note?.toLowerCase() || '';
    if (lower.includes('mưa') || lower.includes('dông')) return <Umbrella size={20} className="text-blue-500" />;
    if (lower.includes('nóng') || lower.includes('hè') || lower.includes('nắng')) return <Sun size={20} className="text-orange-500" />;
    if (lower.includes('lạnh') || lower.includes('đông') || lower.includes('mùa đông')) return <Snowflake size={20} className="text-cyan-500" />;
    return <Cloud size={20} className="text-slate-500" />;
  };

  const getDifficultyColor = (level) => {
    const lower = level?.toLowerCase() || '';
    if (lower.includes('dễ') || lower.includes('easy')) return 'bg-green-500';
    if (lower.includes('trung bình') || lower.includes('medium')) return 'bg-yellow-500';
    if (lower.includes('khó') || lower.includes('hard')) return 'bg-red-500';
    return 'bg-blue-500';
  };

  const getPackingIcon = (item) => {
    const lower = item?.toLowerCase() || '';
    if (lower.includes('áo') || lower.includes('quần') || lower.includes('trang phục')) return <Shirt size={16} className="text-purple-500" />;
    if (lower.includes('máy ảnh') || lower.includes('camera') || lower.includes('điện thoại')) return <Camera size={16} className="text-blue-500" />;
    if (lower.includes('thuốc') || lower.includes('y tế') || lower.includes('sức khỏe')) return <HeartPulse size={16} className="text-red-500" />;
    return <CheckCircle size={16} className="text-green-500" />;
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-[40px] p-8 md:p-12 border border-teal-100">
      <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-teal-700">
        <Backpack className="text-teal-600" size={28} />
        Chuẩn bị hành trang & Thời tiết
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Best Time */}
        {best_time && (
          <div className="bg-white p-6 rounded-2xl border border-teal-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="text-teal-600" size={20} />
              <h4 className="font-black text-slate-800">Thời điểm lý tưởng</h4>
            </div>
            <p className="text-slate-600 font-bold">{best_time}</p>
          </div>
        )}

        {/* Difficulty */}
        {difficulty && (
          <div className="bg-white p-6 rounded-2xl border border-teal-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-5 h-5 rounded ${getDifficultyColor(difficulty)}`} />
              <h4 className="font-black text-slate-800">Độ khó</h4>
            </div>
            <p className="text-slate-600 font-bold">{difficulty}</p>
          </div>
        )}

        {/* Weather */}
        {weather_note && (
          <div className="bg-white p-6 rounded-2xl border border-teal-200 shadow-sm md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              {getWeatherIcon(weather_note)}
              <h4 className="font-black text-slate-800">Thông tin thời tiết</h4>
            </div>
            <p className="text-slate-600 font-bold">{weather_note}</p>
          </div>
        )}

        {/* Packing List */}
        {packing_list && Array.isArray(packing_list) && packing_list.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-teal-200 shadow-sm md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Backpack className="text-teal-600" size={20} />
              <h4 className="font-black text-slate-800">Danh sách cần mang</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {packing_list.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-teal-50 px-3 py-2 rounded-xl">
                  {getPackingIcon(item)}
                  <span className="text-sm font-bold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
