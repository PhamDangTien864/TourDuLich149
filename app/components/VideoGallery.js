import { Play, Video } from 'lucide-react'; // <-- Đã thay Youtube thành Video

export default function VideoGallery({ videoUrl, tourTitle }) {
  if (!videoUrl) return null;

  // Parse YouTube URL
  const getYouTubeEmbedUrl = (url) => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  // Parse TikTok URL
  const getTikTokEmbedUrl = (url) => {
    const tiktokRegex = /tiktok\.com\/@[\w.-]+\/video\/(\d+)/;
    const match = url.match(tiktokRegex);
    return match ? `https://www.tiktok.com/embed/v2/${match[1]}` : null;
  };

  // Check if it's a direct video URL
  const isDirectVideo = (url) => {
    return url.match(/\.(mp4|webm|ogg)$/i);
  };

  const youtubeEmbed = getYouTubeEmbedUrl(videoUrl);
  const tiktokEmbed = getTikTokEmbedUrl(videoUrl);
  const isDirect = isDirectVideo(videoUrl);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-[40px] p-8 md:p-12 border border-purple-100">
      <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-purple-700">
        <Play className="text-purple-600" size={28} />
        Video trải nghiệm thực tế
      </h3>
      
      <div className="relative rounded-[32px] overflow-hidden shadow-2xl bg-black">
        {/* YouTube Embed - 16:9 aspect ratio */}
        {youtubeEmbed && (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={youtubeEmbed}
              title={tourTitle}
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* TikTok Embed - 9:16 aspect ratio */}
        {tiktokEmbed && (
          <div className="relative w-full" style={{ paddingBottom: '177.78%' }}>
            <iframe
              src={tiktokEmbed}
              title={tourTitle}
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Direct Video - 16:9 aspect ratio */}
        {isDirect && (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <video
              src={videoUrl}
              controls
              className="absolute top-0 left-0 w-full h-full object-cover"
              title={tourTitle}
            />
          </div>
        )}

        {/* Fallback for unsupported URLs */}
        {!youtubeEmbed && !tiktokEmbed && !isDirect && (
          <div className="aspect-[16/9] flex items-center justify-center bg-slate-900 p-8">
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white text-slate-900 px-6 py-4 rounded-2xl font-black hover:bg-purple-100 transition-all"
            >
              <Video size={24} />
              Xem video trên nền tảng gốc
            </a>
          </div>
        )}
      </div>

      <p className="mt-4 text-sm font-bold text-slate-600 text-center">
        🎬 Video giới thiệu tour
      </p>
    </div>
  );
}