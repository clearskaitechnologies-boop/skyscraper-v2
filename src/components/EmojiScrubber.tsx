"use client";
import { useEffect } from "react";

// Runtime DOM scrubber to remove standalone emoji characters from text nodes in app pages.
// Targets pictographic Unicode range. Skips any element marked with data-allow-emoji.
export default function EmojiScrubber() {
  useEffect(() => {
    const emojiRegex = /[\p{Extended_Pictographic}]/gu;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const toClean: Text[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const parent = node.parentElement;
      if (!parent) continue;
      if (parent.closest('[data-allow-emoji]')) continue;
      if (emojiRegex.test(node.textContent || "")) {
        toClean.push(node);
      }
    }
    toClean.forEach(t => {
      if (!t.textContent) return;
      t.textContent = t.textContent
        .replace(emojiRegex, "")
        .replace(/\s{2,}/g, " ")
        .trim();
    });
  }, []);
  return null;
}
