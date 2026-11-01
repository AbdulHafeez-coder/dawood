import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { StoreImage } from "./StoreImage";
import "./product-gallery.css";

export function ProductGallery({
  images,
  video,
  name,
}: {
  images: string[];
  video?: string | null;
  name: string;
}) {
  const photos = [...new Set(images.map((s) => s?.trim()).filter(Boolean))];
  const slides = [
    ...photos.map((src) => ({ src, video: false })),
    ...(video ? [{ src: video, video: true }] : []),
  ];
  const [active, setActive] = useState(0),
    [shown, setShown] = useState(0);
  const [paused, setPaused] = useState(false),
    [hover, setHover] = useState(false),
    [focus, setFocus] = useState(false),
    [touching, setTouching] = useState(false);
  const [reduced, setReduced] = useState(true),
    [visible, setVisible] = useState(true);
  const loaded = useRef(new Set<number>()),
    pointer = useRef<{ x: number; y: number } | null>(null);
  const slide = slides[active] || slides[0];
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReduced(media.matches),
      visibility = () => setVisible(!document.hidden);
    motion();
    visibility();
    media.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      media.removeEventListener("change", motion);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  function select(index: number) {
    const next = (index + slides.length) % slides.length;
    setActive(next);
    if (loaded.current.has(next)) setShown(next);
  }
  useEffect(() => {
    if (
      photos.length < 2 ||
      paused ||
      hover ||
      focus ||
      touching ||
      reduced ||
      !visible ||
      slide?.video
    )
      return;
    // Autoplay visits images only. Videos are explicitly selected, never interrupted.
    const timer = setTimeout(() => {
      const next = (active + 1) % photos.length;
      setActive(next);
      if (loaded.current.has(next)) setShown(next);
    }, 3500);
    return () => clearTimeout(timer);
  }, [active, photos.length, paused, hover, focus, touching, reduced, visible, slide?.video]);
  if (!slides.length)
    return (
      <div className="dm-gallery">
        <StoreImage src="" alt={name} />
      </div>
    );
  return (
    <section
      className="dm-gallery"
      aria-label="Product gallery"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHover(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setHover(false);
      }}
      onFocusCapture={() => setFocus(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false);
      }}
    >
      <div
        className="dm-main-image dm-gallery-stage"
        style={{ touchAction: "pan-y" }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") {
            pointer.current = { x: e.clientX, y: e.clientY };
            setTouching(true);
          }
        }}
        onPointerUp={(e) => {
          const start = pointer.current;
          pointer.current = null;
          setTouching(false);
          if (start && !slide.video) {
            const dx = e.clientX - start.x,
              dy = e.clientY - start.y;
            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3)
              select(active + (dx < 0 ? 1 : -1));
          }
        }}
        onPointerCancel={() => {
          pointer.current = null;
          setTouching(false);
        }}
      >
        {photos.map((src, index) => (
          <StoreImage
            key={src}
            src={src}
            alt={index === active && !slide.video ? name : ""}
            className={`dm-gallery-photo ${!slide.video && index === shown ? "is-visible" : ""}`}
            aria-hidden={slide.video || index !== shown}
            sizes="(max-width:767px) 100vw, 55vw"
            loading={index === active || index === (active + 1) % photos.length ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            onLoad={() => {
              loaded.current.add(index);
              if (index === active) setShown(index);
            }}
            onError={() => {
              loaded.current.add(index);
              if (index === active) setShown(index);
            }}
          />
        ))}
        {slide.video && (
          <video
            key={slide.src}
            src={slide.src}
            controls
            playsInline
            preload="metadata"
            poster={photos[0]}
            className="dm-gallery-video"
          >
            Your browser does not support video.
          </video>
        )}
        {slides.length > 1 && (
          <>
            <button
              className="dm-gallery-arrow dm-gallery-prev"
              aria-label="Previous image or video"
              onClick={() => select(active - 1)}
            >
              <ChevronLeft />
            </button>
            <button
              className="dm-gallery-arrow dm-gallery-next"
              aria-label="Next image or video"
              onClick={() => select(active + 1)}
            >
              <ChevronRight />
            </button>
          </>
        )}
      </div>
      <div className="dm-gallery-controls">
        <span>
          {active + 1} / {slides.length}
        </span>
        {photos.length > 1 && !reduced && (
          <button
            aria-label={paused ? "Enable gallery autoplay" : "Pause gallery autoplay"}
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
            {paused ? "Autoplay off" : "Autoplay on"}
          </button>
        )}
      </div>
      <div className="dm-thumbnails">
        {slides.map((s, index) => (
          <button
            key={s.src + s.video}
            aria-label={s.video ? "View product video" : `View image ${index + 1}`}
            aria-pressed={active === index}
            className={active === index ? "is-active" : ""}
            onClick={() => select(index)}
          >
            {s.video ? (
              <span className="dm-gallery-video-thumb">
                <Play size={20} />
                Video
              </span>
            ) : (
              <StoreImage src={s.src} alt="" sizes="72px" loading="lazy" />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
