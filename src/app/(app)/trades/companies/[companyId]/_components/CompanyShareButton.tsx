"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface CompanyShareButtonProps {
  url: string;
  title: string;
}

export default function CompanyShareButton({ url, title }: CompanyShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Copy to clipboard first
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Open native share sheet if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} | SkaiScraper`,
          text: `Check out ${title} on SkaiScraper`,
          url,
        });
      } catch {
        // User cancelled - link is already copied
      }
    }
  };

  return (
    <Button variant="outline" className="gap-2" onClick={handleShare}>
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          Link Copied!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          Share
        </>
      )}
    </Button>
  );
}
