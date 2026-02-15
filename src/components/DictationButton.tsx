import { Mic, Square, Trash2 } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useDictation } from "@/hooks/useDictation";

interface DictationButtonProps {
  onAppend: (text: string) => void;
  label?: string;
  lang?: string;
}

export function DictationButton({
  onAppend,
  label = "Dictate",
  lang = "en-US",
}: DictationButtonProps) {
  const { supported, listening, text, start, stop, reset } = useDictation({ lang });

  useEffect(() => {
    if (text) {
      onAppend(text);
    }
  }, [text, onAppend]);

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2">
      {!listening ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={start}
          aria-label="Start dictation"
        >
          <Mic className="mr-2 h-4 w-4" />
          {label}
        </Button>
      ) : (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={stop}
            aria-label="Stop dictation"
          >
            <Square className="mr-2 h-4 w-4" />
            Stop
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={reset}
            aria-label="Clear dictated text"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </>
      )}
    </div>
  );
}
