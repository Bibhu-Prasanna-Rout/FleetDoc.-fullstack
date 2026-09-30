import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Car,
  Truck,
  ChevronDown,
  FileText,
  IndianRupee,
  ReceiptText,
  CreditCard,
  ShieldCheck,
  Droplets,
  Shield,
  MapPin,
  Globe2,
  RotateCcw,
  WalletCards,
  CircleDollarSign,
  Filter,
  Search,
  BadgeCheck,
  MoreVertical,
  Eye,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

import PageHeader from "../components/PageHeader";
import {
  useFleet,
  parseDate,
  formatDate,
} from "../context/fleetContext";

/* =========================================================
   ANIMATION
========================================================= */

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
  subtitleClassName,
  cardClassName,
  blobClassName,
  bottomLineClassName,
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        y: -4,
        scale: 1.01,
      }}
      transition={{
        duration: 0.15,
        ease: "easeOut",
      }}
      className={`group relative h-[125px] cursor-default overflow-hidden rounded-2xl border shadow-sm transition-all duration-1000 hover:shadow-xl ${cardClassName}`}
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-16 h-36 w-36 rounded-full transition-transform duration-150 group-hover:scale-110 ${blobClassName}`}
      />

      <div className="relative z-10 flex h-full items-center justify-between px-6 py-5">
        <div className="min-w-0">
          <p className="text-base font-medium text-slate-600">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          {subtitle && (
            <p
              className={`mt-1 text-sm font-medium ${
                subtitleClassName || "text-slate-500"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>

        <motion.div
          whileHover={{
            scale: 1.06,
            rotate: 3,
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-all duration-150 ${iconClassName}`}
        >
          <Icon className="h-8 w-8 text-white" />
        </motion.div>
      </div>

      <div
        className={`absolute bottom-0 left-0 h-1 w-0 transition-all duration-150 group-hover:w-full ${bottomLineClassName}`}
      />
    </motion.div>
  );
}

/* =========================================================
   EXPENSE OVERVIEW
========================================================= */

export default function ExpenseOverview() {
  const {
    vehicles = [],
    documents = [],
    emis = [],
    challans = [],
    roadTaxes = [],
    loans = [],
    settings = {},
  } = useFleet();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");

  /* =======================================================
     VEHICLE SEARCH STATE
  ======================================================= */

  const [vehicleSearch, setVehicleSearch] = useState("");
  const [showVehicleDropdown, setShowVehicleDropdown] =
    useState(false);

  const hasActiveFilters =
    Boolean(fromDate) ||
    Boolean(toDate) ||
    Boolean(vehicleFilter);

  /* =======================================================
     ACTION STATE
  ======================================================= */

  const [deletedExpenseIds, setDeletedExpenseIds] =
    useState([]);

  const [selectedExpense, setSelectedExpense] =
    useState(null);

  const [deleteExpense, setDeleteExpense] =
    useState(null);

  const [openActionId, setOpenActionId] =
    useState(null);

  /* =======================================================
     HELPERS
  ======================================================= */

  const getAmount = (value) => {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === "string") {
      const cleaned = value
        .replace(/[₹,\s]/g, "")
        .replace(/[^\d.-]/g, "");

      const number = Number(cleaned);

      return Number.isFinite(number) ? number : 0;
    }

    return 0;
  };

  const getVehicleNumber = (item) => {
    return (
      item?.vehicleNumber ||
      item?.vehicle ||
      item?.vehicleNo ||
      item?.registrationNumber ||
      item?.registrationNo ||
      item?.vehicleRegNo ||
      item?.registration ||
      ""
    );
  };

  const getStatus = (status) => {
    if (!status) return "Paid";

    const value = String(status)
      .trim()
      .toLowerCase();

    if (value === "paid") return "Paid";
    if (value === "pending") return "Pending";
    if (value === "expired") return "Expired";

    if (
      value === "expiring soon" ||
      value === "expiring-soon" ||
      value === "expiring"
    ) {
      return "Expiring Soon";
    }

    if (value === "active") return "Active";

    /* =====================================================
       RENEWED STATUS
       IMPORTANT:
       FleetContext stores renewed documents with
       status/documentStatus/renewalStatus = "Renewed"
    ===================================================== */
    if (value === "renewed") return "Renewed";

    return status;
  };

  const isPaid = (status) => {
    return (
      String(status || "")
        .trim()
        .toLowerCase() === "paid"
    );
  };

  const getDateValue = (...values) => {
    for (const value of values) {
      if (!value) continue;

      const parsed = parseDate(value);

      if (
        parsed &&
        !Number.isNaN(parsed.getTime())
      ) {
        return parsed;
      }
    }

    return null;
  };

  const normalizeText = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase();
  };

  /* =======================================================
     VEHICLE NORMALIZER
  ======================================================= */

  const normalizeVehicle = (value) => {
    return String(value || "")
      .replace(/\s+/g, "")
      .trim()
      .toLowerCase();
  };

  /* =======================================================
     EXPIRY STATUS
  ======================================================= */

  const getExpiryBasedStatus = (expiryValue) => {
    const expiryDate = parseDate(expiryValue);

    if (
      !expiryDate ||
      Number.isNaN(expiryDate.getTime())
    ) {
      return "Paid";
    }

    const today = new Date();

    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const expiryOnly = new Date(
      expiryDate.getFullYear(),
      expiryDate.getMonth(),
      expiryDate.getDate()
    );

    const difference =
      expiryOnly.getTime() -
      todayOnly.getTime();

    const daysLeft = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

    const reminderDays = Number(
      settings?.reminderDays ?? 10
    );

    if (daysLeft <= 0) {
      return "Expired";
    }

    if (daysLeft <= reminderDays) {
      return "Expiring Soon";
    }

    return "Active";
  };

  /* =======================================================
     BUILD EXPENSE RECORDS
  ======================================================= */

  const expenseRecords = useMemo(() => {
    const records = [];

    /* =====================================================
       ROAD TAX
    ===================================================== */

    roadTaxes.forEach((tax) => {
      if (!tax) return;

      const vehicleNumber = getVehicleNumber(tax);

      const expenseDate = getDateValue(
        tax.paymentDate,
        tax.paidDate,
        tax.taxDate,
        tax.entryDate,
        tax.date,
        tax.startDate,
        tax.taxStartDate,
        tax.validFrom,
        tax.effectiveDate,
        tax.due,
        tax.dueDate,
        tax.expiryDate,
        tax.endDate,
        tax.createdAt
      );

      if (!expenseDate) return;

      const amount = getAmount(
        tax.paidAmount ??
          tax.amountPaid ??
          tax.paymentAmount ??
          tax.taxAmount ??
          tax.roadTaxAmount ??
          tax.totalAmount ??
          tax.paid ??
          tax.payment ??
          tax.amount
      );

      if (amount <= 0) return;

      const expiryDate = getDateValue(
        tax.dueDate,
        tax.due,
        tax.expiry,
        tax.expiryDate,
        tax.endDate,
        tax.validTo,
        tax.taxEndDate,
        tax.renewalDate
      );

      const status = expiryDate
        ? getExpiryBasedStatus(expiryDate)
        : getStatus(tax.status);

      const taxType =
        tax.type ||
        tax.taxType ||
        tax.taxName ||
        tax.description ||
        tax.taxDescription ||
        "Road Tax";

      records.push({
        id: `road-tax-${tax.id}`,
        vehicle: vehicleNumber,
        type: "Road Tax",
        description:
          taxType === "Road Tax"
            ? "Road Tax"
            : `${taxType} Road Tax`,
        amount,
        date: expenseDate,
        status,
        source: "roadTax",
        icon: WalletCards,
      });
    });

    /* =====================================================
       DOCUMENT EXPENSES
    ===================================================== */

    documents.forEach((document) => {
      if (!document) return;

      const type = normalizeText(
        document.type ||
          document.documentType ||
          document.name
      );

      let expenseType = "";

      /*
        IMPORTANT:
        Road Tax can be added through AddDocument.jsx.
        In that case it is stored inside documents[],
        not roadTaxes[].
      */

      if (
        type.includes("road tax") ||
        type.includes("roadtax") ||
        type.includes("m.v. tax") ||
        type.includes("mv tax") ||
        type.includes("motor vehicle tax")
      ) {
        expenseType = "Road Tax";
      } else if (
        type.includes("fitness") ||
        type.includes("fitness certificate")
      ) {
        expenseType = "Fitness";
      } else if (
        type.includes("pollution") ||
        type.includes("puc")
      ) {
        expenseType = "Pollution";
      } else if (
        type.includes("insurance")
      ) {
        expenseType = "Insurance";
      } else if (
        type.includes("state permit") ||
        type.includes("statepermit")
      ) {
        expenseType = "State Permit";
      } else if (
        type.includes("national permit") ||
        type.includes("nationalpermit")
      ) {
        expenseType = "National Permit";
      }

      if (!expenseType) return;

      const vehicleNumber =
        getVehicleNumber(document);

      /*
        IMPORTANT:
        AddDocument.jsx stores the document starting
        date in document.start.

        Therefore document.start is included here.
      */

      const expenseDate = getDateValue(
        document.paymentDate,
        document.paidDate,
        document.entryDate,
        document.documentDate,
        document.startDate,
        document.start,
        document.issueDate,
        document.createdAt,
        document.expiry
      );

      if (!expenseDate) return;

      const amount = getAmount(
        document.paidAmount ??
          document.paymentAmount ??
          document.amount
      );

      if (amount <= 0) return;

      const expiryDate = getDateValue(
        document.expiry,
        document.expiryDate,
        document.dueDate,
        document.due
      );

      /* ===================================================
         RENEWED DOCUMENT STATUS FIX

         FleetContext marks an old document as Renewed using
         one or more of these fields:

         status: "Renewed"
         documentStatus: "Renewed"
         renewalStatus: "Renewed"
         isRenewed: true

         Renewed MUST be checked BEFORE expiry because the
         old document's expiry date may already be in the
         past. Otherwise it would incorrectly become Expired.
      =================================================== */

      const isRenewed =
        normalizeText(document.status) ===
          "renewed" ||
        normalizeText(document.documentStatus) ===
          "renewed" ||
        normalizeText(document.renewalStatus) ===
          "renewed" ||
        document.isRenewed === true;

      const status = isRenewed
        ? "Renewed"
        : expiryDate
        ? getExpiryBasedStatus(expiryDate)
        : getStatus(document.status);

      records.push({
        id: `document-${document.id}`,
        vehicle: vehicleNumber,
        type: expenseType,
        description:
          document.name ||
          document.documentType ||
          document.type ||
          expenseType,
        amount,
        date: expenseDate,
        status,
        source: "document",
        icon:
          expenseType === "Road Tax"
            ? WalletCards
            : expenseType === "Fitness"
            ? ShieldCheck
            : expenseType === "Pollution"
            ? Droplets
            : expenseType === "Insurance"
            ? Shield
            : expenseType === "State Permit"
            ? MapPin
            : Globe2,
      });
    });

    /* =====================================================
       PAID EMI ONLY
    ===================================================== */

    emis.forEach((emi) => {
      if (!isPaid(emi.status)) return;

      const vehicleNumber =
        getVehicleNumber(emi);

      const linkedLoan =
        loans.find(
          (loan) =>
            String(loan?.id) ===
            String(emi?.loanId)
        ) || null;

      const loanNumber =
        emi?.loanNumber ||
        emi?.loanNo ||
        emi?.loanAccountNumber ||
        linkedLoan?.loanNumber ||
        linkedLoan?.loanNo ||
        linkedLoan?.loanAccountNumber ||
        "";

      const bankName =
        emi?.financerBank ||
        emi?.bank ||
        emi?.bankName ||
        linkedLoan?.financerBank ||
        linkedLoan?.bank ||
        linkedLoan?.bankName ||
        "";

      const expenseDate = getDateValue(
        emi.paidDate,
        emi.paymentDate,
        emi.due,
        emi.dueDate,
        emi.emiDate,
        emi.date,
        emi.createdAt
      );

      if (!expenseDate) return;

      const amount = getAmount(
        emi.paidAmount ??
          emi.paymentAmount ??
          emi.emiAmount ??
          emi.amount
      );

      if (amount <= 0) return;

      const description = loanNumber
        ? `Loan No: ${loanNumber}`
        : bankName
        ? `EMI - ${bankName}`
        : "Vehicle EMI";

      records.push({
        id: `emi-${emi.id}`,
        vehicle: vehicleNumber,
        type: "EMI",
        description,
        amount,
        date: expenseDate,
        status: "Paid",
        source: "emi",
        icon: CreditCard,
      });
    });

    /* =====================================================
       PAID CHALLAN ONLY
    ===================================================== */

    challans.forEach((challan) => {
      if (!isPaid(challan.status)) return;

      const vehicleNumber =
        getVehicleNumber(challan);

      const expenseDate = getDateValue(
        challan.paidDate,
        challan.paymentDate,
        challan.challanDate,
        challan.date,
        challan.dueDate,
        challan.due,
        challan.createdAt
      );

      if (!expenseDate) return;

      const amount = getAmount(
        challan.paidAmount ??
          challan.paymentAmount
      );

      if (amount <= 0) return;

      records.push({
        id: `challan-${challan.id}`,
        vehicle: vehicleNumber,
        type: "Challan",
        description:
          challan.reason ||
          challan.offence ||
          challan.description ||
          challan.challanNo ||
          challan.number ||
          "Traffic Challan",
        amount,
        date: expenseDate,
        status: "Paid",
        source: "challan",
        icon: ReceiptText,
      });
    });

    return records;
  }, [
    roadTaxes,
    documents,
    emis,
    challans,
    loans,
    settings,
  ]);

  /* =======================================================
     VISIBLE EXPENSE RECORDS
  ======================================================= */

  const visibleExpenseRecords = useMemo(() => {
    if (deletedExpenseIds.length === 0) {
      return expenseRecords;
    }

    return expenseRecords.filter(
      (expense) =>
        !deletedExpenseIds.includes(expense.id)
    );
  }, [
    expenseRecords,
    deletedExpenseIds,
  ]);

  /* =======================================================
     VEHICLE OPTIONS
  ======================================================= */

  const vehicleOptions = useMemo(() => {
    const values = new Set();

    vehicles.forEach((vehicle) => {
      const number =
        vehicle?.number ||
        vehicle?.vehicleNumber ||
        vehicle?.registrationNumber ||
        vehicle?.registrationNo;

      if (number) {
        values.add(number);
      }
    });

    visibleExpenseRecords.forEach((record) => {
      if (record.vehicle) {
        values.add(record.vehicle);
      }
    });

    return Array.from(values).sort();
  }, [vehicles, visibleExpenseRecords]);

  /* =======================================================
     FILTERED VEHICLE OPTIONS
  ======================================================= */

  const filteredVehicleOptions = useMemo(() => {
    const searchValue =
      normalizeVehicle(vehicleSearch);

    if (!searchValue) {
      return vehicleOptions;
    }

    return vehicleOptions.filter((vehicle) =>
      normalizeVehicle(vehicle).includes(
        searchValue
      )
    );
  }, [
    vehicleOptions,
    vehicleSearch,
  ]);

  /* =======================================================
     FILTERED EXPENSES
  ======================================================= */

  const filteredExpenses = useMemo(() => {
    const from = fromDate
      ? new Date(`${fromDate}T00:00:00`)
      : null;

    const to = toDate
      ? new Date(`${toDate}T23:59:59.999`)
      : null;

    return visibleExpenseRecords
      .filter((expense) => {
        const expenseTime =
          expense.date.getTime();

        const matchesFrom =
          !from ||
          expenseTime >= from.getTime();

        const matchesTo =
          !to ||
          expenseTime <= to.getTime();

        const matchesVehicle =
          !vehicleFilter ||
          expense.vehicle === vehicleFilter;

        return (
          matchesFrom &&
          matchesTo &&
          matchesVehicle
        );
      })
      .sort(
        (a, b) =>
          b.date.getTime() -
          a.date.getTime()
      );
  }, [
    visibleExpenseRecords,
    fromDate,
    toDate,
    vehicleFilter,
  ]);

  /* =======================================================
     TOTAL EXPENSE
  ======================================================= */

  const totalExpense = useMemo(() => {
    return filteredExpenses.reduce(
      (total, expense) =>
        total + expense.amount,
      0
    );
  }, [filteredExpenses]);

  /* =======================================================
     CATEGORY TOTALS
  ======================================================= */

  const categoryTotals = useMemo(() => {
    const totals = {
      "Road Tax": 0,
      Fitness: 0,
      Pollution: 0,
      Insurance: 0,
      "State Permit": 0,
      "National Permit": 0,
      Challan: 0,
      EMI: 0,
    };

    filteredExpenses.forEach(
      (expense) => {
        if (
          totals[expense.type] !==
          undefined
        ) {
          totals[expense.type] +=
            expense.amount;
        }
      }
    );

    return totals;
  }, [filteredExpenses]);

  /* =======================================================
     RESET FILTERS
  ======================================================= */

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setVehicleFilter("");
    setVehicleSearch("");
    setShowVehicleDropdown(false);
  };

  /* =======================================================
     CURRENCY
  ======================================================= */

  const formatAmount = (amount) => {
    return `₹ ${Number(
      amount || 0
    ).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  /* =======================================================
     STATUS CLASS
  ======================================================= */

  // const getStatusClass = (status) => {
  //   const value = normalizeText(status);

  //   /*
  //     Renewed uses the existing green status style.
  //     No new colour or UI styling is introduced.
  //   */
  //   if (
  //     value === "paid" ||
  //     value === "active"
  //     // value === "renewed"
  //   ) {
  //     return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  //   }

  //   if (value === "renewed") {
  //     "bg-purple-50 text-purple-700 border-purple-200"
  //   }

  //   if (
  //     value === "expiring soon" ||
  //     value === "expiring"
  //   ) {
  //     return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  //   }

  //   if (value === "expired") {
  //     return "bg-red-50 text-red-700 ring-1 ring-red-100";
  //   }

  //   return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  // };


  const getStatusClass = (status) => {
    const value = normalizeText(status);

    /*
      Renewed uses purple status style.
    */
    if (
      value === "paid" ||
      value === "active"
    ) {
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
    }

    if (value === "renewed") {
      return "bg-purple-50 text-purple-700 ring-1 ring-purple-100";
    }

    if (
      value === "expiring soon" ||
      value === "expiring"
    ) {
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
    }

    if (value === "expired") {
      return "bg-red-50 text-red-700 ring-1 ring-red-100";
    }

    return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  };

  /* =======================================================
     ACTION HANDLERS
  ======================================================= */

  const handleViewExpense = (expense) => {
    setOpenActionId(null);
    setSelectedExpense(expense);
  };

  const handleDeleteClick = (expense) => {
    setOpenActionId(null);
    setDeleteExpense(expense);
  };

  const handleConfirmDelete = () => {
    if (!deleteExpense) return;

    setDeletedExpenseIds((previous) => [
      ...previous,
      deleteExpense.id,
    ]);

    setDeleteExpense(null);
  };

  const handleCancelDelete = () => {
    setDeleteExpense(null);
  };

  /* =======================================================
     SUMMARY CARDS
  ======================================================= */

  const summaryCards = [
    {
      title: "Road Tax",
      value: categoryTotals["Road Tax"],
      subtitle: "Total road tax",
      subtitleClassName: "text-blue-600",
      icon: WalletCards,
      iconClassName:
        "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
      cardClassName:
        "border-blue-100 bg-white hover:border-blue-200 hover:shadow-blue-100/70",
      blobClassName: "bg-blue-50/80",
      bottomLineClassName: "bg-blue-500",
    },
    {
      title: "Fitness",
      value: categoryTotals.Fitness,
      subtitle: "Fitness expenses",
      subtitleClassName: "text-emerald-600",
      icon: ShieldCheck,
      iconClassName:
        "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white",
      cardClassName:
        "border-emerald-100 bg-white hover:border-emerald-200 hover:shadow-emerald-100/70",
      blobClassName: "bg-emerald-50/80",
      bottomLineClassName: "bg-emerald-500",
    },
    {
      title: "Pollution",
      value: categoryTotals.Pollution,
      subtitle: "Pollution expenses",
      subtitleClassName: "text-cyan-600",
      icon: Droplets,
      iconClassName:
        "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white",
      cardClassName:
        "border-cyan-100 bg-white hover:border-cyan-200 hover:shadow-cyan-100/70",
      blobClassName: "bg-cyan-50/80",
      bottomLineClassName: "bg-cyan-500",
    },
    {
      title: "Insurance",
      value: categoryTotals.Insurance,
      subtitle: "Insurance expenses",
      subtitleClassName: "text-violet-600",
      icon: Shield,
      iconClassName:
        "bg-violet-50 text-violet-600 group-hover:bg-violet-500 group-hover:text-white",
      cardClassName:
        "border-violet-100 bg-white hover:border-violet-200 hover:shadow-violet-100/70",
      blobClassName: "bg-violet-50/80",
      bottomLineClassName: "bg-violet-500",
    },
    {
      title: "State Permit",
      value: categoryTotals["State Permit"],
      subtitle: "State permit expenses",
      subtitleClassName: "text-amber-600",
      icon: MapPin,
      iconClassName:
        "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
      cardClassName:
        "border-amber-100 bg-white hover:border-amber-200 hover:shadow-amber-100/70",
      blobClassName: "bg-amber-50/80",
      bottomLineClassName: "bg-amber-500",
    },
    {
      title: "National Permit",
      value: categoryTotals["National Permit"],
      subtitle: "National permit expenses",
      subtitleClassName: "text-indigo-600",
      icon: Globe2,
      iconClassName:
        "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white",
      cardClassName:
        "border-indigo-100 bg-white hover:border-indigo-200 hover:shadow-indigo-100/70",
      blobClassName: "bg-indigo-50/80",
      bottomLineClassName: "bg-indigo-500",
    },
    {
      title: "Challan",
      value: categoryTotals.Challan,
      subtitle: "Paid challan expenses",
      subtitleClassName: "text-rose-600",
      icon: ReceiptText,
      iconClassName:
        "bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white",
      cardClassName:
        "border-rose-100 bg-white hover:border-rose-200 hover:shadow-rose-100/70",
      blobClassName: "bg-rose-50/80",
      bottomLineClassName: "bg-rose-500",
    },
    {
      title: "EMI",
      value: categoryTotals.EMI,
      subtitle: "Paid EMI expenses",
      subtitleClassName: "text-orange-600",
      icon: CreditCard,
      iconClassName:
        "bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white",
      cardClassName:
        "border-orange-100 bg-white hover:border-orange-200 hover:shadow-orange-100/70",
      blobClassName: "bg-orange-50/80",
      bottomLineClassName: "bg-orange-500",
    },
  ];

  return (
    <>
      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 transition duration-300 hover:scale-110 hover:rotate-3">
              <IndianRupee
                size={23}
                strokeWidth={2.3}
              />
            </div>

            <div>
              <span className="block text-2xl font-bold text-slate-800">
                Expense Overview
              </span>
            </div>
          </div>
        }
        subtitle="Track and monitor all vehicle expenses."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* =================================================
            HERO
        ================================================= */}

        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white shadow-lg"
        >
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />

          <div className="absolute -bottom-20 right-20 h-52 w-52 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <WalletCards className="h-5 w-5 text-blue-100" />

                <span className="text-sm font-medium text-blue-100">
                  Expense Management
                </span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight">
                Manage Your Vehicle Expenses
              </h2>

              <p className="mt-1 max-w-2xl text-sm text-blue-100">
                Monitor road tax, permits, insurance,
                challans, EMI and other paid vehicle
                expenses in one place.
              </p>
            </div>

            <motion.div
              whileHover={{
                scale: 1.05,
                rotate: 3,
              }}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
            >
              <IndianRupee className="h-8 w-8" />
            </motion.div>
          </div>
        </motion.div>

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="grid gap-5 md:grid-cols-2">
          <StatCard
            title="Total Expense"
            value={formatAmount(totalExpense)}
            subtitle={`${filteredExpenses.length} paid records`}
            icon={CircleDollarSign}
            iconClassName="bg-blue-600 text-blue-600 group-hover:bg-blue-600"
            subtitleClassName="text-blue-600"
            cardClassName="border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/50 hover:border-blue-200 hover:shadow-blue-200/60"
            blobClassName="bg-blue-100/70"
            bottomLineClassName="bg-blue-600"
          />

          <StatCard
            title="Paid Expenses"
            value={filteredExpenses.length}
            subtitle="Included in overview"
            icon={BadgeCheck}
            iconClassName="bg-emerald-500 text-emerald-500 group-hover:bg-emerald-500"
            subtitleClassName="text-emerald-600"
            cardClassName="border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/50 hover:border-emerald-200 hover:shadow-emerald-200/60"
            blobClassName="bg-emerald-100/70"
            bottomLineClassName="bg-emerald-500"
          />
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        {/* <motion.div
          variants={itemVariants}
          className="card overflow-hidden"
        >
          <div className="flex flex-col gap-4 px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Filter className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Expense Filters
                  </h3>

                  <p className="text-xs text-slate-500">
                    Filter expenses by date and vehicle.
                  </p>
                </div>
              </div>

              <div className="hidden rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 sm:block">
                {filteredExpenses.length} Records
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* FROM DATE */}

              {/* <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  From Date
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) =>
                      setFromDate(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-10 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div> */}

              {/* TO DATE */}

              {/* <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  To Date
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) =>
                      setToDate(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-10 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div> */}

              {/* VEHICLE */}

              {/* <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  Vehicle No.
                </label>

                <div className="relative">
                  <Car className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <select
                    value={vehicleFilter}
                    onChange={(e) =>
                      setVehicleFilter(
                        e.target.value
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-10 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      All Vehicles
                    </option>

                    {vehicleOptions.map(
                      (vehicle) => (
                        <option
                          key={vehicle}
                          value={vehicle}
                        >
                          {vehicle}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </div>

            {(fromDate ||
              toDate ||
              vehicleFilter) && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                }}
                className="flex justify-end border-t border-slate-100 pt-4"
              >
                <motion.button
                  type="button"
                  whileHover={{
                    x: -2,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={resetFilters}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Filters
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div> */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.15,
          }}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-4">

            {/* FILTER HEADER */}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Filter size={19} />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-slate-800">
                    Report Filters
                  </h3>

                  <p className="text-xs text-slate-400">
                    Filter all reports by date and vehicle.
                  </p>

                </div>

              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition-colors duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  <RotateCcw size={14} />

                  Clear Filters
                </button>
              )}

            </div>

            {/* FILTER FIELDS */}

            <div className="grid gap-4 md:grid-cols-3">

              {/* FROM DATE */}

              <div>

                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <CalendarDays
                    size={14}
                    className="text-blue-500"
                  />

                  From Date
                </label>

                <input
                  type="date"
                  value={fromDate}
                  max={toDate || undefined}
                  onChange={(event) =>
                    setFromDate(
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* TO DATE */}

              <div>

                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <CalendarDays
                    size={14}
                    className="text-indigo-500"
                  />

                  To Date
                </label>

                <input
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(event) =>
                    setToDate(
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* VEHICLE SEARCH */}

              <div className="relative">

                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <Truck
                    size={14}
                    className="text-violet-500"
                  />

                  Vehicle No.
                </label>

                <div className="relative">

                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={
                      showVehicleDropdown
                        ? vehicleSearch
                        : vehicleFilter
                    }
                    placeholder="Search Vehicle No."
                    onFocus={() => {
                      setShowVehicleDropdown(true);
                      setVehicleSearch(
                        vehicleFilter
                      );
                    }}
                    onChange={(event) => {
                      setVehicleSearch(
                        event.target.value
                      );

                      /*
                        Clear the applied filter while
                        searching. The filter is applied
                        again when a vehicle is selected.
                      */
                      setVehicleFilter("");

                      setShowVehicleDropdown(true);
                    }}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setShowVehicleDropdown(
                        (prev) => !prev
                      );

                      if (!showVehicleDropdown) {
                        setVehicleSearch(
                          vehicleFilter
                        );
                      }
                    }}
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-r-xl text-slate-400 transition-colors duration-200 hover:text-slate-600"
                    aria-label={
                      showVehicleDropdown
                        ? "Close vehicle dropdown"
                        : "Open vehicle dropdown"
                    }
                  >
                    <ChevronDown
                      size={17}
                      className={`transition-transform duration-200 ${
                        showVehicleDropdown
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                </div>

                <AnimatePresence>
                  {showVehicleDropdown && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -5,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -5,
                      }}
                      className="absolute left-0 right-0 top-full z-40 mt-2 max-h-64 overflow-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
                    >

                      {filteredVehicleOptions.length >
                      0 ? (
                        filteredVehicleOptions.map(
                          (vehicle) => (
                            <button
                              key={vehicle}
                              type="button"
                              onClick={() => {
                                setVehicleFilter(
                                  vehicle
                                );

                                setVehicleSearch(
                                  vehicle
                                );

                                setShowVehicleDropdown(
                                  false
                                );
                              }}
                              className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150 hover:bg-blue-50 hover:text-blue-600 ${
                                normalizeVehicle(
                                  vehicleFilter
                                ) ===
                                normalizeVehicle(
                                  vehicle
                                )
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-slate-700"
                              }`}
                            >
                              <Truck
                                size={15}
                                className="mr-2.5 shrink-0"
                              />

                              {vehicle}
                            </button>
                          )
                        )
                      ) : (
                        <div className="px-3 py-5 text-center text-xs text-slate-400">
                          No vehicle found
                        </div>
                      )}

                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

            </div>

            {/* ACTIVE FILTER INFO */}

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">

                <span className="text-xs font-semibold text-slate-400">
                  Active filters:
                </span>

                {fromDate && (
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                    From: {fromDate}
                  </span>
                )}

                {toDate && (
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600">
                    To: {toDate}
                  </span>
                )}

                {vehicleFilter && (
                  <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-600">
                    Vehicle: {vehicleFilter}
                  </span>
                )}

              </div>
            )}

          </div>

        </motion.div>

        {/* =================================================
            CATEGORY SUMMARY
        ================================================= */}

        <motion.div
          variants={containerVariants}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.title}
                variants={itemVariants}
                whileHover={{
                  y: -4,
                  scale: 1.01,
                }}
                transition={{
                  duration: 0.15,
                  ease: "easeOut",
                }}
                className={`group relative h-[152px] cursor-default overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-150 ${card.cardClassName}`}
              >
                <div
                  className={`pointer-events-none absolute -right-9 -top-14 h-32 w-32 rounded-full transition-transform duration-150 group-hover:scale-110 ${card.blobClassName}`}
                />

                <div className="relative z-10 flex h-full items-center justify-between px-5 py-5">
                  <div className="min-w-0">
                    <p className="text-base font-medium text-slate-600">
                      {card.title}
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                      {formatAmount(card.value)}
                    </p>

                    <p
                      className={`mt-1 text-sm font-medium ${card.subtitleClassName}`}
                    >
                      {card.subtitle}
                    </p>
                  </div>

                  <motion.div
                    whileHover={{
                      scale: 1.06,
                      rotate: 3,
                    }}
                    transition={{
                      duration: 0.15,
                      ease: "easeOut",
                    }}
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-all duration-150 ${card.iconClassName}`}
                  >
                    <Icon className="h-6 w-6" />
                  </motion.div>
                </div>

                <div
                  className={`absolute bottom-0 left-0 h-1 w-0 transition-all duration-150 group-hover:w-full ${card.bottomLineClassName}`}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* =================================================
            EXPENSE TABLE
        ================================================= */}

        <motion.div
          variants={itemVariants}
          className="card overflow-hidden"
        >
          <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <IndianRupee size={20} />
                </div>

                <h2 className="text-lg font-bold text-slate-800">
                  Expense Details
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Showing paid expenses based on the
                selected filters.
              </p>
            </div>

            <motion.div
              whileHover={{
                scale: 1.03,
              }}
              className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600"
            >
              <FileText className="h-4 w-4 text-blue-600" />
              {filteredExpenses.length} Records
            </motion.div>
          </div>

          {filteredExpenses.length === 0 ? (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="border-t border-slate-100 px-6 py-14 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Search className="h-6 w-6" />
              </div>

              <h4 className="mt-4 text-sm font-semibold text-slate-900">
                No expenses found
              </h4>

              <p className="mt-1 text-sm text-slate-500">
                No paid expenses match the selected
                filters.
              </p>

              {(fromDate ||
                toDate ||
                vehicleFilter) && (
                <motion.button
                  type="button"
                  whileHover={{
                    scale: 1.03,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={resetFilters}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear Filters
                </motion.button>
              )}
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs text-slate-500">
                  <tr>
                    <th className="whitespace-nowrap px-6 py-4 font-medium">
                      Vehicle
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 font-medium">
                      Expense Type
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 font-medium">
                      Description
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 font-medium">
                      Amount
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 font-medium">
                      Date
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 font-medium">
                      Status
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 text-center font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredExpenses.map(
                    (expense) => {
                      const Icon =
                        expense.icon ||
                        FileText;

                      return (
                        <motion.tr
                          key={expense.id}
                          initial={{
                            opacity: 0,
                            y: 8,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            duration: 0.25,
                          }}
                          className="group border-t border-slate-100 transition-colors duration-200 hover:bg-blue-50/40"
                        >
                          {/* VEHICLE */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
                                <IndianRupee size={16} />
                              </div>

                              <span className="font-semibold text-blue-700">
                                {expense.vehicle || "—"}
                              </span>
                            </div>
                          </td>

                          {/* EXPENSE TYPE */}

                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center gap-2">
                              <motion.div
                                whileHover={{
                                  scale: 1.08,
                                  rotate: 4,
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition-all duration-200 group-hover:bg-blue-50 group-hover:text-blue-600"
                              >
                                <Icon className="h-4 w-4" />
                              </motion.div>

                              <span className="font-medium text-slate-700">
                                {expense.type}
                              </span>
                            </div>
                          </td>

                          {/* DESCRIPTION */}

                          <td className="max-w-xs px-6 py-4 text-slate-600">
                            <span className="block truncate">
                              {expense.description ||
                                "—"}
                            </span>
                          </td>

                          {/* AMOUNT */}

                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <IndianRupee className="h-3.5 w-3.5 text-slate-400" />

                              <span className="font-semibold text-slate-900">
                                {formatAmount(
                                  expense.amount
                                )}
                              </span>
                            </div>
                          </td>

                          {/* DATE */}

                          <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-slate-400" />

                              {formatDate(
                                expense.date
                              )}
                            </div>
                          </td>

                          {/* STATUS */}

                          <td className="whitespace-nowrap px-6 py-4">
                            <motion.span
                              whileHover={{
                                scale: 1.04,
                              }}
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                expense.status
                              )}`}
                            >
                              {expense.status}
                            </motion.span>
                          </td>

                          {/* ACTION */}

                          <td className="relative whitespace-nowrap px-6 py-4 text-center">
                            <div className="relative inline-flex">
                              <motion.button
                                type="button"
                                whileHover={{
                                  scale: 1.08,
                                }}
                                whileTap={{
                                  scale: 0.94,
                                }}
                                onClick={() =>
                                  setOpenActionId(
                                    openActionId ===
                                      expense.id
                                      ? null
                                      : expense.id
                                  )
                                }
                                className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              text-slate-500
                              shadow-sm
                              transition
                              hover:border-blue-200
                              hover:bg-blue-50
                              hover:text-blue-600
                            "
                                title="More Actions"
                              >
                                <MoreVertical className="h-5 w-5" />
                              </motion.button>

                              <AnimatePresence>
                                {openActionId ===
                                  expense.id && (
                                  <motion.div
                                    initial={{
                                      opacity: 0,
                                      scale: 0.95,
                                      y: -4,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      scale: 1,
                                      y: 0,
                                    }}
                                    exit={{
                                      opacity: 0,
                                      scale: 0.95,
                                      y: -4,
                                    }}
                                    transition={{
                                      duration: 0.15,
                                    }}
                                    className="absolute right-0 top-11 z-30 w-32 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl"
                                  >
                                    <motion.button
                                      type="button"
                                      whileHover={{
                                        x: 2,
                                      }}
                                      onClick={() =>
                                        handleViewExpense(
                                          expense
                                        )
                                      }
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                                    >
                                      <Eye className="h-4 w-4" />
                                      View
                                    </motion.button>

                                    <motion.button
                                      type="button"
                                      whileHover={{
                                        x: 2,
                                      }}
                                      onClick={() =>
                                        handleDeleteClick(
                                          expense
                                        )
                                      }
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete
                                    </motion.button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          {filteredExpenses.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Total paid expenses:{" "}
                <span className="font-semibold text-slate-700">
                  {filteredExpenses.length}
                </span>
              </span>

              <motion.span
                whileHover={{
                  scale: 1.02,
                }}
              >
                Total:{" "}
                <span className="font-bold text-slate-900">
                  {formatAmount(
                    totalExpense
                  )}
                </span>
              </motion.span>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* =====================================================
          VIEW EXPENSE MODAL
      ===================================================== */}

      <AnimatePresence>
        {selectedExpense && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() =>
              setSelectedExpense(null)
            }
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 15,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
              className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
              {/* MODAL HEADER */}

              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Eye className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Expense Details
                    </h3>

                    <p className="text-xs text-slate-500">
                      Detailed information
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedExpense(null)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* DETAILS */}

              <div className="space-y-4 px-6 py-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Vehicle
                    </p>

                    <p className="mt-1 font-semibold text-blue-700">
                      {selectedExpense.vehicle ||
                        "—"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Expense Type
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {selectedExpense.type ||
                        "—"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Description
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {selectedExpense.description ||
                        "—"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Amount
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {formatAmount(
                        selectedExpense.amount
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Date
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {formatDate(
                        selectedExpense.date
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Status
                    </p>

                    <div className="mt-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                          selectedExpense.status
                        )}`}
                      >
                        {selectedExpense.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Source
                  </p>

                  <p className="mt-1 font-semibold capitalize text-blue-700">
                    {selectedExpense.source ||
                      "—"}
                  </p>
                </div>
              </div>

              {/* FOOTER */}

              <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
                <motion.button
                  type="button"
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={() =>
                    setSelectedExpense(null)
                  }
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      <AnimatePresence>
        {deleteExpense && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={handleCancelDelete}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 15,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
              className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
              <div className="px-6 py-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <AlertTriangle className="h-7 w-7" />
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  Delete Expense?
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Are you sure you want to delete this
                  expense record?
                </p>

                <div className="mt-4 rounded-xl bg-slate-50 p-4 text-left">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-slate-500">
                      Vehicle
                    </span>

                    <span className="text-sm font-semibold text-blue-700">
                      {deleteExpense.vehicle ||
                        "—"}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-slate-500">
                      Expense
                    </span>

                    <span className="text-sm font-semibold text-slate-700">
                      {deleteExpense.type ||
                        "—"}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-slate-500">
                      Amount
                    </span>

                    <span className="text-sm font-bold text-slate-900">
                      {formatAmount(
                        deleteExpense.amount
                      )}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-xs text-red-500">
                  This record will be removed from the
                  current Expense Overview.
                </p>
              </div>

              <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                <motion.button
                  type="button"
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={handleCancelDelete}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  No
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={handleConfirmDelete}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
                >
                  Yes, Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}











// import { useMemo, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   CalendarDays,
//   Car,
//   Truck,
//   ChevronDown,
//   FileText,
//   IndianRupee,
//   ReceiptText,
//   CreditCard,
//   ShieldCheck,
//   Droplets,
//   Shield,
//   MapPin,
//   Globe2,
//   RotateCcw,
//   WalletCards,
//   CircleDollarSign,
//   Filter,
//   Search,
//   BadgeCheck,
//   MoreVertical,
//   Eye,
//   Trash2,
//   X,
//   AlertTriangle,
// } from "lucide-react";

// import PageHeader from "../components/PageHeader";
// import {
//   useFleet,
//   parseDate,
//   formatDate,
// } from "../context/fleetContext";

// /* =========================================================
//    ANIMATION
// ========================================================= */

// const containerVariants = {
//   hidden: {},
//   show: {
//     transition: {
//       staggerChildren: 0.08,
//     },
//   },
// };

// const itemVariants = {
//   hidden: {
//     opacity: 0,
//     y: 20,
//   },
//   show: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.35,
//       ease: "easeOut",
//     },
//   },
// };

// /* =========================================================
//    STAT CARD
// ========================================================= */

// function StatCard({
//   title,
//   value,
//   subtitle,
//   icon: Icon,
//   iconClassName,
//   subtitleClassName,
//   cardClassName,
//   blobClassName,
//   bottomLineClassName,
// }) {
//   return (
//     <motion.div
//       variants={itemVariants}
//       whileHover={{
//         y: -4,
//         scale: 1.01,
//       }}
//       transition={{
//         duration: 0.15,
//         ease: "easeOut",
//       }}
//       className={`group relative h-[125px] cursor-default overflow-hidden rounded-2xl border shadow-sm transition-all duration-1000 hover:shadow-xl ${cardClassName}`}
//     >
//       <div
//         className={`pointer-events-none absolute -right-10 -top-16 h-36 w-36 rounded-full transition-transform duration-150 group-hover:scale-110 ${blobClassName}`}
//       />

//       <div className="relative z-10 flex h-full items-center justify-between px-6 py-5">
//         <div className="min-w-0">
//           <p className="text-base font-medium text-slate-600">
//             {title}
//           </p>

//           <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
//             {value}
//           </p>

//           {subtitle && (
//             <p
//               className={`mt-1 text-sm font-medium ${
//                 subtitleClassName || "text-slate-500"
//               }`}
//             >
//               {subtitle}
//             </p>
//           )}
//         </div>

//         <motion.div
//           whileHover={{
//             scale: 1.06,
//             rotate: 3,
//           }}
//           transition={{
//             duration: 1,
//             ease: "easeOut",
//           }}
//           className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-all duration-150 ${iconClassName}`}
//         >
//           <Icon className="h-8 w-8 text-white" />
//         </motion.div>
//       </div>

//       <div
//         className={`absolute bottom-0 left-0 h-1 w-0 transition-all duration-150 group-hover:w-full ${bottomLineClassName}`}
//       />
//     </motion.div>
//   );
// }

// /* =========================================================
//    EXPENSE OVERVIEW
// ========================================================= */

// export default function ExpenseOverview() {
//   const {
//     vehicles = [],
//     documents = [],
//     emis = [],
//     challans = [],
//     roadTaxes = [],
//     loans = [],
//     settings = {},
//   } = useFleet();

//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [vehicleFilter, setVehicleFilter] = useState("");

//   /* =======================================================
//      VEHICLE SEARCH STATE
//   ======================================================= */

//   const [vehicleSearch, setVehicleSearch] = useState("");
//   const [showVehicleDropdown, setShowVehicleDropdown] =
//     useState(false);

//   const hasActiveFilters =
//     Boolean(fromDate) ||
//     Boolean(toDate) ||
//     Boolean(vehicleFilter);

//   /* =======================================================
//      ACTION STATE
//   ======================================================= */

//   const [deletedExpenseIds, setDeletedExpenseIds] =
//     useState([]);

//   const [selectedExpense, setSelectedExpense] =
//     useState(null);

//   const [deleteExpense, setDeleteExpense] =
//     useState(null);

//   const [openActionId, setOpenActionId] =
//     useState(null);

//   /* =======================================================
//      HELPERS
//   ======================================================= */

//   const getAmount = (value) => {
//     if (typeof value === "number") {
//       return Number.isFinite(value) ? value : 0;
//     }

//     if (typeof value === "string") {
//       const cleaned = value
//         .replace(/[₹,\s]/g, "")
//         .replace(/[^\d.-]/g, "");

//       const number = Number(cleaned);

//       return Number.isFinite(number) ? number : 0;
//     }

//     return 0;
//   };

//   const getVehicleNumber = (item) => {
//     return (
//       item?.vehicleNumber ||
//       item?.vehicle ||
//       item?.vehicleNo ||
//       item?.registrationNumber ||
//       item?.registrationNo ||
//       item?.vehicleRegNo ||
//       item?.registration ||
//       ""
//     );
//   };

//   const getStatus = (status) => {
//     if (!status) return "Paid";

//     const value = String(status)
//       .trim()
//       .toLowerCase();

//     if (value === "paid") return "Paid";
//     if (value === "pending") return "Pending";
//     if (value === "expired") return "Expired";

//     if (
//       value === "expiring soon" ||
//       value === "expiring-soon" ||
//       value === "expiring"
//     ) {
//       return "Expiring Soon";
//     }

//     if (value === "active") return "Active";

//     return status;
//   };

//   const isPaid = (status) => {
//     return (
//       String(status || "")
//         .trim()
//         .toLowerCase() === "paid"
//     );
//   };

//   const getDateValue = (...values) => {
//     for (const value of values) {
//       if (!value) continue;

//       const parsed = parseDate(value);

//       if (
//         parsed &&
//         !Number.isNaN(parsed.getTime())
//       ) {
//         return parsed;
//       }
//     }

//     return null;
//   };

//   const normalizeText = (value) => {
//     return String(value || "")
//       .trim()
//       .toLowerCase();
//   };

//   /* =======================================================
//      VEHICLE NORMALIZER
//   ======================================================= */

//   const normalizeVehicle = (value) => {
//     return String(value || "")
//       .replace(/\s+/g, "")
//       .trim()
//       .toLowerCase();
//   };

//   /* =======================================================
//      EXPIRY STATUS
//   ======================================================= */

//   const getExpiryBasedStatus = (expiryValue) => {
//     const expiryDate = parseDate(expiryValue);

//     if (
//       !expiryDate ||
//       Number.isNaN(expiryDate.getTime())
//     ) {
//       return "Paid";
//     }

//     const today = new Date();

//     const todayOnly = new Date(
//       today.getFullYear(),
//       today.getMonth(),
//       today.getDate()
//     );

//     const expiryOnly = new Date(
//       expiryDate.getFullYear(),
//       expiryDate.getMonth(),
//       expiryDate.getDate()
//     );

//     const difference =
//       expiryOnly.getTime() -
//       todayOnly.getTime();

//     const daysLeft = Math.ceil(
//       difference / (1000 * 60 * 60 * 24)
//     );

//     const reminderDays = Number(
//       settings?.reminderDays ?? 10
//     );

//     if (daysLeft <= 0) {
//       return "Expired";
//     }

//     if (daysLeft <= reminderDays) {
//       return "Expiring Soon";
//     }

//     return "Active";
//   };

//   /* =======================================================
//      BUILD EXPENSE RECORDS
//   ======================================================= */

//   const expenseRecords = useMemo(() => {
//     const records = [];

//     /* =====================================================
//        ROAD TAX
//     ===================================================== */

//     roadTaxes.forEach((tax) => {
//       if (!tax) return;

//       const vehicleNumber = getVehicleNumber(tax);

//       const expenseDate = getDateValue(
//         tax.paymentDate,
//         tax.paidDate,
//         tax.taxDate,
//         tax.entryDate,
//         tax.date,
//         tax.startDate,
//         tax.taxStartDate,
//         tax.validFrom,
//         tax.effectiveDate,
//         tax.due,
//         tax.dueDate,
//         tax.expiryDate,
//         tax.endDate,
//         tax.createdAt
//       );

//       if (!expenseDate) return;

//       const amount = getAmount(
//         tax.paidAmount ??
//           tax.amountPaid ??
//           tax.paymentAmount ??
//           tax.taxAmount ??
//           tax.roadTaxAmount ??
//           tax.totalAmount ??
//           tax.paid ??
//           tax.payment ??
//           tax.amount
//       );

//       if (amount <= 0) return;

//       const expiryDate = getDateValue(
//         tax.dueDate,
//         tax.due,
//         tax.expiry,
//         tax.expiryDate,
//         tax.endDate,
//         tax.validTo,
//         tax.taxEndDate,
//         tax.renewalDate
//       );

//       const status = expiryDate
//         ? getExpiryBasedStatus(expiryDate)
//         : getStatus(tax.status);

//       const taxType =
//         tax.type ||
//         tax.taxType ||
//         tax.taxName ||
//         tax.description ||
//         tax.taxDescription ||
//         "Road Tax";

//       records.push({
//         id: `road-tax-${tax.id}`,
//         vehicle: vehicleNumber,
//         type: "Road Tax",
//         description:
//           taxType === "Road Tax"
//             ? "Road Tax"
//             : `${taxType} Road Tax`,
//         amount,
//         date: expenseDate,
//         status,
//         source: "roadTax",
//         icon: WalletCards,
//       });
//     });

//     /* =====================================================
//        DOCUMENT EXPENSES
//     ===================================================== */

//     documents.forEach((document) => {
//       if (!document) return;

//       const type = normalizeText(
//         document.type ||
//           document.documentType ||
//           document.name
//       );

//       let expenseType = "";

//       /*
//         IMPORTANT:
//         Road Tax can be added through AddDocument.jsx.
//         In that case it is stored inside documents[],
//         not roadTaxes[].
//       */

//       if (
//         type.includes("road tax") ||
//         type.includes("roadtax") ||
//         type.includes("m.v. tax") ||
//         type.includes("mv tax") ||
//         type.includes("motor vehicle tax")
//       ) {
//         expenseType = "Road Tax";
//       } else if (
//         type.includes("fitness") ||
//         type.includes("fitness certificate")
//       ) {
//         expenseType = "Fitness";
//       } else if (
//         type.includes("pollution") ||
//         type.includes("puc")
//       ) {
//         expenseType = "Pollution";
//       } else if (
//         type.includes("insurance")
//       ) {
//         expenseType = "Insurance";
//       } else if (
//         type.includes("state permit") ||
//         type.includes("statepermit")
//       ) {
//         expenseType = "State Permit";
//       } else if (
//         type.includes("national permit") ||
//         type.includes("nationalpermit")
//       ) {
//         expenseType = "National Permit";
//       }

//       if (!expenseType) return;

//       const vehicleNumber =
//         getVehicleNumber(document);

//       /*
//         IMPORTANT:
//         AddDocument.jsx stores the document starting
//         date in document.start.

//         Therefore document.start is included here.
//       */

//       const expenseDate = getDateValue(
//         document.paymentDate,
//         document.paidDate,
//         document.entryDate,
//         document.documentDate,
//         document.startDate,
//         document.start,
//         document.issueDate,
//         document.createdAt,
//         document.expiry
//       );

//       if (!expenseDate) return;

//       const amount = getAmount(
//         document.paidAmount ??
//           document.paymentAmount ??
//           document.amount
//       );

//       if (amount <= 0) return;

//       const expiryDate = getDateValue(
//         document.expiry,
//         document.expiryDate,
//         document.dueDate,
//         document.due
//       );

//       const status = expiryDate
//         ? getExpiryBasedStatus(expiryDate)
//         : getStatus(document.status);

//       records.push({
//         id: `document-${document.id}`,
//         vehicle: vehicleNumber,
//         type: expenseType,
//         description:
//           document.name ||
//           document.documentType ||
//           document.type ||
//           expenseType,
//         amount,
//         date: expenseDate,
//         status,
//         source: "document",
//         icon:
//           expenseType === "Road Tax"
//             ? WalletCards
//             : expenseType === "Fitness"
//             ? ShieldCheck
//             : expenseType === "Pollution"
//             ? Droplets
//             : expenseType === "Insurance"
//             ? Shield
//             : expenseType === "State Permit"
//             ? MapPin
//             : Globe2,
//       });
//     });

//     /* =====================================================
//        PAID EMI ONLY
//     ===================================================== */

//     emis.forEach((emi) => {
//       if (!isPaid(emi.status)) return;

//       const vehicleNumber =
//         getVehicleNumber(emi);

//       const linkedLoan =
//         loans.find(
//           (loan) =>
//             String(loan?.id) ===
//             String(emi?.loanId)
//         ) || null;

//       const loanNumber =
//         emi?.loanNumber ||
//         emi?.loanNo ||
//         emi?.loanAccountNumber ||
//         linkedLoan?.loanNumber ||
//         linkedLoan?.loanNo ||
//         linkedLoan?.loanAccountNumber ||
//         "";

//       const bankName =
//         emi?.financerBank ||
//         emi?.bank ||
//         emi?.bankName ||
//         linkedLoan?.financerBank ||
//         linkedLoan?.bank ||
//         linkedLoan?.bankName ||
//         "";

//       const expenseDate = getDateValue(
//         emi.paidDate,
//         emi.paymentDate,
//         emi.due,
//         emi.dueDate,
//         emi.emiDate,
//         emi.date,
//         emi.createdAt
//       );

//       if (!expenseDate) return;

//       const amount = getAmount(
//         emi.paidAmount ??
//           emi.paymentAmount ??
//           emi.emiAmount ??
//           emi.amount
//       );

//       if (amount <= 0) return;

//       const description = loanNumber
//         ? `Loan No: ${loanNumber}`
//         : bankName
//         ? `EMI - ${bankName}`
//         : "Vehicle EMI";

//       records.push({
//         id: `emi-${emi.id}`,
//         vehicle: vehicleNumber,
//         type: "EMI",
//         description,
//         amount,
//         date: expenseDate,
//         status: "Paid",
//         source: "emi",
//         icon: CreditCard,
//       });
//     });

//     /* =====================================================
//        PAID CHALLAN ONLY
//     ===================================================== */

//     challans.forEach((challan) => {
//       if (!isPaid(challan.status)) return;

//       const vehicleNumber =
//         getVehicleNumber(challan);

//       const expenseDate = getDateValue(
//         challan.paidDate,
//         challan.paymentDate,
//         challan.challanDate,
//         challan.date,
//         challan.dueDate,
//         challan.due,
//         challan.createdAt
//       );

//       if (!expenseDate) return;

//       const amount = getAmount(
//         challan.paidAmount ??
//           challan.paymentAmount
//       );

//       if (amount <= 0) return;

//       records.push({
//         id: `challan-${challan.id}`,
//         vehicle: vehicleNumber,
//         type: "Challan",
//         description:
//           challan.reason ||
//           challan.offence ||
//           challan.description ||
//           challan.challanNo ||
//           challan.number ||
//           "Traffic Challan",
//         amount,
//         date: expenseDate,
//         status: "Paid",
//         source: "challan",
//         icon: ReceiptText,
//       });
//     });

//     return records;
//   }, [
//     roadTaxes,
//     documents,
//     emis,
//     challans,
//     loans,
//     settings,
//   ]);

//   /* =======================================================
//      VISIBLE EXPENSE RECORDS
//   ======================================================= */

//   const visibleExpenseRecords = useMemo(() => {
//     if (deletedExpenseIds.length === 0) {
//       return expenseRecords;
//     }

//     return expenseRecords.filter(
//       (expense) =>
//         !deletedExpenseIds.includes(expense.id)
//     );
//   }, [
//     expenseRecords,
//     deletedExpenseIds,
//   ]);

//   /* =======================================================
//      VEHICLE OPTIONS
//   ======================================================= */

//   const vehicleOptions = useMemo(() => {
//     const values = new Set();

//     vehicles.forEach((vehicle) => {
//       const number =
//         vehicle?.number ||
//         vehicle?.vehicleNumber ||
//         vehicle?.registrationNumber ||
//         vehicle?.registrationNo;

//       if (number) {
//         values.add(number);
//       }
//     });

//     visibleExpenseRecords.forEach((record) => {
//       if (record.vehicle) {
//         values.add(record.vehicle);
//       }
//     });

//     return Array.from(values).sort();
//   }, [vehicles, visibleExpenseRecords]);

//   /* =======================================================
//      FILTERED VEHICLE OPTIONS
//   ======================================================= */

//   const filteredVehicleOptions = useMemo(() => {
//     const searchValue =
//       normalizeVehicle(vehicleSearch);

//     if (!searchValue) {
//       return vehicleOptions;
//     }

//     return vehicleOptions.filter((vehicle) =>
//       normalizeVehicle(vehicle).includes(
//         searchValue
//       )
//     );
//   }, [
//     vehicleOptions,
//     vehicleSearch,
//   ]);

//   /* =======================================================
//      FILTERED EXPENSES
//   ======================================================= */

//   const filteredExpenses = useMemo(() => {
//     const from = fromDate
//       ? new Date(`${fromDate}T00:00:00`)
//       : null;

//     const to = toDate
//       ? new Date(`${toDate}T23:59:59.999`)
//       : null;

//     return visibleExpenseRecords
//       .filter((expense) => {
//         const expenseTime =
//           expense.date.getTime();

//         const matchesFrom =
//           !from ||
//           expenseTime >= from.getTime();

//         const matchesTo =
//           !to ||
//           expenseTime <= to.getTime();

//         const matchesVehicle =
//           !vehicleFilter ||
//           expense.vehicle === vehicleFilter;

//         return (
//           matchesFrom &&
//           matchesTo &&
//           matchesVehicle
//         );
//       })
//       .sort(
//         (a, b) =>
//           b.date.getTime() -
//           a.date.getTime()
//       );
//   }, [
//     visibleExpenseRecords,
//     fromDate,
//     toDate,
//     vehicleFilter,
//   ]);

//   /* =======================================================
//      TOTAL EXPENSE
//   ======================================================= */

//   const totalExpense = useMemo(() => {
//     return filteredExpenses.reduce(
//       (total, expense) =>
//         total + expense.amount,
//       0
//     );
//   }, [filteredExpenses]);

//   /* =======================================================
//      CATEGORY TOTALS
//   ======================================================= */

//   const categoryTotals = useMemo(() => {
//     const totals = {
//       "Road Tax": 0,
//       Fitness: 0,
//       Pollution: 0,
//       Insurance: 0,
//       "State Permit": 0,
//       "National Permit": 0,
//       Challan: 0,
//       EMI: 0,
//     };

//     filteredExpenses.forEach(
//       (expense) => {
//         if (
//           totals[expense.type] !==
//           undefined
//         ) {
//           totals[expense.type] +=
//             expense.amount;
//         }
//       }
//     );

//     return totals;
//   }, [filteredExpenses]);

//   /* =======================================================
//      RESET FILTERS
//   ======================================================= */

//   const resetFilters = () => {
//     setFromDate("");
//     setToDate("");
//     setVehicleFilter("");
//     setVehicleSearch("");
//     setShowVehicleDropdown(false);
//   };

//   /* =======================================================
//      CURRENCY
//   ======================================================= */

//   const formatAmount = (amount) => {
//     return `₹ ${Number(
//       amount || 0
//     ).toLocaleString("en-IN", {
//       maximumFractionDigits: 2,
//     })}`;
//   };

//   /* =======================================================
//      STATUS CLASS
//   ======================================================= */

//   const getStatusClass = (status) => {
//     const value = normalizeText(status);

//     if (
//       value === "paid" ||
//       value === "active"
//     ) {
//       return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
//     }

//     if (
//       value === "expiring soon" ||
//       value === "expiring"
//     ) {
//       return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
//     }

//     if (value === "expired") {
//       return "bg-red-50 text-red-700 ring-1 ring-red-100";
//     }

//     return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
//   };

//   /* =======================================================
//      ACTION HANDLERS
//   ======================================================= */

//   const handleViewExpense = (expense) => {
//     setOpenActionId(null);
//     setSelectedExpense(expense);
//   };

//   const handleDeleteClick = (expense) => {
//     setOpenActionId(null);
//     setDeleteExpense(expense);
//   };

//   const handleConfirmDelete = () => {
//     if (!deleteExpense) return;

//     setDeletedExpenseIds((previous) => [
//       ...previous,
//       deleteExpense.id,
//     ]);

//     setDeleteExpense(null);
//   };

//   const handleCancelDelete = () => {
//     setDeleteExpense(null);
//   };

//   /* =======================================================
//      SUMMARY CARDS
//   ======================================================= */

//   const summaryCards = [
//     {
//       title: "Road Tax",
//       value: categoryTotals["Road Tax"],
//       subtitle: "Total road tax",
//       subtitleClassName: "text-blue-600",
//       icon: WalletCards,
//       iconClassName:
//         "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
//       cardClassName:
//         "border-blue-100 bg-white hover:border-blue-200 hover:shadow-blue-100/70",
//       blobClassName: "bg-blue-50/80",
//       bottomLineClassName: "bg-blue-500",
//     },
//     {
//       title: "Fitness",
//       value: categoryTotals.Fitness,
//       subtitle: "Fitness expenses",
//       subtitleClassName: "text-emerald-600",
//       icon: ShieldCheck,
//       iconClassName:
//         "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white",
//       cardClassName:
//         "border-emerald-100 bg-white hover:border-emerald-200 hover:shadow-emerald-100/70",
//       blobClassName: "bg-emerald-50/80",
//       bottomLineClassName: "bg-emerald-500",
//     },
//     {
//       title: "Pollution",
//       value: categoryTotals.Pollution,
//       subtitle: "Pollution expenses",
//       subtitleClassName: "text-cyan-600",
//       icon: Droplets,
//       iconClassName:
//         "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white",
//       cardClassName:
//         "border-cyan-100 bg-white hover:border-cyan-200 hover:shadow-cyan-100/70",
//       blobClassName: "bg-cyan-50/80",
//       bottomLineClassName: "bg-cyan-500",
//     },
//     {
//       title: "Insurance",
//       value: categoryTotals.Insurance,
//       subtitle: "Insurance expenses",
//       subtitleClassName: "text-violet-600",
//       icon: Shield,
//       iconClassName:
//         "bg-violet-50 text-violet-600 group-hover:bg-violet-500 group-hover:text-white",
//       cardClassName:
//         "border-violet-100 bg-white hover:border-violet-200 hover:shadow-violet-100/70",
//       blobClassName: "bg-violet-50/80",
//       bottomLineClassName: "bg-violet-500",
//     },
//     {
//       title: "State Permit",
//       value: categoryTotals["State Permit"],
//       subtitle: "State permit expenses",
//       subtitleClassName: "text-amber-600",
//       icon: MapPin,
//       iconClassName:
//         "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
//       cardClassName:
//         "border-amber-100 bg-white hover:border-amber-200 hover:shadow-amber-100/70",
//       blobClassName: "bg-amber-50/80",
//       bottomLineClassName: "bg-amber-500",
//     },
//     {
//       title: "National Permit",
//       value: categoryTotals["National Permit"],
//       subtitle: "National permit expenses",
//       subtitleClassName: "text-indigo-600",
//       icon: Globe2,
//       iconClassName:
//         "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white",
//       cardClassName:
//         "border-indigo-100 bg-white hover:border-indigo-200 hover:shadow-indigo-100/70",
//       blobClassName: "bg-indigo-50/80",
//       bottomLineClassName: "bg-indigo-500",
//     },
//     {
//       title: "Challan",
//       value: categoryTotals.Challan,
//       subtitle: "Paid challan expenses",
//       subtitleClassName: "text-rose-600",
//       icon: ReceiptText,
//       iconClassName:
//         "bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white",
//       cardClassName:
//         "border-rose-100 bg-white hover:border-rose-200 hover:shadow-rose-100/70",
//       blobClassName: "bg-rose-50/80",
//       bottomLineClassName: "bg-rose-500",
//     },
//     {
//       title: "EMI",
//       value: categoryTotals.EMI,
//       subtitle: "Paid EMI expenses",
//       subtitleClassName: "text-orange-600",
//       icon: CreditCard,
//       iconClassName:
//         "bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white",
//       cardClassName:
//         "border-orange-100 bg-white hover:border-orange-200 hover:shadow-orange-100/70",
//       blobClassName: "bg-orange-50/80",
//       bottomLineClassName: "bg-orange-500",
//     },
//   ];

//   return (
//     <>
//       {/* ===================================================
//           PAGE HEADER
//       =================================================== */}

//       <PageHeader
//         title={
//           <div className="flex items-center gap-3">
//             <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 transition duration-300 hover:scale-110 hover:rotate-3">
//               <IndianRupee
//                 size={23}
//                 strokeWidth={2.3}
//               />
//             </div>

//             <div>
//               <span className="block text-2xl font-bold text-slate-800">
//                 Expense Overview
//               </span>
//             </div>
//           </div>
//         }
//         subtitle="Track and monitor all vehicle expenses."
//       />

//       <motion.div
//         variants={containerVariants}
//         initial="hidden"
//         animate="show"
//         className="space-y-6"
//       >
//         {/* =================================================
//             HERO
//         ================================================= */}

//         <motion.div
//           variants={itemVariants}
//           className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white shadow-lg"
//         >
//           <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />

//           <div className="absolute -bottom-20 right-20 h-52 w-52 rounded-full bg-white/5" />

//           <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <div className="mb-2 flex items-center gap-2">
//                 <WalletCards className="h-5 w-5 text-blue-100" />

//                 <span className="text-sm font-medium text-blue-100">
//                   Expense Management
//                 </span>
//               </div>

//               <h2 className="text-2xl font-bold tracking-tight">
//                 Manage Your Vehicle Expenses
//               </h2>

//               <p className="mt-1 max-w-2xl text-sm text-blue-100">
//                 Monitor road tax, permits, insurance,
//                 challans, EMI and other paid vehicle
//                 expenses in one place.
//               </p>
//             </div>

//             <motion.div
//               whileHover={{
//                 scale: 1.05,
//                 rotate: 3,
//               }}
//               className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
//             >
//               <IndianRupee className="h-8 w-8" />
//             </motion.div>
//           </div>
//         </motion.div>

//         {/* =================================================
//             STAT CARDS
//         ================================================= */}

//         <div className="grid gap-5 md:grid-cols-2">
//           <StatCard
//             title="Total Expense"
//             value={formatAmount(totalExpense)}
//             subtitle={`${filteredExpenses.length} paid records`}
//             icon={CircleDollarSign}
//             iconClassName="bg-blue-600 text-blue-600 group-hover:bg-blue-600"
//             subtitleClassName="text-blue-600"
//             cardClassName="border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/50 hover:border-blue-200 hover:shadow-blue-200/60"
//             blobClassName="bg-blue-100/70"
//             bottomLineClassName="bg-blue-600"
//           />

//           <StatCard
//             title="Paid Expenses"
//             value={filteredExpenses.length}
//             subtitle="Included in overview"
//             icon={BadgeCheck}
//             iconClassName="bg-emerald-500 text-emerald-500 group-hover:bg-emerald-500"
//             subtitleClassName="text-emerald-600"
//             cardClassName="border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/50 hover:border-emerald-200 hover:shadow-emerald-200/60"
//             blobClassName="bg-emerald-100/70"
//             bottomLineClassName="bg-emerald-500"
//           />
//         </div>

//         {/* =================================================
//             FILTERS
//         ================================================= */}

//         {/* <motion.div 
//           variants={itemVariants} 
//           className="card overflow-hidden" 
//         > 
//           <div className="flex flex-col gap-4 px-6 py-5"> 
//             <div className="flex items-center justify-between gap-4"> 
//               <div className="flex items-center gap-3"> 
//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"> 
//                   <Filter className="h-5 w-5" /> 
//                 </div> 
 
//                 <div> 
//                   <h3 className="text-sm font-bold text-slate-900"> 
//                     Expense Filters 
//                   </h3> 
 
//                   <p className="text-xs text-slate-500"> 
//                     Filter expenses by date and vehicle. 
//                   </p> 
//                 </div> 
//               </div> 
 
//               <div className="hidden rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 sm:block"> 
//                 {filteredExpenses.length} Records 
//               </div> 
//             </div> 
 
//             <div className="grid gap-4 md:grid-cols-3"> 
//               {/* FROM DATE */} 
 
//               {/* <div> 
//                 <label className="mb-2 block text-xs font-medium text-slate-500"> 
//                   From Date 
//                 </label> 
 
//                 <div className="relative"> 
//                   <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /> 
 
//                   <input 
//                     type="date" 
//                     value={fromDate} 
//                     onChange={(e) => 
//                       setFromDate( 
//                         e.target.value 
//                       ) 
//                     } 
//                     className="w-full rounded-xl border border-slate-200 bg-white px-10 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
//                   /> 
//                 </div> 
//               </div> */} 
 
//               {/* TO DATE */} 
 
//               {/* <div> 
//                 <label className="mb-2 block text-xs font-medium text-slate-500"> 
//                   To Date 
//                 </label> 
 
//                 <div className="relative"> 
//                   <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /> 
 
//                   <input 
//                     type="date" 
//                     value={toDate} 
//                     onChange={(e) => 
//                       setToDate( 
//                         e.target.value 
//                       ) 
//                     } 
//                     className="w-full rounded-xl border border-slate-200 bg-white px-10 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
//                   /> 
//                 </div> 
//               </div>  */} 
 
//               {/* VEHICLE */} 
 
//               {/* <div> 
//                 <label className="mb-2 block text-xs font-medium text-slate-500"> 
//                   Vehicle No. 
//                 </label> 
 
//                 <div className="relative"> 
//                   <Car className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /> 
 
//                   <select 
//                     value={vehicleFilter} 
//                     onChange={(e) => 
//                       setVehicleFilter( 
//                         e.target.value 
//                       ) 
//                     } 
//                     className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-10 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
//                   > 
//                     <option value=""> 
//                       All Vehicles 
//                     </option> 
 
//                     {vehicleOptions.map( 
//                       (vehicle) => ( 
//                         <option 
//                           key={vehicle} 
//                           value={vehicle} 
//                         > 
//                           {vehicle} 
//                         </option> 
//                       ) 
//                     )} 
//                   </select> 
//                 </div> 
//               </div> 
//             </div> 
 
//             {(fromDate || 
//               toDate || 
//               vehicleFilter) && ( 
//               <motion.div 
//                 initial={{ 
//                   opacity: 0, 
//                   height: 0, 
//                 }} 
//                 animate={{ 
//                   opacity: 1, 
//                   height: "auto", 
//                 }} 
//                 className="flex justify-end border-t border-slate-100 pt-4" 
//               > 
//                 <motion.button 
//                   type="button" 
//                   whileHover={{ 
//                     x: -2, 
//                   }} 
//                   whileTap={{ 
//                     scale: 0.97, 
//                   }} 
//                   onClick={resetFilters} 
//                   className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50" 
//                 > 
//                   <RotateCcw className="h-4 w-4" /> 
//                   Reset Filters 
//                 </motion.button> 
//               </motion.div> 
//             )} 
//           </div> 
//         </motion.div> */}

//         <motion.div
//           initial={{
//             opacity: 0,
//             y: 15,
//           }}
//           animate={{
//             opacity: 1,
//             y: 0,
//           }}
//           transition={{
//             duration: 0.45,
//             delay: 0.15,
//           }}
//           className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
//         >
//           <div className="flex flex-col gap-4">

//             {/* FILTER HEADER */}

//             <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

//               <div className="flex items-center gap-3">

//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
//                   <Filter size={19} />
//                 </div>

//                 <div>

//                   <h3 className="text-sm font-bold text-slate-800">
//                     Report Filters
//                   </h3>

//                   <p className="text-xs text-slate-400">
//                     Filter all reports by date and vehicle.
//                   </p>

//                 </div>

//               </div>

//               {hasActiveFilters && (
//                 <button
//                   type="button"
//                   onClick={resetFilters}
//                   className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition-colors duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
//                 >
//                   <RotateCcw size={14} />

//                   Clear Filters
//                 </button>
//               )}

//             </div>

//             {/* FILTER FIELDS */}

//             <div className="grid gap-4 md:grid-cols-3">

//               {/* FROM DATE */}

//               <div>

//                 <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-600">
//                   <CalendarDays
//                     size={14}
//                     className="text-blue-500"
//                   />

//                   From Date
//                 </label>

//                 <input
//                   type="date"
//                   value={fromDate}
//                   max={toDate || undefined}
//                   onChange={(event) =>
//                     setFromDate(
//                       event.target.value
//                     )
//                   }
//                   className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
//                 />

//               </div>

//               {/* TO DATE */}

//               <div>

//                 <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-600">
//                   <CalendarDays
//                     size={14}
//                     className="text-indigo-500"
//                   />

//                   To Date
//                 </label>

//                 <input
//                   type="date"
//                   value={toDate}
//                   min={fromDate || undefined}
//                   onChange={(event) =>
//                     setToDate(
//                       event.target.value
//                     )
//                   }
//                   className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
//                 />

//               </div>

//               {/* VEHICLE SEARCH */}

//               <div className="relative">

//                 <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-600">
//                   <Truck
//                     size={14}
//                     className="text-violet-500"
//                   />

//                   Vehicle No.
//                 </label>

//                 <div className="relative">

//                   <Search
//                     size={16}
//                     className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
//                   />

//                   <input
//                     type="text"
//                     value={
//                       showVehicleDropdown
//                         ? vehicleSearch
//                         : vehicleFilter
//                     }
//                     placeholder="Search Vehicle No."
//                     onFocus={() => {
//                       setShowVehicleDropdown(true);
//                       setVehicleSearch(
//                         vehicleFilter
//                       );
//                     }}
//                     onChange={(event) => {
//                       setVehicleSearch(
//                         event.target.value
//                       );

//                       /*
//                         Clear the applied filter while
//                         searching. The filter is applied
//                         again when a vehicle is selected.
//                       */
//                       setVehicleFilter("");

//                       setShowVehicleDropdown(true);
//                     }}
//                     className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
//                   />

//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowVehicleDropdown(
//                         (prev) => !prev
//                       );

//                       if (!showVehicleDropdown) {
//                         setVehicleSearch(
//                           vehicleFilter
//                         );
//                       }
//                     }}
//                     className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-r-xl text-slate-400 transition-colors duration-200 hover:text-slate-600"
//                     aria-label={
//                       showVehicleDropdown
//                         ? "Close vehicle dropdown"
//                         : "Open vehicle dropdown"
//                     }
//                   >
//                     <ChevronDown
//                       size={17}
//                       className={`transition-transform duration-200 ${
//                         showVehicleDropdown
//                           ? "rotate-180"
//                           : ""
//                       }`}
//                     />
//                   </button>

//                 </div>

//                 <AnimatePresence>
//                   {showVehicleDropdown && (
//                     <motion.div
//                       initial={{
//                         opacity: 0,
//                         y: -5,
//                       }}
//                       animate={{
//                         opacity: 1,
//                         y: 0,
//                       }}
//                       exit={{
//                         opacity: 0,
//                         y: -5,
//                       }}
//                       className="absolute left-0 right-0 top-full z-40 mt-2 max-h-64 overflow-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
//                     >

//                       {filteredVehicleOptions.length >
//                       0 ? (
//                         filteredVehicleOptions.map(
//                           (vehicle) => (
//                             <button
//                               key={vehicle}
//                               type="button"
//                               onClick={() => {
//                                 setVehicleFilter(
//                                   vehicle
//                                 );

//                                 setVehicleSearch(
//                                   vehicle
//                                 );

//                                 setShowVehicleDropdown(
//                                   false
//                                 );
//                               }}
//                               className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150 hover:bg-blue-50 hover:text-blue-600 ${
//                                 normalizeVehicle(
//                                   vehicleFilter
//                                 ) ===
//                                 normalizeVehicle(
//                                   vehicle
//                                 )
//                                   ? "bg-blue-50 text-blue-600"
//                                   : "text-slate-700"
//                               }`}
//                             >
//                               <Truck
//                                 size={15}
//                                 className="mr-2.5 shrink-0"
//                               />

//                               {vehicle}
//                             </button>
//                           )
//                         )
//                       ) : (
//                         <div className="px-3 py-5 text-center text-xs text-slate-400">
//                           No vehicle found
//                         </div>
//                       )}

//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//               </div>

//             </div>

//             {/* ACTIVE FILTER INFO */}

//             {hasActiveFilters && (
//               <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">

//                 <span className="text-xs font-semibold text-slate-400">
//                   Active filters:
//                 </span>

//                 {fromDate && (
//                   <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
//                     From: {fromDate}
//                   </span>
//                 )}

//                 {toDate && (
//                   <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600">
//                     To: {toDate}
//                   </span>
//                 )}

//                 {vehicleFilter && (
//                   <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-600">
//                     Vehicle: {vehicleFilter}
//                   </span>
//                 )}

//               </div>
//             )}

//           </div>

//         </motion.div>

//         {/* =================================================
//             CATEGORY SUMMARY
//         ================================================= */}

//         <motion.div
//           variants={containerVariants}
//           className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
//         >
//           {summaryCards.map((card) => {
//             const Icon = card.icon;

//             return (
//               <motion.div
//                 key={card.title}
//                 variants={itemVariants}
//                 whileHover={{
//                   y: -4,
//                   scale: 1.01,
//                 }}
//                 transition={{
//                   duration: 0.15,
//                   ease: "easeOut",
//                 }}
//                 className={`group relative h-[152px] cursor-default overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-150 ${card.cardClassName}`}
//               >
//                 <div
//                   className={`pointer-events-none absolute -right-9 -top-14 h-32 w-32 rounded-full transition-transform duration-150 group-hover:scale-110 ${card.blobClassName}`}
//                 />

//                 <div className="relative z-10 flex h-full items-center justify-between px-5 py-5">
//                   <div className="min-w-0">
//                     <p className="text-base font-medium text-slate-600">
//                       {card.title}
//                     </p>

//                     <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
//                       {formatAmount(card.value)}
//                     </p>

//                     <p
//                       className={`mt-1 text-sm font-medium ${card.subtitleClassName}`}
//                     >
//                       {card.subtitle}
//                     </p>
//                   </div>

//                   <motion.div
//                     whileHover={{
//                       scale: 1.06,
//                       rotate: 3,
//                     }}
//                     transition={{
//                       duration: 0.15,
//                       ease: "easeOut",
//                     }}
//                     className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-all duration-150 ${card.iconClassName}`}
//                   >
//                     <Icon className="h-6 w-6" />
//                   </motion.div>
//                 </div>

//                 <div
//                   className={`absolute bottom-0 left-0 h-1 w-0 transition-all duration-150 group-hover:w-full ${card.bottomLineClassName}`}
//                 />
//               </motion.div>
//             );
//           })}
//         </motion.div>

//         {/* =================================================
//             EXPENSE TABLE
//         ================================================= */}

//         <motion.div
//           variants={itemVariants}
//           className="card overflow-hidden"
//         >
//           <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <div className="flex items-center gap-2">
//                 <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
//                   <IndianRupee size={20} />
//                 </div>

//                 <h2 className="text-lg font-bold text-slate-800">
//                   Expense Details
//                 </h2>
//               </div>

//               <p className="mt-1 text-sm text-slate-500">
//                 Showing paid expenses based on the
//                 selected filters.
//               </p>
//             </div>

//             <motion.div
//               whileHover={{
//                 scale: 1.03,
//               }}
//               className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600"
//             >
//               <FileText className="h-4 w-4 text-blue-600" />
//               {filteredExpenses.length} Records
//             </motion.div>
//           </div>

//           {filteredExpenses.length === 0 ? (
//             <motion.div
//               initial={{
//                 opacity: 0,
//                 y: 10,
//               }}
//               animate={{
//                 opacity: 1,
//                 y: 0,
//               }}
//               className="border-t border-slate-100 px-6 py-14 text-center"
//             >
//               <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
//                 <Search className="h-6 w-6" />
//               </div>

//               <h4 className="mt-4 text-sm font-semibold text-slate-900">
//                 No expenses found
//               </h4>

//               <p className="mt-1 text-sm text-slate-500">
//                 No paid expenses match the selected
//                 filters.
//               </p>

//               {(fromDate ||
//                 toDate ||
//                 vehicleFilter) && (
//                 <motion.button
//                   type="button"
//                   whileHover={{
//                     scale: 1.03,
//                   }}
//                   whileTap={{
//                     scale: 0.97,
//                   }}
//                   onClick={resetFilters}
//                   className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
//                 >
//                   <RotateCcw className="h-4 w-4" />
//                   Clear Filters
//                 </motion.button>
//               )}
//             </motion.div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-slate-50 text-left text-xs text-slate-500">
//                   <tr>
//                     <th className="whitespace-nowrap px-6 py-4 font-medium">
//                       Vehicle
//                     </th>

//                     <th className="whitespace-nowrap px-6 py-4 font-medium">
//                       Expense Type
//                     </th>

//                     <th className="whitespace-nowrap px-6 py-4 font-medium">
//                       Description
//                     </th>

//                     <th className="whitespace-nowrap px-6 py-4 font-medium">
//                       Amount
//                     </th>

//                     <th className="whitespace-nowrap px-6 py-4 font-medium">
//                       Date
//                     </th>

//                     <th className="whitespace-nowrap px-6 py-4 font-medium">
//                       Status
//                     </th>

//                     <th className="whitespace-nowrap px-6 py-4 text-center font-medium">
//                       Action
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {filteredExpenses.map(
//                     (expense) => {
//                       const Icon =
//                         expense.icon ||
//                         FileText;

//                       return (
//                         <motion.tr
//                           key={expense.id}
//                           initial={{
//                             opacity: 0,
//                             y: 8,
//                           }}
//                           animate={{
//                             opacity: 1,
//                             y: 0,
//                           }}
//                           transition={{
//                             duration: 0.25,
//                           }}
//                           className="group border-t border-slate-100 transition-colors duration-200 hover:bg-blue-50/40"
//                         >
//                           {/* VEHICLE */}

//                           <td className="px-5 py-4">
//                             <div className="flex items-center gap-3">
//                               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
//                                 <IndianRupee size={16} />
//                               </div>

//                               <span className="font-semibold text-blue-700">
//                                 {expense.vehicle || "—"}
//                               </span>
//                             </div>
//                           </td>

//                           {/* EXPENSE TYPE */}

//                           <td className="whitespace-nowrap px-6 py-4">
//                             <div className="flex items-center gap-2">
//                               <motion.div
//                                 whileHover={{
//                                   scale: 1.08,
//                                   rotate: 4,
//                                 }}
//                                 className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition-all duration-200 group-hover:bg-blue-50 group-hover:text-blue-600"
//                               >
//                                 <Icon className="h-4 w-4" />
//                               </motion.div>

//                               <span className="font-medium text-slate-700">
//                                 {expense.type}
//                               </span>
//                             </div>
//                           </td>

//                           {/* DESCRIPTION */}

//                           <td className="max-w-xs px-6 py-4 text-slate-600">
//                             <span className="block truncate">
//                               {expense.description ||
//                                 "—"}
//                             </span>
//                           </td>

//                           {/* AMOUNT */}

//                           <td className="whitespace-nowrap px-6 py-4">
//                             <div className="flex items-center gap-1.5">
//                               <IndianRupee className="h-3.5 w-3.5 text-slate-400" />

//                               <span className="font-semibold text-slate-900">
//                                 {formatAmount(
//                                   expense.amount
//                                 )}
//                               </span>
//                             </div>
//                           </td>

//                           {/* DATE */}

//                           <td className="whitespace-nowrap px-6 py-4 text-slate-600">
//                             <div className="flex items-center gap-2">
//                               <CalendarDays className="h-4 w-4 text-slate-400" />

//                               {formatDate(
//                                 expense.date
//                               )}
//                             </div>
//                           </td>

//                           {/* STATUS */}

//                           <td className="whitespace-nowrap px-6 py-4">
//                             <motion.span
//                               whileHover={{
//                                 scale: 1.04,
//                               }}
//                               className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
//                                 expense.status
//                               )}`}
//                             >
//                               {expense.status}
//                             </motion.span>
//                           </td>

//                           {/* ACTION */}

//                           <td className="relative whitespace-nowrap px-6 py-4 text-center">
//                             <div className="relative inline-flex">
//                               <motion.button
//                                 type="button"
//                                 whileHover={{
//                                   scale: 1.08,
//                                 }}
//                                 whileTap={{
//                                   scale: 0.94,
//                                 }}
//                                 onClick={() =>
//                                   setOpenActionId(
//                                     openActionId ===
//                                       expense.id
//                                       ? null
//                                       : expense.id
//                                   )
//                                 }
//                                 className="
//                               flex
//                               h-9
//                               w-9
//                               items-center
//                               justify-center
//                               rounded-lg
//                               border
//                               border-slate-200
//                               bg-white
//                               text-slate-500
//                               shadow-sm
//                               transition
//                               hover:border-blue-200
//                               hover:bg-blue-50
//                               hover:text-blue-600
//                             "
//                                 title="More Actions"
//                               >
//                                 <MoreVertical className="h-5 w-5" />
//                               </motion.button>

//                               <AnimatePresence>
//                                 {openActionId ===
//                                   expense.id && (
//                                   <motion.div
//                                     initial={{
//                                       opacity: 0,
//                                       scale: 0.95,
//                                       y: -4,
//                                     }}
//                                     animate={{
//                                       opacity: 1,
//                                       scale: 1,
//                                       y: 0,
//                                     }}
//                                     exit={{
//                                       opacity: 0,
//                                       scale: 0.95,
//                                       y: -4,
//                                     }}
//                                     transition={{
//                                       duration: 0.15,
//                                     }}
//                                     className="absolute right-0 top-11 z-30 w-32 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl"
//                                   >
//                                     <motion.button
//                                       type="button"
//                                       whileHover={{
//                                         x: 2,
//                                       }}
//                                       onClick={() =>
//                                         handleViewExpense(
//                                           expense
//                                         )
//                                       }
//                                       className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
//                                     >
//                                       <Eye className="h-4 w-4" />
//                                       View
//                                     </motion.button>

//                                     <motion.button
//                                       type="button"
//                                       whileHover={{
//                                         x: 2,
//                                       }}
//                                       onClick={() =>
//                                         handleDeleteClick(
//                                           expense
//                                         )
//                                       }
//                                       className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
//                                     >
//                                       <Trash2 className="h-4 w-4" />
//                                       Delete
//                                     </motion.button>
//                                   </motion.div>
//                                 )}
//                               </AnimatePresence>
//                             </div>
//                           </td>
//                         </motion.tr>
//                       );
//                     }
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* =================================================
//               FOOTER
//           ================================================= */}

//           {filteredExpenses.length > 0 && (
//             <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
//               <span>
//                 Total paid expenses:{" "}
//                 <span className="font-semibold text-slate-700">
//                   {filteredExpenses.length}
//                 </span>
//               </span>

//               <motion.span
//                 whileHover={{
//                   scale: 1.02,
//                 }}
//               >
//                 Total:{" "}
//                 <span className="font-bold text-slate-900">
//                   {formatAmount(
//                     totalExpense
//                   )}
//                 </span>
//               </motion.span>
//             </div>
//           )}
//         </motion.div>
//       </motion.div>

//       {/* =====================================================
//           VIEW EXPENSE MODAL
//       ===================================================== */}

//       <AnimatePresence>
//         {selectedExpense && (
//           <motion.div
//             initial={{
//               opacity: 0,
//             }}
//             animate={{
//               opacity: 1,
//             }}
//             exit={{
//               opacity: 0,
//             }}
//             className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
//             onClick={() =>
//               setSelectedExpense(null)
//             }
//           >
//             <motion.div
//               initial={{
//                 opacity: 0,
//                 scale: 0.95,
//                 y: 15,
//               }}
//               animate={{
//                 opacity: 1,
//                 scale: 1,
//                 y: 0,
//               }}
//               exit={{
//                 opacity: 0,
//                 scale: 0.95,
//                 y: 15,
//               }}
//               transition={{
//                 duration: 0.2,
//               }}
//               onClick={(e) =>
//                 e.stopPropagation()
//               }
//               className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
//             >
//               {/* MODAL HEADER */}

//               <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
//                 <div className="flex items-center gap-3">
//                   <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//                     <Eye className="h-5 w-5" />
//                   </div>

//                   <div>
//                     <h3 className="text-lg font-bold text-slate-900">
//                       Expense Details
//                     </h3>

//                     <p className="text-xs text-slate-500">
//                       Detailed information
//                     </p>
//                   </div>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setSelectedExpense(null)
//                   }
//                   className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>

//               {/* DETAILS */}

//               <div className="space-y-4 px-6 py-6">
//                 <div className="grid gap-4 sm:grid-cols-2">
//                   <div className="rounded-xl bg-slate-50 p-4">
//                     <p className="text-xs font-medium text-slate-500">
//                       Vehicle
//                     </p>

//                     <p className="mt-1 font-semibold text-blue-700">
//                       {selectedExpense.vehicle ||
//                         "—"}
//                     </p>
//                   </div>

//                   <div className="rounded-xl bg-slate-50 p-4">
//                     <p className="text-xs font-medium text-slate-500">
//                       Expense Type
//                     </p>

//                     <p className="mt-1 font-semibold text-slate-800">
//                       {selectedExpense.type ||
//                         "—"}
//                     </p>
//                   </div>

//                   <div className="rounded-xl bg-slate-50 p-4">
//                     <p className="text-xs font-medium text-slate-500">
//                       Description
//                     </p>

//                     <p className="mt-1 font-semibold text-slate-800">
//                       {selectedExpense.description ||
//                         "—"}
//                     </p>
//                   </div>

//                   <div className="rounded-xl bg-slate-50 p-4">
//                     <p className="text-xs font-medium text-slate-500">
//                       Amount
//                     </p>

//                     <p className="mt-1 font-semibold text-slate-900">
//                       {formatAmount(
//                         selectedExpense.amount
//                       )}
//                     </p>
//                   </div>

//                   <div className="rounded-xl bg-slate-50 p-4">
//                     <p className="text-xs font-medium text-slate-500">
//                       Date
//                     </p>

//                     <p className="mt-1 font-semibold text-slate-800">
//                       {formatDate(
//                         selectedExpense.date
//                       )}
//                     </p>
//                   </div>

//                   <div className="rounded-xl bg-slate-50 p-4">
//                     <p className="text-xs font-medium text-slate-500">
//                       Status
//                     </p>

//                     <div className="mt-2">
//                       <span
//                         className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
//                           selectedExpense.status
//                         )}`}
//                       >
//                         {selectedExpense.status}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
//                   <p className="text-xs font-medium text-slate-500">
//                     Source
//                   </p>

//                   <p className="mt-1 font-semibold capitalize text-blue-700">
//                     {selectedExpense.source ||
//                       "—"}
//                   </p>
//                 </div>
//               </div>

//               {/* FOOTER */}

//               <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
//                 <motion.button
//                   type="button"
//                   whileHover={{
//                     scale: 1.02,
//                   }}
//                   whileTap={{
//                     scale: 0.97,
//                   }}
//                   onClick={() =>
//                     setSelectedExpense(null)
//                   }
//                   className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
//                 >
//                   Close
//                 </motion.button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* =====================================================
//           DELETE CONFIRMATION MODAL
//       ===================================================== */}

//       <AnimatePresence>
//         {deleteExpense && (
//           <motion.div
//             initial={{
//               opacity: 0,
//             }}
//             animate={{
//               opacity: 1,
//             }}
//             exit={{
//               opacity: 0,
//             }}
//             className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
//             onClick={handleCancelDelete}
//           >
//             <motion.div
//               initial={{
//                 opacity: 0,
//                 scale: 0.95,
//                 y: 15,
//               }}
//               animate={{
//                 opacity: 1,
//                 scale: 1,
//                 y: 0,
//               }}
//               exit={{
//                 opacity: 0,
//                 scale: 0.95,
//                 y: 15,
//               }}
//               transition={{
//                 duration: 0.2,
//               }}
//               onClick={(e) =>
//                 e.stopPropagation()
//               }
//               className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
//             >
//               <div className="px-6 py-6 text-center">
//                 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
//                   <AlertTriangle className="h-7 w-7" />
//                 </div>

//                 <h3 className="mt-4 text-lg font-bold text-slate-900">
//                   Delete Expense?
//                 </h3>

//                 <p className="mt-2 text-sm leading-6 text-slate-500">
//                   Are you sure you want to delete this
//                   expense record?
//                 </p>

//                 <div className="mt-4 rounded-xl bg-slate-50 p-4 text-left">
//                   <div className="flex items-center justify-between gap-4">
//                     <span className="text-xs font-medium text-slate-500">
//                       Vehicle
//                     </span>

//                     <span className="text-sm font-semibold text-blue-700">
//                       {deleteExpense.vehicle ||
//                         "—"}
//                     </span>
//                   </div>

//                   <div className="mt-2 flex items-center justify-between gap-4">
//                     <span className="text-xs font-medium text-slate-500">
//                       Expense
//                     </span>

//                     <span className="text-sm font-semibold text-slate-700">
//                       {deleteExpense.type ||
//                         "—"}
//                     </span>
//                   </div>

//                   <div className="mt-2 flex items-center justify-between gap-4">
//                     <span className="text-xs font-medium text-slate-500">
//                       Amount
//                     </span>

//                     <span className="text-sm font-bold text-slate-900">
//                       {formatAmount(
//                         deleteExpense.amount
//                       )}
//                     </span>
//                   </div>
//                 </div>

//                 <p className="mt-4 text-xs text-red-500">
//                   This record will be removed from the
//                   current Expense Overview.
//                 </p>
//               </div>

//               <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
//                 <motion.button
//                   type="button"
//                   whileHover={{
//                     scale: 1.02,
//                   }}
//                   whileTap={{
//                     scale: 0.97,
//                   }}
//                   onClick={handleCancelDelete}
//                   className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
//                 >
//                   No
//                 </motion.button>

//                 <motion.button
//                   type="button"
//                   whileHover={{
//                     scale: 1.02,
//                   }}
//                   whileTap={{
//                     scale: 0.97,
//                   }}
//                   onClick={handleConfirmDelete}
//                   className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
//                 >
//                   Yes, Delete
//                 </motion.button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }
