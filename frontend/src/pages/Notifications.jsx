// import { useMemo, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useNavigate } from "react-router-dom";

// import PageHeader from "../components/PageHeader";

// import {
//   Bell,
//   FileText,
//   AlertTriangle,
//   CreditCard,
//   ReceiptText,
//   Trash2,
//   X,
//   CheckCircle2,
//   Clock3,
//   ArrowRight,
//   ShieldAlert,
// } from "lucide-react";

// import {
//   useFleet,
//   getExpiryStatus,
//   getDaysLeft,
//   parseDate,
//   formatDate,
// } from "../context/fleetContext";


// /* =========================================================
//    ANIMATION VARIANTS
// ========================================================= */

// const containerVariants = {
//   hidden: {},
//   show: {
//     transition: {
//       staggerChildren: 0.055,
//     },
//   },
// };

// const itemVariants = {
//   hidden: {
//     opacity: 0,
//     y: 18,
//   },

//   show: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.38,
//       ease: "easeOut",
//     },
//   },
// };

// const modalVariants = {
//   hidden: {
//     opacity: 0,
//     scale: 0.94,
//     y: 20,
//   },

//   show: {
//     opacity: 1,
//     scale: 1,
//     y: 0,
//     transition: {
//       duration: 0.28,
//       ease: "easeOut",
//     },
//   },

//   exit: {
//     opacity: 0,
//     scale: 0.94,
//     y: 20,
//     transition: {
//       duration: 0.2,
//       ease: "easeIn",
//     },
//   },
// };


// /* =========================================================
//    DATE HELPERS
// ========================================================= */

// function getMonthStart() {
//   const today = new Date();

//   return new Date(
//     today.getFullYear(),
//     today.getMonth(),
//     1
//   );
// }

// function getMonthEnd() {
//   const today = new Date();

//   return new Date(
//     today.getFullYear(),
//     today.getMonth() + 1,
//     0
//   );
// }

// function isDateInCurrentMonth(value) {
//   const date = parseDate(value);

//   if (!date) {
//     return false;
//   }

//   const monthStart = getMonthStart();
//   const monthEnd = getMonthEnd();

//   date.setHours(0, 0, 0, 0);

//   monthStart.setHours(0, 0, 0, 0);

//   monthEnd.setHours(
//     23,
//     59,
//     59,
//     999
//   );

//   return (
//     date >= monthStart &&
//     date <= monthEnd
//   );
// }


// /* =========================================================
//    NOTIFICATIONS PAGE
// ========================================================= */

// export default function Notifications() {
//   const navigate = useNavigate();

//   const {
//     documents = [],
//     emis = [],
//     challans = [],
//     settings,
//     dismissedNotifications = [],
//     dismissNotification,
//   } = useFleet();

//   const [
//     filter,
//     setFilter,
//   ] = useState("All");

//   const [
//     notificationToDelete,
//     setNotificationToDelete,
//   ] = useState(null);


//   /* =========================================================
//      REMINDER DAYS
//   ========================================================= */

//   const reminderDays =
//     Number(
//       settings?.reminderDays ?? 10
//     );


//   /* =========================================================
//      GENERATE NOTIFICATIONS
//   ========================================================= */

//   const items = useMemo(() => {
//     if (settings?.inAppNotifications === false) return [];
//     const notificationList = [];


//     /* =======================================================
//        DOCUMENT NOTIFICATIONS
//     ======================================================= */

//     if (settings?.documentAlerts !== false) {
//       documents.forEach((document) => {
//       if (!document?.expiry) {
//         return;
//       }

//       const status =
//         getExpiryStatus(
//           document.expiry,
//           reminderDays
//         );

//       const daysLeft =
//         getDaysLeft(
//           document.expiry
//         );


//       /* -----------------------------------------------------
//          EXPIRED DOCUMENT
//       ----------------------------------------------------- */

//       if (
//         status === "Expired" &&
//         daysLeft !== null
//       ) {
//         const expiredDays =
//           Math.abs(daysLeft);

//         notificationList.push({
//           id:
//             `document-expired-${document.id}`,

//           type: "Documents",

//           category: "Expired",

//           text: `${
//             document.type ||
//             document.name ||
//             "Document"
//           } of ${
//             document.vehicle ||
//             document.vehicleNumber ||
//             "vehicle"
//           } expired ${expiredDays} ${
//             expiredDays === 1
//               ? "day"
//               : "days"
//           } ago.`,

//           subText:
//             `Expired on ${formatDate(
//               document.expiry
//             )}`,

//           Icon: AlertTriangle,

//           color:
//             "text-red-600",

//           iconBg:
//             "bg-red-50",

//           accent:
//             "bg-red-500",

//           hoverBorder:
//             "group-hover:border-red-200",

//           route:
//             "/documents",

//           date:
//             parseDate(
//               document.expiry
//             ),
//         });
//       }


//       /* -----------------------------------------------------
//          EXPIRING SOON DOCUMENT
//       ----------------------------------------------------- */

//       if (
//         status === "Expiring Soon" &&
//         daysLeft !== null &&
//         daysLeft >= 0
//       ) {
//         notificationList.push({
//           id:
//             `document-expiring-${document.id}`,

//           type: "Documents",

//           category:
//             "Expiring Soon",

//           text: `${
//             document.type ||
//             document.name ||
//             "Document"
//           } of ${
//             document.vehicle ||
//             document.vehicleNumber ||
//             "vehicle"
//           } will expire in ${
//             daysLeft
//           } ${
//             daysLeft === 1
//               ? "day"
//               : "days"
//           }.`,

//           subText:
//             `Expiry date: ${formatDate(
//               document.expiry
//             )}`,

//           Icon: FileText,

//           color:
//             "text-amber-600",

//           iconBg:
//             "bg-amber-50",

//           accent:
//             "bg-amber-500",

//           hoverBorder:
//             "group-hover:border-amber-200",

//           route:
//             "/documents",

//           date:
//             parseDate(
//               document.expiry
//             ),
//         });
//       }
//       });
//     }


//     /* =======================================================
//        CHALLAN NOTIFICATIONS
//     ======================================================= */

//     if (settings?.challanAlerts !== false) {
//       challans.forEach((challan) => {
//       if (
//         challan?.status === "Paid"
//       ) {
//         return;
//       }

//       notificationList.push({
//         id:
//           `challan-${challan.id}`,

//         type: "Challans",

//         category:
//           "Pending",

//         text:
//           `Challan ${
//             challan.number ||
//             challan.challanNumber ||
//             "record"
//           } is pending payment.`,

//         subText:
//           challan.vehicle ||
//           challan.vehicleNumber
//             ? `Vehicle: ${
//                 challan.vehicle ||
//                 challan.vehicleNumber
//               }`
//             : "Payment is pending.",

//         Icon:
//           ReceiptText,

//         color:
//           "text-red-600",

//         iconBg:
//           "bg-red-50",

//         accent:
//           "bg-red-500",

//         hoverBorder:
//           "group-hover:border-red-200",

//         route:
//           "/challans",

//         date:
//           parseDate(
//             challan.dueDate ||
//               challan.due ||
//               challan.date ||
//               challan.createdAt
//           ),
//       });
//       });
//     }


//     /* =======================================================
//        EMI NOTIFICATIONS
//     ======================================================= */

//     if (settings?.emiAlerts !== false) {
//       const emiReminderDays = Number(settings?.emiReminderDays ?? reminderDays);
//       emis.forEach((emi) => {
//       if (
//         emi?.status === "Paid" ||
//         emi?.paid === true
//       ) {
//         return;
//       }

//       const dueDate =
//         emi.dueDate ||
//         emi.due ||
//         emi.emiDate ||
//         emi.date;

//       const parsedDueDate =
//         parseDate(dueDate);

//       if (!parsedDueDate) {
//         return;
//       }

//       if (
//         !isDateInCurrentMonth(
//           dueDate
//         )
//       ) {
//         return;
//       }

//       const daysUntilDue =
//         getDaysLeft(dueDate);

//       if (
//         daysUntilDue === null
//       ) {
//         return;
//       }

//       if (
//         daysUntilDue < 0 ||
//         daysUntilDue > emiReminderDays
//       ) {
//         return;
//       }

//       const amount =
//         Number(
//           emi.emiAmount ??
//             emi.amount ??
//             0
//         );

//       notificationList.push({
//         id:
//           `emi-${emi.id}`,

//         type:
//           "EMI",

//         category:
//           "Pending",

//         text:
//           `EMI payment of ${
//             emi.vehicleNumber ||
//             emi.vehicle ||
//             "vehicle"
//           } is due ${
//             daysUntilDue === 0
//               ? "today"
//               : `in ${daysUntilDue} ${
//                   daysUntilDue === 1
//                     ? "day"
//                     : "days"
//                 }`
//           }.`,

//         subText:
//           `Due: ${formatDate(
//             dueDate
//           )} • ₹${amount.toLocaleString(
//             "en-IN"
//           )}`,

//         Icon:
//           CreditCard,

//         color:
//           "text-blue-600",

//         iconBg:
//           "bg-blue-50",

//         accent:
//           "bg-blue-500",

//         hoverBorder:
//           "group-hover:border-blue-200",

//         route:
//           "/emi",

//         date:
//           parsedDueDate,
//       });
//       });
//     }


//     /* =======================================================
//        SORT
//     ======================================================= */

//     return notificationList.sort(
//       (a, b) => {
//         const dateA =
//           a.date?.getTime?.() || 0;

//         const dateB =
//           b.date?.getTime?.() || 0;

//         return (
//           dateB - dateA
//         );
//       }
//     );
//   }, [
//     documents,
//     emis,
//     challans,
//     settings,
//     reminderDays,
//   ]);


//   /* =========================================================
//      REMOVE DISMISSED NOTIFICATIONS
//   ========================================================= */

//   const visibleItems =
//     useMemo(() => {
//       return items.filter(
//         (item) =>
//           !dismissedNotifications.includes(
//             item.id
//           )
//       );
//     }, [
//       items,
//       dismissedNotifications,
//     ]);


//   /* =========================================================
//      FILTER
//   ========================================================= */

//   const shown =
//     filter === "All"
//       ? visibleItems
//       : visibleItems.filter(
//           (item) =>
//             item.type === filter
//         );


//   /* =========================================================
//      COUNTS
//   ========================================================= */

//   const documentCount =
//     visibleItems.filter(
//       (item) =>
//         item.type === "Documents"
//     ).length;

//   const emiCount =
//     visibleItems.filter(
//       (item) =>
//         item.type === "EMI"
//     ).length;

//   const challanCount =
//     visibleItems.filter(
//       (item) =>
//         item.type === "Challans"
//     ).length;

//   const paymentCount =
//     emiCount +
//     challanCount;


//   /* =========================================================
//      DELETE CONFIRMATION
//   ========================================================= */

//   const confirmDelete = () => {
//     if (
//       !notificationToDelete
//     ) {
//       return;
//     }

//     dismissNotification(
//       notificationToDelete.id
//     );

//     setNotificationToDelete(
//       null
//     );
//   };


//   /* =========================================================
//      OPEN NOTIFICATION
//   ========================================================= */

//   const handleNotificationClick = (
//     item
//   ) => {
//     if (!item?.route) {
//       return;
//     }

//     navigate(item.route);
//   };


//   /* =========================================================
//      FILTER TABS
//   ========================================================= */

//   const filterTabs = [
//     {
//       label: "All Alerts",
//       value: "All",
//       icon: Bell,
//       count:
//         visibleItems.length,
//     },

//     {
//       label: "Documents",
//       value: "Documents",
//       icon: FileText,
//       count:
//         documentCount,
//     },

//     {
//       label: "EMI",
//       value: "EMI",
//       icon: CreditCard,
//       count:
//         emiCount,
//     },

//     {
//       label: "Challans",
//       value: "Challans",
//       icon: ReceiptText,
//       count:
//         challanCount,
//     },
//   ];


//   /* =========================================================
//      UI
//   ========================================================= */

//   return (
//     <>
//       <PageHeader
//          title={
//             <div className="flex items-center gap-3">
//               <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 transition duration-300 hover:scale-110 hover:rotate-3">
//                 <Bell
//                   size={23}
//                   strokeWidth={2.3}
//                 />
//               </div>
//               <div>
//                 <span className="block text-2xl font-bold text-slate-800">
//                   Notifications
//                 </span>
//               </div>
//             </div>
//           }
//           subtitle="Stay updated with document, EMI and challan alerts."
//       />

//       <div className="space-y-6">


//         {/* ===================================================
//             BLUE INTRO BANNER
//         =================================================== */}

//         <motion.div
//           initial={{
//             opacity: 0,
//             y: -12,
//           }}
//           animate={{
//             opacity: 1,
//             y: 0,
//           }}
//           transition={{
//             duration: 0.45,
//           }}
//           className="
//             group
//             relative
//             overflow-hidden
//             rounded-2xl
//             border
//             border-blue-200
//             bg-gradient-to-r
//             from-blue-600
//             via-indigo-600
//             to-blue-700
//             p-6
//             shadow-sm
//             transition-all
//             duration-500
//             hover:-translate-y-0.5
//             hover:shadow-xl
//             hover:shadow-blue-100
//           "
//         >

//           {/* Background glow */}

//           <div
//             className="
//               pointer-events-none
//               absolute
//               -right-16
//               -top-20
//               h-56
//               w-56
//               rounded-full
//               bg-white/15
//               blur-3xl
//               transition-transform
//               duration-700
//               group-hover:scale-125
//             "
//           />

//           <div
//             className="
//               pointer-events-none
//               absolute
//               -bottom-24
//               left-1/3
//               h-48
//               w-48
//               rounded-full
//               bg-indigo-300/20
//               blur-3xl
//             "
//           />

//           {/* Decorative circles */}

//           <div
//             className="
//               pointer-events-none
//               absolute
//               right-10
//               top-6
//               h-20
//               w-20
//               rounded-full
//               border
//               border-white/10
//             "
//           />

//           <div
//             className="
//               pointer-events-none
//               absolute
//               right-16
//               top-12
//               h-8
//               w-8
//               rounded-full
//               bg-white/10
//             "
//           />


//           <div className="
//             relative
//             flex
//             flex-col
//             gap-5
//             sm:flex-row
//             sm:items-center
//             sm:justify-between
//           ">

//             <div className="
//               flex
//               items-center
//               gap-4
//             ">

//               <motion.div
//                 initial={{
//                   scale: 0.8,
//                   opacity: 0,
//                 }}
//                 animate={{
//                   scale: 1,
//                   opacity: 1,
//                 }}
//                 whileHover={{
//                   scale: 1.08,
//                   rotate: -5,
//                 }}
//                 transition={{
//                   duration: 0.35,
//                 }}
//                 className="
//                   flex
//                   h-14
//                   w-14
//                   shrink-0
//                   items-center
//                   justify-center
//                   rounded-2xl
//                   bg-white/15
//                   text-white
//                   ring-1
//                   ring-white/20
//                   shadow-lg
//                   shadow-blue-900/20
//                 "
//               >
//                 <Bell
//                   size={27}
//                 />
//               </motion.div>


//               <div>

//                 <p className="
//                   text-xs
//                   font-semibold
//                   uppercase
//                   tracking-[0.16em]
//                   text-blue-100
//                 ">
//                   Fleet Alerts
//                 </p>

//                 <h2 className="
//                   mt-1
//                   text-xl
//                   font-bold
//                   text-white
//                 ">
//                   Keep your fleet up to date
//                 </h2>

//                 <p className="
//                   mt-1
//                   text-sm
//                   text-blue-100
//                 ">
//                   Review important alerts before they become problems.
//                 </p>

//               </div>

//             </div>


//             <div className="
//               flex
//               items-center
//               gap-2
//               self-start
//               rounded-xl
//               border
//               border-white/20
//               bg-white/10
//               px-4
//               py-2.5
//               text-sm
//               font-semibold
//               text-white
//               shadow-sm
//               backdrop-blur-sm
//               transition-all
//               duration-300
//               group-hover:bg-white/15
//               sm:self-auto
//             ">

//               <ShieldAlert
//                 size={17}
//                 className="text-blue-100"
//               />

//               <span>
//                 {visibleItems.length} active{" "}
//                 {visibleItems.length === 1
//                   ? "alert"
//                   : "alerts"}
//               </span>

//             </div>

//           </div>


//           {/* Banner bottom hover line */}

//           <motion.div
//             className="
//               absolute
//               bottom-0
//               left-0
//               h-1
//               w-full
//               origin-left
//               bg-white/70
//             "
//             initial={{
//               scaleX: 0,
//             }}
//             whileHover={{
//               scaleX: 1,
//             }}
//             transition={{
//               duration: 0.5,
//             }}
//           />

//         </motion.div>


//         {/* ===================================================
//             SUMMARY CARDS
//         =================================================== */}

//         <motion.div
//           variants={containerVariants}
//           initial="hidden"
//           animate="show"
//           className="
//             grid
//             grid-cols-1
//             gap-4
//             sm:grid-cols-2
//             xl:grid-cols-4
//           "
//         >

//           {/* TOTAL ALERTS */}

//           <motion.div
//             variants={itemVariants}
//             whileHover={{
//               y: -5,
//               scale: 1.01,
//             }}
//             className="
//               group
//               relative
//               overflow-hidden
//               rounded-2xl
//               border
//               border-blue-100
//               bg-gradient-to-br
//               from-white
//               via-white
//               to-blue-50/70
//               p-5
//               shadow-sm
//               transition-all
//               duration-300
//               hover:border-blue-200
//               hover:shadow-xl
//               hover:shadow-blue-100/70
//             "
//           >

//             {/* Thick hover bottom line */}

//             <div className="
//               absolute
//               bottom-0
//               left-0
//               h-[3px]
//               w-0
//               bg-blue-500
//               transition-all
//               duration-500
//               ease-out
//               group-hover:w-full
//             " />

//             <div className="
//               absolute
//               -right-8
//               -top-8
//               h-20
//               w-20
//               rounded-full
//               bg-blue-100/60
//               blur-2xl
//               transition-transform
//               duration-500
//               group-hover:scale-150
//             " />

//             <div className="
//               relative
//               flex
//               items-center
//               justify-between
//             ">

//               <div>

//                 <p className="
//                   text-sm
//                   font-medium
//                   text-slate-500
//                 ">
//                   Total Alerts
//                 </p>

//                 <motion.h3
//                   key={visibleItems.length}
//                   initial={{
//                     opacity: 0,
//                     y: 5,
//                   }}
//                   animate={{
//                     opacity: 1,
//                     y: 0,
//                   }}
//                   className="
//                     mt-2
//                     text-2xl
//                     font-bold
//                     text-slate-900
//                   "
//                 >
//                   {visibleItems.length}
//                 </motion.h3>

//                 <p className="
//                   mt-1
//                   text-xs
//                   text-blue-500
//                 ">
//                   Currently active
//                 </p>

//               </div>


//               <div className="
//                 rounded-2xl
//                 bg-blue-100
//                 p-3.5
//                 text-blue-600
//                 shadow-sm
//                 transition-all
//                 duration-300
//                 group-hover:scale-110
//                 group-hover:bg-blue-200
//                 group-hover:shadow-md
//               ">
//                 <Bell
//                   size={22}
//                 />
//               </div>

//             </div>

//           </motion.div>


//           {/* DOCUMENT ALERTS */}

//           <motion.div
//             variants={itemVariants}
//             whileHover={{
//               y: -5,
//               scale: 1.01,
//             }}
//             className="
//               group
//               relative
//               overflow-hidden
//               rounded-2xl
//               border
//               border-amber-100
//               bg-gradient-to-br
//               from-white
//               via-white
//               to-amber-50/70
//               p-5
//               shadow-sm
//               transition-all
//               duration-300
//               hover:border-amber-200
//               hover:shadow-xl
//               hover:shadow-amber-100/70
//             "
//           >

//             <div className="
//               absolute
//               bottom-0
//               left-0
//               h-[3px]
//               w-0
//               bg-amber-500
//               transition-all
//               duration-500
//               ease-out
//               group-hover:w-full
//             " />

//             <div className="
//               absolute
//               -right-8
//               -top-8
//               h-20
//               w-20
//               rounded-full
//               bg-amber-100/70
//               blur-2xl
//               transition-transform
//               duration-500
//               group-hover:scale-150
//             " />

//             <div className="
//               relative
//               flex
//               items-center
//               justify-between
//             ">

//               <div>

//                 <p className="
//                   text-sm
//                   font-medium
//                   text-slate-500
//                 ">
//                   Document Alerts
//                 </p>

//                 <motion.h3
//                   key={documentCount}
//                   initial={{
//                     opacity: 0,
//                     y: 5,
//                   }}
//                   animate={{
//                     opacity: 1,
//                     y: 0,
//                   }}
//                   className="
//                     mt-2
//                     text-2xl
//                     font-bold
//                     text-slate-900
//                   "
//                 >
//                   {documentCount}
//                 </motion.h3>

//                 <p className="
//                   mt-1
//                   text-xs
//                   text-amber-600
//                 ">
//                   Expired & expiring
//                 </p>

//               </div>


//               <div className="
//                 rounded-2xl
//                 bg-amber-100
//                 p-3.5
//                 text-amber-600
//                 shadow-sm
//                 transition-all
//                 duration-300
//                 group-hover:scale-110
//                 group-hover:bg-amber-200
//                 group-hover:shadow-md
//               ">
//                 <FileText
//                   size={22}
//                 />
//               </div>

//             </div>

//           </motion.div>


//           {/* EMI ALERTS */}

//           <motion.div
//             variants={itemVariants}
//             whileHover={{
//               y: -5,
//               scale: 1.01,
//             }}
//             className="
//               group
//               relative
//               overflow-hidden
//               rounded-2xl
//               border
//               border-indigo-100
//               bg-gradient-to-br
//               from-white
//               via-white
//               to-indigo-50/70
//               p-5
//               shadow-sm
//               transition-all
//               duration-300
//               hover:border-indigo-200
//               hover:shadow-xl
//               hover:shadow-indigo-100/70
//             "
//           >

//             <div className="
//               absolute
//               bottom-0
//               left-0
//               h-[3px]
//               w-0
//               bg-indigo-500
//               transition-all
//               duration-500
//               ease-out
//               group-hover:w-full
//             " />

//             <div className="
//               absolute
//               -right-8
//               -top-8
//               h-20
//               w-20
//               rounded-full
//               bg-indigo-100/70
//               blur-2xl
//               transition-transform
//               duration-500
//               group-hover:scale-150
//             " />

//             <div className="
//               relative
//               flex
//               items-center
//               justify-between
//             ">

//               <div>

//                 <p className="
//                   text-sm
//                   font-medium
//                   text-slate-500
//                 ">
//                   EMI Alerts
//                 </p>

//                 <motion.h3
//                   key={emiCount}
//                   initial={{
//                     opacity: 0,
//                     y: 5,
//                   }}
//                   animate={{
//                     opacity: 1,
//                     y: 0,
//                   }}
//                   className="
//                     mt-2
//                     text-2xl
//                     font-bold
//                     text-slate-900
//                   "
//                 >
//                   {emiCount}
//                 </motion.h3>

//                 <p className="
//                   mt-1
//                   text-xs
//                   text-indigo-600
//                 ">
//                   Upcoming payments
//                 </p>

//               </div>


//               <div className="
//                 rounded-2xl
//                 bg-indigo-100
//                 p-3.5
//                 text-indigo-600
//                 shadow-sm
//                 transition-all
//                 duration-300
//                 group-hover:scale-110
//                 group-hover:bg-indigo-200
//                 group-hover:shadow-md
//               ">
//                 <CreditCard
//                   size={22}
//                 />
//               </div>

//             </div>

//           </motion.div>


//           {/* CHALLAN ALERTS */}

//           <motion.div
//             variants={itemVariants}
//             whileHover={{
//               y: -5,
//               scale: 1.01,
//             }}
//             className="
//               group
//               relative
//               overflow-hidden
//               rounded-2xl
//               border
//               border-red-100
//               bg-gradient-to-br
//               from-white
//               via-white
//               to-red-50/70
//               p-5
//               shadow-sm
//               transition-all
//               duration-300
//               hover:border-red-200
//               hover:shadow-xl
//               hover:shadow-red-100/70
//             "
//           >

//             <div className="
//               absolute
//               bottom-0
//               left-0
//               h-[3px]
//               w-0
//               bg-red-500
//               transition-all
//               duration-500
//               ease-out
//               group-hover:w-full
//             " />

//             <div className="
//               absolute
//               -right-8
//               -top-8
//               h-20
//               w-20
//               rounded-full
//               bg-red-100/70
//               blur-2xl
//               transition-transform
//               duration-500
//               group-hover:scale-150
//             " />

//             <div className="
//               relative
//               flex
//               items-center
//               justify-between
//             ">

//               <div>

//                 <p className="
//                   text-sm
//                   font-medium
//                   text-slate-500
//                 ">
//                   Challan Alerts
//                 </p>

//                 <motion.h3
//                   key={challanCount}
//                   initial={{
//                     opacity: 0,
//                     y: 5,
//                   }}
//                   animate={{
//                     opacity: 1,
//                     y: 0,
//                   }}
//                   className="
//                     mt-2
//                     text-2xl
//                     font-bold
//                     text-slate-900
//                   "
//                 >
//                   {challanCount}
//                 </motion.h3>

//                 <p className="
//                   mt-1
//                   text-xs
//                   text-red-600
//                 ">
//                   Pending payments
//                 </p>

//               </div>


//               <div className="
//                 rounded-2xl
//                 bg-red-100
//                 p-3.5
//                 text-red-600
//                 shadow-sm
//                 transition-all
//                 duration-300
//                 group-hover:scale-110
//                 group-hover:bg-red-200
//                 group-hover:shadow-md
//               ">
//                 <ReceiptText
//                   size={22}
//                 />
//               </div>

//             </div>

//           </motion.div>

//         </motion.div>


//         {/* ===================================================
//             MAIN NOTIFICATION PANEL
//         =================================================== */}

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
//           className="
//             overflow-hidden
//             rounded-2xl
//             border
//             border-slate-200
//             bg-white
//             shadow-sm
//             transition-shadow
//             duration-300
//             hover:shadow-md
//           "
//         >


//           {/* PANEL HEADER */}

//           <div className="
//             flex
//             flex-col
//             gap-4
//             border-b
//             border-slate-100
//             px-5
//             py-5
//             sm:flex-row
//             sm:items-center
//             sm:justify-between
//             sm:px-6
//           ">

//             <div>

//               <div className="
//                 flex
//                 items-center
//                 gap-2
//               ">

//                 <div className="
//                   flex
//                   h-9
//                   w-9
//                   items-center
//                   justify-center
//                   rounded-xl
//                   bg-blue-50
//                   text-blue-600
//                   transition-all
//                   duration-300
//                   hover:scale-105
//                   hover:bg-blue-100
//                 ">
//                   <Clock3
//                     size={18}
//                   />
//                 </div>

//                 <h3 className="
//                   text-base
//                   font-bold
//                   text-slate-900
//                 ">
//                   Recent Alerts
//                 </h3>

//               </div>

//               <p className="
//                 mt-1
//                 text-xs
//                 text-slate-400
//               ">
//                 Automatically generated from your fleet data
//               </p>

//             </div>


//             <div className="
//               rounded-lg
//               border
//               border-blue-100
//               bg-blue-50
//               px-3
//               py-1.5
//               text-xs
//               font-semibold
//               text-blue-600
//             ">
//               Reminder window:{" "}
//               <span className="text-blue-800">
//                 {reminderDays} days
//               </span>
//             </div>

//           </div>


//           {/* FILTER TABS */}

//           <div className="
//             border-b
//             border-slate-100
//             px-4
//             py-3
//             sm:px-6
//           ">

//             <div className="
//               flex
//               gap-2
//               overflow-x-auto
//               pb-1
//               [&::-webkit-scrollbar]:h-1
//               [&::-webkit-scrollbar-thumb]:rounded-full
//               [&::-webkit-scrollbar-thumb]:bg-slate-200
//             ">

//               {filterTabs.map(
//                 (tab) => {
//                   const TabIcon =
//                     tab.icon;

//                   const active =
//                     filter ===
//                     tab.value;

//                   return (
//                     <button
//                       key={
//                         tab.value
//                       }
//                       type="button"
//                       onClick={() =>
//                         setFilter(
//                           tab.value
//                         )
//                       }
//                       className={`
//                         group
//                         relative
//                         flex
//                         shrink-0
//                         items-center
//                         gap-2
//                         rounded-xl
//                         px-3.5
//                         py-2.5
//                         text-sm
//                         font-semibold
//                         transition-all
//                         duration-300

//                         ${
//                           active
//                             ? `
//                               bg-blue-50
//                               text-blue-700
//                               shadow-sm
//                             `
//                             : `
//                               text-slate-500
//                               hover:bg-slate-50
//                               hover:text-slate-800
//                             `
//                         }
//                       `}
//                     >

//                       <TabIcon
//                         size={16}
//                         className={`
//                           transition-transform
//                           duration-300
//                           ${
//                             active
//                               ? "scale-110"
//                               : "group-hover:scale-110"
//                           }
//                         `}
//                       />

//                       <span>
//                         {
//                           tab.label
//                         }
//                       </span>

//                       <span
//                         className={`
//                           min-w-5
//                           rounded-full
//                           px-1.5
//                           py-0.5
//                           text-center
//                           text-[10px]
//                           font-bold

//                           ${
//                             active
//                               ? `
//                                 bg-blue-600
//                                 text-white
//                               `
//                               : `
//                                 bg-slate-100
//                                 text-slate-500
//                               `
//                           }
//                         `}
//                       >
//                         {
//                           tab.count
//                         }
//                       </span>


//                       {/* THICK FILTER BOTTOM LINE */}

//                       <motion.span
//                         initial={false}
//                         animate={{
//                           width: active
//                             ? "100%"
//                             : "0%",
//                         }}
//                         transition={{
//                           duration: 0.25,
//                         }}
//                         className="
//                           absolute
//                           bottom-0
//                           left-1/2
//                           h-[3px]
//                           -translate-x-1/2
//                           rounded-full
//                           bg-blue-600
//                         "
//                       />

//                     </button>
//                   );
//                 }
//               )}

//             </div>

//           </div>


//           {/* =================================================
//               NOTIFICATION LIST
//           ================================================= */}

//           {shown.length > 0 ? (

//             <motion.div
//               variants={
//                 containerVariants
//               }
//               initial="hidden"
//               animate="show"
//             >

//               {shown.map(
//                 (item) => {
//                   const Icon =
//                     item.Icon;

//                   return (

//                     <motion.div
//                       key={
//                         item.id
//                       }
//                       variants={
//                         itemVariants
//                       }
//                       className="
//                         group
//                         relative
//                         border-b
//                         border-slate-100
//                         last:border-0
//                       "
//                     >

//                       {/* LEFT STATUS LINE */}

//                       <div
//                         className={`
//                           absolute
//                           bottom-0
//                           left-0
//                           top-0
//                           w-1
//                           ${item.accent}
//                           opacity-40
//                           transition-all
//                           duration-300
//                           group-hover:w-1.5
//                           group-hover:opacity-100
//                         `}
//                       />


//                       {/* COLOUR MATCHING BOTTOM HOVER LINE */}

//                       {/* <div
//                         className={`
//                           absolute
//                           bottom-0
//                           left-5
//                           right-5
//                           z-10
//                           h-[3px]
//                           origin-left
//                           scale-x-0
//                           ${item.accent}
//                           rounded-full
//                           transition-transform
//                           duration-500
//                           ease-out
//                           group-hover:scale-x-100
//                         `}
//                       /> */}


//                       <div
//                         onClick={() =>
//                           handleNotificationClick(
//                             item
//                           )
//                         }
//                         className={`
//                           relative
//                           flex
//                           cursor-pointer
//                           items-center
//                           gap-4
//                           px-5
//                           py-5
//                           transition-all
//                           duration-300
//                           hover:bg-slate-50/80
//                           sm:px-6
//                         `}
//                       >

//                         {/* ICON */}

//                         <motion.div
//                           whileHover={{
//                             scale: 1.08,
//                             rotate: -4,
//                           }}
//                           transition={{
//                             type: "spring",
//                             stiffness: 350,
//                             damping: 20,
//                           }}
//                           className={`
//                             relative
//                             flex
//                             h-11
//                             w-11
//                             shrink-0
//                             items-center
//                             justify-center
//                             rounded-xl
//                             ${item.iconBg}
//                             ${item.color}
//                             ring-1
//                             ring-inset
//                             ring-black/5
//                             transition-all
//                             duration-300
//                             group-hover:shadow-md
//                           `}
//                         >

//                           <Icon
//                             size={20}
//                           />

//                           <span
//                             className={`
//                               absolute
//                               -right-0.5
//                               -top-0.5
//                               h-2.5
//                               w-2.5
//                               rounded-full
//                               ${item.accent}
//                               ring-2
//                               ring-white
//                             `}
//                           />

//                         </motion.div>


//                         {/* CONTENT */}

//                         <div className="
//                           min-w-0
//                           flex-1
//                         ">

//                           <div className="
//                             flex
//                             flex-wrap
//                             items-center
//                             gap-2
//                           ">

//                             <p className="
//                               text-sm
//                               font-semibold
//                               leading-5
//                               text-slate-800
//                               transition-colors
//                               duration-200
//                               group-hover:text-slate-950
//                             ">
//                               {
//                                 item.text
//                               }
//                             </p>


//                             <span
//                               className={`
//                                 rounded-full
//                                 px-2.5
//                                 py-1
//                                 text-[9px]
//                                 font-bold
//                                 uppercase
//                                 tracking-wider

//                                 ${
//                                   item.category ===
//                                   "Expired"
//                                     ? "bg-red-50 text-red-600"
//                                     : item.category ===
//                                       "Expiring Soon"
//                                     ? "bg-amber-50 text-amber-600"
//                                     : item.type ===
//                                       "EMI"
//                                     ? "bg-blue-50 text-blue-600"
//                                     : "bg-red-50 text-red-600"
//                                 }
//                               `}
//                             >
//                               {
//                                 item.category
//                               }
//                             </span>

//                           </div>


//                           <div className="
//                             mt-2
//                             flex
//                             flex-wrap
//                             items-center
//                             gap-x-2
//                             gap-y-1
//                             text-xs
//                             text-slate-400
//                           ">

//                             <span>
//                               {
//                                 item.subText
//                               }
//                             </span>

//                             <span className="hidden sm:inline">
//                               •
//                             </span>

//                             <span>
//                               Auto generated
//                             </span>

//                           </div>

//                         </div>


//                         {/* ACTION AREA */}

//                         <div className="
//                           flex
//                           shrink-0
//                           items-center
//                           gap-1
//                         ">

//                           <motion.div
//                             whileHover={{
//                               x: 3,
//                             }}
//                             className="
//                               hidden
//                               rounded-xl
//                               p-2.5
//                               text-slate-300
//                               transition-all
//                               duration-200
//                               group-hover:bg-blue-50
//                               group-hover:text-blue-600
//                               sm:flex
//                             "
//                             title="Open notification"
//                           >
//                             <ArrowRight
//                               size={17}
//                             />
//                           </motion.div>


//                           <button
//                             type="button"
//                             title="Delete notification"
//                             aria-label="Delete notification"
//                             onClick={(event) => {
//                               event.stopPropagation();

//                               setNotificationToDelete(
//                                 item
//                               );
//                             }}
//                             className="
//                               rounded-xl
//                               p-2.5
//                               text-slate-300
//                               transition-all
//                               duration-200
//                               hover:bg-red-50
//                               hover:text-red-600
//                               hover:scale-105
//                             "
//                           >
//                             <Trash2
//                               size={17}
//                             />
//                           </button>

//                         </div>

//                       </div>

//                     </motion.div>
//                   );
//                 }
//               )}

//             </motion.div>

//           ) : (

//             /* EMPTY STATE */

//             <motion.div
//               initial={{
//                 opacity: 0,
//                 y: 10,
//               }}
//               animate={{
//                 opacity: 1,
//                 y: 0,
//               }}
//               className="
//                 flex
//                 min-h-[320px]
//                 flex-col
//                 items-center
//                 justify-center
//                 px-6
//                 text-center
//               "
//             >

//               <motion.div
//                 animate={{
//                   y: [0, -5, 0],
//                 }}
//                 transition={{
//                   duration: 2.5,
//                   repeat: Infinity,
//                   ease: "easeInOut",
//                 }}
//                 className="
//                   flex
//                   h-16
//                   w-16
//                   items-center
//                   justify-center
//                   rounded-2xl
//                   bg-emerald-50
//                   text-emerald-500
//                   ring-8
//                   ring-emerald-50/60
//                 "
//               >
//                 <CheckCircle2
//                   size={31}
//                 />
//               </motion.div>


//               <h3 className="
//                 mt-6
//                 text-base
//                 font-bold
//                 text-slate-800
//               ">
//                 No notifications
//               </h3>


//               <p className="
//                 mt-2
//                 max-w-md
//                 text-sm
//                 leading-6
//                 text-slate-400
//               ">
//                 You are all caught up. There are no active alerts matching this filter.
//               </p>

//             </motion.div>

//           )}

//         </motion.div>


//         {/* ===================================================
//             FOOTER INFORMATION
//         =================================================== */}

//         <div className="
//           group
//           relative
//           flex
//           flex-col
//           gap-3
//           overflow-hidden
//           rounded-2xl
//           border
//           border-blue-100
//           bg-blue-50/60
//           px-5
//           py-4
//           text-xs
//           text-slate-500
//           sm:flex-row
//           sm:items-center
//           sm:justify-between
//           sm:px-6
//         ">

//           {/* Footer hover line */}

//           <div className="
//             absolute
//             bottom-0
//             left-0
//             h-[3px]
//             w-0
//             bg-blue-500
//             transition-all
//             duration-500
//             group-hover:w-full
//           " />

//           <div className="
//             flex
//             items-center
//             gap-2
//           ">

//             <Bell
//               size={14}
//               className="text-blue-500"
//             />

//             <span>
//               Notifications are automatically generated from your fleet records.
//             </span>

//           </div>

//           <div className="
//             font-semibold
//             text-blue-600
//           ">
//             {paymentCount} payment{" "}
//             {paymentCount === 1
//               ? "alert"
//               : "alerts"}
//           </div>

//         </div>

//       </div>


//       {/* =====================================================
//           DELETE CONFIRMATION MODAL
//       ===================================================== */}

//       <AnimatePresence>

//         {notificationToDelete && (

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
//             className="
//               fixed
//               inset-0
//               z-[100]
//               flex
//               items-center
//               justify-center
//               bg-slate-950/50
//               px-4
//               backdrop-blur-sm
//             "
//             onClick={() =>
//               setNotificationToDelete(
//                 null
//               )
//             }
//           >

//             <motion.div
//               variants={
//                 modalVariants
//               }
//               initial="hidden"
//               animate="show"
//               exit="exit"
//               onClick={(event) =>
//                 event.stopPropagation()
//               }
//               className="
//                 w-full
//                 max-w-md
//                 overflow-hidden
//                 rounded-2xl
//                 border
//                 border-slate-200
//                 bg-white
//                 shadow-2xl
//               "
//             >

//               <div className="
//                 border-b
//                 border-slate-100
//                 px-6
//                 py-5
//               ">

//                 <div className="
//                   flex
//                   items-start
//                   justify-between
//                 ">

//                   <div className="
//                     flex
//                     items-center
//                     gap-3
//                   ">

//                     <div className="
//                       flex
//                       h-11
//                       w-11
//                       items-center
//                       justify-center
//                       rounded-xl
//                       bg-red-50
//                       text-red-600
//                     ">
//                       <Trash2
//                         size={20}
//                       />
//                     </div>


//                     <div>

//                       <h3 className="
//                         text-base
//                         font-bold
//                         text-slate-900
//                       ">
//                         Delete notification?
//                       </h3>

//                       <p className="
//                         mt-1
//                         text-xs
//                         text-slate-400
//                       ">
//                         This action will dismiss this alert.
//                       </p>

//                     </div>

//                   </div>


//                   <button
//                     type="button"
//                     onClick={() =>
//                       setNotificationToDelete(
//                         null
//                       )
//                     }
//                     className="
//                       rounded-lg
//                       p-2
//                       text-slate-400
//                       transition-all
//                       hover:bg-slate-100
//                       hover:text-slate-700
//                     "
//                   >
//                     <X
//                       size={18}
//                     />
//                   </button>

//                 </div>

//               </div>


//               <div className="px-6 py-5">

//                 <div className="
//                   rounded-xl
//                   border
//                   border-slate-100
//                   bg-slate-50
//                   p-4
//                 ">

//                   <div className="
//                     mb-2
//                     flex
//                     items-center
//                     gap-2
//                     text-xs
//                     font-semibold
//                     text-slate-400
//                   ">

//                     <Bell
//                       size={13}
//                     />

//                     Notification

//                   </div>


//                   <p className="
//                     text-sm
//                     font-medium
//                     leading-6
//                     text-slate-700
//                   ">
//                     {
//                       notificationToDelete.text
//                     }
//                   </p>

//                 </div>


//                 <p className="
//                   mt-4
//                   text-xs
//                   leading-5
//                   text-slate-400
//                 ">
//                   The underlying document, EMI or challan will not be deleted. Only this notification will be dismissed.
//                 </p>

//               </div>


//               <div className="
//                 flex
//                 justify-end
//                 gap-3
//                 border-t
//                 border-slate-100
//                 bg-slate-50/70
//                 px-6
//                 py-4
//               ">

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setNotificationToDelete(
//                       null
//                     )
//                   }
//                   className="
//                     rounded-xl
//                     border
//                     border-slate-200
//                     bg-white
//                     px-5
//                     py-2.5
//                     text-sm
//                     font-semibold
//                     text-slate-700
//                     shadow-sm
//                     transition-all
//                     duration-200
//                     hover:-translate-y-0.5
//                     hover:bg-slate-50
//                     hover:shadow
//                   "
//                 >
//                   No
//                 </button>


//                 <button
//                   type="button"
//                   onClick={
//                     confirmDelete
//                   }
//                   className="
//                     rounded-xl
//                     bg-gradient-to-r
//                     from-red-600
//                     to-rose-600
//                     px-5
//                     py-2.5
//                     text-sm
//                     font-semibold
//                     text-white
//                     shadow-sm
//                     shadow-red-200
//                     transition-all
//                     duration-200
//                     hover:-translate-y-0.5
//                     hover:from-red-700
//                     hover:to-rose-700
//                     hover:shadow-md
//                     active:translate-y-0
//                   "
//                 >
//                   Yes, Delete
//                 </button>

//               </div>

//             </motion.div>

//           </motion.div>

//         )}

//       </AnimatePresence>
//     </>
//   );
// }











import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import PageHeader from "../components/PageHeader";

import {
  Bell,
  FileText,
  AlertTriangle,
  CreditCard,
  ReceiptText,
  Trash2,
  X,
  CheckCircle2,
  Clock3,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

import {
  useFleet,
  getExpiryStatus,
  getDaysLeft,
  parseDate,
  formatDate,
} from "../context/fleetContext";


/* =========================================================
   ANIMATION VARIANTS
========================================================= */

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.055,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },

  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      ease: "easeOut",
    },
  },
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    y: 20,
  },

  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: "easeOut",
    },
  },

  exit: {
    opacity: 0,
    scale: 0.94,
    y: 20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};


/* =========================================================
   DATE HELPERS
========================================================= */

function getMonthStart() {
  const today = new Date();

  return new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );
}

function getMonthEnd() {
  const today = new Date();

  return new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  );
}

function isDateInCurrentMonth(value) {
  const date = parseDate(value);

  if (!date) {
    return false;
  }

  const monthStart = getMonthStart();
  const monthEnd = getMonthEnd();

  date.setHours(0, 0, 0, 0);

  monthStart.setHours(0, 0, 0, 0);

  monthEnd.setHours(
    23,
    59,
    59,
    999
  );

  return (
    date >= monthStart &&
    date <= monthEnd
  );
}


/* =========================================================
   NOTIFICATIONS PAGE
========================================================= */

export default function Notifications() {
  const navigate = useNavigate();

  const {
    documents = [],
    emis = [],
    challans = [],
    settings,
    dismissedNotifications = [],
    dismissNotification,
  } = useFleet();

  const [
    filter,
    setFilter,
  ] = useState("All");

  const [
    notificationToDelete,
    setNotificationToDelete,
  ] = useState(null);


  /* =========================================================
     REMINDER DAYS
  ========================================================= */

  const reminderDays =
    Number(
      settings?.reminderDays ?? 10
    );


  /* =========================================================
     GENERATE NOTIFICATIONS
  ========================================================= */

  const items = useMemo(() => {
    if (settings?.inAppNotifications === false) return [];

    const notificationList = [];


    /* =======================================================
       DOCUMENT NOTIFICATIONS
    ======================================================= */

    if (settings?.documentAlerts !== false) {
      documents.forEach((document) => {

        if (!document?.expiry) {
          return;
        }


        /* -----------------------------------------------------
           RENEWED DOCUMENT CHECK

           A document that has already been renewed must not
           generate an old Expired or Expiring notification.
        ----------------------------------------------------- */

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


        /*
          IMPORTANT:
          Stop processing this document completely if it
          has already been renewed.
        */
        if (isRenewed) {
          return;
        }


        const status =
          getExpiryStatus(
            document.expiry,
            reminderDays
          );

        const daysLeft =
          getDaysLeft(
            document.expiry
          );


        /* -----------------------------------------------------
           EXPIRED DOCUMENT
        ----------------------------------------------------- */

        if (
          status === "Expired" &&
          daysLeft !== null
        ) {
          const expiredDays =
            Math.abs(daysLeft);

          notificationList.push({
            id:
              `document-expired-${document.id}`,

            type: "Documents",

            category: "Expired",

            text: `${
              document.type ||
              document.name ||
              "Document"
            } of ${
              document.vehicle ||
              document.vehicleNumber ||
              "vehicle"
            } expired ${expiredDays} ${
              expiredDays === 1
                ? "day"
                : "days"
            } ago.`,

            subText:
              `Expired on ${formatDate(
                document.expiry
              )}`,

            Icon: AlertTriangle,

            color:
              "text-red-600",

            iconBg:
              "bg-red-50",

            accent:
              "bg-red-500",

            hoverBorder:
              "group-hover:border-red-200",

            route:
              "/documents",

            date:
              parseDate(
                document.expiry
              ),
          });
        }


        /* -----------------------------------------------------
           EXPIRING SOON DOCUMENT
        ----------------------------------------------------- */

        if (
          status === "Expiring Soon" &&
          daysLeft !== null &&
          daysLeft >= 0
        ) {
          notificationList.push({
            id:
              `document-expiring-${document.id}`,

            type: "Documents",

            category:
              "Expiring Soon",

            text: `${
              document.type ||
              document.name ||
              "Document"
            } of ${
              document.vehicle ||
              document.vehicleNumber ||
              "vehicle"
            } will expire in ${
              daysLeft
            } ${
              daysLeft === 1
                ? "day"
                : "days"
            }.`,

            subText:
              `Expiry date: ${formatDate(
                document.expiry
              )}`,

            Icon: FileText,

            color:
              "text-amber-600",

            iconBg:
              "bg-amber-50",

            accent:
              "bg-amber-500",

            hoverBorder:
              "group-hover:border-amber-200",

            route:
              "/documents",

            date:
              parseDate(
                document.expiry
              ),
          });
        }
      });
    }


    /* =======================================================
       CHALLAN NOTIFICATIONS
    ======================================================= */

    if (settings?.challanAlerts !== false) {
      challans.forEach((challan) => {
        if (
          challan?.status === "Paid"
        ) {
          return;
        }

        notificationList.push({
          id:
            `challan-${challan.id}`,

          type: "Challans",

          category:
            "Pending",

          text:
            `Challan ${
              challan.number ||
              challan.challanNumber ||
              "record"
            } is pending payment.`,

          subText:
            challan.vehicle ||
            challan.vehicleNumber
              ? `Vehicle: ${
                  challan.vehicle ||
                  challan.vehicleNumber
                }`
              : "Payment is pending.",

          Icon:
            ReceiptText,

          color:
            "text-red-600",

          iconBg:
            "bg-red-50",

          accent:
            "bg-red-500",

          hoverBorder:
            "group-hover:border-red-200",

          route:
            "/challans",

          date:
            parseDate(
              challan.dueDate ||
                challan.due ||
                challan.date ||
                challan.createdAt
            ),
        });
      });
    }


    /* =======================================================
       EMI NOTIFICATIONS
    ======================================================= */

    if (settings?.emiAlerts !== false) {
      const emiReminderDays =
        Number(
          settings?.emiReminderDays ??
            reminderDays
        );

      emis.forEach((emi) => {
        if (
          emi?.status === "Paid" ||
          emi?.paid === true
        ) {
          return;
        }

        const dueDate =
          emi.dueDate ||
          emi.due ||
          emi.emiDate ||
          emi.date;

        const parsedDueDate =
          parseDate(dueDate);

        if (!parsedDueDate) {
          return;
        }

        if (
          !isDateInCurrentMonth(
            dueDate
          )
        ) {
          return;
        }

        const daysUntilDue =
          getDaysLeft(dueDate);

        if (
          daysUntilDue === null
        ) {
          return;
        }

        if (
          daysUntilDue < 0 ||
          daysUntilDue > emiReminderDays
        ) {
          return;
        }

        const amount =
          Number(
            emi.emiAmount ??
              emi.amount ??
              0
          );

        notificationList.push({
          id:
            `emi-${emi.id}`,

          type:
            "EMI",

          category:
            "Pending",

          text:
            `EMI payment of ${
              emi.vehicleNumber ||
              emi.vehicle ||
              "vehicle"
            } is due ${
              daysUntilDue === 0
                ? "today"
                : `in ${daysUntilDue} ${
                    daysUntilDue === 1
                      ? "day"
                      : "days"
                  }`
            }.`,

          subText:
            `Due: ${formatDate(
              dueDate
            )} • ₹${amount.toLocaleString(
              "en-IN"
            )}`,

          Icon:
            CreditCard,

          color:
            "text-blue-600",

          iconBg:
            "bg-blue-50",

          accent:
            "bg-blue-500",

          hoverBorder:
            "group-hover:border-blue-200",

          route:
            "/emi",

          date:
            parsedDueDate,
        });
      });
    }


    /* =======================================================
       SORT
    ======================================================= */

    return notificationList.sort(
      (a, b) => {
        const dateA =
          a.date?.getTime?.() || 0;

        const dateB =
          b.date?.getTime?.() || 0;

        return (
          dateB - dateA
        );
      }
    );
  }, [
    documents,
    emis,
    challans,
    settings,
    reminderDays,
  ]);


  /* =========================================================
     REMOVE DISMISSED NOTIFICATIONS
========================================================= */

  const visibleItems =
    useMemo(() => {
      return items.filter(
        (item) =>
          !dismissedNotifications.includes(
            item.id
          )
      );
    }, [
      items,
      dismissedNotifications,
    ]);


  /* =========================================================
     FILTER
========================================================= */

  const shown =
    filter === "All"
      ? visibleItems
      : visibleItems.filter(
          (item) =>
            item.type === filter
        );


  /* =========================================================
     COUNTS
========================================================= */

  const documentCount =
    visibleItems.filter(
      (item) =>
        item.type === "Documents"
    ).length;

  const emiCount =
    visibleItems.filter(
      (item) =>
        item.type === "EMI"
    ).length;

  const challanCount =
    visibleItems.filter(
      (item) =>
        item.type === "Challans"
    ).length;

  const paymentCount =
    emiCount +
    challanCount;


  /* =========================================================
     DELETE CONFIRMATION
========================================================= */

  const confirmDelete = () => {
    if (
      !notificationToDelete
    ) {
      return;
    }

    dismissNotification(
      notificationToDelete.id
    );

    setNotificationToDelete(
      null
    );
  };


  /* =========================================================
     OPEN NOTIFICATION
========================================================= */

  const handleNotificationClick = (
    item
  ) => {
    if (!item?.route) {
      return;
    }

    navigate(item.route);
  };


  /* =========================================================
     FILTER TABS
========================================================= */

  const filterTabs = [
    {
      label: "All Alerts",
      value: "All",
      icon: Bell,
      count:
        visibleItems.length,
    },

    {
      label: "Documents",
      value: "Documents",
      icon: FileText,
      count:
        documentCount,
    },

    {
      label: "EMI",
      value: "EMI",
      icon: CreditCard,
      count:
        emiCount,
    },

    {
      label: "Challans",
      value: "Challans",
      icon: ReceiptText,
      count:
        challanCount,
    },
  ];


  /* =========================================================
     UI
========================================================= */

  return (
    <>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 transition duration-300 hover:scale-110 hover:rotate-3">
              <Bell
                size={23}
                strokeWidth={2.3}
              />
            </div>

            <div>
              <span className="block text-2xl font-bold text-slate-800">
                Notifications
              </span>
            </div>
          </div>
        }
        subtitle="Stay updated with document, EMI and challan alerts."
      />

      <div className="space-y-6">


        {/* ===================================================
            BLUE INTRO BANNER
        =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: -12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
          }}
          className="
            group
            relative
            overflow-hidden
            rounded-2xl
            border
            border-blue-200
            bg-gradient-to-r
            from-blue-600
            via-indigo-600
            to-blue-700
            p-6
            shadow-sm
            transition-all
            duration-500
            hover:-translate-y-0.5
            hover:shadow-xl
            hover:shadow-blue-100
          "
        >

          {/* Background glow */}

          <div
            className="
              pointer-events-none
              absolute
              -right-16
              -top-20
              h-56
              w-56
              rounded-full
              bg-white/15
              blur-3xl
              transition-transform
              duration-700
              group-hover:scale-125
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-24
              left-1/3
              h-48
              w-48
              rounded-full
              bg-indigo-300/20
              blur-3xl
            "
          />

          {/* Decorative circles */}

          <div
            className="
              pointer-events-none
              absolute
              right-10
              top-6
              h-20
              w-20
              rounded-full
              border
              border-white/10
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              right-16
              top-12
              h-8
              w-8
              rounded-full
              bg-white/10
            "
          />


          <div className="
            relative
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          ">

            <div className="
              flex
              items-center
              gap-4
            ">

              <motion.div
                initial={{
                  scale: 0.8,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                whileHover={{
                  scale: 1.08,
                  rotate: -5,
                }}
                transition={{
                  duration: 0.35,
                }}
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white/15
                  text-white
                  ring-1
                  ring-white/20
                  shadow-lg
                  shadow-blue-900/20
                "
              >
                <Bell
                  size={27}
                />
              </motion.div>


              <div>

                <p className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-blue-100
                ">
                  Fleet Alerts
                </p>

                <h2 className="
                  mt-1
                  text-xl
                  font-bold
                  text-white
                ">
                  Keep your fleet up to date
                </h2>

                <p className="
                  mt-1
                  text-sm
                  text-blue-100
                ">
                  Review important alerts before they become problems.
                </p>

              </div>

            </div>


            <div className="
              flex
              items-center
              gap-2
              self-start
              rounded-xl
              border
              border-white/20
              bg-white/10
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              backdrop-blur-sm
              transition-all
              duration-300
              group-hover:bg-white/15
              sm:self-auto
            ">

              <ShieldAlert
                size={17}
                className="text-blue-100"
              />

              <span>
                {visibleItems.length} active{" "}
                {visibleItems.length === 1
                  ? "alert"
                  : "alerts"}
              </span>

            </div>

          </div>


          {/* Banner bottom hover line */}

          <motion.div
            className="
              absolute
              bottom-0
              left-0
              h-1
              w-full
              origin-left
              bg-white/70
            "
            initial={{
              scaleX: 0,
            }}
            whileHover={{
              scaleX: 1,
            }}
            transition={{
              duration: 0.5,
            }}
          />

        </motion.div>


        {/* ===================================================
            SUMMARY CARDS
        =================================================== */}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >

          {/* TOTAL ALERTS */}

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
              border-blue-100
              bg-gradient-to-br
              from-white
              via-white
              to-blue-50/70
              p-5
              shadow-sm
              transition-all
              duration-300
              hover:border-blue-200
              hover:shadow-xl
              hover:shadow-blue-100/70
            "
          >

            {/* Thick hover bottom line */}

            <div className="
              absolute
              bottom-0
              left-0
              h-[3px]
              w-0
              bg-blue-500
              transition-all
              duration-500
              ease-out
              group-hover:w-full
            " />

            <div className="
              absolute
              -right-8
              -top-8
              h-20
              w-20
              rounded-full
              bg-blue-100/60
              blur-2xl
              transition-transform
              duration-500
              group-hover:scale-150
            " />

            <div className="
              relative
              flex
              items-center
              justify-between
            ">

              <div>

                <p className="
                  text-sm
                  font-medium
                  text-slate-500
                ">
                  Total Alerts
                </p>

                <motion.h3
                  key={visibleItems.length}
                  initial={{
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="
                    mt-2
                    text-2xl
                    font-bold
                    text-slate-900
                  "
                >
                  {visibleItems.length}
                </motion.h3>

                <p className="
                  mt-1
                  text-xs
                  text-blue-500
                ">
                  Currently active
                </p>

              </div>


              <div className="
                rounded-2xl
                bg-blue-100
                p-3.5
                text-blue-600
                shadow-sm
                transition-all
                duration-300
                group-hover:scale-110
                group-hover:bg-blue-200
                group-hover:shadow-md
              ">
                <Bell
                  size={22}
                />
              </div>

            </div>

          </motion.div>


          {/* DOCUMENT ALERTS */}

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
              border-amber-100
              bg-gradient-to-br
              from-white
              via-white
              to-amber-50/70
              p-5
              shadow-sm
              transition-all
              duration-300
              hover:border-amber-200
              hover:shadow-xl
              hover:shadow-amber-100/70
            "
          >

            <div className="
              absolute
              bottom-0
              left-0
              h-[3px]
              w-0
              bg-amber-500
              transition-all
              duration-500
              ease-out
              group-hover:w-full
            " />

            <div className="
              absolute
              -right-8
              -top-8
              h-20
              w-20
              rounded-full
              bg-amber-100/70
              blur-2xl
              transition-transform
              duration-500
              group-hover:scale-150
            " />

            <div className="
              relative
              flex
              items-center
              justify-between
            ">

              <div>

                <p className="
                  text-sm
                  font-medium
                  text-slate-500
                ">
                  Document Alerts
                </p>

                <motion.h3
                  key={documentCount}
                  initial={{
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="
                    mt-2
                    text-2xl
                    font-bold
                    text-slate-900
                  "
                >
                  {documentCount}
                </motion.h3>

                <p className="
                  mt-1
                  text-xs
                  text-amber-600
                ">
                  Expired & expiring
                </p>

              </div>


              <div className="
                rounded-2xl
                bg-amber-100
                p-3.5
                text-amber-600
                shadow-sm
                transition-all
                duration-300
                group-hover:scale-110
                group-hover:bg-amber-200
                group-hover:shadow-md
              ">
                <FileText
                  size={22}
                />
              </div>

            </div>

          </motion.div>


          {/* EMI ALERTS */}

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
              border-indigo-100
              bg-gradient-to-br
              from-white
              via-white
              to-indigo-50/70
              p-5
              shadow-sm
              transition-all
              duration-300
              hover:border-indigo-200
              hover:shadow-xl
              hover:shadow-indigo-100/70
            "
          >

            <div className="
              absolute
              bottom-0
              left-0
              h-[3px]
              w-0
              bg-indigo-500
              transition-all
              duration-500
              ease-out
              group-hover:w-full
            " />

            <div className="
              absolute
              -right-8
              -top-8
              h-20
              w-20
              rounded-full
              bg-indigo-100/70
              blur-2xl
              transition-transform
              duration-500
              group-hover:scale-150
            " />

            <div className="
              relative
              flex
              items-center
              justify-between
            ">

              <div>

                <p className="
                  text-sm
                  font-medium
                  text-slate-500
                ">
                  EMI Alerts
                </p>

                <motion.h3
                  key={emiCount}
                  initial={{
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="
                    mt-2
                    text-2xl
                    font-bold
                    text-slate-900
                  "
                >
                  {emiCount}
                </motion.h3>

                <p className="
                  mt-1
                  text-xs
                  text-indigo-600
                ">
                  Upcoming payments
                </p>

              </div>


              <div className="
                rounded-2xl
                bg-indigo-100
                p-3.5
                text-indigo-600
                shadow-sm
                transition-all
                duration-300
                group-hover:scale-110
                group-hover:bg-indigo-200
                group-hover:shadow-md
              ">
                <CreditCard
                  size={22}
                />
              </div>

            </div>

          </motion.div>


          {/* CHALLAN ALERTS */}

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
              border-red-100
              bg-gradient-to-br
              from-white
              via-white
              to-red-50/70
              p-5
              shadow-sm
              transition-all
              duration-300
              hover:border-red-200
              hover:shadow-xl
              hover:shadow-red-100/70
            "
          >

            <div className="
              absolute
              bottom-0
              left-0
              h-[3px]
              w-0
              bg-red-500
              transition-all
              duration-500
              ease-out
              group-hover:w-full
            " />

            <div className="
              absolute
              -right-8
              -top-8
              h-20
              w-20
              rounded-full
              bg-red-100/70
              blur-2xl
              transition-transform
              duration-500
              group-hover:scale-150
            " />

            <div className="
              relative
              flex
              items-center
              justify-between
            ">

              <div>

                <p className="
                  text-sm
                  font-medium
                  text-slate-500
                ">
                  Challan Alerts
                </p>

                <motion.h3
                  key={challanCount}
                  initial={{
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="
                    mt-2
                    text-2xl
                    font-bold
                    text-slate-900
                  "
                >
                  {challanCount}
                </motion.h3>

                <p className="
                  mt-1
                  text-xs
                  text-red-600
                ">
                  Pending payments
                </p>

              </div>


              <div className="
                rounded-2xl
                bg-red-100
                p-3.5
                text-red-600
                shadow-sm
                transition-all
                duration-300
                group-hover:scale-110
                group-hover:bg-red-200
                group-hover:shadow-md
              ">
                <ReceiptText
                  size={22}
                />
              </div>

            </div>

          </motion.div>

        </motion.div>


        {/* ===================================================
            MAIN NOTIFICATION PANEL
        =================================================== */}

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
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
            transition-shadow
            duration-300
            hover:shadow-md
          "
        >


          {/* PANEL HEADER */}

          <div className="
            flex
            flex-col
            gap-4
            border-b
            border-slate-100
            px-5
            py-5
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-6
          ">

            <div>

              <div className="
                flex
                items-center
                gap-2
              ">

                <div className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                  text-blue-600
                  transition-all
                  duration-300
                  hover:scale-105
                  hover:bg-blue-100
                ">
                  <Clock3
                    size={18}
                  />
                </div>

                <h3 className="
                  text-base
                  font-bold
                  text-slate-900
                ">
                  Recent Alerts
                </h3>

              </div>

              <p className="
                mt-1
                text-xs
                text-slate-400
              ">
                Automatically generated from your fleet data
              </p>

            </div>


            <div className="
              rounded-lg
              border
              border-blue-100
              bg-blue-50
              px-3
              py-1.5
              text-xs
              font-semibold
              text-blue-600
            ">
              Reminder window:{" "}
              <span className="text-blue-800">
                {reminderDays} days
              </span>
            </div>

          </div>


          {/* FILTER TABS */}

          <div className="
            border-b
            border-slate-100
            px-4
            py-3
            sm:px-6
          ">

            <div className="
              flex
              gap-2
              overflow-x-auto
              pb-1
              [&::-webkit-scrollbar]:h-1
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-slate-200
            ">

              {filterTabs.map(
                (tab) => {
                  const TabIcon =
                    tab.icon;

                  const active =
                    filter ===
                    tab.value;

                  return (
                    <button
                      key={
                        tab.value
                      }
                      type="button"
                      onClick={() =>
                        setFilter(
                          tab.value
                        )
                      }
                      className={`
                        group
                        relative
                        flex
                        shrink-0
                        items-center
                        gap-2
                        rounded-xl
                        px-3.5
                        py-2.5
                        text-sm
                        font-semibold
                        transition-all
                        duration-300

                        ${
                          active
                            ? `
                              bg-blue-50
                              text-blue-700
                              shadow-sm
                            `
                            : `
                              text-slate-500
                              hover:bg-slate-50
                              hover:text-slate-800
                            `
                        }
                      `}
                    >

                      <TabIcon
                        size={16}
                        className={`
                          transition-transform
                          duration-300
                          ${
                            active
                              ? "scale-110"
                              : "group-hover:scale-110"
                          }
                        `}
                      />

                      <span>
                        {
                          tab.label
                        }
                      </span>

                      <span
                        className={`
                          min-w-5
                          rounded-full
                          px-1.5
                          py-0.5
                          text-center
                          text-[10px]
                          font-bold

                          ${
                            active
                              ? `
                                bg-blue-600
                                text-white
                              `
                              : `
                                bg-slate-100
                                text-slate-500
                              `
                          }
                        `}
                      >
                        {
                          tab.count
                        }
                      </span>


                      {/* THICK FILTER BOTTOM LINE */}

                      <motion.span
                        initial={false}
                        animate={{
                          width: active
                            ? "100%"
                            : "0%",
                        }}
                        transition={{
                          duration: 0.25,
                        }}
                        className="
                          absolute
                          bottom-0
                          left-1/2
                          h-[3px]
                          -translate-x-1/2
                          rounded-full
                          bg-blue-600
                        "
                      />

                    </button>
                  );
                }
              )}

            </div>

          </div>


          {/* =================================================
              NOTIFICATION LIST
          ================================================= */}

          {shown.length > 0 ? (

            <motion.div
              variants={
                containerVariants
              }
              initial="hidden"
              animate="show"
            >

              {shown.map(
                (item) => {
                  const Icon =
                    item.Icon;

                  return (

                    <motion.div
                      key={
                        item.id
                      }
                      variants={
                        itemVariants
                      }
                      className="
                        group
                        relative
                        border-b
                        border-slate-100
                        last:border-0
                      "
                    >

                      {/* LEFT STATUS LINE */}

                      <div
                        className={`
                          absolute
                          bottom-0
                          left-0
                          top-0
                          w-1
                          ${item.accent}
                          opacity-40
                          transition-all
                          duration-300
                          group-hover:w-1.5
                          group-hover:opacity-100
                        `}
                      />


                      {/* COLOUR MATCHING BOTTOM HOVER LINE */}

                      {/* <div
                        className={`
                          absolute
                          bottom-0
                          left-5
                          right-5
                          z-10
                          h-[3px]
                          origin-left
                          scale-x-0
                          ${item.accent}
                          rounded-full
                          transition-transform
                          duration-500
                          ease-out
                          group-hover:scale-x-100
                        `}
                      /> */}


                      <div
                        onClick={() =>
                          handleNotificationClick(
                            item
                          )
                        }
                        className={`
                          relative
                          flex
                          cursor-pointer
                          items-center
                          gap-4
                          px-5
                          py-5
                          transition-all
                          duration-300
                          hover:bg-slate-50/80
                          sm:px-6
                        `}
                      >

                        {/* ICON */}

                        <motion.div
                          whileHover={{
                            scale: 1.08,
                            rotate: -4,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 20,
                          }}
                          className={`
                            relative
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            ${item.iconBg}
                            ${item.color}
                            ring-1
                            ring-inset
                            ring-black/5
                            transition-all
                            duration-300
                            group-hover:shadow-md
                          `}
                        >

                          <Icon
                            size={20}
                          />

                          <span
                            className={`
                              absolute
                              -right-0.5
                              -top-0.5
                              h-2.5
                              w-2.5
                              rounded-full
                              ${item.accent}
                              ring-2
                              ring-white
                            `}
                          />

                        </motion.div>


                        {/* CONTENT */}

                        <div className="
                          min-w-0
                          flex-1
                        ">

                          <div className="
                            flex
                            flex-wrap
                            items-center
                            gap-2
                          ">

                            <p className="
                              text-sm
                              font-semibold
                              leading-5
                              text-slate-800
                              transition-colors
                              duration-200
                              group-hover:text-slate-950
                            ">
                              {
                                item.text
                              }
                            </p>


                            <span
                              className={`
                                rounded-full
                                px-2.5
                                py-1
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-wider

                                ${
                                  item.category ===
                                  "Expired"
                                    ? "bg-red-50 text-red-600"
                                    : item.category ===
                                      "Expiring Soon"
                                    ? "bg-amber-50 text-amber-600"
                                    : item.type ===
                                      "EMI"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-red-50 text-red-600"
                                }
                              `}
                            >
                              {
                                item.category
                              }
                            </span>

                          </div>


                          <div className="
                            mt-2
                            flex
                            flex-wrap
                            items-center
                            gap-x-2
                            gap-y-1
                            text-xs
                            text-slate-400
                          ">

                            <span>
                              {
                                item.subText
                              }
                            </span>

                            <span className="hidden sm:inline">
                              •
                            </span>

                            <span>
                              Auto generated
                            </span>

                          </div>

                        </div>


                        {/* ACTION AREA */}

                        <div className="
                          flex
                          shrink-0
                          items-center
                          gap-1
                        ">

                          <motion.div
                            whileHover={{
                              x: 3,
                            }}
                            className="
                              hidden
                              rounded-xl
                              p-2.5
                              text-slate-300
                              transition-all
                              duration-200
                              group-hover:bg-blue-50
                              group-hover:text-blue-600
                              sm:flex
                            "
                            title="Open notification"
                          >
                            <ArrowRight
                              size={17}
                            />
                          </motion.div>


                          <button
                            type="button"
                            title="Delete notification"
                            aria-label="Delete notification"
                            onClick={(event) => {
                              event.stopPropagation();

                              setNotificationToDelete(
                                item
                              );
                            }}
                            className="
                              rounded-xl
                              p-2.5
                              text-slate-300
                              transition-all
                              duration-200
                              hover:bg-red-50
                              hover:text-red-600
                              hover:scale-105
                            "
                          >
                            <Trash2
                              size={17}
                            />
                          </button>

                        </div>

                      </div>

                    </motion.div>
                  );
                }
              )}

            </motion.div>

          ) : (

            /* EMPTY STATE */

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
                min-h-[320px]
                flex-col
                items-center
                justify-center
                px-6
                text-center
              "
            >

              <motion.div
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-emerald-50
                  text-emerald-500
                  ring-8
                  ring-emerald-50/60
                "
              >
                <CheckCircle2
                  size={31}
                />
              </motion.div>


              <h3 className="
                mt-6
                text-base
                font-bold
                text-slate-800
              ">
                No notifications
              </h3>


              <p className="
                mt-2
                max-w-md
                text-sm
                leading-6
                text-slate-400
              ">
                You are all caught up. There are no active alerts matching this filter.
              </p>

            </motion.div>

          )}

        </motion.div>


        {/* ===================================================
            FOOTER INFORMATION
        =================================================== */}

        <div className="
          group
          relative
          flex
          flex-col
          gap-3
          overflow-hidden
          rounded-2xl
          border
          border-blue-100
          bg-blue-50/60
          px-5
          py-4
          text-xs
          text-slate-500
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-6
        ">

          {/* Footer hover line */}

          <div className="
            absolute
            bottom-0
            left-0
            h-[3px]
            w-0
            bg-blue-500
            transition-all
            duration-500
            group-hover:w-full
          " />

          <div className="
            flex
            items-center
            gap-2
          ">

            <Bell
              size={14}
              className="text-blue-500"
            />

            <span>
              Notifications are automatically generated from your fleet records.
            </span>

          </div>

          <div className="
            font-semibold
            text-blue-600
          ">
            {paymentCount} payment{" "}
            {paymentCount === 1
              ? "alert"
              : "alerts"}
          </div>

        </div>

      </div>


      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      <AnimatePresence>

        {notificationToDelete && (

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
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-slate-950/50
              px-4
              backdrop-blur-sm
            "
            onClick={() =>
              setNotificationToDelete(
                null
              )
            }
          >

            <motion.div
              variants={
                modalVariants
              }
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={(event) =>
                event.stopPropagation()
              }
              className="
                w-full
                max-w-md
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-2xl
              "
            >

              <div className="
                border-b
                border-slate-100
                px-6
                py-5
              ">

                <div className="
                  flex
                  items-start
                  justify-between
                ">

                  <div className="
                    flex
                    items-center
                    gap-3
                  ">

                    <div className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-red-50
                      text-red-600
                    ">
                      <Trash2
                        size={20}
                      />
                    </div>


                    <div>

                      <h3 className="
                        text-base
                        font-bold
                        text-slate-900
                      ">
                        Delete notification?
                      </h3>

                      <p className="
                        mt-1
                        text-xs
                        text-slate-400
                      ">
                        This action will dismiss this alert.
                      </p>

                    </div>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      setNotificationToDelete(
                        null
                      )
                    }
                    className="
                      rounded-lg
                      p-2
                      text-slate-400
                      transition-all
                      hover:bg-slate-100
                      hover:text-slate-700
                    "
                  >
                    <X
                      size={18}
                    />
                  </button>

                </div>

              </div>


              <div className="px-6 py-5">

                <div className="
                  rounded-xl
                  border
                  border-slate-100
                  bg-slate-50
                  p-4
                ">

                  <div className="
                    mb-2
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-semibold
                    text-slate-400
                  ">

                    <Bell
                      size={13}
                    />

                    Notification

                  </div>


                  <p className="
                    text-sm
                    font-medium
                    leading-6
                    text-slate-700
                  ">
                    {
                      notificationToDelete.text
                    }
                  </p>

                </div>


                <p className="
                  mt-4
                  text-xs
                  leading-5
                  text-slate-400
                ">
                  The underlying document, EMI or challan will not be deleted. Only this notification will be dismissed.
                </p>

              </div>


              <div className="
                flex
                justify-end
                gap-3
                border-t
                border-slate-100
                bg-slate-50/70
                px-6
                py-4
              ">

                <button
                  type="button"
                  onClick={() =>
                    setNotificationToDelete(
                      null
                    )
                  }
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-slate-700
                    shadow-sm
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:bg-slate-50
                    hover:shadow
                  "
                >
                  No
                </button>


                <button
                  type="button"
                  onClick={
                    confirmDelete
                  }
                  className="
                    rounded-xl
                    bg-gradient-to-r
                    from-red-600
                    to-rose-600
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    shadow-red-200
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:from-red-700
                    hover:to-rose-700
                    hover:shadow-md
                    active:translate-y-0
                  "
                >
                  Yes, Delete
                </button>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>
    </>
  );
}