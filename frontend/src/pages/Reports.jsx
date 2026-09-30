
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";

import {
  FileWarning,
  FileX2,
  Truck,
  CreditCard,
  ReceiptText,
  IndianRupeeIcon,
  Eye,
  Download,
  X,
  FileSpreadsheet,
  Printer,
  ArrowUpRight,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  BarChart3,
  Search,
  Calendar,
  Filter,
  ChevronDown,
  RotateCcw,
} from "lucide-react";

import * as XLSX from "xlsx";

import {
  useFleet,
  getExpiryStatus,
  formatDate,
  parseDate,
} from "../context/fleetContext";


// ============================================================
// ANIMATION VARIANTS
// ============================================================

const containerVariants = {
  hidden: {
    opacity: 0,
  },

  show: {
    opacity: 1,

    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 24,
  },

  show: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 15,
  },

  show: {
    opacity: 1,
    scale: 1,
    y: 0,

    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  exit: {
    opacity: 0,
    scale: 0.97,
    y: 10,

    transition: {
      duration: 0.18,
    },
  },
};


// ============================================================
// REPORT CARD STYLE
// ============================================================

const getReportStyle = (id) => {
  const styles = {
    expiring: {
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      accent: "from-amber-400 to-orange-500",
      soft: "bg-amber-50",
      border: "hover:border-amber-200",
      shadow: "hover:shadow-amber-100",
      text: "text-amber-600",
      label: "Attention Required",
    },

    expired: {
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
      accent: "from-rose-400 to-red-500",
      soft: "bg-rose-50",
      border: "hover:border-rose-200",
      shadow: "hover:shadow-rose-100",
      text: "text-rose-600",
      label: "Action Required",
    },

    vehicles: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      accent: "from-blue-500 to-indigo-600",
      soft: "bg-blue-50",
      border: "hover:border-blue-200",
      shadow: "hover:shadow-blue-100",
      text: "text-blue-600",
      label: "Fleet Overview",
    },

    emi: {
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      accent: "from-violet-500 to-purple-600",
      soft: "bg-violet-50",
      border: "hover:border-violet-200",
      shadow: "hover:shadow-violet-100",
      text: "text-violet-600",
      label: "Financial Report",
    },

    challans: {
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
      accent: "from-cyan-500 to-blue-600",
      soft: "bg-cyan-50",
      border: "hover:border-cyan-200",
      shadow: "hover:shadow-cyan-100",
      text: "text-cyan-600",
      label: "Traffic Report",
    },

    expense: {
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      accent: "from-emerald-500 to-teal-600",
      soft: "bg-emerald-50",
      border: "hover:border-emerald-200",
      shadow: "hover:shadow-emerald-100",
      text: "text-emerald-600",
      label: "Financial Overview",
    },
  };

  return (
    styles[id] || {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      accent: "from-blue-500 to-indigo-600",
      soft: "bg-blue-50",
      border: "hover:border-blue-200",
      shadow: "hover:shadow-blue-100",
      text: "text-blue-600",
      label: "Fleet Report",
    }
  );
};


// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }) {
  const normalized = String(status || "")
    .trim()
    .toLowerCase();

  let classes =
    "bg-slate-100 text-slate-600 border-slate-200";

  let Icon = Clock3;

  if (normalized === "paid") {
    classes =
      "bg-emerald-50 text-emerald-700 border-emerald-200";

    Icon = CheckCircle2;
  }

  if (normalized === "active") {
    classes =
      "bg-blue-50 text-blue-700 border-blue-200";

    Icon = CheckCircle2;
  }

  // ==========================================================
  // RENEWED
  // ==========================================================

  if (normalized === "renewed") {
    classes =
      "bg-emerald-50 text-emerald-700 border-emerald-200";

    Icon = CheckCircle2;
  }

  if (normalized === "expiring soon") {
    classes =
      "bg-amber-50 text-amber-700 border-amber-200";

    Icon = AlertTriangle;
  }

  if (normalized === "expired") {
    classes =
      "bg-rose-50 text-rose-700 border-rose-200";

    Icon = AlertTriangle;
  }

  if (normalized === "pending") {
    classes =
      "bg-orange-50 text-orange-700 border-orange-200";

    Icon = Clock3;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${classes}`}
    >
      <Icon size={13} strokeWidth={2.3} />

      {status || "Active"}
    </span>
  );
}


// ============================================================
// REPORT TABLE
// ============================================================

function ReportTable({ report, onVehicleClick }) {
  const rows = report?.rows || [];

  if (!rows.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
            <FileX2 className="h-8 w-8 text-slate-300" />
          </div>

          <p className="text-sm font-bold text-slate-700">
            No data available
          </p>

          <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
            There are no records available for this report.
          </p>
        </div>
      </motion.div>
    );
  }

  const columns =
    report?.columns ||
    Object.keys(rows[0] || {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="max-h-[520px] overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
            <tr className="border-b border-slate-200">
              {columns.map((column) => (
                <th
                  key={column}
                  className="whitespace-nowrap px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <motion.tr
                key={row.id || index}
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: Math.min(index * 0.025, 0.4),
                }}
                className="border-b border-slate-100 last:border-0 transition-colors duration-200 hover:bg-blue-50/40"
              >
                {columns.map((column) => {
                  let value = row[column] ?? "-";

                  // ==================================================
                  // EXPENSE OVERVIEW DATE
                  // ==================================================

                  if (
                    report.name === "Expense Overview" &&
                    column === "Date" &&
                    value !== "-"
                  ) {
                    const parsedDate =
                      parseDate(value);

                    value = parsedDate
                      ? formatDate(parsedDate)
                      : "-";
                  }

                  // ==================================================
                  // EXPENSE OVERVIEW AMOUNT
                  // ==================================================

                  if (
                    report.name === "Expense Overview" &&
                    column === "Amount"
                  ) {
                    value = `₹ ${Number(
                      value || 0
                    ).toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}`;
                  }

                  // ==================================================
                  // EMI VEHICLE NUMBER
                  // ==================================================

                  const isEMIVehicleNumber =
                    report.id === "emi" &&
                    column === "Vehicle No." &&
                    value !== "-" &&
                    value !== "";

                  return (
                    <td
                      key={column}
                      className="whitespace-nowrap px-5 py-4 text-slate-700"
                    >
                      {column === "Status" ? (
                        <StatusBadge status={value} />
                      ) : column === "Amount" &&
                        report.name !==
                          "Expense Overview" ? (
                        <span className="font-semibold text-slate-800">
                          {value}
                        </span>
                      ) : isEMIVehicleNumber ? (
                        <button
                          type="button"
                          onClick={() =>
                            onVehicleClick?.(value)
                          }
                          className="font-semibold text-blue-600"
                        >
                          {value}
                        </button>
                      ) : column === "Vehicle No." ||
                        column === "Vehicle" ? (
                        <span className="font-semibold text-blue-600">
                          {value}
                        </span>
                      ) : (
                        value
                      )}
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}


// ============================================================
// MAIN REPORTS PAGE
// ============================================================

export default function Reports() {
  const navigate = useNavigate();

  const {
    documents = [],
    vehicles = [],
    emis = [],
    loans = [],
    challans = [],
    roadTaxes = [],
    settings = {},
  } = useFleet();

  const [selectedReport, setSelectedReport] =
    useState(null);

  const [showActionModal, setShowActionModal] =
    useState(false);

  const [showDownloadModal, setShowDownloadModal] =
    useState(false);


  // ==========================================================
  // REPORT FILTER STATE
  // ==========================================================

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedVehicle, setSelectedVehicle] =
    useState("");

  const [vehicleSearch, setVehicleSearch] =
    useState("");

  const [showVehicleDropdown, setShowVehicleDropdown] =
    useState(false);


  // ==========================================================
  // COMMON HELPERS
  // ==========================================================

  const getAmount = (value) => {
    if (typeof value === "number") {
      return Number.isFinite(value)
        ? value
        : 0;
    }

    if (typeof value === "string") {
      const cleaned =
        value.replace(/[₹,\s]/g, "");

      const number = Number(cleaned);

      return Number.isFinite(number)
        ? number
        : 0;
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
      ""
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


  // ==========================================================
  // DOCUMENT RENEWAL STATUS
  // IMPORTANT:
  // A renewed document must always be treated as Renewed,
  // even when its previous expiry date is already in the past.
  // ==========================================================

  const isDocumentRenewed = (document) => {
    if (!document) return false;

    return (
      normalizeText(document.status) ===
        "renewed" ||
      normalizeText(document.documentStatus) ===
        "renewed" ||
      normalizeText(document.renewalStatus) ===
        "renewed" ||
      document.isRenewed === true
    );
  };


  const normalizeVehicle = (value) => {
    return String(value || "")
      .trim()
      .replace(/\s+/g, "")
      .toUpperCase();
  };


  const isPaid = (status) => {
    return (
      String(status || "")
        .trim()
        .toLowerCase() === "paid"
    );
  };


  // ==========================================================
  // FILTER HELPERS
  // ==========================================================

  const normalizeFilterDate = (value) => {
    if (!value) return null;

    const date = getDateValue(value);

    if (!date) return null;

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  };


  const filterFromDate =
    normalizeFilterDate(fromDate);

  const filterToDate =
    normalizeFilterDate(toDate);


  const isDateWithinFilter = (dateValue) => {
    const date = normalizeFilterDate(dateValue);

    // No date filter.
    if (!filterFromDate && !filterToDate) {
      return true;
    }

    // If a date filter is active but this
    // record has no usable date, don't show it.
    if (!date) {
      return false;
    }

    const currentTime = date.getTime();

    if (
      filterFromDate &&
      currentTime <
        filterFromDate.getTime()
    ) {
      return false;
    }

    if (
      filterToDate &&
      currentTime >
        filterToDate.getTime()
    ) {
      return false;
    }

    return true;
  };


  const isVehicleWithinFilter = (vehicleNumber) => {
    if (!selectedVehicle) {
      return true;
    }

    return (
      normalizeVehicle(vehicleNumber) ===
      normalizeVehicle(selectedVehicle)
    );
  };


  const isRecordWithinFilters = (
    vehicleNumber,
    dateValue
  ) => {
    return (
      isVehicleWithinFilter(vehicleNumber) &&
      isDateWithinFilter(dateValue)
    );
  };


  // ==========================================================
  // VEHICLE DROPDOWN DATA
  // ==========================================================

  const vehicleOptions = useMemo(() => {
    const values = [];

    const addVehicle = (value) => {
      if (!value) return;

      const cleaned = String(value).trim();

      if (!cleaned) return;

      values.push(cleaned);
    };


    vehicles.forEach((vehicle) => {
      addVehicle(
        vehicle.number ||
          vehicle.vehicleNumber ||
          vehicle.vehicleNo ||
          vehicle.registrationNumber
      );
    });


    documents.forEach((document) => {
      addVehicle(
        getVehicleNumber(document)
      );
    });


    emis.forEach((emi) => {
      addVehicle(
        getVehicleNumber(emi)
      );
    });


    challans.forEach((challan) => {
      addVehicle(
        getVehicleNumber(challan)
      );
    });


    roadTaxes.forEach((tax) => {
      addVehicle(
        getVehicleNumber(tax)
      );
    });


    const uniqueVehicles = Array.from(
      new Map(
        values.map((value) => [
          normalizeVehicle(value),
          value,
        ])
      ).values()
    );


    return uniqueVehicles.sort(
      (a, b) =>
        String(a).localeCompare(
          String(b),
          undefined,
          {
            numeric: true,
            sensitivity: "base",
          }
        )
    );
  }, [
    vehicles,
    documents,
    emis,
    challans,
    roadTaxes,
  ]);


  const filteredVehicleOptions =
    useMemo(() => {
      const search =
        normalizeVehicle(vehicleSearch);

      if (!search) {
        return vehicleOptions;
      }

      return vehicleOptions.filter(
        (vehicle) =>
          normalizeVehicle(vehicle).includes(
            search
          )
      );
    }, [
      vehicleOptions,
      vehicleSearch,
    ]);


  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setSelectedVehicle("");
    setVehicleSearch("");
    setShowVehicleDropdown(false);
  };


  const hasActiveFilters =
    Boolean(
      fromDate ||
      toDate ||
      selectedVehicle
    );


  // ==========================================================
  // EXPENSE OVERVIEW
  // ==========================================================

  const expenseRows = useMemo(() => {
    const records = [];


    // ========================================================
    // ROAD TAX FROM ROAD TAX MODULE
    // ========================================================

    roadTaxes.forEach((tax) => {
      const vehicleNumber =
        getVehicleNumber(tax);

      const expenseDate =
        getDateValue(
          tax.paymentDate,
          tax.taxDate,
          tax.entryDate,
          tax.startDate,
          tax.issueDate,
          tax.due,
          tax.dueDate,
          tax.createdAt
        );

      if (!expenseDate) return;

      const amount = getAmount(
        tax.paidAmount ??
          tax.paymentAmount ??
          tax.amount
      );

      if (amount <= 0) return;

      const roadTaxStatusDate =
        tax.dueDate ||
        tax.due ||
        tax.expiry;

      const status =
        roadTaxStatusDate
          ? getExpiryStatus(
              roadTaxStatusDate,
              settings.reminderDays || 10
            )
          : tax.status || "Active";

      records.push({
        id: `road-tax-${tax.id}`,

        vehicle:
          vehicleNumber || "—",

        type: "Road Tax",

        description:
          tax.type
            ? `${tax.type} Road Tax`
            : "Road Tax",

        amount,

        date: expenseDate,

        status,

        source: "roadTax",
      });
    });


    // ========================================================
    // DOCUMENT EXPENSES
    // ========================================================

    documents.forEach((document) => {
      const type = normalizeText(
        document.type ||
          document.documentType ||
          document.name
      );

      let expenseType = "";


      // ------------------------------------------------------
      // FITNESS
      // ------------------------------------------------------

      if (
        type.includes("fitness") ||
        type.includes("fitness certificate")
      ) {
        expenseType = "Fitness";
      }


      // ------------------------------------------------------
      // POLLUTION / PUC
      // ------------------------------------------------------

      else if (
        type.includes("pollution") ||
        type.includes("puc")
      ) {
        expenseType = "Pollution";
      }


      // ------------------------------------------------------
      // INSURANCE
      // ------------------------------------------------------

      else if (
        type.includes("insurance")
      ) {
        expenseType = "Insurance";
      }


      // ------------------------------------------------------
      // STATE PERMIT
      // ------------------------------------------------------

      else if (
        type.includes("state permit") ||
        type.includes("statepermit")
      ) {
        expenseType = "State Permit";
      }


      // ------------------------------------------------------
      // NATIONAL PERMIT
      // ------------------------------------------------------

      else if (
        type.includes("national permit") ||
        type.includes("nationalpermit")
      ) {
        expenseType = "National Permit";
      }


      // ------------------------------------------------------
      // ROAD TAX
      // IMPORTANT:
      // AddDocument.jsx stores Road Tax inside documents[]
      // ------------------------------------------------------

      else if (
        type.includes("road tax") ||
        type.includes("roadtax") ||
        type.includes("m.v. tax") ||
        type.includes("mv tax") ||
        type.includes("motor vehicle tax")
      ) {
        expenseType = "Road Tax";
      }


      if (!expenseType) return;


      const vehicleNumber =
        getVehicleNumber(document);


      const expenseDate =
        getDateValue(
          document.paymentDate,
          document.paidDate,
          document.entryDate,
          document.documentDate,
          document.startDate,
          document.issueDate,
          document.taxDate,
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


      // ======================================================
      // DOCUMENT STATUS
      // IMPORTANT:
      // Renewed has priority over the old expiry date.
      // ======================================================

      const status = isDocumentRenewed(document)
        ? "Renewed"
        : document.expiry
        ? getExpiryStatus(
            document.expiry,
            settings.reminderDays || 10
          )
        : document.status || "Active";


      records.push({
        id: `document-${document.id}`,

        vehicle:
          vehicleNumber || "—",

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
      });
    });


    // ========================================================
    // PAID EMI ONLY
    // ========================================================

    emis.forEach((emi) => {
      if (!isPaid(emi.status)) {
        return;
      }

      const vehicleNumber =
        getVehicleNumber(emi);

      const expenseDate =
        getDateValue(
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

      records.push({
        id: `emi-${emi.id}`,

        vehicle:
          vehicleNumber || "—",

        type: "EMI",

        description:
          emi.loanNumber ||
          emi.bank ||
          emi.loanId
            ? `EMI${
                emi.loanNumber
                  ? ` - ${emi.loanNumber}`
                  : emi.bank
                  ? ` - ${emi.bank}`
                  : ""
              }`
            : "Vehicle EMI",

        amount,

        date: expenseDate,

        status: "Paid",

        source: "emi",
      });
    });


    // ========================================================
    // PAID CHALLAN ONLY
    // ========================================================

    challans.forEach((challan) => {
      if (!isPaid(challan.status)) {
        return;
      }

      const vehicleNumber =
        getVehicleNumber(challan);

      const expenseDate =
        getDateValue(
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
          challan.paymentAmount ??
          challan.amount
      );

      if (amount <= 0) return;

      records.push({
        id: `challan-${challan.id}`,

        vehicle:
          vehicleNumber || "—",

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
      });
    });


    // ========================================================
    // SORT BY DATE - NEWEST FIRST
    // ========================================================

    return records.sort(
      (a, b) =>
        b.date.getTime() -
        a.date.getTime()
    );
  }, [
    roadTaxes,
    documents,
    emis,
    challans,
    settings.reminderDays,
  ]);


  // ==========================================================
  // FILTER EXPENSE ROWS
  // ==========================================================

  const filteredExpenseRows =
    useMemo(() => {
      return expenseRows.filter(
        (expense) =>
          isRecordWithinFilters(
            expense.vehicle,
            expense.date
          )
      );
    }, [
      expenseRows,
      selectedVehicle,
      fromDate,
      toDate,
    ]);


  // ==========================================================
  // OTHER REPORT DATA
  // ==========================================================

  const reports = useMemo(() => {

    // ========================================================
    // EXPIRING DOCUMENTS
    // ========================================================

    const expiringDocuments =
      documents
        // IMPORTANT:
        // Renewed documents are not Expiring Soon.
        .filter(
          (doc) => !isDocumentRenewed(doc)
        )
        .map((doc) => ({
          ...doc,

          expiryStatus:
            getExpiryStatus(
              doc.expiry,
              settings.reminderDays || 10
            ),
        }))
        .filter(
          (doc) =>
            doc.expiryStatus ===
            "Expiring Soon"
        )
        .filter((doc) =>
          isRecordWithinFilters(
            getVehicleNumber(doc),
            doc.expiry
          )
        )
        .map((doc) => ({
          "Vehicle No.":
            doc.vehicle ||
            doc.vehicleNumber ||
            doc.vehicleNo ||
            "-",

          "Document Type":
            doc.type ||
            doc.documentType ||
            doc.name ||
            "-",

          "Expiry Date":
            doc.expiry
              ? formatDate(doc.expiry)
              : "-",

          Status:
            "Expiring Soon",
        }));


    // ========================================================
    // EXPIRED DOCUMENTS
    // ========================================================

    const expiredDocuments =
      documents
        // IMPORTANT:
        // Renewed documents must never be treated
        // as Expired because their old expiry date
        // may already be in the past.
        .filter(
          (doc) => !isDocumentRenewed(doc)
        )
        .map((doc) => ({
          ...doc,

          expiryStatus:
            getExpiryStatus(
              doc.expiry,
              settings.reminderDays || 10
            ),
        }))
        .filter(
          (doc) =>
            doc.expiryStatus ===
            "Expired"
        )
        .filter((doc) =>
          isRecordWithinFilters(
            getVehicleNumber(doc),
            doc.expiry
          )
        )
        .map((doc) => ({
          "Vehicle No.":
            doc.vehicle ||
            doc.vehicleNumber ||
            doc.vehicleNo ||
            "-",

          "Document Type":
            doc.type ||
            doc.documentType ||
            doc.name ||
            "-",

          "Expiry Date":
            doc.expiry
              ? formatDate(doc.expiry)
              : "-",

          Status:
            "Expired",
        }));


    // ========================================================
    // VEHICLE SUMMARY
    // ========================================================

    const vehicleSummary =
      vehicles
        .filter((vehicle) => {
          const vehicleNumber =
            vehicle.number ||
            vehicle.vehicleNumber ||
            vehicle.vehicleNo ||
            vehicle.registrationNumber ||
            "";

          // Vehicle number filter.
          if (
            !isVehicleWithinFilter(
              vehicleNumber
            )
          ) {
            return false;
          }

          // If no date filter is active,
          // vehicle summary should show normally.
          if (
            !fromDate &&
            !toDate
          ) {
            return true;
          }

          // Try common vehicle creation/date fields.
          const vehicleDate =
            getDateValue(
              vehicle.date,
              vehicle.createdAt,
              vehicle.createdDate,
              vehicle.addedDate,
              vehicle.registrationDate,
              vehicle.purchaseDate
            );

          // If a date exists, use it.
          if (vehicleDate) {
            return isDateWithinFilter(
              vehicleDate
            );
          }

          // If the vehicle itself does not
          // contain a date, check whether the
          // vehicle has any associated record
          // inside the selected date range.
          const hasDocument =
            documents.some((doc) =>
              normalizeVehicle(
                getVehicleNumber(doc)
              ) ===
                normalizeVehicle(
                  vehicleNumber
                ) &&
              isDateWithinFilter(
                doc.expiry ||
                  doc.startDate ||
                  doc.createdAt
              )
            );

          const hasEMI =
            emis.some((emi) =>
              normalizeVehicle(
                getVehicleNumber(emi)
              ) ===
                normalizeVehicle(
                  vehicleNumber
                ) &&
              isDateWithinFilter(
                emi.dueDate ||
                  emi.due ||
                  emi.emiDate ||
                  emi.date
              )
            );

          const hasChallan =
            challans.some((challan) =>
              normalizeVehicle(
                getVehicleNumber(challan)
              ) ===
                normalizeVehicle(
                  vehicleNumber
                ) &&
              isDateWithinFilter(
                challan.challanDate ||
                  challan.date ||
                  challan.dueDate ||
                  challan.createdAt
              )
            );

          const hasExpense =
            expenseRows.some((expense) =>
              normalizeVehicle(
                expense.vehicle
              ) ===
                normalizeVehicle(
                  vehicleNumber
                ) &&
              isDateWithinFilter(
                expense.date
              )
            );

          return (
            hasDocument ||
            hasEMI ||
            hasChallan ||
            hasExpense
          );
        })
        .map((vehicle) => ({
          "Vehicle No.":
            vehicle.number ||
            vehicle.vehicleNumber ||
            "-",

          Type:
            vehicle.type ||
            vehicle.vehicleType ||
            "-",

          Owner:
            vehicle.owner ||
            vehicle.ownerName ||
            "-",

          Status:
            vehicle.status ||
            vehicle.rcStatus ||
            "Active",
        }));


    // ========================================================
    // EMI -> LOAN LOOKUP
    // ========================================================
    // EMI records keep loanId, while the Loan Number is stored on
    // the related loan record. Resolve that relationship here so
    // the EMI report displays the real loan number.

    const loanById = new Map(
      loans.map((loan) => [
        String(loan?.id ?? ""),
        loan,
      ])
    );

    const getLoanNumberForEMI = (emi) => {
      const directLoanNumber =
        emi?.loanNumber ||
        emi?.loanNo ||
        emi?.loan_number ||
        emi?.data?.loanNumber ||
        emi?.data?.loanNo ||
        emi?.data?.loan_number;

      if (directLoanNumber) {
        return String(directLoanNumber);
      }

      const loanId =
        emi?.loanId ??
        emi?.loan_id ??
        emi?.data?.loanId ??
        emi?.data?.loan_id;

      if (loanId !== undefined && loanId !== null && loanId !== "") {
        const relatedLoan = loanById.get(String(loanId));

        const relatedLoanNumber =
          relatedLoan?.loanNumber ||
          relatedLoan?.loanNo ||
          relatedLoan?.loan_number ||
          relatedLoan?.data?.loanNumber ||
          relatedLoan?.data?.loanNo ||
          relatedLoan?.data?.loan_number;

        if (relatedLoanNumber) {
          return String(relatedLoanNumber);
        }
      }

      // Compatibility fallback for older EMI records without loanId.
      // Only use a vehicle match when exactly one loan exists for it.
      const emiVehicle = normalizeVehicle(
        getVehicleNumber(emi)
      );

      if (emiVehicle) {
        const matchingLoans = loans.filter((loan) =>
          normalizeVehicle(
            loan?.vehicle ||
              loan?.vehicleNumber ||
              loan?.vehicleNo
          ) === emiVehicle
        );

        if (matchingLoans.length === 1) {
          const onlyLoan = matchingLoans[0];
          const fallbackNumber =
            onlyLoan?.loanNumber ||
            onlyLoan?.loanNo ||
            onlyLoan?.loan_number ||
            onlyLoan?.data?.loanNumber ||
            onlyLoan?.data?.loanNo ||
            onlyLoan?.data?.loan_number;

          if (fallbackNumber) {
            return String(fallbackNumber);
          }
        }
      }

      return "-";
    };


    // ========================================================
    // EMI REPORT
    // ========================================================

    const emiReport =
      emis
        .filter((emi) =>
          isRecordWithinFilters(
            getVehicleNumber(emi),
            emi.dueDate ||
              emi.due ||
              emi.emiDate ||
              emi.date ||
              emi.createdAt
          )
        )
        .map((emi) => ({
          "Vehicle No.":
            emi.vehicleNumber ||
            emi.vehicle ||
            "-",

          "Loan Number":
            getLoanNumberForEMI(emi),

          Bank:
            emi.bank ||
            emi.bankName ||
            emi.financerBank ||
            emi.financierBank ||
            emi.financer ||
            emi.financier ||
            "-",

          "EMI Amount":
            getAmount(
              emi.emiAmount ??
                emi.amount
            ).toLocaleString(
              "en-IN"
            ),

          "Due Date":
            emi.dueDate ||
            emi.due
              ? formatDate(
                  emi.dueDate ||
                    emi.due
                )
              : "-",

          Status:
            emi.status ||
            (emi.paid
              ? "Paid"
              : "Pending"),
        }));


    // ========================================================
    // CHALLAN REPORT
    // ========================================================

    const challanReport =
      challans
        .filter((challan) =>
          isRecordWithinFilters(
            getVehicleNumber(challan),
            challan.challanDate ||
              challan.date ||
              challan.dueDate ||
              challan.due ||
              challan.createdAt
          )
        )
        .map((challan) => ({
          "Vehicle No.":
            challan.vehicleNumber ||
            challan.vehicle ||
            "-",

          "Challan Number":
            challan.challanNumber ||
            challan.number ||
            challan.challanNo ||
            "-",

          "Challan Type":
            challan.type ||
            challan.reason ||
            challan.violation ||
            "-",

          Amount:
            getAmount(
              challan.amount ??
                challan.paidAmount ??
                challan.paymentAmount
            ).toLocaleString(
              "en-IN"
            ),

          Status:
            challan.status ||
            (challan.paid
              ? "Paid"
              : "Pending"),
        }));


    // ========================================================
    // RETURN ALL REPORTS
    // ========================================================

    return [
      {
        id: "expiring",

        name: "Expiring Documents",

        description:
          "View documents that are expiring soon.",

        icon: FileWarning,

        rows:
          expiringDocuments,
      },

      {
        id: "expired",

        name: "Expired Documents",

        description:
          "View all expired vehicle documents.",

        icon: FileX2,

        rows:
          expiredDocuments,
      },

      {
        id: "vehicles",

        name: "Vehicle Summary",

        description:
          "View a complete summary of your vehicles.",

        icon: Truck,

        rows:
          vehicleSummary,
      },

      {
        id: "emi",

        name: "EMI Report",

        description:
          "View vehicle loan and EMI information.",

        icon: CreditCard,

        rows:
          emiReport,
      },

      {
        id: "challans",

        name: "Challan Report",

        description:
          "View vehicle challan details and payment status.",

        icon: ReceiptText,

        rows:
          challanReport,
      },

      {
        id: "expense",

        name: "Expense Overview",

        description:
          "View all vehicle expenses and payments.",

        icon: IndianRupeeIcon,

        columns: [
          "Vehicle",
          "Expense Type",
          "Description",
          "Amount",
          "Date",
          "Status",
        ],

        rows:
          filteredExpenseRows.map(
            (expense) => ({
              id: expense.id,

              Vehicle:
                expense.vehicle ||
                "—",

              "Expense Type":
                expense.type ||
                "—",

              Description:
                expense.description ||
                "—",

              Amount:
                expense.amount,

              Date:
                expense.date,

              Status:
                expense.status ||
                "Paid",
            })
          ),
      },
    ];
  }, [
    documents,
    vehicles,
    emis,
    loans,
    challans,
    settings.reminderDays,
    expenseRows,
    filteredExpenseRows,
    selectedVehicle,
    fromDate,
    toDate,
  ]);


  // ==========================================================
  // OPEN INDIVIDUAL EMI DETAILS
  // ==========================================================

  const handleEMIVehicleClick = (vehicleNumber) => {
    if (
      !vehicleNumber ||
      vehicleNumber === "-"
    ) {
      return;
    }

    const encodedVehicleNumber =
      encodeURIComponent(
        String(vehicleNumber)
      );

    setShowActionModal(false);
    setShowDownloadModal(false);
    setSelectedReport(null);

    navigate(
      `/emi/details/${encodedVehicleNumber}`
    );
  };


  // ==========================================================
  // OPEN REPORT
  // ==========================================================

  const openReport = (report) => {
    setSelectedReport(report);
    setShowActionModal(true);
  };


  // ==========================================================
  // VIEW REPORT
  // ==========================================================

  const handleView = () => {
    setShowActionModal(false);
  };


  // ==========================================================
  // DOWNLOAD
  // ==========================================================

  const handleDownload = () => {
    setShowActionModal(false);
    setShowDownloadModal(true);
  };


  // ==========================================================
  // EXCEL DOWNLOAD
  // ==========================================================

  const handleExcelDownload = () => {
    if (!selectedReport) return;

    const rows =
      selectedReport.rows || [];

    if (!rows.length) return;

    const columns =
      selectedReport.columns ||
      Object.keys(rows[0] || {});

    const data = [
      columns,

      ...rows.map((row) =>
        columns.map((column) => {
          let value =
            row[column] ?? "-";

          if (
            selectedReport.name ===
              "Expense Overview" &&
            column === "Amount"
          ) {
            return Number(
              value || 0
            );
          }

          if (
            selectedReport.name ===
              "Expense Overview" &&
            column === "Date"
          ) {
            return value
              ? formatDate(value)
              : "-";
          }

          return value;
        })
      ),
    ];

    const worksheet =
      XLSX.utils.aoa_to_sheet(
        data
      );

    worksheet["!cols"] =
      columns.map(
        (column, index) => ({
          wch:
            Math.max(
              15,
              ...data
                .slice(0, 100)
                .map((row) =>
                  String(
                    row[index] ?? ""
                  ).length
                )
            ) + 2,
        })
      );

    worksheet["!autofilter"] = {
      ref: worksheet["!ref"],
    };

    const workbook =
      XLSX.utils.book_new();

    const safeSheetName =
      selectedReport.name
        .replace(
          /[\\/?*[\]:]/g,
          ""
        )
        .slice(0, 31) ||
      "Report";

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      safeSheetName
    );

    const safeFileName =
      selectedReport.name
        .replace(
          /[\\/:*?"<>|]/g,
          ""
        )
        .replace(/\s+/g, "_");

    XLSX.writeFile(
      workbook,
      `${safeFileName}.xlsx`,
      {
        bookType: "xlsx",
        compression: true,
      }
    );

    setShowDownloadModal(false);
  };


  // ==========================================================
  // PRINT
  // ==========================================================

  const handlePrint = () => {
    if (!selectedReport) return;

    const rows =
      selectedReport.rows || [];

    if (!rows.length) return;

    const columns =
      selectedReport.columns ||
      Object.keys(rows[0] || {});

    const escapeHtml = (value) =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const tableHeader =
      columns
        .map(
          (column) =>
            `<th>${escapeHtml(
              column
            )}</th>`
        )
        .join("");

    const tableBody =
      rows
        .map(
          (row) =>
            `<tr>
              ${columns
                .map((column) => {
                  let value =
                    row[column] ?? "-";

                  if (
                    selectedReport.name ===
                      "Expense Overview" &&
                    column === "Amount"
                  ) {
                    value =
                      `₹ ${Number(
                        value || 0
                      ).toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 2,
                        }
                      )}`;
                  }

                  if (
                    selectedReport.name ===
                      "Expense Overview" &&
                    column === "Date"
                  ) {
                    value =
                      value
                        ? formatDate(value)
                        : "-";
                  }

                  return `
                    <td>
                      ${escapeHtml(
                        value
                      )}
                    </td>
                  `;
                })
                .join("")}
            </tr>`
        )
        .join("");

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=1200,height=800"
      );

    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>

        <head>

          <title>
            ${escapeHtml(
              selectedReport.name
            )}
          </title>

          <style>

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 30px;
              font-family:
                Arial,
                Helvetica,
                sans-serif;
              color: #0f172a;
              background: #ffffff;
            }

            h1 {
              margin: 0 0 8px;
              font-size: 24px;
            }

            .subtitle {
              margin-bottom: 24px;
              color: #64748b;
              font-size: 13px;
            }

            .print-date {
              margin-bottom: 15px;
              color: #94a3b8;
              font-size: 11px;
            }

            .filter-info {
              margin-bottom: 18px;
              padding: 10px 12px;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              color: #475569;
              background: #f8fafc;
              font-size: 11px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }

            th {
              background: #f8fafc;
              color: #475569;
              text-align: left;
              font-weight: 700;
              padding: 10px;
              border: 1px solid #e2e8f0;
            }

            td {
              padding: 10px;
              border: 1px solid #e2e8f0;
              color: #334155;
            }

            tr:nth-child(even) {
              background: #f8fafc;
            }

            @media print {
              body {
                padding: 10px;
              }

              tr {
                page-break-inside: avoid;
              }
            }

          </style>

        </head>

        <body>

        <center>

          <h1>
            ${escapeHtml(
              selectedReport.name
            )}
          </h1>

          <div class="subtitle">
            ${escapeHtml(
              selectedReport.description ||
                ""
            )}
          </div>

        </center>

          ${
            hasActiveFilters
              ? `
                <div class="filter-info">
                  <strong>Applied Filters:</strong>
                  ${
                    fromDate
                      ? ` From: ${escapeHtml(
                          fromDate
                        )}`
                      : ""
                  }
                  ${
                    toDate
                      ? ` | To: ${escapeHtml(
                          toDate
                        )}`
                      : ""
                  }
                  ${
                    selectedVehicle
                      ? ` | Vehicle: ${escapeHtml(
                          selectedVehicle
                        )}`
                      : ""
                  }
                </div>
              `
              : ""
          }

          <div class="print-date">
            Generated Date -
            ${escapeHtml(
              new Date().toLocaleDateString(
                "en-IN"
              )
            )}
            Generated by FleetDoc.
          </div>

          <table>

            <thead>
              <tr>
                ${tableHeader}
              </tr>
            </thead>

            <tbody>
              ${tableBody}
            </tbody>

          </table>

        </body>

      </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="space-y-7 pb-8">

      {/* ====================================================
          PAGE HEADER
      ==================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: -15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
        }}
      >
        <PageHeader
          title={
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 transition duration-300 hover:scale-110 hover:rotate-3">
                <BarChart3
                  size={23}
                  strokeWidth={2.3}
                />
              </div>

              <div>
                <span className="block text-2xl font-bold text-slate-800">
                  Reports
                </span>
              </div>
            </div>
          }

          subtitle="View, analyze and download all reports."
        />
      </motion.div>


      {/* ====================================================
          REPORT OVERVIEW BANNER
      ==================================================== */}

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
          delay: 0.1,
        }}
        className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 shadow-xl shadow-blue-100"
      >

        <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-white/10" />

        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div className="max-w-2xl">

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              <FileSpreadsheet size={14} />

              Fleet Analytics
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Everything you need in one place
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
              Monitor vehicle documents, loans,
              challans, expenses and fleet
              information from your reports.
            </p>

          </div>


          <motion.div
            whileHover={{
              scale: 1.05,
              rotate: 2,
            }}
            className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur md:flex"
          >
            <BarChart3
              size={36}
              strokeWidth={1.7}
            />
          </motion.div>

        </div>

      </motion.div>


      {/* ====================================================
          REPORT FILTER
      ==================================================== */}

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
                onClick={clearFilters}
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
                <Calendar
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
                <Calendar
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
                      : selectedVehicle
                  }
                  placeholder="Search Vehicle No."
                  onFocus={() => {
                    setShowVehicleDropdown(true);
                    setVehicleSearch(selectedVehicle);
                  }}
                  onChange={(event) => {
                    setVehicleSearch(
                      event.target.value
                    );
                    setSelectedVehicle("");
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

                    // When opening, keep the selected vehicle/search value
                    if (!showVehicleDropdown) {
                      setVehicleSearch(
                        selectedVehicle
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
                              setSelectedVehicle(
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
                                selectedVehicle
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

              {selectedVehicle && (
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-600">
                  Vehicle: {selectedVehicle}
                </span>
              )}

            </div>
          )}

        </div>

      </motion.div>


      {/* ====================================================
          REPORT CARDS
      ==================================================== */}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
      >

        {reports.map((report) => {
          const Icon = report.icon;

          const style =
            getReportStyle(report.id);

          const recordCount =
            report.rows?.length || 0;

          return (
            <motion.div
              key={report.id}
              variants={itemVariants}
              whileHover={{
                y: -7,
                scale: 1.012,
              }}
              transition={{
                duration: 0.2,
              }}
              className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 ${style.border} hover:shadow-2xl ${style.shadow}`}
            >

              {/* TOP ACCENT */}

              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${style.accent}`}
              />


              {/* DECORATIVE CIRCLE */}

              <motion.div
                initial={{
                  scale: 1,
                }}
                whileHover={{
                  scale: 1.35,
                }}
                transition={{
                  duration: 0.5,
                }}
                className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full ${style.soft} opacity-70`}
              />


              <div className="relative z-10">

                {/* ICON + COUNT */}

                <div className="flex items-start justify-between">

                  <motion.div
                    whileHover={{
                      scale: 1.12,
                      rotate: 4,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 15,
                    }}
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${style.iconBg} ${style.iconColor} shadow-sm`}
                  >
                    <Icon
                      size={25}
                      strokeWidth={2.2}
                    />
                  </motion.div>


                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-right transition-colors duration-300 group-hover:bg-slate-100">

                    <p className="text-lg font-bold text-slate-800">
                      {recordCount}
                    </p>

                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Records
                    </p>

                  </div>

                </div>


                {/* LABEL */}

                <div className="mt-5">

                  <span
                    className={`inline-flex rounded-full ${style.soft} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${style.text}`}
                  >
                    {style.label}
                  </span>

                </div>


                {/* TITLE */}

                <h3 className="mt-3 text-lg font-bold text-slate-800 transition-colors duration-200 group-hover:text-blue-600">
                  {report.name}
                </h3>


                {/* DESCRIPTION */}

                <p className="mt-2 min-h-[42px] text-sm leading-6 text-slate-500">
                  {report.description}
                </p>


                {/* ACTION */}

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">

                  <span className="text-xs font-medium text-slate-400">
                    Open detailed report
                  </span>

                  <motion.button
                    type="button"
                    onClick={() =>
                      openReport(report)
                    }
                    whileHover={{
                      scale: 1.04,
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${style.accent} px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg`}
                  >
                    <Eye
                      size={16}
                      strokeWidth={2.2}
                    />

                    View Report

                    <ArrowUpRight
                      size={15}
                      className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </motion.button>

                </div>

              </div>

            </motion.div>
          );
        })}

      </motion.div>


      {/* ====================================================
          ACTION MODAL
      ==================================================== */}

      <AnimatePresence>
        {showActionModal &&
          selectedReport && (
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
            >

              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="w-full max-w-md overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl"
              >

                {/* HEADER */}

                <div className="relative overflow-hidden border-b border-slate-100 px-6 py-5">

                  <div className="pointer-events-none absolute -right-10 -top-16 h-32 w-32 rounded-full bg-blue-50" />

                  <div className="relative flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <Eye size={20} />
                      </div>

                      <div>

                        <h3 className="font-bold text-slate-800">
                          {selectedReport.name}
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Choose an action
                        </p>

                      </div>

                    </div>


                    {/* CLOSE */}

                    <motion.button
                      type="button"
                      whileHover={{
                        scale: 1.08,
                        rotate: 4,
                      }}
                      whileTap={{
                        scale: 0.95,
                      }}
                      onClick={() => {
                        setShowActionModal(false);
                        setSelectedReport(null);
                      }}
                      className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X size={19} />
                    </motion.button>

                  </div>

                </div>


                {/* ACTIONS */}

                <div className="grid gap-3 p-6">

                  {/* VIEW */}

                  <motion.button
                    type="button"
                    whileHover={{
                      x: 4,
                    }}
                    whileTap={{
                      scale: 0.985,
                    }}
                    onClick={handleView}
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/60 hover:shadow-sm"
                  >

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-transform duration-200 group-hover:scale-105">
                      <Eye size={21} />
                    </div>

                    <div className="flex-1">

                      <p className="font-semibold text-slate-800">
                        View Report
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Open the report details
                      </p>

                    </div>

                    <ArrowUpRight
                      size={18}
                      className="text-slate-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-500"
                    />

                  </motion.button>


                  {/* DOWNLOAD */}

                  <motion.button
                    type="button"
                    whileHover={{
                      x: 4,
                    }}
                    whileTap={{
                      scale: 0.985,
                    }}
                    onClick={handleDownload}
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/60 hover:shadow-sm"
                  >

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-transform duration-200 group-hover:scale-105">
                      <Download size={21} />
                    </div>

                    <div className="flex-1">

                      <p className="font-semibold text-slate-800">
                        Download Report
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Export or print this report
                      </p>

                    </div>

                    <ArrowUpRight
                      size={18}
                      className="text-slate-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-500"
                    />

                  </motion.button>

                </div>

              </motion.div>

            </motion.div>
          )}
      </AnimatePresence>


      {/* ====================================================
          VIEW REPORT MODAL
      ==================================================== */}

      <AnimatePresence>
        {!showActionModal &&
          selectedReport && (
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
            >

              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="flex max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl"
              >

                {/* HEADER */}

                <div className="relative flex shrink-0 items-center justify-between overflow-hidden border-b border-slate-100 px-6 py-5">

                  <div className="pointer-events-none absolute -right-12 -top-20 h-40 w-40 rounded-full bg-blue-50" />

                  <div className="relative flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200">
                      {selectedReport.icon && (
                        <selectedReport.icon
                          size={22}
                        />
                      )}
                    </div>

                    <div>

                      <div className="flex items-center gap-2">

                        <h2 className="text-xl font-bold text-slate-800">
                          {selectedReport.name}
                        </h2>

                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
                          {selectedReport.rows?.length || 0} Records
                        </span>

                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {selectedReport.description}
                      </p>

                    </div>

                  </div>


                  <motion.button
                    type="button"
                    whileHover={{
                      scale: 1.08,
                      rotate: 4,
                    }}
                    whileTap={{
                      scale: 0.95,
                    }}
                    onClick={() =>
                      setSelectedReport(null)
                    }
                    className="relative rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={20} />
                  </motion.button>

                </div>


                {/* TABLE */}

                <div className="min-h-0 flex-1 overflow-auto bg-slate-50/50 p-6">

                  <ReportTable
                    report={selectedReport}
                    onVehicleClick={
                      selectedReport.id === "emi"
                        ? handleEMIVehicleClick
                        : undefined
                    }
                  />

                </div>


                {/* FOOTER */}

                <div className="flex shrink-0 flex-col gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <FileText size={15} />
                    </div>

                    <p className="text-sm font-medium text-slate-500">
                      {selectedReport.rows?.length || 0} records found
                    </p>

                  </div>


                  <motion.button
                    type="button"
                    whileHover={{
                      scale: 1.03,
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    onClick={() =>
                      setShowDownloadModal(true)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:shadow-lg"
                  >
                    <Download size={16} />

                    Download Report
                  </motion.button>

                </div>

              </motion.div>

            </motion.div>
          )}
      </AnimatePresence>


      {/* ====================================================
          DOWNLOAD MODAL
      ==================================================== */}

      <AnimatePresence>
        {showDownloadModal &&
          selectedReport && (
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
              className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
            >

              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl"
              >

                {/* HEADER */}

                <div className="relative overflow-hidden border-b border-slate-100 px-6 py-5">

                  <div className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full bg-emerald-50" />

                  <div className="relative flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <Download size={20} />
                      </div>

                      <div>

                        <h3 className="text-lg font-bold text-slate-800">
                          Download Report
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {selectedReport.name}
                        </p>

                      </div>

                    </div>


                    <motion.button
                      type="button"
                      whileHover={{
                        scale: 1.08,
                        rotate: 4,
                      }}
                      whileTap={{
                        scale: 0.95,
                      }}
                      onClick={() =>
                        setShowDownloadModal(false)
                      }
                      className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X size={18} />
                    </motion.button>

                  </div>

                </div>


                {/* DOWNLOAD OPTIONS */}

                <div className="grid gap-3 p-6">

                  <motion.button
                    type="button"
                    whileHover={{
                      x: 4,
                    }}
                    whileTap={{
                      scale: 0.985,
                    }}
                    onClick={
                      handleExcelDownload
                    }
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/60 hover:shadow-sm"
                  >

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-transform duration-200 group-hover:scale-105">
                      <FileSpreadsheet
                        size={22}
                      />
                    </div>

                    <div className="flex-1">

                      <p className="font-semibold text-slate-800">
                        Download in Excel
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Download the report as an Excel file
                      </p>

                    </div>

                    <ArrowUpRight
                      size={18}
                      className="text-slate-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-500"
                    />

                  </motion.button>


                  <motion.button
                    type="button"
                    whileHover={{
                      x: 4,
                    }}
                    whileTap={{
                      scale: 0.985,
                    }}
                    onClick={handlePrint}
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/60 hover:shadow-sm"
                  >

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-transform duration-200 group-hover:scale-105">
                      <Printer size={22} />
                    </div>

                    <div className="flex-1">

                      <p className="font-semibold text-slate-800">
                        Print Report
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Print the report directly
                      </p>

                    </div>

                    <ArrowUpRight
                      size={18}
                      className="text-slate-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-500"
                    />

                  </motion.button>

                </div>


                {/* FOOTER NOTE */}

                <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">

                  <p className="text-center text-xs text-slate-400">
                    Choose how you want to export your report.
                  </p>

                </div>

              </motion.div>

            </motion.div>
          )}
      </AnimatePresence>

    </div>
  );
}