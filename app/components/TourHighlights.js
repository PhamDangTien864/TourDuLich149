import { Sparkles, Star } from 'lucide-react';

export default function TourHighlights({ highlights }) {
  if (!highlights) return null;

  // Parse highlights - can be JSON array or newline-separated string
  let highlightList = [];
  try {
    highlightList = JSON.parse(highlights);
  } catch {
    // If not JSON, split by newlines
    highlightList = highlights.split('\n').filter(h => h.trim());
  }

  if (!highlightList || highlightList.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[40px] p-8 md:p-12 border border-amber-100">
      <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-amber-700">
        <Sparkles className="text-amber-600" size={28} />
        Điểm nhấn hành trình
      </h3>
      <div className="space-y-4">
        {highlightList.map((highlight, idx) => (
          <div 
            key={idx} 
            className="flex items-start gap-4 bg-white p-5 rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Star size={16} className="text-white fill-white" />
            </div>
            <p className="font-bold text-slate-800 leading-relaxed">{highlight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
