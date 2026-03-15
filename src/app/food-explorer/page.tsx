"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils,
  MapPin,
  Loader2,
  Copy,
  Check,
  Volume2,
  Star,
  ChefHat,
  MessageSquare,
  Zap,
  Leaf,
  Wheat,
  Fish,
  Flame,
  DollarSign,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";
import { useTranslations } from "@/lib/use-translations";

interface FoodOrderingPhrase {
  english: string;
  local: string;
  pronunciation: string;
}

interface Food {
  id: string;
  name: string;
  localName: string;
  description: string;
  flavourProfile: string;
  whereToTry: string;
  orderingPhrase: FoodOrderingPhrase;
  mustTry: boolean;
  priceRange: "budget" | "moderate" | "splurge";
  dietaryTags: string[];
}

interface FoodExplorer {
  location: string;
  foods: Food[];
  foodTips: string[];
  bestFoodAreas: string[];
}

const POPULAR_DESTINATIONS = [
  "Tokyo, Japan", "Paris, France", "Rome, Italy", "Bangkok, Thailand",
  "New York, USA", "Mumbai, India", "Barcelona, Spain", "Istanbul, Turkey",
  "Mexico City, Mexico", "Marrakech, Morocco",
];

const DIET_TAG_ICONS: Record<string, React.ElementType> = {
  vegetarian: Leaf,
  vegan: Leaf,
  "gluten-free": Wheat,
  seafood: Fish,
  spicy: Flame,
  default: Utensils,
};

const PRICE_COLORS: Record<string, string> = {
  budget: "text-teal-400",
  moderate: "text-amber-400",
  splurge: "text-rose-400",
};

const PRICE_LABELS: Record<string, string> = {
  budget: "$",
  moderate: "$$",
  splurge: "$$$",
};

export default function FoodExplorerPage() {
  const { language } = useLanguage();
  const t = useTranslations({
    pageTitle: "Food Explorer",
    pageSubtitle: "Discover iconic local dishes and learn how to order them",
    generateBtn: "Explore Food",
    generatingBtn: "Discovering...",
    placeholderLabel: "Enter a city or country",
    mustTryLabel: "Must Try",
    whereToTryLabel: "Where to Try",
    orderPhraseLabel: "How to Order",
    flavourLabel: "Flavour Profile",
    foodTipsTitle: "Food Tips",
    bestAreasTitle: "Best Food Areas",
    copyLabel: "Copied!",
  });

  const [locationInput, setLocationInput] = useState("");
  const [explorer, setExplorer] = useState<FoodExplorer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [expandedFood, setExpandedFood] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleExplore = async (destination?: string) => {
    const loc = destination || locationInput.trim();
    if (!loc) return;
    setIsLoading(true);
    setError(null);
    setExplorer(null);
    setExpandedFood(null);
    if (destination) setLocationInput(destination);
    try {
      const res = await fetch("/api/food-explorer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: loc, language }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setExplorer(data.explorer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to explore food");
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
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(20,184,166,0.04),transparent)] pointer-events-none" />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <Utensils size={20} className="text-white" />
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
                    onKeyDown={(e) => e.key === "Enter" && handleExplore()}
                    placeholder={t.placeholderLabel}
                    className="w-full bg-stone-900/60 border border-stone-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-stone-50 placeholder:text-stone-500 outline-none focus:border-teal-500/40 transition-colors"
                  />
                </div>
                <Button
                  onClick={() => handleExplore()}
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

          {/* Popular picks */}
          {!explorer && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {POPULAR_DESTINATIONS.map((dest) => (
                <button
                  key={dest}
                  onClick={() => handleExplore(dest)}
                  className="px-3 py-1.5 rounded-lg bg-stone-900/60 border border-stone-800/60 text-stone-400 text-xs hover:border-teal-500/30 hover:text-teal-400 transition-colors cursor-pointer"
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
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-5 bg-stone-800 rounded w-1/3 mb-3" />
                  <div className="space-y-2">
                    <div className="h-3 bg-stone-800/60 rounded w-full" />
                    <div className="h-3 bg-stone-800/60 rounded w-2/3" />
                  </div>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Results */}
          {explorer && !isLoading && (
            <AnimatePresence mode="wait">
              <motion.div
                key={explorer.location}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ChefHat size={18} className="text-teal-400" />
                    <h2 className="text-xl font-bold font-[family-name:var(--font-sora)] text-stone-50">
                      {explorer.location}
                    </h2>
                    <Badge variant="info">{explorer.foods.length} dishes</Badge>
                  </div>
                  <button
                    onClick={() => { setExplorer(null); setLocationInput(""); }}
                    className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {/* Best food areas */}
                {explorer.bestFoodAreas?.length > 0 && (
                  <Card className="bg-gradient-to-r from-teal-500/8 to-teal-600/8 border-teal-500/15">
                    <div className="flex items-center gap-2 mb-2">
                      <Navigation size={14} className="text-teal-400" />
                      <h3 className="text-sm font-semibold text-stone-200">{t.bestAreasTitle}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {explorer.bestFoodAreas.map((area) => (
                        <Badge key={area} variant="info" className="text-xs">{area}</Badge>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Food cards */}
                <div className="space-y-4">
                  {explorer.foods.map((food, i) => (
                    <motion.div
                      key={food.id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card
                        className={`cursor-pointer transition-colors ${
                          expandedFood === (food.id || String(i))
                            ? "border-teal-500/30"
                            : "hover:border-stone-700"
                        }`}
                        onClick={() =>
                          setExpandedFood(
                            expandedFood === (food.id || String(i))
                              ? null
                              : food.id || String(i)
                          )
                        }
                      >
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-semibold font-[family-name:var(--font-sora)] text-stone-50">
                                {food.name}
                              </h3>
                              {food.localName && food.localName !== food.name && (
                                <span className="text-xs text-stone-500 font-mono">
                                  {food.localName}
                                </span>
                              )}
                              {food.mustTry && (
                                <Badge variant="warning" className="text-xs flex items-center gap-1">
                                  <Star size={9} />
                                  {t.mustTryLabel}
                                </Badge>
                              )}
                              <span
                                className={`text-sm font-bold ${
                                  PRICE_COLORS[food.priceRange] || "text-stone-400"
                                }`}
                              >
                                {PRICE_LABELS[food.priceRange] || food.priceRange}
                              </span>
                            </div>
                            <p className="text-sm text-stone-400 line-clamp-2">
                              {food.description}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1 shrink-0">
                            {food.dietaryTags?.slice(0, 2).map((tag) => {
                              const TagIcon = DIET_TAG_ICONS[tag] || DIET_TAG_ICONS.default;
                              return (
                                <div
                                  key={tag}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-900/60 border border-stone-800/60 text-xs text-stone-400"
                                >
                                  <TagIcon size={10} />
                                  {tag}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Expanded content */}
                        <AnimatePresence>
                          {expandedFood === (food.id || String(i)) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="mt-4 pt-4 border-t border-stone-800/60 space-y-4">
                                {/* Flavour profile */}
                                {food.flavourProfile && (
                                  <div>
                                    <p className="text-xs text-stone-500 mb-1">{t.flavourLabel}</p>
                                    <p className="text-sm text-stone-300 italic">{food.flavourProfile}</p>
                                  </div>
                                )}

                                {/* Where to try */}
                                {food.whereToTry && (
                                  <div className="flex items-start gap-2">
                                    <MapPin size={14} className="text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs text-stone-500">{t.whereToTryLabel}</p>
                                      <p className="text-sm text-stone-200">{food.whereToTry}</p>
                                    </div>
                                  </div>
                                )}

                                {/* Ordering phrase */}
                                {food.orderingPhrase && (
                                  <div className="p-3 rounded-xl bg-stone-900/60 border border-teal-500/15">
                                    <div className="flex items-center gap-2 mb-2">
                                      <MessageSquare size={13} className="text-teal-400" />
                                      <p className="text-xs text-stone-400">{t.orderPhraseLabel}</p>
                                    </div>
                                    <p className="text-xs text-stone-500 mb-1">
                                      {food.orderingPhrase.english}
                                    </p>
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium font-mono text-stone-50 truncate">
                                          {food.orderingPhrase.local}
                                        </p>
                                        {food.orderingPhrase.pronunciation && (
                                          <p className="text-xs text-amber-500/70 italic font-mono mt-0.5">
                                            {food.orderingPhrase.pronunciation}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          onClick={() =>
                                            handleCopy(
                                              `order-${food.id || i}`,
                                              food.orderingPhrase.local
                                            )
                                          }
                                          className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-500 hover:text-stone-50 transition-colors cursor-pointer"
                                        >
                                          {copiedId === `order-${food.id || i}` ? (
                                            <Check size={13} className="text-teal-400" />
                                          ) : (
                                            <Copy size={13} />
                                          )}
                                        </button>
                                        <button
                                          onClick={() =>
                                            handlePlay(
                                              `order-${food.id || i}`,
                                              food.orderingPhrase.local
                                            )
                                          }
                                          disabled={playingId === `order-${food.id || i}`}
                                          className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                          {playingId === `order-${food.id || i}` ? (
                                            <Loader2 size={13} className="animate-spin" />
                                          ) : (
                                            <Volume2 size={13} />
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Food Tips */}
                {explorer.foodTips?.length > 0 && (
                  <Card className="bg-gradient-to-r from-amber-500/8 to-amber-600/8 border-amber-500/15">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign size={15} className="text-amber-400" />
                      <h3 className="font-semibold font-[family-name:var(--font-sora)] text-stone-50 text-sm">
                        {t.foodTipsTitle}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {explorer.foodTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-stone-300">
                          <Utensils size={13} className="text-amber-400 shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
