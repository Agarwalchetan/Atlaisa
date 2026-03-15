"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Phone,
  MessageSquare,
  BookOpen,
  ShieldCheck,
  Loader2,
  Copy,
  Check,
  Volume2,
  MapPin,
  Zap,
  Wifi,
  Droplets,
  Clock,
  Banknote,
  Info,
  ChevronDown,
  Plane,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";
import { useTranslations } from "@/lib/use-translations";

interface SurvivalCard {
  country: string;
  currency: string;
  emergencyNumbers: { service: string; number: string }[];
  usefulPhrases: { english: string; local: string; pronunciation: string }[];
  localRules: { rule: string; category: string }[];
  paymentInfo: { preferredMethod: string; localCurrencyAdvised: boolean; notes: string };
  safetyTips: string[];
  visaInfo: string;
  voltageAndPlugs: string;
  timeZone: string;
  drinkingWater: string;
}

const POPULAR_DESTINATIONS = [
  "Japan", "France", "Italy", "Thailand", "USA", "UAE", "India",
  "Spain", "Germany", "Australia", "Brazil", "Mexico", "UK", "South Korea",
];

const RULE_CATEGORY_ICONS: Record<string, React.ElementType> = {
  etiquette: BookOpen,
  transport: MapPin,
  culture: Globe,
  law: ShieldCheck,
  religion: Info,
  default: AlertTriangle,
};

export default function SurvivalCardPage() {
  const { language } = useLanguage();
  const t = useTranslations({
    pageTitle: "Travel Survival Card",
    pageSubtitle: "Everything you need to stay safe and confident in a new country",
    generateBtn: "Generate Card",
    generatingBtn: "Generating...",
    placeholderLabel: "Enter a country or destination",
    emergencyNumbersTitle: "Emergency Numbers",
    usefulPhrasesTitle: "Useful Phrases",
    localRulesTitle: "Local Rules",
    paymentInfoTitle: "Payment Info",
    safetyTipsTitle: "Safety Tips",
    quickInfoTitle: "Quick Info",
    visaLabel: "Visa",
    voltageLabel: "Voltage & Plugs",
    timezoneLabel: "Time Zone",
    waterLabel: "Drinking Water",
    currencyLabel: "Currency",
    copyLabel: "Copied!",
    pronounceLabel: "Pronunciation",
  });

  const [locationInput, setLocationInput] = useState("");
  const [card, setCard] = useState<SurvivalCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async (destination?: string) => {
    const loc = destination || locationInput.trim();
    if (!loc) return;
    setIsLoading(true);
    setError(null);
    setCard(null);
    if (destination) setLocationInput(destination);
    try {
      const res = await fetch("/api/survival-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: loc, language }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCard(data.card);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate card");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlay = async (id: string, text: string) => {
    setPlayingId(id);
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

  return (
    <div className="min-h-screen bg-stone-950 pt-16">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(251,191,36,0.04),transparent)] pointer-events-none" />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <CreditCard size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-[family-name:var(--font-sora)] text-stone-50">
                {t.pageTitle}
              </h1>
              <p className="text-stone-400 text-sm">{t.pageSubtitle}</p>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="mb-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    placeholder={t.placeholderLabel}
                    className="w-full bg-stone-900/60 border border-stone-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-stone-50 placeholder:text-stone-500 outline-none focus:border-amber-500/40 transition-colors"
                  />
                </div>
                <Button
                  onClick={() => handleGenerate()}
                  disabled={isLoading || !locationInput.trim()}
                  className="gap-2 shrink-0"
                >
                  {isLoading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Zap size={15} />
                  )}
                  {isLoading ? t.generatingBtn : t.generateBtn}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Popular Destinations */}
          {!card && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {POPULAR_DESTINATIONS.map((dest) => (
                <button
                  key={dest}
                  onClick={() => handleGenerate(dest)}
                  className="px-3 py-1.5 rounded-lg bg-stone-900/60 border border-stone-800/60 text-stone-400 text-xs hover:border-amber-500/30 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {dest}
                </button>
              ))}
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <Card className="mb-6 border-rose-500/20 bg-rose-500/10">
              <p className="text-rose-400 text-sm">{error}</p>
            </Card>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-4 bg-stone-800 rounded w-1/3 mb-3" />
                  <div className="space-y-2">
                    <div className="h-3 bg-stone-800/60 rounded w-full" />
                    <div className="h-3 bg-stone-800/60 rounded w-3/4" />
                  </div>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Card Output */}
          {card && !isLoading && (
            <AnimatePresence mode="wait">
              <motion.div
                key={card.country}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* Title banner */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Plane size={18} className="text-amber-400" />
                    <h2 className="text-xl font-bold font-[family-name:var(--font-sora)] text-stone-50">
                      {card.country}
                    </h2>
                    <Badge variant="warning">{card.currency}</Badge>
                  </div>
                  <button
                    onClick={() => { setCard(null); setLocationInput(""); }}
                    className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {/* Quick Info strip */}
                <Card className="bg-gradient-to-r from-amber-500/8 to-teal-500/8 border-amber-500/15">
                  <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">
                    {t.quickInfoTitle}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: Clock, label: t.timezoneLabel, value: card.timeZone },
                      { icon: Zap, label: t.voltageLabel, value: card.voltageAndPlugs },
                      { icon: Droplets, label: t.waterLabel, value: card.drinkingWater },
                      { icon: Banknote, label: t.currencyLabel, value: card.currency },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-2">
                        <Icon size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-stone-500">{label}</p>
                          <p className="text-xs text-stone-200 font-medium">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {card.visaInfo && (
                    <div className="mt-3 pt-3 border-t border-stone-800/60 flex items-start gap-2">
                      <Globe size={14} className="text-teal-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-stone-500">{t.visaLabel}</p>
                        <p className="text-xs text-stone-200">{card.visaInfo}</p>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Emergency Numbers */}
                <Card className="bg-gradient-to-r from-rose-500/8 to-rose-600/8 border-rose-500/15">
                  <div className="flex items-center gap-2 mb-4">
                    <Phone size={16} className="text-rose-400" />
                    <h3 className="font-semibold font-[family-name:var(--font-sora)] text-stone-50">
                      {t.emergencyNumbersTitle}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {card.emergencyNumbers.map((e) => (
                      <a
                        key={e.service}
                        href={`tel:${e.number}`}
                        className="flex flex-col items-center gap-1 p-3 rounded-xl bg-stone-900/60 hover:bg-stone-800/80 border border-stone-800/60 transition-colors active:scale-[0.97]"
                      >
                        <span className="text-xl font-bold text-rose-400">{e.number}</span>
                        <span className="text-xs text-stone-400 text-center">{e.service}</span>
                      </a>
                    ))}
                  </div>
                </Card>

                {/* Useful Phrases */}
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare size={16} className="text-teal-400" />
                    <h3 className="font-semibold font-[family-name:var(--font-sora)] text-stone-50">
                      {t.usefulPhrasesTitle}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {card.usefulPhrases.map((phrase, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-start justify-between gap-3 p-3 rounded-xl bg-stone-900/40 border border-stone-800/40"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-stone-400 mb-0.5">{phrase.english}</p>
                          <p className="text-sm font-medium font-mono text-stone-50 truncate">
                            {phrase.local}
                          </p>
                          {phrase.pronunciation && (
                            <p className="text-xs text-amber-500/70 italic mt-0.5 font-mono">
                              {phrase.pronunciation}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleCopy(`phrase-${i}`, phrase.local)}
                            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-500 hover:text-stone-50 transition-colors cursor-pointer"
                          >
                            {copiedId === `phrase-${i}` ? (
                              <Check size={13} className="text-teal-400" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                          <button
                            onClick={() => handlePlay(`phrase-${i}`, phrase.local)}
                            disabled={playingId === `phrase-${i}`}
                            className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {playingId === `phrase-${i}` ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Volume2 size={13} />
                            )}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                {/* Local Rules */}
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen size={16} className="text-amber-400" />
                    <h3 className="font-semibold font-[family-name:var(--font-sora)] text-stone-50">
                      {t.localRulesTitle}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {card.localRules.map((rule, i) => {
                      const RuleIcon = RULE_CATEGORY_ICONS[rule.category] || RULE_CATEGORY_ICONS.default;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-stone-900/40 border border-stone-800/40"
                        >
                          <RuleIcon size={15} className="text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-sm text-stone-200">{rule.rule}</p>
                          <Badge variant="default" className="ml-auto shrink-0 text-xs">
                            {rule.category}
                          </Badge>
                        </motion.div>
                      );
                    })}
                  </div>
                </Card>

                {/* Payment Info */}
                <Card className="bg-gradient-to-r from-teal-500/8 to-teal-600/8 border-teal-500/15">
                  <div className="flex items-center gap-2 mb-3">
                    <Banknote size={16} className="text-teal-400" />
                    <h3 className="font-semibold font-[family-name:var(--font-sora)] text-stone-50">
                      {t.paymentInfoTitle}
                    </h3>
                    <Badge variant="info" className="ml-auto">
                      {card.paymentInfo.preferredMethod}
                    </Badge>
                  </div>
                  <p className="text-sm text-stone-300">{card.paymentInfo.notes}</p>
                  {card.paymentInfo.localCurrencyAdvised && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-amber-400">
                      <Info size={12} />
                      Local currency recommended
                    </div>
                  )}
                </Card>

                {/* Safety Tips */}
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck size={16} className="text-teal-400" />
                    <h3 className="font-semibold font-[family-name:var(--font-sora)] text-stone-50">
                      {t.safetyTipsTitle}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {card.safetyTips.map((tip, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-start gap-2 text-sm text-stone-300"
                      >
                        <ChevronDown
                          size={14}
                          className="text-teal-400 shrink-0 mt-0.5 -rotate-90"
                        />
                        {tip}
                      </motion.li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
