import {
  CircleX,
  LogOut,
  ArrowUpRight,
  Mail,
  User2,
  CreditCard,
  MessageCircle,
} from "lucide-react";
import { createPortal } from "react-dom";

export default function AccountDetails({ user, onClose, handleLogout }) {
  const formatPlanNameRaw = (planDetails) => {
    if (!planDetails?.name) return "Free Plan";
    return planDetails.name;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Normalize tier: gold/pro/silver/free from any string like "gold tier monthly"
  const rawPlan = (user?.plan_details?.name || "free").toLowerCase();
  const tierMatch = rawPlan.match(/(gold|silver|pro)/);
  const planTier = tierMatch ? tierMatch[1] : "free";

  const planLabelPretty = (() => {
    if (planTier === "free") return "Free";
    return planTier.charAt(0).toUpperCase() + planTier.slice(1);
  })();

  const badgeColors = {
    gold: "bg-yellow-400 text-slate-900",
    silver: "bg-gray-300 text-slate-900",
    pro: "bg-cyan-400 text-slate-900",
    free: "bg-slate-500 text-white",
  };

  const ringColors = {
    gold: "ring-yellow-400/80",
    silver: "ring-gray-300/80",
    pro: "ring-cyan-400/80",
    free: "ring-slate-500/80",
  };

  const badgeColor = badgeColors[planTier] || badgeColors.free;
  const ringColor = ringColors[planTier] || ringColors.free;

  const planNameRaw = formatPlanNameRaw(user?.plan_details);
  const planExpiry = user?.plan_details?.expiry_date
    ? formatDate(user.plan_details.expiry_date)
    : "No expiry";

  const username = user?.email?.split("@")[0] || "User";
  const email = user?.email || "No email";

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-3 sm:px-6">
      <div
        className="
          relative w-full max-w-4xl rounded-2xl border border-white/10
          bg-gradient-to-br from-[#111827] via-[#020617] to-[#020617]
          shadow-2xl shadow-black/40 text-slate-50 max-h-[92vh] overflow-y-auto
        "
      >
        {/* Close button */}
        <button
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          onClick={onClose}
        >
          <CircleX className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-white/10 px-6 pt-6 pb-5 sm:px-8 sm:pt-7 sm:pb-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Account
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <h1 className="text-2xl sm:text-[26px] font-semibold text-slate-50 leading-snug">
              Your profile & subscription
            </h1>
            <span className="mt-1 inline-flex items-center rounded-full bg-white/5 px-3.5 py-1.5 text-[12px] font-medium text-slate-200 ring-1 ring-white/10">
              Current plan:
              <span className="ml-1 font-semibold">{planLabelPretty}</span>
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-7 pt-5 sm:px-8 sm:pb-9 sm:pt-7">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            {/* Left: Profile & subscription */}
            <div className="space-y-6">
              {/* Profile card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
                <div className="flex items-center gap-4 sm:gap-5">
                  {/* Avatar + plan badge */}
                  <div
                    className={`
                      relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center
                      rounded-full bg-indigo-500 text-white text-lg font-semibold
                      ring-2 ${ringColor}
                    `}
                  >
                    <span className="text-lg sm:text-xl">
                      {username.charAt(0).toUpperCase()}
                    </span>
                    <span
                      className={`
                        absolute -bottom-1.5 left-1/2 -translate-x-1/2
                        rounded-full border border-black/20 px-2.5 py-[3px]
                        text-[10px] leading-none font-semibold shadow-sm whitespace-nowrap ${badgeColor}
                      `}
                    >
                      {planLabelPretty}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-semibold text-slate-50 truncate">
                      {username}
                    </p>
                    <p className="mt-1 text-xs sm:text-sm text-slate-300 flex items-center gap-1.5 break-all">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span>{email}</span>
                    </p>
                    <p className="mt-2 inline-flex rounded-full bg-emerald-500/10 px-2.5 py-[3px] text-[11px] font-medium text-emerald-300">
                      Signed in to Vokely
                    </p>
                  </div>
                </div>

                {/* Account fields */}
                <div className="mt-5 grid gap-3 sm:gap-4 text-sm sm:grid-cols-2">
                  <div className="rounded-xl border border-white/5 bg-black/20 p-3.5 sm:p-4">
                    <p className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-400">
                      <User2 className="w-3.5 h-3.5" />
                      Username
                    </p>
                    <p className="font-medium text-slate-50 break-all">
                      {username}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/20 p-3.5 sm:p-4">
                    <p className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-400">
                      <CreditCard className="w-3.5 h-3.5" />
                      Plan
                    </p>
                    <p className="font-medium text-slate-50 break-all">
                      {planNameRaw}
                    </p>
                    {user?.plan_details && (
                      <p className="mt-1 text-[11px] text-slate-400">
                        Expires: <span>{planExpiry}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Support & security */}
            <div className="space-y-5">

              {/* Security / logout */}
              <div className="space-y-4 rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/12 via-slate-900/70 to-slate-950/85 p-5 sm:p-6">
                <div className="border-b border-white/10 pb-3.5">
                  <p className="text-sm sm:text-base text-slate-50">
                    You are signed in as{" "}
                    <span className="font-semibold break-all">{email}</span>
                  </p>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                    Use these actions to secure or sign out of your account
                    across devices.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out of this device</span>
                  </button>

                  <div className="mt-2 flex flex-col gap-1 text-xs sm:text-sm text-slate-200">
                    <p className="font-medium">Sign out of all sessions</p>
                    <p className="text-[11px] sm:text-xs text-slate-300">
                      This will log you out from all browsers and devices where
                      you&apos;re currently signed in.
                    </p>
                  </div>

                  <button
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                    onClick={() => handleLogout("true")}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out of all devices</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
