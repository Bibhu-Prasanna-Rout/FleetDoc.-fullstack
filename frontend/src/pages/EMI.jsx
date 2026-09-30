import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Search,
  CalendarDays,
  X,
  MoreVertical,
  Eye,
  CheckCircle2,
  Filter,
  Landmark,
  FileText,
  IndianRupee,
  Calendar,
  CreditCard,
  CircleDollarSign,
  Trash2,
  AlertTriangle,
  WalletCards,
  Banknote,
  Clock3,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";

import {
  useFleet,
  parseDate,
} from "../context/fleetContext";

/* =========================================================
   ANIMATION VARIANTS
========================================================= */

const containerVariants = {
  hidden: {
    opacity: 0,
  },

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
      ease: "easeOut",
    },
  },
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.88,
    y: 25,
  },

  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },

  exit: {
    opacity: 0,
    scale: 0.88,
    y: 25,
    transition: {
      duration: 0.2,
    },
  },
};

/* =========================================================
   SAFE DATE HELPERS

   IMPORTANT:
   Do NOT use new Date("YYYY-MM-DD") directly.
   That can cause timezone-related one-day reduction.
========================================================= */

const parseDateOnly = (value) => {
  if (!value || value === "-") {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }

    return new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate()
    );
  }

  const text = String(value).trim();

  /* YYYY-MM-DD */
  const isoMatch = text.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);

    const date = new Date(
      year,
      month,
      day
    );

    if (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    ) {
      return date;
    }
  }

  /* DD-MM-YYYY / DD/MM/YYYY */
  const dmyMatch = text.match(
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/
  );

  if (dmyMatch) {
    const day = Number(dmyMatch[1]);
    const month = Number(dmyMatch[2]) - 1;
    const year = Number(dmyMatch[3]);

    const date = new Date(
      year,
      month,
      day
    );

    if (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    ) {
      return date;
    }
  }

  /* Fallback for existing context-supported values */
  const parsed = parseDate(value);

  if (!parsed) {
    return null;
  }

  return new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate()
  );
};

const formatDateSafe = (value) => {
  if (!value) return "-";

  const date = parseDateOnly(value);

  if (!date) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const dateInputValue = (value) => {
  const date = parseDateOnly(value);

  if (!date) {
    return "";
  }

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
};

/* =========================================================
   EMI PAGE
========================================================= */

export default function EMI() {
  const {
    emis = [],
    loans = [],
    users = [],
    settings,
    deleteEMI,
    notify,
  } = useFleet();

  const nav = useNavigate();

  /* =======================================================
     USERS & ROLES / PERMISSIONS
  ======================================================= */

  const loggedInUserId =
    localStorage.getItem(
      "fleetdoc_user_id"
    );

  const loggedInUserEmail =
    localStorage.getItem(
      "fleetdoc_user_email"
    );

  const storedRole =
    localStorage.getItem(
      "fleetdoc_user_role"
    );

  const currentUser =
    users.find(
      (user) =>
        String(user.id) ===
        String(loggedInUserId)
    ) ||
    users.find(
      (user) =>
        user.email
          ?.toLowerCase()
          .trim() ===
        loggedInUserEmail
          ?.toLowerCase()
          .trim()
    ) ||
    null;

  /*
    Your AddUser.jsx currently uses "Finincer"
    while Settings.jsx uses "Finance".

    Normalize both to Finance so the permission
    system works correctly.
  */

  const currentUserRole =
    currentUser?.role ||
    storedRole ||
    "Admin";

  const permissionRole =
    currentUserRole === "Finincer"
      ? "Finance"
      : currentUserRole;

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
    };

  const canViewEMI =
    currentPermissions.view === true;

  const canAddEMI =
    currentPermissions.add === true;

  const canEditEMI =
    currentPermissions.edit === true;

  const canDeleteEMI =
    currentPermissions.delete === true;

  const canMarkPaid =
    currentPermissions.paid === true;

  /* =======================================================
     SEARCH / FILTER
  ======================================================= */

  const [q, setQ] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilter, setShowFilter] =
    useState(false);

  /* =======================================================
     ACTION MENU
  ======================================================= */

  const [openMenu, setOpenMenu] =
    useState(null);

  /* =======================================================
     DELETE
  ======================================================= */

  const [emiToDelete, setEmiToDelete] =
    useState(null);

  /* =======================================================
     CLOSE ACTION MENU OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        !event.target.closest(
          "[data-emi-action-menu]"
        )
      ) {
        setOpenMenu(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* =========================================================
     BASIC HELPERS
  ========================================================= */

  const getVehicle = (emi) => {
    return (
      emi?.vehicleNumber ||
      emi?.vehicle ||
      "-"
    );
  };

  const normalizeVehicleNumber = (
    value
  ) => {
    return String(value || "")
      .trim()
      .replace(/\s+/g, "")
      .toUpperCase();
  };

  const getRawBank = (emi) => {
    return (
      emi?.financerBank ||
      emi?.financierBank ||
      emi?.financer ||
      emi?.financier ||
      emi?.bank ||
      emi?.bankName ||
      ""
    );
  };

  const getRawLoanNumber = (emi) => {
    return (
      emi?.loanNumber ||
      emi?.loanNo ||
      emi?.loan_number ||
      ""
    );
  };

  const getAmount = (emi) => {
    return Number(
      emi?.emiAmount ??
        emi?.amount ??
        0
    );
  };

  const getDueDate = (emi) => {
    return (
      emi?.dueDate ||
      emi?.due ||
      emi?.emiDate ||
      emi?.startDate ||
      "-"
    );
  };

  const getStartDate = (emi) => {
    return (
      emi?.emiStartDate ||
      emi?.startDate ||
      emi?.loanStartDate ||
      emi?.start ||
      "-"
    );
  };

  const isPaid = (emi) => {
    return (
      emi?.status === "Paid" ||
      emi?.paid === true
    );
  };

  const getRelatedLoan = (emi) => {
    if (!emi) {
      return null;
    }

    const loanId =
      emi.loanId ??
      emi.loanID ??
      emi.loan_id;

    if (
      loanId !== undefined &&
      loanId !== null &&
      loanId !== ""
    ) {
      const byId = loans.find(
        (loan) =>
          String(loan.id) ===
          String(loanId)
      );

      if (byId) {
        return byId;
      }
    }

    const rawLoanNumber =
      getRawLoanNumber(emi);

    if (rawLoanNumber) {
      const normalizedLoan =
        String(rawLoanNumber)
          .trim()
          .replace(/\s+/g, "")
          .toUpperCase();

      const byLoanNumber =
        loans.find((loan) => {
          const loanNumber =
            loan.loanNumber ||
            loan.loanNo ||
            loan.loan_number ||
            "";

          return (
            String(loanNumber)
              .trim()
              .replace(/\s+/g, "")
              .toUpperCase() ===
            normalizedLoan
          );
        });

      if (byLoanNumber) {
        return byLoanNumber;
      }
    }

    const vehicle =
      normalizeVehicleNumber(
        getVehicle(emi)
      );

    if (vehicle) {
      const byVehicle =
        loans.find((loan) => {
          return (
            normalizeVehicleNumber(
              loan.vehicleNumber ||
                loan.vehicle
            ) === vehicle
          );
        });

      if (byVehicle) {
        return byVehicle;
      }
    }

    return null;
  };

  const getBank = (emi) => {
    const direct =
      getRawBank(emi);

    if (direct) {
      return direct;
    }

    const loan =
      getRelatedLoan(emi);

    if (!loan) {
      return "-";
    }

    return (
      loan.financerBank ||
      loan.financierBank ||
      loan.financer ||
      loan.financier ||
      loan.bank ||
      loan.bankName ||
      "-"
    );
  };

  const getLoanNumber = (emi) => {
    const direct =
      getRawLoanNumber(emi);

    if (direct) {
      return direct;
    }

    const loan =
      getRelatedLoan(emi);

    if (!loan) {
      return "-";
    }

    return (
      loan.loanNumber ||
      loan.loanNo ||
      loan.loan_number ||
      "-"
    );
  };

  /* =========================================================
     EMI DOCUMENT HELPERS

     Supports document data stored either on the EMI record
     or on its related loan.
========================================================= */

  const getDocumentSource = (emi) => {
    if (!emi) {
      return null;
    }

    const relatedLoan =
      getRelatedLoan(emi);

    const candidates = [
      emi,
      relatedLoan,
    ].filter(Boolean);

    for (const source of candidates) {
      const data =
        source.fileData ||
        source.documentData ||
        source.fileUrl ||
        source.documentUrl ||
        source.url ||
        source.file;

      if (data) {
        return {
          data,
          fileName:
            source.fileName ||
            source.documentName ||
            source.file ||
            "EMI Document",
          fileType:
            source.fileType ||
            source.documentType ||
            "",
        };
      }
    }

    return null;
  };

  const openEMIDocument = (row) => {
    setOpenMenu(null);

    if (!row) {
      notify(
        "EMI document is not available."
      );
      return;
    }

    /*
      Try the current/latest EMI first.
      If it has no document, check all EMI records.
      Finally check the related loan.
    */

    const candidates = [
      row.currentEMI,
      row.latestEMI,
      ...(row.emis || []),
    ].filter(Boolean);

    let documentSource = null;

    for (const emi of candidates) {
      documentSource =
        getDocumentSource(emi);

      if (documentSource) {
        break;
      }
    }

    if (!documentSource) {
      documentSource =
        getDocumentSource(
          row.relatedLoan
        );
    }

    if (!documentSource) {
      notify(
        "No EMI document has been uploaded for this loan."
      );
      return;
    }

    let documentData =
      documentSource.data;

    /*
      If the document is already a Blob/File,
      create a temporary browser URL.
    */

    if (
      documentData instanceof Blob
    ) {
      const blobUrl =
        URL.createObjectURL(
          documentData
        );

      const newWindow =
        window.open(
          blobUrl,
          "_blank",
          "noopener,noreferrer"
        );

      if (!newWindow) {
        URL.revokeObjectURL(
          blobUrl
        );

        notify(
          "Please allow pop-ups to open the EMI document."
        );

        return;
      }

      setTimeout(() => {
        URL.revokeObjectURL(
          blobUrl
        );
      }, 60000);

      return;
    }

    documentData =
      String(documentData).trim();

    if (!documentData) {
      notify(
        "EMI document data is empty."
      );
      return;
    }

    /*
      Normal URL:
        https://...
        blob:...
    */

    if (
      documentData.startsWith(
        "http://"
      ) ||
      documentData.startsWith(
        "https://"
      ) ||
      documentData.startsWith(
        "blob:"
      )
    ) {
      const newWindow =
        window.open(
          documentData,
          "_blank",
          "noopener,noreferrer"
        );

      if (!newWindow) {
        notify(
          "Please allow pop-ups to open the EMI document."
        );
      }

      return;
    }

    /*
      Data URL:
        data:application/pdf;base64,...
        data:image/png;base64,...

      Convert it into a Blob URL instead of directly
      navigating to the data URL.
    */

    if (
      documentData.startsWith(
        "data:"
      )
    ) {
      try {
        const commaIndex =
          documentData.indexOf(",");

        if (commaIndex === -1) {
          throw new Error(
            "Invalid data URL."
          );
        }

        const metadata =
          documentData.slice(
            5,
            commaIndex
          );

        const base64Data =
          documentData.slice(
            commaIndex + 1
          );

        let mimeType =
          documentSource.fileType ||
          "application/octet-stream";

        const extractedMime =
          metadata
            .split(";")[0]
            .trim();

        if (
          extractedMime &&
          extractedMime.includes("/")
        ) {
          mimeType =
            extractedMime;
        }

        const binaryString =
          atob(base64Data);

        const len =
          binaryString.length;

        const bytes =
          new Uint8Array(len);

        for (
          let i = 0;
          i < len;
          i++
        ) {
          bytes[i] =
            binaryString.charCodeAt(
              i
            );
        }

        const blob =
          new Blob(
            [bytes],
            {
              type: mimeType,
            }
          );

        const blobUrl =
          URL.createObjectURL(
            blob
          );

        const newWindow =
          window.open(
            blobUrl,
            "_blank",
            "noopener,noreferrer"
          );

        if (!newWindow) {
          URL.revokeObjectURL(
            blobUrl
          );

          notify(
            "Please allow pop-ups to open the EMI document."
          );

          return;
        }

        setTimeout(() => {
          URL.revokeObjectURL(
            blobUrl
          );
        }, 60000);

        return;
      } catch (error) {
        console.error(
          "EMI document open error:",
          error
        );

        notify(
          "Unable to open the EMI document."
        );

        return;
      }
    }

    /*
      Base64 without a data URL prefix.
    */

    try {
      const cleanBase64 =
        documentData
          .replace(/\s/g, "");

      const fileName =
        String(
          documentSource.fileName ||
            ""
        ).toLowerCase();

      let mimeType =
        documentSource.fileType ||
        "application/octet-stream";

      if (
        fileName.endsWith(".pdf")
      ) {
        mimeType =
          "application/pdf";
      } else if (
        fileName.endsWith(".png")
      ) {
        mimeType =
          "image/png";
      } else if (
        fileName.endsWith(".jpg") ||
        fileName.endsWith(".jpeg")
      ) {
        mimeType =
          "image/jpeg";
      }

      const binaryString =
        atob(cleanBase64);

      const len =
        binaryString.length;

      const bytes =
        new Uint8Array(len);

      for (
        let i = 0;
        i < len;
        i++
      ) {
        bytes[i] =
          binaryString.charCodeAt(i);
      }

      const blob =
        new Blob(
          [bytes],
          {
            type: mimeType,
          }
        );

      const blobUrl =
        URL.createObjectURL(
          blob
        );

      const newWindow =
        window.open(
          blobUrl,
          "_blank",
          "noopener,noreferrer"
        );

      if (!newWindow) {
        URL.revokeObjectURL(
          blobUrl
        );

        notify(
          "Please allow pop-ups to open the EMI document."
        );

        return;
      }

      setTimeout(() => {
        URL.revokeObjectURL(
          blobUrl
        );
      }, 60000);
    } catch (error) {
      console.error(
        "EMI document open error:",
        error
      );

      notify(
        "Unable to open the EMI document. Please check the uploaded file."
      );
    }
  };

  /* =========================================================
     GROUP EMI RECORDS VEHICLE-WISE

     One row = one vehicle.
========================================================= */

  const vehicleRows = useMemo(() => {
    const groups = new Map();

    emis.forEach((emi) => {
      const vehicle =
        normalizeVehicleNumber(
          getVehicle(emi)
        );

      if (
        !vehicle ||
        vehicle === "-"
      ) {
        return;
      }

      if (!groups.has(vehicle)) {
        groups.set(
          vehicle,
          []
        );
      }

      groups
        .get(vehicle)
        .push(emi);
    });

    const result = [];

    groups.forEach(
      (
        vehicleEmis,
        vehicleNumber
      ) => {
        const sorted = [
          ...vehicleEmis,
        ].sort((a, b) => {
          const dateA =
            parseDateOnly(
              getDueDate(a)
            );

          const dateB =
            parseDateOnly(
              getDueDate(b)
            );

          if (
            !dateA &&
            !dateB
          ) {
            return 0;
          }

          if (!dateA) {
            return 1;
          }

          if (!dateB) {
            return -1;
          }

          return (
            dateA.getTime() -
            dateB.getTime()
          );
        });

        const unpaid =
          sorted.filter(
            (emi) =>
              !isPaid(emi)
          );

        const currentEMI =
          unpaid.length > 0
            ? unpaid[
                unpaid.length - 1
              ]
            : sorted[
                sorted.length - 1
              ];

        const relatedLoan =
          getRelatedLoan(
            currentEMI
          ) ||
          getRelatedLoan(
            sorted[0]
          );

        const lastEMI =
          sorted[
            sorted.length - 1
          ];

        const active =
          unpaid.length > 0;

        result.push({
          id: `vehicle-${vehicleNumber}`,

          vehicleNumber,

          emis: sorted,

          currentEMI,

          latestEMI: lastEMI,

          relatedLoan,

          /*
            LOAN STARTING DATE

            Always prefer the actual loan EMI start date.
            The previous expression mixed || with the ternary
            operator, which could make JavaScript select the EMI
            installment date instead of the loan start date.
          */
          startingDate:
            relatedLoan?.emiStartDate ||
            relatedLoan?.startDate ||
            relatedLoan?.loanStartDate ||
            relatedLoan?.start ||
            currentEMI?.emiStartDate ||
            currentEMI?.startDate ||
            currentEMI?.loanStartDate ||
            currentEMI?.start ||
            getStartDate(sorted[0]),

          /*
            LOAN CLOSING DATE

            This is the loan/EMI schedule closing date, NOT the
            current installment's due date. If an older record does
            not contain a closing date, fall back to the last EMI
            due date in the schedule.
          */
          closingDate:
            relatedLoan?.emiClosingDate ||
            relatedLoan?.emiEndDate ||
            relatedLoan?.closingDate ||
            relatedLoan?.endDate ||
            currentEMI?.emiClosingDate ||
            currentEMI?.emiEndDate ||
            currentEMI?.closingDate ||
            currentEMI?.endDate ||
            getDueDate(lastEMI),

          bank:
            getBank(
              currentEMI
            ) !== "-"
              ? getBank(
                  currentEMI
                )
              : getBank(
                  sorted[0]
                ),

          loanNumber:
            getLoanNumber(
              currentEMI
            ) !== "-"
              ? getLoanNumber(
                  currentEMI
                )
              : getLoanNumber(
                  sorted[0]
                ),

          dueDate:
            getDueDate(
              currentEMI
            ),

          amount:
            getAmount(
              currentEMI
            ),

          status: active
            ? "Active"
            : "Closed",

          unpaidCount:
            unpaid.length,

          totalCount:
            sorted.length,
        });
      }
    );

    return result.sort(
      (a, b) =>
        a.vehicleNumber.localeCompare(
          b.vehicleNumber
        )
    );
  }, [emis, loans]);

  /* =========================================================
     FILTER VEHICLE ROWS
  ========================================================= */

  const rows = useMemo(() => {
    const search =
      q.trim().toLowerCase();

    const from =
      fromDate
        ? parseDateOnly(fromDate)
        : null;

    const to =
      toDate
        ? parseDateOnly(toDate)
        : null;

    if (from) {
      from.setHours(
        0,
        0,
        0,
        0
      );
    }

    if (to) {
      to.setHours(
        23,
        59,
        59,
        999
      );
    }

    return vehicleRows.filter(
      (row) => {
        const text =
          `${row.vehicleNumber} ${row.bank} ${row.loanNumber}`
            .toLowerCase();

        const matchSearch =
          !search ||
          text.includes(search);

        const due =
          parseDateOnly(
            row.dueDate
          );

        let matchFrom = true;
        let matchTo = true;

        if (from) {
          matchFrom =
            due && due >= from;
        }

        if (to) {
          matchTo =
            due && due <= to;
        }

        return (
          matchSearch &&
          matchFrom &&
          matchTo
        );
      }
    );
  }, [
    vehicleRows,
    q,
    fromDate,
    toDate,
  ]);

  /* =========================================================
     TOTALS
  ========================================================= */

  const totalEMIAmount =
    useMemo(() => {
      return emis.reduce(
        (sum, emi) =>
          sum + getAmount(emi),
        0
      );
    }, [emis]);

  const totalPaidAmount =
    useMemo(() => {
      return emis.reduce(
        (sum, emi) =>
          isPaid(emi)
            ? sum + getAmount(emi)
            : sum,
        0
      );
    }, [emis]);

  const totalExistingAmount =
    Math.max(
      totalEMIAmount -
        totalPaidAmount,
      0
    );

  const paidPercentage =
    useMemo(() => {
      if (
        totalEMIAmount <= 0
      ) {
        return 0;
      }

      return Math.min(
        100,
        Math.round(
          (totalPaidAmount /
            totalEMIAmount) *
            100
        )
      );
    }, [
      totalEMIAmount,
      totalPaidAmount,
    ]);

  /* =========================================================
     ACTIVE VEHICLE LOANS
  ========================================================= */

  const activeVehicleLoans =
    useMemo(() => {
      return vehicleRows.filter(
        (row) =>
          row.status ===
          "Active"
      ).length;
    }, [vehicleRows]);

  /* =========================================================
     PENDING EMI THIS MONTH
  ========================================================= */

  const pendingEMIThisMonth =
    useMemo(() => {
      const today =
        new Date();

      const year =
        today.getFullYear();

      const month =
        today.getMonth();

      return emis.filter(
        (emi) => {
          if (isPaid(emi)) {
            return false;
          }

          const due =
            parseDateOnly(
              getDueDate(emi)
            );

          if (!due) {
            return false;
          }

          return (
            due.getFullYear() ===
              year &&
            due.getMonth() ===
              month
          );
        }
      ).length;
    }, [emis]);

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {
    setQ("");
    setFromDate("");
    setToDate("");
  };

  /* =========================================================
     VIEW VEHICLE EMI DETAILS
  ========================================================= */

  const handleView = (row) => {
    setOpenMenu(null);

    nav(
      `/emi/details/${encodeURIComponent(
        row.vehicleNumber
      )}`
    );
  };

  /* =========================================================
     DELETE VEHICLE EMI SCHEDULE
  ========================================================= */

  const handleDeleteClick = (
    row
  ) => {
    /*
      Permission protection:
      Even if this function is triggered programmatically,
      deletion cannot proceed without Delete permission.
    */

    if (!canDeleteEMI) {
      setOpenMenu(null);

      if (notify) {
        notify(
          "You do not have permission to delete EMI records."
        );
      }

      return;
    }

    setEmiToDelete(row);
    setOpenMenu(null);
  };

  const confirmDelete = async () => {
    /*
      Second permission check immediately before the actual
      delete operation.
    */

    if (!canDeleteEMI) {
      setEmiToDelete(null);

      if (notify) {
        notify(
          "You do not have permission to delete EMI records."
        );
      }

      return;
    }

    if (!emiToDelete) {
      return;
    }

    const records = Array.isArray(emiToDelete.emis)
      ? emiToDelete.emis.filter((emi) => emi?.id !== undefined && emi?.id !== null)
      : [];

    if (records.length === 0) {
      notify(
        "No valid EMI records were found to delete.",
        "error"
      );
      setEmiToDelete(null);
      return;
    }

    let deleted = 0;

    try {
      /*
        deleteEMI() is asynchronous because it calls the backend.
        The previous code called it inside forEach without awaiting
        the returned Promise, so the UI could close the dialog and
        report success before the DELETE requests completed.

        Delete sequentially so each backend deletion and its data
        refresh completes before the next record is removed. This
        also avoids multiple concurrent refreshes racing with each
        other.
      */
      for (const emi of records) {
        await deleteEMI(emi.id);
        deleted += 1;
      }

      notify(
        `${emiToDelete.vehicleNumber} EMI records deleted successfully.`
      );
    } catch (error) {
      console.error("EMI delete error:", error);

      if (deleted > 0) {
        notify(
          `${deleted} of ${records.length} EMI records were deleted. The remaining records could not be deleted.`,
          "error"
        );
      } else {
        notify(
          error?.message ||
            "Unable to delete EMI records.",
          "error"
        );
      }
    } finally {
      setEmiToDelete(null);
    }
  };

  const cancelDelete = () => {
    setEmiToDelete(null);
  };

  /* =========================================================
     VIEW PERMISSION GUARD
========================================================= */

  if (!canViewEMI) {
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
        className="
          flex
          min-h-[60vh]
          items-center
          justify-center
          p-6
        "
      >
        <div
          className="
            w-full
            max-w-md
            rounded-3xl
            border
            border-slate-100
            bg-white
            p-8
            text-center
            shadow-sm
          "
        >
          <div
            className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-red-50
              text-red-500
            "
          >
            <ShieldCheck
              size={30}
            />
          </div>

          <h2
            className="
              mt-5
              text-xl
              font-bold
              text-slate-800
            "
          >
            Access Restricted
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-500
            "
          >
            You do not have permission
            to view EMI management.
          </p>
        </div>
      </motion.div>
    );
  }

  /* =========================================================
     MONEY
  ========================================================= */

  const money = (value) =>
    `₹ ${Number(
      value || 0
    ).toLocaleString("en-IN")}`;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pb-8"
    >
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <motion.div
        variants={itemVariants}
      >
        <PageHeader
          title={
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 transition duration-300 hover:scale-110 hover:rotate-3">
                <CreditCard
                  size={23}
                  strokeWidth={2.3}
                />
              </div>

              <div>
                <span className="block text-2xl font-bold text-slate-800">
                  EMI Management
                </span>
              </div>
            </div>
          }
          subtitle="Track vehicle loans and monthly EMI payments."
          action={
            canAddEMI ? (
              <motion.button
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                onClick={() =>
                  nav(
                    "/emi/add-loan"
                  )
                }
                className="btn-primary"
              >
                <Plus size={17} />
                Add Loan
              </motion.button>
            ) : null
          }
        />
      </motion.div>

      {/* =====================================================
          HERO
      ===================================================== */}

      <motion.div
        variants={itemVariants}
        whileHover={{
          y: -2,
        }}
        className="
          relative
          mt-6
          overflow-hidden
          rounded-3xl
          border
          border-blue-100
          bg-gradient-to-r
          from-blue-50
          via-white
          to-indigo-50
          p-6
          shadow-sm
        "
      >
        <motion.div
          animate={{
            scale: [
              1,
              1.08,
              1,
            ],
            opacity: [
              0.25,
              0.4,
              0.25,
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
          className="
            absolute
            -right-16
            -top-16
            h-52
            w-52
            rounded-full
            bg-blue-200
            blur-3xl
          "
        />

        <motion.div
          animate={{
            scale: [
              1,
              1.12,
              1,
            ],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
          }}
          className="
            absolute
            -bottom-16
            left-1/3
            h-40
            w-40
            rounded-full
            bg-indigo-200/40
            blur-3xl
          "
        />

        <div
          className="
            relative
            flex
            flex-col
            justify-between
            gap-6
            md:flex-row
            md:items-center
          "
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{
                y: [
                  0,
                  -5,
                  0,
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                flex
                h-16
                w-16
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-blue-500
                to-indigo-600
                text-white
                shadow-xl
                shadow-blue-200
              "
            >
              <WalletCards
                size={30}
              />
            </motion.div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Fleet Loan Management
              </p>

              <h2
                className="
                  mt-1
                  text-2xl
                  font-bold
                  text-slate-800
                "
              >
                Manage Your EMIs
              </h2>

              <p
                className="
                  mt-2
                  max-w-xl
                  text-sm
                  text-slate-500
                "
              >
                Monitor vehicle loans,
                monthly installments,
                payments and remaining
                amounts from one place.
              </p>
            </div>
          </div>

          <div
            className="
              min-w-[210px]
              rounded-2xl
              border
              border-white
              bg-white/70
              p-4
              shadow-sm
              backdrop-blur
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total EMI Records
                </p>

                <motion.p
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                  className="
                    mt-1
                    text-3xl
                    font-bold
                    text-blue-600
                  "
                >
                  {emis.length}
                </motion.p>
              </div>

              <div
                className="
                  rounded-xl
                  bg-blue-50
                  p-3
                  text-blue-600
                "
              >
                <Banknote
                  size={22}
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[11px] font-medium text-slate-400">
                <span>
                  Paid Progress
                </span>

                <span>
                  {paidPercentage}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${paidPercentage}%`,
                  }}
                  transition={{
                    duration: 1,
                    ease: "easeOut",
                  }}
                  className="
                    h-full
                    rounded-full
                    bg-gradient-to-r
                    from-blue-500
                    to-indigo-600
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <motion.div
        variants={containerVariants}
        className="
          mt-6
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <StatCard
          title="Total Existing Amount"
          value={money(
            totalExistingAmount
          )}
          note="Remaining EMI amount"
          icon={CircleDollarSign}
          bg="bg-blue-50"
          color="text-blue-600"
        />

        <StatCard
          title="Total Paid Amount"
          value={money(
            totalPaidAmount
          )}
          note={`${paidPercentage}% of total EMI`}
          icon={CheckCircle2}
          bg="bg-emerald-50"
          color="text-emerald-600"
        />

        <StatCard
          title="Active Vehicle Loans"
          value={
            activeVehicleLoans
          }
          note="Currently active loans"
          icon={CreditCard}
          bg="bg-violet-50"
          color="text-violet-600"
        />

        <StatCard
          title="Pending EMI This Month"
          value={
            pendingEMIThisMonth
          }
          note="Requires attention"
          icon={CalendarDays}
          bg="bg-amber-50"
          color="text-amber-600"
        />
      </motion.div>

      {/* =====================================================
          EMI RECORDS
      ===================================================== */}

      <motion.div
        variants={itemVariants}
        className="
          mt-6
          overflow-hidden
          rounded-2xl
          border
          border-slate-100
          bg-white
          shadow-sm
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4
            border-b
            border-slate-100
            p-5
            md:flex-row
            md:items-center
            md:justify-between
          "
        >
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
                <CreditCard
                  size={20}
                />
              </div>

              <h3
                className="
                  text-lg
                  font-bold
                  text-slate-800
                "
              >
                EMI Records
              </h3>
            </div>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              View and manage all
              vehicle EMI payments.
            </p>
          </div>

          {/* SEARCH */}

          <div
            className="
              relative
              w-full
              md:w-80
            "
          >
            <Search
              size={18}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              value={q}
              onChange={(e) =>
                setQ(
                  e.target.value
                )
              }
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                py-2.5
                pl-10
                pr-10
                text-sm
                outline-none
                transition
                duration-300
                focus:border-blue-400
                focus:bg-white
                focus:ring-4
                focus:ring-blue-50
              "
              placeholder="
                Search vehicle, bank or loan...
              "
            />

            {q && (
              <button
                type="button"
                onClick={() =>
                  setQ("")
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                  transition
                  hover:text-slate-700
                "
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* TOOLBAR */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-100
            bg-slate-50/40
            px-5
            py-3
          "
        >
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock3
              size={15}
            />

            <span>
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {rows.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {vehicleRows.length}
              </span>{" "}
              vehicles
            </span>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              whileHover={{
                y: -1,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={() =>
                setShowFilter(
                  (previous) =>
                    !previous
                )
              }
              className={`
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                px-4
                py-2
                text-sm
                font-medium
                transition
                ${
                  showFilter ||
                  fromDate ||
                  toDate
                    ? `
                      border-blue-200
                      bg-blue-50
                      text-blue-700
                    `
                    : `
                      border-slate-200
                      bg-white
                      text-slate-600
                      hover:bg-slate-50
                    `
                }
              `}
            >
              <Filter
                size={16}
              />

              Filter

              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${
                  showFilter
                    ? "rotate-180"
                    : ""
                }`}
              />

              {(fromDate ||
                toDate) && (
                <span
                  className="
                    rounded-full
                    bg-blue-600
                    px-2
                    py-0.5
                    text-[10px]
                    text-white
                  "
                >
                  1
                </span>
              )}
            </motion.button>

            {(q ||
              fromDate ||
              toDate) && (
              <motion.button
                type="button"
                whileHover={{
                  rotate: 90,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                onClick={
                  clearFilters
                }
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  p-2
                  text-slate-500
                  transition
                  hover:bg-slate-100
                  hover:text-slate-700
                "
                title="Clear filters"
              >
                <X size={17} />
              </motion.button>
            )}
          </div>
        </div>

        {/* FILTER PANEL */}

        <AnimatePresence>
          {showFilter && (
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
              className="
                overflow-hidden
                border-b
                border-slate-100
                bg-slate-50/70
              "
            >
              <div className="p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <motion.div
                    initial={{
                      opacity: 0,
                      x: -18,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                    whileHover={{
                      y: -2,
                    }}
                  >
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      From Date
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={18}
                        className="
                          pointer-events-none
                          absolute
                          left-3
                          top-1/2
                          -translate-y-1/2
                          text-slate-400
                        "
                      />

                      <input
                        type="date"
                        value={
                          fromDate
                        }
                        onChange={(e) =>
                          setFromDate(
                            e.target.value
                          )
                        }
                        className="
                          input
                          w-full
                          pl-10
                        "
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{
                      opacity: 0,
                      x: 18,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: 0.05,
                    }}
                    whileHover={{
                      y: -2,
                    }}
                  >
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      To Date
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={18}
                        className="
                          pointer-events-none
                          absolute
                          left-3
                          top-1/2
                          -translate-y-1/2
                          text-slate-400
                        "
                      />

                      <input
                        type="date"
                        value={toDate}
                        min={
                          fromDate ||
                          undefined
                        }
                        onChange={(e) =>
                          setToDate(
                            e.target.value
                          )
                        }
                        className="
                          input
                          w-full
                          pl-10
                        "
                      />
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 6,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.3,
                    delay: 0.1,
                  }}
                  className="mt-3 flex items-center gap-2 text-xs text-slate-500"
                >
                  <CalendarDays
                    size={14}
                  />

                  Date filter applies
                  only to EMI due date.
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="overflow-x-auto">
          <table
            className="
              w-full
              min-w-[1000px]
              text-sm
            "
          >
            <thead
              className="
                border-b
                border-slate-100
                bg-slate-50
                text-left
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-slate-500
              "
            >
              <tr>
                <th className="px-6 py-4">
                  Vehicle
                </th>

                <th>
                  Financer Bank
                </th>

                <th>
                  Loan No.
                </th>

                <th>
                  Starting Date
                </th>

                <th>
                  Closing Date
                </th>

                <th>
                  EMI Amount
                </th>

                <th>
                  Status
                </th>

                <th className="px-6 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence>
                {rows.map(
                  (
                    row,
                    index
                  ) => {
                    const active =
                      row.status ===
                      "Active";

                    return (
                      <motion.tr
                        key={row.id}
                        initial={{
                          opacity: 0,
                          y: 12,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          x: -30,
                          height: 0,
                        }}
                        transition={{
                          delay:
                            index *
                            0.035,
                          duration:
                            0.3,
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

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
                              <CreditCard
                                size={19}
                              />
                            </div>

                            <div>
                              <div
                                className="
                                  font-semibold
                                  text-base
                                  text-blue-700
                                "
                              >
                                {
                                  row.vehicleNumber
                                }
                              </div>

                              <div className="mt-0.5 text-xs text-slate-400">
                                {
                                  row.totalCount
                                }{" "}
                                EMI
                                {row.totalCount !==
                                1
                                  ? "s"
                                  : ""}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* BANK */}

                        <td>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Landmark
                              size={15}
                              className="text-slate-400"
                            />

                            <span className="font-medium">
                              {row.bank}
                            </span>
                          </div>
                        </td>

                        {/* LOAN NUMBER */}

                        <td>
                          <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 font-medium text-slate-600">
                            {
                              row.loanNumber
                            }
                          </span>
                        </td>

                        {/* STARTING DATE */}

                        <td>
                          <div className="flex items-center gap-2 text-slate-600">
                            <CalendarDays
                              size={15}
                              className="text-slate-400"
                            />

                            <span>
                              {formatDateSafe(
                                row.startingDate
                              )}
                            </span>
                          </div>
                        </td>

                        {/* CLOSING DATE */}

                        <td>
                          <div className="flex items-center gap-2 text-slate-600">
                            <CalendarDays
                              size={15}
                              className="text-slate-400"
                            />

                            <span>
                              {formatDateSafe(
                                row.closingDate
                              )}
                            </span>
                          </div>
                        </td>

                        {/* AMOUNT */}

                        <td>
                          <div className="flex items-center gap-1 font-bold text-slate-700">
                            <IndianRupee
                              size={15}
                            />

                            {Number(
                              row.amount ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </div>
                        </td>

                        {/* STATUS */}

                        <td>
                          {active ? (
                            <span
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-full
                                bg-blue-50
                                px-2.5
                                py-1
                                text-xs
                                font-semibold
                                text-blue-700
                              "
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />

                              Active
                            </span>
                          ) : (
                            <span
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-full
                                bg-emerald-50
                                px-2.5
                                py-1
                                text-xs
                                font-semibold
                                text-emerald-700
                              "
                            >
                              <CheckCircle2
                                size={13}
                              />

                              Closed
                            </span>
                          )}
                        </td>

                        {/* ACTION */}

                        <td className="px-6 py-4">
                          <div
                            className="
                              relative
                              flex
                              justify-center
                            "
                            data-emi-action-menu
                          >
                            <motion.button
                              whileHover={{
                                scale: 1.08,
                              }}
                              whileTap={{
                                scale: 0.9,
                              }}
                              type="button"
                              onClick={() =>
                                setOpenMenu(
                                  openMenu ===
                                    row.id
                                    ? null
                                    : row.id
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
                              <MoreVertical
                                size={18}
                              />
                            </motion.button>

                            <AnimatePresence>
                              {openMenu ===
                                row.id && (
                                <motion.div
                                  initial={{
                                    opacity: 0,
                                    scale: 0.92,
                                    y: -6,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                  }}
                                  exit={{
                                    opacity: 0,
                                    scale: 0.92,
                                    y: -6,
                                  }}
                                  transition={{
                                    duration:
                                      0.16,
                                  }}
                                  className="
                                    absolute
                                    right-0
                                    top-11
                                    z-40
                                    w-44
                                    overflow-hidden
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    p-1.5
                                    shadow-xl
                                  "
                                >
                                  {/* VIEW */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleView(
                                        row
                                      )
                                    }
                                    className="
                                      flex
                                      w-full
                                      items-center
                                      gap-3
                                      rounded-lg
                                      px-3
                                      py-2.5
                                      text-left
                                      text-sm
                                      font-medium
                                      text-slate-600
                                      transition
                                      hover:bg-blue-50
                                      hover:text-blue-600
                                    "
                                  >
                                    <Eye
                                      size={16}
                                    />

                                    View Details
                                  </button>

                                  {/* DOCUMENT */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEMIDocument(
                                        row
                                      )
                                    }
                                    className="
                                      mt-1
                                      flex
                                      w-full
                                      items-center
                                      gap-3
                                      rounded-lg
                                      border-t
                                      border-slate-100
                                      px-3
                                      py-2.5
                                      text-left
                                      text-sm
                                      font-medium
                                      text-slate-600
                                      transition
                                      hover:bg-blue-50
                                      hover:text-blue-600
                                    "
                                  >
                                    <FileText
                                      size={16}
                                    />

                                    EMI Documents
                                  </button>

                                  {/* DELETE */}

                                  {canDeleteEMI && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteClick(
                                          row
                                        )
                                      }
                                      className="
                                        mt-1
                                        flex
                                        w-full
                                        items-center
                                        gap-3
                                        rounded-lg
                                        border-t
                                        border-slate-100
                                        px-3
                                        py-2.5
                                        text-left
                                        text-sm
                                        font-medium
                                        text-red-600
                                        transition
                                        hover:bg-red-50
                                      "
                                    >
                                      <Trash2
                                        size={16}
                                      />

                                      Delete
                                    </button>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  }
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* EMPTY STATE */}

        {rows.length === 0 && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="
              flex
              flex-col
              items-center
              justify-center
              py-16
              text-center
            "
          >
            <motion.div
              animate={{
                y: [
                  0,
                  -5,
                  0,
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
              }}
              className="
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-3xl
                bg-slate-100
                text-slate-400
              "
            >
              <CreditCard
                size={34}
              />
            </motion.div>

            <h3
              className="
                mt-5
                text-lg
                font-bold
                text-slate-700
              "
            >
              No EMI Records Found
            </h3>

            <p
              className="
                mt-2
                text-sm
                text-slate-400
              "
            >
              {q ||
              fromDate ||
              toDate
                ? "Try changing your search or date filter."
                : "Start by adding your first vehicle loan."}
            </p>

            {!q &&
              !fromDate &&
              !toDate &&
              canAddEMI && (
                <motion.button
                  whileHover={{
                    scale: 1.03,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={() =>
                    nav(
                      "/emi/add-loan"
                    )
                  }
                  className="
                    mt-5
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-blue-600
                    to-indigo-600
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-blue-100
                  "
                >
                  <Plus
                    size={17}
                  />

                  Add First Loan
                </motion.button>
              )}
          </motion.div>
        )}
      </motion.div>

      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      <AnimatePresence>
        {emiToDelete && (
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
            onClick={cancelDelete}
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-slate-900/60
              p-4
              backdrop-blur-sm
            "
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) =>
                e.stopPropagation()
              }
              className="
                w-full
                max-w-md
                overflow-hidden
                rounded-3xl
                bg-white
                shadow-2xl
              "
            >
              <div
                className="
                  relative
                  overflow-hidden
                  bg-gradient-to-br
                  from-red-50
                  via-white
                  to-orange-50
                  p-7
                  text-center
                "
              >
                <motion.div
                  initial={{
                    scale: 0,
                    rotate: -20,
                  }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                  }}
                  className="
                    mx-auto
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-full
                    bg-red-50
                    text-red-500
                    shadow-sm
                  "
                >
                  <Trash2
                    size={34}
                  />
                </motion.div>

                <h2
                  className="
                    mt-5
                    text-xl
                    font-bold
                    text-slate-800
                  "
                >
                  Delete EMI Records?
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  Are you sure you want
                  to permanently delete
                  all EMI records for this
                  vehicle?
                </p>
              </div>

              <div className="px-6">
                <div
                  className="
                    rounded-2xl
                    border
                    border-red-100
                    bg-red-50/60
                    p-4
                  "
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-400">
                        Vehicle Number
                      </p>

                      <p className="mt-1 font-semibold text-slate-700">
                        {
                          emiToDelete.vehicleNumber
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Loan Number
                      </p>

                      <p className="mt-1 font-semibold text-slate-700">
                        {
                          emiToDelete.loanNumber
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        EMI Records
                      </p>

                      <p className="mt-1 font-semibold text-slate-700">
                        {
                          emiToDelete.totalCount
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Status
                      </p>

                      <p className="mt-1 font-semibold text-slate-700">
                        {
                          emiToDelete.status
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-4 text-center">
                  <p className="text-xs font-medium text-red-500">
                    This action cannot be
                    undone.
                  </p>
                </div>
              </div>

              <div
                className="
                  flex
                  gap-3
                  border-t
                  border-slate-100
                  bg-slate-50/70
                  px-6
                  py-4
                "
              >
                <motion.button
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  type="button"
                  onClick={
                    cancelDelete
                  }
                  className="
                    flex-1
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-slate-700
                    transition
                    hover:bg-slate-100
                  "
                >
                  No, Cancel
                </motion.button>

                <motion.button
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  type="button"
                  onClick={
                    confirmDelete
                  }
                  className="
                    inline-flex
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-red-600
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-red-100
                    transition
                    hover:bg-red-700
                  "
                >
                  <Trash2
                    size={16}
                  />

                  Yes, Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  note,
  icon: Icon,
  bg,
  color,
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        y: -5,
        scale: 1.01,
      }}
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-slate-100
        bg-white
        p-5
        shadow-sm
        transition
        hover:shadow-xl
      "
    >
      <div
        className={`
          absolute
          -right-6
          -top-6
          h-24
          w-24
          rounded-full
          ${bg}
          opacity-70
          transition
          duration-500
          group-hover:scale-150
        `}
      />

      <div
        className="
          relative
          flex
          items-center
          justify-between
        "
      >
        <div>
          <p
            className="
              text-sm
              font-medium
              text-slate-500
            "
          >
            {title}
          </p>

          <motion.h3
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.4,
            }}
            className="
              mt-2
              text-3xl
              font-bold
              text-slate-800
            "
          >
            {value}
          </motion.h3>

          <p
            className={`
              mt-2
              text-xs
              font-semibold
              ${color}
            `}
          >
            {note}
          </p>
        </div>

        <div
          className={`
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            ${bg}
            ${color}
            shadow-sm
            transition
            duration-300
            group-hover:scale-110
            group-hover:rotate-3
          `}
        >
          <Icon size={25} />
        </div>
      </div>

      <div
        className={`
          absolute
          bottom-0
          left-0
          h-1
          w-0
          ${color.replace(
            "text-",
            "bg-"
          )}
          transition-all
          duration-500
          group-hover:w-full
        `}
      />
    </motion.div>
  );
}
