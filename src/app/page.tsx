"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe,
  Map,
  BookOpen,
  Languages,
  Mic,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Brain,
  Calendar,
  ChevronRight,
  Star,
  Zap,
  Shield,
  Github,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/lib/use-translations";

function useCountUp(target: number, duration = 1500, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const started = useRef(false);

  useEffect(() => {
    if (startOnView && !inView) return;
    if (started.current) return;
    started.current = true;

    const steps = 40;
    const stepDuration = duration / steps;
    let current = 0;
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [inView, target, duration, startOnView]);

  return { count, ref };
}

const destinations = [
  { name: "Tokyo", country: "Japan", emoji: "🗼", lat: 35.6762, lng: 139.6503 },
  { name: "Paris", country: "France", emoji: "🗺️", lat: 48.8566, lng: 2.3522 },
  { name: "New York", country: "USA", emoji: "🗽", lat: 40.7128, lng: -74.0060 },
  { name: "Dubai", country: "UAE", emoji: "🏙️", lat: 25.2048, lng: 55.2708 },
  { name: "Bangkok", country: "Thailand", emoji: "⛩️", lat: 13.7563, lng: 100.5018 },
  { name: "Rome", country: "Italy", emoji: "🏛️", lat: 41.9028, lng: 12.4964 },
];

function AnimatedStat({
  numericValue,
  suffix,
  label,
  icon: Icon,
}: {
  numericValue: number | null;
  suffix: string;
  label: string;
  icon: React.ElementType;
}) {
  const { count, ref } = useCountUp(numericValue ?? 0, 1200);
  return (
    <div ref={ref}>
      <Card className="text-center p-6 hover:border-stone-700/80 transition-colors group">
        <Icon size={20} className="mx-auto mb-2 text-amber-500 group-hover:scale-110 transition-transform duration-300" />
        <div className="text-3xl font-bold font-[family-name:var(--font-sora)] text-stone-50 mb-1">
          {numericValue !== null ? `${count}${suffix}` : suffix}
        </div>
        <div className="text-sm text-stone-400">{label}</div>
      </Card>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HomePage() {
  const t = useTranslations({
    heroBadge: "AI-Powered Travel Intelligence",
    heroHeading1: "Travel the World",
    heroHeading2: "Without Language Barriers",
    heroSubtitle: "Atlasia combines interactive maps, AI travel guides, real-time translation, cultural intelligence, and emergency assistance into one intelligent multilingual travel companion.",
    heroCtaMap: "Explore the Map",
    heroCtaGuide: "Get Travel Guide",
    statCountries: "Countries Covered",
    statLanguages: "Languages Supported",
    statAI: "Powered Guides",
    statEmergency: "Emergency Ready",
    featuresBadge: "Core Features",
    featuresHeading: "Everything a traveler needs",
    featuresSubtitle: "From exploration to emergency assistance, Atlasia has you covered in any corner of the world.",
    featExplore: "Explore",
    feat1Title: "Interactive World Map",
    feat1Desc: "Click anywhere on our 3D globe to instantly discover travel information, local attractions, and hidden gems.",
    feat2Title: "AI Travel Guides",
    feat2Desc: "Get comprehensive, AI-generated travel guides with cultural tips, must-visit places, and local cuisine.",
    feat3Title: "Phrase Translator",
    feat3Desc: "Essential travel phrases with pronunciation guides and audio playback in any language.",
    feat4Title: "Live Conversation",
    feat4Desc: "Real-time bilingual conversation translator. Speak and get instant translations in both directions.",
    feat5Title: "Emergency Assistant",
    feat5Desc: "Instant access to emergency phrases, nearby hospitals, police stations, and critical contacts.",
    feat6Title: "Cultural Intelligence",
    feat6Desc: "Deep cultural insights — etiquette, customs, social norms, and behaviors to be aware of.",
    destBadge: "Popular Destinations",
    destHeading: "Discover the world's top cities",
    destSubtitle: "Quick access to AI-generated travel guides for the most popular destinations.",
    killerBadge: "Killer Features",
    killerHeading: "Intelligence beyond translation",
    killer1Title: "Cultural Intelligence",
    killer1Sub: "AI Cultural Advisor",
    killer1Desc: "Understand greeting customs, dining etiquette, social norms, and what to avoid — all tailored to your destination.",
    killer1Item1: "Greeting customs",
    killer1Item2: "Dining etiquette",
    killer1Item3: "Social norms",
    killer1Item4: "What to avoid",
    killer2Title: "AI Itinerary Generator",
    killer2Sub: "Personalized Travel Plans",
    killer2Desc: "Generate day-by-day travel itineraries based on your interests, travel style, and available days.",
    killer2Item1: "Multi-day planning",
    killer2Item2: "Interest-based",
    killer2Item3: "Budget aware",
    killer2Item4: "Translated output",
    killer3Title: "Live Conversation Mode",
    killer3Sub: "Real-Time Translation",
    killer3Desc: "Speak in your language, hear it in theirs. Live bilingual conversation with voice input and audio output.",
    killer3Item1: "Voice detection",
    killer3Item2: "Instant translation",
    killer3Item3: "Audio playback",
    killer3Item4: "Dual language UI",
    ctaHeading: "Ready to explore the world?",
    ctaSubtitle: "Start your journey with Atlasia. Click any city on the map and experience travel intelligence like never before.",
    ctaMap: "Open World Map",
    ctaLive: "Try Live Translator",
    footerTagline: "Travel the world without language barriers — powered by AI",
    footerBuilt: "Built for global explorers",
  });

  const stats = [
    { numericValue: 195, suffix: "+", label: t.statCountries, icon: Globe },
    { numericValue: 15, suffix: "+", label: t.statLanguages, icon: Languages },
    { numericValue: null, suffix: "AI", label: t.statAI, icon: Sparkles },
    { numericValue: null, suffix: "24/7", label: t.statEmergency, icon: Shield },
  ];

  const features = [
    { icon: Map, title: t.feat1Title, description: t.feat1Desc, color: "from-amber-500 to-amber-600", href: "/map" },
    { icon: BookOpen, title: t.feat2Title, description: t.feat2Desc, color: "from-teal-500 to-teal-600", href: "/travel-guide" },
    { icon: Languages, title: t.feat3Title, description: t.feat3Desc, color: "from-teal-400 to-teal-500", href: "/phrases" },
    { icon: Mic, title: t.feat4Title, description: t.feat4Desc, color: "from-amber-400 to-amber-600", href: "/conversation" },
    { icon: AlertTriangle, title: t.feat5Title, description: t.feat5Desc, color: "from-rose-500 to-rose-600", href: "/emergency" },
    { icon: Brain, title: t.feat6Title, description: t.feat6Desc, color: "from-amber-500 to-teal-500", href: "/travel-guide" },
  ];


  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-stone-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.07),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_80%,rgba(13,148,136,0.05),transparent)]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 stars-bg pointer-events-none opacity-60" />
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-16"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-8"
            >
              <Sparkles size={14} />
              {t.heroBadge}
              <Sparkles size={14} />
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-[family-name:var(--font-sora)] text-stone-50 mb-6 leading-[1.1] tracking-tight">
              {t.heroHeading1}
              <br />
              <span className="gradient-text">{t.heroHeading2}</span>
            </h1>

            <p className="text-xl text-stone-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t.heroSubtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/map">
                <Button size="lg" className="gap-2 shadow-lg shadow-amber-600/25 hover:shadow-amber-600/40 transition-shadow">
                  <Globe size={18} />
                  {t.heroCtaMap}
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/travel-guide">
                <Button size="lg" variant="glass" className="gap-2">
                  <BookOpen size={18} />
                  {t.heroCtaGuide}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={itemVariants}>
                <AnimatedStat {...stat} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge variant="info" className="mb-4">{t.featuresBadge}</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-sora)] text-stone-50 mb-4">
              {t.featuresHeading}
            </h2>
            <p className="text-stone-400 max-w-xl mx-auto">
              {t.featuresSubtitle}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map(({ icon: Icon, title, description, color, href }) => (
              <motion.div key={title} variants={itemVariants}>
                <Link href={href}>
                  <Card className="group h-full hover:border-stone-700/80 hover:bg-stone-800/40 transition-colors duration-300 cursor-pointer">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <h3 className="text-lg font-semibold font-[family-name:var(--font-sora)] text-stone-50 mb-2">{title}</h3>
                    <p className="text-sm text-stone-400 leading-relaxed">{description}</p>
                    <div className="flex items-center gap-1 mt-4 text-amber-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {t.featExplore} <ChevronRight size={14} />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge variant="success" className="mb-4">{t.destBadge}</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-sora)] text-stone-50 mb-4">
              {t.destHeading}
            </h2>
            <p className="text-stone-400 max-w-xl mx-auto">
              {t.destSubtitle}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {destinations.map(({ name, country, emoji }) => (
              <motion.div key={name} variants={itemVariants}>
                <Link href={`/travel-guide?location=${encodeURIComponent(name + ", " + country)}`}>
                  <Card className="text-center py-6 px-4 hover:border-stone-700/80 hover:bg-stone-800/40 transition-colors duration-300 cursor-pointer group">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {emoji}
                    </div>
                    <div className="font-semibold text-stone-50 text-sm">{name}</div>
                    <div className="text-xs text-stone-500 mt-1">{country}</div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Killer Features Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge variant="warning" className="mb-4">{t.killerBadge}</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-sora)] text-stone-50 mb-4">
              {t.killerHeading}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                color: "from-amber-500 to-amber-600",
                title: t.killer1Title,
                subtitle: t.killer1Sub,
                desc: t.killer1Desc,
                items: [t.killer1Item1, t.killer1Item2, t.killer1Item3, t.killer1Item4],
              },
              {
                icon: Calendar,
                color: "from-teal-500 to-teal-600",
                title: t.killer2Title,
                subtitle: t.killer2Sub,
                desc: t.killer2Desc,
                items: [t.killer2Item1, t.killer2Item2, t.killer2Item3, t.killer2Item4],
              },
              {
                icon: Zap,
                color: "from-amber-400 to-amber-600",
                title: t.killer3Title,
                subtitle: t.killer3Sub,
                desc: t.killer3Desc,
                items: [t.killer3Item1, t.killer3Item2, t.killer3Item3, t.killer3Item4],
              },
            ].map(({ icon: Icon, color, title, subtitle, desc, items }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="h-full hover:border-stone-700/80 transition-colors duration-300">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-xl`}>
                    <Icon size={26} className="text-white" />
                  </div>
                  <div className="text-xs text-stone-500 font-medium mb-1 uppercase tracking-wider">{subtitle}</div>
                  <h3 className="text-xl font-bold font-[family-name:var(--font-sora)] text-stone-50 mb-3">{title}</h3>
                  <p className="text-sm text-stone-400 leading-relaxed mb-5">{desc}</p>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-stone-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-32">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="text-center py-16 px-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-stone-900/5 to-teal-500/10" />
              <div className="relative">
                <div className="text-5xl mb-4 inline-block animate-float">🌍</div>
                <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-sora)] text-stone-50 mb-4">
                  {t.ctaHeading}
                </h2>
                <p className="text-stone-400 mb-8 max-w-xl mx-auto">
                  {t.ctaSubtitle}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/map">
                    <Button size="lg" className="gap-2 shadow-lg shadow-amber-600/25 animate-glow">
                      <Globe size={18} />
                      {t.ctaMap}
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                  <Link href="/conversation">
                    <Button size="lg" variant="glass" className="gap-2">
                      <Mic size={18} />
                      {t.ctaLive}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-stone-800/50 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-5">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <Globe size={14} className="text-white" />
              </div>
              <span className="text-stone-50 font-semibold font-[family-name:var(--font-sora)]">Atla<span className="text-amber-500">sia</span></span>
            </div>
            <p className="text-stone-500 text-sm">
              {t.footerTagline}
            </p>
            <div className="flex items-center gap-1 text-stone-500 text-sm">
              <Star size={12} className="fill-current" />
              {t.footerBuilt}
            </div>
          </div>
          <div className="w-full border-t border-stone-800/30 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-stone-500 text-sm">
              Developed with <Heart size={13} className="text-rose-500 fill-rose-500" /> by{" "}
              <a
                href="https://github.com/AgarwalChetan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 hover:text-amber-400 transition-colors font-medium"
              >
                Chetan Agarwal
              </a>
            </p>
            <a
              href="https://github.com/Agarwalchetan/Atlasia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-stone-500 hover:text-stone-300 transition-colors text-sm"
            >
              <Github size={14} />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
