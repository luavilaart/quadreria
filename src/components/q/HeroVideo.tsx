import { useEffect, useRef } from "react";

/**
 * Home banner: rooms through history, with the quadreria wordmark baked into the video.
 * Shown at its true 1536 × 424 shape at every width so the wordmark is never cropped.
 * - Phones get a 768px-wide file; wider screens get the full 1536px one.
 * - The still poster shows until the video plays, and stays for reduced motion.
 * - Playback starts only after hydration, and pauses while the banner is off screen.
 */
export function HeroVideo({ label }: { label: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    const sync = () => {
      if (reduce.matches || !visible) video.pause();
      else void video.play().catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => { visible = !!entry?.isIntersecting; sync(); });
    observer.observe(video);
    reduce.addEventListener("change", sync);
    sync();
    return () => { observer.disconnect(); reduce.removeEventListener("change", sync); };
  }, []);

  return (
    <section className="bg-ink">
      <h1 className="sr-only">{label}</h1>
      <div className="relative mx-auto aspect-[1536/424] w-full max-w-[1920px] overflow-hidden">
        <video
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          poster="/hero/rooms-poster.webp"
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
        >
          <source src="/hero/rooms-768.webm" type="video/webm" media="(max-width: 767px)" />
          <source src="/hero/rooms-768.mp4" type="video/mp4" media="(max-width: 767px)" />
          <source src="/hero/rooms-1536.webm" type="video/webm" />
          <source src="/hero/rooms-1536.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
