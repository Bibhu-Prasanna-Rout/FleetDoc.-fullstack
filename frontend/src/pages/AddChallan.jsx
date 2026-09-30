// import { useEffect, useRef, useState } from "react";
// import {
//   Save,
//   Upload,
//   Car,
//   FileText,
//   IndianRupee,
//   Calendar,
//   ChevronDown,
//   CheckCircle2,
//   ShieldCheck,
//   Sparkles,
//   FileCheck2,
//   ArrowRight,
//   ReceiptText,
//   CreditCard,
//   AlertTriangle,
//   AlertCircle,
//   X,
//   Search,
//   Truck,
// } from "lucide-react";

// import { motion, AnimatePresence } from "framer-motion";

// import { useNavigate } from "react-router-dom";
// import PageHeader from "../components/PageHeader";
// import { useFleet, formatDate } from "../context/fleetContext";

// /* =========================================================
//    PAGE ANIMATIONS
// ========================================================= */

// const pageVariants = {
//   hidden: {
//     opacity: 0,
//     y: 20,
//   },

//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.5,
//       ease: "easeOut",
//     },
//   },
// };

// const containerVariants = {
//   hidden: {},

//   visible: {
//     transition: {
//       staggerChildren: 0.07,
//     },
//   },
// };

// const itemVariants = {
//   hidden: {
//     opacity: 0,
//     y: 18,
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
//    FORM FIELD WRAPPER
// ========================================================= */

// function FormField({
//   children,
//   className = "",
// }) {
//   return (
//     <motion.div
//       variants={itemVariants}
//       whileHover={{ y: -2 }}
//       transition={{ duration: 0.2 }}
//       className={className}
//     >
//       {children}
//     </motion.div>
//   );
// }

// /* =========================================================
//    ADD CHALLAN
// ========================================================= */

// export default function AddChallan() {
//   const navigate = useNavigate();

//   const {
//     vehicles,
//     addChallan,
//   } = useFleet();

//   /* =======================================================
//      FORM STATE
//   ======================================================= */

//   const [form, setForm] = useState({
//     vehicle: "",
//     number: "",
//     type: "Speed Violation",
//     challanDate: "",
//     amount: "",
//     due: "",
//     status: "Pending",
//     paidAmount: "",
//     paidDate: "",
//     remarks: "",
//     fileName: "",
//     fileData: "",
//     fileType: "",
//     fileSize: "",
//   });

//   /* =======================================================
//      SEARCH DROPDOWN STATE
//   ======================================================= */

//   const [vehicleSearch, setVehicleSearch] = useState("");
//   const [showVehicleDropdown, setShowVehicleDropdown] =
//     useState(false);

//   const [challanTypeSearch, setChallanTypeSearch] =
//     useState("");
//   const [showChallanTypeDropdown, setShowChallanTypeDropdown] =
//     useState(false);

//   const [paymentStatusSearch, setPaymentStatusSearch] =
//     useState("");
//   const [showPaymentStatusDropdown, setShowPaymentStatusDropdown] =
//     useState(false);

//   /* =======================================================
//      DROPDOWN REFS
//   ======================================================= */

//   const vehicleDropdownRef = useRef(null);

//   const challanTypeDropdownRef = useRef(null);

//   const paymentStatusDropdownRef = useRef(null);

//   /* =======================================================
//      FILE STATE
//   ======================================================= */

//   const [fileError, setFileError] = useState("");

//   const [fileVerified, setFileVerified] =
//     useState(false);

//   /* =======================================================
//      ALERT STATE
//   ======================================================= */

//   const [alertData, setAlertData] = useState({
//     show: false,
//     type: "success",
//     title: "",
//     message: "",
//   });

//   /* =======================================================
//      CHALLAN TYPES
//   ======================================================= */

//   const challanTypes = [
//     "Speed Violation",
//     "No Parking",
//     "Signal Jump",
//     "Overloading",
//     "Other",
//   ];

//   /* =======================================================
//      PAYMENT STATUS OPTIONS
//   ======================================================= */

//   const paymentStatuses = [
//     "Pending",
//     "Paid",
//   ];

//   /* =======================================================
//      NORMALIZE VEHICLE SEARCH
//   ======================================================= */

//   const normalizeSearch = (value) => {
//     return String(value || "")
//       .replace(/\s+/g, "")
//       .trim()
//       .toLowerCase();
//   };

//   /* =======================================================
//      FILTER VEHICLES
//   ======================================================= */

//   const filteredVehicles = vehicles.filter(
//     (vehicle) => {
//       const searchValue =
//         normalizeSearch(vehicleSearch);

//       if (!searchValue) return true;

//       return normalizeSearch(
//         vehicle?.number
//       ).includes(searchValue);
//     }
//   );

//   /* =======================================================
//      FILTER CHALLAN TYPES
//   ======================================================= */

//   const filteredChallanTypes =
//     challanTypes.filter((type) => {
//       const searchValue = String(
//         challanTypeSearch || ""
//       )
//         .trim()
//         .toLowerCase();

//       if (!searchValue) return true;

//       return type
//         .toLowerCase()
//         .includes(searchValue);
//     });

//   /* =======================================================
//      FILTER PAYMENT STATUS
//   ======================================================= */

//   const filteredPaymentStatuses =
//     paymentStatuses.filter((status) => {
//       const searchValue = String(
//         paymentStatusSearch || ""
//       )
//         .trim()
//         .toLowerCase();

//       if (!searchValue) return true;

//       return status
//         .toLowerCase()
//         .includes(searchValue);
//     });

//   /* =======================================================
//      OUTSIDE CLICK HANDLER
//   ======================================================= */

//   useEffect(() => {
//     const handleOutsideClick = (event) => {
//       if (
//         vehicleDropdownRef.current &&
//         !vehicleDropdownRef.current.contains(
//           event.target
//         )
//       ) {
//         setShowVehicleDropdown(false);
//       }

//       if (
//         challanTypeDropdownRef.current &&
//         !challanTypeDropdownRef.current.contains(
//           event.target
//         )
//       ) {
//         setShowChallanTypeDropdown(false);
//       }

//       if (
//         paymentStatusDropdownRef.current &&
//         !paymentStatusDropdownRef.current.contains(
//           event.target
//         )
//       ) {
//         setShowPaymentStatusDropdown(false);
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

//   /* =======================================================
//      SHOW ALERT
//   ======================================================= */

//   const showAlert = (
//     type,
//     title,
//     message
//   ) => {
//     setAlertData({
//       show: true,
//       type,
//       title,
//       message,
//     });

//     setTimeout(() => {
//       setAlertData((prev) => ({
//         ...prev,
//         show: false,
//       }));
//     }, 4000);
//   };

//   /* =======================================================
//      HANDLE NORMAL INPUT CHANGE
//   ======================================================= */

//   const handleChange = (e) => {
//     const {
//       name,
//       value,
//     } = e.target;

//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   /* =======================================================
//      HANDLE STATUS CHANGE
//   ======================================================= */

//   const handleStatusChange = (e) => {
//     const value = e.target.value;

//     setForm((prev) => {
//       if (value === "Paid") {
//         return {
//           ...prev,
//           status: "Paid",
//           paidDate:
//             prev.paidDate ||
//             new Date()
//               .toISOString()
//               .split("T")[0],
//           paidAmount: prev.paidAmount,
//         };
//       }

//       return {
//         ...prev,
//         status: "Pending",
//         paidAmount: "",
//         paidDate: "",
//       };
//     });
//   };

//   /* =======================================================
//      VEHICLE SELECT
//   ======================================================= */

//   const handleVehicleSelect = (
//     vehicle
//   ) => {
//     const vehicleNumber =
//       vehicle?.number || "";

//     setForm((prev) => ({
//       ...prev,
//       vehicle: vehicleNumber,
//     }));

//     setVehicleSearch(
//       vehicleNumber
//     );

//     setShowVehicleDropdown(false);
//   };

//   /* =======================================================
//      CHALLAN TYPE SELECT
//   ======================================================= */

//   const handleChallanTypeSelect = (
//     type
//   ) => {
//     setForm((prev) => ({
//       ...prev,
//       type,
//     }));

//     setChallanTypeSearch(type);

//     setShowChallanTypeDropdown(false);
//   };

//   /* =======================================================
//      PAYMENT STATUS SELECT
//   ======================================================= */

//   const handlePaymentStatusSelect = (
//     status
//   ) => {
//     handleStatusChange({
//       target: {
//         value: status,
//       },
//     });

//     setPaymentStatusSearch(status);

//     setShowPaymentStatusDropdown(false);
//   };

//   /* =======================================================
//      FILE TO DATA URL
//   ======================================================= */

//   const fileToDataURL = (file) => {
//     return new Promise(
//       (resolve, reject) => {
//         const reader =
//           new FileReader();

//         reader.onload = () => {
//           resolve(reader.result);
//         };

//         reader.onerror = () => {
//           reject(
//             new Error(
//               "Unable to read the selected file."
//             )
//           );
//         };

//         reader.readAsDataURL(file);
//       }
//     );
//   };

//   /* =======================================================
//      HANDLE FILE CHANGE
//   ======================================================= */

//   const handleFileChange = async (
//     e
//   ) => {
//     const file =
//       e.target.files?.[0];

//     if (!file) return;

//     const allowedTypes = [
//       "application/pdf",
//       "image/jpeg",
//       "image/jpg",
//       "image/png",
//     ];

//     const maxFileSize =
//       10 * 1024 * 1024;

//     const isValidType =
//       allowedTypes.includes(
//         file.type
//       );

//     const isValidSize =
//       file.size <= maxFileSize;

//     if (
//       !isValidType ||
//       !isValidSize
//     ) {
//       setFileError(
//         "Only PDF, JPG, JPEG and PNG files up to 10MB are allowed."
//       );

//       setFileVerified(false);

//       setForm((prev) => ({
//         ...prev,
//         fileName: "",
//         fileData: "",
//         fileType: "",
//         fileSize: "",
//       }));

//       showAlert(
//         "error",
//         "Invalid Document",
//         "Please select a valid document. Only PDF, JPG, JPEG and PNG files up to 10MB are allowed."
//       );

//       e.target.value = "";

//       return;
//     }

//     try {
//       const fileData =
//         await fileToDataURL(file);

//       setFileError("");

//       setForm((prev) => ({
//         ...prev,
//         fileName: file.name,
//         fileData,
//         fileType: file.type,
//         fileSize: file.size,
//       }));

//       setFileVerified(false);

//       showAlert(
//         "info",
//         "Document Uploaded",
//         "Your challan document has been uploaded successfully."
//       );
//     } catch (error) {
//       console.error(
//         "File reading error:",
//         error
//       );

//       setFileError(
//         "Unable to read the selected file."
//       );

//       setFileVerified(false);

//       setForm((prev) => ({
//         ...prev,
//         fileName: "",
//         fileData: "",
//         fileType: "",
//         fileSize: "",
//       }));

//       showAlert(
//         "error",
//         "File Error",
//         "Unable to read the selected document. Please try again."
//       );

//       e.target.value = "";
//     }
//   };

//   /* =======================================================
//      REMOVE FILE
//   ======================================================= */

//   const removeFile = () => {
//     setFileError("");

//     setFileVerified(false);

//     setForm((prev) => ({
//       ...prev,
//       fileName: "",
//       fileData: "",
//       fileType: "",
//       fileSize: "",
//     }));
//   };

//   /* =======================================================
//      VERIFY DOCUMENT
//   ======================================================= */

//   const handleVerifyDocument = () => {
//     if (!form.fileName) {
//       showAlert(
//         "error",
//         "Document Required",
//         "Please upload a challan document before verification."
//       );

//       return;
//     }

//     if (fileError) {
//       showAlert(
//         "error",
//         "Invalid Document",
//         fileError
//       );

//       return;
//     }

//     if (!form.fileData) {
//       showAlert(
//         "error",
//         "File Storage Error",
//         "The document could not be prepared for storage. Please upload it again."
//       );

//       return;
//     }

//     setFileVerified(true);

//     showAlert(
//       "success",
//       "Document Verified",
//       "Your challan document has been verified successfully."
//     );
//   };

//   /* =======================================================
//      SUBMIT FORM
//   ======================================================= */

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     /* Vehicle validation */

//     if (!form.vehicle) {
//       showAlert(
//         "error",
//         "Vehicle Required",
//         "Please select a vehicle number."
//       );

//       return;
//     }

//     /* Challan number validation */

//     if (!form.number.trim()) {
//       showAlert(
//         "error",
//         "Challan Number Required",
//         "Please enter the challan number."
//       );

//       return;
//     }

//     /* Due date validation */

//     if (!form.due) {
//       showAlert(
//         "error",
//         "Due Date Required",
//         "Please select the challan due date."
//       );

//       return;
//     }

//     /* Challan date and due date validation */

//     if (
//       form.challanDate &&
//       form.due <
//         form.challanDate
//     ) {
//       showAlert(
//         "error",
//         "Invalid Date",
//         "Due date cannot be earlier than the challan date."
//       );

//       return;
//     }

//     /* Paid status validation */

//     if (form.status === "Paid") {
//       if (
//         form.paidAmount === ""
//       ) {
//         showAlert(
//           "error",
//           "Paid Amount Required",
//           "Please enter the paid amount."
//         );

//         return;
//       }

//       const paidAmount =
//         Number(form.paidAmount);

//       const fineAmount =
//         Number(form.amount || 0);

//       if (paidAmount < 0) {
//         showAlert(
//           "error",
//           "Invalid Paid Amount",
//           "Paid amount cannot be negative."
//         );

//         return;
//       }

//       if (
//         fineAmount > 0 &&
//         paidAmount > fineAmount
//       ) {
//         showAlert(
//           "error",
//           "Invalid Paid Amount",
//           "Paid amount cannot be greater than the fine amount."
//         );

//         return;
//       }

//       if (!form.paidDate) {
//         showAlert(
//           "error",
//           "Payment Date Required",
//           "Please select the payment date."
//         );

//         return;
//       }

//       if (
//         form.challanDate &&
//         form.paidDate <
//           form.challanDate
//       ) {
//         showAlert(
//           "error",
//           "Invalid Payment Date",
//           "Payment date cannot be earlier than the challan date."
//         );

//         return;
//       }
//     }

//     /* File validation */

//     if (
//       form.fileName &&
//       !form.fileData
//     ) {
//       showAlert(
//         "error",
//         "Document Error",
//         "The selected document could not be stored. Please upload it again."
//       );

//       return;
//     }

//     /* Create challan */

//     const challanData = {
//       id: Date.now(),

//       vehicle: form.vehicle,

//       number: form.number,

//       type: form.type,

//       challanDate:
//         form.challanDate,

//       amount: Number(
//         form.amount || 0
//       ),

//       due: formatDate(
//         form.due
//       ),

//       status: form.status,

//       paidAmount:
//         form.status === "Paid"
//           ? Number(
//               form.paidAmount || 0
//             )
//           : 0,

//       paidDate:
//         form.status === "Paid"
//           ? form.paidDate
//           : null,

//       remarks: form.remarks,

//       fileName:
//         form.fileName,

//       fileData:
//         form.fileData,

//       fileType:
//         form.fileType,

//       fileSize:
//         form.fileSize,

//       verified:
//         fileVerified,

//       paid:
//         form.status === "Paid",

//       createdAt:
//         new Date().toISOString(),
//     };

//     try {
//       addChallan(challanData);

//       showAlert(
//         "success",
//         "Challan Saved",
//         "Your challan has been saved successfully."
//       );

//       setTimeout(() => {
//         navigate("/challans");
//       }, 1200);
//     } catch (error) {
//       console.error(
//         "Add challan error:",
//         error
//       );

//       showAlert(
//         "error",
//         "Save Failed",
//         "Unable to save the challan. Please try again."
//       );
//     }
//   };

//   return (
//     <motion.div
//       variants={pageVariants}
//       initial="hidden"
//       animate="visible"
//       className="space-y-6"
//     >
//       {/* =====================================================
//           CUSTOM ALERT
//       ===================================================== */}

//       <AnimatePresence>
//         {alertData.show && (
//           <motion.div
//             initial={{
//               opacity: 0,
//               x: 100,
//               scale: 0.95,
//             }}
//             animate={{
//               opacity: 1,
//               x: 0,
//               scale: 1,
//             }}
//             exit={{
//               opacity: 0,
//               x: 100,
//               scale: 0.95,
//             }}
//             transition={{
//               duration: 0.3,
//               ease: "easeOut",
//             }}
//             className="fixed right-5 top-5 z-[200] w-[90%] max-w-md"
//           >
//             <div
//               className={`flex items-start gap-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition ${
//                 alertData.type ===
//                 "success"
//                   ? "border-emerald-200 bg-emerald-50"
//                   : alertData.type ===
//                       "error"
//                     ? "border-red-200 bg-red-50"
//                     : "border-blue-200 bg-blue-50"
//               }`}
//             >
//               <motion.div
//                 initial={{
//                   scale: 0.7,
//                   rotate: -10,
//                 }}
//                 animate={{
//                   scale: 1,
//                   rotate: 0,
//                 }}
//                 transition={{
//                   delay: 0.1,
//                 }}
//                 className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
//                   alertData.type ===
//                   "success"
//                     ? "bg-emerald-100 text-emerald-600"
//                     : alertData.type ===
//                         "error"
//                       ? "bg-red-100 text-red-600"
//                       : "bg-blue-100 text-blue-600"
//                 }`}
//               >
//                 {alertData.type ===
//                   "success" && (
//                   <CheckCircle2
//                     size={21}
//                   />
//                 )}

//                 {alertData.type ===
//                   "error" && (
//                   <AlertCircle
//                     size={21}
//                   />
//                 )}

//                 {alertData.type ===
//                   "info" && (
//                   <FileText
//                     size={21}
//                   />
//                 )}
//               </motion.div>

//               <div className="flex-1">
//                 <h3 className="font-semibold text-slate-800">
//                   {alertData.title}
//                 </h3>

//                 <p className="mt-1 text-sm leading-relaxed text-slate-500">
//                   {alertData.message}
//                 </p>
//               </div>

//               <motion.button
//                 type="button"
//                 whileHover={{
//                   scale: 1.1,
//                   rotate: 90,
//                 }}
//                 whileTap={{
//                   scale: 0.9,
//                 }}
//                 onClick={() =>
//                   setAlertData(
//                     (prev) => ({
//                       ...prev,
//                       show: false,
//                     })
//                   )
//                 }
//                 className="text-slate-400 transition hover:text-slate-700"
//               >
//                 <X size={18} />
//               </motion.button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* =====================================================
//           PAGE HEADER
//       ===================================================== */}

//       <motion.div
//         initial={{
//           opacity: 0,
//           y: -15,
//         }}
//         animate={{
//           opacity: 1,
//           y: 0,
//         }}
//         transition={{
//           duration: 0.5,
//         }}
//       >
//         <PageHeader
//           title={
//             <div className="flex items-center gap-3">
//               <motion.div
//                 whileHover={{
//                   rotate: 6,
//                   scale: 1.08,
//                 }}
//                 transition={{
//                   type: "spring",
//                   stiffness: 300,
//                   damping: 15,
//                 }}
//                 className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg shadow-blue-200"
//               >
//                 <ReceiptText
//                   size={23}
//                 />
//               </motion.div>

//               <div>
//                 <h1 className="text-2xl font-bold text-slate-800">
//                   Add New Challan
//                 </h1>
//               </div>
//             </div>
//           }
//           subtitle="Enter challan details, payment information and upload the challan document."
//         />
//       </motion.div>

//       {/* =====================================================
//           MAIN FORM
//           overflow-visible FIXES DROPDOWN CLIPPING
//       ===================================================== */}

//       <motion.form
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//         onSubmit={handleSubmit}
//         className="group relative overflow-visible rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow duration-500 hover:shadow-xl md:p-8"
//       >
//         {/* TOP GRADIENT LINE */}

//         <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />

//         {/* ===================================================
//             INTRO BANNER
//         =================================================== */}

//         <motion.div
//           variants={itemVariants}
//           className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-lg shadow-blue-100"
//         >
//           <motion.div
//             animate={{
//               x: [0, 15, 0],
//               y: [0, -10, 0],
//               scale: [1, 1.05, 1],
//             }}
//             transition={{
//               duration: 6,
//               repeat: Infinity,
//               ease: "easeInOut",
//             }}
//             className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
//           />

//           <motion.div
//             animate={{
//               x: [0, -12, 0],
//               scale: [1, 1.08, 1],
//             }}
//             transition={{
//               duration: 5,
//               repeat: Infinity,
//               ease: "easeInOut",
//             }}
//             className="absolute -bottom-16 right-20 h-40 w-40 rounded-full bg-blue-400/20"
//           />

//           <div className="relative flex items-center justify-between gap-4">
//             <div className="flex items-center gap-4">
//               <motion.div
//                 whileHover={{
//                   scale: 1.08,
//                   rotate: 5,
//                 }}
//                 className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-md"
//               >
//                 <Sparkles
//                   size={26}
//                 />
//               </motion.div>

//               <div>
//                 <h2 className="text-xl font-bold">
//                   Challan Information
//                 </h2>

//                 <p className="mt-1 text-sm text-blue-100">
//                   Complete the details below to securely store your vehicle challan.
//                 </p>
//               </div>
//             </div>

//             <motion.div
//               initial={{
//                 opacity: 0,
//                 scale: 0.8,
//               }}
//               animate={{
//                 opacity: 1,
//                 scale: 1,
//               }}
//               transition={{
//                 delay: 0.4,
//                 duration: 0.4,
//               }}
//               className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-md sm:flex"
//             >
//               <ShieldCheck
//                 size={15}
//               />
//               Secure Record
//             </motion.div>
//           </div>
//         </motion.div>

//         {/* ===================================================
//             FORM CONTENT
//         =================================================== */}

//         <div className="space-y-7">
//           <motion.div
//             variants={containerVariants}
//             className="grid gap-5 md:grid-cols-2"
//           >
//             {/* =================================================
//                 VEHICLE NUMBER
//             ================================================= */}

//             <FormField className="relative z-[60]">
//               <label className="label">
//                 Vehicle Number
//                 <span className="ml-1 text-red-500">
//                   *
//                 </span>
//               </label>

//               <div
//                 ref={vehicleDropdownRef}
//                 className="group/input relative"
//               >
//                 <Car
//                   size={18}
//                   className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-blue-500 transition-transform duration-300 group-hover/input:scale-110"
//                 />

//                 <input
//                   required
//                   type="text"
//                   value={
//                     showVehicleDropdown
//                       ? vehicleSearch
//                       : form.vehicle
//                   }
//                   onFocus={() => {
//                     setShowVehicleDropdown(
//                       true
//                     );

//                     setVehicleSearch(
//                       form.vehicle
//                     );
//                   }}
//                   onChange={(e) => {
//                     setVehicleSearch(
//                       e.target.value
//                     );

//                     setShowVehicleDropdown(
//                       true
//                     );

//                     setForm((prev) => ({
//                       ...prev,
//                       vehicle: "",
//                     }));
//                   }}
//                   onClick={() => {
//                     setShowVehicleDropdown(
//                       true
//                     );

//                     setVehicleSearch(
//                       form.vehicle
//                     );
//                   }}
//                   placeholder="Select Vehicle Number"
//                   className="input border-slate-200 bg-slate-50 pl-10 pr-10 transition-all duration-300 hover:border-blue-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
//                 />

//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowVehicleDropdown(
//                       (prev) => !prev
//                     );

//                     if (
//                       !showVehicleDropdown
//                     ) {
//                       setVehicleSearch(
//                         form.vehicle
//                       );
//                     }
//                   }}
//                   className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition hover:text-blue-500"
//                 >
//                   <ChevronDown
//                     size={18}
//                     className={`transition-transform duration-300 ${
//                       showVehicleDropdown
//                         ? "rotate-180"
//                         : ""
//                     }`}
//                   />
//                 </button>

//                 {/* VEHICLE DROPDOWN */}

//                 <AnimatePresence>
//                   {showVehicleDropdown && (
//                     <motion.div
//                       initial={{
//                         opacity: 0,
//                         y: -6,
//                         scale: 0.98,
//                       }}
//                       animate={{
//                         opacity: 1,
//                         y: 0,
//                         scale: 1,
//                       }}
//                       exit={{
//                         opacity: 0,
//                         y: -6,
//                         scale: 0.98,
//                       }}
//                       transition={{
//                         duration: 0.18,
//                       }}
//                       className="absolute left-0 right-0 top-full z-[100] mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
//                     >
//                       {filteredVehicles.length >
//                       0 ? (
//                         filteredVehicles.map(
//                           (vehicle) => {
//                             const isSelected =
//                               form.vehicle ===
//                               vehicle.number;

//                             return (
//                               <button
//                                 key={
//                                   vehicle.id
//                                 }
//                                 type="button"
//                                 onClick={() =>
//                                   handleVehicleSelect(
//                                     vehicle
//                                   )
//                                 }
//                                 className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 ${
//                                   isSelected
//                                     ? "bg-blue-50 text-blue-600"
//                                     : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
//                                 }`}
//                               >
//                                 <div
//                                   className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
//                                     isSelected
//                                       ? "bg-blue-100 text-blue-600"
//                                       : "bg-slate-100 text-slate-500"
//                                   }`}
//                                 >
//                                   <Truck
//                                     size={16}
//                                   />
//                                 </div>

//                                 <span className="font-medium">
//                                   {
//                                     vehicle.number
//                                   }
//                                 </span>

//                                 {isSelected && (
//                                   <CheckCircle2
//                                     size={16}
//                                     className="ml-auto text-blue-500"
//                                   />
//                                 )}
//                               </button>
//                             );
//                           }
//                         )
//                       ) : (
//                         <div className="px-3 py-4 text-center text-sm text-slate-400">
//                           No vehicle found
//                         </div>
//                       )}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </FormField>

//             {/* =================================================
//                 CHALLAN NUMBER
//             ================================================= */}

//             <FormField className="relative z-[10]">
//               <label className="label">
//                 Challan Number
//                 <span className="ml-1 text-red-500">
//                   *
//                 </span>
//               </label>

//               <div className="group/input relative">
//                 <FileText
//                   size={18}
//                   className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 transition-transform duration-300 group-hover/input:scale-110"
//                 />

//                 <input
//                   required
//                   type="text"
//                   name="number"
//                   value={form.number}
//                   onChange={handleChange}
//                   placeholder="Enter challan number"
//                   className="input border-slate-200 bg-slate-50 pl-10 transition-all duration-300 hover:border-indigo-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
//                 />
//               </div>
//             </FormField>

//             {/* =================================================
//                 CHALLAN TYPE
//             ================================================= */}

//             <FormField className="relative z-[55]">
//               <label className="label">
//                 Challan Type
//               </label>

//               <div
//                 ref={challanTypeDropdownRef}
//                 className="group/input relative"
//               >
//                 <ReceiptText
//                   size={18}
//                   className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-purple-500 transition-transform duration-300 group-hover/input:scale-110"
//                 />

//                 <input
//                   type="text"
//                   value={
//                     showChallanTypeDropdown
//                       ? challanTypeSearch
//                       : form.type
//                   }
//                   onFocus={() => {
//                     setShowChallanTypeDropdown(
//                       true
//                     );

//                     setChallanTypeSearch(
//                       form.type
//                     );
//                   }}
//                   onClick={() => {
//                     setShowChallanTypeDropdown(
//                       true
//                     );

//                     setChallanTypeSearch(
//                       form.type
//                     );
//                   }}
//                   onChange={(e) => {
//                     setChallanTypeSearch(
//                       e.target.value
//                     );

//                     setShowChallanTypeDropdown(
//                       true
//                     );
//                   }}
//                   placeholder="Select Challan Type"
//                   className="input border-slate-200 bg-slate-50 pl-10 pr-10 transition-all duration-300 hover:border-purple-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
//                 />

//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowChallanTypeDropdown(
//                       (prev) => !prev
//                     );

//                     if (
//                       !showChallanTypeDropdown
//                     ) {
//                       setChallanTypeSearch(
//                         form.type
//                       );
//                     }
//                   }}
//                   className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition hover:text-purple-500"
//                 >
//                   <ChevronDown
//                     size={18}
//                     className={`transition-transform duration-300 ${
//                       showChallanTypeDropdown
//                         ? "rotate-180"
//                         : ""
//                     }`}
//                   />
//                 </button>

//                 {/* CHALLAN TYPE DROPDOWN */}

//                 <AnimatePresence>
//                   {showChallanTypeDropdown && (
//                     <motion.div
//                       initial={{
//                         opacity: 0,
//                         y: -6,
//                         scale: 0.98,
//                       }}
//                       animate={{
//                         opacity: 1,
//                         y: 0,
//                         scale: 1,
//                       }}
//                       exit={{
//                         opacity: 0,
//                         y: -6,
//                         scale: 0.98,
//                       }}
//                       transition={{
//                         duration: 0.18,
//                       }}
//                       className="absolute left-0 right-0 top-full z-[100] mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
//                     >
//                       {filteredChallanTypes.length >
//                       0 ? (
//                         filteredChallanTypes.map(
//                           (type) => {
//                             const isSelected =
//                               form.type ===
//                               type;

//                             return (
//                               <button
//                                 key={type}
//                                 type="button"
//                                 onClick={() =>
//                                   handleChallanTypeSelect(
//                                     type
//                                   )
//                                 }
//                                 className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 ${
//                                   isSelected
//                                     ? "bg-purple-50 text-purple-600"
//                                     : "text-slate-600 hover:bg-purple-50 hover:text-purple-600"
//                                 }`}
//                               >
//                                 <div
//                                   className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
//                                     isSelected
//                                       ? "bg-purple-100 text-purple-600"
//                                       : "bg-slate-100 text-slate-500"
//                                   }`}
//                                 >
//                                   <ReceiptText
//                                     size={16}
//                                   />
//                                 </div>

//                                 <span className="font-medium">
//                                   {type}
//                                 </span>

//                                 {isSelected && (
//                                   <CheckCircle2
//                                     size={16}
//                                     className="ml-auto text-purple-500"
//                                   />
//                                 )}
//                               </button>
//                             );
//                           }
//                         )
//                       ) : (
//                         <div className="px-3 py-4 text-center text-sm text-slate-400">
//                           No challan type found
//                         </div>
//                       )}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </FormField>

//             {/* =================================================
//                 CHALLAN DATE
//             ================================================= */}

//             <FormField className="relative z-[10]">
//               <label className="label">
//                 Challan Date
//               </label>

//               <div className="group/input relative">
//                 <Calendar
//                   size={18}
//                   className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 transition-transform duration-300 group-hover/input:scale-110"
//                 />

//                 <input
//                   type="date"
//                   name="challanDate"
//                   value={
//                     form.challanDate
//                   }
//                   onChange={handleChange}
//                   className="input border-slate-200 bg-slate-50 pl-10 transition-all duration-300 hover:border-blue-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
//                 />
//               </div>
//             </FormField>

//             {/* =================================================
//                 FINE AMOUNT
//             ================================================= */}

//             <FormField className="relative z-[10]">
//               <label className="label">
//                 Fine Amount
//               </label>

//               <div className="group/input relative">
//                 <IndianRupee
//                   size={18}
//                   className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 transition-transform duration-300 group-hover/input:scale-110"
//                 />

//                 <input
//                   type="number"
//                   name="amount"
//                   value={form.amount}
//                   onChange={handleChange}
//                   placeholder="Enter fine amount"
//                   min="0"
//                   className="input border-slate-200 bg-slate-50 pl-10 transition-all duration-300 hover:border-emerald-300 hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
//                 />
//               </div>
//             </FormField>

//             {/* =================================================
//                 DUE DATE
//             ================================================= */}

//             <FormField className="relative z-[10]">
//               <label className="label">
//                 Due Date
//                 <span className="ml-1 text-red-500">
//                   *
//                 </span>
//               </label>

//               <div className="group/input relative">
//                 <Calendar
//                   size={18}
//                   className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-red-500 transition-transform duration-300 group-hover/input:scale-110"
//                 />

//                 <input
//                   required
//                   type="date"
//                   name="due"
//                   value={form.due}
//                   onChange={handleChange}
//                   className="input border-slate-200 bg-slate-50 pl-10 transition-all duration-300 hover:border-red-300 hover:bg-white focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100"
//                 />
//               </div>
//             </FormField>

//             {/* =================================================
//                 PAYMENT STATUS
//             ================================================= */}

//             <FormField className="relative z-[50]">
//               <label className="label">
//                 Payment Status
//               </label>

//               <div
//                 ref={
//                   paymentStatusDropdownRef
//                 }
//                 className="group/input relative"
//               >
//                 <CreditCard
//                   size={18}
//                   className={`pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 transition-colors ${
//                     form.status ===
//                     "Paid"
//                       ? "text-emerald-500"
//                       : "text-slate-400"
//                   }`}
//                 />

//                 <input
//                   type="text"
//                   value={
//                     showPaymentStatusDropdown
//                       ? paymentStatusSearch
//                       : form.status
//                   }
//                   onFocus={() => {
//                     setShowPaymentStatusDropdown(
//                       true
//                     );

//                     setPaymentStatusSearch(
//                       form.status
//                     );
//                   }}
//                   onClick={() => {
//                     setShowPaymentStatusDropdown(
//                       true
//                     );

//                     setPaymentStatusSearch(
//                       form.status
//                     );
//                   }}
//                   onChange={(e) => {
//                     setPaymentStatusSearch(
//                       e.target.value
//                     );

//                     setShowPaymentStatusDropdown(
//                       true
//                     );
//                   }}
//                   placeholder="Select Payment Status"
//                   className={`input border-slate-200 bg-slate-50 pl-10 pr-10 transition-all duration-300 hover:border-blue-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 ${
//                     form.status ===
//                     "Paid"
//                       ? "border-emerald-200 bg-emerald-50/30"
//                       : ""
//                   }`}
//                 />

//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowPaymentStatusDropdown(
//                       (prev) => !prev
//                     );

//                     if (
//                       !showPaymentStatusDropdown
//                     ) {
//                       setPaymentStatusSearch(
//                         form.status
//                       );
//                     }
//                   }}
//                   className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition hover:text-blue-500"
//                 >
//                   <ChevronDown
//                     size={18}
//                     className={`transition-transform duration-300 ${
//                       showPaymentStatusDropdown
//                         ? "rotate-180"
//                         : ""
//                     }`}
//                   />
//                 </button>

//                 {/* PAYMENT STATUS DROPDOWN */}

//                 <AnimatePresence>
//                   {showPaymentStatusDropdown && (
//                     <motion.div
//                       initial={{
//                         opacity: 0,
//                         y: -6,
//                         scale: 0.98,
//                       }}
//                       animate={{
//                         opacity: 1,
//                         y: 0,
//                         scale: 1,
//                       }}
//                       exit={{
//                         opacity: 0,
//                         y: -6,
//                         scale: 0.98,
//                       }}
//                       transition={{
//                         duration: 0.18,
//                       }}
//                       className="absolute left-0 right-0 top-full z-[100] mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
//                     >
//                       {filteredPaymentStatuses.length >
//                       0 ? (
//                         filteredPaymentStatuses.map(
//                           (status) => {
//                             const isSelected =
//                               form.status ===
//                               status;

//                             return (
//                               <button
//                                 key={status}
//                                 type="button"
//                                 onClick={() =>
//                                   handlePaymentStatusSelect(
//                                     status
//                                   )
//                                 }
//                                 className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 ${
//                                   isSelected
//                                     ? status ===
//                                       "Paid"
//                                       ? "bg-emerald-50 text-emerald-600"
//                                       : "bg-blue-50 text-blue-600"
//                                     : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
//                                 }`}
//                               >
//                                 <div
//                                   className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
//                                     isSelected
//                                       ? status ===
//                                         "Paid"
//                                         ? "bg-emerald-100 text-emerald-600"
//                                         : "bg-blue-100 text-blue-600"
//                                       : "bg-slate-100 text-slate-500"
//                                   }`}
//                                 >
//                                   <CreditCard
//                                     size={16}
//                                   />
//                                 </div>

//                                 <span className="font-medium">
//                                   {status}
//                                 </span>

//                                 {isSelected && (
//                                   <CheckCircle2
//                                     size={16}
//                                     className={`ml-auto ${
//                                       status ===
//                                       "Paid"
//                                         ? "text-emerald-500"
//                                         : "text-blue-500"
//                                     }`}
//                                   />
//                                 )}
//                               </button>
//                             );
//                           }
//                         )
//                       ) : (
//                         <div className="px-3 py-4 text-center text-sm text-slate-400">
//                           No payment status found
//                         </div>
//                       )}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </FormField>

//             {/* =================================================
//                 PAID AMOUNT
//             ================================================= */}

//             <AnimatePresence
//               initial={false}
//             >
//               {form.status ===
//                 "Paid" && (
//                 <motion.div
//                   initial={{
//                     opacity: 0,
//                     height: 0,
//                     y: -10,
//                   }}
//                   animate={{
//                     opacity: 1,
//                     height: "auto",
//                     y: 0,
//                   }}
//                   exit={{
//                     opacity: 0,
//                     height: 0,
//                     y: -10,
//                   }}
//                   transition={{
//                     duration: 0.3,
//                   }}
//                   className="relative z-[10]"
//                 >
//                   <label className="label">
//                     Paid Amount
//                   </label>

//                   <div className="group/input relative">
//                     <IndianRupee
//                       size={18}
//                       className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 transition-transform duration-300 group-hover/input:scale-110"
//                     />

//                     <input
//                       type="number"
//                       name="paidAmount"
//                       value={
//                         form.paidAmount
//                       }
//                       onChange={
//                         handleChange
//                       }
//                       min="0"
//                       placeholder="Enter paid amount"
//                       className="input border-emerald-200 bg-emerald-50/30 pl-10 transition-all duration-300 hover:border-emerald-300 hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
//                     />
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* =================================================
//                 PAID DATE
//             ================================================= */}

//             <AnimatePresence
//               initial={false}
//             >
//               {form.status ===
//                 "Paid" && (
//                 <motion.div
//                   initial={{
//                     opacity: 0,
//                     height: 0,
//                     y: -10,
//                   }}
//                   animate={{
//                     opacity: 1,
//                     height: "auto",
//                     y: 0,
//                   }}
//                   exit={{
//                     opacity: 0,
//                     height: 0,
//                     y: -10,
//                   }}
//                   transition={{
//                     duration: 0.3,
//                   }}
//                   className="relative z-[10]"
//                 >
//                   <label className="label">
//                     Paid Date
//                   </label>

//                   <div className="group/input relative">
//                     <Calendar
//                       size={18}
//                       className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 transition-transform duration-300 group-hover/input:scale-110"
//                     />

//                     <input
//                       type="date"
//                       name="paidDate"
//                       value={
//                         form.paidDate
//                       }
//                       onChange={
//                         handleChange
//                       }
//                       className="input border-emerald-200 bg-emerald-50/30 pl-10 transition-all duration-300 hover:border-emerald-300 hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
//                     />
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* =================================================
//                 UPLOAD CHALLAN DOCUMENT
//             ================================================= */}

//             <FormField className="relative z-[10] md:col-span-2">
//               <div className="mb-3 flex items-center justify-between">
//                 <label className="label mb-0">
//                   Upload Challan Document
//                 </label>

//                 <AnimatePresence>
//                   {fileVerified && (
//                     <motion.div
//                       initial={{
//                         opacity: 0,
//                         scale: 0.8,
//                         x: 10,
//                       }}
//                       animate={{
//                         opacity: 1,
//                         scale: 1,
//                         x: 0,
//                       }}
//                       exit={{
//                         opacity: 0,
//                         scale: 0.8,
//                         x: 10,
//                       }}
//                       className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600"
//                     >
//                       <ShieldCheck
//                         size={14}
//                       />
//                       Verified
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>

//               <motion.label
//                 whileHover={{
//                   y: -3,
//                   scale: 1.005,
//                 }}
//                 whileTap={{
//                   scale: 0.995,
//                 }}
//                 transition={{
//                   duration: 0.2,
//                 }}
//                 className={`group/upload flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
//                   form.fileName
//                     ? fileVerified
//                       ? "border-emerald-300 bg-emerald-50/50 hover:border-emerald-400 hover:bg-emerald-50"
//                       : "border-blue-300 bg-blue-50/40 hover:border-blue-400 hover:bg-blue-50"
//                     : "border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50"
//                 }`}
//               >
//                 <motion.div
//                   whileHover={{
//                     scale: 1.12,
//                     rotate: 4,
//                   }}
//                   transition={{
//                     type: "spring",
//                     stiffness: 300,
//                     damping: 15,
//                   }}
//                   className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md transition-all duration-300 ${
//                     fileVerified
//                       ? "text-emerald-600 shadow-emerald-100"
//                       : "text-blue-600 shadow-blue-100"
//                   }`}
//                 >
//                   {fileVerified ? (
//                     <CheckCircle2
//                       size={30}
//                     />
//                   ) : (
//                     <Upload
//                       size={30}
//                     />
//                   )}
//                 </motion.div>

//                 <span className="text-base font-semibold text-slate-700 transition-colors group-hover/upload:text-blue-700">
//                   {form.fileName ||
//                     "Choose file or drag and drop"}
//                 </span>

//                 <span className="mt-2 text-xs text-slate-400">
//                   Supported: PDF, JPG, JPEG, PNG • Maximum size 10MB
//                 </span>

//                 <input
//                   type="file"
//                   accept=".pdf,.jpg,.jpeg,.png"
//                   onChange={
//                     handleFileChange
//                   }
//                   className="hidden"
//                 />
//               </motion.label>

//               {fileError && (
//                 <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
//                   <AlertTriangle
//                     size={14}
//                   />
//                   {fileError}
//                 </p>
//               )}

//               <AnimatePresence>
//                 {form.fileName && (
//                   <motion.div
//                     initial={{
//                       opacity: 0,
//                       height: 0,
//                       y: -10,
//                     }}
//                     animate={{
//                       opacity: 1,
//                       height: "auto",
//                       y: 0,
//                     }}
//                     exit={{
//                       opacity: 0,
//                       height: 0,
//                       y: -10,
//                     }}
//                     transition={{
//                       duration: 0.3,
//                     }}
//                     className="overflow-hidden"
//                   >
//                     <motion.div
//                       whileHover={{
//                         y: -2,
//                       }}
//                       className="mt-4 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:border-blue-200 hover:bg-white hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
//                     >
//                       <div className="flex items-center gap-3">
//                         <motion.div
//                           whileHover={{
//                             scale: 1.08,
//                             rotate: 3,
//                           }}
//                           className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600"
//                         >
//                           <FileText
//                             size={21}
//                           />
//                         </motion.div>

//                         <div>
//                           <p className="max-w-[220px] truncate text-sm font-semibold text-slate-700">
//                             {form.fileName}
//                           </p>

//                           <p className="text-xs text-slate-400">
//                             Ready for verification
//                           </p>
//                         </div>
//                       </div>

//                       <motion.button
//                         type="button"
//                         whileHover={{
//                           scale: 1.08,
//                           rotate: 90,
//                         }}
//                         whileTap={{
//                           scale: 0.9,
//                         }}
//                         onClick={
//                           removeFile
//                         }
//                         className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
//                         title="Remove Document"
//                       >
//                         <X size={18} />
//                       </motion.button>
//                     </motion.div>

//                     {/* VERIFY BUTTON */}

//                     <motion.button
//                       type="button"
//                       whileHover={{
//                         y: -2,
//                         scale: 1.01,
//                       }}
//                       whileTap={{
//                         scale: 0.98,
//                       }}
//                       onClick={
//                         handleVerifyDocument
//                       }
//                       disabled={
//                         fileVerified
//                       }
//                       className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
//                         fileVerified
//                           ? "cursor-default bg-emerald-100 text-emerald-700"
//                           : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 hover:shadow-xl"
//                       }`}
//                     >
//                       {fileVerified ? (
//                         <>
//                           <CheckCircle2
//                             size={19}
//                           />
//                           Document Verified Successfully
//                         </>
//                       ) : (
//                         <>
//                           <ShieldCheck
//                             size={19}
//                           />
//                           Verify Document
//                           <ArrowRight
//                             size={16}
//                           />
//                         </>
//                       )}
//                     </motion.button>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </FormField>

//             {/* =================================================
//                 REMARKS
//             ================================================= */}

//             <FormField className="relative z-[10] md:col-span-2">
//               <label className="label">
//                 Remarks
//               </label>

//               <textarea
//                 name="remarks"
//                 value={form.remarks}
//                 onChange={
//                   handleChange
//                 }
//                 className="input min-h-32 resize-none border-slate-200 bg-slate-50 transition-all duration-300 hover:border-blue-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
//                 placeholder="Enter additional remarks or important information..."
//               />
//             </FormField>
//           </motion.div>
//         </div>

//         {/* ===================================================
//             PAYMENT STATUS INFORMATION
//         =================================================== */}

//         <AnimatePresence>
//           {form.status ===
//             "Paid" && (
//             <motion.div
//               initial={{
//                 opacity: 0,
//                 height: 0,
//                 y: -10,
//               }}
//               animate={{
//                 opacity: 1,
//                 height: "auto",
//                 y: 0,
//               }}
//               exit={{
//                 opacity: 0,
//                 height: 0,
//                 y: -10,
//               }}
//               transition={{
//                 duration: 0.3,
//               }}
//               className="relative z-[10] mt-6 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5"
//             >
//               <div className="flex items-start gap-3">
//                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
//                   <CheckCircle2
//                     size={20}
//                   />
//                 </div>

//                 <div>
//                   <h3 className="font-semibold text-emerald-800">
//                     Payment Completed
//                   </h3>

//                   <p className="mt-1 text-sm text-emerald-700">
//                     This challan will be recorded as paid.
//                   </p>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* ===================================================
//             FORM FOOTER
//         =================================================== */}

//         <motion.div
//           variants={itemVariants}
//           className="relative z-[10] mt-8 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between"
//         >
//           <motion.div
//             layout
//             className="flex items-center gap-2 text-sm"
//           >
//             <AnimatePresence mode="wait">
//               {fileVerified ? (
//                 <motion.div
//                   key="verified-status"
//                   initial={{
//                     opacity: 0,
//                     x: -10,
//                   }}
//                   animate={{
//                     opacity: 1,
//                     x: 0,
//                   }}
//                   exit={{
//                     opacity: 0,
//                     x: 10,
//                   }}
//                   className="flex items-center gap-2"
//                 >
//                   <CheckCircle2
//                     size={18}
//                     className="text-emerald-500"
//                   />

//                   <span className="font-medium text-emerald-600">
//                     Challan document verified and ready
//                   </span>
//                 </motion.div>
//               ) : (
//                 <motion.div
//                   key="unverified-status"
//                   initial={{
//                     opacity: 0,
//                     x: -10,
//                   }}
//                   animate={{
//                     opacity: 1,
//                     x: 0,
//                   }}
//                   exit={{
//                     opacity: 0,
//                     x: 10,
//                   }}
//                   className="flex items-center gap-2"
//                 >
//                   <AlertCircle
//                     size={18}
//                     className="text-amber-500"
//                   />

//                   <span className="text-slate-500">
//                     Upload and verify document before saving
//                   </span>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </motion.div>

//           {/* BUTTONS */}

//           <div className="flex flex-col gap-3 sm:flex-row">
//             {/* CANCEL */}

//             <motion.button
//               type="button"
//               whileHover={{
//                 y: -2,
//                 scale: 1.01,
//               }}
//               whileTap={{
//                 scale: 0.98,
//               }}
//               onClick={() =>
//                 navigate("/challans")
//               }
//               className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition-all duration-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-sm"
//             >
//               Cancel
//             </motion.button>

//             {/* SAVE */}

//             <motion.button
//               type="submit"
//               whileHover={{
//                 y: -2,
//                 scale: 1.01,
//               }}
//               whileTap={{
//                 scale: 0.98,
//               }}
//               className="group/save relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all duration-300 hover:shadow-xl"
//             >
//               <motion.span
//                 initial={{
//                   x: "-120%",
//                 }}
//                 animate={{
//                   x: "120%",
//                 }}
//                 transition={{
//                   duration: 2,
//                   repeat: Infinity,
//                   repeatDelay: 3,
//                   ease: "easeInOut",
//                 }}
//                 className="absolute inset-y-0 w-12 -skew-x-12 bg-white/20"
//               />

//               <Save
//                 size={18}
//                 className="relative z-10 transition-transform duration-300 group-hover/save:rotate-[-8deg] group-hover/save:scale-110"
//               />

//               <span className="relative z-10">
//                 Save Challan
//               </span>
//             </motion.button>
//           </div>
//         </motion.div>
//       </motion.form>
//     </motion.div>
//   );
// }





import { useEffect, useRef, useState } from "react";
import {
  Save,
  Upload,
  Car,
  FileText,
  IndianRupee,
  Calendar,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  FileCheck2,
  ArrowRight,
  ReceiptText,
  CreditCard,
  AlertTriangle,
  AlertCircle,
  X,
  Search,
  Truck,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useFleet, formatDate } from "../context/fleetContext";

/* =========================================================
   PAGE ANIMATIONS
========================================================= */

const pageVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const containerVariants = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 18,
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
   FORM FIELD WRAPPER
========================================================= */

function FormField({
  children,
  className = "",
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* =========================================================
   ADD CHALLAN
========================================================= */

export default function AddChallan() {
  const navigate = useNavigate();

  const {
    vehicles,
    addChallan,
  } = useFleet();

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [form, setForm] = useState({
    vehicle: "",
    number: "",
    type: "Speed Violation",
    challanDate: "",
    amount: "",
    due: "",
    status: "Pending",
    paidAmount: "",
    paidDate: "",
    remarks: "",
    fileName: "",
    fileData: "",
    fileType: "",
    fileSize: "",
  });

  /* =======================================================
     SEARCH DROPDOWN STATE
  ======================================================= */

  const [vehicleSearch, setVehicleSearch] = useState("");
  const [showVehicleDropdown, setShowVehicleDropdown] =
    useState(false);

  const [challanTypeSearch, setChallanTypeSearch] =
    useState("");
  const [showChallanTypeDropdown, setShowChallanTypeDropdown] =
    useState(false);

  const [paymentStatusSearch, setPaymentStatusSearch] =
    useState("");
  const [showPaymentStatusDropdown, setShowPaymentStatusDropdown] =
    useState(false);

  /* =======================================================
     DROPDOWN REFS
  ======================================================= */

  const vehicleDropdownRef = useRef(null);

  const challanTypeDropdownRef = useRef(null);

  const paymentStatusDropdownRef = useRef(null);

  /* =======================================================
     FILE STATE
  ======================================================= */

  const [fileError, setFileError] = useState("");

  const [fileVerified, setFileVerified] =
    useState(false);

  /* =======================================================
     ALERT STATE
  ======================================================= */

  const [alertData, setAlertData] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  /* =======================================================
     CHALLAN TYPES
  ======================================================= */

  const challanTypes = [
    "Speed Violation",
    "No Parking",
    "Signal Jump",
    "Overloading",
    "Other",
  ];

  /* =======================================================
     PAYMENT STATUS OPTIONS
  ======================================================= */

  const paymentStatuses = [
    "Pending",
    "Paid",
  ];

  /* =======================================================
     NORMALIZE VEHICLE SEARCH
  ======================================================= */

  const normalizeSearch = (value) => {
    return String(value || "")
      .replace(/\s+/g, "")
      .trim()
      .toLowerCase();
  };

  /* =======================================================
     FILTER VEHICLES
  ======================================================= */

  const filteredVehicles = vehicles.filter(
    (vehicle) => {
      const searchValue =
        normalizeSearch(vehicleSearch);

      if (!searchValue) return true;

      return normalizeSearch(
        vehicle?.number
      ).includes(searchValue);
    }
  );

  /* =======================================================
     FILTER CHALLAN TYPES
  ======================================================= */

  const filteredChallanTypes =
    challanTypes.filter((type) => {
      const searchValue = String(
        challanTypeSearch || ""
      )
        .trim()
        .toLowerCase();

      if (!searchValue) return true;

      return type
        .toLowerCase()
        .includes(searchValue);
    });

  /* =======================================================
     FILTER PAYMENT STATUS
  ======================================================= */

  const filteredPaymentStatuses =
    paymentStatuses.filter((status) => {
      const searchValue = String(
        paymentStatusSearch || ""
      )
        .trim()
        .toLowerCase();

      if (!searchValue) return true;

      return status
        .toLowerCase()
        .includes(searchValue);
    });

  /* =======================================================
     OUTSIDE CLICK HANDLER
  ======================================================= */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        vehicleDropdownRef.current &&
        !vehicleDropdownRef.current.contains(
          event.target
        )
      ) {
        setShowVehicleDropdown(false);
      }

      if (
        challanTypeDropdownRef.current &&
        !challanTypeDropdownRef.current.contains(
          event.target
        )
      ) {
        setShowChallanTypeDropdown(false);
      }

      if (
        paymentStatusDropdownRef.current &&
        !paymentStatusDropdownRef.current.contains(
          event.target
        )
      ) {
        setShowPaymentStatusDropdown(false);
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

  /* =======================================================
     SHOW ALERT
  ======================================================= */

  const showAlert = (
    type,
    title,
    message
  ) => {
    setAlertData({
      show: true,
      type,
      title,
      message,
    });

    setTimeout(() => {
      setAlertData((prev) => ({
        ...prev,
        show: false,
      }));
    }, 4000);
  };

  /* =======================================================
     HANDLE NORMAL INPUT CHANGE
  ======================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =======================================================
     HANDLE STATUS CHANGE
  ======================================================= */

  const handleStatusChange = (e) => {
    const value = e.target.value;

    setForm((prev) => {
      if (value === "Paid") {
        return {
          ...prev,
          status: "Paid",
          paidDate:
            prev.paidDate ||
            new Date()
              .toISOString()
              .split("T")[0],
          paidAmount: prev.paidAmount,
        };
      }

      return {
        ...prev,
        status: "Pending",
        paidAmount: "",
        paidDate: "",
      };
    });
  };

  /* =======================================================
     VEHICLE SELECT
  ======================================================= */

  const handleVehicleSelect = (
    vehicle
  ) => {
    const vehicleNumber =
      vehicle?.number || "";

    setForm((prev) => ({
      ...prev,
      vehicle: vehicleNumber,
    }));

    setVehicleSearch(
      vehicleNumber
    );

    setShowVehicleDropdown(false);
  };

  /* =======================================================
     CHALLAN TYPE SELECT
  ======================================================= */

  const handleChallanTypeSelect = (
    type
  ) => {
    setForm((prev) => ({
      ...prev,
      type,
    }));

    setChallanTypeSearch(type);

    setShowChallanTypeDropdown(false);
  };

  /* =======================================================
     PAYMENT STATUS SELECT
  ======================================================= */

  const handlePaymentStatusSelect = (
    status
  ) => {
    handleStatusChange({
      target: {
        value: status,
      },
    });

    setPaymentStatusSearch(status);

    setShowPaymentStatusDropdown(false);
  };

  /* =======================================================
     FILE TO DATA URL
  ======================================================= */

  const fileToDataURL = (file) => {
    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.onload = () => {
          resolve(reader.result);
        };

        reader.onerror = () => {
          reject(
            new Error(
              "Unable to read the selected file."
            )
          );
        };

        reader.readAsDataURL(file);
      }
    );
  };

  /* =======================================================
     HANDLE FILE CHANGE
  ======================================================= */

  const handleFileChange = async (
    e
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    const maxFileSize =
      10 * 1024 * 1024;

    const isValidType =
      allowedTypes.includes(
        file.type
      );

    const isValidSize =
      file.size <= maxFileSize;

    if (
      !isValidType ||
      !isValidSize
    ) {
      setFileError(
        "Only PDF, JPG, JPEG and PNG files up to 10MB are allowed."
      );

      setFileVerified(false);

      setForm((prev) => ({
        ...prev,
        fileName: "",
        fileData: "",
        fileType: "",
        fileSize: "",
      }));

      showAlert(
        "error",
        "Invalid Document",
        "Please select a valid document. Only PDF, JPG, JPEG and PNG files up to 10MB are allowed."
      );

      e.target.value = "";

      return;
    }

    try {
      const fileData =
        await fileToDataURL(file);

      setFileError("");

      setForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileData,
        fileType: file.type,
        fileSize: file.size,
      }));

      setFileVerified(false);

      showAlert(
        "info",
        "Document Uploaded",
        "Your challan document has been uploaded successfully."
      );
    } catch (error) {
      console.error(
        "File reading error:",
        error
      );

      setFileError(
        "Unable to read the selected file."
      );

      setFileVerified(false);

      setForm((prev) => ({
        ...prev,
        fileName: "",
        fileData: "",
        fileType: "",
        fileSize: "",
      }));

      showAlert(
        "error",
        "File Error",
        "Unable to read the selected document. Please try again."
      );

      e.target.value = "";
    }
  };

  /* =======================================================
     REMOVE FILE
  ======================================================= */

  const removeFile = () => {
    setFileError("");

    setFileVerified(false);

    setForm((prev) => ({
      ...prev,
      fileName: "",
      fileData: "",
      fileType: "",
      fileSize: "",
    }));
  };

  /* =======================================================
     VERIFY DOCUMENT
  ======================================================= */

  const handleVerifyDocument = () => {
    if (!form.fileName) {
      showAlert(
        "error",
        "Document Required",
        "Please upload a challan document before verification."
      );

      return;
    }

    if (fileError) {
      showAlert(
        "error",
        "Invalid Document",
        fileError
      );

      return;
    }

    if (!form.fileData) {
      showAlert(
        "error",
        "File Storage Error",
        "The document could not be prepared for storage. Please upload it again."
      );

      return;
    }

    setFileVerified(true);

    showAlert(
      "success",
      "Document Verified",
      "Your challan document has been verified successfully."
    );
  };

  /* =======================================================
     SUBMIT FORM
  ======================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* Vehicle validation */

    if (!form.vehicle) {
      showAlert(
        "error",
        "Vehicle Required",
        "Please select a vehicle number."
      );

      return;
    }

    /* Challan number validation */

    if (!form.number.trim()) {
      showAlert(
        "error",
        "Challan Number Required",
        "Please enter the challan number."
      );

      return;
    }

    /* Due date validation */

    if (!form.due) {
      showAlert(
        "error",
        "Due Date Required",
        "Please select the challan due date."
      );

      return;
    }

    /* Challan date and due date validation */

    if (
      form.challanDate &&
      form.due <
        form.challanDate
    ) {
      showAlert(
        "error",
        "Invalid Date",
        "Due date cannot be earlier than the challan date."
      );

      return;
    }

    /* Paid status validation */

    if (form.status === "Paid") {
      if (
        form.paidAmount === ""
      ) {
        showAlert(
          "error",
          "Paid Amount Required",
          "Please enter the paid amount."
        );

        return;
      }

      const paidAmount =
        Number(form.paidAmount);

      const fineAmount =
        Number(form.amount || 0);

      if (paidAmount < 0) {
        showAlert(
          "error",
          "Invalid Paid Amount",
          "Paid amount cannot be negative."
        );

        return;
      }

      if (
        fineAmount > 0 &&
        paidAmount > fineAmount
      ) {
        showAlert(
          "error",
          "Invalid Paid Amount",
          "Paid amount cannot be greater than the fine amount."
        );

        return;
      }

      if (!form.paidDate) {
        showAlert(
          "error",
          "Payment Date Required",
          "Please select the payment date."
        );

        return;
      }

      if (
        form.challanDate &&
        form.paidDate <
          form.challanDate
      ) {
        showAlert(
          "error",
          "Invalid Payment Date",
          "Payment date cannot be earlier than the challan date."
        );

        return;
      }
    }

    /* File validation */

    if (
      form.fileName &&
      !form.fileData
    ) {
      showAlert(
        "error",
        "Document Error",
        "The selected document could not be stored. Please upload it again."
      );

      return;
    }

    /* Create challan */

    const challanData = {
      id: Date.now(),

      vehicle: form.vehicle,

      number: form.number,

      type: form.type,

      challanDate:
        form.challanDate,

      amount: Number(
        form.amount || 0
      ),

      due: formatDate(
        form.due
      ),

      status: form.status,

      paidAmount:
        form.status === "Paid"
          ? Number(
              form.paidAmount || 0
            )
          : 0,

      paidDate:
        form.status === "Paid"
          ? form.paidDate
          : null,

      remarks: form.remarks,

      fileName:
        form.fileName,

      fileData:
        form.fileData,

      fileType:
        form.fileType,

      fileSize:
        form.fileSize,

      verified:
        fileVerified,

      paid:
        form.status === "Paid",

      createdAt:
        new Date().toISOString(),
    };

    try {
      await addChallan(challanData);

      showAlert(
        "success",
        "Challan Saved",
        "Your challan has been saved successfully."
      );

      setTimeout(() => {
        navigate("/challans");
      }, 1200);
    } catch (error) {
      console.error(
        "Add challan error:",
        error
      );

      showAlert(
        "error",
        "Save Failed",
        "Unable to save the challan. Please try again."
      );
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* =====================================================
          CUSTOM ALERT
      ===================================================== */}

      <AnimatePresence>
        {alertData.show && (
          <motion.div
            initial={{
              opacity: 0,
              x: 100,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              x: 100,
              scale: 0.95,
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            className="fixed right-5 top-5 z-[200] w-[90%] max-w-md"
          >
            <div
              className={`flex items-start gap-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition ${
                alertData.type ===
                "success"
                  ? "border-emerald-200 bg-emerald-50"
                  : alertData.type ===
                      "error"
                    ? "border-red-200 bg-red-50"
                    : "border-blue-200 bg-blue-50"
              }`}
            >
              <motion.div
                initial={{
                  scale: 0.7,
                  rotate: -10,
                }}
                animate={{
                  scale: 1,
                  rotate: 0,
                }}
                transition={{
                  delay: 0.1,
                }}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  alertData.type ===
                  "success"
                    ? "bg-emerald-100 text-emerald-600"
                    : alertData.type ===
                        "error"
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600"
                }`}
              >
                {alertData.type ===
                  "success" && (
                  <CheckCircle2
                    size={21}
                  />
                )}

                {alertData.type ===
                  "error" && (
                  <AlertCircle
                    size={21}
                  />
                )}

                {alertData.type ===
                  "info" && (
                  <FileText
                    size={21}
                  />
                )}
              </motion.div>

              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">
                  {alertData.title}
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {alertData.message}
                </p>
              </div>

              <motion.button
                type="button"
                whileHover={{
                  scale: 1.1,
                  rotate: 90,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                onClick={() =>
                  setAlertData(
                    (prev) => ({
                      ...prev,
                      show: false,
                    })
                  )
                }
                className="text-slate-400 transition hover:text-slate-700"
              >
                <X size={18} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

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
      >
        <PageHeader
          title={
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{
                  rotate: 6,
                  scale: 1.08,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg shadow-blue-200"
              >
                <ReceiptText
                  size={23}
                />
              </motion.div>

              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Add New Challan
                </h1>
              </div>
            </div>
          }
          subtitle="Enter challan details, payment information and upload the challan document."
        />
      </motion.div>

      {/* =====================================================
          MAIN FORM
          overflow-visible FIXES DROPDOWN CLIPPING
      ===================================================== */}

      <motion.form
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="group relative overflow-visible rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow duration-500 hover:shadow-xl md:p-8"
      >
        {/* TOP GRADIENT LINE */}

        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />

        {/* ===================================================
            INTRO BANNER
        =================================================== */}

        <motion.div
          variants={itemVariants}
          className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-lg shadow-blue-100"
        >
          <motion.div
            animate={{
              x: [0, 15, 0],
              y: [0, -10, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
          />

          <motion.div
            animate={{
              x: [0, -12, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-16 right-20 h-40 w-40 rounded-full bg-blue-400/20"
          />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{
                  scale: 1.08,
                  rotate: 5,
                }}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-md"
              >
                <Sparkles
                  size={26}
                />
              </motion.div>

              <div>
                <h2 className="text-xl font-bold">
                  Challan Information
                </h2>

                <p className="mt-1 text-sm text-blue-100">
                  Complete the details below to securely store your vehicle challan.
                </p>
              </div>
            </div>

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                delay: 0.4,
                duration: 0.4,
              }}
              className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-md sm:flex"
            >
              <ShieldCheck
                size={15}
              />
              Secure Record
            </motion.div>
          </div>
        </motion.div>

        {/* ===================================================
            FORM CONTENT
        =================================================== */}

        <div className="space-y-7">
          <motion.div
            variants={containerVariants}
            className="grid gap-5 md:grid-cols-2"
          >
            {/* =================================================
                VEHICLE NUMBER
            ================================================= */}

            <FormField className="relative z-[60]">
              <label className="label">
                Vehicle Number
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div
                ref={vehicleDropdownRef}
                className="group/input relative"
              >
                <Car
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-blue-500 transition-transform duration-300 group-hover/input:scale-110"
                />

                <input
                  required
                  type="text"
                  value={
                    showVehicleDropdown
                      ? vehicleSearch
                      : form.vehicle
                  }
                  onFocus={() => {
                    setShowVehicleDropdown(
                      true
                    );

                    setVehicleSearch(
                      form.vehicle
                    );
                  }}
                  onChange={(e) => {
                    setVehicleSearch(
                      e.target.value
                    );

                    setShowVehicleDropdown(
                      true
                    );

                    setForm((prev) => ({
                      ...prev,
                      vehicle: "",
                    }));
                  }}
                  onClick={() => {
                    setShowVehicleDropdown(
                      true
                    );

                    setVehicleSearch(
                      form.vehicle
                    );
                  }}
                  placeholder="Select Vehicle Number"
                  className="input border-slate-200 bg-slate-50 pl-10 pr-10 transition-all duration-300 hover:border-blue-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => {
                    setShowVehicleDropdown(
                      (prev) => !prev
                    );

                    if (
                      !showVehicleDropdown
                    ) {
                      setVehicleSearch(
                        form.vehicle
                      );
                    }
                  }}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition hover:text-blue-500"
                >
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${
                      showVehicleDropdown
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {/* VEHICLE DROPDOWN */}

                <AnimatePresence>
                  {showVehicleDropdown && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -6,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -6,
                        scale: 0.98,
                      }}
                      transition={{
                        duration: 0.18,
                      }}
                      className="absolute left-0 right-0 top-full z-[100] mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                    >
                      {filteredVehicles.length >
                      0 ? (
                        filteredVehicles.map(
                          (vehicle) => {
                            const isSelected =
                              form.vehicle ===
                              vehicle.number;

                            return (
                              <button
                                key={
                                  vehicle.id
                                }
                                type="button"
                                onClick={() =>
                                  handleVehicleSelect(
                                    vehicle
                                  )
                                }
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 ${
                                  isSelected
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                                }`}
                              >
                                <div
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                    isSelected
                                      ? "bg-blue-100 text-blue-600"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  <Truck
                                    size={16}
                                  />
                                </div>

                                <span className="font-medium">
                                  {
                                    vehicle.number
                                  }
                                </span>

                                {isSelected && (
                                  <CheckCircle2
                                    size={16}
                                    className="ml-auto text-blue-500"
                                  />
                                )}
                              </button>
                            );
                          }
                        )
                      ) : (
                        <div className="px-3 py-4 text-center text-sm text-slate-400">
                          No vehicle found
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FormField>

            {/* =================================================
                CHALLAN NUMBER
            ================================================= */}

            <FormField className="relative z-[10]">
              <label className="label">
                Challan Number
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="group/input relative">
                <FileText
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 transition-transform duration-300 group-hover/input:scale-110"
                />

                <input
                  required
                  type="text"
                  name="number"
                  value={form.number}
                  onChange={handleChange}
                  placeholder="Enter challan number"
                  className="input border-slate-200 bg-slate-50 pl-10 transition-all duration-300 hover:border-indigo-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </FormField>

            {/* =================================================
                CHALLAN TYPE
            ================================================= */}

            <FormField className="relative z-[55]">
              <label className="label">
                Challan Type
              </label>

              <div
                ref={challanTypeDropdownRef}
                className="group/input relative"
              >
                <ReceiptText
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-purple-500 transition-transform duration-300 group-hover/input:scale-110"
                />

                <input
                  type="text"
                  value={
                    showChallanTypeDropdown
                      ? challanTypeSearch
                      : form.type
                  }
                  onFocus={() => {
                    setShowChallanTypeDropdown(
                      true
                    );

                    setChallanTypeSearch(
                      form.type
                    );
                  }}
                  onClick={() => {
                    setShowChallanTypeDropdown(
                      true
                    );

                    setChallanTypeSearch(
                      form.type
                    );
                  }}
                  onChange={(e) => {
                    setChallanTypeSearch(
                      e.target.value
                    );

                    setShowChallanTypeDropdown(
                      true
                    );
                  }}
                  placeholder="Select Challan Type"
                  className="input border-slate-200 bg-slate-50 pl-10 pr-10 transition-all duration-300 hover:border-purple-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => {
                    setShowChallanTypeDropdown(
                      (prev) => !prev
                    );

                    if (
                      !showChallanTypeDropdown
                    ) {
                      setChallanTypeSearch(
                        form.type
                      );
                    }
                  }}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition hover:text-purple-500"
                >
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${
                      showChallanTypeDropdown
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {/* CHALLAN TYPE DROPDOWN */}

                <AnimatePresence>
                  {showChallanTypeDropdown && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -6,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -6,
                        scale: 0.98,
                      }}
                      transition={{
                        duration: 0.18,
                      }}
                      className="absolute left-0 right-0 top-full z-[100] mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                    >
                      {filteredChallanTypes.length >
                      0 ? (
                        filteredChallanTypes.map(
                          (type) => {
                            const isSelected =
                              form.type ===
                              type;

                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() =>
                                  handleChallanTypeSelect(
                                    type
                                  )
                                }
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 ${
                                  isSelected
                                    ? "bg-purple-50 text-purple-600"
                                    : "text-slate-600 hover:bg-purple-50 hover:text-purple-600"
                                }`}
                              >
                                <div
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                    isSelected
                                      ? "bg-purple-100 text-purple-600"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  <ReceiptText
                                    size={16}
                                  />
                                </div>

                                <span className="font-medium">
                                  {type}
                                </span>

                                {isSelected && (
                                  <CheckCircle2
                                    size={16}
                                    className="ml-auto text-purple-500"
                                  />
                                )}
                              </button>
                            );
                          }
                        )
                      ) : (
                        <div className="px-3 py-4 text-center text-sm text-slate-400">
                          No challan type found
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FormField>

            {/* =================================================
                CHALLAN DATE
            ================================================= */}

            <FormField className="relative z-[10]">
              <label className="label">
                Challan Date
              </label>

              <div className="group/input relative">
                <Calendar
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 transition-transform duration-300 group-hover/input:scale-110"
                />

                <input
                  type="date"
                  name="challanDate"
                  value={
                    form.challanDate
                  }
                  onChange={handleChange}
                  className="input border-slate-200 bg-slate-50 pl-10 transition-all duration-300 hover:border-blue-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </FormField>

            {/* =================================================
                FINE AMOUNT
            ================================================= */}

            <FormField className="relative z-[10]">
              <label className="label">
                Fine Amount
              </label>

              <div className="group/input relative">
                <IndianRupee
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 transition-transform duration-300 group-hover/input:scale-110"
                />

                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Enter fine amount"
                  min="0"
                  className="input border-slate-200 bg-slate-50 pl-10 transition-all duration-300 hover:border-emerald-300 hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </FormField>

            {/* =================================================
                DUE DATE
            ================================================= */}

            <FormField className="relative z-[10]">
              <label className="label">
                Due Date
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="group/input relative">
                <Calendar
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-red-500 transition-transform duration-300 group-hover/input:scale-110"
                />

                <input
                  required
                  type="date"
                  name="due"
                  value={form.due}
                  onChange={handleChange}
                  className="input border-slate-200 bg-slate-50 pl-10 transition-all duration-300 hover:border-red-300 hover:bg-white focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100"
                />
              </div>
            </FormField>

            {/* =================================================
                PAYMENT STATUS
            ================================================= */}

            <FormField className="relative z-[50]">
              <label className="label">
                Payment Status
              </label>

              <div
                ref={
                  paymentStatusDropdownRef
                }
                className="group/input relative"
              >
                <CreditCard
                  size={18}
                  className={`pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 transition-colors ${
                    form.status ===
                    "Paid"
                      ? "text-emerald-500"
                      : "text-slate-400"
                  }`}
                />

                <input
                  type="text"
                  value={
                    showPaymentStatusDropdown
                      ? paymentStatusSearch
                      : form.status
                  }
                  onFocus={() => {
                    setShowPaymentStatusDropdown(
                      true
                    );

                    setPaymentStatusSearch(
                      form.status
                    );
                  }}
                  onClick={() => {
                    setShowPaymentStatusDropdown(
                      true
                    );

                    setPaymentStatusSearch(
                      form.status
                    );
                  }}
                  onChange={(e) => {
                    setPaymentStatusSearch(
                      e.target.value
                    );

                    setShowPaymentStatusDropdown(
                      true
                    );
                  }}
                  placeholder="Select Payment Status"
                  className={`input border-slate-200 bg-slate-50 pl-10 pr-10 transition-all duration-300 hover:border-blue-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 ${
                    form.status ===
                    "Paid"
                      ? "border-emerald-200 bg-emerald-50/30"
                      : ""
                  }`}
                />

                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentStatusDropdown(
                      (prev) => !prev
                    );

                    if (
                      !showPaymentStatusDropdown
                    ) {
                      setPaymentStatusSearch(
                        form.status
                      );
                    }
                  }}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition hover:text-blue-500"
                >
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${
                      showPaymentStatusDropdown
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {/* PAYMENT STATUS DROPDOWN */}

                <AnimatePresence>
                  {showPaymentStatusDropdown && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -6,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -6,
                        scale: 0.98,
                      }}
                      transition={{
                        duration: 0.18,
                      }}
                      className="absolute left-0 right-0 top-full z-[100] mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                    >
                      {filteredPaymentStatuses.length >
                      0 ? (
                        filteredPaymentStatuses.map(
                          (status) => {
                            const isSelected =
                              form.status ===
                              status;

                            return (
                              <button
                                key={status}
                                type="button"
                                onClick={() =>
                                  handlePaymentStatusSelect(
                                    status
                                  )
                                }
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 ${
                                  isSelected
                                    ? status ===
                                      "Paid"
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-blue-50 text-blue-600"
                                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                                }`}
                              >
                                <div
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                    isSelected
                                      ? status ===
                                        "Paid"
                                        ? "bg-emerald-100 text-emerald-600"
                                        : "bg-blue-100 text-blue-600"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  <CreditCard
                                    size={16}
                                  />
                                </div>

                                <span className="font-medium">
                                  {status}
                                </span>

                                {isSelected && (
                                  <CheckCircle2
                                    size={16}
                                    className={`ml-auto ${
                                      status ===
                                      "Paid"
                                        ? "text-emerald-500"
                                        : "text-blue-500"
                                    }`}
                                  />
                                )}
                              </button>
                            );
                          }
                        )
                      ) : (
                        <div className="px-3 py-4 text-center text-sm text-slate-400">
                          No payment status found
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FormField>

            {/* =================================================
                PAID AMOUNT
            ================================================= */}

            <AnimatePresence
              initial={false}
            >
              {form.status ===
                "Paid" && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -10,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -10,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                  className="relative z-[10]"
                >
                  <label className="label">
                    Paid Amount
                  </label>

                  <div className="group/input relative">
                    <IndianRupee
                      size={18}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 transition-transform duration-300 group-hover/input:scale-110"
                    />

                    <input
                      type="number"
                      name="paidAmount"
                      value={
                        form.paidAmount
                      }
                      onChange={
                        handleChange
                      }
                      min="0"
                      placeholder="Enter paid amount"
                      className="input border-emerald-200 bg-emerald-50/30 pl-10 transition-all duration-300 hover:border-emerald-300 hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* =================================================
                PAID DATE
            ================================================= */}

            <AnimatePresence
              initial={false}
            >
              {form.status ===
                "Paid" && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -10,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -10,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                  className="relative z-[10]"
                >
                  <label className="label">
                    Paid Date
                  </label>

                  <div className="group/input relative">
                    <Calendar
                      size={18}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 transition-transform duration-300 group-hover/input:scale-110"
                    />

                    <input
                      type="date"
                      name="paidDate"
                      value={
                        form.paidDate
                      }
                      onChange={
                        handleChange
                      }
                      className="input border-emerald-200 bg-emerald-50/30 pl-10 transition-all duration-300 hover:border-emerald-300 hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* =================================================
                UPLOAD CHALLAN DOCUMENT
            ================================================= */}

            <FormField className="relative z-[10] md:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <label className="label mb-0">
                  Upload Challan Document
                </label>

                <AnimatePresence>
                  {fileVerified && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        scale: 0.8,
                        x: 10,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.8,
                        x: 10,
                      }}
                      className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600"
                    >
                      <ShieldCheck
                        size={14}
                      />
                      Verified
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.label
                whileHover={{
                  y: -3,
                  scale: 1.005,
                }}
                whileTap={{
                  scale: 0.995,
                }}
                transition={{
                  duration: 0.2,
                }}
                className={`group/upload flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
                  form.fileName
                    ? fileVerified
                      ? "border-emerald-300 bg-emerald-50/50 hover:border-emerald-400 hover:bg-emerald-50"
                      : "border-blue-300 bg-blue-50/40 hover:border-blue-400 hover:bg-blue-50"
                    : "border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                <motion.div
                  whileHover={{
                    scale: 1.12,
                    rotate: 4,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                  }}
                  className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md transition-all duration-300 ${
                    fileVerified
                      ? "text-emerald-600 shadow-emerald-100"
                      : "text-blue-600 shadow-blue-100"
                  }`}
                >
                  {fileVerified ? (
                    <CheckCircle2
                      size={30}
                    />
                  ) : (
                    <Upload
                      size={30}
                    />
                  )}
                </motion.div>

                <span className="text-base font-semibold text-slate-700 transition-colors group-hover/upload:text-blue-700">
                  {form.fileName ||
                    "Choose file or drag and drop"}
                </span>

                <span className="mt-2 text-xs text-slate-400">
                  Supported: PDF, JPG, JPEG, PNG • Maximum size 10MB
                </span>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={
                    handleFileChange
                  }
                  className="hidden"
                />
              </motion.label>

              {fileError && (
                <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
                  <AlertTriangle
                    size={14}
                  />
                  {fileError}
                </p>
              )}

              <AnimatePresence>
                {form.fileName && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0,
                      y: -10,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                      y: -10,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      whileHover={{
                        y: -2,
                      }}
                      className="mt-4 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:border-blue-200 hover:bg-white hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{
                            scale: 1.08,
                            rotate: 3,
                          }}
                          className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600"
                        >
                          <FileText
                            size={21}
                          />
                        </motion.div>

                        <div>
                          <p className="max-w-[220px] truncate text-sm font-semibold text-slate-700">
                            {form.fileName}
                          </p>

                          <p className="text-xs text-slate-400">
                            Ready for verification
                          </p>
                        </div>
                      </div>

                      <motion.button
                        type="button"
                        whileHover={{
                          scale: 1.08,
                          rotate: 90,
                        }}
                        whileTap={{
                          scale: 0.9,
                        }}
                        onClick={
                          removeFile
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                        title="Remove Document"
                      >
                        <X size={18} />
                      </motion.button>
                    </motion.div>

                    {/* VERIFY BUTTON */}

                    <motion.button
                      type="button"
                      whileHover={{
                        y: -2,
                        scale: 1.01,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      onClick={
                        handleVerifyDocument
                      }
                      disabled={
                        fileVerified
                      }
                      className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                        fileVerified
                          ? "cursor-default bg-emerald-100 text-emerald-700"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 hover:shadow-xl"
                      }`}
                    >
                      {fileVerified ? (
                        <>
                          <CheckCircle2
                            size={19}
                          />
                          Document Verified Successfully
                        </>
                      ) : (
                        <>
                          <ShieldCheck
                            size={19}
                          />
                          Verify Document
                          <ArrowRight
                            size={16}
                          />
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </FormField>

            {/* =================================================
                REMARKS
            ================================================= */}

            <FormField className="relative z-[10] md:col-span-2">
              <label className="label">
                Remarks
              </label>

              <textarea
                name="remarks"
                value={form.remarks}
                onChange={
                  handleChange
                }
                className="input min-h-32 resize-none border-slate-200 bg-slate-50 transition-all duration-300 hover:border-blue-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="Enter additional remarks or important information..."
              />
            </FormField>
          </motion.div>
        </div>

        {/* ===================================================
            PAYMENT STATUS INFORMATION
        =================================================== */}

        <AnimatePresence>
          {form.status ===
            "Paid" && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                height: "auto",
                y: 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
                y: -10,
              }}
              transition={{
                duration: 0.3,
              }}
              className="relative z-[10] mt-6 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2
                    size={20}
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-emerald-800">
                    Payment Completed
                  </h3>

                  <p className="mt-1 text-sm text-emerald-700">
                    This challan will be recorded as paid.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================================================
            FORM FOOTER
        =================================================== */}

        <motion.div
          variants={itemVariants}
          className="relative z-[10] mt-8 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <motion.div
            layout
            className="flex items-center gap-2 text-sm"
          >
            <AnimatePresence mode="wait">
              {fileVerified ? (
                <motion.div
                  key="verified-status"
                  initial={{
                    opacity: 0,
                    x: -10,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: 10,
                  }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2
                    size={18}
                    className="text-emerald-500"
                  />

                  <span className="font-medium text-emerald-600">
                    Challan document verified and ready
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="unverified-status"
                  initial={{
                    opacity: 0,
                    x: -10,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: 10,
                  }}
                  className="flex items-center gap-2"
                >
                  <AlertCircle
                    size={18}
                    className="text-amber-500"
                  />

                  <span className="text-slate-500">
                    Upload and verify document before saving
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* BUTTONS */}

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* CANCEL */}

            <motion.button
              type="button"
              whileHover={{
                y: -2,
                scale: 1.01,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={() =>
                navigate("/challans")
              }
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition-all duration-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-sm"
            >
              Cancel
            </motion.button>

            {/* SAVE */}

            <motion.button
              type="submit"
              whileHover={{
                y: -2,
                scale: 1.01,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="group/save relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all duration-300 hover:shadow-xl"
            >
              <motion.span
                initial={{
                  x: "-120%",
                }}
                animate={{
                  x: "120%",
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
                className="absolute inset-y-0 w-12 -skew-x-12 bg-white/20"
              />

              <Save
                size={18}
                className="relative z-10 transition-transform duration-300 group-hover/save:rotate-[-8deg] group-hover/save:scale-110"
              />

              <span className="relative z-10">
                Save Challan
              </span>
            </motion.button>
          </div>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}