/**
 * 🔥 PHASE C: QOL - Copy to Clipboard Utility
 */

import { toast } from "@/components/ui/use-toast";

export async function copyToClipboard(text: string, label?: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: label ? `${label} copied to clipboard` : "Content copied to clipboard",
    });
    return true;
  } catch (error) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      
      toast({
        title: "Copied!",
        description: label ? `${label} copied to clipboard` : "Content copied to clipboard",
      });
      return true;
    } catch (fallbackError) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
      return false;
    }
  }
}

// CopyButton component should be in a .tsx file, not .ts
// For now, export only the utility function
