// import {
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import {
//   ArrowLeft,
//   Search,
//   X,
//   MoreVertical,
//   Eye,
//   CheckCircle2,
//   Landmark,
//   FileText,
//   IndianRupee,
//   Calendar,
//   CalendarDays,
//   CreditCard,
//   Pencil,
//   Trash2,
//   AlertTriangle,
//   Save,
//   Banknote,
//   ShieldCheck,
//   ChevronDown,
//   Clock3,
//   WalletCards,
// } from "lucide-react";

// import {
//   useNavigate,
//   useParams,
// } from "react-router-dom";

// import {
//   motion,
//   AnimatePresence,
// } from "framer-motion";

// import PageHeader from "../components/PageHeader";
// import StatusBadge from "../components/StatusBadge";

// import {
//   useFleet,
//   parseDate,
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
//     y: 20,
//   },

//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.4,
//       ease: "easeOut",
//     },
//   },
// };

// const modalVariants = {
//   hidden: {
//     opacity: 0,
//     scale: 0.88,
//     y: 25,
//   },

//   visible: {
//     opacity: 1,
//     scale: 1,
//     y: 0,
//     transition: {
//       duration: 0.25,
//       ease: "easeOut",
//     },
//   },

//   exit: {
//     opacity: 0,
//     scale: 0.88,
//     y: 25,
//     transition: {
//       duration: 0.2,
//     },
//   },
// };

// /* =========================================================
//    SAFE DATE FUNCTIONS

//    Prevent:
//    10-10-2026 -> 09-10-2026
// ========================================================= */

// const parseDateOnly = (value) => {
//   if (!value || value === "-") {
//     return null;
//   }

//   if (value instanceof Date) {
//     if (
//       Number.isNaN(
//         value.getTime()
//       )
//     ) {
//       return null;
//     }

//     return new Date(
//       value.getFullYear(),
//       value.getMonth(),
//       value.getDate()
//     );
//   }

//   const text =
//     String(value).trim();

//   const iso =
//     text.match(
//       /^(\d{4})-(\d{2})-(\d{2})/
//     );

//   if (iso) {
//     const year =
//       Number(iso[1]);

//     const month =
//       Number(iso[2]) - 1;

//     const day =
//       Number(iso[3]);

//     const date =
//       new Date(
//         year,
//         month,
//         day
//       );

//     if (
//       date.getFullYear() ===
//         year &&
//       date.getMonth() ===
//         month &&
//       date.getDate() ===
//         day
//     ) {
//       return date;
//     }
//   }

//   const dmy =
//     text.match(
//       /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/
//     );

//   if (dmy) {
//     const day =
//       Number(dmy[1]);

//     const month =
//       Number(dmy[2]) - 1;

//     const year =
//       Number(dmy[3]);

//     const date =
//       new Date(
//         year,
//         month,
//         day
//       );

//     if (
//       date.getFullYear() ===
//         year &&
//       date.getMonth() ===
//         month &&
//       date.getDate() ===
//         day
//     ) {
//       return date;
//     }
//   }

//   const parsed =
//     parseDate(value);

//   if (!parsed) {
//     return null;
//   }

//   return new Date(
//     parsed.getFullYear(),
//     parsed.getMonth(),
//     parsed.getDate()
//   );
// };

// const formatDateSafe = (value) => {
//   if (!value) return "-";

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) return "-";

//   return date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };

// const getInputDate = (value) => {
//   const date =
//     parseDateOnly(value);

//   if (!date) {
//     return "";
//   }

//   return `${date.getFullYear()}-${String(
//     date.getMonth() + 1
//   ).padStart(2, "0")}-${String(
//     date.getDate()
//   ).padStart(2, "0")}`;
// };

// /* =========================================================
//    EMI DETAILS PAGE
// ========================================================= */

// export default function EMIDetails() {
//   const {
//     vehicleNumber: encodedVehicleNumber,
//   } = useParams();

//   const nav =
//     useNavigate();

//   const {
//     emis = [],
//     loans = [],
//     updateEMI,
//     deleteEMI,
//     notify,
//   } = useFleet();

//   const vehicleNumber =
//     decodeURIComponent(
//       encodedVehicleNumber || ""
//     );

//   /* =======================================================
//      STATE
//   ======================================================= */

//   const [q, setQ] =
//     useState("");

//   const [openMenu, setOpenMenu] =
//     useState(null);

//   const [selectedEMI, setSelectedEMI] =
//     useState(null);

//   const [emiToMarkPaid, setEmiToMarkPaid] =
//     useState(null);

//   const [emiToDelete, setEmiToDelete] =
//     useState(null);

//   const [editingEMI, setEditingEMI] =
//     useState(null);

//   const [editForm, setEditForm] =
//     useState({
//       vehicleNumber: "",
//       financerBank: "",
//       loanNumber: "",
//       emiAmount: "",
//       dueDate: "",
//       installmentNumber: "",
//       status: "Pending",
//     });

//   /* =======================================================
//      OUTSIDE MENU
//   ======================================================= */

//   useEffect(() => {
//     const handleOutsideClick = (
//       event
//     ) => {
//       if (
//         !event.target.closest(
//           "[data-emi-action-menu]"
//         )
//       ) {
//         setOpenMenu(null);
//       }
//     };

//     document.addEventListener(
//       "mousedown",
//       handleOutsideClick
//     );

//     return () =>
//       document.removeEventListener(
//         "mousedown",
//         handleOutsideClick
//       );
//   }, []);

//   /* =========================================================
//      HELPERS
//   ========================================================= */

//   const normalizeVehicle = (
//     value
//   ) => {
//     return String(value || "")
//       .trim()
//       .replace(/\s+/g, "")
//       .toUpperCase();
//   };

//   const getVehicle = (
//     emi
//   ) => {
//     return (
//       emi?.vehicleNumber ||
//       emi?.vehicle ||
//       "-"
//     );
//   };

//   const getBankRaw = (
//     emi
//   ) => {
//     return (
//       emi?.financerBank ||
//       emi?.financierBank ||
//       emi?.financer ||
//       emi?.financier ||
//       emi?.bank ||
//       emi?.bankName ||
//       ""
//     );
//   };

//   const getLoanRaw = (
//     emi
//   ) => {
//     return (
//       emi?.loanNumber ||
//       emi?.loanNo ||
//       emi?.loan_number ||
//       ""
//     );
//   };

//   const getAmount = (
//     emi
//   ) => {
//     return Number(
//       emi?.emiAmount ??
//         emi?.amount ??
//         0
//     );
//   };

//   const getDueDate = (
//     emi
//   ) => {
//     return (
//       emi?.dueDate ||
//       emi?.due ||
//       emi?.emiDate ||
//       emi?.startDate ||
//       "-"
//     );
//   };

//   const isPaid = (
//     emi
//   ) => {
//     return (
//       emi?.status === "Paid" ||
//       emi?.paid === true
//     );
//   };

//   const getStatusLabel = (
//     emi
//   ) => {
//     return isPaid(emi)
//       ? "Paid"
//       : "Unpaid";
//   };

//   const getRelatedLoan = (
//     emi
//   ) => {
//     if (!emi) {
//       return null;
//     }

//     const loanId =
//       emi.loanId ??
//       emi.loanID ??
//       emi.loan_id;

//     if (
//       loanId !== undefined &&
//       loanId !== null &&
//       loanId !== ""
//     ) {
//       const byId =
//         loans.find(
//           (loan) =>
//             String(loan.id) ===
//             String(loanId)
//         );

//       if (byId) {
//         return byId;
//       }
//     }

//     const loanNumber =
//       getLoanRaw(emi);

//     if (loanNumber) {
//       const normalized =
//         String(loanNumber)
//           .trim()
//           .replace(/\s+/g, "")
//           .toUpperCase();

//       const byLoan =
//         loans.find((loan) => {
//           const value =
//             loan.loanNumber ||
//             loan.loanNo ||
//             loan.loan_number ||
//             "";

//           return (
//             String(value)
//               .trim()
//               .replace(
//                 /\s+/g,
//                 ""
//               )
//               .toUpperCase() ===
//             normalized
//           );
//         });

//       if (byLoan) {
//         return byLoan;
//       }
//     }

//     const vehicle =
//       normalizeVehicle(
//         getVehicle(emi)
//       );

//     return (
//       loans.find(
//         (loan) =>
//           normalizeVehicle(
//             loan.vehicleNumber ||
//               loan.vehicle
//           ) === vehicle
//       ) || null
//     );
//   };

//   const getBank = (
//     emi
//   ) => {
//     const direct =
//       getBankRaw(emi);

//     if (direct) {
//       return direct;
//     }

//     const loan =
//       getRelatedLoan(emi);

//     if (!loan) {
//       return "-";
//     }

//     return (
//       loan.financerBank ||
//       loan.financierBank ||
//       loan.financer ||
//       loan.financier ||
//       loan.bank ||
//       loan.bankName ||
//       "-"
//     );
//   };

//   const getLoanNumber = (
//     emi
//   ) => {
//     const direct =
//       getLoanRaw(emi);

//     if (direct) {
//       return direct;
//     }

//     const loan =
//       getRelatedLoan(emi);

//     if (!loan) {
//       return "-";
//     }

//     return (
//       loan.loanNumber ||
//       loan.loanNo ||
//       loan.loan_number ||
//       "-"
//     );
//   };

//   /* =========================================================
//      SELECTED VEHICLE EMI SCHEDULE
//   ========================================================= */

//   const vehicleEMIs =
//     useMemo(() => {
//       const normalized =
//         normalizeVehicle(
//           vehicleNumber
//         );

//       return emis
//         .filter(
//           (emi) =>
//             normalizeVehicle(
//               getVehicle(emi)
//             ) === normalized
//         )
//         .sort((a, b) => {
//           const dateA =
//             parseDateOnly(
//               getDueDate(a)
//             );

//           const dateB =
//             parseDateOnly(
//               getDueDate(b)
//             );

//           if (!dateA && !dateB) {
//             return 0;
//           }

//           if (!dateA) {
//             return 1;
//           }

//           if (!dateB) {
//             return -1;
//           }

//           return (
//             dateA.getTime() -
//             dateB.getTime()
//           );
//         });
//     }, [
//       emis,
//       vehicleNumber,
//     ]);

//   /* =========================================================
//      SEARCH
//   ========================================================= */

//   const rows =
//     useMemo(() => {
//       const search =
//         q.trim().toLowerCase();

//       if (!search) {
//         return vehicleEMIs;
//       }

//       return vehicleEMIs.filter(
//         (emi) => {
//           const text =
//             `${getVehicle(
//               emi
//             )} ${getBank(
//               emi
//             )} ${getLoanNumber(
//               emi
//             )} ${getStatusLabel(
//               emi
//             )}`.toLowerCase();

//           return text.includes(
//             search
//           );
//         }
//       );
//     }, [
//       vehicleEMIs,
//       q,
//       loans,
//     ]);

//   /* =========================================================
//      SUMMARY
//   ========================================================= */

//   const totalAmount =
//     useMemo(
//       () =>
//         vehicleEMIs.reduce(
//           (sum, emi) =>
//             sum +
//             getAmount(emi),
//           0
//         ),
//       [vehicleEMIs]
//     );

//   const paidAmount =
//     useMemo(
//       () =>
//         vehicleEMIs.reduce(
//           (sum, emi) =>
//             isPaid(emi)
//               ? sum +
//                 getAmount(
//                   emi
//                 )
//               : sum,
//           0
//         ),
//       [vehicleEMIs]
//     );

//   const pendingAmount =
//     Math.max(
//       totalAmount -
//         paidAmount,
//       0
//     );

//   const paidCount =
//     vehicleEMIs.filter(
//       isPaid
//     ).length;

//   const pendingCount =
//     vehicleEMIs.length -
//     paidCount;

//   const loan =
//     getRelatedLoan(
//       vehicleEMIs[0]
//     );

//   /* =========================================================
//      VIEW
//   ========================================================= */

//   const handleView = (
//     emi
//   ) => {
//     setOpenMenu(null);
//     setSelectedEMI(emi);
//   };

//   /* =========================================================
//      PAID
//   ========================================================= */

//   const handlePaid = (
//     emi
//   ) => {
//     if (isPaid(emi)) {
//       return;
//     }

//     setOpenMenu(null);
//     setEmiToMarkPaid(emi);
//   };

//   const confirmPaid = () => {
//     if (!emiToMarkPaid) {
//       return;
//     }

//     updateEMI(
//       emiToMarkPaid.id,
//       {
//         status: "Paid",
//         paid: true,
//         paidDate:
//           new Date()
//             .toISOString()
//             .split("T")[0],
//       }
//     );

//     notify(
//       `${getVehicle(
//         emiToMarkPaid
//       )} EMI paid successfully.`
//     );

//     setEmiToMarkPaid(null);
//   };

//   const cancelPaid = () => {
//     setEmiToMarkPaid(null);
//   };

//   /* =========================================================
//      EDIT
//   ========================================================= */

//   const handleEdit = (
//     emi
//   ) => {
//     setOpenMenu(null);

//     setEditingEMI(emi);

//     setEditForm({
//       vehicleNumber:
//         getVehicle(emi),

//       financerBank:
//         getBank(emi) === "-"
//           ? ""
//           : getBank(emi),

//       loanNumber:
//         getLoanNumber(emi) ===
//         "-"
//           ? ""
//           : getLoanNumber(
//               emi
//             ),

//       emiAmount:
//         getAmount(emi),

//       dueDate:
//         getInputDate(
//           getDueDate(emi)
//         ),

//       installmentNumber:
//         emi.installmentNumber ??
//         emi.emiNumber ??
//         "",

//       status:
//         isPaid(emi)
//           ? "Paid"
//           : "Pending",
//     });
//   };

//   const handleEditChange = (
//     event
//   ) => {
//     const {
//       name,
//       value,
//     } = event.target;

//     setEditForm(
//       (previous) => ({
//         ...previous,
//         [name]: value,
//       })
//     );
//   };

//   const handleSaveEdit = (
//     event
//   ) => {
//     event.preventDefault();

//     if (!editingEMI) {
//       return;
//     }

//     if (
//       !editForm.vehicleNumber.trim()
//     ) {
//       notify(
//         "Please enter a vehicle number.",
//         "error"
//       );
//       return;
//     }

//     if (
//       !editForm.financerBank.trim()
//     ) {
//       notify(
//         "Please enter the financer bank.",
//         "error"
//       );
//       return;
//     }

//     if (
//       !editForm.loanNumber.trim()
//     ) {
//       notify(
//         "Please enter the loan number.",
//         "error"
//       );
//       return;
//     }

//     if (
//       !editForm.emiAmount ||
//       Number(
//         editForm.emiAmount
//       ) <= 0
//     ) {
//       notify(
//         "Please enter a valid EMI amount.",
//         "error"
//       );
//       return;
//     }

//     if (!editForm.dueDate) {
//       notify(
//         "Please select the EMI due date.",
//         "error"
//       );
//       return;
//     }

//     const paid =
//       editForm.status ===
//       "Paid";

//     const vehicle =
//       editForm.vehicleNumber
//         .trim()
//         .toUpperCase();

//     const bank =
//       editForm.financerBank.trim();

//     const loanNumber =
//       editForm.loanNumber.trim();

//     const amount =
//       Number(
//         editForm.emiAmount
//       );

//     const patch = {
//       vehicleNumber:
//         vehicle,

//       vehicle,

//       financerBank:
//         bank,

//       bank,

//       loanNumber,

//       loanNo:
//         loanNumber,

//       emiAmount:
//         amount,

//       amount,

//       /*
//         Store exact date string from
//         HTML date input.
//       */
//       dueDate:
//         editForm.dueDate,

//       due:
//         editForm.dueDate,

//       installmentNumber:
//         editForm.installmentNumber
//           ? Number(
//               editForm.installmentNumber
//             )
//           : null,

//       status:
//         paid
//           ? "Paid"
//           : "Pending",

//       paid,

//       paidDate: paid
//         ? editingEMI.paidDate ||
//           new Date()
//             .toISOString()
//             .split("T")[0]
//         : null,
//     };

//     const result =
//       updateEMI(
//         editingEMI.id,
//         patch
//       );

//     if (
//       result &&
//       result.success === false
//     ) {
//       return;
//     }

//     notify(
//       "EMI details updated successfully."
//     );

//     setEditingEMI(null);
//   };

//   /* =========================================================
//      DELETE
//   ========================================================= */

//   const handleDeleteClick = (
//     emi
//   ) => {
//     setOpenMenu(null);
//     setEmiToDelete(emi);
//   };

//   const confirmDelete = () => {
//     if (!emiToDelete) {
//       return;
//     }

//     const result =
//       deleteEMI(
//         emiToDelete.id
//       );

//     if (
//       result &&
//       result.success === false
//     ) {
//       setEmiToDelete(null);
//       return;
//     }

//     notify(
//       `${getVehicle(
//         emiToDelete
//       )} EMI record deleted successfully.`
//     );

//     setEmiToDelete(null);
//   };

//   const cancelDelete = () => {
//     setEmiToDelete(null);
//   };

//   /* =========================================================
//      MONEY
//   ========================================================= */

//   const money = (
//     value
//   ) =>
//     `₹ ${Number(
//       value || 0
//     ).toLocaleString(
//       "en-IN"
//     )}`;

//   /* =========================================================
//      RENDER
//   ========================================================= */

//   return (
//     <motion.div
//       variants={
//         containerVariants
//       }
//       initial="hidden"
//       animate="visible"
//       className="pb-8"
//     >
//       {/* =====================================================
//           HEADER
//       ===================================================== */}

//       <motion.div
//         variants={
//           itemVariants
//         }
//       >
//         <PageHeader
//           title={
//             <div className="flex items-center gap-3">
//               <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 transition duration-300 hover:scale-110 hover:rotate-3">
//                 <CreditCard
//                   size={23}
//                   strokeWidth={2.3}
//                 />
//               </div>

//               <div>
//                 <span className="block text-2xl font-bold text-slate-800">
//                   EMI Details
//                 </span>
//               </div>
//             </div>
//           }
//           subtitle={`Complete EMI schedule for ${vehicleNumber}`}
//           action={
//             <motion.button
//               whileHover={{
//                 scale: 1.03,
//               }}
//               whileTap={{
//                 scale: 0.97,
//               }}
//               onClick={() =>
//                 nav("/emi")
//               }
//               className="btn-secondary"
//             >
//               <ArrowLeft
//                 size={17}
//               />

//               Back to EMI
//             </motion.button>
//           }
//         />
//       </motion.div>

//       {/* =====================================================
//           LOAN HERO
//       ===================================================== */}

//       <motion.div
//         variants={
//           itemVariants
//         }
//         whileHover={{
//           y: -2,
//         }}
//         className="
//           relative
//           mt-6
//           overflow-hidden
//           rounded-3xl
//           border
//           border-blue-100
//           bg-gradient-to-r
//           from-blue-50
//           via-white
//           to-indigo-50
//           p-6
//           shadow-sm
//         "
//       >
//         <motion.div
//           animate={{
//             scale: [
//               1,
//               1.08,
//               1,
//             ],
//             opacity: [
//               0.25,
//               0.4,
//               0.25,
//             ],
//           }}
//           transition={{
//             duration: 4,
//             repeat: Infinity,
//           }}
//           className="
//             absolute
//             -right-16
//             -top-16
//             h-52
//             w-52
//             rounded-full
//             bg-blue-200
//             blur-3xl
//           "
//         />

//         <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
//           <div className="flex items-center gap-4">
//             <motion.div
//               animate={{
//                 y: [0, -5, 0],
//               }}
//               transition={{
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               }}
//               className="
//                 flex
//                 h-16
//                 w-16
//                 shrink-0
//                 items-center
//                 justify-center
//                 rounded-2xl
//                 bg-gradient-to-br
//                 from-blue-500
//                 to-indigo-600
//                 text-white
//                 shadow-xl
//                 shadow-blue-200
//               "
//             >
//               <WalletCards
//                 size={30}
//               />
//             </motion.div>

//             <div>
//               <p className="text-sm font-medium text-slate-500">
//                 Vehicle EMI Schedule
//               </p>

//               <h2 className="mt-1 text-2xl font-bold text-slate-800">
//                 {vehicleNumber}
//               </h2>

//               <p className="mt-2 text-sm text-slate-500">
//                 Complete installment
//                 history and payment
//                 schedule.
//               </p>
//             </div>
//           </div>

//           <div className="min-w-[230px] rounded-2xl border border-white bg-white/70 p-4 shadow-sm backdrop-blur">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs font-medium text-slate-500">
//                   Total EMI Records
//                 </p>

//                 <motion.p
//                   initial={{
//                     opacity: 0,
//                     scale: 0.8,
//                   }}
//                   animate={{
//                     opacity: 1,
//                     scale: 1,
//                   }}
//                   transition={{
//                     duration: 0.5,
//                   }}
//                   className="mt-1 text-3xl font-bold text-blue-600"
//                 >
//                   {
//                     vehicleEMIs.length
//                   }
//                 </motion.p>
//               </div>

//               <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
//                 <Banknote
//                   size={22}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </motion.div>

//       {/* =====================================================
//           STATISTICS
//       ===================================================== */}

//       <motion.div
//         variants={
//           containerVariants
//         }
//         className="
//           mt-6
//           grid
//           gap-4
//           sm:grid-cols-2
//           xl:grid-cols-4
//         "
//       >
//         <StatCard
//           title="Total EMI Amount"
//           value={money(
//             totalAmount
//           )}
//           note="Complete schedule"
//           icon={
//             IndianRupee
//           }
//           bg="bg-blue-50"
//           color="text-blue-600"
//         />

//         <StatCard
//           title="Total Paid"
//           value={money(
//             paidAmount
//           )}
//           note={`${paidCount} paid EMI`}
//           icon={
//             CheckCircle2
//           }
//           bg="bg-emerald-50"
//           color="text-emerald-600"
//         />

//         <StatCard
//           title="Existing Amount"
//           value={money(
//             pendingAmount
//           )}
//           note={`${pendingCount} unpaid EMI`}
//           icon={
//             CreditCard
//           }
//           bg="bg-violet-50"
//           color="text-violet-600"
//         />

//         <StatCard
//           title="Loan Status"
//           value={
//             pendingCount > 0
//               ? "Active"
//               : "Closed"
//           }
//           note={
//             pendingCount > 0
//               ? "Loan is running"
//               : "All EMIs paid"
//           }
//           icon={
//             ShieldCheck
//           }
//           bg="bg-amber-50"
//           color="text-amber-600"
//         />
//       </motion.div>

//       {/* =====================================================
//           EMI RECORDS
//       ===================================================== */}

//       <motion.div
//         variants={
//           itemVariants
//         }
//         className="
//           mt-6
//           overflow-hidden
//           rounded-2xl
//           border
//           border-slate-100
//           bg-white
//           shadow-sm
//         "
//       >
//         <div
//           className="
//             flex
//             flex-col
//             gap-4
//             border-b
//             border-slate-100
//             p-5
//             md:flex-row
//             md:items-center
//             md:justify-between
//           "
//         >
//           <div>
//             <div className="flex items-center gap-2">
//               <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
//                 <CreditCard
//                   size={20}
//                 />
//               </div>

//               <h3 className="text-lg font-bold text-slate-800">
//                 EMI Records
//               </h3>
//             </div>

//             <p className="mt-1 text-sm text-slate-500">
//               Individual EMI installment
//               schedule for{" "}
//               <span className="font-semibold text-blue-600">
//                 {vehicleNumber}
//               </span>
//             </p>
//           </div>

//           <div className="relative w-full md:w-80">
//             <Search
//               size={18}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//             />

//             <input
//               value={q}
//               onChange={(e) =>
//                 setQ(
//                   e.target.value
//                 )
//               }
//               className="
//                 w-full
//                 rounded-xl
//                 border
//                 border-slate-200
//                 bg-slate-50
//                 py-2.5
//                 pl-10
//                 pr-10
//                 text-sm
//                 outline-none
//                 transition
//                 duration-300
//                 focus:border-blue-400
//                 focus:bg-white
//                 focus:ring-4
//                 focus:ring-blue-50
//               "
//               placeholder="Search EMI..."
//             />

//             {q && (
//               <button
//                 type="button"
//                 onClick={() =>
//                   setQ("")
//                 }
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
//               >
//                 <X size={16} />
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/40 px-5 py-3">
//           <div className="flex items-center gap-2 text-xs text-slate-500">
//             <Clock3
//               size={15}
//             />

//             <span>
//               Showing{" "}
//               <span className="font-semibold text-slate-700">
//                 {rows.length}
//               </span>{" "}
//               of{" "}
//               <span className="font-semibold text-slate-700">
//                 {vehicleEMIs.length}
//               </span>{" "}
//               EMI records
//             </span>
//           </div>

//           <button
//             type="button"
//             onClick={() => nav("/emi")}
//             className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
//           >
//             Back to EMI
//           </button>
//         </div>

//         {/* ===================================================
//             TABLE
//         =================================================== */}

//         <div className="overflow-x-auto">
//           <table
//             className="
//               w-full
//               min-w-[1000px]
//               text-sm
//             "
//           >
//             <thead
//               className="
//                 border-b
//                 border-slate-100
//                 bg-slate-50
//                 text-left
//                 text-xs
//                 font-semibold
//                 uppercase
//                 tracking-wide
//                 text-slate-500
//               "
//             >
//               <tr>
//                 <th className="px-6 py-4">
//                   Vehicle
//                 </th>

//                 <th>
//                   Financer Bank
//                 </th>

//                 <th>
//                   Loan No.
//                 </th>

//                 <th>
//                   Due Date
//                 </th>

//                 <th>
//                   EMI Amount
//                 </th>

//                 <th>
//                   Status
//                 </th>

//                 <th className="px-6 text-center">
//                   Action
//                 </th>
//               </tr>
//             </thead>

//             <tbody>
//               <AnimatePresence>
//                 {rows.map(
//                   (
//                     emi,
//                     index
//                   ) => {
//                     const paid =
//                       isPaid(emi);

//                     return (
//                       <motion.tr
//                         key={emi.id}
//                         initial={{
//                           opacity: 0,
//                           y: 12,
//                         }}
//                         animate={{
//                           opacity: 1,
//                           y: 0,
//                         }}
//                         exit={{
//                           opacity: 0,
//                           x: -30,
//                           height: 0,
//                         }}
//                         transition={{
//                           delay:
//                             index *
//                             0.035,
//                           duration:
//                             0.3,
//                         }}
//                         className="
//                           group
//                           border-b
//                           border-slate-100
//                           transition
//                           duration-300
//                           hover:bg-blue-50/40
//                         "
//                       >
//                         <td className="px-6 py-5">
//                           <div className="flex items-center gap-3">
//                             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
//                               <CreditCard
//                                 size={19}
//                               />
//                             </div>

//                             <div>
//                               <div className="font-semibold text-base text-blue-700">
//                                 {getVehicle(
//                                   emi
//                                 )}
//                               </div>

//                               <div className="mt-0.5 text-xs text-slate-400">
//                                 Installment #
//                                 {
//                                   emi.installmentNumber ??
//                                   emi.emiNumber ??
//                                   index +
//                                     1
//                                 }
//                               </div>
//                             </div>
//                           </div>
//                         </td>

//                         <td>
//                           <div className="flex items-center gap-2 text-slate-600">
//                             <Landmark
//                               size={15}
//                               className="text-slate-400"
//                             />

//                             <span className="font-medium">
//                               {getBank(
//                                 emi
//                               )}
//                             </span>
//                           </div>
//                         </td>

//                         <td>
//                           <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 font-medium text-slate-600">
//                             {getLoanNumber(
//                               emi
//                             )}
//                           </span>
//                         </td>

//                         <td>
//                           <div className="flex items-center gap-2 text-slate-600">
//                             <CalendarDays
//                               size={15}
//                               className="text-slate-400"
//                             />

//                             <span>
//                               {formatDateSafe(
//                                 getDueDate(
//                                   emi
//                                 )
//                               )}
//                             </span>
//                           </div>
//                         </td>

//                         <td>
//                           <div className="flex items-center gap-1 font-bold text-slate-700">
//                             <IndianRupee
//                               size={15}
//                             />

//                             {Number(
//                               getAmount(
//                                 emi
//                               )
//                             ).toLocaleString(
//                               "en-IN"
//                             )}
//                           </div>
//                         </td>

//                         <td>
//                           {paid ? (
//                             <StatusBadge
//                               status="Paid"
//                             />
//                           ) : (
//                             <span
//                               className="
//                                 inline-flex
//                                 items-center
//                                 gap-1.5
//                                 rounded-full
//                                 bg-amber-50
//                                 px-2.5
//                                 py-1
//                                 text-xs
//                                 font-semibold
//                                 text-amber-700
//                               "
//                             >
//                               <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
//                               Unpaid
//                             </span>
//                           )}
//                         </td>

//                         {/* ACTION */}

//                         <td className="px-6 py-4">
//                           <div
//                             className="relative flex justify-center"
//                             data-emi-action-menu
//                           >
//                             <motion.button
//                               whileHover={{
//                                 scale: 1.08,
//                               }}
//                               whileTap={{
//                                 scale: 0.9,
//                               }}
//                               type="button"
//                               onClick={() =>
//                                 setOpenMenu(
//                                   openMenu ===
//                                     emi.id
//                                     ? null
//                                     : emi.id
//                                 )
//                               }
//                               className="
//                                 flex
//                                 h-9
//                                 w-9
//                                 items-center
//                                 justify-center
//                                 rounded-lg
//                                 border
//                                 border-slate-200
//                                 bg-white
//                                 text-slate-500
//                                 shadow-sm
//                                 transition
//                                 hover:border-blue-200
//                                 hover:bg-blue-50
//                                 hover:text-blue-600
//                               "
//                             >
//                               <MoreVertical
//                                 size={18}
//                               />
//                             </motion.button>

//                             <AnimatePresence>
//                               {openMenu ===
//                                 emi.id && (
//                                 <motion.div
//                                   initial={{
//                                     opacity: 0,
//                                     scale: 0.92,
//                                     y: -6,
//                                   }}
//                                   animate={{
//                                     opacity: 1,
//                                     scale: 1,
//                                     y: 0,
//                                   }}
//                                   exit={{
//                                     opacity: 0,
//                                     scale: 0.92,
//                                     y: -6,
//                                   }}
//                                   transition={{
//                                     duration:
//                                       0.16,
//                                   }}
//                                   className="
//                                     absolute
//                                     right-0
//                                     top-11
//                                     z-40
//                                     w-44
//                                     overflow-hidden
//                                     rounded-xl
//                                     border
//                                     border-slate-200
//                                     bg-white
//                                     p-1.5
//                                     shadow-xl
//                                   "
//                                 >
//                                   {/* VIEW */}

//                                   <button
//                                     type="button"
//                                     onClick={() =>
//                                       handleView(
//                                         emi
//                                       )
//                                     }
//                                     className="
//                                       flex
//                                       w-full
//                                       items-center
//                                       gap-3
//                                       rounded-lg
//                                       px-3
//                                       py-2.5
//                                       text-left
//                                       text-sm
//                                       font-medium
//                                       text-slate-600
//                                       transition
//                                       hover:bg-blue-50
//                                       hover:text-blue-600
//                                     "
//                                   >
//                                     <Eye
//                                       size={16}
//                                     />
//                                     View
//                                   </button>

//                                   {/* PAID */}

//                                   {!paid && (
//                                     <button
//                                       type="button"
//                                       onClick={() =>
//                                         handlePaid(
//                                           emi
//                                         )
//                                       }
//                                       className="
//                                         flex
//                                         w-full
//                                         items-center
//                                         gap-3
//                                         rounded-lg
//                                         px-3
//                                         py-2.5
//                                         text-left
//                                         text-sm
//                                         font-medium
//                                         text-emerald-600
//                                         transition
//                                         hover:bg-emerald-50
//                                       "
//                                     >
//                                       <CheckCircle2
//                                         size={16}
//                                       />

//                                       Paid
//                                     </button>
//                                   )}

//                                   {/* EDIT */}

//                                   <button
//                                     type="button"
//                                     onClick={() =>
//                                       handleEdit(
//                                         emi
//                                       )
//                                     }
//                                     className="
//                                       flex
//                                       w-full
//                                       items-center
//                                       gap-3
//                                       rounded-lg
//                                       px-3
//                                       py-2.5
//                                       text-left
//                                       text-sm
//                                       font-medium
//                                       text-blue-600
//                                       transition
//                                       hover:bg-blue-50
//                                     "
//                                   >
//                                     <Pencil
//                                       size={16}
//                                     />

//                                     Edit
//                                   </button>

//                                   {/* DELETE */}

//                                   <button
//                                     type="button"
//                                     onClick={() =>
//                                       handleDeleteClick(
//                                         emi
//                                       )
//                                     }
//                                     className="
//                                       mt-1
//                                       flex
//                                       w-full
//                                       items-center
//                                       gap-3
//                                       rounded-lg
//                                       border-t
//                                       border-slate-100
//                                       px-3
//                                       py-2.5
//                                       text-left
//                                       text-sm
//                                       font-medium
//                                       text-red-600
//                                       transition
//                                       hover:bg-red-50
//                                     "
//                                   >
//                                     <Trash2
//                                       size={16}
//                                     />

//                                     Delete
//                                   </button>
//                                 </motion.div>
//                               )}
//                             </AnimatePresence>
//                           </div>
//                         </td>
//                       </motion.tr>
//                     );
//                   }
//                 )}
//               </AnimatePresence>
//             </tbody>
//           </table>
//         </div>

//         {rows.length === 0 && (
//           <div className="flex flex-col items-center justify-center py-16 text-center">
//             <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
//               <CreditCard
//                 size={34}
//               />
//             </div>

//             <h3 className="mt-5 text-lg font-bold text-slate-700">
//               No EMI Records Found
//             </h3>

//             <p className="mt-2 text-sm text-slate-400">
//               No EMI schedule is
//               available for this
//               vehicle.
//             </p>
//           </div>
//         )}
//       </motion.div>

//       {/* =====================================================
//           VIEW INSTALLMENT MODAL
//       ===================================================== */}

//       <AnimatePresence>
//         {selectedEMI && (
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
//             onClick={() =>
//               setSelectedEMI(null)
//             }
//             className="
//               fixed
//               inset-0
//               z-[80]
//               flex
//               items-center
//               justify-center
//               bg-slate-900/50
//               p-4
//               backdrop-blur-sm
//             "
//           >
//             <motion.div
//               variants={
//                 modalVariants
//               }
//               initial="hidden"
//               animate="visible"
//               exit="exit"
//               onClick={(e) =>
//                 e.stopPropagation()
//               }
//               className="
//                 max-h-[90vh]
//                 w-full
//                 max-w-2xl
//                 overflow-y-auto
//                 overflow-hidden
//                 rounded-3xl
//                 bg-white
//                 shadow-2xl
//               "
//             >
//               <div
//                 className="
//                   relative
//                   overflow-hidden
//                   bg-gradient-to-r
//                   from-blue-600
//                   to-indigo-600
//                   p-6
//                   text-white
//                 "
//               >
//                 <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />

//                 <div className="relative flex items-center justify-between">
//                   <div className="flex items-center gap-4">
//                     <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
//                       <CreditCard
//                         size={28}
//                       />
//                     </div>

//                     <div>
//                       <p className="text-sm text-blue-100">
//                         Installment Details
//                       </p>

//                       <h2 className="mt-1 text-xl font-bold">
//                         EMI Details
//                       </h2>

//                       <p className="mt-1 text-sm text-blue-100">
//                         {vehicleNumber}
//                       </p>
//                     </div>
//                   </div>

//                   <button
//                     type="button"
//                     onClick={() =>
//                       setSelectedEMI(
//                         null
//                       )
//                     }
//                     className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
//                   >
//                     <X size={20} />
//                   </button>
//                 </div>
//               </div>

//               <div className="p-6">
//                 <div className="mb-6 grid gap-4 sm:grid-cols-3">
//                   <InfoCard
//                     label="EMI Amount"
//                     value={money(
//                       getAmount(
//                         selectedEMI
//                       )
//                     )}
//                     type="blue"
//                   />

//                   <InfoCard
//                     label="Due Date"
//                     value={formatDateSafe(
//                       getDueDate(
//                         selectedEMI
//                       )
//                     )}
//                     type="slate"
//                   />

//                   <InfoCard
//                     label="Status"
//                     value={getStatusLabel(
//                       selectedEMI
//                     )}
//                     type={
//                       isPaid(
//                         selectedEMI
//                       )
//                         ? "green"
//                         : "amber"
//                     }
//                   />
//                 </div>

//                 <div className="grid gap-4 sm:grid-cols-2">
//                   <DetailItem
//                     icon={
//                       CreditCard
//                     }
//                     label="Vehicle Number"
//                     value={getVehicle(
//                       selectedEMI
//                     )}
//                   />

//                   <DetailItem
//                     icon={Landmark}
//                     label="Financer Bank"
//                     value={getBank(
//                       selectedEMI
//                     )}
//                   />

//                   <DetailItem
//                     icon={
//                       FileText
//                     }
//                     label="Loan Number"
//                     value={getLoanNumber(
//                       selectedEMI
//                     )}
//                   />

//                   <DetailItem
//                     icon={
//                       IndianRupee
//                     }
//                     label="EMI Amount"
//                     value={money(
//                       getAmount(
//                         selectedEMI
//                       )
//                     )}
//                   />

//                   <DetailItem
//                     icon={
//                       Calendar
//                     }
//                     label="Installment Number"
//                     value={`#${
//                       selectedEMI.installmentNumber ??
//                       selectedEMI.emiNumber ??
//                       "-"
//                     }`}
//                   />

//                   <DetailItem
//                     icon={
//                       CalendarDays
//                     }
//                     label="Due Date"
//                     value={formatDateSafe(
//                       getDueDate(
//                         selectedEMI
//                       )
//                     )}
//                   />

//                   {isPaid(
//                     selectedEMI
//                   ) && (
//                     <DetailItem
//                       icon={
//                         CheckCircle2
//                       }
//                       label="Paid Date"
//                       value={
//                         selectedEMI.paidDate
//                           ? formatDateSafe(
//                               selectedEMI.paidDate
//                             )
//                           : "-"
//                       }
//                     />
//                   )}
//                 </div>

//                 <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
//                   <motion.button
//                     whileHover={{
//                       scale: 1.02,
//                     }}
//                     whileTap={{
//                       scale: 0.97,
//                     }}
//                     type="button"
//                     onClick={() =>
//                       setSelectedEMI(
//                         null
//                       )
//                     }
//                     className="btn-secondary"
//                   >
//                     Close
//                   </motion.button>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* =====================================================
//           PAID CONFIRMATION
//       ===================================================== */}

//       <AnimatePresence>
//         {emiToMarkPaid && (
//           <motion.div
//             className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
//             initial={{
//               opacity: 0,
//             }}
//             animate={{
//               opacity: 1,
//             }}
//             exit={{
//               opacity: 0,
//             }}
//             onClick={cancelPaid}
//           >
//             <motion.div
//               variants={
//                 modalVariants
//               }
//               initial="hidden"
//               animate="visible"
//               exit="exit"
//               onClick={(e) =>
//                 e.stopPropagation()
//               }
//               className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
//             >
//               <div className="flex items-start gap-4 border-b border-slate-100 px-5 py-5">
//                 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
//                   <AlertTriangle
//                     size={23}
//                   />
//                 </div>

//                 <div className="min-w-0 flex-1">
//                   <h3 className="text-base font-bold text-slate-800">
//                     Mark EMI as Paid?
//                   </h3>

//                   <p className="mt-1 text-sm leading-5 text-slate-500">
//                     Are you sure you
//                     want to mark the
//                     EMI for{" "}
//                     <span className="font-semibold text-slate-700">
//                       {
//                         vehicleNumber
//                       }
//                     </span>{" "}
//                     as paid?
//                   </p>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={
//                     cancelPaid
//                   }
//                   className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
//                 >
//                   <X size={18} />
//                 </button>
//               </div>

//               <div className="px-5 py-4">
//                 <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3">
//                   <p className="text-xs font-medium leading-5 text-amber-800">
//                     This action will
//                     update the payment
//                     status and record
//                     today's paid date.
//                   </p>
//                 </div>
//               </div>

//               <div className="flex gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
//                 <motion.button
//                   type="button"
//                   whileHover={{
//                     scale: 1.02,
//                   }}
//                   whileTap={{
//                     scale: 0.97,
//                   }}
//                   onClick={
//                     cancelPaid
//                   }
//                   className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100"
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
//                   onClick={
//                     confirmPaid
//                   }
//                   className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
//                 >
//                   <span className="flex items-center justify-center gap-2">
//                     <CheckCircle2
//                       size={16}
//                     />
//                     Yes, Paid
//                   </span>
//                 </motion.button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* =====================================================
//           EDIT MODAL
//       ===================================================== */}

//       <AnimatePresence>
//         {editingEMI && (
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
//             onClick={() =>
//               setEditingEMI(null)
//             }
//             className="
//               fixed
//               inset-0
//               z-[90]
//               flex
//               items-center
//               justify-center
//               bg-slate-900/50
//               p-4
//               backdrop-blur-sm
//             "
//           >
//             <motion.div
//               variants={
//                 modalVariants
//               }
//               initial="hidden"
//               animate="visible"
//               exit="exit"
//               onClick={(e) =>
//                 e.stopPropagation()
//               }
//               className="
//                 max-h-[92vh]
//                 w-full
//                 max-w-2xl
//                 overflow-y-auto
//                 overflow-hidden
//                 rounded-3xl
//                 bg-white
//                 shadow-2xl
//               "
//             >
//               <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
//                 <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />

//                 <div className="relative flex items-center justify-between">
//                   <div className="flex items-center gap-4">
//                     <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
//                       <Pencil
//                         size={26}
//                       />
//                     </div>

//                     <div>
//                       <p className="text-sm text-blue-100">
//                         EMI Record
//                       </p>

//                       <h2 className="mt-1 text-xl font-bold">
//                         Edit EMI Details
//                       </h2>
//                     </div>
//                   </div>

//                   <button
//                     type="button"
//                     onClick={() =>
//                       setEditingEMI(
//                         null
//                       )
//                     }
//                     className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
//                   >
//                     <X size={20} />
//                   </button>
//                 </div>
//               </div>

//               <form
//                 onSubmit={
//                   handleSaveEdit
//                 }
//                 className="p-6"
//               >
//                 <div className="grid gap-5 md:grid-cols-2">
//                   <EditField
//                     icon={
//                       CreditCard
//                     }
//                     label="Vehicle Number"
//                   >
//                     <input
//                       type="text"
//                       name="vehicleNumber"
//                       value={
//                         editForm.vehicleNumber
//                       }
//                       onChange={
//                         handleEditChange
//                       }
//                       className="input w-full pl-10"
//                     />
//                   </EditField>

//                   <EditField
//                     icon={
//                       Landmark
//                     }
//                     label="Financer Bank"
//                   >
//                     <input
//                       type="text"
//                       name="financerBank"
//                       value={
//                         editForm.financerBank
//                       }
//                       onChange={
//                         handleEditChange
//                       }
//                       className="input w-full pl-10"
//                     />
//                   </EditField>

//                   <EditField
//                     icon={
//                       FileText
//                     }
//                     label="Loan Number"
//                   >
//                     <input
//                       type="text"
//                       name="loanNumber"
//                       value={
//                         editForm.loanNumber
//                       }
//                       onChange={
//                         handleEditChange
//                       }
//                       className="input w-full pl-10"
//                     />
//                   </EditField>

//                   <EditField
//                     icon={
//                       IndianRupee
//                     }
//                     label="EMI Amount"
//                   >
//                     <input
//                       type="number"
//                       name="emiAmount"
//                       min="1"
//                       value={
//                         editForm.emiAmount
//                       }
//                       onChange={
//                         handleEditChange
//                       }
//                       className="input w-full pl-10"
//                     />
//                   </EditField>

//                   <EditField
//                     icon={
//                       CalendarDays
//                     }
//                     label="Due Date"
//                   >
//                     <input
//                       type="date"
//                       name="dueDate"
//                       value={
//                         editForm.dueDate
//                       }
//                       onChange={
//                         handleEditChange
//                       }
//                       className="input w-full pl-10"
//                     />
//                   </EditField>

//                   <EditField
//                     icon={
//                       Calendar
//                     }
//                     label="Installment Number"
//                   >
//                     <input
//                       type="number"
//                       name="installmentNumber"
//                       min="1"
//                       value={
//                         editForm.installmentNumber
//                       }
//                       onChange={
//                         handleEditChange
//                       }
//                       className="input w-full pl-10"
//                     />
//                   </EditField>

//                   <EditField
//                     icon={
//                       ShieldCheck
//                     }
//                     label="Status"
//                   >
//                     <div className="relative">
//                       <ShieldCheck
//                         size={18}
//                         className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-blue-400"
//                       />

//                       <select
//                         name="status"
//                         value={
//                           editForm.status
//                         }
//                         onChange={
//                           handleEditChange
//                         }
//                         className="input w-full appearance-none bg-slate-50 pl-10 pr-10 transition-all duration-300 hover:border-blue-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
//                       >
//                         <option value="Pending">
//                           Unpaid
//                         </option>

//                         <option value="Paid">
//                           Paid
//                         </option>
//                       </select>

//                       <ChevronDown
//                         size={18}
//                         className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
//                       />
//                     </div>
//                   </EditField>
//                 </div>

//                 <motion.div
//                   initial={{
//                     opacity: 0,
//                     y: 10,
//                   }}
//                   animate={{
//                     opacity: 1,
//                     y: 0,
//                   }}
//                   transition={{
//                     delay: 0.15,
//                   }}
//                   className="mt-5 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4"
//                 >
//                   <div className="shrink-0 rounded-lg bg-white p-2 text-blue-600 shadow-sm">
//                     <ShieldCheck
//                       size={17}
//                     />
//                   </div>

//                   <div>
//                     <p className="text-sm font-semibold text-blue-800">
//                       Safe EMI Editing
//                     </p>

//                     <p className="mt-1 text-xs leading-5 text-blue-700">
//                       Editing this
//                       record changes
//                       only this EMI
//                       entry. The
//                       original loan
//                       information
//                       remains unchanged.
//                     </p>
//                   </div>
//                 </motion.div>

//                 <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
//                   <motion.button
//                     whileHover={{
//                       scale: 1.02,
//                     }}
//                     whileTap={{
//                       scale: 0.97,
//                     }}
//                     type="button"
//                     onClick={() =>
//                       setEditingEMI(
//                         null
//                       )
//                     }
//                     className="btn-secondary"
//                   >
//                     Cancel
//                   </motion.button>

//                   <motion.button
//                     whileHover={{
//                       scale: 1.02,
//                       y: -1,
//                     }}
//                     whileTap={{
//                       scale: 0.97,
//                     }}
//                     type="submit"
//                     className="btn-primary"
//                   >
//                     <Save
//                       size={17}
//                     />

//                     Save Changes
//                   </motion.button>
//                 </div>
//               </form>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* =====================================================
//           DELETE MODAL
//       ===================================================== */}

//       <AnimatePresence>
//         {emiToDelete && (
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
//             onClick={
//               cancelDelete
//             }
//             className="
//               fixed
//               inset-0
//               z-[100]
//               flex
//               items-center
//               justify-center
//               bg-slate-900/60
//               p-4
//               backdrop-blur-sm
//             "
//           >
//             <motion.div
//               variants={
//                 modalVariants
//               }
//               initial="hidden"
//               animate="visible"
//               exit="exit"
//               onClick={(e) =>
//                 e.stopPropagation()
//               }
//               className="
//                 w-full
//                 max-w-md
//                 overflow-hidden
//                 rounded-3xl
//                 bg-white
//                 shadow-2xl
//               "
//             >
//               <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-orange-50 p-7 text-center">
//                 <motion.div
//                   initial={{
//                     scale: 0,
//                     rotate: -20,
//                   }}
//                   animate={{
//                     scale: 1,
//                     rotate: 0,
//                   }}
//                   transition={{
//                     type: "spring",
//                     stiffness: 200,
//                   }}
//                   className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-sm"
//                 >
//                   <Trash2
//                     size={34}
//                   />
//                 </motion.div>

//                 <h2 className="mt-5 text-xl font-bold text-slate-800">
//                   Delete EMI Record?
//                 </h2>

//                 <p className="mt-3 text-sm leading-6 text-slate-500">
//                   Are you sure you want
//                   to permanently delete
//                   this EMI record?
//                 </p>
//               </div>

//               <div className="px-6">
//                 <div className="rounded-2xl border border-red-100 bg-red-50/60 p-4">
//                   <div className="grid gap-3 sm:grid-cols-2">
//                     <div>
//                       <p className="text-xs text-slate-400">
//                         Vehicle Number
//                       </p>

//                       <p className="mt-1 font-semibold text-slate-700">
//                         {getVehicle(
//                           emiToDelete
//                         )}
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-xs text-slate-400">
//                         Loan Number
//                       </p>

//                       <p className="mt-1 font-semibold text-slate-700">
//                         {getLoanNumber(
//                           emiToDelete
//                         )}
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-xs text-slate-400">
//                         EMI Amount
//                       </p>

//                       <p className="mt-1 font-semibold text-slate-700">
//                         {money(
//                           getAmount(
//                             emiToDelete
//                           )
//                         )}
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-xs text-slate-400">
//                         Due Date
//                       </p>

//                       <p className="mt-1 font-semibold text-slate-700">
//                         {formatDateSafe(
//                           getDueDate(
//                             emiToDelete
//                           )
//                         )}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="py-4 text-center">
//                   <p className="text-xs font-medium text-red-500">
//                     This action cannot be
//                     undone.
//                   </p>
//                 </div>
//               </div>

//               <div className="flex gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
//                 <motion.button
//                   whileHover={{
//                     scale: 1.02,
//                   }}
//                   whileTap={{
//                     scale: 0.97,
//                   }}
//                   type="button"
//                   onClick={
//                     cancelDelete
//                   }
//                   className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
//                 >
//                   No, Cancel
//                 </motion.button>

//                 <motion.button
//                   whileHover={{
//                     scale: 1.02,
//                   }}
//                   whileTap={{
//                     scale: 0.97,
//                   }}
//                   type="button"
//                   onClick={
//                     confirmDelete
//                   }
//                   className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-100 transition hover:bg-red-700"
//                 >
//                   <Trash2
//                     size={16}
//                   />

//                   Yes, Delete
//                 </motion.button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// }

// /* =========================================================
//    INFO CARD
// ========================================================= */

// function InfoCard({
//   label,
//   value,
//   type,
// }) {
//   const styles = {
//     blue:
//       "border-blue-100 bg-blue-50 text-blue-800",
//     slate:
//       "border-slate-100 bg-slate-50 text-slate-800",
//     green:
//       "border-emerald-100 bg-emerald-50 text-emerald-700",
//     amber:
//       "border-amber-100 bg-amber-50 text-amber-700",
//   };

//   return (
//     <motion.div
//       whileHover={{
//         y: -2,
//       }}
//       className={`rounded-2xl border p-4 ${
//         styles[type] ||
//         styles.slate
//       }`}
//     >
//       <p className="text-xs font-medium opacity-80">
//         {label}
//       </p>

//       <p className="mt-1 text-lg font-bold">
//         {value}
//       </p>
//     </motion.div>
//   );
// }

// /* =========================================================
//    STAT CARD
// ========================================================= */

// function StatCard({
//   title,
//   value,
//   note,
//   icon: Icon,
//   bg,
//   color,
// }) {
//   return (
//     <motion.div
//       variants={
//         itemVariants
//       }
//       whileHover={{
//         y: -5,
//         scale: 1.01,
//       }}
//       className="
//         group
//         relative
//         overflow-hidden
//         rounded-2xl
//         border
//         border-slate-100
//         bg-white
//         p-5
//         shadow-sm
//         transition
//         hover:shadow-xl
//       "
//     >
//       <div
//         className={`
//           absolute
//           -right-6
//           -top-6
//           h-24
//           w-24
//           rounded-full
//           ${bg}
//           opacity-70
//           transition
//           duration-500
//           group-hover:scale-150
//         `}
//       />

//       <div className="relative flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-slate-500">
//             {title}
//           </p>

//           <motion.h3
//             initial={{
//               opacity: 0,
//               scale: 0.8,
//             }}
//             animate={{
//               opacity: 1,
//               scale: 1,
//             }}
//             transition={{
//               duration: 0.4,
//             }}
//             className="mt-2 text-3xl font-bold text-slate-800"
//           >
//             {value}
//           </motion.h3>

//           <p
//             className={`
//               mt-2
//               text-xs
//               font-semibold
//               ${color}
//             `}
//           >
//             {note}
//           </p>
//         </div>

//         <div
//           className={`
//             flex
//             h-14
//             w-14
//             items-center
//             justify-center
//             rounded-2xl
//             ${bg}
//             ${color}
//             shadow-sm
//             transition
//             duration-300
//             group-hover:scale-110
//             group-hover:rotate-3
//           `}
//         >
//           <Icon size={25} />
//         </div>
//       </div>

//       <div
//         className={`
//           absolute
//           bottom-0
//           left-0
//           h-1
//           w-0
//           ${color.replace(
//             "text-",
//             "bg-"
//           )}
//           transition-all
//           duration-500
//           group-hover:w-full
//         `}
//       />
//     </motion.div>
//   );
// }

// /* =========================================================
//    DETAIL ITEM
// ========================================================= */

// function DetailItem({
//   icon: Icon,
//   label,
//   value,
// }) {
//   return (
//     <motion.div
//       whileHover={{
//         y: -2,
//       }}
//       className="
//         flex
//         items-start
//         gap-3
//         rounded-xl
//         border
//         border-slate-100
//         bg-white
//         p-3.5
//         transition
//         hover:border-blue-100
//         hover:shadow-sm
//       "
//     >
//       <div
//         className="
//           flex
//           h-9
//           w-9
//           shrink-0
//           items-center
//           justify-center
//           rounded-lg
//           bg-blue-50
//           text-blue-600
//         "
//       >
//         <Icon size={17} />
//       </div>

//       <div className="min-w-0">
//         <p className="text-xs font-medium text-slate-400">
//           {label}
//         </p>

//         <p className="mt-0.5 break-words text-sm font-semibold text-slate-700">
//           {value}
//         </p>
//       </div>
//     </motion.div>
//   );
// }

// /* =========================================================
//    EDIT FIELD
// ========================================================= */

// function EditField({
//   icon: Icon,
//   label,
//   children,
// }) {
//   return (
//     <div>
//       <label className="mb-2 block text-sm font-medium text-slate-700">
//         {label}
//       </label>

//       <div className="relative">
//         <Icon
//           size={17}
//           className="
//             pointer-events-none
//             absolute
//             left-3
//             top-1/2
//             z-10
//             -translate-y-1/2
//             text-slate-400
//           "
//         />

//         {children}
//       </div>
//     </div>
//   );
// }








import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Search,
  X,
  MoreVertical,
  Eye,
  CheckCircle2,
  Landmark,
  FileText,
  IndianRupee,
  Calendar,
  CalendarDays,
  CreditCard,
  Pencil,
  Trash2,
  AlertTriangle,
  Save,
  Banknote,
  ShieldCheck,
  ChevronDown,
  Clock3,
  WalletCards,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

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
   SAFE DATE FUNCTIONS

   Prevent:
   10-10-2026 -> 09-10-2026
========================================================= */

const parseDateOnly = (value) => {
  if (!value || value === "-") {
    return null;
  }

  if (value instanceof Date) {
    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      return null;
    }

    return new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate()
    );
  }

  const text =
    String(value).trim();

  const iso =
    text.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (iso) {
    const year =
      Number(iso[1]);

    const month =
      Number(iso[2]) - 1;

    const day =
      Number(iso[3]);

    const date =
      new Date(
        year,
        month,
        day
      );

    if (
      date.getFullYear() ===
        year &&
      date.getMonth() ===
        month &&
      date.getDate() ===
        day
    ) {
      return date;
    }
  }

  const dmy =
    text.match(
      /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/
    );

  if (dmy) {
    const day =
      Number(dmy[1]);

    const month =
      Number(dmy[2]) - 1;

    const year =
      Number(dmy[3]);

    const date =
      new Date(
        year,
        month,
        day
      );

    if (
      date.getFullYear() ===
        year &&
      date.getMonth() ===
        month &&
      date.getDate() ===
        day
    ) {
      return date;
    }
  }

  const parsed =
    parseDate(value);

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

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInputDate = (value) => {
  const date =
    parseDateOnly(value);

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
   EMI DETAILS PAGE
========================================================= */

export default function EMIDetails() {
  const {
    vehicleNumber: encodedVehicleNumber,
  } = useParams();

  const nav =
    useNavigate();

  const {
    emis = [],
    loans = [],
    settings,
    users = [],
    updateEMI,
    deleteEMI,
    notify,
  } = useFleet();

  const vehicleNumber =
    decodeURIComponent(
      encodedVehicleNumber || ""
    );

  /* =======================================================
     USER & ROLE PERMISSIONS
  ======================================================= */

  const loggedInUserId =
    localStorage.getItem(
      "fleetdoc_user_id"
    );

  const loggedInUserEmail =
    localStorage.getItem(
      "fleetdoc_user_email"
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

  const storedRole =
    localStorage.getItem(
      "fleetdoc_user_role"
    );

  const currentUserRole =
    currentUser?.role ||
    storedRole ||
    "Admin";

  /*
    Existing AddUser.jsx uses "Finincer".
    Settings uses "Finance".
    Normalize both to Finance.
  */
  const permissionRole =
    currentUserRole ===
    "Finincer"
      ? "Finance"
      : currentUserRole;

  const rolePermissions =
    settings?.rolePermissions ||
    {};

  const currentPermissions =
    rolePermissions?.[
      permissionRole
    ] ||
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

  const canViewEMIDetails =
    currentPermissions.view ===
    true;

  const canEditEMI =
    currentPermissions.edit ===
    true;

  const canDeleteEMI =
    currentPermissions.delete ===
    true;

  const canMarkEMIPaid =
    currentPermissions.paid ===
    true;

  /* =======================================================
     STATE
  ======================================================= */

  const [q, setQ] =
    useState("");

  const [openMenu, setOpenMenu] =
    useState(null);

  const [selectedEMI, setSelectedEMI] =
    useState(null);

  const [emiToMarkPaid, setEmiToMarkPaid] =
    useState(null);

  const [emiToDelete, setEmiToDelete] =
    useState(null);

  const [editingEMI, setEditingEMI] =
    useState(null);

  const [editForm, setEditForm] =
    useState({
      vehicleNumber: "",
      financerBank: "",
      loanNumber: "",
      emiAmount: "",
      dueDate: "",
      installmentNumber: "",
      status: "Pending",
    });

  /* =======================================================
     OUTSIDE MENU
  ======================================================= */

  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
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

    return () =>
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
  }, []);

  /* =========================================================
     HELPERS
  ========================================================= */

  const normalizeVehicle = (
    value
  ) => {
    return String(value || "")
      .trim()
      .replace(/\s+/g, "")
      .toUpperCase();
  };

  const getVehicle = (
    emi
  ) => {
    return (
      emi?.vehicleNumber ||
      emi?.vehicle ||
      "-"
    );
  };

  const getBankRaw = (
    emi
  ) => {
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

  const getLoanRaw = (
    emi
  ) => {
    return (
      emi?.loanNumber ||
      emi?.loanNo ||
      emi?.loan_number ||
      ""
    );
  };

  const getAmount = (
    emi
  ) => {
    return Number(
      emi?.emiAmount ??
        emi?.amount ??
        0
    );
  };

  const getDueDate = (
    emi
  ) => {
    return (
      emi?.dueDate ||
      emi?.due ||
      emi?.emiDate ||
      emi?.startDate ||
      "-"
    );
  };

  const isPaid = (
    emi
  ) => {
    return (
      emi?.status === "Paid" ||
      emi?.paid === true
    );
  };

  const getStatusLabel = (
    emi
  ) => {
    return isPaid(emi)
      ? "Paid"
      : "Unpaid";
  };

  const getRelatedLoan = (
    emi
  ) => {
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
      const byId =
        loans.find(
          (loan) =>
            String(loan.id) ===
            String(loanId)
        );

      if (byId) {
        return byId;
      }
    }

    const loanNumber =
      getLoanRaw(emi);

    if (loanNumber) {
      const normalized =
        String(loanNumber)
          .trim()
          .replace(/\s+/g, "")
          .toUpperCase();

      const byLoan =
        loans.find((loan) => {
          const value =
            loan.loanNumber ||
            loan.loanNo ||
            loan.loan_number ||
            "";

          return (
            String(value)
              .trim()
              .replace(
                /\s+/g,
                ""
              )
              .toUpperCase() ===
            normalized
          );
        });

      if (byLoan) {
        return byLoan;
      }
    }

    const vehicle =
      normalizeVehicle(
        getVehicle(emi)
      );

    return (
      loans.find(
        (loan) =>
          normalizeVehicle(
            loan.vehicleNumber ||
              loan.vehicle
          ) === vehicle
      ) || null
    );
  };

  const getBank = (
    emi
  ) => {
    const direct =
      getBankRaw(emi);

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

  const getLoanNumber = (
    emi
  ) => {
    const direct =
      getLoanRaw(emi);

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
     SELECTED VEHICLE EMI SCHEDULE
  ========================================================= */

  const vehicleEMIs =
    useMemo(() => {
      const normalized =
        normalizeVehicle(
          vehicleNumber
        );

      return emis
        .filter(
          (emi) =>
            normalizeVehicle(
              getVehicle(emi)
            ) === normalized
        )
        .sort((a, b) => {
          const dateA =
            parseDateOnly(
              getDueDate(a)
            );

          const dateB =
            parseDateOnly(
              getDueDate(b)
            );

          if (!dateA && !dateB) {
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
    }, [
      emis,
      vehicleNumber,
    ]);

  /* =========================================================
     SEARCH
  ========================================================= */

  const rows =
    useMemo(() => {
      const search =
        q.trim().toLowerCase();

      if (!search) {
        return vehicleEMIs;
      }

      return vehicleEMIs.filter(
        (emi) => {
          const text =
            `${getVehicle(
              emi
            )} ${getBank(
              emi
            )} ${getLoanNumber(
              emi
            )} ${getStatusLabel(
              emi
            )}`.toLowerCase();

          return text.includes(
            search
          );
        }
      );
    }, [
      vehicleEMIs,
      q,
      loans,
    ]);

  /* =========================================================
     SUMMARY
  ========================================================= */

  const totalAmount =
    useMemo(
      () =>
        vehicleEMIs.reduce(
          (sum, emi) =>
            sum +
            getAmount(emi),
          0
        ),
      [vehicleEMIs]
    );

  const paidAmount =
    useMemo(
      () =>
        vehicleEMIs.reduce(
          (sum, emi) =>
            isPaid(emi)
              ? sum +
                getAmount(
                  emi
                )
              : sum,
          0
        ),
      [vehicleEMIs]
    );

  const pendingAmount =
    Math.max(
      totalAmount -
        paidAmount,
      0
    );

  const paidCount =
    vehicleEMIs.filter(
      isPaid
    ).length;

  const pendingCount =
    vehicleEMIs.length -
    paidCount;

  const loan =
    getRelatedLoan(
      vehicleEMIs[0]
    );

  /* =========================================================
     VIEW
  ========================================================= */

  const handleView = (
    emi
  ) => {
    if (!canViewEMIDetails) {
      return;
    }

    setOpenMenu(null);
    setSelectedEMI(emi);
  };

  /* =========================================================
     PAID
  ========================================================= */

  const handlePaid = (
    emi
  ) => {
    if (!canMarkEMIPaid) {
      return;
    }

    if (isPaid(emi)) {
      return;
    }

    setOpenMenu(null);
    setEmiToMarkPaid(emi);
  };

  const confirmPaid = () => {
    if (
      !canMarkEMIPaid ||
      !emiToMarkPaid
    ) {
      setEmiToMarkPaid(null);
      return;
    }

    updateEMI(
      emiToMarkPaid.id,
      {
        status: "Paid",
        paid: true,
        paidDate:
          new Date()
            .toISOString()
            .split("T")[0],
      }
    );

    notify(
      `${getVehicle(
        emiToMarkPaid
      )} EMI paid successfully.`
    );

    setEmiToMarkPaid(null);
  };

  const cancelPaid = () => {
    setEmiToMarkPaid(null);
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const handleEdit = (
    emi
  ) => {
    if (!canEditEMI) {
      return;
    }

    setOpenMenu(null);

    setEditingEMI(emi);

    setEditForm({
      vehicleNumber:
        getVehicle(emi),

      financerBank:
        getBank(emi) === "-"
          ? ""
          : getBank(emi),

      loanNumber:
        getLoanNumber(emi) ===
        "-"
          ? ""
          : getLoanNumber(
              emi
            ),

      emiAmount:
        getAmount(emi),

      dueDate:
        getInputDate(
          getDueDate(emi)
        ),

      installmentNumber:
        emi.installmentNumber ??
        emi.emiNumber ??
        "",

      status:
        isPaid(emi)
          ? "Paid"
          : "Pending",
    });
  };

  const handleEditChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setEditForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  const handleSaveEdit = (
    event
  ) => {
    event.preventDefault();

    if (!canEditEMI) {
      return;
    }

    if (!editingEMI) {
      return;
    }

    /*
      Prevent Edit permission from
      being used to change payment
      status when Paid permission
      is disabled.
    */
    const originalPaid =
      isPaid(editingEMI);

    const requestedPaid =
      editForm.status === "Paid";

    if (
      requestedPaid !== originalPaid &&
      !canMarkEMIPaid
    ) {
      notify(
        "You do not have permission to change the EMI payment status.",
        "error"
      );

      setEditForm(
        (previous) => ({
          ...previous,
          status: originalPaid
            ? "Paid"
            : "Pending",
        })
      );

      return;
    }

    if (
      !editForm.vehicleNumber.trim()
    ) {
      notify(
        "Please enter a vehicle number.",
        "error"
      );
      return;
    }

    if (
      !editForm.financerBank.trim()
    ) {
      notify(
        "Please enter the financer bank.",
        "error"
      );
      return;
    }

    if (
      !editForm.loanNumber.trim()
    ) {
      notify(
        "Please enter the loan number.",
        "error"
      );
      return;
    }

    if (
      !editForm.emiAmount ||
      Number(
        editForm.emiAmount
      ) <= 0
    ) {
      notify(
        "Please enter a valid EMI amount.",
        "error"
      );
      return;
    }

    if (!editForm.dueDate) {
      notify(
        "Please select the EMI due date.",
        "error"
      );
      return;
    }

    const paid =
      editForm.status ===
      "Paid";

    const vehicle =
      editForm.vehicleNumber
        .trim()
        .toUpperCase();

    const bank =
      editForm.financerBank.trim();

    const loanNumber =
      editForm.loanNumber.trim();

    const amount =
      Number(
        editForm.emiAmount
      );

    const patch = {
      vehicleNumber:
        vehicle,

      vehicle,

      financerBank:
        bank,

      bank,

      loanNumber,

      loanNo:
        loanNumber,

      emiAmount:
        amount,

      amount,

      /*
        Store exact date string from
        HTML date input.
      */
      dueDate:
        editForm.dueDate,

      due:
        editForm.dueDate,

      installmentNumber:
        editForm.installmentNumber
          ? Number(
              editForm.installmentNumber
            )
          : null,

      status:
        paid
          ? "Paid"
          : "Pending",

      paid,

      paidDate: paid
        ? editingEMI.paidDate ||
          new Date()
            .toISOString()
            .split("T")[0]
        : null,
    };

    const result =
      updateEMI(
        editingEMI.id,
        patch
      );

    if (
      result &&
      result.success === false
    ) {
      return;
    }

    notify(
      "EMI details updated successfully."
    );

    setEditingEMI(null);
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDeleteClick = (
    emi
  ) => {
    if (!canDeleteEMI) {
      return;
    }

    setOpenMenu(null);
    setEmiToDelete(emi);
  };

  const confirmDelete = () => {
    if (
      !canDeleteEMI ||
      !emiToDelete
    ) {
      setEmiToDelete(null);
      return;
    }

    const result =
      deleteEMI(
        emiToDelete.id
      );

    if (
      result &&
      result.success === false
    ) {
      setEmiToDelete(null);
      return;
    }

    notify(
      `${getVehicle(
        emiToDelete
      )} EMI record deleted successfully.`
    );

    setEmiToDelete(null);
  };

  const cancelDelete = () => {
    setEmiToDelete(null);
  };

  /* =========================================================
     VIEW PERMISSION GUARD
  ========================================================= */

  if (!canViewEMIDetails) {
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
            <ShieldCheck
              size={30}
            />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            Access Restricted
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            You do not have permission to view EMI details.
          </p>
        </div>
      </motion.div>
    );
  }

  /* =========================================================
     MONEY
  ========================================================= */

  const money = (
    value
  ) =>
    `₹ ${Number(
      value || 0
    ).toLocaleString(
      "en-IN"
    )}`;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <motion.div
      variants={
        containerVariants
      }
      initial="hidden"
      animate="visible"
      className="pb-8"
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <motion.div
        variants={
          itemVariants
        }
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
                  EMI Details
                </span>
              </div>
            </div>
          }
          subtitle={`Complete EMI schedule for ${vehicleNumber}`}
          action={
            <motion.button
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={() =>
                nav("/emi")
              }
              className="btn-secondary"
            >
              <ArrowLeft
                size={17}
              />

              Back to EMI
            </motion.button>
          }
        />
      </motion.div>

      {/* =====================================================
          LOAN HERO
      ===================================================== */}

      <motion.div
        variants={
          itemVariants
        }
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

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{
                y: [0, -5, 0],
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
                Vehicle EMI Schedule
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-800">
                {vehicleNumber}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Complete installment
                history and payment
                schedule.
              </p>
            </div>
          </div>

          <div className="min-w-[230px] rounded-2xl border border-white bg-white/70 p-4 shadow-sm backdrop-blur">
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
                  className="mt-1 text-3xl font-bold text-blue-600"
                >
                  {
                    vehicleEMIs.length
                  }
                </motion.p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Banknote
                  size={22}
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
        variants={
          containerVariants
        }
        className="
          mt-6
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <StatCard
          title="Total EMI Amount"
          value={money(
            totalAmount
          )}
          note="Complete schedule"
          icon={
            IndianRupee
          }
          bg="bg-blue-50"
          color="text-blue-600"
        />

        <StatCard
          title="Total Paid"
          value={money(
            paidAmount
          )}
          note={`${paidCount} paid EMI`}
          icon={
            CheckCircle2
          }
          bg="bg-emerald-50"
          color="text-emerald-600"
        />

        <StatCard
          title="Existing Amount"
          value={money(
            pendingAmount
          )}
          note={`${pendingCount} unpaid EMI`}
          icon={
            CreditCard
          }
          bg="bg-violet-50"
          color="text-violet-600"
        />

        <StatCard
          title="Loan Status"
          value={
            pendingCount > 0
              ? "Active"
              : "Closed"
          }
          note={
            pendingCount > 0
              ? "Loan is running"
              : "All EMIs paid"
          }
          icon={
            ShieldCheck
          }
          bg="bg-amber-50"
          color="text-amber-600"
        />
      </motion.div>

      {/* =====================================================
          EMI RECORDS
      ===================================================== */}

      <motion.div
        variants={
          itemVariants
        }
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
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <CreditCard
                  size={20}
                />
              </div>

              <h3 className="text-lg font-bold text-slate-800">
                EMI Records
              </h3>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Individual EMI installment
              schedule for{" "}
              <span className="font-semibold text-blue-600">
                {vehicleNumber}
              </span>
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
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
              placeholder="Search EMI..."
            />

            {q && (
              <button
                type="button"
                onClick={() =>
                  setQ("")
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/40 px-5 py-3">
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
                {vehicleEMIs.length}
              </span>{" "}
              EMI records
            </span>
          </div>

          <button
            type="button"
            onClick={() => nav("/emi")}
            className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
          >
            Back to EMI
          </button>
        </div>

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
                  Due Date
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
                    emi,
                    index
                  ) => {
                    const paid =
                      isPaid(emi);

                    return (
                      <motion.tr
                        key={emi.id}
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
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
                              <CreditCard
                                size={19}
                              />
                            </div>

                            <div>
                              <div className="font-semibold text-base text-blue-700">
                                {getVehicle(
                                  emi
                                )}
                              </div>

                              <div className="mt-0.5 text-xs text-slate-400">
                                Installment #
                                {
                                  emi.installmentNumber ??
                                  emi.emiNumber ??
                                  index +
                                    1
                                }
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Landmark
                              size={15}
                              className="text-slate-400"
                            />

                            <span className="font-medium">
                              {getBank(
                                emi
                              )}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 font-medium text-slate-600">
                            {getLoanNumber(
                              emi
                            )}
                          </span>
                        </td>

                        <td>
                          <div className="flex items-center gap-2 text-slate-600">
                            <CalendarDays
                              size={15}
                              className="text-slate-400"
                            />

                            <span>
                              {formatDateSafe(
                                getDueDate(
                                  emi
                                )
                              )}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="flex items-center gap-1 font-bold text-slate-700">
                            <IndianRupee
                              size={15}
                            />

                            {Number(
                              getAmount(
                                emi
                              )
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </div>
                        </td>

                        <td>
                          {paid ? (
                            <StatusBadge
                              status="Paid"
                            />
                          ) : (
                            <span
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-full
                                bg-amber-50
                                px-2.5
                                py-1
                                text-xs
                                font-semibold
                                text-amber-700
                              "
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              Unpaid
                            </span>
                          )}
                        </td>

                        {/* ACTION */}

                        <td className="px-6 py-4">
                          <div
                            className="relative flex justify-center"
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
                                    emi.id
                                    ? null
                                    : emi.id
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
                            >
                              <MoreVertical
                                size={18}
                              />
                            </motion.button>

                            <AnimatePresence>
                              {openMenu ===
                                emi.id && (
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
                                        emi
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
                                    View
                                  </button>

                                  {/* PAID */}

                                  {!paid &&
                                    canMarkEMIPaid && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handlePaid(
                                            emi
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
                                          text-emerald-600
                                          transition
                                          hover:bg-emerald-50
                                        "
                                      >
                                        <CheckCircle2
                                          size={16}
                                        />

                                        Paid
                                      </button>
                                    )}

                                  {/* EDIT */}

                                  {canEditEMI && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleEdit(
                                          emi
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
                                        text-blue-600
                                        transition
                                        hover:bg-blue-50
                                      "
                                    >
                                      <Pencil
                                        size={16}
                                      />

                                      Edit
                                    </button>
                                  )}

                                  {/* DELETE */}

                                  {canDeleteEMI && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteClick(
                                          emi
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

        {rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
              <CreditCard
                size={34}
              />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-700">
              No EMI Records Found
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              No EMI schedule is
              available for this
              vehicle.
            </p>
          </div>
        )}
      </motion.div>

      {/* =====================================================
          VIEW INSTALLMENT MODAL
      ===================================================== */}

      <AnimatePresence>
        {selectedEMI && (
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
            onClick={() =>
              setSelectedEMI(null)
            }
            className="
              fixed
              inset-0
              z-[80]
              flex
              items-center
              justify-center
              bg-slate-900/50
              p-4
              backdrop-blur-sm
            "
          >
            <motion.div
              variants={
                modalVariants
              }
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) =>
                e.stopPropagation()
              }
              className="
                max-h-[90vh]
                w-full
                max-w-2xl
                overflow-y-auto
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
                  bg-gradient-to-r
                  from-blue-600
                  to-indigo-600
                  p-6
                  text-white
                "
              >
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                      <CreditCard
                        size={28}
                      />
                    </div>

                    <div>
                      <p className="text-sm text-blue-100">
                        Installment Details
                      </p>

                      <h2 className="mt-1 text-xl font-bold">
                        EMI Details
                      </h2>

                      <p className="mt-1 text-sm text-blue-100">
                        {vehicleNumber}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedEMI(
                        null
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                  <InfoCard
                    label="EMI Amount"
                    value={money(
                      getAmount(
                        selectedEMI
                      )
                    )}
                    type="blue"
                  />

                  <InfoCard
                    label="Due Date"
                    value={formatDateSafe(
                      getDueDate(
                        selectedEMI
                      )
                    )}
                    type="slate"
                  />

                  <InfoCard
                    label="Status"
                    value={getStatusLabel(
                      selectedEMI
                    )}
                    type={
                      isPaid(
                        selectedEMI
                      )
                        ? "green"
                        : "amber"
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailItem
                    icon={
                      CreditCard
                    }
                    label="Vehicle Number"
                    value={getVehicle(
                      selectedEMI
                    )}
                  />

                  <DetailItem
                    icon={Landmark}
                    label="Financer Bank"
                    value={getBank(
                      selectedEMI
                    )}
                  />

                  <DetailItem
                    icon={
                      FileText
                    }
                    label="Loan Number"
                    value={getLoanNumber(
                      selectedEMI
                    )}
                  />

                  <DetailItem
                    icon={
                      IndianRupee
                    }
                    label="EMI Amount"
                    value={money(
                      getAmount(
                        selectedEMI
                      )
                    )}
                  />

                  <DetailItem
                    icon={
                      Calendar
                    }
                    label="Installment Number"
                    value={`#${
                      selectedEMI.installmentNumber ??
                      selectedEMI.emiNumber ??
                      "-"
                    }`}
                  />

                  <DetailItem
                    icon={
                      CalendarDays
                    }
                    label="Due Date"
                    value={formatDateSafe(
                      getDueDate(
                        selectedEMI
                      )
                    )}
                  />

                  {isPaid(
                    selectedEMI
                  ) && (
                    <DetailItem
                      icon={
                        CheckCircle2
                      }
                      label="Paid Date"
                      value={
                        selectedEMI.paidDate
                          ? formatDateSafe(
                              selectedEMI.paidDate
                            )
                          : "-"
                      }
                    />
                  )}
                </div>

                <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    type="button"
                    onClick={() =>
                      setSelectedEMI(
                        null
                      )
                    }
                    className="btn-secondary"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          PAID CONFIRMATION
      ===================================================== */}

      <AnimatePresence>
        {emiToMarkPaid && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={cancelPaid}
          >
            <motion.div
              variants={
                modalVariants
              }
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) =>
                e.stopPropagation()
              }
              className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-start gap-4 border-b border-slate-100 px-5 py-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <AlertTriangle
                    size={23}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-800">
                    Mark EMI as Paid?
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Are you sure you
                    want to mark the
                    EMI for{" "}
                    <span className="font-semibold text-slate-700">
                      {
                        vehicleNumber
                      }
                    </span>{" "}
                    as paid?
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    cancelPaid
                  }
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-5 py-4">
                <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3">
                  <p className="text-xs font-medium leading-5 text-amber-800">
                    This action will
                    update the payment
                    status and record
                    today's paid date.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
                <motion.button
                  type="button"
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={
                    cancelPaid
                  }
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100"
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
                  onClick={
                    confirmPaid
                  }
                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2
                      size={16}
                    />
                    Yes, Paid
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      <AnimatePresence>
        {editingEMI && (
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
            onClick={() =>
              setEditingEMI(null)
            }
            className="
              fixed
              inset-0
              z-[90]
              flex
              items-center
              justify-center
              bg-slate-900/50
              p-4
              backdrop-blur-sm
            "
          >
            <motion.div
              variants={
                modalVariants
              }
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) =>
                e.stopPropagation()
              }
              className="
                max-h-[92vh]
                w-full
                max-w-2xl
                overflow-y-auto
                overflow-hidden
                rounded-3xl
                bg-white
                shadow-2xl
              "
            >
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                      <Pencil
                        size={26}
                      />
                    </div>

                    <div>
                      <p className="text-sm text-blue-100">
                        EMI Record
                      </p>

                      <h2 className="mt-1 text-xl font-bold">
                        Edit EMI Details
                      </h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingEMI(
                        null
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form
                onSubmit={
                  handleSaveEdit
                }
                className="p-6"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <EditField
                    icon={
                      CreditCard
                    }
                    label="Vehicle Number"
                  >
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={
                        editForm.vehicleNumber
                      }
                      onChange={
                        handleEditChange
                      }
                      className="input w-full pl-10"
                    />
                  </EditField>

                  <EditField
                    icon={
                      Landmark
                    }
                    label="Financer Bank"
                  >
                    <input
                      type="text"
                      name="financerBank"
                      value={
                        editForm.financerBank
                      }
                      onChange={
                        handleEditChange
                      }
                      className="input w-full pl-10"
                    />
                  </EditField>

                  <EditField
                    icon={
                      FileText
                    }
                    label="Loan Number"
                  >
                    <input
                      type="text"
                      name="loanNumber"
                      value={
                        editForm.loanNumber
                      }
                      onChange={
                        handleEditChange
                      }
                      className="input w-full pl-10"
                    />
                  </EditField>

                  <EditField
                    icon={
                      IndianRupee
                    }
                    label="EMI Amount"
                  >
                    <input
                      type="number"
                      name="emiAmount"
                      min="1"
                      value={
                        editForm.emiAmount
                      }
                      onChange={
                        handleEditChange
                      }
                      className="input w-full pl-10"
                    />
                  </EditField>

                  <EditField
                    icon={
                      CalendarDays
                    }
                    label="Due Date"
                  >
                    <input
                      type="date"
                      name="dueDate"
                      value={
                        editForm.dueDate
                      }
                      onChange={
                        handleEditChange
                      }
                      className="input w-full pl-10"
                    />
                  </EditField>

                  <EditField
                    icon={
                      Calendar
                    }
                    label="Installment Number"
                  >
                    <input
                      type="number"
                      name="installmentNumber"
                      min="1"
                      value={
                        editForm.installmentNumber
                      }
                      onChange={
                        handleEditChange
                      }
                      className="input w-full pl-10"
                    />
                  </EditField>

                  <EditField
                    icon={
                      ShieldCheck
                    }
                    label="Status"
                  >
                    <div className="relative">
                      <ShieldCheck
                        size={18}
                        className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-blue-400"
                      />

                      <select
                        name="status"
                        value={
                          editForm.status
                        }
                        onChange={
                          handleEditChange
                        }
                        className="input w-full appearance-none bg-slate-50 pl-10 pr-10 transition-all duration-300 hover:border-blue-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="Pending">
                          Unpaid
                        </option>

                        {canMarkEMIPaid && (
                          <option value="Paid">
                            Paid
                          </option>
                        )}
                      </select>

                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                  </EditField>
                </div>

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
                    delay: 0.15,
                  }}
                  className="mt-5 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4"
                >
                  <div className="shrink-0 rounded-lg bg-white p-2 text-blue-600 shadow-sm">
                    <ShieldCheck
                      size={17}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-blue-800">
                      Safe EMI Editing
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-700">
                      Editing this
                      record changes
                      only this EMI
                      entry. The
                      original loan
                      information
                      remains unchanged.
                    </p>
                  </div>
                </motion.div>

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    type="button"
                    onClick={() =>
                      setEditingEMI(
                        null
                      )
                    }
                    className="btn-secondary"
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      y: -1,
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    type="submit"
                    className="btn-primary"
                  >
                    <Save
                      size={17}
                    />

                    Save Changes
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          DELETE MODAL
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
            onClick={
              cancelDelete
            }
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
              variants={
                modalVariants
              }
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
              <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-orange-50 p-7 text-center">
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
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-sm"
                >
                  <Trash2
                    size={34}
                  />
                </motion.div>

                <h2 className="mt-5 text-xl font-bold text-slate-800">
                  Delete EMI Record?
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Are you sure you want
                  to permanently delete
                  this EMI record?
                </p>
              </div>

              <div className="px-6">
                <div className="rounded-2xl border border-red-100 bg-red-50/60 p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-400">
                        Vehicle Number
                      </p>

                      <p className="mt-1 font-semibold text-slate-700">
                        {getVehicle(
                          emiToDelete
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Loan Number
                      </p>

                      <p className="mt-1 font-semibold text-slate-700">
                        {getLoanNumber(
                          emiToDelete
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        EMI Amount
                      </p>

                      <p className="mt-1 font-semibold text-slate-700">
                        {money(
                          getAmount(
                            emiToDelete
                          )
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Due Date
                      </p>

                      <p className="mt-1 font-semibold text-slate-700">
                        {formatDateSafe(
                          getDueDate(
                            emiToDelete
                          )
                        )}
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

              <div className="flex gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
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
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
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
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-100 transition hover:bg-red-700"
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
   INFO CARD
========================================================= */

function InfoCard({
  label,
  value,
  type,
}) {
  const styles = {
    blue:
      "border-blue-100 bg-blue-50 text-blue-800",
    slate:
      "border-slate-100 bg-slate-50 text-slate-800",
    green:
      "border-emerald-100 bg-emerald-50 text-emerald-700",
    amber:
      "border-amber-100 bg-amber-50 text-amber-700",
  };

  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      className={`rounded-2xl border p-4 ${
        styles[type] ||
        styles.slate
      }`}
    >
      <p className="text-xs font-medium opacity-80">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold">
        {value}
      </p>
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
      variants={
        itemVariants
      }
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

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
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
            className="mt-2 text-3xl font-bold text-slate-800"
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

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      className="
        flex
        items-start
        gap-3
        rounded-xl
        border
        border-slate-100
        bg-white
        p-3.5
        transition
        hover:border-blue-100
        hover:shadow-sm
      "
    >
      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-blue-50
          text-blue-600
        "
      >
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

/* =========================================================
   EDIT FIELD
========================================================= */

function EditField({
  icon: Icon,
  label,
  children,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={17}
          className="
            pointer-events-none
            absolute
            left-3
            top-1/2
            z-10
            -translate-y-1/2
            text-slate-400
          "
        />

        {children}
      </div>
    </div>
  );
}