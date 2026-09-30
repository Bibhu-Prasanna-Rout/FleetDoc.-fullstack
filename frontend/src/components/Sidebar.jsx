import {
  LayoutDashboard,
  Truck,
  FileText,
  CreditCard,
  ReceiptText,
  BarChart3,
  Bell,
  Clock3,
  Settings,
  Users,
  ShieldCheck,
  IndianRupee,
} from "lucide-react";

// import { NavLink } from "react-router-dom";
// import { motion } from "framer-motion";
// import { useMemo } from "react";

import { NavLink, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import { useMemo } from "react";

import fleetDocLogo from "../assets/FleetDoc-logo 1.png";

import {
  useFleet,
  getExpiryStatus,
  getDaysLeft,
  parseDate,
} from "../context/fleetContext";


const links = [
  ["/", "Dashboard", LayoutDashboard],
  ["/vehicles", "Vehicles", Truck],
  ["/documents", "Documents", FileText],
  ["/emi", "EMI Management", CreditCard],
  ["/challans", "Challans", ReceiptText],
  ["/Expense-Overview", "Expense Overview", IndianRupee],
  ["/reports", "Reports", BarChart3],
  ["/notifications", "Notifications", Bell],
  ["/reminders", "Reminders", Clock3],
  ["/users", "Users & Roles", Users],
  ["/settings", "Settings", Settings],
];


export default function Sidebar({
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
const navigate = useNavigate();
  /* =========================================================
     FLEET DATA
  ========================================================= */

  const {
    documents,
    emis,
    challans,
    settings,

    /*
      IMPORTANT:
      This comes from FleetContext.

      When a notification is deleted from Notifications.jsx,
      this array changes and Sidebar automatically recalculates
      the notification badge.
    */
    dismissedNotifications = [],
  } = useFleet();

    /* =========================================================
     NOTIFICATION COUNT
     
     Includes:
     1. Expired documents
     2. Expiring Soon documents
     3. All pending challans
     4. Current-month pending EMI within reminder days

     IMPORTANT:
     - Renewed documents are NOT counted
     - Dismissed notifications are excluded
  ========================================================= */

  const notificationCount = useMemo(() => {

    const reminderDays =
      Number(
        settings?.reminderDays ?? 10
      );


    /* =======================================================
       ALL NOTIFICATION IDS
    ======================================================= */

    const notificationIds = [];


    /* =======================================================
       DOCUMENT NOTIFICATIONS
       
       Expired + Expiring Soon

       IMPORTANT:
       Renewed documents are completely ignored.
    ======================================================= */

    (documents || []).forEach(
      (document) => {

        if (!document?.expiry) {
          return;
        }


        /* -----------------------------------------------
           CHECK WHETHER DOCUMENT IS RENEWED
        ------------------------------------------------ */

        const normalizedStatus =
          String(
            document?.status || ""
          )
            .trim()
            .toLowerCase();


        const normalizedDocumentStatus =
          String(
            document?.documentStatus || ""
          )
            .trim()
            .toLowerCase();


        const normalizedRenewalStatus =
          String(
            document?.renewalStatus || ""
          )
            .trim()
            .toLowerCase();


        const isRenewed =
          normalizedStatus === "renewed" ||
          normalizedDocumentStatus === "renewed" ||
          normalizedRenewalStatus === "renewed" ||
          document?.isRenewed === true;


        /* -----------------------------------------------
           RENEWED DOCUMENT
           
           Do NOT create:
           - Expired notification
           - Expiring Soon notification
        ------------------------------------------------ */

        if (isRenewed) {
          return;
        }


        /* -----------------------------------------------
           GET DOCUMENT EXPIRY STATUS
        ------------------------------------------------ */

        const status =
          getExpiryStatus(
            document.expiry,
            reminderDays
          );


        /* -----------------------------------------------
           EXPIRED DOCUMENT
        ------------------------------------------------ */

        if (
          status === "Expired"
        ) {

          notificationIds.push(
            `document-expired-${document.id}`
          );

        }


        /* -----------------------------------------------
           EXPIRING SOON DOCUMENT
        ------------------------------------------------ */

        if (
          status === "Expiring Soon"
        ) {

          notificationIds.push(
            `document-expiring-${document.id}`
          );

        }

      }
    );


    /* =======================================================
       PENDING CHALLAN NOTIFICATIONS

       All challans except Paid
    ======================================================= */

    (challans || []).forEach(
      (challan) => {

        const status =
          String(
            challan?.status || ""
          ).toLowerCase();


        if (
          status !== "paid"
        ) {

          notificationIds.push(
            `challan-${challan.id}`
          );

        }

      }
    );


    /* =======================================================
       EMI NOTIFICATIONS

       Only:
       - Pending EMI
       - Current month
       - Due today or within reminderDays

       Example:

       15 Sep 2026 → SHOW
       20 Sep 2026 → SHOW
       25 Sep 2026 → SHOW
       01 Oct 2026 → DON'T SHOW
    ======================================================= */

    const today =
      new Date();


    const currentMonth =
      today.getMonth();


    const currentYear =
      today.getFullYear();


    (emis || []).forEach(
      (emi) => {

        /* -----------------------------------------------
           PAID EMI
        ------------------------------------------------ */

        const status =
          String(
            emi?.status || ""
          ).toLowerCase();


        if (
          status === "paid" ||
          emi?.paid === true
        ) {

          return;

        }


        /* -----------------------------------------------
           FIND EMI DUE DATE
        ------------------------------------------------ */

        const dueDate =
          emi?.dueDate ||
          emi?.due ||
          emi?.emiDate ||
          emi?.date;


        const parsedDate =
          parseDate(
            dueDate
          );


        if (!parsedDate) {
          return;
        }


        /* -----------------------------------------------
           ONLY CURRENT MONTH
        ------------------------------------------------ */

        if (
          parsedDate.getMonth() !==
            currentMonth ||
          parsedDate.getFullYear() !==
            currentYear
        ) {

          return;

        }


        /* -----------------------------------------------
           DAYS LEFT
        ------------------------------------------------ */

        const daysLeft =
          getDaysLeft(
            dueDate
          );


        if (
          daysLeft === null
        ) {

          return;

        }


        /* -----------------------------------------------
           ONLY EMI WITHIN REMINDER DAYS
        ------------------------------------------------ */

        if (
          daysLeft >= 0 &&
          daysLeft <=
            reminderDays
        ) {

          notificationIds.push(
            `emi-${emi.id}`
          );

        }

      }
    );


    /* =======================================================
       REMOVE DISMISSED NOTIFICATIONS
       
       Example:

       Total notifications = 14

       Dismissed:
       - challan-123
       - emi-456

       Result = 12
    ======================================================= */

    const dismissedSet =
      new Set(
        Array.isArray(
          dismissedNotifications
        )
          ? dismissedNotifications
          : []
      );


    const activeNotificationIds =
      notificationIds.filter(
        (notificationId) =>
          !dismissedSet.has(
            notificationId
          )
      );


    /* =======================================================
       FINAL COUNT
    ======================================================= */

    return (
      activeNotificationIds.length
    );

  }, [
    documents,
    emis,
    challans,
    settings?.reminderDays,
    dismissedNotifications,
  ]);


  return (

    <>

      {/* =========================================
          MOBILE BACKGROUND OVERLAY
      ========================================= */}

      {mobileMenuOpen && (

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}

          onClick={() =>
            setMobileMenuOpen(false)
          }

          className="
            fixed
            inset-0
            z-30
            bg-slate-950/60
            backdrop-blur-sm
            lg:hidden
          "
        />

      )}


      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside

        className={`
          fixed
          inset-y-0
          left-0
          z-40
          flex
          h-screen
          w-64
          flex-col
          overflow-hidden
          bg-gradient-to-b
          from-[#0d1d35]
          via-[#102442]
          to-[#081426]
          text-slate-300
          shadow-2xl
          transition-transform
          duration-300
          lg:translate-x-0

          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}

      >


        {/* =========================================
            BACKGROUND DECORATION
        ========================================= */}

        <div className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-48
          w-48
          rounded-full
          bg-blue-500/10
          blur-3xl
        " />

        <div className="
          pointer-events-none
          absolute
          bottom-40
          -left-20
          h-48
          w-48
          rounded-full
          bg-indigo-500/10
          blur-3xl
        " />


        {/* =========================================
            LOGO SECTION
        ========================================= */}

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
            duration: 0.5,
          }}

          className="
            relative
            shrink-0
            flex
            items-center
            gap-3
            border-b
            border-white/5
            px-6
            py-6
          "

        >


          {/* LOGO */}

          <motion.div

            whileHover={{
              rotate: 5,
              scale: 1.05,
            }}

            transition={{
              type: "spring",
              stiffness: 300,
            }}

          >

            <img
              src={fleetDocLogo}
              alt="FleetDoc Logo"

              className="
                h-12
                w-12
                object-contain
              "
            />

          </motion.div>


          {/* BRAND TEXT */}

          <div>

            <h1 className="
              text-lg
              font-bold
              tracking-tight
              text-white
            ">

              Fleet

              <span className="text-blue-400">
                Doc.
              </span>

            </h1>


            <p className="
              mt-0.5
              text-xs
              text-slate-400
            ">

              Vehicle Document Manager

            </p>

          </div>

        </motion.div>


        {/* =========================================
            NAVIGATION TITLE
        ========================================= */}

        <div className="
          relative
          px-6
          pb-2
          pt-5
        ">

          <p className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.2em]
            text-slate-500
          ">

            Main Menu

          </p>

        </div>


        {/* =========================================
            SCROLLABLE NAVIGATION
        ========================================= */}

        <nav className="
          relative
          min-h-0
          flex-1
          space-y-1
          overflow-y-auto
          px-3
          pb-4

          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-white/10
        ">


          {links.map(
            ([to, label, Icon], index) => (

            <motion.div

              key={to}

              initial={{
                opacity: 0,
                x: -15,
              }}

              animate={{
                opacity: 1,
                x: 0,
              }}

              transition={{
                delay: index * 0.04,
                duration: 0.35,
              }}

            >


              <NavLink

                to={to}

                end={to === "/"}

                onClick={() => {

                  if (
                    window.innerWidth <
                    1024
                  ) {

                    setMobileMenuOpen(
                      false
                    );

                  }

                }}

                className={({ isActive }) =>

                  `
                  group
                  relative
                  flex
                  items-center
                  gap-3
                  overflow-hidden
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-medium
                  transition-all
                  duration-300

                  ${
                    isActive

                      ? `
                        bg-gradient-to-r
                        from-blue-600
                        to-indigo-600
                        text-white
                        shadow-lg
                        shadow-blue-950/40
                      `

                      : `
                        text-slate-400
                        hover:bg-white/5
                        hover:text-white
                      `
                  }
                  `

                }

              >


                {({ isActive }) => (

                  <>


                    {/* ACTIVE INDICATOR */}

                    {isActive && (

                      <motion.div

                        layoutId="activeSidebar"

                        className="
                          absolute
                          left-0
                          top-2
                          bottom-2
                          w-1
                          rounded-r-full
                          bg-white
                        "

                      />

                    )}


                    {/* ICON */}

                    <motion.div

                      whileHover={{
                        scale: 1.15,
                        rotate: 3,
                      }}

                      transition={{
                        type: "spring",
                        stiffness: 400,
                      }}

                    >

                      <Icon size={18} />

                    </motion.div>


                    {/* LABEL */}

                    <span className="relative z-10">

                      {label}

                    </span>


                    {/* =================================
                        NOTIFICATION BADGE

                        Dynamic count
                    ================================= */}

                    {label ===
                      "Notifications" &&
                      notificationCount >
                        0 && (

                      <motion.span

                        animate={{
                          scale: [
                            1,
                            1.12,
                            1,
                          ],
                        }}

                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}

                        className="
                          ml-auto
                          flex
                          h-5
                          min-w-5
                          items-center
                          justify-center
                          rounded-full
                          bg-red-500
                          px-1.5
                          text-[10px]
                          font-bold
                          text-white
                          shadow-lg
                          shadow-red-900/40
                        "

                      >

                        {notificationCount}

                      </motion.span>

                    )}


                    {/* HOVER GLOW */}

                    {!isActive && (

                      <div className="
                        absolute
                        inset-0
                        -z-0
                        bg-gradient-to-r
                        from-blue-500/0
                        via-blue-500/5
                        to-transparent
                        opacity-0
                        transition
                        duration-300
                        group-hover:opacity-100
                      " />

                    )}

                  </>

                )}

              </NavLink>


            </motion.div>

          ))}


        </nav>


        {/* =========================================
            PREMIUM CARD
        ========================================= */}

        <motion.div

          initial={{
            opacity: 0,
            y: 20,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          transition={{
            delay: 0.5,
            duration: 0.5,
          }}

          whileHover={{
            y: -3,
          }}

          className="
            relative
            shrink-0
            m-4
            overflow-hidden
            rounded-2xl
            border
            border-white/10
            bg-gradient-to-br
            from-white/10
            to-white/5
            p-4
            text-center
            backdrop-blur-sm
          "

        >


          {/* BACKGROUND GLOW */}

          <div className="
            absolute
            -right-10
            -top-10
            h-24
            w-24
            rounded-full
            bg-blue-500/20
            blur-2xl
          " />


          {/* SECURITY ICON */}

          <motion.div

            animate={{
              y: [
                0,
                -3,
                0,
              ],
            }}

            transition={{
              duration: 2.5,
              repeat: Infinity,
            }}

            className="
              relative
              mx-auto
              mb-3
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-blue-500/30
              to-indigo-500/20
              text-blue-300
            "

          >

            <ShieldCheck size={23} />

          </motion.div>


          <h3 className="
            relative
            text-sm
            font-semibold
            text-white
          ">

            Keep Documents Safe

          </h3>


          <p className="
            relative
            mt-2
            text-xs
            leading-5
            text-slate-400
          ">

            Store, manage and get reminded before expiry.

          </p>


          <motion.button
            type="button" onClick={() => navigate("/premium")}
            whileHover={{
              scale: 1.03,
            }}

            whileTap={{
              scale: 0.97,
            }}

            className="
              relative
              mt-4
              w-full
              rounded-xl
              bg-gradient-to-r
              from-blue-600
              to-indigo-500
              py-2.5
              text-xs
              font-semibold
              text-white
              shadow-lg
              shadow-blue-950/30
              transition
              hover:shadow-blue-500/20
            "

          >

            Explore Premium

          </motion.button>


        </motion.div>


      </aside>

    </>

  );
}