import { useMemo, useState, useEffect, useRef } from "react";
import {
  Plus,
  CheckCircle2,
  Trash2,
  MoreVertical,
  Eye,
  Pencil,
  X,
  IndianRupee,
  AlertTriangle,
  FileText,
  CalendarDays,
  CreditCard,
  Search,
  Filter,
  CircleDollarSign,
  Clock3,
  BadgeCheck,
  Save,
  ChevronDown,
  ReceiptText,
  Car,
  Hash,
  ExternalLink,
} from "lucide-react";

import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useFleet } from "../context/fleetContext";

// =========================================================
// HELPERS
// =========================================================

const formatDate = (date) => {
  if (!date) return "—";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// =========================================================
// DOCUMENT OPEN HELPER
// Handles Data URLs and normal URLs safely.
// =========================================================

const openDocumentFile = async (challan) => {
  const fileSource = challan?.fileData || challan?.fileUrl;

  if (!fileSource) {
    console.warn("No document file found for this challan.");
    return;
  }

  try {
    if (!String(fileSource).startsWith("data:")) {
      const newWindow = window.open(
        fileSource,
        "_blank",
        "noopener,noreferrer"
      );

      if (!newWindow) {
        console.warn(
          "Popup blocked. Please allow popups for this site."
        );
      }

      return;
    }

    const response = await fetch(fileSource);
    const blob = await response.blob();

    const blobUrl = URL.createObjectURL(blob);

    const newWindow = window.open(
      "",
      "_blank",
      "noopener,noreferrer"
    );

    if (!newWindow) {
      URL.revokeObjectURL(blobUrl);

      console.warn(
        "Popup blocked. Please allow popups for this site."
      );

      return;
    }

    newWindow.location.href = blobUrl;

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 60000);
  } catch (error) {
    console.error(
      "Unable to open challan document:",
      error
    );

    try {
      const fallbackWindow = window.open(
        fileSource,
        "_blank",
        "noopener,noreferrer"
      );

      if (!fallbackWindow) {
        console.warn(
          "Popup blocked. Please allow popups for this site."
        );
      }
    } catch (fallbackError) {
      console.error(
        "Document fallback failed:",
        fallbackError
      );
    }
  }
};

// =========================================================
// DOCUMENT TYPE HELPER
// =========================================================

const isImageDocument = (challan) => {
  const type = String(
    challan?.fileType || ""
  ).toLowerCase();

  const name = String(
    challan?.fileName || ""
  ).toLowerCase();

  return (
    type.startsWith("image/") ||
    /\.(jpg|jpeg|png)$/i.test(name)
  );
};

const isPdfDocument = (challan) => {
  const type = String(
    challan?.fileType || ""
  ).toLowerCase();

  const name = String(
    challan?.fileName || ""
  ).toLowerCase();

  return (
    type === "application/pdf" ||
    name.endsWith(".pdf")
  );
};

// =========================================================
// DOCUMENTS STYLE ANIMATIONS
// =========================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
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
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  title,
  value,
  note,
  icon: Icon,
  color = "text-blue-600",
  bg = "bg-blue-50",
}) {
  const iconBg = color.replace("text-", "bg-");

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        y: -5,
        scale: 1.015,
      }}
      transition={{
        duration: 0.2,
      }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg"
    >
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${bg} opacity-50 transition-all duration-500 group-hover:scale-150`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold text-slate-800">
            {value}
          </h3>

          {note && (
            <p className={`mt-1 text-xs font-medium ${color}`}>
              {note}
            </p>
          )}
        </div>

        <motion.div
          whileHover={{
            rotate: 8,
            scale: 1.08,
          }}
          transition={{ duration: 0.2 }}
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg} ${color}`}
        >
          <Icon size={22} strokeWidth={2} />
        </motion.div>
      </div>

      <div
        className={`absolute bottom-0 left-0 h-1 w-0 ${iconBg} transition-all duration-500 group-hover:w-full`}
      />
    </motion.div>
  );
}

// =========================================================
// DETAIL BOX
// =========================================================

function DetailBox({ label, value, icon: Icon }) {
  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      transition={{
        duration: 0.2,
      }}
      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-slate-700">
            {value || "—"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function Challans() {
  const {
    challans,
    updateChallan,
    deleteChallan,
    settings,
    users = [],
  } = useFleet();

  // =======================================================
  // USERS & ROLES / PERMISSIONS
  // =======================================================

  const loggedInUserId =
    localStorage.getItem("fleetdoc_user_id");

  const loggedInUserEmail =
    localStorage.getItem("fleetdoc_user_email");

  const storedRole =
    localStorage.getItem("fleetdoc_user_role");

  /*
    Find the currently logged-in user.

    First try user ID, then email.
    This follows the same permission pattern
    used in the other FleetDoc pages.
  */
  const currentUser =
    users.find(
      (user) =>
        String(user.id) ===
        String(loggedInUserId)
    ) ||
    users.find(
      (user) =>
        user.email?.toLowerCase().trim() ===
        loggedInUserEmail?.toLowerCase().trim()
    ) ||
    null;

  /*
    Some existing users may have the old typo:
    "Finincer"

    Normalize it to:
    "Finance"
  */
  const currentUserRole =
    currentUser?.role ||
    storedRole ||
    "Admin";

  const permissionRole =
    currentUserRole === "Finincer"
      ? "Finance"
      : currentUserRole;

  /*
    Read role permissions from Settings.

    If rolePermissions does not exist yet,
    Admin gets full access as the fallback.
  */
  const rolePermissions =
    settings?.rolePermissions || {};

  const currentPermissions =
    rolePermissions?.[permissionRole] ||
    rolePermissions?.Admin ||
    {
      view: true,
      add: true,
      edit: true,
      delete: true,
      paid: true,
      settings: true,
      users: true,
    };

  // =======================================================
  // PERMISSION FLAGS
  // =======================================================

  const canViewChallans =
    currentPermissions.view === true;

  const canAddChallans =
    currentPermissions.add === true;

  const canEditChallans =
    currentPermissions.edit === true;

  const canDeleteChallans =
    currentPermissions.delete === true;

  const canMarkChallanPaid =
    currentPermissions.paid === true;

  // =======================================================
  // FILTER STATES
  // =======================================================

  const [q, setQ] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  // =======================================================
  // MENU / MODALS
  // =======================================================

  const [openMenu, setOpenMenu] = useState(null);

  const [viewChallan, setViewChallan] = useState(null);
  const [editChallan, setEditChallan] = useState(null);
  const [paidChallan, setPaidChallan] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // =======================================================
  // PAID FORM
  // =======================================================

  const [paidAmount, setPaidAmount] = useState("");

  // =======================================================
  // EDIT FORM
  // =======================================================

  const [editForm, setEditForm] = useState({
    vehicle: "",
    number: "",
    type: "",
    amount: "",
    due: "",
    status: "Pending",
    paidAmount: "",
  });

  // =======================================================
  // SUCCESS MESSAGE
  // =======================================================

  const [successMessage, setSuccessMessage] = useState("");

  // =======================================================
  // ACTION MENU OUTSIDE CLICK
  // =======================================================

  const actionMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target)
      ) {
        setOpenMenu(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =======================================================
  // SUCCESS MESSAGE AUTO CLOSE
  // =======================================================

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  // =======================================================
  // FILTERED LIST
  // =======================================================

  const list = useMemo(() => {
    const search = q.trim().toLowerCase();

    return (challans || []).filter((c) => {
      const matchesSearch =
        !search ||
        String(c.vehicle || "")
          .toLowerCase()
          .includes(search) ||
        String(c.number || "")
          .toLowerCase()
          .includes(search) ||
        String(c.type || "")
          .toLowerCase()
          .includes(search);

      const matchesFromDate =
        !fromDate ||
        String(c.due || "") >= fromDate;

      const matchesToDate =
        !toDate ||
        String(c.due || "") <= toDate;

      const matchesStatus =
        statusFilter === "All" ||
        String(c.status || "").toLowerCase() ===
          statusFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesFromDate &&
        matchesToDate &&
        matchesStatus
      );
    });
  }, [
    challans,
    q,
    fromDate,
    toDate,
    statusFilter,
  ]);

  // =======================================================
  // STATISTICS
  // =======================================================

  const stats = useMemo(() => {
    const all = challans || [];

    const paid = all.filter(
      (c) =>
        String(c.status || "").toLowerCase() ===
        "paid"
    );

    const pending = all.filter((c) => {
      const status = String(
        c.status || ""
      ).toLowerCase();

      return (
        status === "pending" ||
        status === "unpaid"
      );
    });

    const totalPaidAmount = paid.reduce(
      (sum, c) =>
        sum + Number(c.paidAmount || 0),
      0
    );

    return {
      total: all.length,
      paid: paid.length,
      pending: pending.length,
      totalPaidAmount,
    };
  }, [challans]);

  // =======================================================
  // OPEN PAID MODAL
  // =======================================================

  const handleOpenPaid = (challan) => {
    if (!canMarkChallanPaid) return;

    setPaidChallan(challan);

    setPaidAmount(
      challan?.paidAmount
        ? String(challan.paidAmount)
        : String(challan?.amount || "")
    );

    setOpenMenu(null);
  };

  // =======================================================
  // MARK CHALLAN AS PAID
  // =======================================================

  const handleConfirmPaid = () => {
    if (!canMarkChallanPaid) return;

    if (!paidChallan) return;

    updateChallan(paidChallan.id, {
      ...paidChallan,
      status: "Paid",
      paid: true,
      paidAmount: Number(
        paidAmount || 0
      ),
      paidDate: new Date().toISOString(),
    });

    setPaidChallan(null);
    setPaidAmount("");

    setSuccessMessage(
      "Challan marked as paid successfully."
    );
  };

  // =======================================================
  // VIEW
  // =======================================================

  const handleView = (challan) => {
    if (!canViewChallans) return;

    setViewChallan(challan);
    setOpenMenu(null);
  };

  // =======================================================
  // EDIT
  // =======================================================

  const handleEdit = (challan) => {
    if (!canEditChallans) return;

    setEditChallan(challan);

    setEditForm({
      vehicle: challan.vehicle || "",
      number: challan.number || "",
      type: challan.type || "",
      amount: challan.amount || "",
      due: challan.due || "",
      status: challan.status || "Pending",
      paidAmount: challan.paidAmount || "",
    });

    setOpenMenu(null);
  };

  const handleEditChange = (
    field,
    value
  ) => {
    if (!canEditChallans) return;

    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEdit = () => {
    if (!canEditChallans) return;

    if (!editChallan) return;

    updateChallan(editChallan.id, {
      ...editChallan,
      vehicle: editForm.vehicle,
      number: editForm.number,
      type: editForm.type,
      amount: Number(
        editForm.amount || 0
      ),
      due: editForm.due,
      status: editForm.status,
      paid:
        editForm.status === "Paid",
      paidAmount:
        editForm.status === "Paid"
          ? Number(
              editForm.paidAmount || 0
            )
          : Number(
              editChallan.paidAmount || 0
            ),
    });

    setEditChallan(null);

    setSuccessMessage(
      "Challan updated successfully."
    );
  };

  // =======================================================
  // DELETE
  // =======================================================

  const handleDelete = () => {
    if (!canDeleteChallans) return;

    if (!deleteTarget) return;

    deleteChallan(deleteTarget.id);

    setDeleteTarget(null);

    setSuccessMessage(
      "Challan deleted successfully."
    );
  };

  // =======================================================
  // CLEAR FILTERS
  // =======================================================

  const clearFilters = () => {
    setQ("");
    setFromDate("");
    setToDate("");
    setStatusFilter("All");
  };

  // =======================================================
  // STATUS
  // =======================================================

  const getStatus = (challan) => {
    if (!challan) return "Pending";

    if (
      String(challan.status || "").toLowerCase() ===
      "paid"
    ) {
      return "Paid";
    }

    return challan.status || "Pending";
  };

  // =======================================================
  // VIEW PERMISSION GUARD
  // =======================================================

  if (!canViewChallans) {
    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="flex min-h-[60vh] items-center justify-center p-6"
      >
        <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertTriangle size={30} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            Access Restricted
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            You do not have permission to view
            challan records.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 transition duration-300 hover:scale-110 hover:rotate-3">
              <ReceiptText
                size={23}
                strokeWidth={2.3}
              />
            </div>

            <div>
              <span className="block text-2xl font-bold text-slate-800">
                Challans
              </span>
            </div>
          </div>
        }
        subtitle="Manage vehicle fines, challans and payment records"
        action={
          canAddChallans ? (
            <Link
              to="/challans/add"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Plus size={18} />
              Add Challan
            </Link>
          ) : null
        }
      />

      {/* ===================================================
          HERO SECTION
      =================================================== */}

      <motion.section
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-6 text-white shadow-lg"
      >
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="absolute right-1/4 top-1/2 h-24 w-24 rounded-full bg-white/5 blur-xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <motion.div
              animate={{
                y: [0, -5, 0],
                rotate: [0, 2, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
            >
              <ReceiptText size={34} />
            </motion.div>

            <div>
              <h2 className="text-2xl font-bold">
                Manage Your Challans
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-blue-100">
                Track vehicle fines, challan details,
                payment status and due dates from one
                centralized dashboard.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-center backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-100">
              Total Challans
            </p>

            <p className="mt-1 text-3xl font-bold">
              {stats.total}
            </p>

            <p className="mt-1 text-xs text-blue-100">
              Records available
            </p>
          </div>
        </div>
      </motion.section>

      {/* ===================================================
          STAT CARDS
      =================================================== */}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          title="Total Challans"
          value={stats.total}
          note="All challan records"
          icon={ReceiptText}
          bg="bg-blue-50"
          color="text-blue-600"
        />

        <StatCard
          title="Paid Challans"
          value={stats.paid}
          note="Successfully paid"
          icon={BadgeCheck}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />

        <StatCard
          title="Pending Challans"
          value={stats.pending}
          note="Payment pending"
          icon={Clock3}
          color="text-amber-600"
          bg="bg-amber-50"
        />

        <StatCard
          title="Total Paid Amount"
          value={`₹${stats.totalPaidAmount.toLocaleString(
            "en-IN"
          )}`}
          note="Total amount paid"
          icon={CircleDollarSign}
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
      </motion.div>

      {/* ===================================================
          TABLE CARD
      =================================================== */}

      <motion.section
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        {/* TABLE HEADER */}

        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div
                className="
                  rounded-lg
                  bg-blue-50
                  p-2
                  text-blue-600
                "
              >
                <ReceiptText size={20} />
              </div>

              <h2 className="text-lg font-bold text-slate-800">
                Challan Records
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              View and manage all vehicle challan records
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* SEARCH */}

            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={q}
                onChange={(e) =>
                  setQ(e.target.value)
                }
                placeholder="Search challans..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm outline-none transition-all duration-300 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:w-64"
              />

              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* FILTER BUTTON */}

            <button
              onClick={() =>
                setShowFilters(
                  (prev) => !prev
                )
              }
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                showFilters
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              <Filter size={17} />

              Filters

              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${
                  showFilters
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* =================================================
            FILTER SECTION
        ================================================= */}

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.25,
              }}
              className="overflow-hidden border-b border-slate-200 bg-slate-50"
            >
              <div className="grid gap-4 p-5 md:grid-cols-3 lg:grid-cols-4">
                {/* FROM DATE */}

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    From Date
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) =>
                        setFromDate(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* TO DATE */}

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    To Date
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) =>
                        setToDate(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* STATUS */}

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="All">
                      All Status
                    </option>

                    <option value="Paid">
                      Paid
                    </option>

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Unpaid">
                      Unpaid
                    </option>
                  </select>
                </div>

                {/* CLEAR */}

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Vehicle
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Challan No.
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Challan Type
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Fine Amount
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Paid Amount
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Due Date
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {list.length > 0 ? (
                list.map((c, index) => (
                  <motion.tr
                    key={c.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{
                      delay: index * 0.03,
                    }}
                    className="
                        group
                        border-b
                        border-slate-100
                        transition
                        duration-300
                        hover:bg-blue-50/40
                      "
                  >
                    {/* VEHICLE */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
                          <ReceiptText size={19} />
                        </div>

                        <span className="font-semibold text-blue-700">
                          {c.vehicle || "—"}
                        </span>
                      </div>
                    </td>

                    {/* CHALLAN NUMBER */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Hash
                          size={15}
                          className="text-slate-400"
                        />

                        <span className="font-medium text-slate-700">
                          {c.number || "—"}
                        </span>
                      </div>
                    </td>

                    {/* TYPE */}

                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-slate-700">
                        {c.type || "—"}
                      </span>
                    </td>

                    {/* FINE AMOUNT */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 font-semibold text-slate-700">
                        <IndianRupee size={15} />

                        {Number(
                          c.amount || 0
                        ).toLocaleString("en-IN")}
                      </div>
                    </td>

                    {/* PAID AMOUNT */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 font-semibold text-emerald-600">
                        <IndianRupee size={15} />

                        {Number(
                          c.paidAmount || 0
                        ).toLocaleString("en-IN")}
                      </div>
                    </td>

                    {/* DUE DATE */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays
                          size={15}
                          className="text-slate-400"
                        />

                        {formatDate(c.due)}
                      </div>
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      <StatusBadge
                        status={getStatus(c)}
                      />
                    </td>

                    {/* ACTION */}

                    <td className="px-5 py-4 text-right">
                      <div
                        className="relative inline-block"
                        data-document-action-menu
                        ref={
                          openMenu === c.id
                            ? actionMenuRef
                            : null
                        }
                      >
                        <button
                          onClick={() =>
                            setOpenMenu(
                              openMenu === c.id
                                ? null
                                : c.id
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <MoreVertical size={18} />
                        </button>

                        <AnimatePresence>
                          {openMenu === c.id && (
                            <motion.div
                              initial={{
                                opacity: 0,
                                scale: 0.95,
                                y: -5,
                              }}
                              animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                              }}
                              exit={{
                                opacity: 0,
                                scale: 0.95,
                                y: -5,
                              }}
                              transition={{
                                duration: 0.15,
                              }}
                              className="absolute right-0 z-30 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
                            >
                              {/* VIEW */}

                              {canViewChallans && (
                                <button
                                  onClick={() =>
                                    handleView(c)
                                  }
                                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                                >
                                  <Eye size={16} />
                                  View
                                </button>
                              )}

                              {/* EDIT */}

                              {canEditChallans && (
                                <button
                                  onClick={() =>
                                    handleEdit(c)
                                  }
                                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                                >
                                  <Pencil size={16} />
                                  Edit
                                </button>
                              )}

                              {/* MARK PAID */}

                              {canMarkChallanPaid &&
                                getStatus(c) !==
                                  "Paid" && (
                                  <button
                                    onClick={() =>
                                      handleOpenPaid(c)
                                    }
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                                  >
                                    <CheckCircle2
                                      size={16}
                                    />

                                    Mark Paid
                                  </button>
                                )}

                              {/* DELETE */}

                              {canDeleteChallans && (
                                <button
                                  onClick={() => {
                                    if (
                                      !canDeleteChallans
                                    )
                                      return;

                                    setDeleteTarget(c);
                                    setOpenMenu(null);
                                  }}
                                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-16 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                        <ReceiptText size={30} />
                      </div>

                      <h3 className="mt-4 text-base font-semibold text-slate-700">
                        No challans found
                      </h3>

                      <p className="mt-1 max-w-sm text-sm text-slate-400">
                        No challan records match your
                        current search or filters.
                      </p>

                      {canAddChallans && (
                        <Link
                          to="/challans/add"
                          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          <Plus size={17} />
                          Add First Challan
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER */}

        {list.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-600">
                {list.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-600">
                {stats.total}
              </span>{" "}
              challan records
            </p>

            <button
              onClick={() => setQ("")}
              className="flex items-center gap-1 font-medium text-blue-600 transition hover:text-blue-800"
            >
              View More
              <ChevronDown size={16} />
            </button>
          </div>
        )}
      </motion.section>

      {/* ===================================================
          SUCCESS MESSAGE
      =================================================== */}

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
              x: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
              x: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
              x: 20,
            }}
            className="fixed right-5 top-5 z-[100] flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-xl"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={19} />
            </div>

            <p className="text-sm font-semibold text-slate-700">
              {successMessage}
            </p>

            <button
              onClick={() =>
                setSuccessMessage("")
              }
              className="ml-2 text-slate-400 transition hover:text-slate-700"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================
          PAID MODAL
      =================================================== */}

      <AnimatePresence>
        {paidChallan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={() =>
              setPaidChallan(null)
            }
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              transition={{ duration: 0.25 }}
              onClick={(e) =>
                e.stopPropagation()
              }
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                      <CheckCircle2 size={21} />
                    </div>

                    <div>
                      <h3 className="font-bold">
                        Mark Challan Paid
                      </h3>

                      <p className="text-xs text-emerald-100">
                        Confirm payment details
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setPaidChallan(null)
                    }
                    className="rounded-lg p-1.5 transition hover:bg-white/10"
                  >
                    <X size={19} />
                  </button>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <ReceiptText size={20} />
                    </div>

                    <div>
                      <p className="font-semibold text-blue-700">
                        {paidChallan.vehicle}
                      </p>

                      <p className="text-xs text-slate-500">
                        {paidChallan.number}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">
                    Paid Amount
                  </label>

                  <div className="relative">
                    <IndianRupee
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="number"
                      value={paidAmount}
                      onChange={(e) =>
                        setPaidAmount(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Enter paid amount"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() =>
                      setPaidChallan(null)
                    }
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleConfirmPaid}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <CheckCircle2 size={17} />
                    Paid
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================
          VIEW MODAL
      =================================================== */}

      <AnimatePresence>
        {viewChallan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={() =>
              setViewChallan(null)
            }
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              transition={{ duration: 0.25 }}
              onClick={(e) =>
                e.stopPropagation()
              }
              className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              {/* MODAL HEADER */}

              <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                      <ReceiptText size={24} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold">
                        Challan Details
                      </h3>

                      <p className="text-sm text-blue-100">
                        {viewChallan.number ||
                          "Challan"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setViewChallan(null)
                    }
                    className="rounded-lg p-2 transition hover:bg-white/10"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* MODAL CONTENT */}

              <div className="max-h-[70vh] overflow-y-auto p-6">
                <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <ReceiptText size={20} />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Status
                      </p>

                      <div className="mt-1">
                        <StatusBadge
                          status={getStatus(
                            viewChallan
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailBox
                    label="Vehicle"
                    value={
                      viewChallan.vehicle
                    }
                    icon={ReceiptText}
                  />

                  <DetailBox
                    label="Challan Number"
                    value={
                      viewChallan.number
                    }
                    icon={Hash}
                  />

                  <DetailBox
                    label="Challan Type"
                    value={viewChallan.type}
                    icon={FileText}
                  />

                  <DetailBox
                    label="Fine Amount"
                    value={`₹${Number(
                      viewChallan.amount || 0
                    ).toLocaleString(
                      "en-IN"
                    )}`}
                    icon={IndianRupee}
                  />

                  <DetailBox
                    label="Paid Amount"
                    value={`₹${Number(
                      viewChallan.paidAmount ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}`}
                    icon={CircleDollarSign}
                  />

                  <DetailBox
                    label="Due Date"
                    value={formatDate(
                      viewChallan.due
                    )}
                    icon={CalendarDays}
                  />

                  <DetailBox
                    label="Status"
                    value={getStatus(
                      viewChallan
                    )}
                    icon={BadgeCheck}
                  />

                  <DetailBox
                    label="Paid Date"
                    value={formatDate(
                      viewChallan.paidDate
                    )}
                    icon={CheckCircle2}
                  />
                </div>

                {/* =================================================
                    UPLOADED DOCUMENT
                ================================================= */}

                {viewChallan.fileData ||
                viewChallan.fileUrl ||
                viewChallan.fileName ? (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                    className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-4">
                      {/* DOCUMENT HEADER */}

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <FileText size={20} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Uploaded Document
                            </p>

                            {(viewChallan.fileData ||
                              viewChallan.fileUrl) ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openDocumentFile(
                                    viewChallan
                                  )
                                }
                                title="Click to open document"
                                className="mt-1 block max-w-full truncate text-left text-sm font-semibold text-blue-600 underline decoration-blue-300 underline-offset-2 transition-colors duration-200 hover:text-blue-800 hover:decoration-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                              >
                                {viewChallan.fileName ||
                                  "Challan Document"}
                              </button>
                            ) : (
                              <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                                {viewChallan.fileName ||
                                  "Challan Document"}
                              </p>
                            )}

                            {viewChallan.fileSize ? (
                              <p className="mt-0.5 text-xs text-slate-400">
                                {(
                                  Number(
                                    viewChallan.fileSize
                                  ) /
                                  1024 /
                                  1024
                                ).toFixed(2)}{" "}
                                MB
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {(viewChallan.fileData ||
                          viewChallan.fileUrl) && (
                          <button
                            type="button"
                            onClick={() =>
                              openDocumentFile(
                                viewChallan
                              )
                            }
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
                          >
                            <ExternalLink size={16} />
                            Open Document
                          </button>
                        )}
                      </div>

                      {/* IMAGE PREVIEW */}

                      {viewChallan.fileData &&
                        isImageDocument(
                          viewChallan
                        ) && (
                          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <img
                              src={
                                viewChallan.fileData
                              }
                              alt={
                                viewChallan.fileName ||
                                "Challan document"
                              }
                              className="max-h-[420px] w-full object-contain"
                            />
                          </div>
                        )}

                      {/* PDF PREVIEW */}

                      {viewChallan.fileData &&
                        isPdfDocument(
                          viewChallan
                        ) && (
                          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <iframe
                              src={
                                viewChallan.fileData
                              }
                              title={
                                viewChallan.fileName ||
                                "Challan PDF"
                              }
                              className="h-[420px] w-full"
                            />
                          </div>
                        )}

                      {/* UNKNOWN/OTHER FILE FALLBACK */}

                      {viewChallan.fileData &&
                        !isImageDocument(
                          viewChallan
                        ) &&
                        !isPdfDocument(
                          viewChallan
                        ) && (
                          <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                            <FileText
                              size={20}
                              className="text-blue-600"
                            />

                            <p className="text-sm font-medium text-blue-700">
                              The uploaded document is
                              available. Click "Open
                              Document" to view it.
                            </p>
                          </div>
                        )}
                    </div>
                  </motion.div>
                ) : null}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() =>
                      setViewChallan(null)
                    }
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================
          EDIT MODAL
      =================================================== */}

      <AnimatePresence>
        {editChallan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={() =>
              setEditChallan(null)
            }
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              transition={{ duration: 0.25 }}
              onClick={(e) =>
                e.stopPropagation()
              }
              className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              {/* HEADER */}

              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                      <Pencil size={21} />
                    </div>

                    <div>
                      <h3 className="font-bold">
                        Edit Challan
                      </h3>

                      <p className="text-xs text-blue-100">
                        Update challan information
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setEditChallan(null)
                    }
                    className="rounded-lg p-2 transition hover:bg-white/10"
                  >
                    <X size={19} />
                  </button>
                </div>
              </div>

              {/* FORM */}

              <div className="max-h-[70vh] overflow-y-auto p-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  {/* VEHICLE */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-600">
                      Vehicle Number
                    </label>

                    <div className="relative">
                      <ReceiptText
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        value={
                          editForm.vehicle
                        }
                        onChange={(e) =>
                          handleEditChange(
                            "vehicle",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  {/* NUMBER */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-600">
                      Challan Number
                    </label>

                    <div className="relative">
                      <Hash
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        value={
                          editForm.number
                        }
                        onChange={(e) =>
                          handleEditChange(
                            "number",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  {/* TYPE */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-600">
                      Challan Type
                    </label>

                    <div className="relative">
                      <FileText
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        value={
                          editForm.type
                        }
                        onChange={(e) =>
                          handleEditChange(
                            "type",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  {/* AMOUNT */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-600">
                      Fine Amount
                    </label>

                    <div className="relative">
                      <IndianRupee
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="number"
                        value={
                          editForm.amount
                        }
                        onChange={(e) =>
                          handleEditChange(
                            "amount",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  {/* DUE DATE */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-600">
                      Due Date
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="date"
                        value={
                          editForm.due
                        }
                        onChange={(e) =>
                          handleEditChange(
                            "due",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  {/* STATUS */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-600">
                      Status
                    </label>

                    <select
                      value={
                        editForm.status
                      }
                      onChange={(e) =>
                        handleEditChange(
                          "status",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Unpaid">
                        Unpaid
                      </option>

                      <option value="Paid">
                        Paid
                      </option>
                    </select>
                  </div>

                  {/* PAID AMOUNT */}

                  {editForm.status ===
                    "Paid" && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-600">
                        Paid Amount
                      </label>

                      <div className="relative">
                        <IndianRupee
                          size={17}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="number"
                          value={
                            editForm.paidAmount
                          }
                          onChange={(e) =>
                            handleEditChange(
                              "paidAmount",
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* INFO */}

                <div className="mt-5 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600">
                    <AlertTriangle size={17} />
                  </div>

                  <p className="text-xs leading-5 text-blue-700">
                    Updating the challan will modify the
                    existing record in your fleet data.
                    Please verify the details before
                    saving.
                  </p>
                </div>

                {/* BUTTONS */}

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() =>
                      setEditChallan(null)
                    }
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSaveEdit}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <Save size={17} />
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={() =>
              setDeleteTarget(null)
            }
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              transition={{ duration: 0.25 }}
              onClick={(e) =>
                e.stopPropagation()
              }
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <Trash2 size={26} />
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-800">
                  Delete Challan?
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Are you sure you want to delete this
                  challan record? This action cannot be
                  undone.
                </p>

                <div className="mt-4 w-full rounded-xl border border-red-100 bg-red-50 p-3 text-left">
                  <div className="flex items-center gap-3">
                    <ReceiptText
                      size={18}
                      className="text-red-500"
                    />

                    <div>
                      <p className="text-sm font-semibold text-red-700">
                        {deleteTarget.vehicle}
                      </p>

                      <p className="text-xs text-red-500">
                        {deleteTarget.number}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex w-full gap-3">
                  <button
                    onClick={() =>
                      setDeleteTarget(null)
                    }
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    No, Keep It
                  </button>

                  <button
                    onClick={handleDelete}
                    className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-lg"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}











// import { useMemo, useState, useEffect, useRef } from "react";
// import {
//   Plus,
//   CheckCircle2,
//   Trash2,
//   MoreVertical,
//   Eye,
//   Pencil,
//   X,
//   IndianRupee,
//   AlertTriangle,
//   FileText,
//   CalendarDays,
//   CreditCard,
//   Search,
//   Filter,
//   CircleDollarSign,
//   Clock3,
//   BadgeCheck,
//   Save,
//   ChevronDown,
//   ReceiptText,
//   Car,
//   Hash,
//   ExternalLink,
// } from "lucide-react";

// import { Link } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";

// import PageHeader from "../components/PageHeader";
// import StatusBadge from "../components/StatusBadge";
// import { useFleet } from "../context/fleetContext";

// // =========================================================
// // HELPERS
// // =========================================================

// const formatDate = (date) => {
//   if (!date) return "—";

//   const d = new Date(date);

//   if (Number.isNaN(d.getTime())) return "—";

//   return d.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };

// // =========================================================
// // DOCUMENT OPEN HELPER
// // Handles Data URLs and normal URLs safely.
// // =========================================================

// const openDocumentFile = async (challan) => {
//   const fileSource = challan?.fileData || challan?.fileUrl;

//   if (!fileSource) {
//     console.warn("No document file found for this challan.");
//     return;
//   }

//   try {
//     /*
//       If the source is already a normal URL,
//       open it directly in a new browser tab.
//     */
//     if (!String(fileSource).startsWith("data:")) {
//       const newWindow = window.open(
//         fileSource,
//         "_blank",
//         "noopener,noreferrer"
//       );

//       if (!newWindow) {
//         console.warn(
//           "Popup blocked. Please allow popups for this site."
//         );
//       }

//       return;
//     }

//     /*
//       Convert Data URL to Blob.

//       This avoids browser restrictions that can occur
//       when directly opening a data: URL in a new tab,
//       especially for PDF files.
//     */
//     const response = await fetch(fileSource);
//     const blob = await response.blob();

//     const blobUrl = URL.createObjectURL(blob);

//     /*
//       Open a blank tab first.
//       This is more reliable than directly passing
//       the Blob URL to window.open in some browsers.
//     */
//     const newWindow = window.open(
//       "",
//       "_blank",
//       "noopener,noreferrer"
//     );

//     if (!newWindow) {
//       URL.revokeObjectURL(blobUrl);

//       console.warn(
//         "Popup blocked. Please allow popups for this site."
//       );

//       return;
//     }

//     newWindow.location.href = blobUrl;

//     /*
//       Keep the Blob URL alive long enough for the
//       browser document viewer to load the file.
//     */
//     setTimeout(() => {
//       URL.revokeObjectURL(blobUrl);
//     }, 60000);
//   } catch (error) {
//     console.error(
//       "Unable to open challan document:",
//       error
//     );

//     /*
//       Fallback for browsers that allow direct
//       data URL opening.
//     */
//     try {
//       const fallbackWindow = window.open(
//         fileSource,
//         "_blank",
//         "noopener,noreferrer"
//       );

//       if (!fallbackWindow) {
//         console.warn(
//           "Popup blocked. Please allow popups for this site."
//         );
//       }
//     } catch (fallbackError) {
//       console.error(
//         "Document fallback failed:",
//         fallbackError
//       );
//     }
//   }
// };

// // =========================================================
// // DOCUMENT TYPE HELPER
// // =========================================================

// const isImageDocument = (challan) => {
//   const type = String(
//     challan?.fileType || ""
//   ).toLowerCase();

//   const name = String(
//     challan?.fileName || ""
//   ).toLowerCase();

//   return (
//     type.startsWith("image/") ||
//     /\.(jpg|jpeg|png)$/i.test(name)
//   );
// };

// const isPdfDocument = (challan) => {
//   const type = String(
//     challan?.fileType || ""
//   ).toLowerCase();

//   const name = String(
//     challan?.fileName || ""
//   ).toLowerCase();

//   return (
//     type === "application/pdf" ||
//     name.endsWith(".pdf")
//   );
// };

// // =========================================================
// // DOCUMENTS STYLE ANIMATIONS
// // =========================================================

// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
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
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.4,
//     },
//   },
// };

// // =========================================================
// // STAT CARD
// // =========================================================

// function StatCard({
//   title,
//   value,
//   note,
//   icon: Icon,
//   color = "text-blue-600",
//   bg = "bg-blue-50",
// }) {
//   const iconBg = color.replace("text-", "bg-");

//   return (
//     <motion.div
//       variants={itemVariants}
//       whileHover={{
//         y: -5,
//         scale: 1.015,
//       }}
//       transition={{
//         duration: 0.2,
//       }}
//       className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg"
//     >
//       <div
//         className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${bg} opacity-50 transition-all duration-500 group-hover:scale-150`}
//       />

//       <div className="relative flex items-start justify-between">
//         <div>
//           <p className="text-sm font-medium text-slate-500">
//             {title}
//           </p>

//           <h3 className="mt-2 text-2xl font-bold text-slate-800">
//             {value}
//           </h3>

//           {note && (
//             <p className={`mt-1 text-xs font-medium ${color}`}>
//               {note}
//             </p>
//           )}
//         </div>

//         <motion.div
//           whileHover={{
//             rotate: 8,
//             scale: 1.08,
//           }}
//           transition={{ duration: 0.2 }}
//           className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg} ${color}`}
//         >
//           <Icon size={22} strokeWidth={2} />
//         </motion.div>
//       </div>

//       <div
//         className={`absolute bottom-0 left-0 h-1 w-0 ${iconBg} transition-all duration-500 group-hover:w-full`}
//       />
//     </motion.div>
//   );
// }

// // =========================================================
// // DETAIL BOX
// // =========================================================

// function DetailBox({ label, value, icon: Icon }) {
//   return (
//     <motion.div
//       whileHover={{
//         y: -2,
//       }}
//       transition={{
//         duration: 0.2,
//       }}
//       className="rounded-xl border border-slate-200 bg-slate-50 p-4"
//     >
//       <div className="flex items-start gap-3">
//         <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
//           <Icon size={18} />
//         </div>

//         <div className="min-w-0">
//           <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
//             {label}
//           </p>

//           <p className="mt-1 break-words text-sm font-semibold text-slate-700">
//             {value || "—"}
//           </p>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// // =========================================================
// // MAIN COMPONENT
// // =========================================================

// export default function Challans() {
//   const {
//     challans,
//     updateChallan,
//     deleteChallan,
//   } = useFleet();

//   // =======================================================
//   // FILTER STATES
//   // =======================================================

//   const [q, setQ] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [showFilters, setShowFilters] = useState(false);

//   // =======================================================
//   // MENU / MODALS
//   // =======================================================

//   const [openMenu, setOpenMenu] = useState(null);

//   const [viewChallan, setViewChallan] = useState(null);
//   const [editChallan, setEditChallan] = useState(null);
//   const [paidChallan, setPaidChallan] = useState(null);
//   const [deleteTarget, setDeleteTarget] = useState(null);

//   // =======================================================
//   // PAID FORM
//   // =======================================================

//   const [paidAmount, setPaidAmount] = useState("");

//   // =======================================================
//   // EDIT FORM
//   // =======================================================

//   const [editForm, setEditForm] = useState({
//     vehicle: "",
//     number: "",
//     type: "",
//     amount: "",
//     due: "",
//     status: "Pending",
//     paidAmount: "",
//   });

//   // =======================================================
//   // SUCCESS MESSAGE
//   // =======================================================

//   const [successMessage, setSuccessMessage] = useState("");

//   // =======================================================
//   // ACTION MENU OUTSIDE CLICK
//   // =======================================================

//   const actionMenuRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         actionMenuRef.current &&
//         !actionMenuRef.current.contains(event.target)
//       ) {
//         setOpenMenu(null);
//       }
//     };

//     document.addEventListener(
//       "mousedown",
//       handleClickOutside
//     );

//     return () => {
//       document.removeEventListener(
//         "mousedown",
//         handleClickOutside
//       );
//     };
//   }, []);

//   // =======================================================
//   // SUCCESS MESSAGE AUTO CLOSE
//   // =======================================================

//   useEffect(() => {
//     if (!successMessage) return;

//     const timer = setTimeout(() => {
//       setSuccessMessage("");
//     }, 3000);

//     return () => clearTimeout(timer);
//   }, [successMessage]);

//   // =======================================================
//   // FILTERED LIST
//   // =======================================================

//   const list = useMemo(() => {
//     const search = q.trim().toLowerCase();

//     return (challans || []).filter((c) => {
//       const matchesSearch =
//         !search ||
//         String(c.vehicle || "")
//           .toLowerCase()
//           .includes(search) ||
//         String(c.number || "")
//           .toLowerCase()
//           .includes(search) ||
//         String(c.type || "")
//           .toLowerCase()
//           .includes(search);

//       const matchesFromDate =
//         !fromDate ||
//         String(c.due || "") >= fromDate;

//       const matchesToDate =
//         !toDate ||
//         String(c.due || "") <= toDate;

//       const matchesStatus =
//         statusFilter === "All" ||
//         String(c.status || "").toLowerCase() ===
//           statusFilter.toLowerCase();

//       return (
//         matchesSearch &&
//         matchesFromDate &&
//         matchesToDate &&
//         matchesStatus
//       );
//     });
//   }, [
//     challans,
//     q,
//     fromDate,
//     toDate,
//     statusFilter,
//   ]);

//   // =======================================================
//   // STATISTICS
//   // =======================================================

//   const stats = useMemo(() => {
//     const all = challans || [];

//     const paid = all.filter(
//       (c) =>
//         String(c.status || "").toLowerCase() ===
//         "paid"
//     );

//     const pending = all.filter((c) => {
//       const status = String(
//         c.status || ""
//       ).toLowerCase();

//       return (
//         status === "pending" ||
//         status === "unpaid"
//       );
//     });

//     const totalPaidAmount = paid.reduce(
//       (sum, c) =>
//         sum + Number(c.paidAmount || 0),
//       0
//     );

//     return {
//       total: all.length,
//       paid: paid.length,
//       pending: pending.length,
//       totalPaidAmount,
//     };
//   }, [challans]);

//   // =======================================================
//   // OPEN PAID MODAL
//   // =======================================================

//   const handleOpenPaid = (challan) => {
//     setPaidChallan(challan);

//     setPaidAmount(
//       challan?.paidAmount
//         ? String(challan.paidAmount)
//         : String(challan?.amount || "")
//     );

//     setOpenMenu(null);
//   };

//   // =======================================================
//   // MARK CHALLAN AS PAID
//   // =======================================================

//   const handleConfirmPaid = () => {
//     if (!paidChallan) return;

//     updateChallan(paidChallan.id, {
//       ...paidChallan,
//       status: "Paid",
//       paid: true,
//       paidAmount: Number(
//         paidAmount || 0
//       ),
//       paidDate: new Date().toISOString(),
//     });

//     setPaidChallan(null);
//     setPaidAmount("");

//     setSuccessMessage(
//       "Challan marked as paid successfully."
//     );
//   };

//   // =======================================================
//   // VIEW
//   // =======================================================

//   const handleView = (challan) => {
//     setViewChallan(challan);
//     setOpenMenu(null);
//   };

//   // =======================================================
//   // EDIT
//   // =======================================================

//   const handleEdit = (challan) => {
//     setEditChallan(challan);

//     setEditForm({
//       vehicle: challan.vehicle || "",
//       number: challan.number || "",
//       type: challan.type || "",
//       amount: challan.amount || "",
//       due: challan.due || "",
//       status: challan.status || "Pending",
//       paidAmount: challan.paidAmount || "",
//     });

//     setOpenMenu(null);
//   };

//   const handleEditChange = (
//     field,
//     value
//   ) => {
//     setEditForm((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleSaveEdit = () => {
//     if (!editChallan) return;

//     updateChallan(editChallan.id, {
//       ...editChallan,
//       vehicle: editForm.vehicle,
//       number: editForm.number,
//       type: editForm.type,
//       amount: Number(
//         editForm.amount || 0
//       ),
//       due: editForm.due,
//       status: editForm.status,
//       paid:
//         editForm.status === "Paid",
//       paidAmount:
//         editForm.status === "Paid"
//           ? Number(
//               editForm.paidAmount || 0
//             )
//           : Number(
//               editChallan.paidAmount || 0
//             ),
//     });

//     setEditChallan(null);

//     setSuccessMessage(
//       "Challan updated successfully."
//     );
//   };

//   // =======================================================
//   // DELETE
//   // =======================================================

//   const handleDelete = () => {
//     if (!deleteTarget) return;

//     deleteChallan(deleteTarget.id);

//     setDeleteTarget(null);

//     setSuccessMessage(
//       "Challan deleted successfully."
//     );
//   };

//   // =======================================================
//   // CLEAR FILTERS
//   // =======================================================

//   const clearFilters = () => {
//     setQ("");
//     setFromDate("");
//     setToDate("");
//     setStatusFilter("All");
//   };

//   // =======================================================
//   // STATUS
//   // =======================================================

//   const getStatus = (challan) => {
//     if (!challan) return "Pending";

//     if (
//       String(challan.status || "").toLowerCase() ===
//       "paid"
//     ) {
//       return "Paid";
//     }

//     return challan.status || "Pending";
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.4 }}
//       className="space-y-6"
//     >
//       {/* ===================================================
//           PAGE HEADER
//       =================================================== */}

//       <PageHeader
//         title={
//           <div className="flex items-center gap-3">
//             <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 transition duration-300 hover:scale-110 hover:rotate-3">
//               <ReceiptText
//                 size={23}
//                 strokeWidth={2.3}
//               />
//             </div>

//             <div>
//               <span className="block text-2xl font-bold text-slate-800">
//                 Challans
//               </span>
//             </div>
//           </div>
//         }
//         subtitle="Manage vehicle fines, challans and payment records"
//         action={
//           <Link
//             to="/challans/add"
//             className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
//           >
//             <Plus size={18} />
//             Add Challan
//           </Link>
//         }
//       />

//       {/* ===================================================
//           HERO SECTION
//       =================================================== */}

//       <motion.section
//         variants={itemVariants}
//         initial="hidden"
//         animate="visible"
//         className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-6 text-white shadow-lg"
//       >
//         <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

//         <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />

//         <div className="absolute right-1/4 top-1/2 h-24 w-24 rounded-full bg-white/5 blur-xl" />

//         <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
//           <div className="flex items-start gap-4">
//             <motion.div
//               animate={{
//                 y: [0, -5, 0],
//                 rotate: [0, 2, 0],
//               }}
//               transition={{
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               }}
//               className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
//             >
//               <ReceiptText size={34} />
//             </motion.div>

//             <div>
//               <h2 className="text-2xl font-bold">
//                 Manage Your Challans
//               </h2>

//               <p className="mt-1 max-w-2xl text-sm leading-6 text-blue-100">
//                 Track vehicle fines, challan details,
//                 payment status and due dates from one
//                 centralized dashboard.
//               </p>
//             </div>
//           </div>

//           <div className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-center backdrop-blur-sm">
//             <p className="text-xs font-medium uppercase tracking-wider text-blue-100">
//               Total Challans
//             </p>

//             <p className="mt-1 text-3xl font-bold">
//               {stats.total}
//             </p>

//             <p className="mt-1 text-xs text-blue-100">
//               Records available
//             </p>
//           </div>
//         </div>
//       </motion.section>

//       {/* ===================================================
//           STAT CARDS
//       =================================================== */}

//       <motion.div
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//         className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
//       >
//         <StatCard
//           title="Total Challans"
//           value={stats.total}
//           note="All challan records"
//           icon={ReceiptText}
//           bg="bg-blue-50"
//           color="text-blue-600"
//         />

//         <StatCard
//           title="Paid Challans"
//           value={stats.paid}
//           note="Successfully paid"
//           icon={BadgeCheck}
//           color="text-emerald-600"
//           bg="bg-emerald-50"
//         />

//         <StatCard
//           title="Pending Challans"
//           value={stats.pending}
//           note="Payment pending"
//           icon={Clock3}
//           color="text-amber-600"
//           bg="bg-amber-50"
//         />

//         <StatCard
//           title="Total Paid Amount"
//           value={`₹${stats.totalPaidAmount.toLocaleString(
//             "en-IN"
//           )}`}
//           note="Total amount paid"
//           icon={CircleDollarSign}
//           color="text-indigo-600"
//           bg="bg-indigo-50"
//         />
//       </motion.div>

//       {/* ===================================================
//           TABLE CARD
//       =================================================== */}

//       <motion.section
//         variants={itemVariants}
//         initial="hidden"
//         animate="visible"
//         className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
//       >
//         {/* TABLE HEADER */}

//         <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
//           <div>
//             <div className="flex items-center gap-2">
//               <div
//                 className="
//                   rounded-lg
//                   bg-blue-50
//                   p-2
//                   text-blue-600
//                 "
//               >
//                 <ReceiptText size={20} />
//               </div>

//               <h2 className="text-lg font-bold text-slate-800">
//                 Challan Records
//               </h2>
//             </div>

//             <p className="mt-1 text-sm text-slate-500">
//               View and manage all vehicle challan records
//             </p>
//           </div>

//           <div className="flex flex-col gap-3 sm:flex-row">
//             {/* SEARCH */}

//             <div className="relative">
//               <Search
//                 size={17}
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//               />

//               <input
//                 type="text"
//                 value={q}
//                 onChange={(e) =>
//                   setQ(e.target.value)
//                 }
//                 placeholder="Search challans..."
//                 className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm outline-none transition-all duration-300 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:w-64"
//               />

//               {q && (
//                 <button
//                   onClick={() => setQ("")}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
//                 >
//                   <X size={16} />
//                 </button>
//               )}
//             </div>

//             {/* FILTER BUTTON */}

//             <button
//               onClick={() =>
//                 setShowFilters(
//                   (prev) => !prev
//                 )
//               }
//               className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
//                 showFilters
//                   ? "border-blue-200 bg-blue-50 text-blue-700"
//                   : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
//               }`}
//             >
//               <Filter size={17} />

//               Filters

//               <ChevronDown
//                 size={16}
//                 className={`transition-transform duration-300 ${
//                   showFilters
//                     ? "rotate-180"
//                     : ""
//                 }`}
//               />
//             </button>
//           </div>
//         </div>

//         {/* =================================================
//             FILTER SECTION
//         ================================================= */}

//         <AnimatePresence>
//           {showFilters && (
//             <motion.div
//               initial={{
//                 opacity: 0,
//                 height: 0,
//               }}
//               animate={{
//                 opacity: 1,
//                 height: "auto",
//               }}
//               exit={{
//                 opacity: 0,
//                 height: 0,
//               }}
//               transition={{
//                 duration: 0.25,
//               }}
//               className="overflow-hidden border-b border-slate-200 bg-slate-50"
//             >
//               <div className="grid gap-4 p-5 md:grid-cols-3 lg:grid-cols-4">
//                 {/* FROM DATE */}

//                 <div>
//                   <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     From Date
//                   </label>

//                   <div className="relative">
//                     <CalendarDays
//                       size={16}
//                       className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                     />

//                     <input
//                       type="date"
//                       value={fromDate}
//                       onChange={(e) =>
//                         setFromDate(
//                           e.target.value
//                         )
//                       }
//                       className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
//                     />
//                   </div>
//                 </div>

//                 {/* TO DATE */}

//                 <div>
//                   <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     To Date
//                   </label>

//                   <div className="relative">
//                     <CalendarDays
//                       size={16}
//                       className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                     />

//                     <input
//                       type="date"
//                       value={toDate}
//                       onChange={(e) =>
//                         setToDate(
//                           e.target.value
//                         )
//                       }
//                       className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
//                     />
//                   </div>
//                 </div>

//                 {/* STATUS */}

//                 <div>
//                   <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
//                     Status
//                   </label>

//                   <select
//                     value={statusFilter}
//                     onChange={(e) =>
//                       setStatusFilter(
//                         e.target.value
//                       )
//                     }
//                     className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
//                   >
//                     <option value="All">
//                       All Status
//                     </option>

//                     <option value="Paid">
//                       Paid
//                     </option>

//                     <option value="Pending">
//                       Pending
//                     </option>

//                     <option value="Unpaid">
//                       Unpaid
//                     </option>
//                   </select>
//                 </div>

//                 {/* CLEAR */}

//                 <div className="flex items-end">
//                   <button
//                     onClick={clearFilters}
//                     className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
//                   >
//                     Clear Filters
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* =================================================
//             TABLE
//         ================================================= */}

//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[1050px]">
//             <thead>
//               <tr className="border-b border-slate-200 bg-slate-50/70">
//                 <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                   Vehicle
//                 </th>

//                 <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                   Challan No.
//                 </th>

//                 <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                   Challan Type
//                 </th>

//                 <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                   Fine Amount
//                 </th>

//                 <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                   Paid Amount
//                 </th>

//                 <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                   Due Date
//                 </th>

//                 <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                   Status
//                 </th>

//                 <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
//                   Action
//                 </th>
//               </tr>
//             </thead>

//             <tbody>
//               {list.length > 0 ? (
//                 list.map((c, index) => (
//                   <motion.tr
//                     key={c.id}
//                     variants={itemVariants}
//                     initial="hidden"
//                     animate="visible"
//                     transition={{
//                       delay: index * 0.03,
//                     }}
//                     className="
//                         group
//                         border-b
//                         border-slate-100
//                         transition
//                         duration-300
//                         hover:bg-blue-50/40
//                       "
//                   >
//                     {/* VEHICLE */}

//                     <td className="px-5 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
//                           <ReceiptText size={19} />
//                         </div>

//                         <span className="font-semibold text-blue-700">
//                           {c.vehicle || "—"}
//                         </span>
//                       </div>
//                     </td>

//                     {/* CHALLAN NUMBER */}

//                     <td className="px-5 py-4">
//                       <div className="flex items-center gap-2">
//                         <Hash
//                           size={15}
//                           className="text-slate-400"
//                         />

//                         <span className="font-medium text-slate-700">
//                           {c.number || "—"}
//                         </span>
//                       </div>
//                     </td>

//                     {/* TYPE */}

//                     <td className="px-5 py-4">
//                       <span className="text-sm font-medium text-slate-700">
//                         {c.type || "—"}
//                       </span>
//                     </td>

//                     {/* FINE AMOUNT */}

//                     <td className="px-5 py-4">
//                       <div className="flex items-center gap-1 font-semibold text-slate-700">
//                         <IndianRupee size={15} />

//                         {Number(
//                           c.amount || 0
//                         ).toLocaleString("en-IN")}
//                       </div>
//                     </td>

//                     {/* PAID AMOUNT */}

//                     <td className="px-5 py-4">
//                       <div className="flex items-center gap-1 font-semibold text-emerald-600">
//                         <IndianRupee size={15} />

//                         {Number(
//                           c.paidAmount || 0
//                         ).toLocaleString("en-IN")}
//                       </div>
//                     </td>

//                     {/* DUE DATE */}

//                     <td className="px-5 py-4">
//                       <div className="flex items-center gap-2 text-sm text-slate-600">
//                         <CalendarDays
//                           size={15}
//                           className="text-slate-400"
//                         />

//                         {formatDate(c.due)}
//                       </div>
//                     </td>

//                     {/* STATUS */}

//                     <td className="px-5 py-4">
//                       <StatusBadge
//                         status={getStatus(c)}
//                       />
//                     </td>

//                     {/* ACTION */}

//                     <td className="px-5 py-4 text-right">
//                       <div
//                         className="relative inline-block"
//                         data-document-action-menu
//                         ref={
//                           openMenu === c.id
//                             ? actionMenuRef
//                             : null
//                         }
//                       >
//                         <button
//                           onClick={() =>
//                             setOpenMenu(
//                               openMenu === c.id
//                                 ? null
//                                 : c.id
//                             )
//                           }
//                           className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
//                         >
//                           <MoreVertical size={18} />
//                         </button>

//                         <AnimatePresence>
//                           {openMenu === c.id && (
//                             <motion.div
//                               initial={{
//                                 opacity: 0,
//                                 scale: 0.95,
//                                 y: -5,
//                               }}
//                               animate={{
//                                 opacity: 1,
//                                 scale: 1,
//                                 y: 0,
//                               }}
//                               exit={{
//                                 opacity: 0,
//                                 scale: 0.95,
//                                 y: -5,
//                               }}
//                               transition={{
//                                 duration: 0.15,
//                               }}
//                               className="absolute right-0 z-30 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
//                             >
//                               {/* VIEW */}

//                               <button
//                                 onClick={() =>
//                                   handleView(c)
//                                 }
//                                 className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
//                               >
//                                 <Eye size={16} />
//                                 View
//                               </button>

//                               {/* EDIT */}

//                               <button
//                                 onClick={() =>
//                                   handleEdit(c)
//                                 }
//                                 className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
//                               >
//                                 <Pencil size={16} />
//                                 Edit
//                               </button>

//                               {/* MARK PAID */}

//                               {getStatus(c) !==
//                                 "Paid" && (
//                                 <button
//                                   onClick={() =>
//                                     handleOpenPaid(c)
//                                   }
//                                   className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
//                                 >
//                                   <CheckCircle2
//                                     size={16}
//                                   />

//                                   Mark Paid
//                                 </button>
//                               )}

//                               {/* DELETE */}

//                               <button
//                                 onClick={() => {
//                                   setDeleteTarget(c);
//                                   setOpenMenu(null);
//                                 }}
//                                 className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
//                               >
//                                 <Trash2 size={16} />
//                                 Delete
//                               </button>
//                             </motion.div>
//                           )}
//                         </AnimatePresence>
//                       </div>
//                     </td>
//                   </motion.tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td
//                     colSpan="8"
//                     className="px-5 py-16 text-center"
//                   >
//                     <div className="flex flex-col items-center justify-center">
//                       <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
//                         <ReceiptText size={30} />
//                       </div>

//                       <h3 className="mt-4 text-base font-semibold text-slate-700">
//                         No challans found
//                       </h3>

//                       <p className="mt-1 max-w-sm text-sm text-slate-400">
//                         No challan records match your
//                         current search or filters.
//                       </p>

//                       <Link
//                         to="/challans/add"
//                         className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
//                       >
//                         <Plus size={17} />
//                         Add First Challan
//                       </Link>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* TABLE FOOTER */}

//         {list.length > 0 && (
//           <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
//             <p className="font-medium text-slate-400">
//               Showing{" "}
//               <span className="font-semibold text-slate-600">
//                 {list.length}
//               </span>{" "}
//               of{" "}
//               <span className="font-semibold text-slate-600">
//                 {stats.total}
//               </span>{" "}
//               challan records
//             </p>

//             <button
//               onClick={() => setQ("")}
//               className="flex items-center gap-1 font-medium text-blue-600 transition hover:text-blue-800"
//             >
//               View More
//               <ChevronDown size={16} />
//             </button>
//           </div>
//         )}
//       </motion.section>

//       {/* ===================================================
//           SUCCESS MESSAGE
//       =================================================== */}

//       <AnimatePresence>
//         {successMessage && (
//           <motion.div
//             initial={{
//               opacity: 0,
//               y: -20,
//               x: 20,
//             }}
//             animate={{
//               opacity: 1,
//               y: 0,
//               x: 0,
//             }}
//             exit={{
//               opacity: 0,
//               y: -20,
//               x: 20,
//             }}
//             className="fixed right-5 top-5 z-[100] flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-xl"
//           >
//             <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
//               <CheckCircle2 size={19} />
//             </div>

//             <p className="text-sm font-semibold text-slate-700">
//               {successMessage}
//             </p>

//             <button
//               onClick={() =>
//                 setSuccessMessage("")
//               }
//               className="ml-2 text-slate-400 transition hover:text-slate-700"
//             >
//               <X size={16} />
//             </button>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ===================================================
//           PAID MODAL
//       =================================================== */}

//       <AnimatePresence>
//         {paidChallan && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
//             onClick={() =>
//               setPaidChallan(null)
//             }
//           >
//             <motion.div
//               initial={{
//                 opacity: 0,
//                 scale: 0.95,
//                 y: 20,
//               }}
//               animate={{
//                 opacity: 1,
//                 scale: 1,
//                 y: 0,
//               }}
//               exit={{
//                 opacity: 0,
//                 scale: 0.95,
//                 y: 20,
//               }}
//               transition={{ duration: 0.25 }}
//               onClick={(e) =>
//                 e.stopPropagation()
//               }
//               className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
//             >
//               <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
//                       <CheckCircle2 size={21} />
//                     </div>

//                     <div>
//                       <h3 className="font-bold">
//                         Mark Challan Paid
//                       </h3>

//                       <p className="text-xs text-emerald-100">
//                         Confirm payment details
//                       </p>
//                     </div>
//                   </div>

//                   <button
//                     onClick={() =>
//                       setPaidChallan(null)
//                     }
//                     className="rounded-lg p-1.5 transition hover:bg-white/10"
//                   >
//                     <X size={19} />
//                   </button>
//                 </div>
//               </div>

//               <div className="space-y-5 p-5">
//                 <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
//                   <div className="flex items-center gap-3">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
//                       <ReceiptText size={20} />
//                     </div>

//                     <div>
//                       <p className="font-semibold text-blue-700">
//                         {paidChallan.vehicle}
//                       </p>

//                       <p className="text-xs text-slate-500">
//                         {paidChallan.number}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="mb-2 block text-sm font-semibold text-slate-600">
//                     Paid Amount
//                   </label>

//                   <div className="relative">
//                     <IndianRupee
//                       size={17}
//                       className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                     />

//                     <input
//                       type="number"
//                       value={paidAmount}
//                       onChange={(e) =>
//                         setPaidAmount(
//                           e.target.value
//                         )
//                       }
//                       className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
//                       placeholder="Enter paid amount"
//                     />
//                   </div>
//                 </div>

//                 <div className="flex justify-end gap-3">
//                   <button
//                     onClick={() =>
//                       setPaidChallan(null)
//                     }
//                     className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     onClick={handleConfirmPaid}
//                     className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
//                   >
//                     <CheckCircle2 size={17} />
//                     Paid
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ===================================================
//           VIEW MODAL
//       =================================================== */}

//       <AnimatePresence>
//         {viewChallan && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
//             onClick={() =>
//               setViewChallan(null)
//             }
//           >
//             <motion.div
//               initial={{
//                 opacity: 0,
//                 scale: 0.95,
//                 y: 20,
//               }}
//               animate={{
//                 opacity: 1,
//                 scale: 1,
//                 y: 0,
//               }}
//               exit={{
//                 opacity: 0,
//                 scale: 0.95,
//                 y: 20,
//               }}
//               transition={{ duration: 0.25 }}
//               onClick={(e) =>
//                 e.stopPropagation()
//               }
//               className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
//             >
//               {/* MODAL HEADER */}

//               <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
//                 <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />

//                 <div className="relative flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
//                       <ReceiptText size={24} />
//                     </div>

//                     <div>
//                       <h3 className="text-lg font-bold">
//                         Challan Details
//                       </h3>

//                       <p className="text-sm text-blue-100">
//                         {viewChallan.number ||
//                           "Challan"}
//                       </p>
//                     </div>
//                   </div>

//                   <button
//                     onClick={() =>
//                       setViewChallan(null)
//                     }
//                     className="rounded-lg p-2 transition hover:bg-white/10"
//                   >
//                     <X size={20} />
//                   </button>
//                 </div>
//               </div>

//               {/* MODAL CONTENT */}

//               <div className="max-h-[70vh] overflow-y-auto p-6">
//                 <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
//                   <div className="flex items-center gap-3">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
//                       <ReceiptText size={20} />
//                     </div>

//                     <div>
//                       <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
//                         Status
//                       </p>

//                       <div className="mt-1">
//                         <StatusBadge
//                           status={getStatus(
//                             viewChallan
//                           )}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid gap-4 sm:grid-cols-2">
//                   <DetailBox
//                     label="Vehicle"
//                     value={
//                       viewChallan.vehicle
//                     }
//                     icon={ReceiptText}
//                   />

//                   <DetailBox
//                     label="Challan Number"
//                     value={
//                       viewChallan.number
//                     }
//                     icon={Hash}
//                   />

//                   <DetailBox
//                     label="Challan Type"
//                     value={viewChallan.type}
//                     icon={FileText}
//                   />

//                   <DetailBox
//                     label="Fine Amount"
//                     value={`₹${Number(
//                       viewChallan.amount || 0
//                     ).toLocaleString(
//                       "en-IN"
//                     )}`}
//                     icon={IndianRupee}
//                   />

//                   <DetailBox
//                     label="Paid Amount"
//                     value={`₹${Number(
//                       viewChallan.paidAmount ||
//                         0
//                     ).toLocaleString(
//                       "en-IN"
//                     )}`}
//                     icon={CircleDollarSign}
//                   />

//                   <DetailBox
//                     label="Due Date"
//                     value={formatDate(
//                       viewChallan.due
//                     )}
//                     icon={CalendarDays}
//                   />

//                   <DetailBox
//                     label="Status"
//                     value={getStatus(
//                       viewChallan
//                     )}
//                     icon={BadgeCheck}
//                   />

//                   <DetailBox
//                     label="Paid Date"
//                     value={formatDate(
//                       viewChallan.paidDate
//                     )}
//                     icon={CheckCircle2}
//                   />
//                 </div>

//                 {/* =================================================
//                     UPLOADED DOCUMENT
//                     Document name is clickable and opens the
//                     uploaded file in a new browser tab.
//                 ================================================= */}

//                 {viewChallan.fileData ||
//                 viewChallan.fileUrl ||
//                 viewChallan.fileName ? (
//                   <motion.div
//                     initial={{
//                       opacity: 0,
//                       y: 10,
//                     }}
//                     animate={{
//                       opacity: 1,
//                       y: 0,
//                     }}
//                     transition={{
//                       duration: 0.3,
//                     }}
//                     className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4"
//                   >
//                     <div className="flex flex-col gap-4">
//                       {/* DOCUMENT HEADER */}

//                       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//                         <div className="flex min-w-0 items-center gap-3">
//                           <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
//                             <FileText size={20} />
//                           </div>

//                           <div className="min-w-0">
//                             <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
//                               Uploaded Document
//                             </p>

//                             {/* =================================================
//                                 CLICKABLE DOCUMENT NAME
//                             ================================================= */}

//                             {(viewChallan.fileData ||
//                               viewChallan.fileUrl) ? (
//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   openDocumentFile(
//                                     viewChallan
//                                   )
//                                 }
//                                 title="Click to open document"
//                                 className="mt-1 block max-w-full truncate text-left text-sm font-semibold text-blue-600 underline decoration-blue-300 underline-offset-2 transition-colors duration-200 hover:text-blue-800 hover:decoration-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
//                               >
//                                 {viewChallan.fileName ||
//                                   "Challan Document"}
//                               </button>
//                             ) : (
//                               <p className="mt-1 truncate text-sm font-semibold text-slate-700">
//                                 {viewChallan.fileName ||
//                                   "Challan Document"}
//                               </p>
//                             )}

//                             {viewChallan.fileSize ? (
//                               <p className="mt-0.5 text-xs text-slate-400">
//                                 {(
//                                   Number(
//                                     viewChallan.fileSize
//                                   ) /
//                                   1024 /
//                                   1024
//                                 ).toFixed(2)}{" "}
//                                 MB
//                               </p>
//                             ) : null}
//                           </div>
//                         </div>

//                         {(viewChallan.fileData ||
//                           viewChallan.fileUrl) && (
//                           <button
//                             type="button"
//                             onClick={() =>
//                               openDocumentFile(
//                                 viewChallan
//                               )
//                             }
//                             className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
//                           >
//                             <ExternalLink size={16} />
//                             Open Document
//                           </button>
//                         )}
//                       </div>

//                       {/* IMAGE PREVIEW */}

//                       {viewChallan.fileData &&
//                         isImageDocument(
//                           viewChallan
//                         ) && (
//                           <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
//                             <img
//                               src={
//                                 viewChallan.fileData
//                               }
//                               alt={
//                                 viewChallan.fileName ||
//                                 "Challan document"
//                               }
//                               className="max-h-[420px] w-full object-contain"
//                             />
//                           </div>
//                         )}

//                       {/* PDF PREVIEW */}

//                       {viewChallan.fileData &&
//                         isPdfDocument(
//                           viewChallan
//                         ) && (
//                           <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
//                             <iframe
//                               src={
//                                 viewChallan.fileData
//                               }
//                               title={
//                                 viewChallan.fileName ||
//                                 "Challan PDF"
//                               }
//                               className="h-[420px] w-full"
//                             />
//                           </div>
//                         )}

//                       {/* UNKNOWN/OTHER FILE FALLBACK */}

//                       {viewChallan.fileData &&
//                         !isImageDocument(
//                           viewChallan
//                         ) &&
//                         !isPdfDocument(
//                           viewChallan
//                         ) && (
//                           <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
//                             <FileText
//                               size={20}
//                               className="text-blue-600"
//                             />

//                             <p className="text-sm font-medium text-blue-700">
//                               The uploaded document is
//                               available. Click "Open
//                               Document" to view it.
//                             </p>
//                           </div>
//                         )}
//                     </div>
//                   </motion.div>
//                 ) : null}

//                 <div className="mt-6 flex justify-end">
//                   <button
//                     onClick={() =>
//                       setViewChallan(null)
//                     }
//                     className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ===================================================
//           EDIT MODAL
//       =================================================== */}

//       <AnimatePresence>
//         {editChallan && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
//             onClick={() =>
//               setEditChallan(null)
//             }
//           >
//             <motion.div
//               initial={{
//                 opacity: 0,
//                 scale: 0.95,
//                 y: 20,
//               }}
//               animate={{
//                 opacity: 1,
//                 scale: 1,
//                 y: 0,
//               }}
//               exit={{
//                 opacity: 0,
//                 scale: 0.95,
//                 y: 20,
//               }}
//               transition={{ duration: 0.25 }}
//               onClick={(e) =>
//                 e.stopPropagation()
//               }
//               className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
//             >
//               {/* HEADER */}

//               <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
//                       <Pencil size={21} />
//                     </div>

//                     <div>
//                       <h3 className="font-bold">
//                         Edit Challan
//                       </h3>

//                       <p className="text-xs text-blue-100">
//                         Update challan information
//                       </p>
//                     </div>
//                   </div>

//                   <button
//                     onClick={() =>
//                       setEditChallan(null)
//                     }
//                     className="rounded-lg p-2 transition hover:bg-white/10"
//                   >
//                     <X size={19} />
//                   </button>
//                 </div>
//               </div>

//               {/* FORM */}

//               <div className="max-h-[70vh] overflow-y-auto p-6">
//                 <div className="grid gap-5 sm:grid-cols-2">
//                   {/* VEHICLE */}

//                   <div>
//                     <label className="mb-2 block text-sm font-semibold text-slate-600">
//                       Vehicle Number
//                     </label>

//                     <div className="relative">
//                       <ReceiptText
//                         size={17}
//                         className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                       />

//                       <input
//                         type="text"
//                         value={
//                           editForm.vehicle
//                         }
//                         onChange={(e) =>
//                           handleEditChange(
//                             "vehicle",
//                             e.target.value
//                           )
//                         }
//                         className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
//                       />
//                     </div>
//                   </div>

//                   {/* NUMBER */}

//                   <div>
//                     <label className="mb-2 block text-sm font-semibold text-slate-600">
//                       Challan Number
//                     </label>

//                     <div className="relative">
//                       <Hash
//                         size={17}
//                         className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                       />

//                       <input
//                         type="text"
//                         value={
//                           editForm.number
//                         }
//                         onChange={(e) =>
//                           handleEditChange(
//                             "number",
//                             e.target.value
//                           )
//                         }
//                         className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
//                       />
//                     </div>
//                   </div>

//                   {/* TYPE */}

//                   <div>
//                     <label className="mb-2 block text-sm font-semibold text-slate-600">
//                       Challan Type
//                     </label>

//                     <div className="relative">
//                       <FileText
//                         size={17}
//                         className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                       />

//                       <input
//                         type="text"
//                         value={
//                           editForm.type
//                         }
//                         onChange={(e) =>
//                           handleEditChange(
//                             "type",
//                             e.target.value
//                           )
//                         }
//                         className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
//                       />
//                     </div>
//                   </div>

//                   {/* AMOUNT */}

//                   <div>
//                     <label className="mb-2 block text-sm font-semibold text-slate-600">
//                       Fine Amount
//                     </label>

//                     <div className="relative">
//                       <IndianRupee
//                         size={17}
//                         className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                       />

//                       <input
//                         type="number"
//                         value={
//                           editForm.amount
//                         }
//                         onChange={(e) =>
//                           handleEditChange(
//                             "amount",
//                             e.target.value
//                           )
//                         }
//                         className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
//                       />
//                     </div>
//                   </div>

//                   {/* DUE DATE */}

//                   <div>
//                     <label className="mb-2 block text-sm font-semibold text-slate-600">
//                       Due Date
//                     </label>

//                     <div className="relative">
//                       <CalendarDays
//                         size={17}
//                         className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                       />

//                       <input
//                         type="date"
//                         value={
//                           editForm.due
//                         }
//                         onChange={(e) =>
//                           handleEditChange(
//                             "due",
//                             e.target.value
//                           )
//                         }
//                         className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
//                       />
//                     </div>
//                   </div>

//                   {/* STATUS */}

//                   <div>
//                     <label className="mb-2 block text-sm font-semibold text-slate-600">
//                       Status
//                     </label>

//                     <select
//                       value={
//                         editForm.status
//                       }
//                       onChange={(e) =>
//                         handleEditChange(
//                           "status",
//                           e.target.value
//                         )
//                       }
//                       className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
//                     >
//                       <option value="Pending">
//                         Pending
//                       </option>

//                       <option value="Unpaid">
//                         Unpaid
//                       </option>

//                       <option value="Paid">
//                         Paid
//                       </option>
//                     </select>
//                   </div>

//                   {/* PAID AMOUNT */}

//                   {editForm.status ===
//                     "Paid" && (
//                     <div>
//                       <label className="mb-2 block text-sm font-semibold text-slate-600">
//                         Paid Amount
//                       </label>

//                       <div className="relative">
//                         <IndianRupee
//                           size={17}
//                           className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                         />

//                         <input
//                           type="number"
//                           value={
//                             editForm.paidAmount
//                           }
//                           onChange={(e) =>
//                             handleEditChange(
//                               "paidAmount",
//                               e.target.value
//                             )
//                           }
//                           className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
//                         />
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* INFO */}

//                 <div className="mt-5 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
//                   <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600">
//                     <AlertTriangle size={17} />
//                   </div>

//                   <p className="text-xs leading-5 text-blue-700">
//                     Updating the challan will modify the
//                     existing record in your fleet data.
//                     Please verify the details before
//                     saving.
//                   </p>
//                 </div>

//                 {/* BUTTONS */}

//                 <div className="mt-6 flex justify-end gap-3">
//                   <button
//                     onClick={() =>
//                       setEditChallan(null)
//                     }
//                     className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     onClick={handleSaveEdit}
//                     className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
//                   >
//                     <Save size={17} />
//                     Save Changes
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ===================================================
//           DELETE MODAL
//       =================================================== */}

//       <AnimatePresence>
//         {deleteTarget && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
//             onClick={() =>
//               setDeleteTarget(null)
//             }
//           >
//             <motion.div
//               initial={{
//                 opacity: 0,
//                 scale: 0.95,
//                 y: 20,
//               }}
//               animate={{
//                 opacity: 1,
//                 scale: 1,
//                 y: 0,
//               }}
//               exit={{
//                 opacity: 0,
//                 scale: 0.95,
//                 y: 20,
//               }}
//               transition={{ duration: 0.25 }}
//               onClick={(e) =>
//                 e.stopPropagation()
//               }
//               className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
//             >
//               <div className="flex flex-col items-center text-center">
//                 <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
//                   <Trash2 size={26} />
//                 </div>

//                 <h3 className="mt-4 text-lg font-bold text-slate-800">
//                   Delete Challan?
//                 </h3>

//                 <p className="mt-2 text-sm leading-6 text-slate-500">
//                   Are you sure you want to delete this
//                   challan record? This action cannot be
//                   undone.
//                 </p>

//                 <div className="mt-4 w-full rounded-xl border border-red-100 bg-red-50 p-3 text-left">
//                   <div className="flex items-center gap-3">
//                     <ReceiptText
//                       size={18}
//                       className="text-red-500"
//                     />

//                     <div>
//                       <p className="text-sm font-semibold text-red-700">
//                         {deleteTarget.vehicle}
//                       </p>

//                       <p className="text-xs text-red-500">
//                         {deleteTarget.number}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-6 flex w-full gap-3">
//                   <button
//                     onClick={() =>
//                       setDeleteTarget(null)
//                     }
//                     className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
//                   >
//                     No, Keep It
//                   </button>

//                   <button
//                     onClick={handleDelete}
//                     className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-lg"
//                   >
//                     Yes, Delete
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// }