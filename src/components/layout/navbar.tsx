"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Map,
  BookOpen,
  Mic,
  AlertTriangle,
  Menu,
  X,
  Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORTED_LANGUAGES } from "@/lib/utils";
import { useTranslations } from "@/lib/use-translations";

const NAV_LINK_HREFS = [
  { href: "/map", icon: Map },
  { href: "/travel-guide", icon: BookOpen },
  { href: "/phrases", icon: Languages },
  { href: "/conversation", icon: Mic },
  { href: "/emergency", icon: AlertTriangle },
] as const;

interface NavbarProps {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}

export function Navbar({ selectedLanguage, onLanguageChange }: NavbarProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const t = useTranslations({
    navMap: "Explore Map",
    navTravelGuide: "Travel Guide",
    navPhrases: "Phrases",
    navConversation: "Conversation",
    navEmergency: "Emergency",
  });

  const navLinks = [
    { href: "/map", label: t.navMap, icon: Map },
    { href: "/travel-guide", label: t.navTravelGuide, icon: BookOpen },
    { href: "/phrases", label: t.navPhrases, icon: Languages },
    { href: "/conversation", label: t.navConversation, icon: Mic },
    { href: "/emergency", label: t.navEmergency, icon: AlertTriangle },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/10 shadow-2xl"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:shadow-sky-500/40 transition-shadow">
                <Globe size={16} className="text-white" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                Atla<span className="text-sky-400">sia</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    pathname === href
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              ))}
            </div>

            {/* Language Selector + Mobile Menu */}
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white text-sm font-medium transition-all duration-200 cursor-pointer"
                >
                  <span className="text-base">{currentLang?.flag}</span>
                  <span className="hidden sm:block">{currentLang?.name}</span>
                  <Languages size={14} className="text-white/40" />
                </button>

                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-2 max-h-72 overflow-y-auto">
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              onLanguageChange(lang.code);
                              setLangOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 cursor-pointer",
                              selectedLanguage === lang.code
                                ? "bg-sky-500/20 text-sky-400"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                            )}
                          >
                            <span className="text-base">{lang.flag}</span>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{lang.name}</span>
                              <span className="text-xs text-white/40">{lang.nativeName}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-all cursor-pointer"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="p-4 space-y-1">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      pathname === href
                        ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Backdrop for dropdowns */}
      {(langOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setLangOpen(false); }}
        />
      )}
    </>
  );
}
