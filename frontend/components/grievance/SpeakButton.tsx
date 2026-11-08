"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { synthesizeSpeech } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const audioCache = new Map<string, string>();
let activeAudio: HTMLAudioElement | null = null;

/** Optional speech output; failure never hides or changes the associated text. */
export function SpeakButton({ text, language, label }: { text: string; language: string; label?: string }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function play() {
    if (busy || !text.trim()) return;
    setError(false);
    setBusy(true);
    try {
      const key = `${language}\0${text}`;
      let url = audioCache.get(key);
      if (!url) {
        url = URL.createObjectURL(await synthesizeSpeech(text, language));
        audioCache.set(key, url);
        if (audioCache.size > 32) {
          const oldest = audioCache.keys().next().value;
          if (oldest) {
            const staleUrl = audioCache.get(oldest);
            if (staleUrl) URL.revokeObjectURL(staleUrl);
            audioCache.delete(oldest);
          }
        }
      }
      audioCache.delete(key);
      audioCache.set(key, url);
      activeAudio?.pause();
      if (activeAudio) activeAudio.currentTime = 0;
      const audio = new Audio(url);
      activeAudio = audio;
      audio.onended = () => {
        if (activeAudio === audio) activeAudio = null;
      };
      audio.onerror = () => {
        if (activeAudio === audio) activeAudio = null;
        setError(true);
      };
      await audio.play();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return <span className="inline-flex items-center gap-2">
    <button type="button" onClick={() => void play()} disabled={busy || !text.trim()} aria-label={label} aria-busy={busy}
      className="inline-flex items-center gap-1 rounded-md border border-ink-200 px-2 py-1 text-xs font-semibold text-ink-700 hover:bg-ink-50 disabled:opacity-60">
      <Volume2 size={14} aria-hidden="true" />{busy ? t("speechPreparing") : label ?? t("speechListenTranscript")}
    </button>
    {error && <span role="status" aria-live="polite" className="text-xs text-ink-500">{t("speechUnavailable")}</span>}
  </span>;
}
