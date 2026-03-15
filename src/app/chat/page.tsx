"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  Loader2,
  MapPin,
  Sparkles,
  User,
  Bot,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";
import { useTranslations } from "@/lib/use-translations";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  { destination: "Tokyo", question: "Is Tokyo expensive for tourists?" },
  { destination: "Paris", question: "Best cafes near the Eiffel Tower?" },
  { destination: "Paris", question: "How do I use the Paris Metro?" },
  { destination: "Bali", question: "What are the cultural etiquette rules in Bali?" },
  { destination: "New York", question: "Cheapest way to get from JFK to Manhattan?" },
  { destination: "Bangkok", question: "Is street food in Bangkok safe to eat?" },
  { destination: "Rome", question: "What should I avoid doing as a tourist in Rome?" },
  { destination: "Dubai", question: "What are the dress code rules in Dubai?" },
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

// Simple markdown renderer for bold, code, and lists
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // Bullet point
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="text-teal-400 shrink-0 mt-1">•</span>
              <span className="text-sm text-stone-200"
                dangerouslySetInnerHTML={{
                  __html: line
                    .slice(2)
                    .replace(/\*\*(.*?)\*\*/g, "<strong class='text-stone-50'>$1</strong>")
                    .replace(/`(.*?)`/g, "<code class='bg-stone-800 px-1 rounded text-amber-300 text-xs font-mono'>$1</code>"),
                }}
              />
            </div>
          );
        }
        // Numbered list
        const numMatch = line.match(/^(\d+)\.\s(.+)/);
        if (numMatch) {
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="text-teal-400 shrink-0 font-mono text-xs mt-0.5">{numMatch[1]}.</span>
              <span
                className="text-sm text-stone-200"
                dangerouslySetInnerHTML={{
                  __html: numMatch[2]
                    .replace(/\*\*(.*?)\*\*/g, "<strong class='text-stone-50'>$1</strong>")
                    .replace(/`(.*?)`/g, "<code class='bg-stone-800 px-1 rounded text-amber-300 text-xs font-mono'>$1</code>"),
                }}
              />
            </div>
          );
        }
        // Heading (##)
        if (line.startsWith("## ")) {
          return (
            <p key={i} className="text-sm font-semibold text-stone-100 mt-2">
              {line.slice(3)}
            </p>
          );
        }
        // Heading (#)
        if (line.startsWith("# ")) {
          return (
            <p key={i} className="text-sm font-bold text-stone-50 mt-2">
              {line.slice(2)}
            </p>
          );
        }
        // Empty line
        if (!line.trim()) return <div key={i} className="h-1" />;
        // Regular paragraph
        return (
          <p
            key={i}
            className="text-sm text-stone-200"
            dangerouslySetInnerHTML={{
              __html: line
                .replace(/\*\*(.*?)\*\*/g, "<strong class='text-stone-50'>$1</strong>")
                .replace(/`(.*?)`/g, "<code class='bg-stone-800 px-1 rounded text-amber-300 text-xs font-mono'>$1</code>"),
            }}
          />
        );
      })}
    </div>
  );
}

export default function ChatPage() {
  const { language } = useLanguage();
  const t = useTranslations({
    pageTitle: "Ask Atlasia",
    pageSubtitle: "Your AI travel assistant — ask anything about any destination",
    inputPlaceholder: "Ask about any destination...",
    sendBtn: "Send",
    clearBtn: "Clear chat",
    suggestedTitle: "Suggested questions",
    locationContextLabel: "Destination context (optional)",
    locationPlaceholder: "e.g. Tokyo, Japan",
    thinkingLabel: "Atlasia is thinking...",
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [locationContext, setLocationContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationHistory,
          location: locationContext || undefined,
          language,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content:
          "Sorry, I couldn't connect right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="min-h-screen bg-stone-950 pt-16 flex flex-col">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(20,184,166,0.04),transparent)] pointer-events-none" />

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        <div className="max-w-3xl mx-auto w-full flex flex-col flex-1">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-3 mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-[family-name:var(--font-sora)] text-stone-50">
                  {t.pageTitle}
                </h1>
                <p className="text-stone-400 text-sm">{t.pageSubtitle}</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                {t.clearBtn}
              </button>
            )}
          </motion.div>

          {/* Location context input */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-4"
          >
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                value={locationContext}
                onChange={(e) => setLocationContext(e.target.value)}
                placeholder={t.locationPlaceholder}
                className="w-full bg-stone-900/40 border border-stone-800/60 rounded-xl pl-9 pr-4 py-2 text-sm text-stone-300 placeholder:text-stone-600 outline-none focus:border-teal-500/30 transition-colors"
              />
            </div>
          </motion.div>

          {/* Messages area */}
          <div className="flex-1 min-h-0">
            {messages.length === 0 ? (
              /* Suggested questions */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-400" />
                  <p className="text-sm text-stone-400">{t.suggestedTitle}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGGESTED_QUESTIONS.map((sq, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.04 }}
                      onClick={() => {
                        if (!locationContext) setLocationContext(sq.destination);
                        sendMessage(sq.question);
                      }}
                      className="text-left p-3 rounded-xl bg-stone-900/40 border border-stone-800/40 hover:border-teal-500/25 hover:bg-stone-900/70 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start gap-2">
                        <MessageCircle size={13} className="text-stone-600 group-hover:text-teal-400 shrink-0 mt-0.5 transition-colors" />
                        <span className="text-sm text-stone-400 group-hover:text-stone-200 transition-colors">
                          {sq.question}
                        </span>
                      </div>
                      <Badge variant="default" className="mt-1.5 text-xs">
                        {sq.destination}
                      </Badge>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Chat messages */
              <div className="space-y-4 pb-4">
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot size={15} className="text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-teal-500/15 border border-teal-500/20 rounded-tr-sm"
                            : "bg-stone-900/60 border border-stone-800/60 rounded-tl-sm"
                        }`}
                      >
                        {message.role === "user" ? (
                          <p className="text-sm text-stone-100">{message.content}</p>
                        ) : (
                          <MarkdownContent content={message.content} />
                        )}
                        <p className="text-xs text-stone-600 mt-1.5">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-xl bg-stone-800 flex items-center justify-center shrink-0 mt-0.5">
                          <User size={15} className="text-stone-400" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Thinking indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shrink-0">
                      <Bot size={15} className="text-white" />
                    </div>
                    <div className="bg-stone-900/60 border border-stone-800/60 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 size={13} className="animate-spin text-teal-400" />
                        <p className="text-xs text-stone-400">{t.thinkingLabel}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4 pt-4 border-t border-stone-800/60"
          >
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.inputPlaceholder}
                  rows={1}
                  style={{ resize: "none" }}
                  className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-50 placeholder:text-stone-500 outline-none focus:border-teal-500/40 transition-colors min-h-[44px] max-h-32 overflow-y-auto"
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = Math.min(el.scrollHeight, 128) + "px";
                  }}
                />
              </div>
              <Button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className="gap-2 h-11 shrink-0"
              >
                {isLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
              </Button>
            </div>
            <p className="text-xs text-stone-600 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
