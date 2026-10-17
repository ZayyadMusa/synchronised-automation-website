"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import styles from "./hero-security-video.module.css";

export function HeroSecurityVideo() {
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [paused, setPaused] = useState(false);
  const [manualPlayback, setManualPlayback] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const stage = useRef<HTMLButtonElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(entries => setVisible(entries[0]?.isIntersecting ?? false), { threshold: 0.15 });
    if (stage.current) observer.observe(stage.current);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    let cancelled = false;
    if (visible && pageVisible && !paused && (!reducedMotion || manualPlayback) && !videoError) {
      element.play().catch(() => { if (!cancelled) setPlaying(false); });
    } else {
      element.pause();
    }
    return () => { cancelled = true; element.pause(); };
  }, [visible, pageVisible, paused, reducedMotion, manualPlayback, videoError]);

  function toggleVideo() {
    if (video.current && !video.current.paused) {
      video.current?.pause();
      setPaused(true);
      setManualPlayback(false);
    } else {
      setPaused(false);
      setManualPlayback(true);
      video.current?.play().catch(() => setPlaying(false));
    }
  }

  return (
    <section className={styles.gallery} aria-label="Smart security video">
      <button ref={stage} type="button" className={styles.stage} onClick={toggleVideo} disabled={videoError} aria-label={playing ? "Pause security video" : "Play security video"}>
        {videoError ? <img className={styles.film} src="/images/smart-security-poster.webp" width="1920" height="1080" alt="Aqara security camera demonstration" /> : <video ref={video} className={styles.film} width="1920" height="1080" poster="/images/smart-security-poster.webp" preload="none" muted loop playsInline onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setVideoError(true); setPlaying(false); }} aria-label="Aqara Camera Hub G5 Pro product demonstration">
          <source src="/videos/smart-security-aqara.webm" type="video/webm; codecs=vp9" />
          <source src="/videos/smart-security-aqara.mp4" type="video/mp4" />
          Your browser can display the still image of this security camera demonstration.
        </video>}
      </button>
      <div className={styles.rail + " wrap"}>
        <div className={styles.caption}><strong>Security, around your space.</strong><span>Aqara camera demonstration</span></div>
        <div className={styles.actions}>
          <a className={styles.destination} href="/solutions#security">Explore smart security<ArrowRight size={18} aria-hidden="true" /></a>
        </div>
      </div>
      {videoError && <p className={styles.error + " wrap"} role="status">The video could not load. The security camera image is shown instead.</p>}
    </section>
  );
}
