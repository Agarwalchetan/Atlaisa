"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  MapPin,
  Star,
  Utensils,
  Users,
  Train,
  Gem,
  Phone,
  Calendar,
  Search,
  Sparkles,
  AlertCircle,
  Brain,
  ChevronDown,
  ChevronUp,
  Clock,
  Heart,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoadingOverlay } from "@/components/ui/loading";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { useLanguage } from "@/lib/language-context";
import { useTranslations } from "@/lib/use-translations";
import { SUPPORTED_LANGUAGES, TRAVEL_INTERESTS } from "@/lib/utils";
import type { TravelGuide, ItineraryDay } from "@/types";

const tabs = [
  { id: "guide", label: "Travel Guide", icon: <BookOpen size={14} /> },
  { id: "itinerary", label: "AI Itinerary", icon: <Calendar size={14} /> },
  { id: "cultural", label: "Cultural Intelligence", icon: <Brain size={14} /> },
];

function TravelGuidePage() {
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const t = useTranslations({
    pageTitle: "AI Travel Guide",
    pageSubtitlePrefix: "Powered by AI • Content in",
    inputPlaceholder: "Enter city, country, or destination...",
    generateBtn: "Generate",
    tabGuide: "Travel Guide",
    tabItinerary: "AI Itinerary",
    tabCultural: "Cultural Intelligence",
    emptyGuideTitle: "No destination selected",
    emptyGuideDesc: "Enter a city or country above to generate your AI travel guide",
    mustVisitLabel: "Must-Visit Places",
    foodLabel: "Famous Food & Cuisine",
    etiquetteLabel: "Cultural Etiquette",
    transportLabel: "Transportation Tips",
    hiddenGemsLabel: "Hidden Gems",
    emergencyLabel: "Emergency Numbers",
    itineraryConfigTitle: "Customize Your Itinerary",
    daysLabel: "Number of Days",
    budgetLabel: "Budget",
    interestsLabel: "Interests",
    generateItinerary: "Generate Itinerary",
    emptyItineraryTitle: "No itinerary generated",
    emptyItineraryDesc: "Configure your trip above and click Generate Itinerary",
    generateCultural: "Generate Cultural Intelligence",
    greetingCustoms: "Greeting Customs",
    diningEtiquette: "Dining Etiquette",
    socialNorms: "Social Norms",
    thingsToAvoid: "Things to Avoid",
    dressCode: "Dress Code",
    tipping: "Tipping Culture",
    religiousConsiderations: "Religious Considerations",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    day: "Day",
    mustTry: "Must Try",
  });
  const [activeTab, setActiveTab] = useState("guide");
  const [locationInput, setLocationInput] = useState(
    searchParams.get("location") || ""
  );
  const [guide, setGuide] = useState<TravelGuide | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [culturalIntel, setCulturalIntel] = useState<Record<string, string | string[]> | null>(null);
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);
  const [isLoadingItinerary, setIsLoadingItinerary] = useState(false);
  const [isLoadingCultural, setIsLoadingCultural] = useState(false);
  const [error, setError] = useState("");
  const [days, setDays] = useState("3");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["History & Culture", "Food & Cuisine"]);
  const [budget, setBudget] = useState("moderate");
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  const initialLocation = searchParams.get("location");
  useEffect(() => {
    if (initialLocation) {
      setLocationInput(initialLocation);
      handleFetchGuide(initialLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLocation]);

  const handleFetchGuide = async (loc?: string) => {
    const location = loc || locationInput;
    if (!location.trim()) return;
    setIsLoadingGuide(true);
    setError("");
    try {
      const res = await fetch("/api/travel-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, language }),
      });
      const data = await res.json();
      if (data.guide) setGuide(data.guide);
      else setError("Could not generate travel guide. Please check your API key.");
    } catch {
      setError("Failed to connect to AI service.");
    } finally {
      setIsLoadingGuide(false);
    }
  };

  const handleFetchItinerary = async () => {
    if (!locationInput.trim()) return;
    setIsLoadingItinerary(true);
    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: locationInput,
          days: parseInt(days),
          interests: selectedInterests,
          budget,
          language,
        }),
      });
      const data = await res.json();
      if (data.itinerary) setItinerary(data.itinerary);
    } catch {
      setError("Failed to generate itinerary.");
    } finally {
      setIsLoadingItinerary(false);
    }
  };

  const handleFetchCultural = async () => {
    if (!locationInput.trim()) return;
    setIsLoadingCultural(true);
    try {
      const res = await fetch("/api/cultural-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: locationInput, language }),
      });
      const data = await res.json();
      if (data.intelligence) setCulturalIntel(data.intelligence);
    } catch {
      setError("Failed to fetch cultural intelligence.");
    } finally {
      setIsLoadingCultural(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language);

  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.05),transparent)] pointer-events-none" />

      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <BookOpen size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t.pageTitle}</h1>
              <p className="text-white/50 text-sm">
                {t.pageSubtitlePrefix}{" "}
                <span className="text-sky-400">
                  {currentLang?.flag} {currentLang?.name}
                </span>
              </p>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3 mb-6"
          >
            <div className="relative flex-1">
              <MapPin
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <Input
                placeholder={t.inputPlaceholder}                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleFetchGuide();
                    if (activeTab === "itinerary") handleFetchItinerary();
                    if (activeTab === "cultural") handleFetchCultural();
                  }
                }}
                className="pl-9"
              />
            </div>
            <Button
              onClick={() => {
                handleFetchGuide();
                if (activeTab === "itinerary") handleFetchItinerary();
                if (activeTab === "cultural") handleFetchCultural();
              }}
              className="gap-2 shrink-0"
            >
              <Sparkles size={16} />
              {t.generateBtn}
            </Button>
          </motion.div>

          {/* Tabs */}
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Guide Tab */}
          <AnimatePresence mode="wait">
            {activeTab === "guide" && (
              <motion.div
                key="guide"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {isLoadingGuide ? (
                  <LoadingOverlay message="Generating your AI travel guide..." />
                ) : guide ? (
                  <div className="space-y-6">
                    {/* Overview */}
                    <Card>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shrink-0">
                          <MapPin size={18} className="text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white mb-2">
                            {locationInput}
                          </h2>
                          <p className="text-white/60 leading-relaxed">{guide.overview}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm text-white/50">
                          <Clock size={14} className="text-sky-400" />
                          <span>{guide.bestTimeToVisit}</span>
                        </div>
                      </div>
                    </Card>

                    {/* Must Visit */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Star size={16} className="text-amber-400" />
                        <h3 className="text-lg font-semibold text-white">{t.mustVisitLabel}</h3>
                        <Badge variant="warning">{guide.mustVisitPlaces?.length || 0}</Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {guide.mustVisitPlaces?.map((place, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <Card className="hover:border-white/20 transition-colors h-full">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-semibold text-white text-sm">{place.name}</h4>
                                <div className="flex items-center gap-1 text-xs text-amber-400 shrink-0">
                                  <Star size={10} className="fill-current" />
                                  {place.rating}
                                </div>
                              </div>
                              <p className="text-xs text-white/50 leading-relaxed mb-3">
                                {place.description}
                              </p>
                              <Badge variant="info" className="text-xs">{place.category}</Badge>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Famous Food */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Utensils size={16} className="text-emerald-400" />
                        <h3 className="text-lg font-semibold text-white">{t.foodLabel}</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {guide.famousFood?.map((food, i) => (
                          <Card key={i} className="flex gap-3">
                            <div className="text-2xl">🍜</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm text-white">{food.name}</span>
                                {food.mustTry && <Badge variant="success" className="text-xs">{t.mustTry}</Badge>}
                              </div>
                              <p className="text-xs text-white/50">{food.description}</p>
                              {food.where && (
                                <p className="text-xs text-sky-400 mt-1">📍 {food.where}</p>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Cultural Etiquette */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Users size={16} className="text-violet-400" />
                        <h3 className="text-lg font-semibold text-white">{t.etiquetteLabel}</h3>
                      </div>
                      <div className="space-y-3">
                        {guide.culturalEtiquette?.map((tip, i) => (
                          <Card
                            key={i}
                            className={`flex gap-3 border-l-2 ${
                              tip.severity === "important"
                                ? "border-l-red-500"
                                : tip.severity === "avoid"
                                ? "border-l-amber-500"
                                : "border-l-emerald-500"
                            }`}
                          >
                            <div className="text-lg">
                              {tip.severity === "important" ? "⚠️" : tip.severity === "avoid" ? "🚫" : "✅"}
                            </div>
                            <div>
                              <span className="text-xs font-medium text-white/40 uppercase tracking-wide">
                                {tip.category}
                              </span>
                              <p className="text-sm text-white/70 mt-0.5">{tip.tip}</p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Transportation & Hidden Gems */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Train size={16} className="text-sky-400" />
                          <h3 className="text-lg font-semibold text-white">{t.transportLabel}</h3>
                        </div>
                        <Card>
                          <ul className="space-y-2">
                            {guide.transportationTips?.map((tip, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                                <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </Card>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Gem size={16} className="text-pink-400" />
                          <h3 className="text-lg font-semibold text-white">{t.hiddenGemsLabel}</h3>
                        </div>
                        <Card>
                          <ul className="space-y-2">
                            {guide.hiddenGems?.map((gem, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                                <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 shrink-0" />
                                {gem}
                              </li>
                            ))}
                          </ul>
                        </Card>
                      </div>
                    </div>

                    {/* Emergency Contacts */}
                    {guide.emergencyNumbers && guide.emergencyNumbers.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Phone size={16} className="text-red-400" />
                          <h3 className="text-lg font-semibold text-white">{t.emergencyLabel}</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {guide.emergencyNumbers.map((contact, i) => (
                            <Card key={i} className="text-center py-4">
                              <div className="text-2xl mb-1">📞</div>
                              <div className="font-bold text-lg text-red-400">{contact.number}</div>
                              <div className="text-xs text-white/50">{contact.service}</div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <BookOpen size={28} className="text-white/20" />
                    </div>
                    <h3 className="text-white/40 font-medium mb-2">{t.emptyGuideTitle}</h3>
                    <p className="text-white/25 text-sm">{t.emptyGuideDesc}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Itinerary Tab */}
            {activeTab === "itinerary" && (
              <motion.div
                key="itinerary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Itinerary Config */}
                <Card className="mb-6">
                  <h3 className="font-semibold text-white mb-4">{t.itineraryConfigTitle}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-white/50 mb-1.5 block">{t.daysLabel}</label>
                      <Select
                        value={days}
                        onValueChange={setDays}
                        options={[
                          { value: "1", label: "1 Day" },
                          { value: "2", label: "2 Days" },
                          { value: "3", label: "3 Days" },
                          { value: "5", label: "5 Days" },
                          { value: "7", label: "1 Week" },
                          { value: "10", label: "10 Days" },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1.5 block">{t.budgetLabel}</label>
                      <Select
                        value={budget}
                        onValueChange={setBudget}
                        options={[
                          { value: "budget", label: "Budget 💰" },
                          { value: "moderate", label: "Moderate 💰💰" },
                          { value: "luxury", label: "Luxury 💰💰💰" },
                        ]}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-2 block">{t.interestsLabel}</label>
                    <div className="flex flex-wrap gap-2">
                      {TRAVEL_INTERESTS.map((interest) => (
                        <button
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                            selectedInterests.includes(interest)
                              ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                              : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={handleFetchItinerary} disabled={isLoadingItinerary} className="gap-2">
                      <Calendar size={16} />
                      {t.generateItinerary}
                    </Button>
                  </div>
                </Card>

                {isLoadingItinerary ? (
                  <LoadingOverlay message="Creating your personalized itinerary..." />
                ) : itinerary.length > 0 ? (
                  <div className="space-y-4">
                    {itinerary.map((day) => (
                      <Card
                        key={day.day}
                        className="overflow-hidden"
                      >
                        <button
                          className="w-full flex items-center justify-between cursor-pointer"
                          onClick={() => setExpandedDay(expandedDay === day.day - 1 ? null : day.day - 1)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-sm text-white">
                              {day.day}
                            </div>
                            <div className="text-left">
                              <div className="font-semibold text-white text-sm">{t.day} {day.day}</div>
                              <div className="text-xs text-white/50">{day.theme}</div>
                            </div>
                          </div>
                          {expandedDay === day.day - 1 ? (
                            <ChevronUp size={16} className="text-white/40" />
                          ) : (
                            <ChevronDown size={16} className="text-white/40" />
                          )}
                        </button>

                        <AnimatePresence>
                          {expandedDay === day.day - 1 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                                {[
                                   { label: t.morning, activities: day.morning, emoji: "🌅" },
                                   { label: t.afternoon, activities: day.afternoon, emoji: "☀️" },
                                   { label: t.evening, activities: day.evening, emoji: "🌙" },
                                ].map(({ label, activities, emoji }) => (
                                  activities && activities.length > 0 && (
                                    <div key={label}>
                                      <div className="text-xs font-medium text-white/40 mb-3 flex items-center gap-1.5">
                                        <span>{emoji}</span>
                                        {label}
                                      </div>
                                      <div className="space-y-3">
                                        {activities.map((act, i) => (
                                          <div key={i} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                              <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5" />
                                              {i < activities.length - 1 && (
                                                <div className="w-px flex-1 bg-white/10 mt-1" />
                                              )}
                                            </div>
                                            <div className="flex-1 pb-2">
                                              <div className="flex items-start justify-between gap-2">
                                                <div>
                                                  <span className="text-xs text-sky-400 font-medium">{act.time}</span>
                                                  <div className="font-medium text-sm text-white mt-0.5">{act.activity}</div>
                                                  <div className="text-xs text-white/40 mt-0.5">📍 {act.location}</div>
                                                </div>
                                                {act.duration && (
                                                  <Badge variant="outline" className="shrink-0 text-xs">
                                                    <Clock size={10} className="mr-1" />
                                                    {act.duration}
                                                  </Badge>
                                                )}
                                              </div>
                                              <p className="text-xs text-white/50 mt-1">{act.description}</p>
                                              {act.tips && (
                                                <p className="text-xs text-amber-400/80 mt-1">💡 {act.tips}</p>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <Calendar size={28} className="text-white/20" />
                    </div>
                    <h3 className="text-white/40 font-medium mb-2">{t.emptyItineraryTitle}</h3>
                    <p className="text-white/25 text-sm">{t.emptyItineraryDesc}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Cultural Intelligence Tab */}
            {activeTab === "cultural" && (
              <motion.div
                key="cultural"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {!culturalIntel && !isLoadingCultural && (
                  <div className="text-center py-10 mb-6">
                    <Button onClick={handleFetchCultural} className="gap-2 mx-auto">
                      <Brain size={16} />
                      {t.generateCultural}
                    </Button>
                  </div>
                )}

                {isLoadingCultural ? (
                  <LoadingOverlay message="Analyzing cultural patterns..." />
                ) : culturalIntel ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      {
                        key: "greetingCustoms",
                        label: t.greetingCustoms,
                        icon: "🤝",
                        color: "from-sky-500/20 to-blue-500/10",
                        border: "border-sky-500/20",
                      },
                      {
                        key: "diningEtiquette",
                        label: t.diningEtiquette,
                        icon: "🍽️",
                        color: "from-emerald-500/20 to-teal-500/10",
                        border: "border-emerald-500/20",
                      },
                      {
                        key: "socialNorms",
                        label: t.socialNorms,
                        icon: "👥",
                        color: "from-violet-500/20 to-purple-500/10",
                        border: "border-violet-500/20",
                      },
                      {
                        key: "thingsToAvoid",
                        label: t.thingsToAvoid,
                        icon: "🚫",
                        color: "from-red-500/20 to-rose-500/10",
                        border: "border-red-500/20",
                      },
                    ].map(({ key, label, icon, color, border }) => (
                      <Card
                        key={key}
                        className={`bg-gradient-to-br ${color} border ${border}`}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xl">{icon}</span>
                          <h3 className="font-semibold text-white">{label}</h3>
                        </div>
                        <ul className="space-y-2">
                          {(culturalIntel[key] as string[] | undefined)?.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/30 mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    ))}

                    {/* Dresscode & Tipping */}
                    <Card className="bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">👗</span>
                        <h3 className="font-semibold text-white">{t.dressCode}</h3>
                      </div>
                      <p className="text-sm text-white/60">{culturalIntel.dresscode as string}</p>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign size={16} className="text-green-400" />
                        <h3 className="font-semibold text-white">{t.tipping}</h3>
                      </div>
                      <p className="text-sm text-white/60">{culturalIntel.tipping as string}</p>
                    </Card>

                    {culturalIntel.religiousConsiderations && (
                      <Card className="sm:col-span-2 bg-gradient-to-br from-pink-500/20 to-rose-500/10 border border-pink-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Heart size={16} className="text-pink-400" />
                          <h3 className="font-semibold text-white">{t.religiousConsiderations}</h3>
                        </div>
                        <ul className="space-y-2">
                          {(culturalIntel.religiousConsiderations as string[] | undefined)?.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                              <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function TravelGuidePageWrapper() {
  return (
    <Suspense fallback={<LoadingOverlay message="Loading..." />}>
      <TravelGuidePage />
    </Suspense>
  );
}
