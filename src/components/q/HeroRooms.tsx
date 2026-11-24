import { Wordmark } from "@/components/q/Wordmark";

/**
 * Home hero: a looping sequence of art rooms with the wordmark in Wall cream on top.
 * Reduced motion: the video is hidden and the poster still shows instead.
 */
export function HeroRooms() {
  return (
    <section className="relative isolate h-[clamp(15rem,36vw,30rem)] w-full overflow-hidden bg-ink">
      <img
        src="/hero/hero-rooms-poster.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <video
        className="absolute inset-0 -z-10 h-full w-full object-cover motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/hero/hero-rooms-poster.jpg"
        aria-hidden
      >
        <source src="/hero/hero-rooms.webm" type="video/webm" />
        <source src="/hero/hero-rooms.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 -z-10 bg-ink/30" aria-hidden />
      <div className="flex h-full items-center justify-center px-5">
        <h1 className="m-0">
          <Wordmark className="text-wall text-[clamp(3rem,11vw,8.5rem)] [text-shadow:0_3px_14px_rgb(31_27_22/0.45)]" />
        </h1>
      </div>
    </section>
  );
}
