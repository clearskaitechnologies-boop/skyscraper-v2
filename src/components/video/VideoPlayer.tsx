/**
 * Video Player Component for Demo Videos
 *
 * Supports:
 * - Local videos from /public/videos/
 * - YouTube embeds
 * - Vimeo embeds
 * - Autoplay, loop, controls customization
 */

"use client";

import { Maximize,Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";

interface VideoPlayerProps {
  src?: string; // Local video path (e.g., "/videos/intro.mp4")
  youtubeId?: string; // YouTube video ID
  vimeoId?: string; // Vimeo video ID
  poster?: string; // Thumbnail image
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  title?: string;
}

export default function VideoPlayer({
  src,
  youtubeId,
  vimeoId,
  poster,
  autoplay = false,
  loop = false,
  muted = false,
  controls = true,
  className = "",
  title = "Demo Video",
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(muted);

  // YouTube Embed
  if (youtubeId) {
    return (
      <div
        className={`relative aspect-video w-full overflow-hidden rounded-2xl shadow-2xl ${className}`}
      >
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}&loop=${loop ? 1 : 0}&controls=${controls ? 1 : 0}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  // Vimeo Embed
  if (vimeoId) {
    return (
      <div
        className={`relative aspect-video w-full overflow-hidden rounded-2xl shadow-2xl ${className}`}
      >
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=${autoplay ? 1 : 0}&muted=${muted ? 1 : 0}&loop=${loop ? 1 : 0}&controls=${controls ? 1 : 0}`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  // Local Video with HTML5
  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-2xl shadow-2xl ${className}`}
    >
      <video
        src={src}
        poster={poster}
        autoPlay={autoplay}
        loop={loop}
        muted={isMuted}
        controls={controls}
        playsInline
        className="h-full w-full object-cover"
      >
        Your browser does not support the video tag.
      </video>

      {/* Custom Play/Pause Overlay (optional) */}
      {!controls && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
          <button
            onClick={() => {
              const video = document.querySelector("video");
              if (video) {
                if (isPlaying) {
                  video.pause();
                } else {
                  video.play();
                }
                setIsPlaying(!isPlaying);
              }
            }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 text-white" />
            ) : (
              <Play className="h-8 w-8 text-white" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Usage Examples:
 *
 * // Local Video
 * <VideoPlayer src="/videos/intro.mp4" poster="/images/video-thumbnail.jpg" controls />
 *
 * // YouTube
 * <VideoPlayer youtubeId="dQw4w9WgXcQ" />
 *
 * // Vimeo
 * <VideoPlayer vimeoId="123456789" />
 *
 * // Autoplay, Muted, Loop
 * <VideoPlayer src="/videos/demo.mp4" autoplay muted loop />
 */
