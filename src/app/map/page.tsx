"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Globe, Info } from "lucide-react";
import { useTranslations } from "@/lib/use-translations";

const MapComponent = dynamic(
  () => import("@/components/map/map-component").then((m) => m.MapComponent),
  { ssr: false }
);

export default function MapPage() {
  const t = useTranslations({
    pageTitle: "Interactive World Map",
    pageSubtitle: "Click anywhere on the map to explore travel guides for any location",
    infoTip: "Click anywhere on the map to explore",
  });

  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center">
                  <Globe size={18} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">{t.pageTitle}</h1>
              </div>
              <p className="text-white/50 text-sm ml-12">
                {t.pageSubtitle}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm">
              <Info size={14} />
              {t.infoTip}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Map */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative h-[calc(100vh-220px)] min-h-[500px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          >
            <MapComponent />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
