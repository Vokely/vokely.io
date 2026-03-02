"use client";

import { motion } from "framer-motion";
import Lock from "../icons/Lock";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function PremiumOverlay({ children, featureName}) {
  const {user} = useAuthStore();
  const router = useRouter();
  const features = user?.plan_details?.features || [];
  const isLocked = !features.includes(featureName);

  if(!isLocked) return( <>{children}</>);

  return (
    <div className="relative h-fit py-10">
      {/* Render the actual content */}
      <div className={`${isLocked ? "pointer-events-none" : ""}`}>
        {children}
      </div>

      {/* Overlay when locked */}
      {isLocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center
                     backdrop-blur-md rounded-xl shadow-lg
                     border border-white/20"
        >
          <div className="flex flex-col items-center space-y-4 p-6 text-center">
            <Lock/>
            <p className="text-lg font-semibold text-gray-900">
              Unlock your full career potential 🚀
            </p>
            <button
              onClick={()=> router.push(`/#pricing`)}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 
                         text-white font-medium shadow-md hover:shadow-lg transition"
            >
              Upgrade Now
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
