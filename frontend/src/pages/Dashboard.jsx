import {
  Truck,
  FileText,
  AlertTriangle,
  CircleX,
  CreditCard,
  ReceiptText,
  Eye,
  ArrowRight,
  Bell,
  CalendarDays,
  UserRound,
} from "lucide-react";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";

import {
  useFleet,
  getExpiryStatus,
  getDaysLeft,
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
    y: 25,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};


/* =========================================================
   RENEWED DOCUMENT HELPER

   A document can be marked as Renewed by any of the
   renewal fields used by FleetContext.

   Supported:
   status: "Renewed"
   documentStatus: "Renewed"
   renewalStatus: "Renewed"
   isRenewed: true
========================================================= */

const isDocumentRenewed = (document) => {

  if (!document) {
    return false;
  }


  return (
    String(document.status || "")
      .trim()
      .toLowerCase() === "renewed" ||

    String(document.documentStatus || "")
      .trim()
      .toLowerCase() === "renewed" ||

    String(document.renewalStatus || "")
      .trim()
      .toLowerCase() === "renewed" ||

    document.isRenewed === true
  );

};


/* =========================================================
   DOCUMENT STATUS HELPER

   Renewed documents always return Renewed.

   Other documents continue using the existing expiry
   status calculation.
========================================================= */

const getDashboardDocumentStatus = (
  document,
  reminderDays
) => {

  if (isDocumentRenewed(document)) {
    return "Renewed";
  }


  return getExpiryStatus(
    document?.expiry,
    reminderDays
  );

};


/* =========================================================
   VEHICLE RC STATUS FUNCTION

   This function checks the Registration Certificate document
   and returns the actual vehicle status.

   Active RC     -> Active
   Inactive RC   -> Inactive
   Expired RC    -> Inactive

   Renewed RC documents are ignored because they are historical
   documents. The current RC document should determine the
   vehicle status.
========================================================= */

const getVehicleRCStatus = (
  vehicle,
  documents,
  reminderDays
) => {

  if (!vehicle) {
    return "Inactive";
  }


  /* =======================================================
     FIND CURRENT RC DOCUMENT FOR THIS VEHICLE

     Renewed RC documents are excluded.
  ======================================================= */

  const rcDocument = documents.find((document) => {

    /* -------------------------------------------------------
       Ignore historical/renewed documents
    ------------------------------------------------------- */

    if (isDocumentRenewed(document)) {
      return false;
    }


    const documentType =
      document.type
        ?.toLowerCase()
        .trim();

    const isRC =
      documentType === "registration certificate" ||
      documentType === "rc" ||
      documentType === "registration";


    const sameVehicle =

      document.vehicleId === vehicle.id ||

      document.vehicle === vehicle.number ||

      document.vehicleNumber === vehicle.number;


    return isRC && sameVehicle;

  });


  /* =======================================================
     IF RC DOCUMENT DOES NOT EXIST
  ======================================================= */

  if (!rcDocument) {

    return "Inactive";

  }


  /* =======================================================
     CHECK EXPLICIT DOCUMENT STATUS
  ======================================================= */

  if (rcDocument.status) {

    const documentStatus =
      rcDocument.status
        .toLowerCase()
        .trim();


    if (
      documentStatus === "inactive" ||
      documentStatus === "expired"
    ) {

      return "Inactive";

    }


    if (documentStatus === "active") {

      return "Active";

    }

  }


  /* =======================================================
     CHECK RC EXPIRY STATUS
  ======================================================= */

  if (rcDocument.expiry) {

    const expiryStatus =
      getExpiryStatus(
        rcDocument.expiry,
        reminderDays
      );


    if (expiryStatus === "Expired") {

      return "Inactive";

    }

  }


  /* =======================================================
     DEFAULT ACTIVE
  ======================================================= */

  return "Active";

};


/* =========================================================
   DOCUMENT DATE HELPER

   Supports:
   YYYY-MM-DD
   DD-MM-YYYY
   DD/MM/YYYY
   YYYY/MM/DD
========================================================= */

const parseDashboardDate = (dateValue) => {

  if (!dateValue) {
    return null;
  }


  /* =======================================================
     ALREADY A DATE OBJECT
  ======================================================= */

  if (dateValue instanceof Date) {

    if (Number.isNaN(dateValue.getTime())) {
      return null;
    }

    return new Date(
      dateValue.getFullYear(),
      dateValue.getMonth(),
      dateValue.getDate()
    );

  }


  const value =
    String(dateValue)
      .trim();


  if (!value) {
    return null;
  }


  /* =======================================================
     YYYY-MM-DD
  ======================================================= */

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {

    const [
      year,
      month,
      day,
    ] = value
      .split("-")
      .map(Number);


    const date =
      new Date(
        year,
        month - 1,
        day
      );


    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {

      return null;

    }


    return date;

  }


  /* =======================================================
     DD-MM-YYYY
  ======================================================= */

  if (
    /^\d{2}-\d{2}-\d{4}$/.test(value)
  ) {

    const [
      day,
      month,
      year,
    ] = value
      .split("-")
      .map(Number);


    const date =
      new Date(
        year,
        month - 1,
        day
      );


    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {

      return null;

    }


    return date;

  }


  /* =======================================================
     DD/MM/YYYY
  ======================================================= */

  if (
    /^\d{2}\/\d{2}\/\d{4}$/.test(value)
  ) {

    const [
      day,
      month,
      year,
    ] = value
      .split("/")
      .map(Number);


    const date =
      new Date(
        year,
        month - 1,
        day
      );


    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {

      return null;

    }


    return date;

  }


  /* =======================================================
     YYYY/MM/DD
  ======================================================= */

  if (
    /^\d{4}\/\d{2}\/\d{2}$/.test(value)
  ) {

    const [
      year,
      month,
      day,
    ] = value
      .split("/")
      .map(Number);


    const date =
      new Date(
        year,
        month - 1,
        day
      );


    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {

      return null;

    }


    return date;

  }


  /* =======================================================
     FALLBACK
  ======================================================= */

  const parsedDate =
    new Date(value);


  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {

    return null;

  }


  return new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate()
  );

};


/* =========================================================
   DASHBOARD COMPONENT
========================================================= */

export default function Dashboard() {

  const navigate = useNavigate();


  /* =========================================================
     DOCUMENT STATUS FILTER

     Default:
     All Time
  ========================================================= */

  const [
    documentPeriod,
    setDocumentPeriod,
  ] = useState("All Time");


  /* =========================================================
     FLEET DATA
  ========================================================= */

  const {
    documents,
    emis,
    challans,
    vehicles,
    settings,
    users = [],
  } = useFleet();


  /* =========================================================
     REMINDER SETTINGS
  ========================================================= */

  const reminderDays =
    Number(settings?.reminderDays) || 10;

  const dashboardNotificationsEnabled =
    settings?.dashboardNotifications !== false;


  /* =========================================================
     LOGGED-IN USER
  ========================================================= */

  const loggedInUserId =
    localStorage.getItem("fleetdoc_user_id");

  const loggedInUserEmail =
    localStorage.getItem("fleetdoc_user_email");

  const loggedInUser =
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

  const displayUserName =
    loggedInUser?.name ||
    localStorage.getItem("fleetdoc_user_name") ||
    "User";

  const displayUserPhoto =
    loggedInUser?.photo ||
    "";


  /* =========================================================
     DOCUMENT CALCULATIONS
     
     IMPORTANT:
     Renewed documents are historical records and therefore
     must not be included in Active / Expiring / Expired
     calculations.
  ========================================================= */


  /* =========================================================
     ACTIVE DOCUMENTS
  ========================================================= */

  const activeDocs =
    documents.filter(
      (document) => {

        if (isDocumentRenewed(document)) {
          return false;
        }


        return (
          getExpiryStatus(
            document.expiry,
            reminderDays
          ) === "Active"
        );

      }
    ).length;


  /* =========================================================
     EXPIRING DOCUMENTS
     
     Renewed documents are excluded.
  ========================================================= */

  const expiringDocuments =
    documents.filter(
      (document) => {

        if (isDocumentRenewed(document)) {
          return false;
        }


        return (
          getExpiryStatus(
            document.expiry,
            reminderDays
          ) === "Expiring Soon"
        );

      }
    );


  /* =========================================================
     EXPIRED DOCUMENTS
     
     Renewed documents are NOT counted as expired.

     Example:
     Before renewal:
       Expired = 2

     After renewing one:
       Expired = 1
  ========================================================= */

  const expiredDocs =
    documents.filter(
      (document) => {

        if (isDocumentRenewed(document)) {
          return false;
        }


        return (
          getExpiryStatus(
            document.expiry,
            reminderDays
          ) === "Expired"
        );

      }
    ).length;


  /* =========================================================
     PENDING EMI
  ========================================================= */

  const pendingEMI =
    emis.filter(
      (emi) =>
        emi.status !== "Paid"
    ).length;


  /* =========================================================
     PENDING CHALLANS
  ========================================================= */

  const pendingChallans =
    challans.filter(
      (challan) =>
        challan.status !== "Paid"
    ).length;


  /* =========================================================
     CURRENT MONTH EMI CALCULATIONS
  ========================================================= */

  const currentDate = new Date();

  const currentMonth =
    currentDate.getMonth();

  const currentYear =
    currentDate.getFullYear();


  const currentMonthEMIs =
    emis
      .filter((emi) => {

        if (emi.status === "Paid") {
          return false;
        }


        const dueValue =
          emi.dueDate ||
          emi.due;


        if (!dueValue) {
          return false;
        }


        const dueDate =
          new Date(
            `${dueValue}T00:00:00`
          );


        if (
          Number.isNaN(
            dueDate.getTime()
          )
        ) {

          return false;

        }


        return (
          dueDate.getMonth() ===
            currentMonth &&
          dueDate.getFullYear() ===
            currentYear
        );

      })

      .sort((a, b) => {

        const dateA =
          new Date(
            `${a.dueDate || a.due}T00:00:00`
          );

        const dateB =
          new Date(
            `${b.dueDate || b.due}T00:00:00`
          );


        return dateA - dateB;

      });


  /* =========================================================
     DOCUMENT STATUS OVERVIEW FILTER

     Renewed documents remain available for the status
     overview because Renewed is now an independent status.

     All Time:
     All documents

     This Month:
     Documents whose expiry date is in the
     current month and current year

     This Year:
     Documents whose expiry date is in the
     current year

     Renewed documents without an expiry date are still
     included for All Time.
  ========================================================= */

  const filteredStatusDocuments =
    documents.filter((document) => {

      /* =====================================================
         ALL TIME
      ===================================================== */

      if (
        documentPeriod ===
        "All Time"
      ) {

        return true;

      }


      /* =====================================================
         RENEWED DOCUMENTS

         Keep Renewed records visible in the status overview
         even if their expiry date is no longer available.
      ===================================================== */

      if (isDocumentRenewed(document)) {

        const expiryDate =
          parseDashboardDate(
            document.expiry
          );


        if (!expiryDate) {
          return true;
        }

      }


      const expiryDate =
        parseDashboardDate(
          document.expiry
        );


      if (!expiryDate) {
        return false;
      }


      /* =====================================================
         THIS MONTH
      ===================================================== */

      if (
        documentPeriod ===
        "This Month"
      ) {

        return (
          expiryDate.getMonth() ===
            currentMonth &&
          expiryDate.getFullYear() ===
            currentYear
        );

      }


      /* =====================================================
         THIS YEAR
      ===================================================== */

      if (
        documentPeriod ===
        "This Year"
      ) {

        return (
          expiryDate.getFullYear() ===
          currentYear
        );

      }


      return true;

    });


  /* =========================================================
     FILTERED DOCUMENT STATUS COUNTS
     
     Status order:
       Active
       Expiring Soon
       Expired
       Renewed
  ========================================================= */


  /* =========================================================
     FILTERED ACTIVE DOCUMENTS
  ========================================================= */

  const filteredActiveDocs =
    filteredStatusDocuments.filter(
      (document) => {

        if (isDocumentRenewed(document)) {
          return false;
        }


        return (
          getExpiryStatus(
            document.expiry,
            reminderDays
          ) === "Active"
        );

      }
    ).length;


  /* =========================================================
     FILTERED EXPIRING DOCUMENTS
  ========================================================= */

  const filteredExpiringDocs =
    filteredStatusDocuments.filter(
      (document) => {

        if (isDocumentRenewed(document)) {
          return false;
        }


        return (
          getExpiryStatus(
            document.expiry,
            reminderDays
          ) === "Expiring Soon"
        );

      }
    ).length;


  /* =========================================================
     FILTERED EXPIRED DOCUMENTS
     
     Renewed documents are excluded.
  ========================================================= */

  const filteredExpiredDocs =
    filteredStatusDocuments.filter(
      (document) => {

        if (isDocumentRenewed(document)) {
          return false;
        }


        return (
          getExpiryStatus(
            document.expiry,
            reminderDays
          ) === "Expired"
        );

      }
    ).length;


  /* =========================================================
     FILTERED RENEWED DOCUMENTS
     
     This replaces the previous "Other" status.
  ========================================================= */

  const filteredRenewedDocs =
    filteredStatusDocuments.filter(
      (document) =>
        isDocumentRenewed(document)
    ).length;


  /* =========================================================
     FILTERED DOCUMENT PERCENTAGES
  ========================================================= */

  const filteredTotalDocuments =
    filteredStatusDocuments.length;


  const getFilteredPercentage =
    (number) => {

      if (
        filteredTotalDocuments ===
        0
      ) {

        return 0;

      }


      return Math.round(
        (number /
          filteredTotalDocuments) *
          100
      );

    };


  const filteredActivePercentage =
    getFilteredPercentage(
      filteredActiveDocs
    );


  const filteredExpiringPercentage =
    getFilteredPercentage(
      filteredExpiringDocs
    );


  const filteredExpiredPercentage =
    getFilteredPercentage(
      filteredExpiredDocs
    );


  const filteredRenewedPercentage =
    getFilteredPercentage(
      filteredRenewedDocs
    );


  /* =========================================================
     FILTERED CHART CALCULATIONS

     Existing three status colors are preserved.

     Renewed gets the same neutral/slate visual treatment
     that was previously used by Other.
  ========================================================= */

  const filteredActiveEnd =
    filteredActivePercentage;


  const filteredExpiringEnd =
    filteredActiveEnd +
    filteredExpiringPercentage;


  const filteredExpiredEnd =
    filteredActiveEnd +
    filteredExpiringPercentage +
    filteredExpiredPercentage;


  /* =========================================================
     PERCENTAGE CALCULATIONS
  ========================================================= */

  const totalDocuments =
    documents.length || 1;


  const getPercentage =
    (number) =>
      Math.round(
        (number /
          totalDocuments) *
          100
      );


  const activePercentage =
    getPercentage(
      activeDocs
    );


  const expiringPercentage =
    getPercentage(
      expiringDocuments.length
    );


  const expiredPercentage =
    getPercentage(
      expiredDocs
    );


  /* =========================================================
     CHART CALCULATIONS
  ========================================================= */

  const activeEnd =
    activePercentage;


  const expiringEnd =
    activePercentage +
    expiringPercentage;


  const expiredEnd =
    activePercentage +
    expiringPercentage +
    expiredPercentage;


  /* =========================================================
     DASHBOARD STAT CARDS
  ========================================================= */

  const cards = [

    {
      title: "Total Vehicles",
      value: vehicles.length,
      note: "Fleet registered",

      icon: Truck,

      path: "/vehicles",

      color: "text-blue-600",

      bg: "bg-blue-50",

      gradient:
        "from-blue-50 via-white to-blue-100/60",

      iconBg:
        "bg-blue-600",

      shadow:
        "shadow-blue-200",

      circle:
        "bg-blue-100",

      line:
        "bg-blue-600",
    },


    {
      title: "Active Documents",
      value: activeDocs,
      note: "All compliant",

      icon: FileText,

      path: "/documents",

      color: "text-emerald-600",

      bg: "bg-emerald-50",

      gradient:
        "from-emerald-50 via-white to-emerald-100/60",

      iconBg:
        "bg-emerald-600",

      shadow:
        "shadow-emerald-200",

      circle:
        "bg-emerald-100",

      line:
        "bg-emerald-600",
    },


    {
      title: "Expiring Soon",
      value: expiringDocuments.length,

      note:
        `${reminderDays} days reminder`,

      icon: AlertTriangle,

      path: "/documents",

      color: "text-amber-600",

      bg: "bg-amber-50",

      gradient:
        "from-amber-50 via-white to-yellow-100/60",

      iconBg:
        "bg-amber-500",

      shadow:
        "shadow-amber-200",

      circle:
        "bg-amber-100",

      line:
        "bg-amber-500",
    },


    {
      title: "Expired Documents",
      value: expiredDocs,
      note: "Take action now",

      icon: CircleX,

      path: "/documents",

      color: "text-red-600",

      bg: "bg-red-50",

      gradient:
        "from-red-50 via-white to-red-100/60",

      iconBg:
        "bg-red-600",

      shadow:
        "shadow-red-200",

      circle:
        "bg-red-100",

      line:
        "bg-red-600",
    },


    {
      title: "EMI Due",
      value: pendingEMI,
      note: "Pending payment",

      icon: CreditCard,

      path: "/emi",

      color: "text-indigo-600",

      bg: "bg-indigo-50",

      gradient:
        "from-indigo-50 via-white to-indigo-100/60",

      iconBg:
        "bg-indigo-600",

      shadow:
        "shadow-indigo-200",

      circle:
        "bg-indigo-100",

      line:
        "bg-indigo-600",
    },


    {
      title: "Challans Due",
      value: pendingChallans,
      note: "Pending payment",

      icon: ReceiptText,

      path: "/challans",

      color: "text-pink-600",

      bg: "bg-pink-50",

      gradient:
        "from-pink-50 via-white to-pink-100/60",

      iconBg:
        "bg-pink-600",

      shadow:
        "shadow-pink-200",

      circle:
        "bg-pink-100",

      line:
        "bg-pink-600",
    },

  ];


  /* =========================================================
     RETURN
  ========================================================= */

  return (

    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pb-6"
    >


      {/* =====================================================
          WELCOME SECTION
      ===================================================== */}

      <motion.div
        variants={itemVariants}

        className="
          relative
          mb-6
          overflow-hidden
          rounded-3xl
          border
          border-blue-100
          bg-gradient-to-r
          from-blue-50
          via-white
          to-indigo-50
          p-5
          shadow-sm
          md:p-6
        "
      >


        <div
          className="
            absolute
            -right-10
            -top-10
            h-40
            w-40
            rounded-full
            bg-blue-200/30
            blur-2xl
          "
        />


        <div
          className="
            absolute
            -bottom-12
            right-1/3
            h-32
            w-32
            rounded-full
            bg-indigo-200/30
            blur-2xl
          "
        />


        <div className="relative">

          <PageHeader

            title={`Welcome back, ${displayUserName}! 👋`}

            subtitle="
              Here's what's happening with your fleet today.
            "

            action={

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-blue-100
                    bg-white
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-slate-600
                    shadow-sm
                  "
                >

                  <CalendarDays
                    size={17}
                    className="text-blue-600"
                  />

                  {new Date().toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }
                  )}

                </div>

              </div>

            }

          />

        </div>

      </motion.div>



      {/* =====================================================
          STATISTICS CARDS
      ===================================================== */}

      <motion.div
        variants={containerVariants}

        className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-3
          2xl:grid-cols-6
        "
      >

        {cards
          .filter((card) =>
            dashboardNotificationsEnabled ||
            ![
              "Expiring Soon",
              "Expired Documents",
            ].includes(card.title)
          )
          .map((card) => {

          const Icon = card.icon;


          return (

            <motion.button
              key={card.title}

              variants={itemVariants}

              whileHover={{
                y: -6,
                scale: 1.02,
              }}

              whileTap={{
                scale: 0.98,
              }}

              onClick={() =>
                navigate(card.path)
              }

              className={`
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-slate-100
                bg-gradient-to-br
                ${card.gradient}
                p-5
                text-left
                shadow-sm
                transition-all
                duration-300
                hover:shadow-xl
              `}
            >


              <div
                className={`
                  absolute
                  -right-6
                  -top-6
                  h-24
                  w-24
                  rounded-full
                  ${card.circle}
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
                  items-start
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

                    {card.title}

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
                      delay: 0.2,
                    }}

                    className="
                      mt-2
                      text-3xl
                      font-bold
                      text-slate-800
                    "
                  >

                    {card.value}

                  </motion.h3>


                  <p
                    className={`
                      mt-1
                      text-xs
                      font-semibold
                      ${card.color}
                    `}
                  >

                    {card.note}

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
                    ${card.iconBg}
                    text-white
                    shadow-lg
                    ${card.shadow}
                    transition
                    duration-300
                    group-hover:rotate-6
                    group-hover:scale-110
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
                  ${card.line}
                  transition-all
                  duration-500
                  group-hover:w-full
                `}
              />

            </motion.button>

          );

        })}

      </motion.div>



      {/* =====================================================
          DOCUMENT ATTENTION + STATUS
      ===================================================== */}

      <div
        className="
          mt-6
          grid
          gap-6
          xl:grid-cols-5
        "
      >


        {/* DOCUMENT TABLE */}

        <motion.div
          variants={itemVariants}

          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-100
            bg-white
            shadow-sm
            xl:col-span-3
          "
        >


          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-slate-100
              px-5
              py-4
            "
          >

            <div className="flex items-center gap-3">

              <div>

                <h3 className="font-bold text-slate-800">

                  Documents Requiring Attention

                </h3>


                <p className="mt-1 text-xs text-slate-400">

                  Documents near expiry date

                </p>

              </div>


              {expiringDocuments.length > 0 && (

                <motion.span
                  animate={{
                    scale: [1, 1.12, 1],
                  }}

                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}

                  className="
                    flex
                    h-6
                    min-w-6
                    items-center
                    justify-center
                    rounded-full
                    bg-red-500
                    px-2
                    text-xs
                    font-bold
                    text-white
                    shadow-md
                    shadow-red-200
                  "
                >

                  {expiringDocuments.length}

                </motion.span>

              )}

            </div>


            <button
              onClick={() =>
                navigate("/documents")
              }

              className="
                text-sm
                font-semibold
                text-blue-600
                transition
                hover:text-blue-800
              "
            >

              View all

            </button>

          </div>



          <div className="overflow-x-auto">

            <table
              className="
                w-full
                min-w-[700px]
                text-left
                text-sm
              "
            >

              <thead
                className="
                  bg-slate-50
                  text-xs
                  font-medium
                  uppercase
                  tracking-wide
                  text-slate-500
                "
              >

                <tr>

                  <th className="px-5 py-3">
                    Vehicle No.
                  </th>

                  <th>
                    Document Type
                  </th>

                  <th>
                    Expiry Date
                  </th>

                  <th>
                    Days Left
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {expiringDocuments.length > 0 ? (

                  expiringDocuments
                    .slice(0, 5)

                    .map((document, index) => {

                      const status =
                        getDashboardDocumentStatus(
                          document,
                          reminderDays
                        );


                      const days =
                        getDaysLeft(
                          document.expiry
                        );


                      return (

                        <motion.tr
                          key={document.id}

                          initial={{
                            opacity: 0,
                            x: -15,
                          }}

                          animate={{
                            opacity: 1,
                            x: 0,
                          }}

                          transition={{
                            delay: index * 0.05,
                          }}

                          className="
                            border-t
                            border-slate-100
                            transition-colors
                            duration-200
                            hover:bg-blue-50/60
                          "
                        >


                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2">

                              <div
                                className="
                                  flex
                                  h-8
                                  w-8
                                  items-center
                                  justify-center
                                  rounded-lg
                                  bg-blue-50
                                  text-blue-600
                                "
                              >

                                <Truck size={15} />

                              </div>


                              <span
                                className="
                                  font-semibold
                                  text-blue-700
                                "
                              >

                                {document.vehicle}

                              </span>

                            </div>

                          </td>


                          <td className="font-medium text-slate-700">

                            {document.type}

                          </td>


                          <td className="text-slate-600">

                            {document.expiry
                              ? (() => {

                                  const expiryDate =
                                    parseDashboardDate(
                                      document.expiry
                                    );


                                  if (!expiryDate) {
                                    return document.expiry;
                                  }


                                  return expiryDate.toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  );

                                })()
                              : "-"}

                          </td>


                          <td>

                            <span
                              className={`
                                font-medium
                                ${
                                  days === null
                                    ? "text-slate-400"
                                    : days < 0
                                    ? "text-red-600"
                                    : days <= reminderDays
                                    ? "text-amber-600"
                                    : "text-emerald-600"
                                }
                              `}
                            >

                              {days === null
                                ? "-"
                                : days < 0
                                ? "Expired"
                                : `${days} days`}

                            </span>

                          </td>


                          <td>

                            <StatusBadge
                              status={status}
                            />

                          </td>


                          <td>

                            <motion.button
                              whileHover={{
                                scale: 1.08,
                              }}

                              whileTap={{
                                scale: 0.95,
                              }}

                              onClick={() =>
                                navigate("/documents")
                              }

                              className="
                                rounded-lg
                                border
                                border-slate-200
                                p-2
                                text-slate-500
                                transition-all
                                hover:border-blue-500
                                hover:bg-blue-600
                                hover:text-white
                              "
                            >

                              <Eye size={15} />

                            </motion.button>

                          </td>

                        </motion.tr>

                      );

                    })

                ) : (

                  <tr>

                    <td
                      colSpan="6"
                      className="
                        px-5
                        py-12
                        text-center
                      "
                    >

                      <FileText
                        size={35}
                        className="
                          mx-auto
                          mb-3
                          text-slate-300
                        "
                      />

                      <p className="font-medium text-slate-500">

                        No documents are expiring soon

                      </p>


                      <button
                        onClick={() =>
                          navigate("/documents")
                        }

                        className="
                          mt-2
                          text-sm
                          text-blue-600
                        "
                      >

                        Add a document

                      </button>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </motion.div>



        {/* DOCUMENT STATUS OVERVIEW */}

        <motion.div
          variants={itemVariants}

          className="
            rounded-2xl
            border
            border-slate-100
            bg-white
            p-6
            shadow-sm
            xl:col-span-2
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <div>

              <h3 className="font-bold text-slate-800">

                Document Status Overview

              </h3>


              <p className="mt-1 text-xs text-slate-400">

                Overall document compliance

              </p>

            </div>


            <select
              value={documentPeriod}

              onChange={(e) =>
                setDocumentPeriod(
                  e.target.value
                )
              }

              className="
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3
                py-2
                text-xs
                outline-none
                transition
                focus:border-blue-400
              "
            >

              <option value="All Time">
                All Time
              </option>

              <option value="This Month">
                This Month
              </option>

              <option value="This Year">
                This Year
              </option>

            </select>

          </div>



          <div
            className="
              mt-8
              flex
              flex-col
              items-center
              gap-8
              lg:flex-row
            "
          >


            <motion.div
              initial={{
                scale: 0,
                rotate: -90,
              }}

              animate={{
                scale: 1,
                rotate: 0,
              }}

              transition={{
                duration: 0.8,
                type: "spring",
              }}

              className="
                relative
                flex
                h-44
                w-44
                shrink-0
                items-center
                justify-center
                rounded-full
                shadow-inner
              "

              style={{
                background: `conic-gradient(
                  #10b981 0 ${filteredActiveEnd}%,
                  #f59e0b ${filteredActiveEnd}% ${filteredExpiringEnd}%,
                  #ef4444 ${filteredExpiringEnd}% ${filteredExpiredEnd}%,
                  #94a3b8 ${filteredExpiredEnd}% 100%
                )`,
              }}
            >

              <div
                className="
                  flex
                  h-28
                  w-28
                  flex-col
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  shadow-sm
                "
              >

                <span className="text-xs text-slate-500">

                  Total Documents

                </span>


                <span
                  className="
                    mt-1
                    text-3xl
                    font-bold
                    text-slate-800
                  "
                >

                  {filteredStatusDocuments.length}

                </span>

              </div>

            </motion.div>



            <div className="w-full space-y-5 text-sm">

              <StatusLegend
                label="Active"
                value={filteredActiveDocs}
                percentage={filteredActivePercentage}
                color="bg-emerald-500"
              />


              <StatusLegend
                label="Expiring Soon"
                value={filteredExpiringDocs}
                percentage={filteredExpiringPercentage}
                color="bg-amber-500"
              />


              <StatusLegend
                label="Expired"
                value={filteredExpiredDocs}
                percentage={filteredExpiredPercentage}
                color="bg-red-500"
              />


              {/* =================================================
                  RENEWED

                  Previously this section was "Other".
                  It now displays actual Renewed records.
              ================================================= */}

              <StatusLegend
                label="Renewed"
                value={filteredRenewedDocs}
                percentage={filteredRenewedPercentage}
                color="bg-slate-400"
              />

            </div>

          </div>

        </motion.div>

      </div>



      {/* =====================================================
          EMI / CHALLAN / RECENT VEHICLES
      ===================================================== */}

      <div
        className="
          mt-6
          grid
          gap-6
          xl:grid-cols-3
        "
      >


        {/* EMI OVERVIEW */}

        <Overview
          title="EMI Overview"
          icon={CreditCard}

          rows={currentMonthEMIs
            .slice(0, 3)
            .map((emi) => ({

              vehicle:
                emi.vehicle ||
                emi.vehicleNumber,

              subtitle:
                emi.bank ||
                emi.financerBank,

              amount:
                `₹ ${Number(
                  emi.amount ||
                  emi.emiAmount ||
                  0
                ).toLocaleString(
                  "en-IN"
                )}`,

              due: (() => {

                const dateValue =
                  emi.dueDate ||
                  emi.due;


                if (!dateValue) {
                  return "-";
                }


                const date =
                  new Date(
                    dateValue
                  );


                if (
                  isNaN(
                    date.getTime()
                  )
                ) {

                  return dateValue;

                }


                return date.toLocaleDateString(
                  "en-GB",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                );

              })(),

            }))}

          footer="View all EMI schedules"

          onClick={() =>
            navigate("/emi")
          }

        />


        {/* CHALLAN OVERVIEW */}

        <Overview
          title="Challan Overview"

          icon={ReceiptText}

          rows={challans
            .filter(
              (challan) =>
                challan.status !==
                "Paid"
            )

            .slice(0, 3)

            .map((challan) => ({

              vehicle:
                challan.vehicle,

              subtitle:
                challan.type,

              amount:
                `₹ ${Number(
                  challan.amount ||
                  0
                ).toLocaleString(
                  "en-IN"
                )}`,

              due:
                challan.due,

            }))}

          footer="View all Challans"

          onClick={() =>
            navigate("/challans")
          }

        />


        {/* =================================================
            RECENT VEHICLES
        ================================================= */}

        <motion.div
          variants={itemVariants}

          whileHover={{
            y: -4,
          }}

          className="
            rounded-2xl
            border
            border-slate-100
            bg-white
            p-5
            shadow-sm
            transition-shadow
            hover:shadow-xl
          "
        >


          {/* HEADER */}

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                  text-blue-600
                "
              >

                <Truck size={20} />

              </div>


              <h3 className="font-bold text-slate-800">

                Recent Vehicles

              </h3>

            </div>


            <button
              onClick={() =>
                navigate("/vehicles")
              }

              className="
                text-sm
                font-semibold
                text-blue-600
                hover:text-blue-800
              "
            >

              View all

            </button>

          </div>



          {/* =================================================
              VEHICLE LIST
          ================================================= */}

          <div className="mt-5 space-y-3">

            {vehicles.length > 0 ? (

              vehicles
                .slice(0, 3)
                .map((vehicle) => {


                  /* =========================================
                     GET VEHICLE STATUS FROM RC DOCUMENT
                  ========================================= */

                  const vehicleStatus =
                    getVehicleRCStatus(
                      vehicle,
                      documents,
                      reminderDays
                    );


                  return (

                    <motion.div
                      key={vehicle.id}

                      whileHover={{
                        x: 4,
                      }}

                      onClick={() =>
                        navigate(
                          `/vehicles/${vehicle.id}`
                        )
                      }

                      className="
                        flex
                        cursor-pointer
                        items-center
                        justify-between
                        rounded-xl
                        p-2
                        transition
                        hover:bg-slate-50
                      "
                    >


                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >

                        <div
                          className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-xl
                            bg-gradient-to-br
                            from-blue-50
                            to-indigo-100
                            text-blue-600
                          "
                        >

                          <Truck size={20} />

                        </div>


                        <div>

                          <p
                            className="
                              font-semibold
                              text-slate-700
                            "
                          >

                            {vehicle.number}

                          </p>


                          <p
                            className="
                              text-xs
                              text-slate-500
                            "
                          >

                            {vehicle.brand}{" "}
                            {vehicle.model}

                          </p>

                        </div>

                      </div>



                      {/* =====================================
                          VEHICLE STATUS FROM RC
                      ===================================== */}

                      <StatusBadge
                        status={
                          vehicleStatus
                        }
                      />

                    </motion.div>

                  );

                })

            ) : (

              <div
                className="
                  py-8
                  text-center
                  text-sm
                  text-slate-400
                "
              >

                No vehicles available.

              </div>

            )}

          </div>



          {/* FOOTER */}

          <button
            onClick={() =>
              navigate("/vehicles")
            }

            className="
              mt-5
              flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-blue-600
              transition-all
              hover:gap-3
            "
          >

            Manage all vehicles

            <ArrowRight size={16} />

          </button>

        </motion.div>

      </div>



      {/* =====================================================
          REMINDER SECTION
      ===================================================== */}

      {dashboardNotificationsEnabled && (

        <motion.div
          variants={itemVariants}

          className="
            relative
            mt-6
            overflow-hidden
            rounded-2xl
            border
            border-amber-200
            bg-gradient-to-r
            from-amber-50
            via-yellow-50
            to-orange-50
            p-5
            shadow-sm
            md:p-6
          "
        >

          <div
            className="
              absolute
              right-0
              top-0
              h-36
              w-36
              rounded-full
              bg-amber-300/20
              blur-2xl
            "
          />


          <div
            className="
              relative
              flex
              flex-col
              items-start
              justify-between
              gap-5
              md:flex-row
              md:items-center
            "
          >


            <div
              className="
                flex
                items-center
                gap-4
              "
            >

              <motion.div
                animate={{
                  rotate: [
                    0,
                    -10,
                    10,
                    -10,
                    0,
                  ],
                }}

                transition={{
                  repeat: Infinity,
                  repeatDelay: 4,
                  duration: 0.8,
                }}

                className="
                  rounded-2xl
                  bg-gradient-to-br
                  from-amber-400
                  to-orange-500
                  p-3
                  text-white
                  shadow-lg
                  shadow-amber-200
                "
              >

                <Bell size={23} />

              </motion.div>


              <div>

                <h3
                  className="
                    text-lg
                    font-bold
                    text-slate-800
                  "
                >

                  Never miss an expiry date!

                </h3>


                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-600
                  "
                >

                  Enable notifications and get reminded{" "}

                  <span
                    className="
                      font-bold
                      text-amber-700
                    "
                  >

                    {reminderDays} days

                  </span>

                  {" "}before any document expires.

                </p>

              </div>

            </div>



            <motion.button
              whileHover={{
                scale: 1.05,
              }}

              whileTap={{
                scale: 0.95,
              }}

              onClick={() =>
                navigate("/reminders")
              }

              className="
                rounded-xl
                bg-gradient-to-r
                from-amber-500
                to-orange-500
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-amber-200
                transition
                hover:shadow-xl
              "
            >

              Enable Reminders

            </motion.button>

          </div>

        </motion.div>

      )}

    </motion.div>

  );

}


/* =========================================================
   STATUS LEGEND COMPONENT
========================================================= */

function StatusLegend({
  label,
  value,
  percentage,
  color,
}) {

  return (

    <div className="group">

      <div
        className="
          mb-2
          flex
          items-center
          justify-between
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <span
            className={`
              h-2.5
              w-2.5
              rounded-full
              ${color}
            `}
          />


          <span
            className="
              font-medium
              text-slate-600
            "
          >

            {label}

          </span>

        </div>


        <span
          className="
            font-semibold
            text-slate-700
          "
        >

          {value}

        </span>

      </div>


      <div
        className="
          h-1.5
          overflow-hidden
          rounded-full
          bg-slate-100
        "
      >

        <motion.div
          initial={{
            width: 0,
          }}

          animate={{
            width: `${percentage}%`,
          }}

          transition={{
            duration: 1,
            ease: "easeOut",
          }}

          className={`
            h-full
            rounded-full
            ${color}
          `}
        />

      </div>

    </div>

  );

}


/* =========================================================
   EMI / CHALLAN OVERVIEW COMPONENT
========================================================= */

function Overview({
  title,
  icon: Icon,
  rows,
  footer,
  onClick,
}) {

  return (

    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      whileHover={{
        y: -4,
      }}

      transition={{
        duration: 0.3,
      }}

      className="
        rounded-2xl
        border
        border-slate-100
        bg-white
        p-5
        shadow-sm
        transition-shadow
        hover:shadow-xl
      "
    >


      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-blue-50
              text-blue-600
            "
          >

            <Icon size={20} />

          </div>


          <h3 className="font-bold text-slate-800">

            {title}

          </h3>

        </div>


        <button
          onClick={onClick}

          className="
            text-sm
            font-semibold
            text-blue-600
            transition
            hover:text-blue-800
          "
        >

          View all

        </button>

      </div>



      {/* ROWS */}

      <div className="mt-5 space-y-3">

        {rows.length > 0 ? (

          rows.map((row, index) => (

            <motion.div
              key={index}

              whileHover={{
                x: 4,
              }}

              className="
                flex
                items-center
                justify-between
                rounded-xl
                p-2
                transition
                hover:bg-slate-50
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-gradient-to-br
                    from-blue-50
                    to-indigo-100
                    text-blue-600
                  "
                >

                  <Truck size={17} />

                </div>


                <div>

                  <p
                    className="
                      font-semibold
                      text-slate-700
                    "
                  >

                    {row.vehicle}

                  </p>


                  <p
                    className="
                      text-xs
                      text-slate-500
                    "
                  >

                    {row.subtitle}

                  </p>

                </div>

              </div>



              <div className="text-right">

                <p
                  className="
                    font-semibold
                    text-blue-700
                  "
                >

                  {row.amount}

                </p>


                <p
                  className="
                    text-xs
                    text-red-500
                  "
                >

                  Due: {row.due}

                </p>

              </div>

            </motion.div>

          ))

        ) : (

          <div
            className="
              py-8
              text-center
              text-sm
              text-slate-400
            "
          >

            No records available.

          </div>

        )}

      </div>



      {/* FOOTER */}

      <button
        onClick={onClick}

        className="
          mt-5
          flex
          items-center
          gap-2
          text-sm
          font-semibold
          text-blue-600
          transition-all
          hover:gap-3
        "
      >

        {footer}

        <ArrowRight size={16} />

      </button>

    </motion.div>

  );

}









// import {
//   Truck,
//   FileText,
//   AlertTriangle,
//   CircleX,
//   CreditCard,
//   ReceiptText,
//   Eye,
//   ArrowRight,
//   Bell,
//   CalendarDays,
//   UserRound,
// } from "lucide-react";

// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { useState } from "react";

// import PageHeader from "../components/PageHeader";
// import StatusBadge from "../components/StatusBadge";

// import {
//   useFleet,
//   getExpiryStatus,
//   getDaysLeft,
// } from "../context/fleetContext";


// /* =========================================================
//    ANIMATION VARIANTS
// ========================================================= */

// const containerVariants = {
//   hidden: {
//     opacity: 0,
//   },

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
//     y: 25,
//   },

//   visible: {
//     opacity: 1,
//     y: 0,

//     transition: {
//       duration: 0.45,
//       ease: "easeOut",
//     },
//   },
// };


// /* =========================================================
//    VEHICLE RC STATUS FUNCTION

//    This function checks the Registration Certificate document
//    and returns the actual vehicle status.

//    Active RC     -> Active
//    Inactive RC   -> Inactive
//    Expired RC    -> Inactive
// ========================================================= */

// const getVehicleRCStatus = (
//   vehicle,
//   documents,
//   reminderDays
// ) => {

//   if (!vehicle) {
//     return "Inactive";
//   }


//   /* =======================================================
//      FIND RC DOCUMENT FOR THIS VEHICLE
//   ======================================================= */

//   const rcDocument = documents.find((document) => {

//     const documentType =
//       document.type
//         ?.toLowerCase()
//         .trim();

//     const isRC =
//       documentType === "registration certificate" ||
//       documentType === "rc" ||
//       documentType === "registration";


//     const sameVehicle =

//       document.vehicleId === vehicle.id ||

//       document.vehicle === vehicle.number ||

//       document.vehicleNumber === vehicle.number;


//     return isRC && sameVehicle;

//   });


//   /* =======================================================
//      IF RC DOCUMENT DOES NOT EXIST
//   ======================================================= */

//   if (!rcDocument) {

//     return "Inactive";

//   }


//   /* =======================================================
//      CHECK EXPLICIT DOCUMENT STATUS
//   ======================================================= */

//   if (rcDocument.status) {

//     const documentStatus =
//       rcDocument.status
//         .toLowerCase()
//         .trim();


//     if (
//       documentStatus === "inactive" ||
//       documentStatus === "expired"
//     ) {

//       return "Inactive";

//     }


//     if (documentStatus === "active") {

//       return "Active";

//     }

//   }


//   /* =======================================================
//      CHECK RC EXPIRY STATUS
//   ======================================================= */

//   if (rcDocument.expiry) {

//     const expiryStatus =
//       getExpiryStatus(
//         rcDocument.expiry,
//         reminderDays
//       );


//     if (expiryStatus === "Expired") {

//       return "Inactive";

//     }

//   }


//   /* =======================================================
//      DEFAULT ACTIVE
//   ======================================================= */

//   return "Active";

// };


// /* =========================================================
//    DOCUMENT DATE HELPER

//    Supports:
//    YYYY-MM-DD
//    DD-MM-YYYY
//    DD/MM/YYYY
//    YYYY/MM/DD
// ========================================================= */

// const parseDashboardDate = (dateValue) => {

//   if (!dateValue) {
//     return null;
//   }


//   /* =======================================================
//      ALREADY A DATE OBJECT
//   ======================================================= */

//   if (dateValue instanceof Date) {

//     if (Number.isNaN(dateValue.getTime())) {
//       return null;
//     }

//     return new Date(
//       dateValue.getFullYear(),
//       dateValue.getMonth(),
//       dateValue.getDate()
//     );

//   }


//   const value =
//     String(dateValue)
//       .trim();


//   if (!value) {
//     return null;
//   }


//   /* =======================================================
//      YYYY-MM-DD
//   ======================================================= */

//   if (
//     /^\d{4}-\d{2}-\d{2}$/.test(value)
//   ) {

//     const [
//       year,
//       month,
//       day,
//     ] = value
//       .split("-")
//       .map(Number);


//     const date =
//       new Date(
//         year,
//         month - 1,
//         day
//       );


//     if (
//       date.getFullYear() !== year ||
//       date.getMonth() !== month - 1 ||
//       date.getDate() !== day
//     ) {

//       return null;

//     }


//     return date;

//   }


//   /* =======================================================
//      DD-MM-YYYY
//   ======================================================= */

//   if (
//     /^\d{2}-\d{2}-\d{4}$/.test(value)
//   ) {

//     const [
//       day,
//       month,
//       year,
//     ] = value
//       .split("-")
//       .map(Number);


//     const date =
//       new Date(
//         year,
//         month - 1,
//         day
//       );


//     if (
//       date.getFullYear() !== year ||
//       date.getMonth() !== month - 1 ||
//       date.getDate() !== day
//     ) {

//       return null;

//     }


//     return date;

//   }


//   /* =======================================================
//      DD/MM/YYYY
//   ======================================================= */

//   if (
//     /^\d{2}\/\d{2}\/\d{4}$/.test(value)
//   ) {

//     const [
//       day,
//       month,
//       year,
//     ] = value
//       .split("/")
//       .map(Number);


//     const date =
//       new Date(
//         year,
//         month - 1,
//         day
//       );


//     if (
//       date.getFullYear() !== year ||
//       date.getMonth() !== month - 1 ||
//       date.getDate() !== day
//     ) {

//       return null;

//     }


//     return date;

//   }


//   /* =======================================================
//      YYYY/MM/DD
//   ======================================================= */

//   if (
//     /^\d{4}\/\d{2}\/\d{2}$/.test(value)
//   ) {

//     const [
//       year,
//       month,
//       day,
//     ] = value
//       .split("/")
//       .map(Number);


//     const date =
//       new Date(
//         year,
//         month - 1,
//         day
//       );


//     if (
//       date.getFullYear() !== year ||
//       date.getMonth() !== month - 1 ||
//       date.getDate() !== day
//     ) {

//       return null;

//     }


//     return date;

//   }


//   /* =======================================================
//      FALLBACK
//   ======================================================= */

//   const parsedDate =
//     new Date(value);


//   if (
//     Number.isNaN(
//       parsedDate.getTime()
//     )
//   ) {

//     return null;

//   }


//   return new Date(
//     parsedDate.getFullYear(),
//     parsedDate.getMonth(),
//     parsedDate.getDate()
//   );

// };


// /* =========================================================
//    DASHBOARD COMPONENT
// ========================================================= */

// export default function Dashboard() {

//   const navigate = useNavigate();


//   /* =========================================================
//      DOCUMENT STATUS FILTER

//      Default:
//      All Time
//   ========================================================= */

//   const [
//     documentPeriod,
//     setDocumentPeriod,
//   ] = useState("All Time");


//   /* =========================================================
//      FLEET DATA
//   ========================================================= */

//   const {
//     documents,
//     emis,
//     challans,
//     vehicles,
//     settings,
//     users = [],
//   } = useFleet();


//   /* =========================================================
//      REMINDER SETTINGS
//   ========================================================= */

//   const reminderDays =
//     Number(settings?.reminderDays) || 10;

//   const dashboardNotificationsEnabled =
//     settings?.dashboardNotifications !== false;


//   /* =========================================================
//      LOGGED-IN USER

//      Login.jsx stores the current user's id/email in localStorage.
//      Use that information to load the matching user from FleetContext
//      so the Dashboard always shows the latest name and photo.
//   ========================================================= */

//   const loggedInUserId =
//     localStorage.getItem("fleetdoc_user_id");

//   const loggedInUserEmail =
//     localStorage.getItem("fleetdoc_user_email");

//   const loggedInUser =
//     users.find(
//       (user) =>
//         String(user.id) ===
//         String(loggedInUserId)
//     ) ||
//     users.find(
//       (user) =>
//         user.email?.toLowerCase().trim() ===
//         loggedInUserEmail?.toLowerCase().trim()
//     ) ||
//     null;

//   const displayUserName =
//     loggedInUser?.name ||
//     localStorage.getItem("fleetdoc_user_name") ||
//     "User";

//   const displayUserPhoto =
//     loggedInUser?.photo ||
//     "";


//   /* =========================================================
//      DOCUMENT CALCULATIONS
//   ========================================================= */

//   const activeDocs =
//     documents.filter(
//       (document) =>
//         getExpiryStatus(
//           document.expiry,
//           reminderDays
//         ) === "Active"
//     ).length;


//   const expiringDocuments =
//     documents.filter(
//       (document) =>
//         getExpiryStatus(
//           document.expiry,
//           reminderDays
//         ) === "Expiring Soon"
//     );


//   const expiredDocs =
//     documents.filter(
//       (document) =>
//         getExpiryStatus(
//           document.expiry,
//           reminderDays
//         ) === "Expired"
//     ).length;


//   const pendingEMI =
//     emis.filter(
//       (emi) =>
//         emi.status !== "Paid"
//     ).length;


//   const pendingChallans =
//     challans.filter(
//       (challan) =>
//         challan.status !== "Paid"
//     ).length;


//   /* =========================================================
//      CURRENT MONTH EMI CALCULATIONS

//      Show only EMI records whose due date falls in the
//      current month and which are still pending.

//      FleetContext generates EMI records with both `due` and
//      `dueDate` in YYYY-MM-DD format, so the Dashboard uses
//      that due-date information directly.
//   ========================================================= */

//   const currentDate = new Date();

//   const currentMonth =
//     currentDate.getMonth();

//   const currentYear =
//     currentDate.getFullYear();


//   const currentMonthEMIs =
//     emis
//       .filter((emi) => {

//         if (emi.status === "Paid") {
//           return false;
//         }


//         const dueValue =
//           emi.dueDate ||
//           emi.due;


//         if (!dueValue) {
//           return false;
//         }


//         const dueDate =
//           new Date(
//             `${dueValue}T00:00:00`
//           );


//         if (
//           Number.isNaN(
//             dueDate.getTime()
//           )
//         ) {

//           return false;

//         }


//         return (
//           dueDate.getMonth() ===
//             currentMonth &&
//           dueDate.getFullYear() ===
//             currentYear
//         );

//       })

//       .sort((a, b) => {

//         const dateA =
//           new Date(
//             `${a.dueDate || a.due}T00:00:00`
//           );

//         const dateB =
//           new Date(
//             `${b.dueDate || b.due}T00:00:00`
//           );


//         return dateA - dateB;

//       });


//   /* =========================================================
//      DOCUMENT STATUS OVERVIEW FILTER
     
//      All Time:
//      All documents

//      This Month:
//      Documents whose expiry date is in the
//      current month and current year

//      This Year:
//      Documents whose expiry date is in the
//      current year
//   ========================================================= */

//   const filteredStatusDocuments =
//     documents.filter((document) => {

//       /* =====================================================
//          ALL TIME
//       ===================================================== */

//       if (
//         documentPeriod ===
//         "All Time"
//       ) {

//         return true;

//       }


//       const expiryDate =
//         parseDashboardDate(
//           document.expiry
//         );


//       if (!expiryDate) {
//         return false;
//       }


//       /* =====================================================
//          THIS MONTH
//       ===================================================== */

//       if (
//         documentPeriod ===
//         "This Month"
//       ) {

//         return (
//           expiryDate.getMonth() ===
//             currentMonth &&
//           expiryDate.getFullYear() ===
//             currentYear
//         );

//       }


//       /* =====================================================
//          THIS YEAR
//       ===================================================== */

//       if (
//         documentPeriod ===
//         "This Year"
//       ) {

//         return (
//           expiryDate.getFullYear() ===
//           currentYear
//         );

//       }


//       return true;

//     });


//   /* =========================================================
//      FILTERED DOCUMENT STATUS COUNTS
//   ========================================================= */

//   const filteredActiveDocs =
//     filteredStatusDocuments.filter(
//       (document) =>
//         getExpiryStatus(
//           document.expiry,
//           reminderDays
//         ) === "Active"
//     ).length;


//   const filteredExpiringDocs =
//     filteredStatusDocuments.filter(
//       (document) =>
//         getExpiryStatus(
//           document.expiry,
//           reminderDays
//         ) === "Expiring Soon"
//     ).length;


//   const filteredExpiredDocs =
//     filteredStatusDocuments.filter(
//       (document) =>
//         getExpiryStatus(
//           document.expiry,
//           reminderDays
//         ) === "Expired"
//     ).length;


//   const filteredOtherDocs =
//     Math.max(
//       0,
//       filteredStatusDocuments.length -
//         filteredActiveDocs -
//         filteredExpiringDocs -
//         filteredExpiredDocs
//     );


//   /* =========================================================
//      FILTERED DOCUMENT PERCENTAGES
//   ========================================================= */

//   const filteredTotalDocuments =
//     filteredStatusDocuments.length;


//   const getFilteredPercentage =
//     (number) => {

//       if (
//         filteredTotalDocuments ===
//         0
//       ) {

//         return 0;

//       }


//       return Math.round(
//         (number /
//           filteredTotalDocuments) *
//           100
//       );

//     };


//   const filteredActivePercentage =
//     getFilteredPercentage(
//       filteredActiveDocs
//     );


//   const filteredExpiringPercentage =
//     getFilteredPercentage(
//       filteredExpiringDocs
//     );


//   const filteredExpiredPercentage =
//     getFilteredPercentage(
//       filteredExpiredDocs
//     );


//   const filteredOtherPercentage =
//     Math.max(
//       0,
//       100 -
//         filteredActivePercentage -
//         filteredExpiringPercentage -
//         filteredExpiredPercentage
//     );


//   /* =========================================================
//      FILTERED CHART CALCULATIONS
//   ========================================================= */

//   const filteredActiveEnd =
//     filteredActivePercentage;


//   const filteredExpiringEnd =
//     filteredActiveEnd +
//     filteredExpiringPercentage;


//   const filteredExpiredEnd =
//     filteredActiveEnd +
//     filteredExpiringPercentage +
//     filteredExpiredPercentage;


//   /* =========================================================
//      PERCENTAGE CALCULATIONS

//      These remain unchanged and are used by the rest of
//      the Dashboard.
//   ========================================================= */

//   const totalDocuments =
//     documents.length || 1;


//   const getPercentage =
//     (number) =>
//       Math.round(
//         (number /
//           totalDocuments) *
//           100
//       );


//   const activePercentage =
//     getPercentage(
//       activeDocs
//     );


//   const expiringPercentage =
//     getPercentage(
//       expiringDocuments.length
//     );


//   const expiredPercentage =
//     getPercentage(
//       expiredDocs
//     );


//   /* =========================================================
//      CHART CALCULATIONS

//      Existing calculations are preserved.
//   ========================================================= */

//   const activeEnd =
//     activePercentage;


//   const expiringEnd =
//     activePercentage +
//     expiringPercentage;


//   const expiredEnd =
//     activePercentage +
//     expiringPercentage +
//     expiredPercentage;


//   /* =========================================================
//      DASHBOARD STAT CARDS
//   ========================================================= */

//   const cards = [

//     {
//       title: "Total Vehicles",
//       value: vehicles.length,
//       note: "Fleet registered",

//       icon: Truck,

//       path: "/vehicles",

//       color: "text-blue-600",

//       bg: "bg-blue-50",

//       gradient:
//         "from-blue-50 via-white to-blue-100/60",

//       iconBg:
//         "bg-blue-600",

//       shadow:
//         "shadow-blue-200",

//       circle:
//         "bg-blue-100",

//       line:
//         "bg-blue-600",
//     },


//     {
//       title: "Active Documents",
//       value: activeDocs,
//       note: "All compliant",

//       icon: FileText,

//       path: "/documents",

//       color: "text-emerald-600",

//       bg: "bg-emerald-50",

//       gradient:
//         "from-emerald-50 via-white to-emerald-100/60",

//       iconBg:
//         "bg-emerald-600",

//       shadow:
//         "shadow-emerald-200",

//       circle:
//         "bg-emerald-100",

//       line:
//         "bg-emerald-600",
//     },


//     {
//       title: "Expiring Soon",
//       value: expiringDocuments.length,

//       note:
//         `${reminderDays} days reminder`,

//       icon: AlertTriangle,

//       path: "/documents",

//       color: "text-amber-600",

//       bg: "bg-amber-50",

//       gradient:
//         "from-amber-50 via-white to-yellow-100/60",

//       iconBg:
//         "bg-amber-500",

//       shadow:
//         "shadow-amber-200",

//       circle:
//         "bg-amber-100",

//       line:
//         "bg-amber-500",
//     },


//     {
//       title: "Expired Documents",
//       value: expiredDocs,
//       note: "Take action now",

//       icon: CircleX,

//       path: "/documents",

//       color: "text-red-600",

//       bg: "bg-red-50",

//       gradient:
//         "from-red-50 via-white to-red-100/60",

//       iconBg:
//         "bg-red-600",

//       shadow:
//         "shadow-red-200",

//       circle:
//         "bg-red-100",

//       line:
//         "bg-red-600",
//     },


//     {
//       title: "EMI Due",
//       value: pendingEMI,
//       note: "Pending payment",

//       icon: CreditCard,

//       path: "/emi",

//       color: "text-indigo-600",

//       bg: "bg-indigo-50",

//       gradient:
//         "from-indigo-50 via-white to-indigo-100/60",

//       iconBg:
//         "bg-indigo-600",

//       shadow:
//         "shadow-indigo-200",

//       circle:
//         "bg-indigo-100",

//       line:
//         "bg-indigo-600",
//     },


//     {
//       title: "Challans Due",
//       value: pendingChallans,
//       note: "Pending payment",

//       icon: ReceiptText,

//       path: "/challans",

//       color: "text-pink-600",

//       bg: "bg-pink-50",

//       gradient:
//         "from-pink-50 via-white to-pink-100/60",

//       iconBg:
//         "bg-pink-600",

//       shadow:
//         "shadow-pink-200",

//       circle:
//         "bg-pink-100",

//       line:
//         "bg-pink-600",
//     },

//   ];


//   /* =========================================================
//      RETURN
//   ========================================================= */

//   return (

//     <motion.div
//       variants={containerVariants}
//       initial="hidden"
//       animate="visible"
//       className="pb-6"
//     >


//       {/* =====================================================
//           WELCOME SECTION
//       ===================================================== */}

//       <motion.div
//         variants={itemVariants}

//         className="
//           relative
//           mb-6
//           overflow-hidden
//           rounded-3xl
//           border
//           border-blue-100
//           bg-gradient-to-r
//           from-blue-50
//           via-white
//           to-indigo-50
//           p-5
//           shadow-sm
//           md:p-6
//         "
//       >


//         <div
//           className="
//             absolute
//             -right-10
//             -top-10
//             h-40
//             w-40
//             rounded-full
//             bg-blue-200/30
//             blur-2xl
//           "
//         />


//         <div
//           className="
//             absolute
//             -bottom-12
//             right-1/3
//             h-32
//             w-32
//             rounded-full
//             bg-indigo-200/30
//             blur-2xl
//           "
//         />


//         <div className="relative">

//           <PageHeader

//             title={`Welcome back, ${displayUserName}! 👋`}

//             subtitle="
//               Here's what's happening with your fleet today.
//             "

//             action={

//               <div className="flex items-center gap-3">

//                 <div
//                   className="
//                     flex
//                     items-center
//                     gap-2
//                     rounded-xl
//                     border
//                     border-blue-100
//                     bg-white
//                     px-4
//                     py-2.5
//                     text-sm
//                     font-medium
//                     text-slate-600
//                     shadow-sm
//                   "
//                 >

//                   <CalendarDays
//                     size={17}
//                     className="text-blue-600"
//                   />

//                   {new Date().toLocaleDateString(
//                     "en-IN",
//                     {
//                       day: "2-digit",
//                       month: "long",
//                       year: "numeric",
//                     }
//                   )}

//                 </div>

//                 {/* <div
//                   className="
//                     flex
//                     items-center
//                     gap-3
//                     rounded-xl
//                     border
//                     border-blue-100
//                     bg-white
//                     px-3
//                     py-2
//                     shadow-sm
//                   "
//                 >

//                   {displayUserPhoto ? (

//                     <img
//                       src={displayUserPhoto}
//                       alt={displayUserName}
//                       className="h-9 w-9 rounded-full object-cover ring-2 ring-blue-100"
//                     />

//                   ) : (

//                     <div
//                       className="
//                         flex
//                         h-9
//                         w-9
//                         items-center
//                         justify-center
//                         rounded-full
//                         bg-blue-50
//                         text-blue-600
//                         ring-2
//                         ring-blue-100
//                       "
//                     >

//                       <UserRound size={18} />

//                     </div>

//                   )}

//                   <div className="hidden text-left sm:block">

//                     <p className="text-xs font-medium text-slate-400">
//                       Logged in as
//                     </p>

//                     <p className="max-w-[150px] truncate text-sm font-semibold text-slate-700">
//                       {displayUserName}
//                     </p>

//                   </div>

//                 </div> */}

//               </div>

//             }

//           />

//         </div>

//       </motion.div>



//       {/* =====================================================
//           STATISTICS CARDS
//       ===================================================== */}

//       <motion.div
//         variants={containerVariants}

//         className="
//           grid
//           gap-4
//           sm:grid-cols-2
//           xl:grid-cols-3
//           2xl:grid-cols-6
//         "
//       >

//         {cards
//           .filter((card) =>
//             dashboardNotificationsEnabled ||
//             ![
//               "Expiring Soon",
//               "Expired Documents",
//             ].includes(card.title)
//           )
//           .map((card) => {

//           const Icon = card.icon;


//           return (

//             <motion.button
//               key={card.title}

//               variants={itemVariants}

//               whileHover={{
//                 y: -6,
//                 scale: 1.02,
//               }}

//               whileTap={{
//                 scale: 0.98,
//               }}

//               onClick={() =>
//                 navigate(card.path)
//               }

//               className={`
//                 group
//                 relative
//                 overflow-hidden
//                 rounded-2xl
//                 border
//                 border-slate-100
//                 bg-gradient-to-br
//                 ${card.gradient}
//                 p-5
//                 text-left
//                 shadow-sm
//                 transition-all
//                 duration-300
//                 hover:shadow-xl
//               `}
//             >


//               <div
//                 className={`
//                   absolute
//                   -right-6
//                   -top-6
//                   h-24
//                   w-24
//                   rounded-full
//                   ${card.circle}
//                   opacity-70
//                   transition
//                   duration-500
//                   group-hover:scale-150
//                 `}
//               />


//               <div
//                 className="
//                   relative
//                   flex
//                   items-start
//                   justify-between
//                 "
//               >


//                 <div>

//                   <p
//                     className="
//                       text-sm
//                       font-medium
//                       text-slate-500
//                     "
//                   >

//                     {card.title}

//                   </p>


//                   <motion.h3
//                     initial={{
//                       opacity: 0,
//                       scale: 0.8,
//                     }}

//                     animate={{
//                       opacity: 1,
//                       scale: 1,
//                     }}

//                     transition={{
//                       delay: 0.2,
//                     }}

//                     className="
//                       mt-2
//                       text-3xl
//                       font-bold
//                       text-slate-800
//                     "
//                   >

//                     {card.value}

//                   </motion.h3>


//                   <p
//                     className={`
//                       mt-1
//                       text-xs
//                       font-semibold
//                       ${card.color}
//                     `}
//                   >

//                     {card.note}

//                   </p>

//                 </div>


//                 <div
//                   className={`
//                     flex
//                     h-14
//                     w-14
//                     items-center
//                     justify-center
//                     rounded-2xl
//                     ${card.iconBg}
//                     text-white
//                     shadow-lg
//                     ${card.shadow}
//                     transition
//                     duration-300
//                     group-hover:rotate-6
//                     group-hover:scale-110
//                   `}
//                 >

//                   <Icon size={25} />

//                 </div>

//               </div>


//               <div
//                 className={`
//                   absolute
//                   bottom-0
//                   left-0
//                   h-1
//                   w-0
//                   ${card.line}
//                   transition-all
//                   duration-500
//                   group-hover:w-full
//                 `}
//               />

//             </motion.button>

//           );

//         })}

//       </motion.div>



//       {/* =====================================================
//           DOCUMENT ATTENTION + STATUS
//       ===================================================== */}

//       <div
//         className="
//           mt-6
//           grid
//           gap-6
//           xl:grid-cols-5
//         "
//       >


//         {/* DOCUMENT TABLE */}

//         <motion.div
//           variants={itemVariants}

//           className="
//             overflow-hidden
//             rounded-2xl
//             border
//             border-slate-100
//             bg-white
//             shadow-sm
//             xl:col-span-3
//           "
//         >


//           <div
//             className="
//               flex
//               items-center
//               justify-between
//               border-b
//               border-slate-100
//               px-5
//               py-4
//             "
//           >

//             <div className="flex items-center gap-3">

//               <div>

//                 <h3 className="font-bold text-slate-800">

//                   Documents Requiring Attention

//                 </h3>


//                 <p className="mt-1 text-xs text-slate-400">

//                   Documents near expiry date

//                 </p>

//               </div>


//               {expiringDocuments.length > 0 && (

//                 <motion.span
//                   animate={{
//                     scale: [1, 1.12, 1],
//                   }}

//                   transition={{
//                     duration: 2,
//                     repeat: Infinity,
//                   }}

//                   className="
//                     flex
//                     h-6
//                     min-w-6
//                     items-center
//                     justify-center
//                     rounded-full
//                     bg-red-500
//                     px-2
//                     text-xs
//                     font-bold
//                     text-white
//                     shadow-md
//                     shadow-red-200
//                   "
//                 >

//                   {expiringDocuments.length}

//                 </motion.span>

//               )}

//             </div>


//             <button
//               onClick={() =>
//                 navigate("/documents")
//               }

//               className="
//                 text-sm
//                 font-semibold
//                 text-blue-600
//                 transition
//                 hover:text-blue-800
//               "
//             >

//               View all

//             </button>

//           </div>



//           <div className="overflow-x-auto">

//             <table
//               className="
//                 w-full
//                 min-w-[700px]
//                 text-left
//                 text-sm
//               "
//             >

//               <thead
//                 className="
//                   bg-slate-50
//                   text-xs
//                   font-medium
//                   uppercase
//                   tracking-wide
//                   text-slate-500
//                 "
//               >

//                 <tr>

//                   <th className="px-5 py-3">
//                     Vehicle No.
//                   </th>

//                   <th>
//                     Document Type
//                   </th>

//                   <th>
//                     Expiry Date
//                   </th>

//                   <th>
//                     Days Left
//                   </th>

//                   <th>
//                     Status
//                   </th>

//                   <th>
//                     Action
//                   </th>

//                 </tr>

//               </thead>


//               <tbody>

//                 {expiringDocuments.length > 0 ? (

//                   expiringDocuments
//                     .slice(0, 5)

//                     .map((document, index) => {

//                       const status =
//                         getExpiryStatus(
//                           document.expiry,
//                           reminderDays
//                         );


//                       const days =
//                         getDaysLeft(
//                           document.expiry
//                         );


//                       return (

//                         <motion.tr
//                           key={document.id}

//                           initial={{
//                             opacity: 0,
//                             x: -15,
//                           }}

//                           animate={{
//                             opacity: 1,
//                             x: 0,
//                           }}

//                           transition={{
//                             delay: index * 0.05,
//                           }}

//                           className="
//                             border-t
//                             border-slate-100
//                             transition-colors
//                             duration-200
//                             hover:bg-blue-50/60
//                           "
//                         >


//                           <td className="px-5 py-4">

//                             <div className="flex items-center gap-2">

//                               <div
//                                 className="
//                                   flex
//                                   h-8
//                                   w-8
//                                   items-center
//                                   justify-center
//                                   rounded-lg
//                                   bg-blue-50
//                                   text-blue-600
//                                 "
//                               >

//                                 <Truck size={15} />

//                               </div>


//                               <span
//                                 className="
//                                   font-semibold
//                                   text-blue-700
//                                 "
//                               >

//                                 {document.vehicle}

//                               </span>

//                             </div>

//                           </td>


//                           <td className="font-medium text-slate-700">

//                             {document.type}

//                           </td>


//                           <td className="text-slate-600">

//                             {document.expiry
//                               ? (() => {

//                                   const expiryDate =
//                                     parseDashboardDate(
//                                       document.expiry
//                                     );


//                                   if (!expiryDate) {
//                                     return document.expiry;
//                                   }


//                                   return expiryDate.toLocaleDateString(
//                                     "en-GB",
//                                     {
//                                       day: "2-digit",
//                                       month: "short",
//                                       year: "numeric",
//                                     }
//                                   );

//                                 })()
//                               : "-"}

//                           </td>


//                           <td>

//                             <span
//                               className={`
//                                 font-medium
//                                 ${
//                                   days === null
//                                     ? "text-slate-400"
//                                     : days < 0
//                                     ? "text-red-600"
//                                     : days <= reminderDays
//                                     ? "text-amber-600"
//                                     : "text-emerald-600"
//                                 }
//                               `}
//                             >

//                               {days === null
//                                 ? "-"
//                                 : days < 0
//                                 ? "Expired"
//                                 : `${days} days`}

//                             </span>

//                           </td>


//                           <td>

//                             <StatusBadge
//                               status={status}
//                             />

//                           </td>


//                           <td>

//                             <motion.button
//                               whileHover={{
//                                 scale: 1.08,
//                               }}

//                               whileTap={{
//                                 scale: 0.95,
//                               }}

//                               onClick={() =>
//                                 navigate("/documents")
//                               }

//                               className="
//                                 rounded-lg
//                                 border
//                                 border-slate-200
//                                 p-2
//                                 text-slate-500
//                                 transition-all
//                                 hover:border-blue-500
//                                 hover:bg-blue-600
//                                 hover:text-white
//                               "
//                             >

//                               <Eye size={15} />

//                             </motion.button>

//                           </td>

//                         </motion.tr>

//                       );

//                     })

//                 ) : (

//                   <tr>

//                     <td
//                       colSpan="6"
//                       className="
//                         px-5
//                         py-12
//                         text-center
//                       "
//                     >

//                       <FileText
//                         size={35}
//                         className="
//                           mx-auto
//                           mb-3
//                           text-slate-300
//                         "
//                       />

//                       <p className="font-medium text-slate-500">

//                         No documents are expiring soon

//                       </p>


//                       <button
//                         onClick={() =>
//                           navigate("/documents")
//                         }

//                         className="
//                           mt-2
//                           text-sm
//                           text-blue-600
//                         "
//                       >

//                         Add a document

//                       </button>

//                     </td>

//                   </tr>

//                 )}

//               </tbody>

//             </table>

//           </div>

//         </motion.div>



//         {/* DOCUMENT STATUS OVERVIEW */}

//         <motion.div
//           variants={itemVariants}

//           className="
//             rounded-2xl
//             border
//             border-slate-100
//             bg-white
//             p-6
//             shadow-sm
//             xl:col-span-2
//           "
//         >

//           <div
//             className="
//               flex
//               items-center
//               justify-between
//             "
//           >

//             <div>

//               <h3 className="font-bold text-slate-800">

//                 Document Status Overview

//               </h3>


//               <p className="mt-1 text-xs text-slate-400">

//                 Overall document compliance

//               </p>

//             </div>


//             {/* =================================================
//                 FUNCTIONAL PERIOD DROPDOWN

//                 UI/classes remain unchanged.
//             ================================================= */}

//             <select
//               value={documentPeriod}

//               onChange={(e) =>
//                 setDocumentPeriod(
//                   e.target.value
//                 )
//               }

//               className="
//                 rounded-lg
//                 border
//                 border-slate-200
//                 bg-white
//                 px-3
//                 py-2
//                 text-xs
//                 outline-none
//                 transition
//                 focus:border-blue-400
//               "
//             >

//               <option value="All Time">
//                 All Time
//               </option>

//               <option value="This Month">
//                 This Month
//               </option>

//               <option value="This Year">
//                 This Year
//               </option>

//             </select>

//           </div>



//           <div
//             className="
//               mt-8
//               flex
//               flex-col
//               items-center
//               gap-8
//               lg:flex-row
//             "
//           >


//             <motion.div
//               initial={{
//                 scale: 0,
//                 rotate: -90,
//               }}

//               animate={{
//                 scale: 1,
//                 rotate: 0,
//               }}

//               transition={{
//                 duration: 0.8,
//                 type: "spring",
//               }}

//               className="
//                 relative
//                 flex
//                 h-44
//                 w-44
//                 shrink-0
//                 items-center
//                 justify-center
//                 rounded-full
//                 shadow-inner
//               "

//               style={{
//                 background: `conic-gradient(
//                   #10b981 0 ${filteredActiveEnd}%,
//                   #f59e0b ${filteredActiveEnd}% ${filteredExpiringEnd}%,
//                   #ef4444 ${filteredExpiringEnd}% ${filteredExpiredEnd}%,
//                   #e2e8f0 ${filteredExpiredEnd}% 100%
//                 )`,
//               }}
//             >

//               <div
//                 className="
//                   flex
//                   h-28
//                   w-28
//                   flex-col
//                   items-center
//                   justify-center
//                   rounded-full
//                   bg-white
//                   shadow-sm
//                 "
//               >

//                 <span className="text-xs text-slate-500">

//                   Total Documents

//                 </span>


//                 <span
//                   className="
//                     mt-1
//                     text-3xl
//                     font-bold
//                     text-slate-800
//                   "
//                 >

//                   {filteredStatusDocuments.length}

//                 </span>

//               </div>

//             </motion.div>



//             <div className="w-full space-y-5 text-sm">

//               <StatusLegend
//                 label="Active"
//                 value={filteredActiveDocs}
//                 percentage={filteredActivePercentage}
//                 color="bg-emerald-500"
//               />


//               <StatusLegend
//                 label="Expiring Soon"
//                 value={filteredExpiringDocs}
//                 percentage={filteredExpiringPercentage}
//                 color="bg-amber-500"
//               />


//               <StatusLegend
//                 label="Expired"
//                 value={filteredExpiredDocs}
//                 percentage={filteredExpiredPercentage}
//                 color="bg-red-500"
//               />


//               <StatusLegend
//                 label="Other"
//                 value={filteredOtherDocs}
//                 percentage={filteredOtherPercentage}
//                 color="bg-slate-300"
//               />

//             </div>

//           </div>

//         </motion.div>

//       </div>



//       {/* =====================================================
//           EMI / CHALLAN / RECENT VEHICLES
//       ===================================================== */}

//       <div
//         className="
//           mt-6
//           grid
//           gap-6
//           xl:grid-cols-3
//         "
//       >


//         {/* EMI OVERVIEW */}

//         <Overview
//           title="EMI Overview"
//           icon={CreditCard}

//           rows={currentMonthEMIs
//             .slice(0, 3)
//             .map((emi) => ({

//               vehicle:
//                 emi.vehicle ||
//                 emi.vehicleNumber,

//               subtitle:
//                 emi.bank ||
//                 emi.financerBank,

//               amount:
//                 `₹ ${Number(
//                   emi.amount ||
//                   emi.emiAmount ||
//                   0
//                 ).toLocaleString(
//                   "en-IN"
//                 )}`,

//               due: (() => {

//                 const dateValue =
//                   emi.dueDate ||
//                   emi.due;


//                 if (!dateValue) {
//                   return "-";
//                 }


//                 const date =
//                   new Date(
//                     dateValue
//                   );


//                 if (
//                   isNaN(
//                     date.getTime()
//                   )
//                 ) {

//                   return dateValue;

//                 }


//                 return date.toLocaleDateString(
//                   "en-GB",
//                   {
//                     day: "2-digit",
//                     month: "short",
//                     year: "numeric",
//                   }
//                 );

//               })(),

//             }))}

//           footer="View all EMI schedules"

//           onClick={() =>
//             navigate("/emi")
//           }

//         />


//         {/* CHALLAN OVERVIEW */}

//         <Overview
//           title="Challan Overview"

//           icon={ReceiptText}

//           rows={challans
//             .filter(
//               (challan) =>
//                 challan.status !==
//                 "Paid"
//             )

//             .slice(0, 3)

//             .map((challan) => ({

//               vehicle:
//                 challan.vehicle,

//               subtitle:
//                 challan.type,

//               amount:
//                 `₹ ${Number(
//                   challan.amount ||
//                   0
//                 ).toLocaleString(
//                   "en-IN"
//                 )}`,

//               due:
//                 challan.due,

//             }))}

//           footer="View all Challans"

//           onClick={() =>
//             navigate("/challans")
//           }

//         />


//         {/* =================================================
//             RECENT VEHICLES
//         ================================================= */}

//         <motion.div
//           variants={itemVariants}

//           whileHover={{
//             y: -4,
//           }}

//           className="
//             rounded-2xl
//             border
//             border-slate-100
//             bg-white
//             p-5
//             shadow-sm
//             transition-shadow
//             hover:shadow-xl
//           "
//         >


//           {/* HEADER */}

//           <div
//             className="
//               flex
//               items-center
//               justify-between
//             "
//           >

//             <div
//               className="
//                 flex
//                 items-center
//                 gap-3
//               "
//             >

//               <div
//                 className="
//                   flex
//                   h-10
//                   w-10
//                   items-center
//                   justify-center
//                   rounded-xl
//                   bg-blue-50
//                   text-blue-600
//                 "
//               >

//                 <Truck size={20} />

//               </div>


//               <h3 className="font-bold text-slate-800">

//                 Recent Vehicles

//               </h3>

//             </div>


//             <button
//               onClick={() =>
//                 navigate("/vehicles")
//               }

//               className="
//                 text-sm
//                 font-semibold
//                 text-blue-600
//                 hover:text-blue-800
//               "
//             >

//               View all

//             </button>

//           </div>



//           {/* =================================================
//               VEHICLE LIST
//           ================================================= */}

//           <div className="mt-5 space-y-3">

//             {vehicles.length > 0 ? (

//               vehicles
//                 .slice(0, 3)
//                 .map((vehicle) => {


//                   /* =========================================
//                      GET VEHICLE STATUS FROM RC DOCUMENT
//                   ========================================= */

//                   const vehicleStatus =
//                     getVehicleRCStatus(
//                       vehicle,
//                       documents,
//                       reminderDays
//                     );


//                   return (

//                     <motion.div
//                       key={vehicle.id}

//                       whileHover={{
//                         x: 4,
//                       }}

//                       onClick={() =>
//                         navigate(
//                           `/vehicles/${vehicle.id}`
//                         )
//                       }

//                       className="
//                         flex
//                         cursor-pointer
//                         items-center
//                         justify-between
//                         rounded-xl
//                         p-2
//                         transition
//                         hover:bg-slate-50
//                       "
//                     >


//                       <div
//                         className="
//                           flex
//                           items-center
//                           gap-3
//                         "
//                       >

//                         <div
//                           className="
//                             flex
//                             h-11
//                             w-11
//                             items-center
//                             justify-center
//                             rounded-xl
//                             bg-gradient-to-br
//                             from-blue-50
//                             to-indigo-100
//                             text-blue-600
//                           "
//                         >

//                           <Truck size={20} />

//                         </div>


//                         <div>

//                           <p
//                             className="
//                               font-semibold
//                               text-slate-700
//                             "
//                           >

//                             {vehicle.number}

//                           </p>


//                           <p
//                             className="
//                               text-xs
//                               text-slate-500
//                             "
//                           >

//                             {vehicle.brand}{" "}
//                             {vehicle.model}

//                           </p>

//                         </div>

//                       </div>



//                       {/* =====================================
//                           VEHICLE STATUS FROM RC
//                       ===================================== */}

//                       <StatusBadge
//                         status={
//                           vehicleStatus
//                         }
//                       />

//                     </motion.div>

//                   );

//                 })

//             ) : (

//               <div
//                 className="
//                   py-8
//                   text-center
//                   text-sm
//                   text-slate-400
//                 "
//               >

//                 No vehicles available.

//               </div>

//             )}

//           </div>



//           {/* FOOTER */}

//           <button
//             onClick={() =>
//               navigate("/vehicles")
//             }

//             className="
//               mt-5
//               flex
//               items-center
//               gap-2
//               text-sm
//               font-semibold
//               text-blue-600
//               transition-all
//               hover:gap-3
//             "
//           >

//             Manage all vehicles

//             <ArrowRight size={16} />

//           </button>

//         </motion.div>

//       </div>



//       {/* =====================================================
//           REMINDER SECTION
//       ===================================================== */}

//       {dashboardNotificationsEnabled && (

//         <motion.div
//           variants={itemVariants}

//           className="
//             relative
//             mt-6
//             overflow-hidden
//             rounded-2xl
//             border
//             border-amber-200
//             bg-gradient-to-r
//             from-amber-50
//             via-yellow-50
//             to-orange-50
//             p-5
//             shadow-sm
//             md:p-6
//           "
//         >

//           <div
//             className="
//               absolute
//               right-0
//               top-0
//               h-36
//               w-36
//               rounded-full
//               bg-amber-300/20
//               blur-2xl
//             "
//           />


//           <div
//             className="
//               relative
//               flex
//               flex-col
//               items-start
//               justify-between
//               gap-5
//               md:flex-row
//               md:items-center
//             "
//           >


//             <div
//               className="
//                 flex
//                 items-center
//                 gap-4
//               "
//             >

//               <motion.div
//                 animate={{
//                   rotate: [
//                     0,
//                     -10,
//                     10,
//                     -10,
//                     0,
//                   ],
//                 }}

//                 transition={{
//                   repeat: Infinity,
//                   repeatDelay: 4,
//                   duration: 0.8,
//                 }}

//                 className="
//                   rounded-2xl
//                   bg-gradient-to-br
//                   from-amber-400
//                   to-orange-500
//                   p-3
//                   text-white
//                   shadow-lg
//                   shadow-amber-200
//                 "
//               >

//                 <Bell size={23} />

//               </motion.div>


//               <div>

//                 <h3
//                   className="
//                     text-lg
//                     font-bold
//                     text-slate-800
//                   "
//                 >

//                   Never miss an expiry date!

//                 </h3>


//                 <p
//                   className="
//                     mt-1
//                     text-sm
//                     text-slate-600
//                   "
//                 >

//                   Enable notifications and get reminded{" "}

//                   <span
//                     className="
//                       font-bold
//                       text-amber-700
//                     "
//                   >

//                     {reminderDays} days

//                   </span>

//                   {" "}before any document expires.

//                 </p>

//               </div>

//             </div>



//             <motion.button
//               whileHover={{
//                 scale: 1.05,
//               }}

//               whileTap={{
//                 scale: 0.95,
//               }}

//               onClick={() =>
//                 navigate("/reminders")
//               }

//               className="
//                 rounded-xl
//                 bg-gradient-to-r
//                 from-amber-500
//                 to-orange-500
//                 px-6
//                 py-3
//                 text-sm
//                 font-semibold
//                 text-white
//                 shadow-lg
//                 shadow-amber-200
//                 transition
//                 hover:shadow-xl
//               "
//             >

//               Enable Reminders

//             </motion.button>

//           </div>

//         </motion.div>

//       )}

//     </motion.div>

//   );

// }


// /* =========================================================
//    STATUS LEGEND COMPONENT
// ========================================================= */

// function StatusLegend({
//   label,
//   value,
//   percentage,
//   color,
// }) {

//   return (

//     <div className="group">

//       <div
//         className="
//           mb-2
//           flex
//           items-center
//           justify-between
//         "
//       >

//         <div
//           className="
//             flex
//             items-center
//             gap-2
//           "
//         >

//           <span
//             className={`
//               h-2.5
//               w-2.5
//               rounded-full
//               ${color}
//             `}
//           />


//           <span
//             className="
//               font-medium
//               text-slate-600
//             "
//           >

//             {label}

//           </span>

//         </div>


//         <span
//           className="
//             font-semibold
//             text-slate-700
//           "
//         >

//           {value}

//         </span>

//       </div>


//       <div
//         className="
//           h-1.5
//           overflow-hidden
//           rounded-full
//           bg-slate-100
//         "
//       >

//         <motion.div
//           initial={{
//             width: 0,
//           }}

//           animate={{
//             width: `${percentage}%`,
//           }}

//           transition={{
//             duration: 1,
//             ease: "easeOut",
//           }}

//           className={`
//             h-full
//             rounded-full
//             ${color}
//           `}
//         />

//       </div>

//     </div>

//   );

// }


// /* =========================================================
//    EMI / CHALLAN OVERVIEW COMPONENT
// ========================================================= */

// function Overview({
//   title,
//   icon: Icon,
//   rows,
//   footer,
//   onClick,
// }) {

//   return (

//     <motion.div
//       initial={{
//         opacity: 0,
//         y: 20,
//       }}

//       animate={{
//         opacity: 1,
//         y: 0,
//       }}

//       whileHover={{
//         y: -4,
//       }}

//       transition={{
//         duration: 0.3,
//       }}

//       className="
//         rounded-2xl
//         border
//         border-slate-100
//         bg-white
//         p-5
//         shadow-sm
//         transition-shadow
//         hover:shadow-xl
//       "
//     >


//       {/* HEADER */}

//       <div
//         className="
//           flex
//           items-center
//           justify-between
//         "
//       >

//         <div
//           className="
//             flex
//             items-center
//             gap-3
//           "
//         >

//           <div
//             className="
//               flex
//               h-10
//               w-10
//               items-center
//               justify-center
//               rounded-xl
//               bg-blue-50
//               text-blue-600
//             "
//           >

//             <Icon size={20} />

//           </div>


//           <h3 className="font-bold text-slate-800">

//             {title}

//           </h3>

//         </div>


//         <button
//           onClick={onClick}

//           className="
//             text-sm
//             font-semibold
//             text-blue-600
//             transition
//             hover:text-blue-800
//           "
//         >

//           View all

//         </button>

//       </div>



//       {/* ROWS */}

//       <div className="mt-5 space-y-3">

//         {rows.length > 0 ? (

//           rows.map((row, index) => (

//             <motion.div
//               key={index}

//               whileHover={{
//                 x: 4,
//               }}

//               className="
//                 flex
//                 items-center
//                 justify-between
//                 rounded-xl
//                 p-2
//                 transition
//                 hover:bg-slate-50
//               "
//             >

//               <div
//                 className="
//                   flex
//                   items-center
//                   gap-3
//                 "
//               >

//                 <div
//                   className="
//                     flex
//                     h-9
//                     w-9
//                     items-center
//                     justify-center
//                     rounded-lg
//                     bg-gradient-to-br
//                     from-blue-50
//                     to-indigo-100
//                     text-blue-600
//                   "
//                 >

//                   <Truck size={17} />

//                 </div>


//                 <div>

//                   <p
//                     className="
//                       font-semibold
//                       text-slate-700
//                     "
//                   >

//                     {row.vehicle}

//                   </p>


//                   <p
//                     className="
//                       text-xs
//                       text-slate-500
//                     "
//                   >

//                     {row.subtitle}

//                   </p>

//                 </div>

//               </div>



//               <div className="text-right">

//                 <p
//                   className="
//                     font-semibold
//                     text-blue-700
//                   "
//                 >

//                   {row.amount}

//                 </p>


//                 <p
//                   className="
//                     text-xs
//                     text-red-500
//                   "
//                 >

//                   Due: {row.due}

//                 </p>

//               </div>

//             </motion.div>

//           ))

//         ) : (

//           <div
//             className="
//               py-8
//               text-center
//               text-sm
//               text-slate-400
//             "
//           >

//             No records available.

//           </div>

//         )}

//       </div>



//       {/* FOOTER */}

//       <button
//         onClick={onClick}

//         className="
//           mt-5
//           flex
//           items-center
//           gap-2
//           text-sm
//           font-semibold
//           text-blue-600
//           transition-all
//           hover:gap-3
//         "
//       >

//         {footer}

//         <ArrowRight size={16} />

//       </button>

//     </motion.div>

//   );

// }