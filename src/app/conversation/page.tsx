"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  ArrowLeftRight,
  Loader2,
  MessageSquare,
  Trash2,
  Sparkles,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { SUPPORTED_LANGUAGES } from "@/lib/utils";
import { useTranslations } from "@/lib/use-translations";
import type { ConversationMessage } from "@/types";
import { generateId } from "@/lib/utils";

export default function ConversationPage() {
  const t = useTranslations({
    pageTitle: "Live Conversation Translator",
    pageSubtitle: "Real-time bilingual voice translation",
    personASpeaks: "Person A speaks",
    personBSpeaks: "Person B speaks",
    processingTranslation: "Processing translation...",
    conversationLabel: "Conversation",
    clearBtn: "Clear",
    emptyTitle: "Start the conversation",
    emptyDesc: "Press the mic button on either side to speak, or type a message to translate",
    originalLabel: "Original",
    translationLabel: "Translation",
    recordingLabel: "Recording...",
    tapToStop: "Tap to stop",
    tapToSpeak: "Tap to speak",
    typeToTranslate: "Or type to translate...",
  });
  const [langA, setLangA] = useState("en");
  const [langB, setLangB] = useState("ja");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isRecordingA, setIsRecordingA] = useState(false);
  const [isRecordingB, setIsRecordingB] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getLangName = (code: string) =>
    SUPPORTED_LANGUAGES.find((l) => l.code === code)?.name || code;

  const getLangFlag = (code: string) =>
    SUPPORTED_LANGUAGES.find((l) => l.code === code)?.flag || "";

  const startRecording = useCallback(
    async (side: "A" | "B") => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
          await processAudio(audioBlob, side);
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        if (side === "A") setIsRecordingA(true);
        else setIsRecordingB(true);
      } catch (err) {
        console.error("Microphone error:", err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [langA, langB]
  );

  const stopRecording = (side: "A" | "B") => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (side === "A") setIsRecordingA(false);
    else setIsRecordingB(false);
  };

  const processAudio = async (audioBlob: Blob, side: "A" | "B") => {
    setIsProcessing(true);
    const fromLang = side === "A" ? langA : langB;
    const toLang = side === "A" ? langB : langA;

    try {
      // Step 1: Transcribe
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("language", fromLang);

      const transcribeRes = await fetch("/api/speech/transcribe", {
        method: "POST",
        body: formData,
      });
      const { text: originalText } = await transcribeRes.json();

      if (!originalText) {
        setIsProcessing(false);
        return;
      }

      // Step 2: Translate
      const translateRes = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: originalText,
          fromLang: getLangName(fromLang),
          toLang: getLangName(toLang),
        }),
      });
      const { translation: translatedText } = await translateRes.json();

      const msg: ConversationMessage = {
        id: generateId(),
        role: side === "A" ? "user" : "local",
        originalText,
        translatedText,
        originalLang: fromLang,
        targetLang: toLang,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, msg]);
    } catch (err) {
      console.error("Processing error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextInput = async (text: string, side: "A" | "B") => {
    if (!text.trim()) return;
    setIsProcessing(true);
    const fromLang = side === "A" ? langA : langB;
    const toLang = side === "A" ? langB : langA;

    try {
      const translateRes = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          fromLang: getLangName(fromLang),
          toLang: getLangName(toLang),
        }),
      });
      const { translation: translatedText } = await translateRes.json();

      const msg: ConversationMessage = {
        id: generateId(),
        role: side === "A" ? "user" : "local",
        originalText: text,
        translatedText,
        originalLang: fromLang,
        targetLang: toLang,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, msg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = async (text: string, msgId: string) => {
    setPlayingId(msgId);
    try {
      const res = await fetch("/api/speech/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "nova" }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(url);
      audioRef.current.play();
      audioRef.current.onended = () => setPlayingId(null);
    } catch {
      setPlayingId(null);
    }
  };

  const swapLanguages = () => {
    setLangA(langB);
    setLangB(langA);
  };

  const langOptions = SUPPORTED_LANGUAGES.map((l) => ({
    value: l.code,
    label: `${l.flag} ${l.name}`,
  }));

  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(251,146,60,0.05),transparent)] pointer-events-none" />

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Mic size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t.pageTitle}</h1>
              <p className="text-white/50 text-sm">{t.pageSubtitle}</p>
            </div>
          </motion.div>

          {/* Language Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mb-6">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs text-white/40 mb-1.5 block">{t.personASpeaks}</label>
                  <Select value={langA} onValueChange={setLangA} options={langOptions} />
                </div>
                <button
                  onClick={swapLanguages}
                  className="mt-5 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                >
                  <ArrowLeftRight size={18} />
                </button>
                <div className="flex-1">
                  <label className="text-xs text-white/40 mb-1.5 block">{t.personBSpeaks}</label>
                  <Select value={langB} onValueChange={setLangB} options={langOptions} />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Conversation Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Person A */}
            <RecorderPanel
              side="A"
              label="Person A"
              language={langA}
              flag={getLangFlag(langA)}
              langName={getLangName(langA)}
              isRecording={isRecordingA}
              isDisabled={isRecordingB || isProcessing}
              onStartRecording={() => startRecording("A")}
              onStopRecording={() => stopRecording("A")}
              onTextSubmit={(text) => handleTextInput(text, "A")}
              color="from-sky-500 to-blue-600"
              recordingLabel={t.recordingLabel}
              tapToStop={t.tapToStop}
              tapToSpeak={t.tapToSpeak}
              typeToTranslate={t.typeToTranslate}
            />

            {/* Person B */}
            <RecorderPanel
              side="B"
              label="Person B"
              language={langB}
              flag={getLangFlag(langB)}
              langName={getLangName(langB)}
              isRecording={isRecordingB}
              isDisabled={isRecordingA || isProcessing}
              onStartRecording={() => startRecording("B")}
              onStopRecording={() => stopRecording("B")}
              onTextSubmit={(text) => handleTextInput(text, "B")}
              color="from-violet-500 to-purple-600"
              recordingLabel={t.recordingLabel}
              tapToStop={t.tapToStop}
              tapToSpeak={t.tapToSpeak}
              typeToTranslate={t.typeToTranslate}
            />
          </div>

          {/* Processing indicator */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-center gap-3 py-4 mb-4 rounded-2xl bg-orange-500/10 border border-orange-500/20"
              >
                <Loader2 size={16} className="animate-spin text-orange-400" />
                <span className="text-orange-400 text-sm font-medium">
                  {t.processingTranslation}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conversation History */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-white/40" />
                <h3 className="font-semibold text-white">{t.conversationLabel}</h3>
                {messages.length > 0 && (
                  <Badge variant="outline">{messages.length}</Badge>
                )}
              </div>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 size={12} />
                  {t.clearBtn}
                </button>
              )}
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Radio size={28} className="text-white/20" />
                </div>
                <h3 className="text-white/40 font-medium mb-2">{t.emptyTitle}</h3>
                <p className="text-white/25 text-sm max-w-xs mx-auto">
                  {t.emptyDesc}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[85%] ${
                          msg.role === "user"
                            ? "bg-sky-500/10 border border-sky-500/20"
                            : "bg-violet-500/10 border border-violet-500/20"
                        } rounded-2xl p-4`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-2">
                            <span className="text-xs text-white/40">
                              {getLangFlag(msg.originalLang)} {t.originalLabel}
                            </span>
                          <span className="text-xs text-white/30">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-white/70 mb-3">{msg.originalText}</p>

                        <div className="border-t border-white/10 pt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-white/40">
                              {getLangFlag(msg.targetLang)} {t.translationLabel}
                            </span>
                            <button
                              onClick={() => playAudio(msg.translatedText, msg.id)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
                            >
                              {playingId === msg.id ? (
                                <Loader2 size={12} className="animate-spin text-orange-400" />
                              ) : (
                                <Volume2 size={12} />
                              )}
                            </button>
                          </div>
                          <p className="text-base text-white font-medium">{msg.translatedText}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface RecorderPanelProps {
  side: "A" | "B";
  label: string;
  language: string;
  flag: string;
  langName: string;
  isRecording: boolean;
  isDisabled: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTextSubmit: (text: string) => void;
  color: string;
  recordingLabel: string;
  tapToStop: string;
  tapToSpeak: string;
  typeToTranslate: string;
}

function RecorderPanel({
  label,
  flag,
  langName,
  isRecording,
  isDisabled,
  onStartRecording,
  onStopRecording,
  onTextSubmit,
  color,
  recordingLabel,
  tapToStop,
  tapToSpeak,
  typeToTranslate,
}: RecorderPanelProps) {
  const [textInput, setTextInput] = useState("");

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold`}
        >
          {flag}
        </div>
        <div>
          <div className="font-semibold text-white text-sm">{label}</div>
          <div className="text-xs text-white/40">{langName}</div>
        </div>
        {isRecording && (
          <Badge variant="danger" className="ml-auto animate-pulse">
            {recordingLabel}
          </Badge>
        )}
      </div>

      {/* Mic Button */}
      <div className="flex justify-center">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={isDisabled && !isRecording}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
            isRecording
              ? "bg-red-500 shadow-red-500/40 animate-pulse"
              : `bg-gradient-to-br ${color} shadow-sky-500/20`
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isRecording ? (
            <MicOff size={28} className="text-white" />
          ) : (
            <Mic size={28} className="text-white" />
          )}
        </motion.button>
      </div>

      <div className="text-center text-xs text-white/40">
        {isRecording ? tapToStop : tapToSpeak}
      </div>

      {/* Text Input Alternative */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={typeToTranslate}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && textInput.trim()) {
                onTextSubmit(textInput);
                setTextInput("");
              }
            }}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/25 transition-colors"
          />
          <button
            onClick={() => {
              if (textInput.trim()) {
                onTextSubmit(textInput);
                setTextInput("");
              }
            }}
            disabled={!textInput.trim()}
            className={`p-2 rounded-xl bg-gradient-to-br ${color} text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-opacity`}
          >
            <Sparkles size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
}
