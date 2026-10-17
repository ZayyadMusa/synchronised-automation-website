"use client";
import { useEffect, useRef } from "react";
export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    element.classList.add("reveal-wait");
    const observer = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { element.classList.remove("reveal-wait"); observer.disconnect(); } }, { threshold: 0.08 });
    observer.observe(element);
    return () => { observer.disconnect(); element.classList.remove("reveal-wait"); };
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}
