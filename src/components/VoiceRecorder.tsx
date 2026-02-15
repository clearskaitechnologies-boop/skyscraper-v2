import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  relatedType: "lead" | "claim";
  relatedId: string;
  onSaved?: (res: any) => void;
};

export default function VoiceRecorder({ relatedType, relatedId, onSaved }: Props) {
  const [recording, setRecording] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [seconds, setSeconds] = useState(0);
  const timer = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.current.push(e.data);
      };
      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setMediaUrl(url);
        await upload(blob);
      };
      mediaRecorder.current.start();
      setRecording(true);
      setSeconds(0);
      timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (e) {
      console.error("mic error", e);
      alert("Unable to access microphone");
    }
  }

  function stop() {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive")
      mediaRecorder.current.stop();
    setRecording(false);
    clearInterval(timer.current);
  }

  function cancel() {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive")
      mediaRecorder.current.stop();
    setRecording(false);
    clearInterval(timer.current);
    chunks.current = [];
    setMediaUrl(null);
  }

  async function upload(blob: Blob) {
    setBusy(true);
    try {
      const filename = `${relatedType}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.webm`;
      const file = new File([blob], filename, { type: blob.type });
      const { error: upErr } = await supabase.storage
        .from("voice-notes")
        .upload(filename, file, { upsert: true });
      if (upErr) throw upErr;

      // POST metadata to server-side API for DB insert (server will create signed playback URL)
      const session = (await supabase.auth.getSession()).data.session;
      const user = session?.user;
      const body = {
        userId: user?.id,
        orgId: (
          await supabase
            .from("user_profiles")
            .select("org_id")
            .eq("user_id", user?.id || "")
            .maybeSingle()
        ).data?.org_id,
        relatedType,
        relatedId,
        storagePath: filename,
        durationSeconds: seconds,
      };

      const resp = await fetch("/api/voice-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify(body),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "upload failed");
      onSaved?.(json);
      alert("Voice note saved");
    } catch (e: any) {
      console.error("upload failed", e);
      alert(e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="voice-recorder">
      <div className="flex items-center gap-2">
        {!recording ? (
          <Button onClick={start} disabled={busy} variant="default" size="sm">Start Recording</Button>
        ) : (
          <>
            <Button onClick={stop} variant="destructive" size="sm">Stop</Button>
            <Button onClick={cancel} variant="outline" size="sm">Cancel</Button>
            <span className="ml-2">{seconds}s</span>
          </>
        )}
      </div>

      {mediaUrl && (
        <div className="mt-2">
          <audio src={mediaUrl} controls />
        </div>
      )}
    </div>
  );
}
