"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

function isInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight - 24 && rect.bottom > 24;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => {
      el.dataset.visible = "true";
    };

    el.dataset.animate = "true";

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      show();
      return;
    }

    if (isInViewport(el)) {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show();
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);

    const fallback = window.setTimeout(show, 1200);

    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      data-visible="true"
      className={cn("editorial-reveal", className)}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  staggerMs?: number;
}

export function StaggerReveal({
  children,
  className,
  staggerMs = 80,
}: StaggerRevealProps) {
  return (
    <div
      className={cn("editorial-stagger", className)}
      style={{ "--stagger": `${staggerMs}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
