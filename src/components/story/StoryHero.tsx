"use client";

export default function StoryHero() {
  return (
    <section className="flex w-full flex-col items-center px-6 pb-16 pt-24 text-center">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300">
        <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
        Origin Story
      </div>

      <h1 className="max-w-4xl text-5xl font-bold text-white drop-shadow-xl md:text-6xl">
        The SkaiScraper Story
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-gray-300 md:text-xl">
        How a survivor of storms built the platform that ends them.
      </p>

      <div className="mt-12 w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
        {/* VIDEO — Replace with YouTube embed or local file */}
        {/* Option 1: Local MP4 */}
        {/* <video
          src="/videos/intro.mp4"
          controls
          playsInline
          className="w-full"
          poster="/images/video-poster.jpg"
        /> */}

        {/* Option 2: YouTube Embed */}
        {/* <iframe
          src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
          className="w-full aspect-video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        /> */}

        {/* Placeholder until video is ready */}
        <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-blue-600/20 to-purple-600/20">
          <div className="text-center">
            <div className="mb-4 text-6xl">🎬</div>
            <p className="text-lg font-semibold text-white">Founder Video Coming Soon</p>
            <p className="mt-2 text-sm text-gray-400">The complete origin story</p>
          </div>
        </div>
      </div>
    </section>
  );
}
