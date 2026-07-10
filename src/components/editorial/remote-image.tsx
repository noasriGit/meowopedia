"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import {
  optimizeRemoteImageUrl,
  shouldBypassImageOptimizer,
  wikimediaCanonicalUrl,
} from "@/lib/images/optimize-url";

type RemoteImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

/**
 * Loads remote encyclopedia images directly from the source CDN (unoptimized)
 * with an automatic fallback from thumb → full URL when Wikimedia rejects a thumb.
 */
export function RemoteImage({ src, onError, ...props }: RemoteImageProps) {
  const canonical = wikimediaCanonicalUrl(src) ?? src;
  const [displaySrc, setDisplaySrc] = useState(() =>
    optimizeRemoteImageUrl(canonical)
  );

  const handleError: NonNullable<ImageProps["onError"]> = (event) => {
    if (displaySrc !== canonical) {
      setDisplaySrc(canonical);
      return;
    }
    onError?.(event);
  };

  return (
    <Image
      {...props}
      src={displaySrc}
      unoptimized={shouldBypassImageOptimizer(displaySrc)}
      onError={handleError}
    />
  );
}
