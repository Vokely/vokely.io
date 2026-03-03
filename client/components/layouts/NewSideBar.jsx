"use client";

import { LogOut, Menu, BookOpen, ChartLine, ArrowLeftFromLine, LayoutDashboard, Speech, FileChartPie } from "lucide-react";
import Profile from "../icons/Profile";
import useNavigationStore from "@/store/navigationStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import CubeLogo from "../icons/CubeLogo";

import { ArrowUpRight } from "lucide-react";
import TextLogo from "../icons/TextLogo";
import AccountDetails from "./Accounts";

const AccountSection = ({ user, setIsAccountsOpen, setIsPricingOpen }) => {
  const rawPlan = (user?.plan_details?.name || "free").toLowerCase();

  const match = rawPlan.match(/(gold|silver|pro)/);
  const planType = match ? match[1] : "free";
  const planLabel = planType; // keep lowercase like the reference screenshot

  const badgeColors = {
    gold: "bg-yellow-400 text-slate-900",
    silver: "bg-gray-300 text-slate-900",
    pro: "bg-cyan-400 text-slate-900",
    free: "bg-slate-400 text-white",
  };

  const ringColors = {
    gold: "ring-yellow-400",
    silver: "ring-gray-300",
    pro: "ring-cyan-400",
    free: "ring-slate-400",
  };

  const badgeColor = badgeColors[planType] || badgeColors.free;
  const ringColor = ringColors[planType] || ringColors.free;

  return (
    <div
      className="relative flex md:flex-col items-center gap-3 md:gap-0 cursor-pointer text-gray-400 md:text-black"
      onClick={() => {
        setIsAccountsOpen(true);
        setIsPricingOpen(false);
      }}
    >
      <div className="relative flex flex-col items-center">
        <div
          className={`
            relative flex h-9 w-9 items-center justify-center
            rounded-full bg-[#1D4ED8] text-white text-sm font-semibold
            ring-2 ${ringColor}
          `}
        >
          <span className="uppercase">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </span>

          <span
            className={`
              absolute -bottom-1 left-1/2 -translate-x-1/2
              rounded-md border border-black/10 px-1.5 py-[1px]
              text-[9px] leading-none font-semibold
              shadow-sm ${badgeColor}
            `}
          >
            {planLabel}
          </span>

        </div>
      </div>

      <span className="text-[14px] md:text-xs mt-1 hover:text-white md:hover:text-primary">
        Account
      </span>
    </div>
  );
};

export default function NewSideBar() {
  const { clearUser, user } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const { setActiveMenu, activeMenu } = useNavigationStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAccountsOpen, setIsAccountsOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const menuItems = [
    { name: "Resume Details", link: "/profile", icon: <Profile size={20} /> },
    { name: "Dashboard", link: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "ATS Checker", link: `/ats-checker`, icon: <FileChartPie size={20} /> },
    { name: "AI Interviewer", link: `/ai-interviewer`, icon: <Speech size={20} /> },
    { name: "AI Learning Guide", link: `/ai-learning-guide`, icon: <BookOpen size={20} /> },
    { name: "AI Skill Gap Analysis", link: `/skill-gap-analysis`, icon: <ChartLine size={20} /> },
  ];

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const handleLogout = async (all = false) => {
    const res = await fetch(`/api/auth/signout?all=false`);
    if (res.ok) {
      localStorage.clear();
      clearUser();
      router.push(`${process.env.NEXT_PUBLIC_CURRENT_URL}/signin`);
    }
  };

  // Sync active menu with current path
  useEffect(() => {
    const matchedItem = menuItems.find((item) => pathname.startsWith(item.link));
    if (matchedItem) setActiveMenu(matchedItem.name);
  }, [pathname, setActiveMenu]);

  return (
    <>
      {isAccountsOpen && (
        <AccountDetails
          user={user}
          onClose={() => setIsAccountsOpen(false)}
          handleLogout={handleLogout}
        />
      )}
      {/* Mobile Hamburger Button */}
      {!isDrawerOpen && (
        <button
          className="fixed top-2 left-2 z-[999] bg-primary text-white p-2 rounded-md shadow-md md:hidden"
          onClick={toggleDrawer}
        >
          <Menu size={18} />
        </button>
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed bg-[#b191a] top-0 left-0 h-screen px-4 bg-[#1e1f20] text-gray-400 z-[999] transform transition-transform duration-300 ease-in-out md:hidden ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          onClick={toggleDrawer}
        >
          <ArrowLeftFromLine size={20} />
        </button>

        {/* Logo */}
        <div className="mt-2">
          <a href="/">
            <span className="flex items-center">
              <CubeLogo color="#ece6e7" size="30" />
              <TextLogo
                color="#ece6e7"
                height="33"
                width="58"
                className="inline-block ml-1 mt-1"
              />
            </span>
          </a>
        </div>

        {/* Menu */}
        <ul className="mt-10 flex flex-col gap-6 items-start">
          {menuItems.map((item, index) => (
            <li key={index} className="flex flex-col items-center cursor-pointer">
              <a
                href={item.link}
                className={`flex items-center gap-2 ${
                  activeMenu === item.name ? "text-white" : "hover:text-gray-200"
                }`}
                onClick={() => {
                  setActiveMenu(item.name);
                  toggleDrawer();
                }}
              >
                <span className="mb-1">{item.icon}</span>
                <span className="text-[14px]">{item.name}</span>
              </a>
            </li>
          ))}
        </ul>

        {/* Bottom Section - Mobile */}
        <div className="absolute bottom-2 left-4 w-full flex flex-col gap-6 justify-center items-start">
          <AccountSection
            user={user}
            setIsAccountsOpen={setIsAccountsOpen}
            setIsPricingOpen={setIsPricingOpen}
          />

          <button
            className="flex items-start gap-5 text-[14px] hover:text-white"
            onClick={() => {
              setIsPricingOpen(true);
              setIsAccountsOpen(false);
            }}
          >
            <ArrowUpRight size={22} />
            <span>Upgrade</span>
          </button>

          <button
            className="flex items-start gap-5 text-[14px] hover:text-gray-200"
            onClick={handleLogout}
          >
            <LogOut size={22} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden bg-white relative md:flex flex-col items-center sticky top-0 z-30 h-[95vh] w-[80px] border-[1px] border-primary rounded-full ml-2 mt-[2.5vh] text-gray-400">
        {/* Logo */}
        <div className="mt-6 mb-8">
          <a href="/">
            <CubeLogo size="34" color="#1b191a" />
          </a>
        </div>

        {/* Menu Items */}
        <ul className="flex mt-5 flex-col gap-4 items-center">
          {menuItems.map((item, index) => (
            <li key={index} className="flex flex-col items-center cursor-pointer">
              <a
                href={item.link}
                className={`flex flex-col items-center text-xs hover:text-primary ${
                  activeMenu === item.name ? "text-primary" : "text-black"
                }`}
                onClick={() => setActiveMenu(item.name)}
              >
                <div className="p-2 rounded-full">
                  <span className="mb-1">{item.icon}</span>
                </div>
                <span className="text-[11px] text-center">{item.name}</span>
              </a>
            </li>
          ))}
        </ul>

        {/* Bottom Section - Desktop */}
        <div className="absolute bottom-4 w-full flex flex-col gap-4 items-center py-4">
          <AccountSection
            user={user}
            setIsAccountsOpen={setIsAccountsOpen}
            setIsPricingOpen={setIsPricingOpen}
          />
        </div>
      </div>
    </>
  );
}
