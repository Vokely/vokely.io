'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/layouts/Navbar';
import Footer from '@/components/layouts/Footer';
import "@/styles/home.css";
import LenisScroll from '@/hooks/SmoothScroll';
import Hero from '@/components/home/Hero';
import TrustedBy from '@/components/home/TrustedBy';
import HowItWorks from '@/components/home/HowItWorks';
import LovedAndTrusted from '@/components/home/LovedAndTrusted';
import FAQ from '@/components/home/FAQ';
import AIServices from '@/components/home/AIServices';

export default function HomeClientWrapper() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash?.replace("#", "");
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    }
  }, [pathname]);

  return (
    <div>
      <Navbar />
      <LenisScroll>
        <main>
          <Hero />
          <TrustedBy />
          <HowItWorks />
          <AIServices/>
          <LovedAndTrusted />
          <FAQ />
          {/* <FinalCTA /> */}
          <Footer />
        </main>
      </LenisScroll>
    </div>
  );
}
