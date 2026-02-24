"use client";

import { useEffect } from "react";

const UNICORN_PROJECT_ID = "VaqT3bxlc2sugR8faApF";
const UNICORN_SCRIPT_SRC =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js";
const UNICORN_MASK =
  "linear-gradient(to bottom, rgba(0,0,0,0) 0%, black 12%, black 88%, rgba(0,0,0,0) 100%)";

declare global {
  interface Window {
    UnicornStudio?: {
      init?: () => void;
      isInitialized?: boolean;
    };
  }
}

export function UnicornBackground() {
  useEffect(() => {
    let isUnmounted = false;

    const initUnicorn = () => {
      if (isUnmounted || !window.UnicornStudio || window.UnicornStudio.isInitialized) {
        return;
      }

      window.UnicornStudio.init?.();
      window.UnicornStudio.isInitialized = true;
    };

    if (!window.UnicornStudio) {
      window.UnicornStudio = { isInitialized: false };
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${UNICORN_SCRIPT_SRC}"]`,
    );
    if (existing) {
      if (window.UnicornStudio.init) {
        initUnicorn();
      } else {
        existing.addEventListener("load", initUnicorn, { once: true });
      }
    } else {
      const script = document.createElement("script");
      script.src = UNICORN_SCRIPT_SRC;
      script.async = true;
      script.onload = initUnicorn;
      document.head.appendChild(script);
    }

    return () => {
      isUnmounted = true;
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          maskImage: UNICORN_MASK,
          WebkitMaskImage: UNICORN_MASK,
        }}
      >
        <div className="absolute inset-0 z-10 bg-[#02120e]/80 mix-blend-multiply" />
        <div
          data-us-project={UNICORN_PROJECT_ID}
          className="absolute inset-0 h-full w-full grayscale opacity-60"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(212,165,116,0.2),transparent_45%),radial-gradient(circle_at_88%_0%,rgba(27,77,62,0.35),transparent_52%)]" />
      </div>
    </div>
  );
}
