
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  Crown,
  DatabaseBackup,
  Download,
  FileSpreadsheet,
  FileText,
  Globe2,
  Headphones,
  Info,
  Lock,
  Mail,
  MessageCircle,
  MoreHorizontal,
  PackageCheck,
  Phone,
  PieChart,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  UserCog,
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import PageHeader from "../components/PageHeader";
import fleetDocLogo from "../assets/FleetDoc-logo.png";
import companyLogo from "../assets/FleetDoc-logo 1.png";

/* ============================================================
   CONSTANTS
============================================================ */

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

// Only real, verified payment data is cached so receipt/history can retain
// Razorpay IDs even when the subscriptions endpoint does not return gateway fields.
const VERIFIED_RECEIPTS_KEY = "fleetdoc_verified_payment_receipts_v1";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("fleetdoc_access_token") || ""}`,
});

const normalizeSubscriptions = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    ...item,
    planId: item.planId ?? item.plan_id ?? item.plan?.id,
    status: String(item.status ?? "").toLowerCase(),
  }));
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(price);

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const makeReceiptNumber = (subscriptionId, paymentId) => {
  const source = paymentId || subscriptionId;
  if (!source) return "—";
  const suffix = String(source)
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-12)
    .toUpperCase();
  return suffix ? `FD-REC-${suffix}` : "—";
};

const getCurrentCustomer = (companyName = "", customerOverride = null) => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("fleetdoc_user") || "null");
  } catch {
    user = null;
  }

  // Login in the current project stores these values individually rather
  // than in a `fleetdoc_user` JSON object. Use both sources so the receipt
  // always uses the real logged-in account details.
  const storedName = localStorage.getItem("fleetdoc_user_name") || "";
  const storedEmail = localStorage.getItem("fleetdoc_user_email") || "";
  const storedPhone = localStorage.getItem("fleetdoc_user_phone") || "";

  return {
    companyName: String(companyName || "").trim() || "—",
    name:
      customerOverride?.name ||
      user?.name ||
      user?.fullName ||
      storedName ||
      "—",
    email:
      customerOverride?.email ||
      user?.email ||
      storedEmail ||
      "—",
    phone:
      customerOverride?.phone ||
      customerOverride?.contactNo ||
      user?.phone ||
      user?.contactNo ||
      storedPhone ||
      "—",
  };
};

const readVerifiedReceipts = () => {
  try {
    const value = JSON.parse(localStorage.getItem(VERIFIED_RECEIPTS_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const saveVerifiedReceipt = (receipt) => {
  if (!receipt?.subscriptionId) return;
  const current = readVerifiedReceipts();
  const next = [
    receipt,
    ...current.filter(
      (item) => String(item.subscriptionId || "") !== String(receipt.subscriptionId || "")
    ),
  ].slice(0, 100);
  localStorage.setItem(VERIFIED_RECEIPTS_KEY, JSON.stringify(next));
};

const normalizePaymentMethod = (value) => {
  const method = String(value || "").toLowerCase();
  if (method.includes("upi")) return "UPI";
  if (method.includes("card")) return "Card";
  if (method.includes("netbank")) return "Net Banking";
  if (method.includes("wallet")) return "Wallet";
  return value ? String(value) : "Razorpay";
};

/* Build receipt information only from a real backend subscription/payment.
   No demo receipt, fake date, fake amount or seeded localStorage history is used. */
const buildReceipt = (
  plan,
  subscription,
  paymentInfo = {},
  companyName = "",
  customerOverride = null
) => {
  if (!plan || !subscription) return null;

  const status = String(subscription.status || "").toLowerCase();
  if (!["active", "expired", "paid"].includes(status)) return null;

  const purchaseDate =
    paymentInfo.purchaseDate ||
    subscription.startedAt ||
    subscription.started_at ||
    null;

  if (!purchaseDate) return null;

  const amount = Number(
    paymentInfo.amount ?? subscription.amount ?? 0
  );

  if (!Number.isFinite(amount) || amount <= 0) return null;

  const paymentId =
    [
      paymentInfo.paymentId,
      paymentInfo.razorpay_payment_id,
      subscription.gatewayPaymentId,
      subscription.gateway_payment_id,
    ].find(
      (value) =>
        value &&
        String(value) !== "Not available" &&
        String(value) !== "—"
    ) || null;

  const orderId =
    [
      paymentInfo.orderId,
      paymentInfo.razorpay_order_id,
      subscription.gatewayOrderId,
      subscription.gateway_order_id,
    ].find(
      (value) =>
        value &&
        String(value) !== "Not available" &&
        String(value) !== "—"
    ) || null;

  return {
    receiptNumber: makeReceiptNumber(subscription.id, paymentId),
    subscriptionId: subscription.id,
    planId: plan.id,
    planName: plan.name,
    amount,
    currency: subscription.currency || "INR",
    status: "paid",
    purchaseDate,
    validFrom: subscription.startedAt || subscription.started_at || null,
    validUntil: subscription.expiresAt || subscription.expires_at || null,
    paymentMethod: normalizePaymentMethod(paymentInfo.paymentMethod || subscription.paymentMethod || subscription.payment_method || "Razorpay"),
    orderId: orderId || "Not available",
    paymentId: paymentId || "Not available",
    customer: customerOverride || getCurrentCustomer(companyName),
  };
};

/* ============================================================
   PREMIUM PLANS
============================================================ */

const PREMIUM_PLANS = [
  {
    id: "notification",
    name: "Notification Premium",
    shortName: "Notifications",
    category: "Communication",
    price: 499,
    billing: "month",
    popular: true,
    icon: Bell,
    iconSmall: MessageCircle,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    softBg:
      "from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/40 dark:via-purple-950/30 dark:to-fuchsia-950/30",
    description:
      "Keep your fleet team informed with automated WhatsApp, SMS and Email notifications.",
    features: [
      "WhatsApp notifications",
      "SMS notifications",
      "Email notifications",
      "Document expiry alerts",
      "EMI due reminders",
      "Challan alerts",
      "Road tax reminders",
      "Notification history",
    ],
    details:
      "Notification Premium connects FleetDoc with your communication channels so important fleet events do not get missed. Configure automated alerts for documents, EMIs, challans and road-tax deadlines.",
    channels: [
      {
        name: "WhatsApp",
        icon: MessageCircle,
        description: "Send automated fleet alerts through WhatsApp.",
      },
      {
        name: "SMS",
        icon: Smartphone,
        description: "Deliver time-sensitive reminders through SMS.",
      },
      {
        name: "Email",
        icon: Mail,
        description: "Send detailed notifications to registered email addresses.",
      },
    ],
  },

  {
    id: "reports",
    name: "Advanced Reports",
    shortName: "Reports",
    category: "Analytics",
    price: 799,
    billing: "month",
    popular: false,
    icon: FileText,
    iconSmall: Download,
    gradient: "from-blue-500 via-cyan-500 to-sky-500",
    softBg:
      "from-blue-50 via-cyan-50 to-sky-50 dark:from-blue-950/40 dark:via-cyan-950/30 dark:to-sky-950/30",
    description:
      "Generate detailed fleet, expense, EMI, document and challan reports.",
    features: [
      "Advanced fleet reports",
      "Expense reports",
      "Revenue reports",
      "Vehicle-wise reports",
      "EMI reports",
      "Document reports",
      "Challan reports",
      "PDF and Excel export",
    ],
    details:
      "Advanced Reports gives managers deeper visibility into fleet operations. Create filtered reports using vehicles, dates, modules and business categories and export them for internal reporting.",
    channels: [
      {
        name: "PDF Reports",
        icon: FileText,
        description: "Generate professional reports for sharing and records.",
      },
      {
        name: "Excel Export",
        icon: FileSpreadsheet,
        description: "Export detailed fleet information to Excel.",
      },
      {
        name: "Custom Filters",
        icon: Search,
        description: "Filter reports by vehicle, date and category.",
      },
    ],
  },

  {
    id: "analytics",
    name: "Fleet Analytics",
    shortName: "Analytics",
    category: "Analytics",
    price: 999,
    billing: "month",
    popular: false,
    icon: TrendingUp,
    iconSmall: PieChart,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    softBg:
      "from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-cyan-950/30",
    description:
      "Turn fleet data into actionable insights with advanced analytics.",
    features: [
      "Vehicle performance",
      "Expense analysis",
      "Revenue analysis",
      "Profitability insights",
      "Cost trends",
      "Fleet utilization",
      "Interactive charts",
      "Performance summaries",
    ],
    details:
      "Fleet Analytics provides a deeper view of operational performance. Understand how your fleet is performing, identify cost trends and monitor important business indicators from one place.",
    channels: [
      {
        name: "Performance",
        icon: TrendingUp,
        description: "Monitor fleet performance trends.",
      },
      {
        name: "Expense",
        icon: BarChart3,
        description: "Analyze fleet expenses and cost movements.",
      },
      {
        name: "Utilization",
        icon: PieChart,
        description: "Understand how efficiently vehicles are being utilized.",
      },
    ],
  },

  {
    id: "roles",
    name: "Advanced User & Roles",
    shortName: "User & Roles",
    category: "Management",
    price: 699,
    billing: "month",
    popular: false,
    icon: UserCog,
    iconSmall: Users,
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    softBg:
      "from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/40 dark:via-amber-950/30 dark:to-yellow-950/30",
    description:
      "Create detailed permissions and control exactly what each team member can access.",
    features: [
      "Custom roles",
      "View permission",
      "Add permission",
      "Edit permission",
      "Delete permission",
      "Export permission",
      "Module-level access",
      "Activity tracking",
    ],
    details:
      "Advanced User & Roles allows administrators to build granular access rules for their organization. Give users only the permissions required for their responsibilities.",
    channels: [
      {
        name: "Custom Roles",
        icon: UserCog,
        description: "Create roles for different team responsibilities.",
      },
      {
        name: "Permissions",
        icon: ShieldCheck,
        description: "Control module and action-level permissions.",
      },
      {
        name: "Team Access",
        icon: Users,
        description: "Manage access across your fleet organization.",
      },
    ],
  },

  {
    id: "security",
    name: "Security & Backup",
    shortName: "Security",
    category: "Security",
    price: 599,
    billing: "month",
    popular: false,
    icon: ShieldCheck,
    iconSmall: DatabaseBackup,
    gradient: "from-slate-600 via-gray-700 to-zinc-800",
    softBg:
      "from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-950/50 dark:via-gray-950/40 dark:to-zinc-950/40",
    description:
      "Protect important fleet information with backup and security tools.",
    features: [
      "Automatic backup",
      "Data recovery",
      "Activity history",
      "Login activity",
      "Security monitoring",
      "Backup history",
      "Recovery support",
      "Data protection tools",
    ],
    details:
      "Security & Backup adds additional protection around important fleet information. Keep track of activity and prepare your organization for recovery scenarios with backup-oriented features.",
    channels: [
      {
        name: "Backup",
        icon: DatabaseBackup,
        description: "Maintain scheduled backups of important information.",
      },
      {
        name: "Activity",
        icon: Clock3,
        description: "Review important account and system activity.",
      },
      {
        name: "Protection",
        icon: ShieldCheck,
        description: "Add additional security controls to your workflow.",
      },
    ],
  },

  {
    id: "api",
    name: "API & Integration",
    shortName: "API",
    category: "Integration",
    price: 1499,
    billing: "month",
    popular: false,
    icon: Globe2,
    iconSmall: Zap,
    gradient: "from-pink-500 via-rose-500 to-red-500",
    softBg:
      "from-pink-50 via-rose-50 to-red-50 dark:from-pink-950/40 dark:via-rose-950/30 dark:to-red-950/30",
    description:
      "Connect FleetDoc with external systems and build custom integrations.",
    features: [
      "REST API access",
      "External system integration",
      "Fleet data synchronization",
      "Webhook support",
      "API activity monitoring",
      "Integration controls",
      "Developer access",
      "System connectivity",
    ],
    details:
      "API & Integration is designed for organizations that need FleetDoc to communicate with other business applications. Use APIs and integration tools to build connected fleet workflows.",
    channels: [
      {
        name: "REST API",
        icon: Globe2,
        description: "Connect external applications with FleetDoc.",
      },
      {
        name: "Webhooks",
        icon: Zap,
        description: "Trigger external workflows from system events.",
      },
      {
        name: "Sync",
        icon: RefreshCw,
        description: "Synchronize selected fleet data between systems.",
      },
    ],
  },
];

/* ============================================================
   ANIMATION VARIANTS
============================================================ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* ============================================================
   PREMIUM CARD
============================================================ */

function PremiumCard({
  plan,
  subscribed,
  onDetails,
  onBuy,
}) {
  const Icon = plan.icon;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -7 }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className="group relative h-full"
    >
      {/* Glow */}
      <div
        className={`absolute -inset-[1px] rounded-[26px] bg-gradient-to-r ${plan.gradient} opacity-0 blur-md transition-all duration-500 group-hover:opacity-25`}
      />

      <div
        className={`relative flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-sm transition-all duration-500 group-hover:border-transparent group-hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900`}
      >
        {/* Top gradient strip */}
        <div
          className={`h-1.5 w-full bg-gradient-to-r ${plan.gradient}`}
        />

        {/* Decorative glow */}
        <div
          className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${plan.gradient} opacity-[0.07] blur-2xl transition-transform duration-700 group-hover:scale-150`}
        />

        <div className="relative flex flex-1 flex-col p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${plan.gradient} text-white shadow-lg`}
            >
              <Icon size={27} strokeWidth={1.8} />
            </div>

            <div className="flex flex-col items-end gap-2">
              {plan.popular && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                  <Sparkles size={11} />
                  Popular
                </span>
              )}

              {subscribed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <CheckCircle2 size={11} />
                  Active
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="mt-5">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              {plan.category}
            </p>

            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              {plan.name}
            </h3>

            <p className="mt-2 min-h-[52px] text-sm leading-6 text-slate-500 dark:text-slate-400">
              {plan.description}
            </p>
          </div>

          {/* Price */}
          <div className="mt-5 flex items-end gap-1">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              ₹{formatPrice(plan.price)}
            </span>

            <span className="mb-1 text-xs font-medium text-slate-400 dark:text-slate-500">
              / {plan.billing}
            </span>
          </div>

          {/* Feature preview */}
          <div className="mt-5 space-y-2.5">
            {plan.features.slice(0, 4).map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <Check size={10} strokeWidth={3} />
                </span>

                <span>{feature}</span>
              </div>
            ))}

            {plan.features.length > 4 && (
              <div className="pl-6 text-xs font-semibold text-slate-400 dark:text-slate-500">
                + {plan.features.length - 4} more features
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-auto grid grid-cols-2 gap-2.5 pt-6">
            <button
              type="button"
              onClick={() => onDetails(plan)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-750"
            >
              <Info size={16} />
              Details
            </button>

            <button
              type="button"
              onClick={() => onBuy(plan)}
              disabled={subscribed}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${plan.gradient} px-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.98] disabled:cursor-default disabled:opacity-70`}
            >
              {subscribed ? (
                <>
                  <CheckCircle2 size={16} />
                  Active
                </>
              ) : (
                <>
                  Buy
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   DETAILS MODAL
============================================================ */

function DetailsModal({
  plan,
  onClose,
  onBuy,
  subscribed,
}) {
  if (!plan) return null;

  const Icon = plan.icon;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.button
          type="button"
          aria-label="Close details"
          onClick={onClose}
          className="absolute inset-0 cursor-default bg-slate-950/55 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: 15,
            scale: 0.97,
          }}
          transition={{
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/40 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          {/* Hero */}
          <div
            className={`relative overflow-hidden bg-gradient-to-br ${plan.gradient} p-6 text-white sm:p-8`}
          >
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur-md">
                <Icon size={31} />
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/70">
                    {plan.category}
                  </span>

                  {plan.popular && (
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                      Popular
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {plan.name}
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
                  {plan.description}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[calc(90vh-220px)] overflow-y-auto p-6 sm:p-8">
            <div className="grid gap-7 lg:grid-cols-[1.35fr_0.85fr]">
              {/* Left */}
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  What's included
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {plan.details}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/60"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                        <Check size={14} strokeWidth={3} />
                      </span>

                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/60">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Included channels
                </p>

                <div className="mt-4 space-y-3">
                  {plan.channels.map((channel) => {
                    const ChannelIcon = channel.icon;

                    return (
                      <div
                        key={channel.name}
                        className="flex gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          <ChannelIcon size={17} />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">
                            {channel.name}
                          </p>

                          <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                            {channel.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-700">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Starting at
                      </p>

                      <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                        ₹{formatPrice(plan.price)}
                      </p>
                    </div>

                    <span className="mb-1 text-xs text-slate-400">
                      / {plan.billing}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={subscribed}
                    onClick={() => {
                      if (subscribed) return;
                      onClose();
                      onBuy(plan);
                    }}
                    className={`mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-lg transition active:scale-[0.98] disabled:cursor-default disabled:opacity-80 ${subscribed
                        ? "bg-emerald-600"
                        : `bg-gradient-to-r ${plan.gradient} hover:shadow-xl`
                      }`}
                  >
                    {subscribed ? (
                      <>
                        <CheckCircle2 size={16} />
                        Active
                      </>
                    ) : (
                      <>
                        Buy Premium
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// /* ============================================================
//    RECEIPT MODAL
// ============================================================ */

// function ReceiptModal({ receipt, onClose }) {
//   if (!receipt) return null;

//   const downloadReceipt = () => {
//     const escapeHtml = (value) =>
//       String(value ?? "—")
//         .replace(/&/g, "&amp;")
//         .replace(/</g, "&lt;")
//         .replace(/>/g, "&gt;")
//         .replace(/"/g, "&quot;")
//         .replace(/'/g, "&#039;");

//     const logo = escapeHtml(fleetDocLogo);
//     const html = `<!doctype html>
// <html><head><meta charset="utf-8" /><title>${escapeHtml(receipt.receiptNumber)}</title>
// <style>
//   @page { size: A4 portrait; margin: 0; }
//   * { box-sizing: border-box; }
//   html, body { margin: 0; padding: 0; background: #fff; color: #0f172a; font-family: Arial, Helvetica, sans-serif; }
//   body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//   .page { width: 210mm; min-height: 297mm; padding: 16mm 17mm; margin: 0 auto; background: #fff; }
//   .logo { display: block; width: 250px; height: auto; margin: 0 auto 14px; }
//   .rule { height: 1px; background: #dbe3ef; }
//   .heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; margin: 18px 0 16px; }
//   .eyebrow { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #64748b; font-weight: 700; }
//   h1 { margin: 4px 0 0; font-size: 24px; letter-spacing: -.5px; }
//   .paid { border: 1px solid #a7f3d0; background: #ecfdf5; color: #047857; padding: 7px 12px; border-radius: 999px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .7px; }
//   .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 9px 24px; padding: 14px 0; }
//   .label { color: #64748b; font-size: 9px; text-transform: uppercase; letter-spacing: .8px; font-weight: 700; }
//   .value { margin-top: 3px; font-size: 11px; font-weight: 700; word-break: break-word; }
//   .customer { margin-top: 8px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 13px 14px; background: #f8fafc; }
//   .customer-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; color: #475569; margin-bottom: 8px; }
//   .row { display: grid; grid-template-columns: 1.5fr .65fr .85fr; gap: 10px; align-items: center; padding: 13px 0; border-bottom: 1px solid #e2e8f0; }
//   .row.head { padding: 9px 0; color: #64748b; font-size: 9px; text-transform: uppercase; letter-spacing: .7px; font-weight: 800; }
//   .row:not(.head) { font-size: 11px; font-weight: 700; }
//   .right { text-align: right; }
//   .total { margin-top: 14px; margin-left: auto; width: 52%; border: 1px solid #dbeafe; border-radius: 12px; padding: 13px 14px; background: linear-gradient(135deg, #eff6ff, #f8fafc); }
//   .total-line { display: flex; justify-content: space-between; gap: 12px; font-size: 10px; color: #475569; margin-top: 5px; }
//   .grand { display: flex; justify-content: space-between; gap: 12px; margin-top: 9px; padding-top: 9px; border-top: 1px solid #bfdbfe; font-size: 16px; font-weight: 900; color: #0f172a; }
//   .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 9px; line-height: 1.6; text-align: center; }
//   .brand { color: #2563eb; font-weight: 800; }
//   .note { margin-top: 12px; padding: 9px 11px; border-radius: 8px; background: #f8fafc; color: #64748b; font-size: 9px; line-height: 1.5; }
// </style></head><body>
// <div class="page">
//   <img class="logo" src="${logo}" alt="FleetDoc" />
//   <div class="rule"></div>
//   <div class="heading"><div><div class="eyebrow">FleetDoc Premium</div><h1>Payment Receipt</h1></div><div class="paid">Payment Successful</div></div>
//   <div class="meta">
//     <div><div class="label">Receipt Number</div><div class="value">${escapeHtml(receipt.receiptNumber)}</div></div>
//     <div><div class="label">Purchase Date</div><div class="value">${escapeHtml(formatDateTime(receipt.purchaseDate))}</div></div>
//     <div><div class="label">Payment Method</div><div class="value">${escapeHtml(receipt.paymentMethod)}</div></div>
//     <div><div class="label">Currency</div><div class="value">${escapeHtml(receipt.currency)}</div></div>
//   </div>
//   <div class="customer"><div class="customer-title">Customer Details</div><div class="meta" style="padding:0"><div><div class="label">Company Name</div><div class="value">${escapeHtml(receipt.customer?.companyName)}</div></div><div><div class="label">Name</div><div class="value">${escapeHtml(receipt.customer?.name)}</div></div><div><div class="label">Email</div><div class="value">${escapeHtml(receipt.customer?.email)}</div></div><div><div class="label">Phone</div><div class="value">${escapeHtml(receipt.customer?.phone)}</div></div><div><div class="label">Subscription</div><div class="value">Monthly</div></div></div></div>
//   <div style="margin-top:18px"><div class="row head"><div>Premium Plan</div><div class="right">Billing</div><div class="right">Amount</div></div><div class="row"><div>${escapeHtml(receipt.planName)}</div><div class="right">Monthly</div><div class="right">₹${escapeHtml(formatPrice(receipt.amount))}</div></div></div>
//   <div class="total"><div class="total-line"><span>Subscription Start</span><strong>${escapeHtml(formatDate(receipt.validFrom))}</strong></div><div class="total-line"><span>Valid Until</span><strong>${escapeHtml(formatDate(receipt.validUntil))}</strong></div><div class="grand"><span>Total Paid</span><span>₹${escapeHtml(formatPrice(receipt.amount))}</span></div></div>
//   <div class="meta" style="margin-top:18px;padding-bottom:0"><div><div class="label">Razorpay Order ID</div><div class="value">${escapeHtml(receipt.orderId)}</div></div><div><div class="label">Razorpay Payment ID</div><div class="value">${escapeHtml(receipt.paymentId)}</div></div></div>
//   <div class="note">This receipt confirms the successful payment recorded for the FleetDoc Premium subscription. Keep this document for your records.</div>
//   <div class="footer">Generated by <span class="brand">FleetDoc</span> · Vehicle Document Manager<br/>Thank you for using FleetDoc.</div>
// </div>
// <script>window.onload=function(){setTimeout(function(){window.print()},350)};</script>
// </body></html>`;

//     const printWindow = window.open("", "_blank", "width=900,height=1000");
//     if (!printWindow) return;
//     printWindow.document.open();
//     printWindow.document.write(html);
//     printWindow.document.close();
//   };

//   return (
//     <AnimatePresence>
//       <motion.div
//         className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-md sm:p-5"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//       >
//         <motion.div
//           initial={{ opacity: 0, y: 25, scale: 0.97 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           exit={{ opacity: 0, y: 15, scale: 0.98 }}
//           className="relative flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-[24px] bg-slate-100 shadow-2xl"
//         >
//           <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
//             <div>
//               <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">A4 compatible</p>
//               <h2 className="mt-0.5 text-lg font-extrabold text-slate-900">Payment Receipt</h2>
//             </div>
//             <div className="flex items-center gap-2">
//               <button type="button" onClick={downloadReceipt} className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800">
//                 <Download size={16} /> Save / Download PDF
//               </button>
//               <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200" aria-label="Close receipt">
//                 <X size={18} />
//               </button>
//             </div>
//           </div>

//           <div className="overflow-y-auto p-3 sm:p-6">
//             <div className="mx-auto min-h-[1120px] w-full max-w-[794px] border border-slate-200 bg-white px-8 py-10 shadow-sm sm:px-12 sm:py-12">
//               <img src={fleetDocLogo} alt="FleetDoc" className="mx-auto h-auto w-[250px]" />
//               <div className="mt-5 h-px bg-slate-200" />
//               <div className="mt-7 flex items-end justify-between gap-4">
//                 <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">FleetDoc Premium</p><h3 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Payment Receipt</h3></div>
//                 <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Payment Successful</span>
//               </div>
//               <div className="mt-7 grid grid-cols-2 gap-x-8 gap-y-5 border-b border-slate-200 pb-6">
//                 {[["Receipt Number", receipt.receiptNumber], ["Purchase Date", formatDateTime(receipt.purchaseDate)], ["Payment Method", receipt.paymentMethod], ["Currency", receipt.currency]].map(([label, value]) => <div key={label}><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 break-all text-xs font-bold text-slate-800">{value}</p></div>)}
//               </div>
//               <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
//                 <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Customer Details</p>
//                 <div className="mt-3 grid grid-cols-2 gap-4"><div className="col-span-2"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Company Name</p><p className="mt-1 break-all text-xs font-bold text-slate-800">{receipt.customer?.companyName || "—"}</p></div><div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Name</p><p className="mt-1 text-xs font-bold text-slate-800">{receipt.customer?.name || "—"}</p></div><div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Email</p><p className="mt-1 break-all text-xs font-bold text-slate-800">{receipt.customer?.email || "—"}</p></div><div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Phone</p><p className="mt-1 text-xs font-bold text-slate-800">{receipt.customer?.phone || "—"}</p></div><div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Billing</p><p className="mt-1 text-xs font-bold text-slate-800">Monthly</p></div></div>
//               </div>
//               <div className="mt-7"><div className="grid grid-cols-[1.5fr_.6fr_.7fr] border-b border-slate-200 pb-2 text-[9px] font-extrabold uppercase tracking-wider text-slate-400"><span>Premium Plan</span><span className="text-right">Billing</span><span className="text-right">Amount</span></div><div className="grid grid-cols-[1.5fr_.6fr_.7fr] py-4 text-xs font-bold text-slate-800"><span>{receipt.planName}</span><span className="text-right">Monthly</span><span className="text-right">₹{formatPrice(receipt.amount)}</span></div></div>
//               <div className="ml-auto mt-3 w-full max-w-[320px] rounded-xl border border-blue-100 bg-blue-50/60 p-4"><div className="flex justify-between text-[10px] text-slate-500"><span>Subscription Start</span><strong className="text-slate-800">{formatDate(receipt.validFrom)}</strong></div><div className="mt-2 flex justify-between text-[10px] text-slate-500"><span>Valid Until</span><strong className="text-slate-800">{formatDate(receipt.validUntil)}</strong></div><div className="mt-3 flex justify-between border-t border-blue-100 pt-3 text-base font-black text-slate-900"><span>Total Paid</span><span>₹{formatPrice(receipt.amount)}</span></div></div>
//               <div className="mt-7 grid grid-cols-2 gap-6 border-t border-slate-200 pt-5"><div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Razorpay Order ID</p><p className="mt-1 break-all text-[10px] font-bold text-slate-700">{receipt.orderId}</p></div><div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Razorpay Payment ID</p><p className="mt-1 break-all text-[10px] font-bold text-slate-700">{receipt.paymentId}</p></div></div>
//               <div className="mt-7 rounded-lg bg-slate-50 p-3 text-[9px] leading-5 text-slate-500">This receipt confirms the successful payment recorded for the FleetDoc Premium subscription. Keep this document for your records.</div>
//               <div className="mt-12 border-t border-slate-200 pt-4 text-center text-[9px] leading-5 text-slate-400">Generated by <span className="font-bold text-blue-600">FleetDoc</span> · Vehicle Document Manager<br />Thank you for using FleetDoc.</div>
//             </div>
//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }

/* ============================================================
   RECEIPT MODAL
============================================================ */

function ReceiptModal({ receipt, onClose }) {
  const [companyName, setCompanyName] = useState(
    receipt?.customer?.companyName || ""
  );

  useEffect(() => {
    if (!receipt) return;

    // First use the company name already stored in the receipt.
    const existingCompanyName = String(
      receipt?.customer?.companyName || ""
    ).trim();

    if (existingCompanyName) {
      setCompanyName(existingCompanyName);
    }

    // Then refresh it from Settings so an older receipt also gets
    // the currently saved Company Name.
    const loadCompanyName = async () => {
      try {
        const apiBase =
          import.meta.env.VITE_API_URL ||
          "http://localhost:8000/api/v1";

        const tokenKeys = [
          "fleetdoc_access_token",
          "access_token",
          "token",
        ];

        const token =
          tokenKeys
            .map((key) => localStorage.getItem(key))
            .find((value) => String(value || "").trim()) || "";

        const headers = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${apiBase}/settings/global`, {
          method: "GET",
          headers,
        });

        if (!response.ok) return;

        const data = await response.json().catch(() => ({}));

        const savedCompanyName = String(
          data?.companyName ??
          data?.company_name ??
          data?.data?.companyName ??
          data?.data?.company_name ??
          ""
        ).trim();

        if (savedCompanyName) {
          setCompanyName(savedCompanyName);
        }
      } catch {
        // Keep the company name already available in the receipt.
      }
    };

    loadCompanyName();
  }, [receipt]);

  if (!receipt) return null;

  const displayCompanyName =
    String(companyName || receipt?.customer?.companyName || "").trim() || "—";

  const downloadReceipt = () => {
    const escapeHtml = (value) =>
      String(value ?? "—")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const logo = escapeHtml(fleetDocLogo);
    const html = `<!doctype html>
<html><head><meta charset="utf-8" /><title>${escapeHtml(receipt.receiptNumber)}</title>
<style>
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #0f172a; font-family: Arial, Helvetica, sans-serif; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { width: 210mm; min-height: 297mm; padding: 16mm 17mm; margin: 0 auto; background: #fff; }
  .logo { display: block; width: 250px; height: auto; margin: 0 auto 14px; }
  .rule { height: 1px; background: #dbe3ef; }
  .heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; margin: 18px 0 16px; }
  .eyebrow { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #64748b; font-weight: 700; }
  h1 { margin: 4px 0 0; font-size: 24px; letter-spacing: -.5px; }
  .paid { border: 1px solid #a7f3d0; background: #ecfdf5; color: #047857; padding: 7px 12px; border-radius: 999px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .7px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 9px 24px; padding: 14px 0; }
  .label { color: #64748b; font-size: 9px; text-transform: uppercase; letter-spacing: .8px; font-weight: 700; }
  .value { margin-top: 3px; font-size: 11px; font-weight: 700; word-break: break-word; }
  .customer { margin-top: 8px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 13px 14px; background: #f8fafc; }
  .customer-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; color: #475569; margin-bottom: 8px; }
  .row { display: grid; grid-template-columns: 1.5fr .65fr .85fr; gap: 10px; align-items: center; padding: 13px 0; border-bottom: 1px solid #e2e8f0; }
  .row.head { padding: 9px 0; color: #64748b; font-size: 9px; text-transform: uppercase; letter-spacing: .7px; font-weight: 800; }
  .row:not(.head) { font-size: 11px; font-weight: 700; }
  .right { text-align: right; }
  .total { margin-top: 14px; margin-left: auto; width: 52%; border: 1px solid #dbeafe; border-radius: 12px; padding: 13px 14px; background: linear-gradient(135deg, #eff6ff, #f8fafc); }
  .total-line { display: flex; justify-content: space-between; gap: 12px; font-size: 10px; color: #475569; margin-top: 5px; }
  .grand { display: flex; justify-content: space-between; gap: 12px; margin-top: 9px; padding-top: 9px; border-top: 1px solid #bfdbfe; font-size: 16px; font-weight: 900; color: #0f172a; }
  .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 9px; line-height: 1.6; text-align: center; }
  .brand { color: #2563eb; font-weight: 800; }
  .note { margin-top: 12px; padding: 9px 11px; border-radius: 8px; background: #f8fafc; color: #64748b; font-size: 9px; line-height: 1.5; }
</style></head><body>
<div class="page">
  <img class="logo" src="${logo}" alt="FleetDoc" />
  <div class="rule"></div>
  <div class="heading"><div><div class="eyebrow">FleetDoc Premium</div><h1>Payment Receipt</h1></div><div class="paid">Payment Successful</div></div>
  <div class="meta">
    <div><div class="label">Receipt Number</div><div class="value">${escapeHtml(receipt.receiptNumber)}</div></div>
    <div><div class="label">Purchase Date</div><div class="value">${escapeHtml(formatDateTime(receipt.purchaseDate))}</div></div>
    <div><div class="label">Payment Method</div><div class="value">${escapeHtml(receipt.paymentMethod)}</div></div>
    <div><div class="label">Currency</div><div class="value">${escapeHtml(receipt.currency)}</div></div>
  </div>
  <div class="customer"><div class="customer-title">Customer Details</div><div class="meta" style="padding:0"><div><div class="label">Company Name</div><div class="value">${escapeHtml(displayCompanyName)}</div></div><div><div class="label">Name</div><div class="value">${escapeHtml(receipt.customer?.name)}</div></div><div><div class="label">Email</div><div class="value">${escapeHtml(receipt.customer?.email)}</div></div><div><div class="label">Phone</div><div class="value">${escapeHtml(receipt.customer?.phone)}</div></div><div><div class="label">Subscription</div><div class="value">Monthly</div></div></div></div>
  <div style="margin-top:18px"><div class="row head"><div>Premium Plan</div><div class="right">Billing</div><div class="right">Amount</div></div><div class="row"><div>${escapeHtml(receipt.planName)}</div><div class="right">Monthly</div><div class="right">₹${escapeHtml(formatPrice(receipt.amount))}</div></div></div>
  <div class="total"><div class="total-line"><span>Subscription Start</span><strong>${escapeHtml(formatDate(receipt.validFrom))}</strong></div><div class="total-line"><span>Valid Until</span><strong>${escapeHtml(formatDate(receipt.validUntil))}</strong></div><div class="grand"><span>Total Paid</span><span>₹${escapeHtml(formatPrice(receipt.amount))}</span></div></div>
  <div class="meta" style="margin-top:18px;padding-bottom:0"><div><div class="label">Razorpay Order ID</div><div class="value">${escapeHtml(receipt.orderId)}</div></div><div><div class="label">Razorpay Payment ID</div><div class="value">${escapeHtml(receipt.paymentId)}</div></div></div>
  <div class="note">This receipt confirms the successful payment recorded for the FleetDoc Premium subscription. Keep this document for your records.</div>
  <div class="footer">Generated by <span class="brand">FleetDoc</span> · Vehicle Document Manager<br/>Thank you for using FleetDoc.</div>
</div>
<script>window.onload=function(){setTimeout(function(){window.print()},350)};</script>
</body></html>`;

    const printWindow = window.open("", "_blank", "width=900,height=1000");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-md sm:p-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.98 }}
          className="relative flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-[24px] bg-slate-100 shadow-2xl"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">A4 compatible</p>
              <h2 className="mt-0.5 text-lg font-extrabold text-slate-900">Payment Receipt</h2>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={downloadReceipt} className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800">
                <Download size={16} /> Save / Download PDF
              </button>
              <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200" aria-label="Close receipt">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto p-3 sm:p-6">
            <div className="mx-auto min-h-[1120px] w-full max-w-[794px] border border-slate-200 bg-white px-8 py-10 shadow-sm sm:px-12 sm:py-12">
              <img src={fleetDocLogo} alt="FleetDoc" className="mx-auto h-auto w-[250px]" />
              <div className="mt-5 h-px bg-slate-200" />
              <div className="mt-7 flex items-end justify-between gap-4">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">FleetDoc Premium</p><h3 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Payment Receipt</h3></div>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Payment Successful</span>
              </div>
              <div className="mt-7 grid grid-cols-2 gap-x-8 gap-y-5 border-b border-slate-200 pb-6">
                {[["Receipt Number", receipt.receiptNumber], ["Purchase Date", formatDateTime(receipt.purchaseDate)], ["Payment Method", receipt.paymentMethod], ["Currency", receipt.currency]].map(([label, value]) => <div key={label}><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 break-all text-xs font-bold text-slate-800">{value}</p></div>)}
              </div>
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Customer Details</p>
                <div className="mt-3 grid grid-cols-2 gap-4"><div className="col-span-2"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Company Name</p><p className="mt-1 break-all text-xs font-bold text-slate-800">{displayCompanyName}</p></div><div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Name</p><p className="mt-1 text-xs font-bold text-slate-800">{receipt.customer?.name || "—"}</p></div><div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Email</p><p className="mt-1 break-all text-xs font-bold text-slate-800">{receipt.customer?.email || "—"}</p></div><div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Phone</p><p className="mt-1 text-xs font-bold text-slate-800">{receipt.customer?.phone || "—"}</p></div><div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Billing</p><p className="mt-1 text-xs font-bold text-slate-800">Monthly</p></div></div>
              </div>
              <div className="mt-7"><div className="grid grid-cols-[1.5fr_.6fr_.7fr] border-b border-slate-200 pb-2 text-[9px] font-extrabold uppercase tracking-wider text-slate-400"><span>Premium Plan</span><span className="text-right">Billing</span><span className="text-right">Amount</span></div><div className="grid grid-cols-[1.5fr_.6fr_.7fr] py-4 text-xs font-bold text-slate-800"><span>{receipt.planName}</span><span className="text-right">Monthly</span><span className="text-right">₹{formatPrice(receipt.amount)}</span></div></div>
              <div className="ml-auto mt-3 w-full max-w-[320px] rounded-xl border border-blue-100 bg-blue-50/60 p-4"><div className="flex justify-between text-[10px] text-slate-500"><span>Subscription Start</span><strong className="text-slate-800">{formatDate(receipt.validFrom)}</strong></div><div className="mt-2 flex justify-between text-[10px] text-slate-500"><span>Valid Until</span><strong className="text-slate-800">{formatDate(receipt.validUntil)}</strong></div><div className="mt-3 flex justify-between border-t border-blue-100 pt-3 text-base font-black text-slate-900"><span>Total Paid</span><span>₹{formatPrice(receipt.amount)}</span></div></div>
              <div className="mt-7 grid grid-cols-2 gap-6 border-t border-slate-200 pt-5"><div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Razorpay Order ID</p><p className="mt-1 break-all text-[10px] font-bold text-slate-700">{receipt.orderId}</p></div><div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Razorpay Payment ID</p><p className="mt-1 break-all text-[10px] font-bold text-slate-700">{receipt.paymentId}</p></div></div>
              <div className="mt-7 rounded-lg bg-slate-50 p-3 text-[9px] leading-5 text-slate-500">This receipt confirms the successful payment recorded for the FleetDoc Premium subscription. Keep this document for your records.</div>
              <div className="mt-12 border-t border-slate-200 pt-4 text-center text-[9px] leading-5 text-slate-400">Generated by <span className="font-bold text-blue-600">FleetDoc</span> · Vehicle Document Manager<br />Thank you for using FleetDoc.</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ============================================================
   PAYMENT HISTORY MODAL
============================================================ */

function PaymentHistoryModal({
  history,
  loading,
  onClose,
  onViewReceipt,
}) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[125] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.button
          type="button"
          aria-label="Close payment history"
          onClick={onClose}
          className="absolute inset-0 cursor-default bg-slate-950/40"
        />

        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.98 }}
          className="relative z-10 flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-[26px] border border-white/30 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <Clock3 size={18} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Payment History</h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Real FleetDoc Premium purchases from your account.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
            {loading ? (
              <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-400">
                <RefreshCw size={18} className="mr-2 animate-spin" /> Loading payment history...
              </div>
            ) : history.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center dark:border-slate-700 dark:bg-slate-800/40">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-900">
                  <CreditCard size={24} />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-white">No payment history</h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">No successful FleetDoc Premium purchase has been recorded for this account yet.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="hidden grid-cols-[1.35fr_.9fr_.7fr_.7fr_auto] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/60 sm:grid">
                  <span>Premium Plan</span>
                  <span>Purchase Date</span>
                  <span>Status</span>
                  <span>Amount</span>
                  <span></span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {history.map((item) => (
                    <div key={item.subscriptionId} className="grid gap-3 px-4 py-4 sm:grid-cols-[1.35fr_.9fr_.7fr_.7fr_auto] sm:items-center sm:gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{item.planName}</p>
                        <p className="mt-1 text-[10px] text-slate-400">Receipt: {item.receiptNumber}</p>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{formatDateTime(item.purchaseDate)}</div>
                      <div>
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">Paid</span>
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white">₹{formatPrice(item.amount)}</div>
                      <button
                        type="button"
                        onClick={() => onViewReceipt(item)}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                      >
                        <FileText size={14} /> Receipt
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ============================================================
   CHECKOUT MODAL
============================================================ */

function CheckoutModal({ plan, onClose, onSuccess, onPaymentError }) {
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState("checkout");
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    if (!plan) return;
    setPaymentMethod("upi");
    setProcessing(false);
    setPaymentStep("checkout");
    setPaymentInfo(null);
  }, [plan]);

  if (!plan) return null;

  const paymentMethods = [
    {
      id: "upi",
      name: "UPI",
      icon: WalletCards,
      description: "Google Pay, PhonePe, Paytm & more",
    },
    {
      id: "card",
      name: "Cards",
      icon: CreditCard,
      description: "Credit or debit card",
    },
    {
      id: "netbanking",
      name: "Net Banking",
      icon: Globe2,
      description: "Pay securely through your bank",
    },
    {
      id: "wallet",
      name: "Wallets",
      icon: Smartphone,
      description: "Supported digital wallets",
    },
  ];

  const getCustomerDetails = () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("fleetdoc_user") || "null"
      );

      return {
        name: user?.name || user?.fullName || "",
        email: user?.email || "",
        contact: user?.phone || user?.contactNo || "",
      };
    } catch {
      return {
        name: "",
        email: "",
        contact: "",
      };
    }
  };

  const customer = getCustomerDetails();
  const PlanIcon = plan.icon;

  const handlePayment = async () => {
    if (processing) return;

    setProcessing(true);
    onPaymentError?.("");

    try {
      const res = await fetch(`${apiBase}/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          plan_id: plan.id,
          currency: "INR",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to create payment order"
        );
      }

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay checkout script is not loaded. Add https://checkout.razorpay.com/v1/checkout.js to index.html."
        );
      }

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,

        // Razorpay Checkout branding.
        // The existing FleetDoc logo is used here.
        name: "Fleet Doc",
        description: `${plan.name} · Monthly Premium`,
        image: fleetDocLogo,

        order_id: data.order.id,

        // Razorpay controls the internal checkout UI, while these
        // options provide Fleet Doc branding and supported instruments.
        theme: {
          color: "#2563eb",
          backdrop_color: "#0f172a",
        },

        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.contact,
        },

        notes: {
          brand: "Fleet Doc",
          product: "FleetDoc Premium",
          plan: plan.name,
          billing: "Monthly",
        },

        handler: async (response) => {
          try {
            const verifyResponse = await fetch(
              `${apiBase}/payments/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...authHeaders(),
                },
                body: JSON.stringify({
                  ...response,
                  subscription_id: data.subscriptionId,
                }),
              }
            );

            const output = await verifyResponse.json().catch(() => ({}));

            if (!verifyResponse.ok) {
              throw new Error(
                typeof output.detail === "string"
                  ? output.detail
                  : "Payment verification failed"
              );
            }

            const backendMethod =
              output?.paymentMethod ||
              output?.payment_method ||
              output?.payment?.method ||
              output?.payment?.method_name ||
              null;

            const selectedMethodName =
              paymentMethods.find((item) => item.id === paymentMethod)?.name ||
              paymentMethod;

            setPaymentInfo({
              subscriptionId: data.subscriptionId,
              orderId:
                output?.razorpayOrderId ||
                output?.payment?.orderId ||
                response.razorpay_order_id ||
                data.order?.id,
              paymentId:
                output?.razorpayPaymentId ||
                output?.payment?.paymentId ||
                response.razorpay_payment_id,
              amount: Number(data.order.amount || 0) / 100,
              paymentMethod: normalizePaymentMethod(
                backendMethod ||
                  output?.payment?.method ||
                  selectedMethodName
              ),
              purchaseDate: new Date().toISOString(),
            });

            setProcessing(false);
            setPaymentStep("success");
          } catch (error) {
            setProcessing(false);
            onPaymentError?.(
              error.message || "Payment verification failed"
            );
          }
        },

        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      });

      razorpay.open();
    } catch (error) {
      setProcessing(false);
      onPaymentError?.(error.message || "Payment failed");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.button
          type="button"
          aria-label="Close payment"
          onClick={onClose}
          className="absolute inset-0 cursor-default bg-slate-950/70 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[30px] border border-white/30 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          {paymentStep === "checkout" ? (
            <>
              {/* =====================================================
                  FLEET DOC PAYMENT HEADER
              ====================================================== */}
              <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-5 text-white sm:px-7">
                <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3.5">
                    {/* <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue  p-1.5 shadow-lg ring-1 ring-white/20">
                      <img
                        src={companyLogo}
                        alt="Fleet Doc"
                        className="h-full w-full object-contain"
                      />
                    </div> */}

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue shadow-lg ring-1 ring-white/20">
                      <img
                        src={companyLogo}
                        alt="Fleet Doc"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="border-l border-slate-200 pl-3">

                        <h2 className="text-lg font-bold tracking-tight text-white-800">
                          Fleet
                          <span className="text-blue-600">
                            Doc.
                          </span>
                        </h2>

                        <p className="text-xs text-slate-200">
                          Vehicle Document Manager
                        </p>

                        <p className="mt-0.5 text-xs text-slate-300">
                          Complete your Premium subscription securely
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
                    aria-label="Close payment"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="relative mt-5 flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-slate-200 backdrop-blur-sm">
                    <ShieldCheck size={13} className="text-emerald-300" />
                    Secure checkout
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-slate-200 backdrop-blur-sm">
                    <Lock size={12} className="text-blue-200" />
                    Razorpay
                  </div>
                </div>
              </div>

              <div className="max-h-[76vh] overflow-y-auto p-5 sm:p-7">
                {/* ===================================================
                    PLAN SUMMARY
                ==================================================== */}
                <div
                  className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br ${plan.softBg} p-4 dark:border-slate-800`}
                >
                  <div
                    className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${plan.gradient}`}
                  />

                  <div className="flex items-center gap-4 pl-2">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${plan.gradient} text-white shadow-md`}
                    >
                      <PlanIcon size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        Premium Plan
                      </p>
                      <p className="mt-0.5 truncate text-sm font-extrabold text-slate-900 dark:text-white">
                        {plan.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Monthly subscription
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                        ₹{formatPrice(plan.price)}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400">
                        / {plan.billing}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ===================================================
                    PAYMENT METHODS
                ==================================================== */}
                <div className="mt-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Choose how you want to pay
                      </h3>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Your selected payment option will open in Razorpay
                      </p>
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <Lock size={11} />
                      Secure
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {paymentMethods.map((method) => {
                      const MethodIcon = method.icon;
                      const selected = paymentMethod === method.id;

                      return (
                        <button
                          type="button"
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`group flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${selected
                              ? "border-blue-500 bg-blue-50/70 shadow-md shadow-blue-500/10 dark:border-blue-400 dark:bg-blue-950/30"
                              : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500/40 dark:hover:bg-slate-800"
                            }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${selected
                                ? "bg-blue-600 text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                          >
                            <MethodIcon size={18} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-800 dark:text-white">
                              {method.name}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-slate-400">
                              {method.description}
                            </p>
                          </div>

                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${selected
                                ? "border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-slate-950"
                                : "border-slate-300 dark:border-slate-600"
                              }`}
                          >
                            {selected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ===================================================
                    CUSTOMER / SECURITY INFORMATION
                ==================================================== */}
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                        <UserCog size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Billing account
                        </p>
                        <p className="mt-1 truncate text-xs font-bold text-slate-800 dark:text-white">
                          {customer.email || "Your FleetDoc. account"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400">
                        <ShieldCheck size={17} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Protected payment
                        </p>
                        <p className="mt-1 text-xs font-medium leading-5 text-emerald-700 dark:text-emerald-300">
                          Payment details are handled by Razorpay.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ===================================================
                    PRICE SUMMARY
                ==================================================== */}
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{plan.name}</span>
                    <span>₹{formatPrice(plan.price)}</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Total payable today
                      </p>
                      <p className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        ₹{formatPrice(plan.price)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Monthly billing
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        Taxes/charges, if applicable, are shown by Razorpay
                      </p>
                    </div>
                  </div>
                </div>

                {/* ===================================================
                    PAYMENT CTA
                ==================================================== */}
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={processing}
                  className={`mt-5 flex h-13 min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${plan.gradient} px-5 text-sm font-extrabold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-wait disabled:opacity-80`}
                >
                  {processing ? (
                    <>
                      <RefreshCw size={17} className="animate-spin" />
                      Creating secure payment...
                    </>
                  ) : (
                    <>
                      Pay ₹{formatPrice(plan.price)} with Razorpay
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <div className="mt-3 flex items-center justify-center gap-4 text-[10px] font-medium text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Lock size={11} />
                    Secure
                  </span>
                  <span>•</span>
                  <span>FleetDoc.</span>
                  <span>•</span>
                  <span>Razorpay</span>
                </div>

                <p className="mt-2 text-center text-[10px] leading-5 text-slate-400">
                  By continuing, you agree to the FleetDoc. subscription terms
                  and billing policy.
                </p>
              </div>
            </>
          ) : (
            <div className="px-6 py-12 text-center sm:px-10 sm:py-16">
              <img
                  src={fleetDocLogo}
                  alt="Fleet Doc"
                  className="mx-auto block h-48 w-48 object-contain"
              />

              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 15,
                }}
                className="mx-auto mt-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
              >
                <CheckCircle2 size={42} />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-2xl font-extrabold text-slate-900 dark:text-white"
              >
                Payment successful!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400"
              >
                {plan.name} has been activated for your Fleet Doc account.
                Premium features are now available.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mx-auto mt-6 max-w-sm rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30"
              >
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  {plan.name}
                </p>
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  ₹{formatPrice(plan.price)} / {plan.billing}
                </p>
              </motion.div>

              <button
                type="button"
                onClick={() => onSuccess(plan, paymentInfo)}
                className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-[0.98] dark:bg-white dark:text-slate-900"
              >
                Continue to Premium
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ============================================================
   MAIN PREMIUM PAGE
============================================================ */

export default function Premium() {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [detailsPlan, setDetailsPlan] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const [receiptToView, setReceiptToView] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    let mounted = true;

    const loadCompanySettings = async () => {
      try {
        const res = await fetch(`${apiBase}/settings/global`, { headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        const savedCompanyName = String(
          data?.companyName ?? data?.company_name ?? data?.data?.companyName ?? ""
        ).trim();
        if (mounted) setCompanyName(savedCompanyName);
      } catch {
        // Keep the receipt usable if settings cannot be refreshed.
      }
    };

    const loadCustomerDetails = async () => {
      // Login stores id/name/email/role in separate localStorage keys.
      // Fetch the authenticated users list to obtain the real contact number
      // and build the complete customer block for the receipt.
      const currentUserId = String(
        localStorage.getItem("fleetdoc_user_id") || ""
      );
      const fallback = {
        name: localStorage.getItem("fleetdoc_user_name") || "",
        email: localStorage.getItem("fleetdoc_user_email") || "",
        phone: localStorage.getItem("fleetdoc_user_phone") || "",
      };

      try {
        const res = await fetch(`${apiBase}/users`, { headers: authHeaders() });
        if (!res.ok) {
          if (mounted) setCustomerDetails(fallback);
          return;
        }

        const users = await res.json().catch(() => []);
        const list = Array.isArray(users) ? users : [];
        const current = list.find(
          (item) => String(item?.id ?? "") === currentUserId
        );

        const details = {
          name: current?.name || fallback.name || "",
          email: current?.email || fallback.email || "",
          phone:
            current?.contactNo ||
            current?.phone ||
            fallback.phone ||
            "",
        };

        if (mounted) setCustomerDetails(details);

        if (current) {
          localStorage.setItem("fleetdoc_user", JSON.stringify(current));
        }
        if (details.phone) {
          localStorage.setItem("fleetdoc_user_phone", details.phone);
        }
      } catch {
        if (mounted) setCustomerDetails(fallback);
      }
    };

    const loadSubscriptions = async () => {
      try {
        const res = await fetch(`${apiBase}/payments/subscriptions`, { headers: authHeaders() });
        if (!res.ok) throw new Error("Unable to load subscriptions");
        const data = await res.json();
        if (mounted) setSubscriptions(normalizeSubscriptions(data));
      } catch (e) {
        if (mounted) setError(e.message || "Unable to load subscriptions");
      } finally {
        if (mounted) setLoadingSubscriptions(false);
      }
    };
    loadCompanySettings();
    loadCustomerDetails();
    loadSubscriptions();
    return () => { mounted = false; };
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(PREMIUM_PLANS.map((plan) => plan.category)))], []);

  const filteredPlans = useMemo(() => {
    const query = search.trim().toLowerCase();
    return PREMIUM_PLANS.filter((plan) => {
      const matchesCategory = category === "All" || plan.category === category;
      if (!query) return matchesCategory;
      const searchableText = [plan.name, plan.shortName, plan.category, plan.description, ...plan.features].join(" ").toLowerCase();
      return matchesCategory && searchableText.includes(query);
    });
  }, [search, category]);

  const activePlans = useMemo(() => PREMIUM_PLANS.filter((plan) => subscriptions.some((s) => s.planId === plan.id && s.status === "active")), [subscriptions]);


  const buyingHistory = useMemo(() => {
    return [...subscriptions]
      .sort((a, b) => {
        const aDate = new Date(a.startedAt || a.started_at || 0).getTime();
        const bDate = new Date(b.startedAt || b.started_at || 0).getTime();
        return bDate - aDate;
      })
      .map((subscription) => {
        const plan = PREMIUM_PLANS.find((item) => item.id === subscription.planId);
        if (!plan) return null;
        const cached = readVerifiedReceipts().find(
          (item) => String(item.subscriptionId || "") === String(subscription.id || "")
        );
        return buildReceipt(
          plan,
          subscription,
          cached || {},
          companyName,
          customerDetails
        );
      })
      .filter(Boolean);
  }, [subscriptions, companyName, customerDetails]);

  const handleBuy = (plan) => {
    setError("");
    setMessage("");
    setSelectedPlan(plan);
  };

  const handlePaymentSuccess = async (plan, paymentInfo = {}) => {
    setSelectedPlan(null);
    setMessage(`${plan.name} activated successfully.`);
    setError("");

    let nextSubscriptions = subscriptions;
    try {
      const res = await fetch(`${apiBase}/payments/subscriptions`, { headers: authHeaders() });
      if (res.ok) {
        nextSubscriptions = normalizeSubscriptions(await res.json());
        setSubscriptions(nextSubscriptions);
      }
    } catch {
      // Payment is already verified; keep the success state if refresh fails.
    }

    const subscription = nextSubscriptions.find(
      (item) => String(item.id) === String(paymentInfo.subscriptionId)
    );
    const receipt = buildReceipt(
      plan,
      subscription,
      paymentInfo,
      companyName,
      customerDetails
    );
    if (receipt) {
      saveVerifiedReceipt(receipt);
      setReceiptToView(receipt);
    }
  };

  return (
    <div className="min-h-full bg-slate-50/50 pb-12 dark:bg-slate-950">
      <div className="mb-5 flex flex-col gap-4 px-4 pt-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <PageHeader
          title={<div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 transition duration-300 hover:scale-110 hover:rotate-3"><Crown size={23} strokeWidth={2.3} /></div><div><span className="block text-2xl font-bold text-slate-800 dark:text-white">Explore Premium</span></div></div>}
          subtitle="Unlock powerful tools to manage your fleet more efficiently."
        />
        <motion.button type="button" onClick={() => navigate("/")} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.03, x: -2 }} whileTap={{ scale: 0.97 }} className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-950/30 dark:hover:text-blue-400">
          <ArrowLeft size={17} strokeWidth={2.2} className="transition-transform duration-300 group-hover:-translate-x-1" /><span>Back to Home</span>
        </motion.button>
      </div>

      <div className="px-4 pt-2 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-900 shadow-xl dark:border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-700/30 via-blue-700/20 to-fuchsia-700/30" />
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.35fr_0.65fr] lg:px-10 lg:py-10">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md"><Crown size={14} /> FleetDoc Premium</div>
              <h1 className="mt-5 max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">Manage your fleet with<span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">more power.</span></h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">Extend FleetDoc with automation, advanced reports, analytics, communication tools, security and integrations designed for growing fleet operations.</p>
              <div className="mt-6 flex flex-wrap gap-2.5">{["Smart Automation", "Advanced Analytics", "Team Controls", "Priority Features"].map((item) => <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur-md"><Check size={12} />{item}</span>)}</div>
            </div>
            <div className="relative hidden min-h-[230px] items-center justify-center lg:flex"><motion.div animate={{ y: [0, -8, 0], rotate: [0, 1.5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="relative h-48 w-48"><div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/30 to-cyan-500/20 blur-3xl" /><div className="absolute inset-5 flex items-center justify-center rounded-[38px] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl"><Crown size={76} strokeWidth={1.2} className="text-white" /></div><motion.div animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border border-dashed border-white/20" /><div className="absolute -right-2 top-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-lg backdrop-blur-md"><Bell size={19} /></div><div className="absolute -bottom-1 -left-1 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-lg backdrop-blur-md"><BarChart3 size={19} /></div></motion.div></div>
          </div>
        </motion.div>

        {message && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300"><CheckCircle2 className="mr-2 inline" size={18} />{message}</motion.div>}
        {error && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">{error}</motion.div>}

        {activePlans.length > 0 && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"><PackageCheck size={19} /></div><div><p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">{activePlans.length} Premium {activePlans.length === 1 ? "feature" : "features"} active</p><p className="mt-0.5 text-xs text-emerald-700/80 dark:text-emerald-400/80">Your purchased FleetDoc features are active.</p></div></div><div className="flex flex-wrap gap-2">{activePlans.map((plan) => <span key={plan.id} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-300">{plan.shortName}</span>)}</div></div></motion.div>}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Premium Features</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Choose the tools that fit your fleet operation.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search premium..." className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800 sm:w-56" />{search && <button type="button" onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={15} /></button>}</div>
            <div className="relative"><button type="button" onClick={() => setShowCategoryMenu((value) => !value)} className="flex h-10 min-w-[150px] items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><span>{category}</span><ChevronDown size={16} className={`transition-transform ${showCategoryMenu ? "rotate-180" : ""}`} /></button><AnimatePresence>{showCategoryMenu && <motion.div initial={{ opacity: 0, y: -5, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.98 }} className="absolute right-0 z-30 mt-2 w-full min-w-[170px] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900">{categories.map((item) => <button key={item} type="button" onClick={() => { setCategory(item); setShowCategoryMenu(false); }} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${category === item ? "bg-slate-100 font-semibold text-slate-900 dark:bg-slate-800 dark:text-white" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"}`}>{item}{category === item && <Check size={15} />}</button>)}</motion.div>}</AnimatePresence></div>
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
            >
              <Clock3 size={16} />
              History
              {buyingHistory.length > 0 && (
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold dark:bg-slate-800">{buyingHistory.length}</span>
              )}
            </button>
          </div>
        </div>

        {loadingSubscriptions ? <div className="mt-5 flex min-h-[260px] items-center justify-center rounded-[24px] border border-slate-200 bg-white text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900"><RefreshCw size={18} className="mr-2 animate-spin" /> Loading subscriptions...</div> : filteredPlans.length > 0 ? <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredPlans.map((plan) => <PremiumCard key={plan.id} plan={plan} subscribed={subscriptions.some((s) => s.planId === plan.id && s.status === "active")} onDetails={setDetailsPlan} onBuy={handleBuy} />)}</motion.div> : <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex min-h-[300px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-white px-6 text-center dark:border-slate-700 dark:bg-slate-900"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800"><Search size={24} /></div><h3 className="mt-4 text-base font-bold text-slate-800 dark:text-white">No premium features found</h3><p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">Try a different search term or select another category.</p><button type="button" onClick={() => { setSearch(""); setCategory("All"); }} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900">Reset filters <RefreshCw size={15} /></button></motion.div>}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">{[{ icon: ShieldCheck, title: "Secure", description: "Your premium account and payment information stay protected." }, { icon: Headphones, title: "Support", description: "Get help when you need it with premium support options." }, { icon: RefreshCw, title: "Flexible", description: "Choose only the premium capabilities your fleet needs." }].map((item, index) => { const Icon = item.icon; return <motion.div key={item.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + index * 0.06 }} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"><Icon size={18} /></div><h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</p></motion.div>; })}</div>

        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300"><Crown className="mr-2 inline" size={18} /><b>Notification Premium:</b> SMS and WhatsApp delivery are enforced by the FastAPI backend and only become available after a verified active subscription.</div>
      </div>

      <AnimatePresence>
        {detailsPlan && (
          <DetailsModal
            plan={detailsPlan}
            onClose={() => setDetailsPlan(null)}
            onBuy={handleBuy}
            subscribed={subscriptions.some(
              (s) =>
                s.planId === detailsPlan.id &&
                s.status === "active"
            )}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showHistory && (
          <PaymentHistoryModal
            history={buyingHistory}
            loading={loadingSubscriptions}
            onClose={() => setShowHistory(false)}
            onViewReceipt={(receipt) => setReceiptToView(receipt)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>{receiptToView && <ReceiptModal receipt={receiptToView} onClose={() => setReceiptToView(null)} />}</AnimatePresence>
      <AnimatePresence>{selectedPlan && <CheckoutModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} onSuccess={handlePaymentSuccess} onPaymentError={setError} />}</AnimatePresence>
    </div>
  );
}
