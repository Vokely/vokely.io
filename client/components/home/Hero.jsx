// components/Hero.jsx
"use client";

import React from "react";
import RotatingEarth from "@/components/ui/wireframe-dotted-globe";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-50">
      {/* background accents for desktop */}
      <div className="pointer-events-none absolute inset-y-0 right-[-12rem] hidden w-[32rem] rounded-full bg-gradient-to-bl from-indigo-100 via-sky-100 to-slate-50 blur-3xl lg:block" />
      <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-50 blur-3xl" />

      {/* MOBILE: globe just below navbar, big, faded, non-interactable */}
      <div className="pointer-events-none absolute inset-x-0 top-20 flex justify-center md:hidden opacity-40">
        <RotatingEarth
          width={500}
          height={500}
          primaryColor="#4F46E5"
          className="max-w-sm pointer-events-none"
        />
      </div>

      {/* MAIN CONTENT */}
      <div
        className="
          relative mx-auto flex max-w-6xl flex-col
          px-4 pb-10 pt-40
          min-h-[calc(100vh-5rem)]  /* fill screen under navbar on mobile */
          justify-between
          md:min-h-0 md:flex-row md:items-center md:justify-between
          md:px-6 md:pb-24 md:pt-20
        "
      >
        {/* LEFT: text + CTAs (on mobile this is pushed toward bottom) */}
        <div className="relative z-10 flex flex-1 flex-col justify-end max-w-xl text-center md:justify-center lg:text-left">
          <p className="inline-flex items-center justify-center gap-2 self-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 shadow-sm lg:self-start">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            AI Career Platform
          </p>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Redefining your job search
            <span className="block text-indigo-600">
              Impacting careers.
            </span>
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            Vokely transforms how people find jobs and how companies hire—using AI to create faster, smarter, more meaningful matches.
          </p>

          {/* CTA Buttons */}
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <button className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
              Try for free
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("pricing");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                } else {
                  // fallback to anchor if section not present on this route
                  window.location.href = "/#pricing";
                }
              }}
              aria-label="Explore pricing plans"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Explore plans
            </button>
          </div>

          {/* Social proof / stats */}
          <div className="mt-6 flex flex-col items-center gap-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:gap-6 lg:justify-start">
            <div className="flex -space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-indigo-100 text-[11px] font-semibold text-indigo-800">
                EU
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-sky-100 text-[11px] font-semibold text-sky-800">
                US
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-emerald-100 text-[11px] font-semibold text-emerald-800">
                APAC
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-slate-900 text-[11px] font-semibold text-white">
                +99
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 text-center sm:items-start">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Trusted globally
              </span>
              <p className="text-xs text-slate-500">
                10k+ matches · avg. hire time &lt; 14 days
              </p>
            </div>
          </div>

          
        </div>

        {/* DESKTOP / TABLET: Rotating globe to the right, interactive */}
        <div className="relative z-10 mt-10 hidden w-full max-w-md md:block lg:mt-0">
          <RotatingEarth
            width={480}
            height={480}
            primaryColor="#4F46E5"
            className="mx-auto max-w-sm lg:max-w-md"
          />

          {/* Small caption / label under globe */}
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-sm">
            <p className="font-semibold text-slate-900">
              Live global talent network
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Recruiters and job seekers connected in real time across 100+
              countries.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
