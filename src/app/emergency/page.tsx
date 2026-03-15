"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Volume2,
  Phone,
  MapPin,
  Heart,
  Shield,
  Loader2,
  Copy,
  Check,
  Siren,
  Pill,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { useLanguage } from "@/lib/language-context";
import { useTranslations } from "@/lib/use-translations";
import { SUPPORTED_LANGUAGES } from "@/lib/utils";

interface EmergencyPhrase {
  id: string;
  english: string;
  translated: string;
  pronunciation: string;
  category: string;
  icon: string;
  severity: "critical" | "urgent" | "important";
}

const EMERGENCY_PHRASES: Omit<EmergencyPhrase, "translated" | "pronunciation">[] = [
  { id: "1", english: "Help! I need a doctor!", category: "medical", icon: "🏥", severity: "critical" },
  { id: "2", english: "Call an ambulance!", category: "medical", icon: "🚑", severity: "critical" },
  { id: "3", english: "Call the police!", category: "police", icon: "🚔", severity: "critical" },
  { id: "4", english: "I am lost. Please help me.", category: "general", icon: "🗺️", severity: "urgent" },
  { id: "5", english: "I am having an allergic reaction.", category: "medical", icon: "⚠️", severity: "critical" },
  { id: "6", english: "I am allergic to peanuts.", category: "medical", icon: "🥜", severity: "important" },
  { id: "7", english: "Where is the nearest hospital?", category: "medical", icon: "🏥", severity: "urgent" },
  { id: "8", english: "I have been robbed. Call the police.", category: "police", icon: "🚨", severity: "critical" },
  { id: "9", english: "I need a translator.", category: "general", icon: "🗣️", severity: "important" },
  { id: "10", english: "My passport has been stolen.", category: "police", icon: "📄", severity: "urgent" },
  { id: "11", english: "I cannot breathe properly.", category: "medical", icon: "💨", severity: "critical" },
  { id: "12", english: "Where is the nearest pharmacy?", category: "medical", icon: "💊", severity: "important" },
];

const EMERGENCY_CONTACTS: Record<string, { police: string; ambulance: string; fire: string; embassy?: string }> = {
  Japan: { police: "110", ambulance: "119", fire: "119" },
  France: { police: "17", ambulance: "15", fire: "18" },
  USA: { police: "911", ambulance: "911", fire: "911" },
  UAE: { police: "999", ambulance: "998", fire: "997" },
  Thailand: { police: "191", ambulance: "1669", fire: "199" },
  Italy: { police: "113", ambulance: "118", fire: "115" },
  Australia: { police: "000", ambulance: "000", fire: "000" },
  India: { police: "100", ambulance: "108", fire: "101" },
  Germany: { police: "110", ambulance: "112", fire: "112" },
  Spain: { police: "091", ambulance: "061", fire: "080" },
  default: { police: "112", ambulance: "112", fire: "112" },
};

export default function EmergencyPage() {
  const { language } = useLanguage();
  const t = useTranslations({
    pageTitle: "Emergency Assistant",
    pageSubtitle: "Critical phrases & emergency contacts",
    emergencyModeLabel: "Emergency Mode",
    emergencyNumbersTitle: "Emergency Numbers",
    translatePhrasesTitle: "Translate Emergency Phrases",
    targetLangLabel: "Target Language",
    translateAllBtn: "Translate All",
    translatingBtn: "Translating...",
    criticalEmergency: "Critical Emergency",
    urgentSituations: "Urgent Situations",
    importantPhrases: "Important Phrases",
    medicalAlertTitle: "Medical Alert Card",
    medicalAlertDesc: "Customize these for your personal medical information to show to emergency responders.",
    bloodTypeLabel: "Blood Type",
    allergiesLabel: "Allergies",
    medicationsLabel: "Medications",
    policeLabel: "Police",
    ambulanceLabel: "Ambulance",
    fireLabel: "Fire",
  });
  const [selectedCountry, setSelectedCountry] = useState("Japan");
  const [translatedPhrases, setTranslatedPhrases] = useState<EmergencyPhrase[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [targetLang, setTargetLang] = useState("ja");

  const contacts = EMERGENCY_CONTACTS[selectedCountry] || EMERGENCY_CONTACTS.default;

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const targetLangName = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.name || "Japanese";
      
      const promises = EMERGENCY_PHRASES.map(async (phrase) => {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: phrase.english,
            fromLang: "English",
            toLang: targetLangName,
          }),
        });
        const data = await res.json();
        return {
          ...phrase,
          translated: data.translation || phrase.english,
          pronunciation: data.pronunciation || "",
        };
      });

      const results = await Promise.all(promises);
      setTranslatedPhrases(results);
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePlay = async (phrase: EmergencyPhrase) => {
    setPlayingId(phrase.id);
    try {
      const res = await fetch("/api/speech/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: phrase.translated || phrase.english, voice: "alloy" }),
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

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const phrases = translatedPhrases.length > 0 ? translatedPhrases : EMERGENCY_PHRASES.map((p) => ({
    ...p,
    translated: p.english,
    pronunciation: "",
  }));

  const categories = [
    { id: "critical", label: "Critical", color: "red" },
    { id: "medical", label: "Medical", color: "rose" },
    { id: "police", label: "Police", color: "blue" },
    { id: "general", label: "General", color: "amber" },
  ];

  const langOptions = SUPPORTED_LANGUAGES.map((l) => ({
    value: l.code,
    label: `${l.flag} ${l.name}`,
  }));

  const countryOptions = Object.keys(EMERGENCY_CONTACTS).filter(k => k !== "default").map(c => ({
    value: c,
    label: c,
  }));

  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(239,68,68,0.06),transparent)] pointer-events-none" />

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-3 mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                <AlertTriangle size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{t.pageTitle}</h1>
                <p className="text-white/50 text-sm">
                  {t.pageSubtitle}
                </p>
              </div>
            </div>
            <Badge variant="danger" className="animate-pulse px-3 py-1.5">
              <Siren size={12} className="mr-1" />
              {t.emergencyModeLabel}
            </Badge>
          </motion.div>

          {/* Emergency Contacts Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mb-6 bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-500/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Phone size={16} className="text-red-400" />
                    <h3 className="font-semibold text-white">{t.emergencyNumbersTitle}</h3>
                    <Select
                      value={selectedCountry}
                      onValueChange={setSelectedCountry}
                      options={countryOptions}
                      className="ml-2 w-36 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: Shield, label: t.policeLabel, number: contacts.police, color: "text-blue-400" },
                      { icon: Heart, label: t.ambulanceLabel, number: contacts.ambulance, color: "text-red-400" },
                      { icon: Siren, label: t.fireLabel, number: contacts.fire, color: "text-orange-400" },
                    ].map(({ icon: Icon, label, number, color }) => (
                      <a
                        key={label}
                        href={`tel:${number}`}
                        className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                      >
                        <Icon size={20} className={color} />
                        <span className={`text-xl font-bold ${color}`}>{number}</span>
                        <span className="text-xs text-white/50">{label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Translation Setup */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="mb-6">
              <h3 className="font-semibold text-white mb-4">{t.translatePhrasesTitle}</h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-white/40 mb-1.5 block">{t.targetLangLabel}</label>
                  <Select
                    value={targetLang}
                    onValueChange={setTargetLang}
                    options={langOptions}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="gap-2"
                  >
                    {isTranslating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Navigation size={16} />
                    )}
                    {isTranslating ? t.translatingBtn : t.translateAllBtn}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Phrases Grid */}
          <div className="space-y-6">
            {/* Critical phrases first */}
            {[
              { severity: "critical" as const, label: t.criticalEmergency, icon: <Siren size={16} className="text-red-400" />, borderColor: "border-red-500/30" },
              { severity: "urgent" as const, label: t.urgentSituations, icon: <AlertTriangle size={16} className="text-orange-400" />, borderColor: "border-orange-500/30" },
              { severity: "important" as const, label: t.importantPhrases, icon: <Shield size={16} className="text-blue-400" />, borderColor: "border-blue-500/30" },
            ].map(({ severity, label, icon, borderColor }) => {
              const sevPhrases = phrases.filter((p) => p.severity === severity);
              if (!sevPhrases.length) return null;
              return (
                <div key={severity}>
                  <div className="flex items-center gap-2 mb-3">
                    {icon}
                    <h3 className="font-semibold text-white">{label}</h3>
                    <Badge variant={severity === "critical" ? "danger" : severity === "urgent" ? "warning" : "info"}>
                      {sevPhrases.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sevPhrases.map((phrase, i) => (
                      <motion.div
                        key={phrase.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card
                          className={`border-l-2 ${
                            severity === "critical"
                              ? "border-l-red-500"
                              : severity === "urgent"
                              ? "border-l-orange-500"
                              : "border-l-blue-500"
                          } hover:border-white/20 transition-colors`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{phrase.icon}</span>
                              <span className="text-xs text-white/40">{phrase.category}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleCopy(phrase.id, phrase.translated || phrase.english)}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
                              >
                                {copiedId === phrase.id ? (
                                  <Check size={13} className="text-emerald-400" />
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>
                              <button
                                onClick={() => handlePlay(phrase)}
                                disabled={playingId === phrase.id}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                                  severity === "critical"
                                    ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                                    : "bg-sky-500/10 hover:bg-sky-500/20 text-sky-400"
                                }`}
                              >
                                {playingId === phrase.id ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <Volume2 size={13} />
                                )}
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-white/50 mb-2">{phrase.english}</p>
                          <p className="text-sm font-medium text-white">{phrase.translated}</p>
                          {phrase.pronunciation && (
                            <p className="text-xs text-sky-400/60 mt-1 italic">
                              🔊 {phrase.pronunciation}
                            </p>
                          )}
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Medical Alert Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Pill size={18} className="text-pink-400" />
                <h3 className="font-semibold text-white">{t.medicalAlertTitle}</h3>
                <Badge variant="warning">Print or Screenshot</Badge>
              </div>
              <p className="text-sm text-white/50 mb-4">
                {t.medicalAlertDesc}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: t.bloodTypeLabel, placeholder: "e.g. A+", icon: "🩸" },
                  { label: t.allergiesLabel, placeholder: "e.g. Peanuts, Penicillin", icon: "⚠️" },
                  { label: t.medicationsLabel, placeholder: "e.g. Insulin", icon: "💊" },
                ].map(({ label, placeholder, icon }) => (
                  <div key={label}>
                    <label className="text-xs text-white/40 mb-1.5 block">{icon} {label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-pink-500/40 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
