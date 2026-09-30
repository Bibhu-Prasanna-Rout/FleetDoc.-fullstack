// import { useMemo, useState, useEffect } from "react";

// import {
//   Plus,
//   Search,
//   Eye,
//   Trash2,
//   FileText,
//   CheckCircle2,
//   AlertTriangle,
//   CircleX,
//   Files,
//   X,
//   Calendar,
//   Hash,
//   Car,
//   ShieldCheck,
//   MoreVertical,
//   Filter,
//   ChevronDown,
//   FileUp,
// } from "lucide-react";

// import { Link } from "react-router-dom";

// import { motion, AnimatePresence } from "framer-motion";

// import PageHeader from "../components/PageHeader";
// import StatusBadge from "../components/StatusBadge";

// import {
//   useFleet,
//   getExpiryStatus,
// } from "../context/fleetContext";


// /* =========================================================
//    DATE FORMAT
// ========================================================= */

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


// /* =========================================================
//    DOCUMENT STATUS HELPER
//    ---------------------------------------------------------
//    Renewed documents are historical documents.

//    We support multiple possible field names so the page
//    remains compatible with the updated FleetContext.
// ========================================================= */

// const isRenewedDocument = (document) => {
//   if (!document) return false;

//   return (
//     document.status === "Renewed" ||
//     document.documentStatus === "Renewed" ||
//     document.renewalStatus === "Renewed" ||
//     document.isRenewed === true
//   );
// };


// /* =========================================================
//    GET DOCUMENT STATUS
//    ---------------------------------------------------------
//    Renewed status always has priority over expiry status.
// ========================================================= */

// const getDocumentStatus = (document, reminderDays) => {
//   if (isRenewedDocument(document)) {
//     return "Renewed";
//   }

//   return getExpiryStatus(
//     document?.expiry,
//     reminderDays
//   );
// };


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


// /* =========================================================
//    OPEN UPLOADED DOCUMENT
//    Handles data URLs safely by converting them to Blob URLs.
//    This avoids Chrome:
//    "Not allowed to navigate top frame to data URL"
// ========================================================= */

// const openDocumentFile = async (doc) => {
//   if (!doc) return;

//   const source = doc.fileData || doc.fileUrl;

//   if (!source) {
//     alert("No uploaded document is available.");
//     return;
//   }

//   try {
//     /* =====================================================
//        DATA URL
//     ===================================================== */

//     if (
//       typeof source === "string" &&
//       source.startsWith("data:")
//     ) {
//       const response = await fetch(source);

//       if (!response.ok) {
//         throw new Error(
//           "Unable to read the uploaded document."
//         );
//       }

//       const blob = await response.blob();

//       const blobUrl = URL.createObjectURL(blob);

//       /*
//        * Open a blank tab first and then navigate that tab
//        * to the Blob URL.
//        *
//        * This avoids navigating the current/top frame
//        * directly to a data URL.
//        */

//       const newWindow = window.open("", "_blank");

//       if (newWindow) {
//         newWindow.opener = null;
//         newWindow.location.href = blobUrl;

//         /*
//          * Keep the Blob URL alive long enough for the browser
//          * to load the document.
//          */

//         setTimeout(() => {
//           URL.revokeObjectURL(blobUrl);
//         }, 60000);

//         return;
//       }

//       /*
//        * Popup blocker fallback.
//        */

//       const anchor =
//         window.document.createElement("a");

//       anchor.href = blobUrl;
//       anchor.target = "_blank";
//       anchor.rel = "noopener noreferrer";

//       window.document.body.appendChild(anchor);
//       anchor.click();
//       anchor.remove();

//       setTimeout(() => {
//         URL.revokeObjectURL(blobUrl);
//       }, 60000);

//       return;
//     }


//     /* =====================================================
//        HTTP / HTTPS FILE URL
//     ===================================================== */

//     if (
//       typeof source === "string" &&
//       (
//         source.startsWith("http://") ||
//         source.startsWith("https://")
//       )
//     ) {
//       const newWindow = window.open("", "_blank");

//       if (newWindow) {
//         newWindow.opener = null;
//         newWindow.location.href = source;
//         return;
//       }

//       const anchor =
//         window.document.createElement("a");

//       anchor.href = source;
//       anchor.target = "_blank";
//       anchor.rel = "noopener noreferrer";

//       window.document.body.appendChild(anchor);
//       anchor.click();
//       anchor.remove();

//       return;
//     }


//     /* =====================================================
//        FALLBACK
//        Try fetching the source and opening as Blob.
//     ===================================================== */

//     const response = await fetch(source);

//     if (!response.ok) {
//       throw new Error(
//         "Unable to open the document."
//       );
//     }

//     const blob = await response.blob();

//     const blobUrl = URL.createObjectURL(blob);

//     const newWindow = window.open("", "_blank");

//     if (newWindow) {
//       newWindow.opener = null;
//       newWindow.location.href = blobUrl;

//       setTimeout(() => {
//         URL.revokeObjectURL(blobUrl);
//       }, 60000);

//       return;
//     }

//     const anchor =
//       window.document.createElement("a");

//     anchor.href = blobUrl;
//     anchor.target = "_blank";
//     anchor.rel = "noopener noreferrer";

//     window.document.body.appendChild(anchor);
//     anchor.click();
//     anchor.remove();

//     setTimeout(() => {
//       URL.revokeObjectURL(blobUrl);
//     }, 60000);

//   } catch (error) {
//     console.error(
//       "Unable to open uploaded document:",
//       error
//     );

//     alert(
//       "Unable to open the uploaded document. Please try uploading the file again."
//     );
//   }
// };


// /* =========================================================
//    DOCUMENTS PAGE
// ========================================================= */

// export default function Documents() {

//   const [showFilters, setShowFilters] = useState(false);


//   /* =========================================================
//      FLEET CONTEXT
//   ========================================================= */

//   const {
//     documents,
//     settings,
//     deleteDocument,
//   } = useFleet();


//   /* =========================================================
//      SEARCH STATE
//   ========================================================= */

//   const [q, setQ] = useState("");


//   /* =========================================================
//      STATUS FILTER STATE
//   ========================================================= */

//   const [statusFilter, setStatusFilter] = useState("All");


//   /* =========================================================
//      DOCUMENT DETAILS MODAL STATE
//   ========================================================= */

//   const [selectedDocument, setSelectedDocument] =
//     useState(null);


//   /* =========================================================
//      DELETE CONFIRMATION STATE
//   ========================================================= */

//   const [deleteDocumentData, setDeleteDocumentData] =
//     useState(null);


//   /* =========================================================
//      MORE ACTION MENU STATE
//   ========================================================= */

//   const [openActionMenu, setOpenActionMenu] =
//     useState(null);


//   /* =========================================================
//      FILTER DOCUMENTS
//      ---------------------------------------------------------
//      IMPORTANT:

//      Normal "All" overview shows only current documents.

//      Renewed documents are historical documents and are
//      accessible through the "Renewed" status filter.

//      Other status filters continue to work normally.
//   ========================================================= */

//   const list = useMemo(() => {

//     return documents.filter((d) => {

//       const matchesSearch = [
//         d.vehicle,
//         d.type,
//         d.number,
//       ]
//         .join(" ")
//         .toLowerCase()
//         .includes(q.toLowerCase());


//       const status = getDocumentStatus(
//         d,
//         settings.reminderDays
//       );


//       /* =====================================================
//          STATUS FILTER
//       ===================================================== */

//       let matchesStatus = false;

//       if (statusFilter === "All") {

//         /*
//          * Main Document Overview should contain only
//          * currently active/current records.
//          *
//          * Renewed documents remain available through
//          * the Renewed filter.
//          */

//         matchesStatus = status !== "Renewed";

//       } else {

//         matchesStatus =
//           status === statusFilter;

//       }


//       return (
//         matchesSearch &&
//         matchesStatus
//       );

//     });

//   }, [
//     documents,
//     q,
//     statusFilter,
//     settings.reminderDays,
//   ]);


//   /* =========================================================
//      CURRENT DOCUMENTS
//      ---------------------------------------------------------
//      Renewed documents are historical records and therefore
//      excluded from the current overview statistics.
//   ========================================================= */

//   const currentDocuments = useMemo(() => {

//     return documents.filter(
//       (document) =>
//         !isRenewedDocument(document)
//     );

//   }, [documents]);


//   /* =========================================================
//      DOCUMENT STATISTICS
//   ========================================================= */

//   const totalDocuments =
//     currentDocuments.length;


//   const activeDocuments =
//     currentDocuments.filter(
//       (document) =>
//         getDocumentStatus(
//           document,
//           settings.reminderDays
//         ) === "Active"
//     ).length;


//   const expiringDocuments =
//     currentDocuments.filter(
//       (document) =>
//         getDocumentStatus(
//           document,
//           settings.reminderDays
//         ) === "Expiring Soon"
//     ).length;


//   const expiredDocuments =
//     currentDocuments.filter(
//       (document) =>
//         getDocumentStatus(
//           document,
//           settings.reminderDays
//         ) === "Expired"
//     ).length;


//   /* =========================================================
//      CLOSE ACTION MENU WHEN CLICKING OUTSIDE
//   ========================================================= */

//   useEffect(() => {

//     const handleOutsideClick = (event) => {

//       if (
//         !event.target.closest(
//           "[data-document-action-menu]"
//         )
//       ) {

//         setOpenActionMenu(null);

//       }

//     };


//     document.addEventListener(
//       "mousedown",
//       handleOutsideClick
//     );


//     return () => {

//       document.removeEventListener(
//         "mousedown",
//         handleOutsideClick
//       );

//     };

//   }, []);


//   /* =========================================================
//      CONFIRM DELETE
//   ========================================================= */

//   const confirmDelete = () => {

//     if (deleteDocumentData) {

//       deleteDocument(
//         deleteDocumentData.id
//       );

//       setDeleteDocumentData(null);

//     }

//   };


//   /* =========================================================
//      CANCEL DELETE
//   ========================================================= */

//   const cancelDelete = () => {

//     setDeleteDocumentData(null);

//   };


//   /* =========================================================
//      VIEW DOCUMENT
//   ========================================================= */

//   const handleViewDocument = (document) => {

//     setSelectedDocument(document);
//     setOpenActionMenu(null);

//   };


//   /* =========================================================
//      DELETE DOCUMENT
//   ========================================================= */

//   const handleDeleteDocument = (document) => {

//     setDeleteDocumentData(document);
//     setOpenActionMenu(null);

//   };


//   /* =========================================================
//      RETURN UI
//   ========================================================= */

//   return (

//     <motion.div

//       variants={containerVariants}

//       initial="hidden"

//       animate="visible"

//       className="pb-8"
//     >


//       {/* =====================================================
//           PAGE HEADER
//       ===================================================== */}

//       <motion.div variants={itemVariants}>

//         <PageHeader
//           title={
//             <div className="flex items-center gap-3">
//               <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 transition duration-300 hover:scale-110 hover:rotate-3">
//                 <FileText
//                   size={23}
//                   strokeWidth={2.3}
//                 />
//               </div>

//               <div>
//                 <span className="block text-2xl font-bold text-slate-800">
//                   Documents
//                 </span>
//               </div>
//             </div>
//           }

//           subtitle="Manage and track all vehicle statutory documents."

//           action={

//             <Link
//               to="/documents/add"
//               className="btn-primary"
//             >

//               <Plus size={17} />

//               Add Document

//             </Link>

//           }

//         />

//       </motion.div>



//       {/* =====================================================
//           DOCUMENT HERO SECTION
//       ===================================================== */}

//       <motion.div

//         variants={itemVariants}

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


//         {/* BACKGROUND DECORATION */}

//         <div
//           className="
//             absolute
//             -right-16
//             -top-16
//             h-52
//             w-52
//             rounded-full
//             bg-blue-200/30
//             blur-3xl
//           "
//         />


//         <div
//           className="
//             absolute
//             -bottom-16
//             left-1/3
//             h-40
//             w-40
//             rounded-full
//             bg-indigo-200/30
//             blur-3xl
//           "
//         />


//         <div
//           className="
//             relative
//             flex
//             flex-col
//             justify-between
//             gap-6
//             md:flex-row
//             md:items-center
//           "
//         >


//           {/* LEFT CONTENT */}

//           <div className="flex items-center gap-4">


//             <motion.div

//               animate={{
//                 y: [0, -4, 0],
//               }}

//               transition={{
//                 duration: 3,
//                 repeat: Infinity,
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

//               <Files size={30} />

//             </motion.div>


//             <div>

//               <p className="text-sm font-medium text-slate-500">

//                 Fleet Document Management

//               </p>


//               <h2
//                 className="
//                   mt-1
//                   text-2xl
//                   font-bold
//                   text-slate-800
//                 "
//               >

//                 Manage Your Documents

//               </h2>


//               <p
//                 className="
//                   mt-2
//                   max-w-xl
//                   text-sm
//                   text-slate-500
//                 "
//               >

//                 Track RC, Insurance, Fitness,
//                 Permits and other important vehicle documents
//                 in one place.

//               </p>

//             </div>


//           </div>



//           {/* RIGHT DOCUMENT COUNT */}

//           <div
//             className="
//               rounded-2xl
//               border
//               border-white
//               bg-white/70
//               px-6
//               py-4
//               text-center
//               shadow-sm
//               backdrop-blur
//             "
//           >

//             <p className="text-xs font-medium text-slate-500">

//               Total Documents

//             </p>


//             <p
//               className="
//                 mt-1
//                 text-3xl
//                 font-bold
//                 text-blue-600
//               "
//             >

//               {totalDocuments}

//             </p>

//           </div>


//         </div>


//       </motion.div>



//       {/* =====================================================
//           STATISTICS CARDS
//       ===================================================== */}

//       <motion.div

//         variants={containerVariants}

//         className="
//           mt-6
//           grid
//           gap-4
//           sm:grid-cols-2
//           xl:grid-cols-4
//         "
//       >


//         <StatCard
//           title="Total Documents"
//           value={totalDocuments}
//           note="All current documents"
//           icon={FileText}
//           bg="bg-blue-50"
//           color="text-blue-600"
//         />


//         <StatCard
//           title="Active"
//           value={activeDocuments}
//           note="Currently valid"
//           icon={CheckCircle2}
//           bg="bg-emerald-50"
//           color="text-emerald-600"
//         />


//         <StatCard
//           title="Expiring Soon"
//           value={expiringDocuments}
//           note={`${settings.reminderDays} day reminder`}
//           icon={AlertTriangle}
//           bg="bg-amber-50"
//           color="text-amber-600"
//         />


//         <StatCard
//           title="Expired"
//           value={expiredDocuments}
//           note="Requires attention"
//           icon={CircleX}
//           bg="bg-red-50"
//           color="text-red-600"
//         />


//       </motion.div>



//       {/* =====================================================
//           DOCUMENT TABLE
//       ===================================================== */}

//       <motion.div

//         variants={itemVariants}

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


//         {/* TABLE HEADER */}

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

//               <div
//                 className="
//                   rounded-lg
//                   bg-blue-50
//                   p-2
//                   text-blue-600
//                 "
//               >
//                 <FileText
//                   size={20}
//                 />
//               </div>

//               <h2 className="text-lg font-bold text-slate-800">

//                 Document Records

//               </h2>

//             </div>

//             <p className="mt-1 text-sm text-slate-500">

//               View and manage all vehicle documents.

//             </p>

//           </div>



//           {/* SEARCH + FILTER */}

//           <div
//             className="
//               flex
//               w-full
//               flex-col
//               gap-2
//               sm:flex-row
//               md:w-auto
//             "
//           >


//             {/* SEARCH */}

//             <div
//               className="
//                 relative
//                 w-full
//                 sm:w-80
//               "
//             >

//               <Search

//                 className="
//                   absolute
//                   left-3
//                   top-1/2
//                   -translate-y-1/2
//                   text-slate-400
//                 "

//                 size={18}

//               />


//               <input

//                 value={q}

//                 onChange={(e) =>
//                   setQ(e.target.value)
//                 }

//                 className="
//                   w-full
//                   rounded-xl
//                   border
//                   border-slate-200
//                   bg-slate-50
//                   py-2.5
//                   pl-10
//                   pr-10
//                   text-sm
//                   outline-none
//                   transition
//                   duration-300
//                   focus:border-blue-400
//                   focus:bg-white
//                   focus:ring-4
//                   focus:ring-blue-50
//                 "

//                 placeholder="Search documents..."

//               />


//               {q && (

//                 <button

//                   onClick={() =>
//                     setQ("")
//                   }

//                   className="
//                     absolute
//                     right-3
//                     top-1/2
//                     -translate-y-1/2
//                     text-slate-400
//                     transition
//                     hover:text-slate-700
//                   "

//                 >

//                   <X size={16} />

//                 </button>

//               )}


//             </div>



//             {/* FILTER BUTTON */}

//             <button

//               onClick={() =>
//                 setShowFilters((prev) => !prev)
//               }

//               className={`
//                 inline-flex
//                 items-center
//                 justify-center
//                 gap-2
//                 rounded-xl
//                 border
//                 px-4
//                 py-2.5
//                 text-sm
//                 font-semibold
//                 transition-all
//                 duration-300
//                 ${
//                   showFilters
//                     ? "border-blue-200 bg-blue-50 text-blue-700"
//                     : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
//                 }
//               `}
//             >

//               <Filter size={17} />

//               Filters

//               <ChevronDown

//                 size={16}

//                 className={`
//                   transition-transform
//                   duration-300
//                   ${showFilters ? "rotate-180" : ""}
//                 `}

//               />

//             </button>


//           </div>


//         </div>



//         {/* =====================================================
//             STATUS FILTER PANEL
//         ===================================================== */}

//         <AnimatePresence>

//           {showFilters && (

//             <motion.div

//               initial={{
//                 opacity: 0,
//                 height: 0,
//                 y: -8,
//               }}

//               animate={{
//                 opacity: 1,
//                 height: "auto",
//                 y: 0,
//               }}

//               exit={{
//                 opacity: 0,
//                 height: 0,
//                 y: -8,
//               }}

//               transition={{
//                 duration: 0.25,
//                 ease: "easeOut",
//               }}

//               className="
//                 overflow-hidden
//                 border-t
//                 border-slate-100
//                 bg-slate-50/70
//               "
//             >

//               <div
//                 className="
//                   flex
//                   flex-col
//                   gap-4
//                   p-5
//                   sm:flex-row
//                   sm:items-end
//                   sm:justify-between
//                 "
//               >


//                 {/* STATUS SELECT */}

//                 <div className="w-full sm:max-w-xs">

//                   <label
//                     className="
//                       mb-2
//                       block
//                       text-xs
//                       font-semibold
//                       uppercase
//                       tracking-wide
//                       text-slate-500
//                     "
//                   >

//                     Document Status

//                   </label>


//                   <div className="relative">

//                     <ShieldCheck

//                       size={17}

//                       className="
//                         pointer-events-none
//                         absolute
//                         left-3
//                         top-1/2
//                         -translate-y-1/2
//                         text-slate-400
//                       "

//                     />


//                     <select

//                       value={statusFilter}

//                       onChange={(e) =>
//                         setStatusFilter(e.target.value)
//                       }

//                       className="
//                         w-full
//                         appearance-none
//                         rounded-xl
//                         border
//                         border-slate-200
//                         bg-white
//                         py-2.5
//                         pl-10
//                         pr-10
//                         text-sm
//                         font-medium
//                         text-slate-700
//                         outline-none
//                         transition-all
//                         duration-300
//                         focus:border-blue-400
//                         focus:ring-4
//                         focus:ring-blue-50
//                       "
//                     >

//                       <option value="All">
//                         All Status
//                       </option>

//                       <option value="Active">
//                         Active
//                       </option>

//                       <option value="Expiring Soon">
//                         Expiring Soon
//                       </option>

//                       <option value="Expired">
//                         Expired
//                       </option>

//                       <option value="Renewed">
//                         Renewed
//                       </option>

//                     </select>


//                     <ChevronDown

//                       size={16}

//                       className="
//                         pointer-events-none
//                         absolute
//                         right-3
//                         top-1/2
//                         -translate-y-1/2
//                         text-slate-400
//                       "

//                     />

//                   </div>

//                 </div>



//                 {/* CLEAR FILTER */}

//                 <motion.button

//                   whileHover={{
//                     scale: 1.02,
//                   }}

//                   whileTap={{
//                     scale: 0.97,
//                   }}

//                   onClick={() =>
//                     setStatusFilter("All")
//                   }

//                   disabled={statusFilter === "All"}

//                   className={`
//                     inline-flex
//                     items-center
//                     justify-center
//                     gap-2
//                     rounded-xl
//                     border
//                     px-4
//                     py-2.5
//                     text-sm
//                     font-semibold
//                     transition-all
//                     duration-300
//                     ${
//                       statusFilter === "All"
//                         ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
//                         : "border-blue-200 bg-white text-blue-600 hover:bg-blue-50"
//                     }
//                   `}
//                 >

//                   <X size={16} />

//                   Clear Filter

//                 </motion.button>


//               </div>

//             </motion.div>

//           )}

//         </AnimatePresence>



//         {/* TABLE */}

//         <div className="overflow-x-auto">


//           <table
//             className="
//               w-full
//               min-w-[950px]
//               text-sm
//             "
//           >


//             <thead
//               className="
//                 border-b
//                 border-slate-100
//                 bg-slate-50
//                 text-xs
//                 font-semibold
//                 uppercase
//                 tracking-wide
//                 text-slate-500
//               "
//             >

//               <tr>

//                 <th className="px-6 py-4 text-left">

//                   Vehicle No.

//                 </th>


//                 <th className="text-left">

//                   Document Type

//                 </th>


//                 <th className="text-left">

//                   Document Number

//                 </th>


//                 <th className="text-left">

//                   Start Date

//                 </th>


//                 <th className="text-left">

//                   Expiry Date

//                 </th>


//                 <th className="text-left">

//                   Status

//                 </th>


//                 <th className="px-6 text-center">

//                   Action

//                 </th>

//               </tr>

//             </thead>



//             <tbody>


//               <AnimatePresence>


//                 {list.map((d, index) => {

//                   const status =
//                     getDocumentStatus(
//                       d,
//                       settings.reminderDays
//                     );


//                   return (

//                     <motion.tr

//                       key={d.id}

//                       initial={{
//                         opacity: 0,
//                         y: 10,
//                       }}

//                       animate={{
//                         opacity: 1,
//                         y: 0,
//                       }}

//                       exit={{
//                         opacity: 0,
//                         x: -20,
//                       }}

//                       transition={{
//                         delay: index * 0.03,
//                         duration: 0.3,
//                       }}

//                       className="
//                         group
//                         border-b
//                         border-slate-100
//                         transition
//                         duration-300
//                         hover:bg-blue-50/40
//                       "
//                     >


//                       {/* VEHICLE NUMBER */}

//                       <td className="px-6 py-5">


//                         <div
//                           className="
//                             flex
//                             items-center
//                             gap-3
//                           "
//                         >


//                           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">

//                             <FileText size={19} />

//                           </div>


//                           <span
//                             className="
//                               font-semibold
//                               text-base
//                               text-blue-700
//                             "
//                           >

//                             {d.vehicle}

//                           </span>


//                         </div>


//                       </td>



//                       <td>

//                         <span
//                           className="
//                             font-medium
//                             text-slate-700
//                           "
//                         >

//                           {d.type}

//                         </span>

//                       </td>



//                       <td className="text-slate-600">

//                         {d.number}

//                       </td>



//                       <td className="text-slate-600">

//                         {formatDate(
//                           d.start || d.issueDate
//                         )}

//                       </td>


//                       <td>

//                         <span
//                           className="
//                             font-medium
//                             text-slate-700
//                           "
//                         >

//                           {formatDate(d.expiry)}

//                         </span>

//                       </td>



//                       <td>

//                         <StatusBadge
//                           status={status}
//                         />

//                       </td>



//                       {/* =================================================
//                           ACTIONS
//                       ================================================= */}

//                       <td className="px-6 py-4">

//                         <div
//                           className="
//                             relative
//                             flex
//                             justify-center
//                           "
//                           data-document-action-menu
//                         >


//                           {/* MORE VERTICAL BUTTON */}

//                           <motion.button

//                             whileHover={{
//                               scale: 1.1,
//                             }}

//                             whileTap={{
//                               scale: 0.9,
//                             }}

//                             onClick={() =>
//                               setOpenActionMenu(
//                                 openActionMenu === d.id
//                                   ? null
//                                   : d.id
//                               )
//                             }

//                             className="
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

//                             title="More Actions"
//                           >

//                             <MoreVertical size={18} />

//                           </motion.button>



//                           {/* ACTION MENU */}

//                           <AnimatePresence>

//                             {openActionMenu === d.id && (

//                               <motion.div

//                                 initial={{
//                                   opacity: 0,
//                                   scale: 0.95,
//                                   y: -5,
//                                 }}

//                                 animate={{
//                                   opacity: 1,
//                                   scale: 1,
//                                   y: 0,
//                                 }}

//                                 exit={{
//                                   opacity: 0,
//                                   scale: 0.95,
//                                   y: -5,
//                                 }}

//                                 transition={{
//                                   duration: 0.15,
//                                 }}

//                                 className="
//                                   absolute
//                                   right-0
//                                   top-11
//                                   z-30
//                                   w-36
//                                   overflow-hidden
//                                   rounded-xl
//                                   border
//                                   border-slate-200
//                                   bg-white
//                                   p-1.5
//                                   shadow-xl
//                                 "
//                               >


//                                 {/* VIEW BUTTON */}

//                                 <button

//                                   onClick={() =>
//                                     handleViewDocument(d)
//                                   }

//                                   className="
//                                     flex
//                                     w-full
//                                     items-center
//                                     gap-3
//                                     rounded-lg
//                                     px-3
//                                     py-2.5
//                                     text-left
//                                     text-sm
//                                     font-medium
//                                     text-slate-600
//                                     transition
//                                     hover:bg-blue-50
//                                     hover:text-blue-600
//                                   "
//                                 >

//                                   <Eye size={16} />

//                                   <span>
//                                     View
//                                   </span>

//                                 </button>



//                                 {/* DELETE BUTTON */}

//                                 <button

//                                   onClick={() =>
//                                     handleDeleteDocument(d)
//                                   }

//                                   className="
//                                     flex
//                                     w-full
//                                     items-center
//                                     gap-3
//                                     rounded-lg
//                                     px-3
//                                     py-2.5
//                                     text-left
//                                     text-sm
//                                     font-medium
//                                     text-red-500
//                                     transition
//                                     hover:bg-red-50
//                                     hover:text-red-600
//                                   "
//                                 >

//                                   <Trash2 size={16} />

//                                   <span>
//                                     Delete
//                                   </span>

//                                 </button>


//                               </motion.div>

//                             )}

//                           </AnimatePresence>


//                         </div>

//                       </td>


//                     </motion.tr>

//                   );

//                 })}


//               </AnimatePresence>


//             </tbody>

//           </table>


//           {/* ===================================================
//               TABLE FOOTER
//           =================================================== */}

//           {list.length > 0 && (

//             <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">


//               <span>


//                 Showing{" "}


//                 <strong className="text-slate-700">

//                   {list.length}

//                 </strong>


//                 {" "}documents


//               </span>


//               <button

//                 onClick={() =>
//                   setQ("")
//                 }

//                 className="flex items-center gap-1 font-medium text-blue-600 transition hover:text-blue-800"


//               >

//                 View More

//                 <ChevronDown size={16} />

//               </button>

//             </div>

//           )}



//           {/* EMPTY STATE */}

//           {list.length === 0 && (

//             <motion.div

//               initial={{
//                 opacity: 0,
//                 scale: 0.95,
//               }}

//               animate={{
//                 opacity: 1,
//                 scale: 1,
//               }}

//               className="
//                 flex
//                 flex-col
//                 items-center
//                 justify-center
//                 py-16
//                 text-center
//               "
//             >


//               <div
//                 className="
//                   flex
//                   h-20
//                   w-20
//                   items-center
//                   justify-center
//                   rounded-3xl
//                   bg-slate-100
//                   text-slate-400
//                 "
//               >

//                 <FileText size={34} />

//               </div>


//               <h3
//                 className="
//                   mt-5
//                   text-lg
//                   font-bold
//                   text-slate-700
//                 "
//               >

//                 No Documents Found

//               </h3>


//               <p
//                 className="
//                   mt-2
//                   text-sm
//                   text-slate-400
//                 "
//               >

//                 {q || statusFilter !== "All"
//                   ? "Try changing your search or filter."
//                   : "Start by adding your first vehicle document."
//                 }

//               </p>


//               {!q && statusFilter === "All" && (

//                 <Link

//                   to="/documents/add"

//                   className="
//                     mt-5
//                     flex
//                     items-center
//                     gap-2
//                     rounded-xl
//                     bg-gradient-to-r
//                     from-blue-600
//                     to-indigo-600
//                     px-5
//                     py-2.5
//                     text-sm
//                     font-semibold
//                     text-white
//                     shadow-lg
//                     shadow-blue-100
//                     transition
//                     hover:scale-[1.02]
//                   "
//                 >

//                   <Plus size={17} />

//                   Add First Document

//                 </Link>

//               )}


//             </motion.div>

//           )}


//         </div>


//       </motion.div>



//       {/* =====================================================
//           DOCUMENT DETAILS MODAL
//       ===================================================== */}

//       <AnimatePresence>

//         {selectedDocument && (

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
//               setSelectedDocument(null)
//             }

//             className="
//               fixed
//               inset-0
//               z-50
//               flex
//               items-center
//               justify-center
//               bg-slate-900/50
//               p-4
//               backdrop-blur-sm
//             "
//           >


//             <motion.div

//               initial={{
//                 opacity: 0,
//                 scale: 0.9,
//                 y: 30,
//               }}

//               animate={{
//                 opacity: 1,
//                 scale: 1,
//                 y: 0,
//               }}

//               exit={{
//                 opacity: 0,
//                 scale: 0.9,
//                 y: 30,
//               }}

//               transition={{
//                 duration: 0.25,
//               }}

//               onClick={(e) =>
//                 e.stopPropagation()
//               }

//               className="
//                 w-full
//                 max-w-2xl
//                 overflow-hidden
//                 rounded-3xl
//                 bg-white
//                 shadow-2xl
//               "
//             >


//               {/* MODAL HEADER */}

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

//                 <div
//                   className="
//                     absolute
//                     -right-10
//                     -top-10
//                     h-40
//                     w-40
//                     rounded-full
//                     bg-white/10
//                   "
//                 />


//                 <div
//                   className="
//                     relative
//                     flex
//                     items-center
//                     justify-between
//                   "
//                 >


//                   <div className="flex items-center gap-4">


//                     <div
//                       className="
//                         flex
//                         h-14
//                         w-14
//                         items-center
//                         justify-center
//                         rounded-2xl
//                         bg-white/20
//                         backdrop-blur
//                       "
//                     >

//                       <FileText size={28} />

//                     </div>


//                     <div>

//                       <p className="text-sm text-blue-100">

//                         Vehicle Document

//                       </p>


//                       <h2
//                         className="
//                           mt-1
//                           text-xl
//                           font-bold
//                         "
//                       >

//                         Document Details

//                       </h2>

//                     </div>


//                   </div>



//                   <button

//                     onClick={() =>
//                       setSelectedDocument(null)
//                     }

//                     className="
//                       flex
//                       h-10
//                       w-10
//                       items-center
//                       justify-center
//                       rounded-xl
//                       bg-white/10
//                       transition
//                       hover:bg-white/20
//                     "

//                   >

//                     <X size={20} />

//                   </button>


//                 </div>


//               </div>



//               {/* MODAL CONTENT */}

//               <div className="p-6">


//                 <div
//                   className="
//                     mb-6
//                     flex
//                     items-center
//                     justify-between
//                     rounded-2xl
//                     border
//                     border-slate-100
//                     bg-slate-50
//                     p-4
//                   "
//                 >


//                   <div>

//                     <p
//                       className="
//                         text-xs
//                         font-medium
//                         uppercase
//                         tracking-wide
//                         text-slate-400
//                       "
//                     >

//                       Current Status

//                     </p>


//                     <p
//                       className="
//                         mt-1
//                         font-semibold
//                         text-slate-700
//                       "
//                     >

//                       {selectedDocument.type}

//                     </p>


//                   </div>


//                   <StatusBadge

//                     status={
//                       getDocumentStatus(
//                         selectedDocument,
//                         settings.reminderDays
//                       )
//                     }

//                   />

//                 </div>



//                 {/* DETAILS GRID */}

//                 <div
//                   className="
//                     grid
//                     gap-4
//                     sm:grid-cols-2
//                   "
//                 >


//                   <DetailBox
//                     icon={Car}
//                     label="Vehicle Number"
//                     value={selectedDocument.vehicle}
//                   />


//                   <DetailBox
//                     icon={FileText}
//                     label="Document Type"
//                     value={selectedDocument.type}
//                   />


//                   <DetailBox
//                     icon={Hash}
//                     label="Document Number"
//                     value={selectedDocument.number}
//                   />


//                   <DetailBox
//                     icon={Calendar}
//                     label="Start Date / Issue Date"
//                     value={formatDate(
//                       selectedDocument.start ||
//                       selectedDocument.issueDate
//                     )}
//                   />


//                   <DetailBox
//                     icon={Calendar}
//                     label="Expiry Date"
//                     value={formatDate(
//                       selectedDocument.expiry
//                     )}
//                   />


//                   <DetailBox
//                     icon={ShieldCheck}
//                     label="Document Status"
//                     value={
//                       getDocumentStatus(
//                         selectedDocument,
//                         settings.reminderDays
//                       )
//                     }
//                   />


//                 </div>



//                 {/* =================================================
//                     UPLOADED DOCUMENT
//                     Existing UI preserved.
//                 ================================================= */}

//                 <div className="mt-6 border-t border-slate-100 pt-5">

//                   <div className="mb-3 flex items-center gap-2">

//                     <div
//                       className="
//                         flex
//                         h-9
//                         w-9
//                         items-center
//                         justify-center
//                         rounded-xl
//                         bg-blue-50
//                         text-blue-600
//                       "
//                     >

//                       <FileUp size={18} />

//                     </div>

//                     <div>

//                       <p className="text-sm font-semibold text-slate-700">

//                         Uploaded Document

//                       </p>

//                       <p className="text-xs text-slate-400">

//                         Open the uploaded PDF or image

//                       </p>

//                     </div>

//                   </div>


//                   {(selectedDocument.fileData ||
//                     selectedDocument.fileUrl ||
//                     selectedDocument.fileName) ? (

//                     <button

//                       type="button"

//                       onClick={() =>
//                         openDocumentFile(
//                           selectedDocument
//                         )
//                       }

//                       className="
//                         flex
//                         w-full
//                         items-center
//                         gap-3
//                         rounded-2xl
//                         border
//                         border-slate-200
//                         bg-slate-50
//                         p-4
//                         text-left
//                         transition
//                         duration-300
//                         hover:border-blue-200
//                         hover:bg-blue-50
//                         hover:shadow-sm
//                       "
//                     >

//                       <div
//                         className="
//                           flex
//                           h-11
//                           w-11
//                           shrink-0
//                           items-center
//                           justify-center
//                           rounded-xl
//                           bg-blue-100
//                           text-blue-600
//                         "
//                       >

//                         <FileText size={21} />

//                       </div>


//                       <div className="min-w-0 flex-1">

//                         <p className="truncate text-sm font-semibold text-slate-700">

//                           {selectedDocument.fileName ||
//                             "Uploaded Document"}

//                         </p>

//                         <p className="mt-1 text-xs text-blue-600">

//                           Click to open document

//                         </p>

//                       </div>


//                       <Eye
//                         size={18}
//                         className="shrink-0 text-slate-400"
//                       />

//                     </button>

//                   ) : (

//                     <div
//                       className="
//                         rounded-2xl
//                         border
//                         border-dashed
//                         border-slate-200
//                         bg-slate-50
//                         p-4
//                         text-center
//                       "
//                     >

//                       <p className="text-sm text-slate-400">

//                         No uploaded document available.

//                       </p>

//                     </div>

//                   )}

//                 </div>



//                 <div
//                   className="
//                     mt-6
//                     flex
//                     justify-end
//                     border-t
//                     border-slate-100
//                     pt-5
//                   "
//                 >


//                   <button

//                     onClick={() =>
//                       setSelectedDocument(null)
//                     }

//                     className="
//                       rounded-xl
//                       bg-slate-100
//                       px-5
//                       py-2.5
//                       text-sm
//                       font-semibold
//                       text-slate-600
//                       transition
//                       hover:bg-slate-200
//                     "

//                   >

//                     Close

//                   </button>


//                 </div>


//               </div>


//             </motion.div>


//           </motion.div>

//         )}

//       </AnimatePresence>



//       {/* =====================================================
//           DELETE CONFIRMATION MODAL
//       ===================================================== */}

//       <AnimatePresence>

//         {deleteDocumentData && (

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

//             onClick={cancelDelete}

//             className="
//               fixed
//               inset-0
//               z-[60]
//               flex
//               items-center
//               justify-center
//               bg-slate-900/50
//               p-4
//               backdrop-blur-sm
//             "
//           >


//             <motion.div

//               initial={{
//                 opacity: 0,
//                 scale: 0.85,
//                 y: 30,
//               }}

//               animate={{
//                 opacity: 1,
//                 scale: 1,
//                 y: 0,
//               }}

//               exit={{
//                 opacity: 0,
//                 scale: 0.85,
//                 y: 30,
//               }}

//               transition={{
//                 duration: 0.25,
//               }}

//               onClick={(e) =>
//                 e.stopPropagation()
//               }

//               className="
//                 w-full
//                 max-w-md
//                 overflow-hidden
//                 rounded-3xl
//                 bg-white
//                 p-7
//                 text-center
//                 shadow-2xl
//               "
//             >


//               {/* DELETE ICON */}

//               <motion.div

//                 initial={{
//                   scale: 0,
//                   rotate: -20,
//                 }}

//                 animate={{
//                   scale: 1,
//                   rotate: 0,
//                 }}

//                 transition={{
//                   type: "spring",
//                   stiffness: 200,
//                 }}

//                 className="
//                   mx-auto
//                   flex
//                   h-20
//                   w-20
//                   items-center
//                   justify-center
//                   rounded-full
//                   bg-red-50
//                   text-red-500
//                 "
//               >

//                 <Trash2 size={34} />

//               </motion.div>



//               {/* TITLE */}

//               <h2
//                 className="
//                   mt-5
//                   text-xl
//                   font-bold
//                   text-slate-800
//                 "
//               >

//                 Delete Document?

//               </h2>



//               {/* MESSAGE */}

//               <p
//                 className="
//                   mt-3
//                   text-sm
//                   leading-6
//                   text-slate-500
//                 "
//               >

//                 Are you sure you want to delete this document?

//               </p>


//               {/* DOCUMENT INFO */}

//               <div
//                 className="
//                   mt-5
//                   rounded-2xl
//                   border
//                   border-red-100
//                   bg-red-50/50
//                   p-4
//                   text-left
//                 "
//               >

//                 <p className="text-xs text-slate-400">

//                   Vehicle Number

//                 </p>


//                 <p className="mt-1 font-semibold text-slate-700">

//                   {deleteDocumentData.vehicle}

//                 </p>


//                 <p className="mt-3 text-xs text-slate-400">

//                   Document Type

//                 </p>


//                 <p className="mt-1 font-semibold text-slate-700">

//                   {deleteDocumentData.type}

//                 </p>


//               </div>



//               {/* WARNING */}

//               <p
//                 className="
//                   mt-4
//                   text-xs
//                   text-red-400
//                 "
//               >

//                 This action cannot be undone.

//               </p>



//               {/* BUTTONS */}

//               <div
//                 className="
//                   mt-6
//                   grid
//                   grid-cols-2
//                   gap-3
//                 "
//               >


//                 {/* NO BUTTON */}

//                 <motion.button

//                   whileHover={{
//                     scale: 1.02,
//                   }}

//                   whileTap={{
//                     scale: 0.97,
//                   }}

//                   onClick={cancelDelete}

//                   className="
//                     rounded-xl
//                     bg-slate-100
//                     px-4
//                     py-3
//                     text-sm
//                     font-semibold
//                     text-slate-600
//                     transition
//                     hover:bg-slate-200
//                   "
//                 >

//                   No, Keep It

//                 </motion.button>



//                 {/* YES DELETE BUTTON */}

//                 <motion.button

//                   whileHover={{
//                     scale: 1.02,
//                   }}

//                   whileTap={{
//                     scale: 0.97,
//                   }}

//                   onClick={confirmDelete}

//                   className="
//                     rounded-xl
//                     bg-gradient-to-r
//                     from-red-500
//                     to-rose-600
//                     px-4
//                     py-3
//                     text-sm
//                     font-semibold
//                     text-white
//                     shadow-lg
//                     shadow-red-200
//                     transition
//                     hover:shadow-xl
//                   "
//                 >

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
//    DETAIL BOX COMPONENT
// ========================================================= */

// function DetailBox({
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
//         rounded-2xl
//         border
//         border-slate-100
//         bg-white
//         p-4
//         shadow-sm
//         transition
//         hover:border-blue-100
//         hover:shadow-md
//       "
//     >


//       <div
//         className="
//           flex
//           items-center
//           gap-3
//         "
//       >


//         <div
//           className="
//             flex
//             h-10
//             w-10
//             items-center
//             justify-center
//             rounded-xl
//             bg-blue-50
//             text-blue-600
//           "
//         >

//           <Icon size={18} />

//         </div>


//         <div className="min-w-0">


//           <p
//             className="
//               text-xs
//               text-slate-400
//             "
//           >

//             {label}

//           </p>


//           <p
//             className="
//               mt-1
//               truncate
//               font-semibold
//               text-slate-700
//             "
//           >

//             {value || "Not Available"}

//           </p>


//         </div>


//       </div>


//     </motion.div>

//   );

// }



// /* =========================================================
//    STAT CARD COMPONENT
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

//       variants={itemVariants}

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


//       <div
//         className="
//           relative
//           flex
//           items-center
//           justify-between
//         "
//       >


//         <div>


//           <p
//             className="
//               text-sm
//               font-medium
//               text-slate-500
//             "
//           >

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

//             className="
//               mt-2
//               text-3xl
//               font-bold
//               text-slate-800
//             "
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
//           ${color.replace("text-", "bg-")}
//           transition-all
//           duration-500
//           group-hover:w-full
//         `}

//       />


//     </motion.div>

//   );

// }








import { useMemo, useState, useEffect } from "react";

import {
  Plus,
  Search,
  Eye,
  Trash2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  CircleX,
  Files,
  X,
  Calendar,
  Hash,
  Car,
  ShieldCheck,
  MoreVertical,
  Filter,
  ChevronDown,
  FileUp,
} from "lucide-react";

import { Link } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";

import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";

import {
  useFleet,
  getExpiryStatus,
} from "../context/fleetContext";


/* =========================================================
   DATE FORMAT
========================================================= */

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


/* =========================================================
   DOCUMENT STATUS HELPER
   ---------------------------------------------------------
   Renewed documents are historical documents.

   We support multiple possible field names so the page
   remains compatible with the updated FleetContext.
========================================================= */

const isRenewedDocument = (document) => {
  if (!document) return false;

  return (
    document.status === "Renewed" ||
    document.documentStatus === "Renewed" ||
    document.renewalStatus === "Renewed" ||
    document.isRenewed === true
  );
};


/* =========================================================
   GET DOCUMENT STATUS
   ---------------------------------------------------------
   Renewed status always has priority over expiry status.
========================================================= */

const getDocumentStatus = (document, reminderDays) => {
  if (isRenewedDocument(document)) {
    return "Renewed";
  }

  return getExpiryStatus(
    document?.expiry,
    reminderDays
  );
};


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


/* =========================================================
   OPEN UPLOADED DOCUMENT
   Handles data URLs safely by converting them to Blob URLs.
   This avoids Chrome:
   "Not allowed to navigate top frame to data URL"
========================================================= */

const openDocumentFile = async (doc) => {
  if (!doc) return;

  const source = doc.fileData || doc.fileUrl;

  if (!source) {
    alert("No uploaded document is available.");
    return;
  }

  try {
    /* =====================================================
       DATA URL
    ===================================================== */

    if (
      typeof source === "string" &&
      source.startsWith("data:")
    ) {
      const response = await fetch(source);

      if (!response.ok) {
        throw new Error(
          "Unable to read the uploaded document."
        );
      }

      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);

      /*
       * Open a blank tab first and then navigate that tab
       * to the Blob URL.
       *
       * This avoids navigating the current/top frame
       * directly to a data URL.
       */

      const newWindow = window.open("", "_blank");

      if (newWindow) {
        newWindow.opener = null;
        newWindow.location.href = blobUrl;

        /*
         * Keep the Blob URL alive long enough for the browser
         * to load the document.
         */

        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 60000);

        return;
      }

      /*
       * Popup blocker fallback.
       */

      const anchor =
        window.document.createElement("a");

      anchor.href = blobUrl;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";

      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 60000);

      return;
    }


    /* =====================================================
       HTTP / HTTPS FILE URL
    ===================================================== */

    if (
      typeof source === "string" &&
      (
        source.startsWith("http://") ||
        source.startsWith("https://")
      )
    ) {
      const newWindow = window.open("", "_blank");

      if (newWindow) {
        newWindow.opener = null;
        newWindow.location.href = source;
        return;
      }

      const anchor =
        window.document.createElement("a");

      anchor.href = source;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";

      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      return;
    }


    /* =====================================================
       FALLBACK
       Try fetching the source and opening as Blob.
    ===================================================== */

    const response = await fetch(source);

    if (!response.ok) {
      throw new Error(
        "Unable to open the document."
      );
    }

    const blob = await response.blob();

    const blobUrl = URL.createObjectURL(blob);

    const newWindow = window.open("", "_blank");

    if (newWindow) {
      newWindow.opener = null;
      newWindow.location.href = blobUrl;

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 60000);

      return;
    }

    const anchor =
      window.document.createElement("a");

    anchor.href = blobUrl;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";

    window.document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 60000);

  } catch (error) {
    console.error(
      "Unable to open uploaded document:",
      error
    );

    alert(
      "Unable to open the uploaded document. Please try uploading the file again."
    );
  }
};


/* =========================================================
   DOCUMENTS PAGE
========================================================= */

export default function Documents() {

  const [showFilters, setShowFilters] = useState(false);


  /* =========================================================
     FLEET CONTEXT
  ========================================================= */

  const {
    documents,
    settings,
    deleteDocument,
    users = [],
  } = useFleet();


  /* =========================================================
     CURRENT USER & ROLE PERMISSIONS
     ---------------------------------------------------------
     Permissions are controlled from Settings.jsx.

     AddUser uses "Finincer", while Settings uses
     "Finance". Both therefore use the same permission set.
  ========================================================= */

  const loggedInUserId =
    localStorage.getItem("fleetdoc_user_id");

  const loggedInUserEmail =
    localStorage.getItem("fleetdoc_user_email");


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


  const storedRole =
    localStorage.getItem("fleetdoc_user_role");


  const currentUserRole =
    currentUser?.role ||
    storedRole ||
    "Admin";


  /*
   * Finincer → Finance
   */
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
      settings: true,
      users: true,
    };


  const canViewDocuments =
    currentPermissions.view === true;


  const canAddDocuments =
    currentPermissions.add === true;


  const canEditDocuments =
    currentPermissions.edit === true;


  const canDeleteDocuments =
    currentPermissions.delete === true;


  /* =========================================================
     SEARCH STATE
  ========================================================= */

  const [q, setQ] = useState("");


  /* =========================================================
     STATUS FILTER STATE
  ========================================================= */

  const [statusFilter, setStatusFilter] = useState("All");


  /* =========================================================
     DOCUMENT DETAILS MODAL STATE
  ========================================================= */

  const [selectedDocument, setSelectedDocument] =
    useState(null);


  /* =========================================================
     DELETE CONFIRMATION STATE
  ========================================================= */

  const [deleteDocumentData, setDeleteDocumentData] =
    useState(null);


  /* =========================================================
     MORE ACTION MENU STATE
  ========================================================= */

  const [openActionMenu, setOpenActionMenu] =
    useState(null);


  /* =========================================================
     FILTER DOCUMENTS
     ---------------------------------------------------------
     IMPORTANT:

     Normal "All" overview shows only current documents.

     Renewed documents are historical documents and are
     accessible through the "Renewed" status filter.

     Other status filters continue to work normally.
  ========================================================= */

  const list = useMemo(() => {

    return documents.filter((d) => {

      const matchesSearch = [
        d.vehicle,
        d.type,
        d.number,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase());


      const status = getDocumentStatus(
        d,
        settings.reminderDays
      );


      /* =====================================================
         STATUS FILTER
      ===================================================== */

      let matchesStatus = false;

      if (statusFilter === "All") {

        /*
         * Main Document Overview should contain only
         * currently active/current records.
         *
         * Renewed documents remain available through
         * the Renewed filter.
         */

        matchesStatus = status !== "Renewed";

      } else {

        matchesStatus =
          status === statusFilter;

      }


      return (
        matchesSearch &&
        matchesStatus
      );

    });

  }, [
    documents,
    q,
    statusFilter,
    settings.reminderDays,
  ]);


  /* =========================================================
     CURRENT DOCUMENTS
     ---------------------------------------------------------
     Renewed documents are historical records and therefore
     excluded from the current overview statistics.
  ========================================================= */

  const currentDocuments = useMemo(() => {

    return documents.filter(
      (document) =>
        !isRenewedDocument(document)
    );

  }, [documents]);


  /* =========================================================
     DOCUMENT STATISTICS
  ========================================================= */

  const totalDocuments =
    currentDocuments.length;


  const activeDocuments =
    currentDocuments.filter(
      (document) =>
        getDocumentStatus(
          document,
          settings.reminderDays
        ) === "Active"
    ).length;


  const expiringDocuments =
    currentDocuments.filter(
      (document) =>
        getDocumentStatus(
          document,
          settings.reminderDays
        ) === "Expiring Soon"
    ).length;


  const expiredDocuments =
    currentDocuments.filter(
      (document) =>
        getDocumentStatus(
          document,
          settings.reminderDays
        ) === "Expired"
    ).length;


  /* =========================================================
     CLOSE ACTION MENU WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {

    const handleOutsideClick = (event) => {

      if (
        !event.target.closest(
          "[data-document-action-menu]"
        )
      ) {

        setOpenActionMenu(null);

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
     CONFIRM DELETE
     ---------------------------------------------------------
     Permission is checked again here so the delete operation
     cannot execute through this handler when permission is
     disabled.
  ========================================================= */

  const confirmDelete = () => {

    if (!canDeleteDocuments) {
      setDeleteDocumentData(null);
      return;
    }

    if (deleteDocumentData) {

      deleteDocument(
        deleteDocumentData.id
      );

      setDeleteDocumentData(null);

    }

  };


  /* =========================================================
     CANCEL DELETE
  ========================================================= */

  const cancelDelete = () => {

    setDeleteDocumentData(null);

  };


  /* =========================================================
     VIEW DOCUMENT
  ========================================================= */

  const handleViewDocument = (document) => {

    if (!canViewDocuments) {
      return;
    }

    setSelectedDocument(document);
    setOpenActionMenu(null);

  };


  /* =========================================================
     DELETE DOCUMENT
  ========================================================= */

  const handleDeleteDocument = (document) => {

    if (!canDeleteDocuments) {
      return;
    }

    setDeleteDocumentData(document);
    setOpenActionMenu(null);

  };


  /* =========================================================
     VIEW PERMISSION GUARD
     ---------------------------------------------------------
     Existing page UI remains unchanged for users who have
     View permission.
  ========================================================= */

  if (!canViewDocuments) {

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

        className="
          flex
          min-h-[500px]
          items-center
          justify-center
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
              h-20
              w-20
              items-center
              justify-center
              rounded-3xl
              bg-red-50
              text-red-500
            "
          >

            <ShieldCheck size={36} />

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

            You do not have permission to view vehicle
            documents. Please contact your administrator
            if you need access.

          </p>

        </div>

      </motion.div>

    );

  }


  /* =========================================================
     RETURN UI
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

      <motion.div variants={itemVariants}>

        <PageHeader
          title={
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 transition duration-300 hover:scale-110 hover:rotate-3">
                <FileText
                  size={23}
                  strokeWidth={2.3}
                />
              </div>

              <div>
                <span className="block text-2xl font-bold text-slate-800">
                  Documents
                </span>
              </div>
            </div>
          }

          subtitle="Manage and track all vehicle statutory documents."

          action={

            canAddDocuments ? (

              <Link
                to="/documents/add"
                className="btn-primary"
              >

                <Plus size={17} />

                Add Document

              </Link>

            ) : null

          }

        />

      </motion.div>



      {/* =====================================================
          DOCUMENT HERO SECTION
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


        {/* BACKGROUND DECORATION */}

        <div
          className="
            absolute
            -right-16
            -top-16
            h-52
            w-52
            rounded-full
            bg-blue-200/30
            blur-3xl
          "
        />


        <div
          className="
            absolute
            -bottom-16
            left-1/3
            h-40
            w-40
            rounded-full
            bg-indigo-200/30
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


          {/* LEFT CONTENT */}

          <div className="flex items-center gap-4">


            <motion.div

              animate={{
                y: [0, -4, 0],
              }}

              transition={{
                duration: 3,
                repeat: Infinity,
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

              <Files size={30} />

            </motion.div>


            <div>

              <p className="text-sm font-medium text-slate-500">

                Fleet Document Management

              </p>


              <h2
                className="
                  mt-1
                  text-2xl
                  font-bold
                  text-slate-800
                "
              >

                Manage Your Documents

              </h2>


              <p
                className="
                  mt-2
                  max-w-xl
                  text-sm
                  text-slate-500
                "
              >

                Track RC, Insurance, Fitness,
                Permits and other important vehicle documents
                in one place.

              </p>

            </div>


          </div>



          {/* RIGHT DOCUMENT COUNT */}

          <div
            className="
              rounded-2xl
              border
              border-white
              bg-white/70
              px-6
              py-4
              text-center
              shadow-sm
              backdrop-blur
            "
          >

            <p className="text-xs font-medium text-slate-500">

              Total Documents

            </p>


            <p
              className="
                mt-1
                text-3xl
                font-bold
                text-blue-600
              "
            >

              {totalDocuments}

            </p>

          </div>


        </div>


      </motion.div>



      {/* =====================================================
          STATISTICS CARDS
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
          title="Total Documents"
          value={totalDocuments}
          note="All current documents"
          icon={FileText}
          bg="bg-blue-50"
          color="text-blue-600"
        />


        <StatCard
          title="Active"
          value={activeDocuments}
          note="Currently valid"
          icon={CheckCircle2}
          bg="bg-emerald-50"
          color="text-emerald-600"
        />


        <StatCard
          title="Expiring Soon"
          value={expiringDocuments}
          note={`${settings.reminderDays} day reminder`}
          icon={AlertTriangle}
          bg="bg-amber-50"
          color="text-amber-600"
        />


        <StatCard
          title="Expired"
          value={expiredDocuments}
          note="Requires attention"
          icon={CircleX}
          bg="bg-red-50"
          color="text-red-600"
        />


      </motion.div>



      {/* =====================================================
          DOCUMENT TABLE
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


        {/* TABLE HEADER */}

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
                <FileText
                  size={20}
                />
              </div>

              <h2 className="text-lg font-bold text-slate-800">

                Document Records

              </h2>

            </div>

            <p className="mt-1 text-sm text-slate-500">

              View and manage all vehicle documents.

            </p>

          </div>



          {/* SEARCH + FILTER */}

          <div
            className="
              flex
              w-full
              flex-col
              gap-2
              sm:flex-row
              md:w-auto
            "
          >


            {/* SEARCH */}

            <div
              className="
                relative
                w-full
                sm:w-80
              "
            >

              <Search

                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "

                size={18}

              />


              <input

                value={q}

                onChange={(e) =>
                  setQ(e.target.value)
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

                placeholder="Search documents..."

              />


              {q && (

                <button

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



            {/* FILTER BUTTON */}

            <button

              onClick={() =>
                setShowFilters((prev) => !prev)
              }

              className={`
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                px-4
                py-2.5
                text-sm
                font-semibold
                transition-all
                duration-300
                ${
                  showFilters
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                }
              `}
            >

              <Filter size={17} />

              Filters

              <ChevronDown

                size={16}

                className={`
                  transition-transform
                  duration-300
                  ${showFilters ? "rotate-180" : ""}
                `}

              />

            </button>


          </div>


        </div>



        {/* =====================================================
            STATUS FILTER PANEL
        ===================================================== */}

        <AnimatePresence>

          {showFilters && (

            <motion.div

              initial={{
                opacity: 0,
                height: 0,
                y: -8,
              }}

              animate={{
                opacity: 1,
                height: "auto",
                y: 0,
              }}

              exit={{
                opacity: 0,
                height: 0,
                y: -8,
              }}

              transition={{
                duration: 0.25,
                ease: "easeOut",
              }}

              className="
                overflow-hidden
                border-t
                border-slate-100
                bg-slate-50/70
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-4
                  p-5
                  sm:flex-row
                  sm:items-end
                  sm:justify-between
                "
              >


                {/* STATUS SELECT */}

                <div className="w-full sm:max-w-xs">

                  <label
                    className="
                      mb-2
                      block
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >

                    Document Status

                  </label>


                  <div className="relative">

                    <ShieldCheck

                      size={17}

                      className="
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "

                    />


                    <select

                      value={statusFilter}

                      onChange={(e) =>
                        setStatusFilter(e.target.value)
                      }

                      className="
                        w-full
                        appearance-none
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        py-2.5
                        pl-10
                        pr-10
                        text-sm
                        font-medium
                        text-slate-700
                        outline-none
                        transition-all
                        duration-300
                        focus:border-blue-400
                        focus:ring-4
                        focus:ring-blue-50
                      "
                    >

                      <option value="All">
                        All Status
                      </option>

                      <option value="Active">
                        Active
                      </option>

                      <option value="Expiring Soon">
                        Expiring Soon
                      </option>

                      <option value="Expired">
                        Expired
                      </option>

                      <option value="Renewed">
                        Renewed
                      </option>

                    </select>


                    <ChevronDown

                      size={16}

                      className="
                        pointer-events-none
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "

                    />

                  </div>

                </div>



                {/* CLEAR FILTER */}

                <motion.button

                  whileHover={{
                    scale: 1.02,
                  }}

                  whileTap={{
                    scale: 0.97,
                  }}

                  onClick={() =>
                    setStatusFilter("All")
                  }

                  disabled={statusFilter === "All"}

                  className={`
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    transition-all
                    duration-300
                    ${
                      statusFilter === "All"
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                        : "border-blue-200 bg-white text-blue-600 hover:bg-blue-50"
                    }
                  `}
                >

                  <X size={16} />

                  Clear Filter

                </motion.button>


              </div>

            </motion.div>

          )}

        </AnimatePresence>



        {/* TABLE */}

        <div className="overflow-x-auto">


          <table
            className="
              w-full
              min-w-[950px]
              text-sm
            "
          >


            <thead
              className="
                border-b
                border-slate-100
                bg-slate-50
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-slate-500
              "
            >

              <tr>

                <th className="px-6 py-4 text-left">

                  Vehicle No.

                </th>


                <th className="text-left">

                  Document Type

                </th>


                <th className="text-left">

                  Document Number

                </th>


                <th className="text-left">

                  Start Date

                </th>


                <th className="text-left">

                  Expiry Date

                </th>


                <th className="text-left">

                  Status

                </th>


                <th className="px-6 text-center">

                  Action

                </th>

              </tr>

            </thead>



            <tbody>


              <AnimatePresence>


                {list.map((d, index) => {

                  const status =
                    getDocumentStatus(
                      d,
                      settings.reminderDays
                    );


                  return (

                    <motion.tr

                      key={d.id}

                      initial={{
                        opacity: 0,
                        y: 10,
                      }}

                      animate={{
                        opacity: 1,
                        y: 0,
                      }}

                      exit={{
                        opacity: 0,
                        x: -20,
                      }}

                      transition={{
                        delay: index * 0.03,
                        duration: 0.3,
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


                      {/* VEHICLE NUMBER */}

                      <td className="px-6 py-5">


                        <div
                          className="
                            flex
                            items-center
                            gap-3
                          "
                        >


                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">

                            <FileText size={19} />

                          </div>


                          <span
                            className="
                              font-semibold
                              text-base
                              text-blue-700
                            "
                          >

                            {d.vehicle}

                          </span>


                        </div>


                      </td>



                      <td>

                        <span
                          className="
                            font-medium
                            text-slate-700
                          "
                        >

                          {d.type}

                        </span>

                      </td>



                      <td className="text-slate-600">

                        {d.number}

                      </td>



                      <td className="text-slate-600">

                        {formatDate(
                          d.start || d.issueDate
                        )}

                      </td>


                      <td>

                        <span
                          className="
                            font-medium
                            text-slate-700
                          "
                        >

                          {formatDate(d.expiry)}

                        </span>

                      </td>



                      <td>

                        <StatusBadge
                          status={status}
                        />

                      </td>



                      {/* =================================================
                          ACTIONS
                      ================================================= */}

                      <td className="px-6 py-4">

                        <div
                          className="
                            relative
                            flex
                            justify-center
                          "
                          data-document-action-menu
                        >


                          {/* MORE VERTICAL BUTTON */}

                          <motion.button

                            whileHover={{
                              scale: 1.1,
                            }}

                            whileTap={{
                              scale: 0.9,
                            }}

                            onClick={() =>
                              setOpenActionMenu(
                                openActionMenu === d.id
                                  ? null
                                  : d.id
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

                            <MoreVertical size={18} />

                          </motion.button>



                          {/* ACTION MENU */}

                          <AnimatePresence>

                            {openActionMenu === d.id && (

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

                                className="
                                  absolute
                                  right-0
                                  top-11
                                  z-30
                                  w-36
                                  overflow-hidden
                                  rounded-xl
                                  border
                                  border-slate-200
                                  bg-white
                                  p-1.5
                                  shadow-xl
                                "
                              >


                                {/* VIEW BUTTON */}

                                <button

                                  onClick={() =>
                                    handleViewDocument(d)
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

                                  <Eye size={16} />

                                  <span>
                                    View
                                  </span>

                                </button>



                                {/* DELETE BUTTON */}

                                {canDeleteDocuments && (

                                  <button

                                    onClick={() =>
                                      handleDeleteDocument(d)
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
                                      text-red-500
                                      transition
                                      hover:bg-red-50
                                      hover:text-red-600
                                    "
                                  >

                                    <Trash2 size={16} />

                                    <span>
                                      Delete
                                    </span>

                                  </button>

                                )}


                              </motion.div>

                            )}

                          </AnimatePresence>


                        </div>

                      </td>


                    </motion.tr>

                  );

                })}


              </AnimatePresence>


            </tbody>

          </table>


          {/* ===================================================
              TABLE FOOTER
          =================================================== */}

          {list.length > 0 && (

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">


              <span>


                Showing{" "}


                <strong className="text-slate-700">

                  {list.length}

                </strong>


                {" "}documents


              </span>


              <button

                onClick={() =>
                  setQ("")
                }

                className="flex items-center gap-1 font-medium text-blue-600 transition hover:text-blue-800"


              >

                View More

                <ChevronDown size={16} />

              </button>

            </div>

          )}



          {/* EMPTY STATE */}

          {list.length === 0 && (

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


              <div
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

                <FileText size={34} />

              </div>


              <h3
                className="
                  mt-5
                  text-lg
                  font-bold
                  text-slate-700
                "
              >

                No Documents Found

              </h3>


              <p
                className="
                  mt-2
                  text-sm
                  text-slate-400
                "
              >

                {q || statusFilter !== "All"
                  ? "Try changing your search or filter."
                  : "Start by adding your first vehicle document."
                }

              </p>


              {!q &&
                statusFilter === "All" &&
                canAddDocuments && (

                <Link

                  to="/documents/add"

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
                    transition
                    hover:scale-[1.02]
                  "
                >

                  <Plus size={17} />

                  Add First Document

                </Link>

              )}


            </motion.div>

          )}


        </div>


      </motion.div>



      {/* =====================================================
          DOCUMENT DETAILS MODAL
      ===================================================== */}

      <AnimatePresence>

        {selectedDocument && (

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
              setSelectedDocument(null)
            }

            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-slate-900/50
              p-4
              backdrop-blur-sm
            "
          >


            <motion.div

              initial={{
                opacity: 0,
                scale: 0.9,
                y: 30,
              }}

              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}

              exit={{
                opacity: 0,
                scale: 0.9,
                y: 30,
              }}

              transition={{
                duration: 0.25,
              }}

              onClick={(e) =>
                e.stopPropagation()
              }

              className="
                w-full
                max-w-2xl
                overflow-hidden
                rounded-3xl
                bg-white
                shadow-2xl
              "
            >


              {/* MODAL HEADER */}

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

                <div
                  className="
                    absolute
                    -right-10
                    -top-10
                    h-40
                    w-40
                    rounded-full
                    bg-white/10
                  "
                />


                <div
                  className="
                    relative
                    flex
                    items-center
                    justify-between
                  "
                >


                  <div className="flex items-center gap-4">


                    <div
                      className="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        bg-white/20
                        backdrop-blur
                      "
                    >

                      <FileText size={28} />

                    </div>


                    <div>

                      <p className="text-sm text-blue-100">

                        Vehicle Document

                      </p>


                      <h2
                        className="
                          mt-1
                          text-xl
                          font-bold
                        "
                      >

                        Document Details

                      </h2>

                    </div>


                  </div>



                  <button

                    onClick={() =>
                      setSelectedDocument(null)
                    }

                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-white/10
                      transition
                      hover:bg-white/20
                    "

                  >

                    <X size={20} />

                  </button>


                </div>


              </div>



              {/* MODAL CONTENT */}

              <div className="p-6">


                <div
                  className="
                    mb-6
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    border
                    border-slate-100
                    bg-slate-50
                    p-4
                  "
                >


                  <div>

                    <p
                      className="
                        text-xs
                        font-medium
                        uppercase
                        tracking-wide
                        text-slate-400
                      "
                    >

                      Current Status

                    </p>


                    <p
                      className="
                        mt-1
                        font-semibold
                        text-slate-700
                      "
                    >

                      {selectedDocument.type}

                    </p>


                  </div>


                  <StatusBadge

                    status={
                      getDocumentStatus(
                        selectedDocument,
                        settings.reminderDays
                      )
                    }

                  />

                </div>



                {/* DETAILS GRID */}

                <div
                  className="
                    grid
                    gap-4
                    sm:grid-cols-2
                  "
                >


                  <DetailBox
                    icon={Car}
                    label="Vehicle Number"
                    value={selectedDocument.vehicle}
                  />


                  <DetailBox
                    icon={FileText}
                    label="Document Type"
                    value={selectedDocument.type}
                  />


                  <DetailBox
                    icon={Hash}
                    label="Document Number"
                    value={selectedDocument.number}
                  />


                  <DetailBox
                    icon={Calendar}
                    label="Start Date / Issue Date"
                    value={formatDate(
                      selectedDocument.start ||
                      selectedDocument.issueDate
                    )}
                  />


                  <DetailBox
                    icon={Calendar}
                    label="Expiry Date"
                    value={formatDate(
                      selectedDocument.expiry
                    )}
                  />


                  <DetailBox
                    icon={ShieldCheck}
                    label="Document Status"
                    value={
                      getDocumentStatus(
                        selectedDocument,
                        settings.reminderDays
                      )
                    }
                  />


                </div>



                {/* =================================================
                    UPLOADED DOCUMENT
                    Existing UI preserved.
                ================================================= */}

                <div className="mt-6 border-t border-slate-100 pt-5">

                  <div className="mb-3 flex items-center gap-2">

                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-50
                        text-blue-600
                      "
                    >

                      <FileUp size={18} />

                    </div>

                    <div>

                      <p className="text-sm font-semibold text-slate-700">

                        Uploaded Document

                      </p>

                      <p className="text-xs text-slate-400">

                        Open the uploaded PDF or image

                      </p>

                    </div>

                  </div>


                  {(selectedDocument.fileData ||
                    selectedDocument.fileUrl ||
                    selectedDocument.fileName) ? (

                    <button

                      type="button"

                      onClick={() =>
                        openDocumentFile(
                          selectedDocument
                        )
                      }

                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-2xl
                        border
                        border-slate-200
                        bg-slate-50
                        p-4
                        text-left
                        transition
                        duration-300
                        hover:border-blue-200
                        hover:bg-blue-50
                        hover:shadow-sm
                      "
                    >

                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-blue-100
                          text-blue-600
                        "
                      >

                        <FileText size={21} />

                      </div>


                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-semibold text-slate-700">

                          {selectedDocument.fileName ||
                            "Uploaded Document"}

                        </p>

                        <p className="mt-1 text-xs text-blue-600">

                          Click to open document

                        </p>

                      </div>


                      <Eye
                        size={18}
                        className="shrink-0 text-slate-400"
                      />

                    </button>

                  ) : (

                    <div
                      className="
                        rounded-2xl
                        border
                        border-dashed
                        border-slate-200
                        bg-slate-50
                        p-4
                        text-center
                      "
                    >

                      <p className="text-sm text-slate-400">

                        No uploaded document available.

                      </p>

                    </div>

                  )}

                </div>



                <div
                  className="
                    mt-6
                    flex
                    justify-end
                    border-t
                    border-slate-100
                    pt-5
                  "
                >


                  <button

                    onClick={() =>
                      setSelectedDocument(null)
                    }

                    className="
                      rounded-xl
                      bg-slate-100
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-slate-600
                      transition
                      hover:bg-slate-200
                    "

                  >

                    Close

                  </button>


                </div>


              </div>


            </motion.div>


          </motion.div>

        )}

      </AnimatePresence>



      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      <AnimatePresence>

        {deleteDocumentData && (

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
              z-[60]
              flex
              items-center
              justify-center
              bg-slate-900/50
              p-4
              backdrop-blur-sm
            "
          >


            <motion.div

              initial={{
                opacity: 0,
                scale: 0.85,
                y: 30,
              }}

              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}

              exit={{
                opacity: 0,
                scale: 0.85,
                y: 30,
              }}

              transition={{
                duration: 0.25,
              }}

              onClick={(e) =>
                e.stopPropagation()
              }

              className="
                w-full
                max-w-md
                overflow-hidden
                rounded-3xl
                bg-white
                p-7
                text-center
                shadow-2xl
              "
            >


              {/* DELETE ICON */}

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
                "
              >

                <Trash2 size={34} />

              </motion.div>



              {/* TITLE */}

              <h2
                className="
                  mt-5
                  text-xl
                  font-bold
                  text-slate-800
                "
              >

                Delete Document?

              </h2>



              {/* MESSAGE */}

              <p
                className="
                  mt-3
                  text-sm
                  leading-6
                  text-slate-500
                "
              >

                Are you sure you want to delete this document?

              </p>


              {/* DOCUMENT INFO */}

              <div
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-red-100
                  bg-red-50/50
                  p-4
                  text-left
                "
              >

                <p className="text-xs text-slate-400">

                  Vehicle Number

                </p>


                <p className="mt-1 font-semibold text-slate-700">

                  {deleteDocumentData.vehicle}

                </p>


                <p className="mt-3 text-xs text-slate-400">

                  Document Type

                </p>


                <p className="mt-1 font-semibold text-slate-700">

                  {deleteDocumentData.type}

                </p>


              </div>



              {/* WARNING */}

              <p
                className="
                  mt-4
                  text-xs
                  text-red-400
                "
              >

                This action cannot be undone.

              </p>



              {/* BUTTONS */}

              <div
                className="
                  mt-6
                  grid
                  grid-cols-2
                  gap-3
                "
              >


                {/* NO BUTTON */}

                <motion.button

                  whileHover={{
                    scale: 1.02,
                  }}

                  whileTap={{
                    scale: 0.97,
                  }}

                  onClick={cancelDelete}

                  className="
                    rounded-xl
                    bg-slate-100
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-slate-600
                    transition
                    hover:bg-slate-200
                  "
                >

                  No, Keep It

                </motion.button>



                {/* YES DELETE BUTTON */}

                <motion.button

                  whileHover={{
                    scale: 1.02,
                  }}

                  whileTap={{
                    scale: 0.97,
                  }}

                  onClick={confirmDelete}

                  className="
                    rounded-xl
                    bg-gradient-to-r
                    from-red-500
                    to-rose-600
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-red-200
                    transition
                    hover:shadow-xl
                  "
                >

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
   DETAIL BOX COMPONENT
========================================================= */

function DetailBox({
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
        rounded-2xl
        border
        border-slate-100
        bg-white
        p-4
        shadow-sm
        transition
        hover:border-blue-100
        hover:shadow-md
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

          <Icon size={18} />

        </div>


        <div className="min-w-0">


          <p
            className="
              text-xs
              text-slate-400
            "
          >

            {label}

          </p>


          <p
            className="
              mt-1
              truncate
              font-semibold
              text-slate-700
            "
          >

            {value || "Not Available"}

          </p>


        </div>


      </div>


    </motion.div>

  );

}



/* =========================================================
   STAT CARD COMPONENT
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
          ${color.replace("text-", "bg-")}
          transition-all
          duration-500
          group-hover:w-full
        `}

      />


    </motion.div>

  );

}