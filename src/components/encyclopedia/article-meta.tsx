"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(
      `${window.location.origin}${url}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        aria-label={copied ? "Link copied to clipboard" : "Copy link to this article"}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" aria-hidden="true" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" aria-hidden="true" />
            Copy link
          </>
        )}
      </Button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </>
  );
}

export function ArticleMetaBar({
  readingTime,
  lastReviewed,
  difficulty,
  url,
}: {
  readingTime: string;
  lastReviewed?: string;
  difficulty?: string;
  url: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
      <span>{readingTime}</span>
      {difficulty && (
        <>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{difficulty}</span>
        </>
      )}
      {lastReviewed && (
        <>
          <span aria-hidden="true">·</span>
          <span>Reviewed {lastReviewed}</span>
        </>
      )}
      <CopyLinkButton url={url} />
    </div>
  );
}
