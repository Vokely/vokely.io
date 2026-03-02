"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const PRIMARY = "rgb(52, 46, 229)";
const COPY = "#0b1220";
const SUBTLE_BG = "rgba(15, 23, 36, 0.04)";

const PHRASES = [
  "Scanning your skills...",
  "Matching you with dream roles...",
  "Analyzing your career trajectory...",
  "Finding opportunities you’ll actually like...",
  "Polishing your profile for recruiters...",
  "Connecting skills → roles → growth...",
];

const CAREER_STATS = [
  "People who fix their top 3 skill gaps increase interview calls by 42%.",
  "Candidates with a roadmap are 3.1x more likely to switch roles successfully.",
  "Updating your resume with role-aligned keywords boosts ATS score by 57%.",
  "Learning just 1 in-demand skill increases salary potential by 18–28%.",
  "Most candidates underestimate their skill overlap with 12+ job roles.",
  "Your next role is usually only 2 missing skills away.",
  "Structured practice boosts interview confidence by 5x.",
  "Skill-based resumes get 37% more recruiter responses.",
];

// -------------------------------------------------------------
// LOGO LOADER  (stroke animated SVG)
// -------------------------------------------------------------

function LogoLoader({
  size = 220,
  strokeWidth = 2.6,
  strokeColor = PRIMARY,
  duration = 2.6,
  stagger = 0.12,
  animate = true, // <--- set to false to disable dash animation (useful for testing)
}) {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const paths = Array.from(svg.querySelectorAll("path"));

    paths.forEach((path, i) => {
      // make sure path is visible even when not animating
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", strokeColor);
      path.setAttribute("stroke-width", String(strokeWidth));
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      path.style.strokeOpacity = "1";
      path.style.vectorEffect = "non-scaling-stroke"; // keeps stroke crisp on scale

      if (!animate) {
        // quick visible fallback: render as solid stroke (no dash)
        path.style.strokeDasharray = "none";
        path.style.strokeDashoffset = "0";
        path.style.animation = "";
        return;
      }

      // animation path: compute length, set dash properties
      let len = 200;
      try {
        len = Math.ceil(path.getTotalLength());
      } catch (e) {
        len = 200;
      }

      path.style.setProperty("--dash", `${len}`);
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;

      const delay = (i * stagger).toFixed(3);
      path.style.animation = `logo-draw ${duration}s ease-in-out ${delay}s infinite`;
      path.style.animationFillMode = "forwards";
    });

    return () => {
      paths.forEach((p) => (p.style.animation = ""));
    };
  }, [strokeColor, strokeWidth, duration, stagger, animate]);

  const height = (size * 92) / 80;

  return (
    <svg
      ref={svgRef}
      width={size}
      height={height}
      viewBox="0 0 80 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <style>{`
        @keyframes logo-draw {
          0% {
            stroke-dashoffset: var(--dash);
            opacity: 0.18;
          }
          45% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          70% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: var(--dash);
            opacity: 0.18;
          }
        }
        svg { shape-rendering: geometricPrecision; }
      `}</style>

      {/* paste your full path elements here (unchanged) */}
      <path d="M38.9593 44.2354C39.5001 43.9232 40.1664 43.9228 40.7075 44.2344L78.8348 66.247C79.3763 66.5596 79.7098 67.1373 79.7098 67.7626C79.7098 68.3878 79.3763 68.9655 78.8348 69.2781L40.7506 91.2659C40.2091 91.5785 39.542 91.5785 39.0005 91.2659C38.4591 90.9533 38.1255 90.3756 38.1255 89.7504V80.9465C38.1255 80.3213 38.4591 79.7436 39.0005 79.4309L59.2096 67.7626L39.8327 56.5759L20.4589 67.7625L24.5841 70.1443L38.958 61.8445C39.5038 61.5293 40.1771 61.532 40.7204 61.8516L40.7504 61.8693L48.3343 66.2469C48.8758 66.5595 49.2094 67.1372 49.2094 67.7625C49.2095 68.3877 48.8759 68.9655 48.3345 69.2781L25.5004 82.462L25.4573 82.4868C24.9161 82.7984 24.2499 82.798 23.709 82.4858L0.874978 69.3019C0.333538 68.9892 0 68.4115 0 67.7863V67.7388C0 67.1136 0.333555 66.5359 0.875017 66.2232L38.9593 44.2354ZM25.8067 73.48C25.7143 73.5645 25.6122 73.6398 25.5013 73.7039C24.9603 74.0167 24.2936 74.0173 23.7521 73.7055L23.709 73.6807L16.0858 69.2792C15.5433 68.9668 15.209 68.3885 15.209 67.7626C15.209 67.1366 15.5433 66.5583 16.0858 66.246L38.958 53.0393C38.9621 53.037 38.9663 53.0346 38.9704 53.0322C38.9734 53.0305 38.9764 53.0289 38.9793 53.0272L39.0218 53.0035C39.5638 52.7006 40.2257 52.7075 40.7612 53.0217C40.8698 53.0854 40.9699 53.1599 41.0605 53.2432L63.2782 66.0701C63.3983 66.108 63.5152 66.1592 63.6268 66.2238C64.1677 66.5365 64.5009 67.114 64.5009 67.7388V67.7863C64.5009 68.4112 64.1677 68.9886 63.6268 69.3014C63.5152 69.3659 63.3983 69.4171 63.2783 69.455L41.6256 81.9568V86.7192L74.4598 67.7626L39.8344 47.7717L5.20888 67.7626L24.5841 78.9495L43.9591 67.7628L39.8328 65.381L25.8067 73.48Z" />
      <path d="M40.7513 0.234859C41.2923 0.547575 41.6256 1.12509 41.6256 1.75002V10.5076C41.6256 11.1336 41.2913 11.7119 40.7488 12.0242L11.0855 29.1511L11.1204 51.5035L30.5004 40.3139V35.5503L17.8753 42.8399C17.3338 43.1525 16.6667 43.1525 16.1252 42.8399C15.5838 42.5273 15.2502 41.9496 15.2502 41.3243V32.5192C15.2502 31.893 15.5848 31.3145 16.1276 31.0023L39.0029 17.8433C39.5445 17.5318 40.211 17.5326 40.7518 17.8454C41.2925 18.1582 41.6256 18.7355 41.6256 19.3603V28.1654H38.1255V22.3859L18.7503 33.5314V38.2931L31.3342 31.0274L31.3772 31.0026C31.9188 30.6908 32.5854 30.6914 33.1264 31.0042C33.6673 31.3169 34.0005 31.8943 34.0005 32.5192V41.3718C34.0005 41.9967 33.6673 42.5741 33.1264 42.8869C33.0148 42.9514 32.8979 43.0026 32.7778 43.0405L10.5527 55.8729C10.4613 55.956 10.3604 56.03 10.251 56.0933C9.7101 56.406 9.04344 56.4066 8.50193 56.0949L8.46068 56.0711C7.91194 55.7552 7.57667 55.1675 7.58397 54.5343C7.58537 54.4134 7.59921 54.2945 7.62455 54.1791L7.58386 28.1444C7.58288 27.5182 7.91655 26.9392 8.45884 26.6261L38.1255 9.49723V4.77795L3.50005 24.7268V64.7073L38.1255 44.7164V36.9693H41.6256V45.7269C41.6256 46.3528 41.2913 46.9311 40.7488 47.2435L40.7093 47.2662L40.7075 47.2672L2.62503 69.254C2.08357 69.5666 1.41647 69.5666 0.87501 69.254C0.333552 68.9414 0 68.3637 0 67.7384V23.7153C0 23.0895 0.334158 22.5114 0.876399 22.199L39.0019 0.233659C39.5434 -0.0783146 40.2102 -0.077857 40.7513 0.234859Z" />
      <path d="M39 0.23445C39.5415 -0.0781595 40.2086 -0.0781493 40.7501 0.234476L78.8756 22.2473C79.4175 22.5602 79.7512 23.1387 79.7506 23.7645L79.7093 67.7638C79.7087 68.3888 79.375 68.966 78.8336 69.2782C78.2923 69.5904 77.6255 69.5902 77.0843 69.2778L39 47.29C38.4586 46.9773 38.125 46.3996 38.125 45.7744V36.9693C38.125 36.344 38.4585 35.7663 39 35.4537C39.5415 35.1411 40.2086 35.1411 40.75 35.4537L68.6207 51.5444L68.5857 29.1529L49.2502 17.9889V22.7525L63.6254 31.0524C64.1694 31.3665 64.5034 31.9482 64.5003 32.5764L64.4578 41.3565C64.4548 41.9803 64.1201 42.5552 63.5792 42.8658C63.0383 43.1763 62.373 43.1755 61.8328 42.8636L39 29.681C38.4585 29.3683 38.125 28.7906 38.125 28.1654V19.3603H41.625V27.155L60.9724 38.3254L60.9954 33.5755L46.6251 25.2784C46.0836 24.9658 45.7501 24.388 45.7501 23.7628V14.9577C45.7501 14.3325 46.0837 13.7547 46.6251 13.4421C47.1666 13.1295 47.8337 13.1295 48.3752 13.4422L71.2092 26.6261C71.7498 26.9382 72.0832 27.5147 72.0842 28.1389L72.1255 54.5755C72.1264 55.2012 71.7933 55.7799 71.2517 56.0931C70.71 56.4064 70.0423 56.4067 69.5005 56.0938L41.625 40.0004V44.764L76.2121 64.7327L76.2496 24.7726L41.625 4.78123V10.5076H38.125V1.75002C38.125 1.12479 38.4586 0.547059 39 0.23445Z" />
    </svg>
  );
}


// -------------------------------------------------------------
// MAIN SCREEN LOADER
// -------------------------------------------------------------

export default function CareerLoader({ fullText }) {
  const [phraseIndex, setPhraseIndex] = useState(() =>
    Math.floor(Math.random() * PHRASES.length)
  );

  const [careerStatIndex, setCareerStatIndex] = useState(() =>
    Math.floor(Math.random() * CAREER_STATS.length)
  );

  // phrase rotation every 2.5s
  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
    }, 2500);

    return () => clearInterval(id);
  }, []);

  // random stat rotation every 4–7s
  useEffect(() => {
    let active = true;
    let timeoutId;

    const scheduleNext = () => {
      if (!active) return;

      const nextMs = 4000 + Math.floor(Math.random() * 3000);

      timeoutId = setTimeout(() => {
        setCareerStatIndex(
          Math.floor(Math.random() * CAREER_STATS.length)
        );
        scheduleNext();
      }, nextMs);
    };

    scheduleNext();

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "#ffffff" }}
    >
      <div
        className="flex flex-col items-center justify-center p-6 rounded-lg"
        aria-live="polite"
      >
        {/* logo */}
        <div
          style={{
            width: 260,
            height: (260 * 92) / 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <LogoLoader
            size={220}
            strokeWidth={2.6}
            strokeColor={PRIMARY}
            duration={2.6}
            stagger={0.12}
          />
        </div>

        {/* rotating phrase */}
        <motion.div
          key={phraseIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          className="inline-flex items-center gap-3 rounded-full px-4 py-2"
          style={{
            background: SUBTLE_BG,
            border: "1px solid rgba(11,18,32,0.06)",
          }}
          suppressHydrationWarning
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: PRIMARY,
              boxShadow: `0 0 10px ${PRIMARY}`,
            }}
          />
          <p
            style={{
              color: COPY,
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
            }}
            suppressHydrationWarning
          >
            {PHRASES[phraseIndex]}
          </p>
        </motion.div>

        {/* rotating career stat */}
        <motion.div
          key={careerStatIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mt-3 max-w-xl text-center"
          style={{
            color: PRIMARY,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 0.2,
          }}
          suppressHydrationWarning
        >
          {CAREER_STATS[careerStatIndex]}
        </motion.div>

        {/* hidden sr-only helper */}
        <div className="sr-only" aria-hidden>
          {fullText || "Crunching skills and matching roles..."}
        </div>
      </div>
    </div>
  );
}
