// import { useEffect, useRef, useState } from "react";
// import {
//   Save,
//   CheckCircle2,
//   Car,
//   FileText,
//   ChevronDown,
//   X,
//   AlertCircle,
//   ShieldCheck,
//   Calendar,
//   IndianRupee,
//   FileUp,
//   Sparkles,
//   ArrowRight,
//   Search,
//   Truck,
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useNavigate } from "react-router-dom";

// import PageHeader from "../components/PageHeader";

// import {
//   useFleet,
//   formatDate,
// } from "../context/fleetContext";

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
//     scale: 0.95,
//     y: 15,
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
//     scale: 0.95,
//     y: 15,
//     transition: {
//       duration: 0.2,
//     },
//   },
// };

// /* =========================================================
//    FORM FIELD WRAPPER
// ========================================================= */

// function FormField({ children, className = "" }) {
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
//    ADD DOCUMENT
// ========================================================= */

// export default function AddDocument() {
//   const { vehicles, addDocument } = useFleet();

//   const navigate = useNavigate();

//   /* =====================================================
//      FORM STATE
//   ===================================================== */

//   const [form, setForm] = useState({
//     vehicle: "",
//     type: "",
//     customType: "",
//     number: "",
//     start: "",
//     expiry: "",
//     amount: "",
//     remarks: "",
//     fileName: "",
//     fileData: "",
//     fileType: "",
//     fileSize: 0,
//   });

//   /* =====================================================
//      SEARCH DROPDOWN STATE
//   ===================================================== */

//   const [vehicleSearch, setVehicleSearch] = useState("");
//   const [showVehicleDropdown, setShowVehicleDropdown] =
//     useState(false);

//   const [documentTypeSearch, setDocumentTypeSearch] =
//     useState("");
//   const [showDocumentTypeDropdown, setShowDocumentTypeDropdown] =
//     useState(false);

//   /* =====================================================
//      DROPDOWN REF
//   ===================================================== */

//   const vehicleDropdownRef = useRef(null);
//   const documentTypeDropdownRef = useRef(null);

//   /* =====================================================
//      FILE STATE
//   ===================================================== */

//   const [selectedFile, setSelectedFile] = useState(null);

//   /* =====================================================
//      VERIFICATION STATE
//   ===================================================== */

//   const [verified, setVerified] = useState(false);

//   const [verifying, setVerifying] = useState(false);

//   /* =====================================================
//      CUSTOM ALERT STATE
//   ===================================================== */

//   const [alertData, setAlertData] = useState({
//     show: false,
//     type: "success",
//     title: "",
//     message: "",
//   });

//   /* =====================================================
//      DOCUMENT TYPES
//   ===================================================== */

//   const documentTypes = [
//     "Registration Certificate",
//     "Insurance",
//     "PUC Certificate",
//     "Fitness Certificate",
//     "State Permit",
//     "National Permit",
//     "Road Tax",
//     "Other",
//   ];

//   /* =====================================================
//      NORMALIZE SEARCH VALUE
//   ===================================================== */

//   const normalizeSearch = (value) => {
//     return String(value || "")
//       .replace(/\s+/g, "")
//       .trim()
//       .toLowerCase();
//   };

//   /* =====================================================
//      FILTER VEHICLES
//   ===================================================== */

//   const filteredVehicles = vehicles.filter((vehicle) => {
//     const searchValue = normalizeSearch(vehicleSearch);

//     if (!searchValue) return true;

//     return normalizeSearch(vehicle?.number).includes(
//       searchValue
//     );
//   });

//   /* =====================================================
//      FILTER DOCUMENT TYPES
//   ===================================================== */

//   const filteredDocumentTypes = documentTypes.filter((type) => {
//     const searchValue = String(documentTypeSearch || "")
//       .trim()
//       .toLowerCase();

//     if (!searchValue) return true;

//     return type.toLowerCase().includes(searchValue);
//   });

//   /* =====================================================
//      OUTSIDE CLICK HANDLER
//   ===================================================== */

//   useEffect(() => {
//     const handleOutsideClick = (event) => {
//       if (
//         vehicleDropdownRef.current &&
//         !vehicleDropdownRef.current.contains(event.target)
//       ) {
//         setShowVehicleDropdown(false);
//       }

//       if (
//         documentTypeDropdownRef.current &&
//         !documentTypeDropdownRef.current.contains(event.target)
//       ) {
//         setShowDocumentTypeDropdown(false);
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

//   /* =====================================================
//      SHOW ALERT
//   ===================================================== */

//   const showAlert = (type, title, message) => {
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

//   /* =====================================================
//      HANDLE INPUT CHANGE
//   ===================================================== */

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     /* Reset verification if document-related data changes */

//     if (
//       name === "number" ||
//       name === "type" ||
//       name === "customType"
//     ) {
//       setVerified(false);
//     }
//   };

//   /* =====================================================
//      VEHICLE SELECT
//   ===================================================== */

//   const handleVehicleSelect = (vehicle) => {
//     const vehicleNumber = vehicle?.number || "";

//     setForm((prev) => ({
//       ...prev,
//       vehicle: vehicleNumber,
//     }));

//     setVehicleSearch(vehicleNumber);
//     setShowVehicleDropdown(false);
//   };

//   /* =====================================================
//      DOCUMENT TYPE SELECT
//   ===================================================== */

//   const handleDocumentTypeSelect = (type) => {
//     setForm((prev) => ({
//       ...prev,
//       type,
//       customType: type === "Other" ? prev.customType : "",
//     }));

//     setDocumentTypeSearch(type);
//     setShowDocumentTypeDropdown(false);

//     setVerified(false);
//   };

//   /* =====================================================
//      FILE TO DATA URL

//      IMPORTANT:
//      File objects cannot be stored directly in localStorage.
//      We convert the selected file into a data URL so that
//      FleetContext can persist it.
//   ===================================================== */

//   const fileToDataURL = (file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();

//       reader.onload = () => {
//         resolve(reader.result);
//       };

//       reader.onerror = () => {
//         reject(
//           new Error("Unable to read the selected file.")
//         );
//       };

//       reader.readAsDataURL(file);
//     });
//   };

//   /* =====================================================
//      HANDLE FILE CHANGE
//   ===================================================== */

//   const handleFileChange = async (e) => {
//     const file = e.target.files?.[0];

//     if (!file) return;

//     /* Allowed File Types */

//     const allowedTypes = [
//       "application/pdf",
//       "image/jpeg",
//       "image/jpg",
//       "image/png",
//     ];

//     /* Maximum File Size */

//     const maxFileSize = 10 * 1024 * 1024;

//     const isValidType = allowedTypes.includes(file.type);
//     const isValidSize = file.size <= maxFileSize;

//     /* Validate immediately */

//     if (!isValidType || !isValidSize) {
//       setSelectedFile(null);

//       setVerified(false);

//       setForm((prev) => ({
//         ...prev,
//         fileName: "",
//         fileData: "",
//         fileType: "",
//         fileSize: 0,
//       }));

//       showAlert(
//         "error",
//         "Invalid Document",
//         "Please enter a valid document. Only PDF, JPG, JPEG and PNG files up to 10MB are allowed."
//       );

//       /* Allow selecting the same file again */

//       e.target.value = "";

//       return;
//     }

//     try {
//       /* Convert File object to Data URL */

//       const fileData = await fileToDataURL(file);

//       setSelectedFile(file);

//       setForm((prev) => ({
//         ...prev,
//         fileName: file.name,
//         fileData,
//         fileType: file.type,
//         fileSize: file.size,
//       }));

//       /* Reset verification */

//       setVerified(false);

//       showAlert(
//         "info",
//         "Document Uploaded",
//         "Your document has been uploaded. Please verify it before saving."
//       );
//     } catch (error) {
//       console.error("File reading error:", error);

//       setSelectedFile(null);

//       setVerified(false);

//       setForm((prev) => ({
//         ...prev,
//         fileName: "",
//         fileData: "",
//         fileType: "",
//         fileSize: 0,
//       }));

//       showAlert(
//         "error",
//         "File Error",
//         "Unable to read the selected document. Please try again."
//       );

//       e.target.value = "";
//     }
//   };

//   /* =====================================================
//      REMOVE FILE
//   ===================================================== */

//   const removeFile = () => {
//     setSelectedFile(null);

//     setVerified(false);

//     setForm((prev) => ({
//       ...prev,
//       fileName: "",
//       fileData: "",
//       fileType: "",
//       fileSize: 0,
//     }));
//   };

//   /* =====================================================
//      VERIFY DOCUMENT
//   ===================================================== */

//   const handleVerifyDocument = () => {
//     if (!selectedFile) {
//       showAlert(
//         "error",
//         "Document Required",
//         "Please upload a document before verification."
//       );

//       return;
//     }

//     /* Allowed File Types */

//     const allowedTypes = [
//       "application/pdf",
//       "image/jpeg",
//       "image/jpg",
//       "image/png",
//     ];

//     /* Maximum File Size */

//     const maxFileSize = 10 * 1024 * 1024;

//     setVerifying(true);

//     /* Fake verification animation */

//     setTimeout(() => {
//       const isValidType = allowedTypes.includes(
//         selectedFile.type
//       );

//       const isValidSize =
//         selectedFile.size <= maxFileSize;

//       if (!isValidType || !isValidSize) {
//         setVerified(false);

//         setVerifying(false);

//         showAlert(
//           "error",
//           "Invalid Document",
//           "Please enter a valid document. Only PDF, JPG, JPEG and PNG files up to 10MB are allowed."
//         );

//         return;
//       }

//       /*
//        * Make sure the file data exists before marking
//        * the document as verified.
//        */

//       if (!form.fileData) {
//         setVerified(false);

//         setVerifying(false);

//         showAlert(
//           "error",
//           "File Storage Error",
//           "The document could not be prepared for storage. Please upload it again."
//         );

//         return;
//       }

//       setVerified(true);

//       setVerifying(false);

//       showAlert(
//         "success",
//         "Document Verified",
//         "Your document has been verified successfully."
//       );
//     }, 1500);
//   };

//   /* =====================================================
//      SUBMIT FORM
//   ===================================================== */

//   const submit = (e) => {
//     e.preventDefault();

//     const finalDocumentType =
//       form.type === "Other"
//         ? form.customType
//         : form.type;

//     /* Required Field Validation */

//     if (
//       !form.vehicle ||
//       !form.type ||
//       !form.number ||
//       !form.expiry
//     ) {
//       showAlert(
//         "error",
//         "Required Fields Missing",
//         "Please fill all required fields."
//       );

//       return;
//     }

//     /* Other Document Type */

//     if (
//       form.type === "Other" &&
//       !form.customType.trim()
//     ) {
//       showAlert(
//         "error",
//         "Document Type Required",
//         "Please enter the custom document type."
//       );

//       return;
//     }

//     /* Document Upload Check */

//     if (!selectedFile || !form.fileData) {
//       showAlert(
//         "error",
//         "Document Required",
//         "Please upload a document before saving."
//       );

//       return;
//     }

//     /* Verification Check */

//     if (!verified) {
//       showAlert(
//         "error",
//         "Verification Required",
//         "Please verify the document before saving."
//       );

//       return;
//     }

//     /* Save Document */

//     addDocument({
//       ...form,
//       type: finalDocumentType,
//       start: formatDate(form.start),
//       expiry: formatDate(form.expiry),
//       amount: Number(form.amount || 0),

//       /*
//        * File information is explicitly passed to
//        * FleetContext for persistent storage.
//        */

//       fileName: form.fileName,
//       fileData: form.fileData,
//       fileType: form.fileType,
//       fileSize: form.fileSize,

//       verificationStatus: "Verified",
//       verificationMessage:
//         "Your document has been verified successfully.",
//       verifiedAt: new Date().toISOString(),
//     });

//     showAlert(
//       "success",
//       "Document Saved",
//       "Your document has been saved successfully."
//     );

//     /* Navigate after success */

//     setTimeout(() => {
//       navigate("/documents");
//     }, 1200);
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
//             className="fixed right-5 top-5 z-50 w-[90%] max-w-md"
//           >
//             <div
//               className={`flex items-start gap-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition ${
//                 alertData.type === "success"
//                   ? "border-emerald-200 bg-emerald-50"
//                   : alertData.type === "error"
//                     ? "border-red-200 bg-red-50"
//                     : "border-blue-200 bg-blue-50"
//               }`}
//             >
//               {/* ICON */}

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
//                   alertData.type === "success"
//                     ? "bg-emerald-100 text-emerald-600"
//                     : alertData.type === "error"
//                       ? "bg-red-100 text-red-600"
//                       : "bg-blue-100 text-blue-600"
//                 }`}
//               >
//                 {alertData.type === "success" && (
//                   <CheckCircle2 size={21} />
//                 )}

//                 {alertData.type === "error" && (
//                   <AlertCircle size={21} />
//                 )}

//                 {alertData.type === "info" && (
//                   <FileText size={21} />
//                 )}
//               </motion.div>

//               {/* CONTENT */}

//               <div className="flex-1">
//                 <h3 className="font-semibold text-slate-800">
//                   {alertData.title}
//                 </h3>

//                 <p className="mt-1 text-sm leading-relaxed text-slate-500">
//                   {alertData.message}
//                 </p>
//               </div>

//               {/* CLOSE */}

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
//                   setAlertData((prev) => ({
//                     ...prev,
//                     show: false,
//                   }))
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
//                 <FileText size={23} />
//               </motion.div>

//               <div>
//                 <h1 className="text-2xl font-bold text-slate-800">
//                   Add New Document
//                 </h1>
//               </div>
//             </div>
//           }
//           subtitle="Enter vehicle document details, upload your file and verify it securely."
//         />
//       </motion.div>

//       {/* =====================================================
//           MAIN FORM
//       ===================================================== */}

//       <motion.form
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//         onSubmit={submit}
//         className="group relative overflow-visible rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-8"
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
//           {/* DECORATIVE CIRCLES */}

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
//                 <Sparkles size={26} />
//               </motion.div>

//               <div>
//                 <h2 className="text-xl font-bold">
//                   Document Information
//                 </h2>

//                 <p className="mt-1 text-sm text-blue-100">
//                   Complete the details below to securely store
//                   your vehicle document.
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
//               <ShieldCheck size={15} />
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
//                 <span className="ml-1 text-red-500">*</span>
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
//                     setShowVehicleDropdown(true);
//                     setVehicleSearch(form.vehicle);
//                   }}
//                   onChange={(e) => {
//                     setVehicleSearch(e.target.value);
//                     setShowVehicleDropdown(true);

//                     setForm((prev) => ({
//                       ...prev,
//                       vehicle: "",
//                     }));
//                   }}
//                   onClick={() => {
//                     setShowVehicleDropdown(true);
//                     setVehicleSearch(form.vehicle);
//                   }}
//                   placeholder="Select Vehicle Number"
//                   className="input border-slate-200 bg-slate-50 pl-10 pr-10 transition-all duration-300 hover:border-blue-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
//                 />

//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowVehicleDropdown((prev) => !prev);

//                     if (!showVehicleDropdown) {
//                       setVehicleSearch(form.vehicle);
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

//                 {/* VEHICLE SEARCH DROPDOWN */}

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
//                       {filteredVehicles.length > 0 ? (
//                         filteredVehicles.map((vehicle) => {
//                           const isSelected =
//                             form.vehicle ===
//                             vehicle.number;

//                           return (
//                             <button
//                               key={vehicle.id}
//                               type="button"
//                               onClick={() =>
//                                 handleVehicleSelect(
//                                   vehicle
//                                 )
//                               }
//                               className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 ${
//                                 isSelected
//                                   ? "bg-blue-50 text-blue-600"
//                                   : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
//                               }`}
//                             >
//                               <div
//                                 className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
//                                   isSelected
//                                     ? "bg-blue-100 text-blue-600"
//                                     : "bg-slate-100 text-slate-500"
//                                 }`}
//                               >
//                                 <Truck size={16} />
//                               </div>

//                               <span className="font-medium">
//                                 {vehicle.number}
//                               </span>

//                               {isSelected && (
//                                 <CheckCircle2
//                                   size={16}
//                                   className="ml-auto text-blue-500"
//                                 />
//                               )}
//                             </button>
//                           );
//                         })
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
//                 DOCUMENT TYPE
//             ================================================= */}

//             <FormField className="relative z-[55]">
//               <label className="label">
//                 Document Type
//                 <span className="ml-1 text-red-500">*</span>
//               </label>

//               <div
//                 ref={documentTypeDropdownRef}
//                 className="group/input relative"
//               >
//                 <FileText
//                   size={18}
//                   className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-purple-500 transition-transform duration-300 group-hover/input:scale-110"
//                 />

//                 <input
//                   required
//                   type="text"
//                   value={
//                     showDocumentTypeDropdown
//                       ? documentTypeSearch
//                       : form.type
//                   }
//                   onFocus={() => {
//                     setShowDocumentTypeDropdown(true);
//                     setDocumentTypeSearch(form.type);
//                   }}
//                   onClick={() => {
//                     setShowDocumentTypeDropdown(true);
//                     setDocumentTypeSearch(form.type);
//                   }}
//                   onChange={(e) => {
//                     setDocumentTypeSearch(
//                       e.target.value
//                     );

//                     setShowDocumentTypeDropdown(true);

//                     setForm((prev) => ({
//                       ...prev,
//                       type: "",
//                     }));

//                     setVerified(false);
//                   }}
//                   placeholder="Select Document Type"
//                   className="input border-slate-200 bg-slate-50 pl-10 pr-10 transition-all duration-300 hover:border-purple-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
//                 />

//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowDocumentTypeDropdown(
//                       (prev) => !prev
//                     );

//                     if (!showDocumentTypeDropdown) {
//                       setDocumentTypeSearch(form.type);
//                     }
//                   }}
//                   className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition hover:text-purple-500"
//                 >
//                   <ChevronDown
//                     size={18}
//                     className={`transition-transform duration-300 ${
//                       showDocumentTypeDropdown
//                         ? "rotate-180"
//                         : ""
//                     }`}
//                   />
//                 </button>

//                 {/* DOCUMENT TYPE SEARCH DROPDOWN */}

//                 <AnimatePresence>
//                   {showDocumentTypeDropdown && (
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
//                       {filteredDocumentTypes.length > 0 ? (
//                         filteredDocumentTypes.map(
//                           (type) => {
//                             const isSelected =
//                               form.type === type;

//                             return (
//                               <button
//                                 key={type}
//                                 type="button"
//                                 onClick={() =>
//                                   handleDocumentTypeSelect(
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
//                                   <FileText
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
//                           No document type found
//                         </div>
//                       )}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </FormField>

//             {/* =================================================
//                 CUSTOM DOCUMENT TYPE
//             ================================================= */}

//             <AnimatePresence mode="wait">
//               {form.type === "Other" && (
//                 <motion.div
//                   key="custom-document-type"
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
//                   className="relative z-[10] md:col-span-2"
//                 >
//                   <label className="label">
//                     Enter Document Type
//                     <span className="ml-1 text-red-500">
//                       *
//                     </span>
//                   </label>

//                   <div className="group/input relative">
//                     <FileText
//                       size={18}
//                       className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 transition-transform duration-300 group-hover/input:scale-110"
//                     />

//                     <input
//                       required
//                       type="text"
//                       name="customType"
//                       value={form.customType}
//                       onChange={handleChange}
//                       className="input border-slate-200 bg-slate-50 pl-10 transition-all duration-300 hover:border-purple-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
//                       placeholder="Enter document type manually"
//                     />
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* =================================================
//                 DOCUMENT NUMBER
//             ================================================= */}

//             <FormField className="relative z-[10]">
//               <label className="label">
//                 Document Number
//                 <span className="ml-1 text-red-500">*</span>
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
//                   className="input border-slate-200 bg-slate-50 pl-10 transition-all duration-300 hover:border-indigo-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
//                   placeholder="Enter document number"
//                 />
//               </div>
//             </FormField>

//             {/* =================================================
//                 START DATE
//             ================================================= */}

//             <FormField className="relative z-[10]">
//               <label className="label">
//                 Start Date
//               </label>

//               <div className="group/input relative">
//                 <Calendar
//                   size={18}
//                   className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 transition-transform duration-300 group-hover/input:scale-110"
//                 />

//                 <input
//                   type="date"
//                   name="start"
//                   value={form.start}
//                   onChange={handleChange}
//                   className="input border-slate-200 bg-slate-50 pl-10 transition-all duration-300 hover:border-blue-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
//                 />
//               </div>
//             </FormField>

//             {/* =================================================
//                 EXPIRY DATE
//             ================================================= */}

//             <FormField className="relative z-[10]">
//               <label className="label">
//                 Expiry / Due Date
//                 <span className="ml-1 text-red-500">*</span>
//               </label>

//               <div className="group/input relative">
//                 <Calendar
//                   size={18}
//                   className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-red-500 transition-transform duration-300 group-hover/input:scale-110"
//                 />

//                 <input
//                   required
//                   type="date"
//                   name="expiry"
//                   value={form.expiry}
//                   onChange={handleChange}
//                   className="input border-slate-200 bg-slate-50 pl-10 transition-all duration-300 hover:border-red-300 hover:bg-white focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100"
//                 />
//               </div>
//             </FormField>

//             {/* =================================================
//                 AMOUNT
//             ================================================= */}

//             <FormField className="relative z-[10]">
//               <label className="label">
//                 Amount
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
//                   className="input border-slate-200 bg-slate-50 pl-10 transition-all duration-300 hover:border-emerald-300 hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
//                   placeholder="Enter amount"
//                   min="0"
//                 />
//               </div>
//             </FormField>

//             {/* =================================================
//                 UPLOAD DOCUMENT
//             ================================================= */}

//             <FormField className="relative z-[10] md:col-span-2">
//               <div className="mb-3 flex items-center justify-between">
//                 <label className="label mb-0">
//                   Upload Document
//                   <span className="ml-1 text-red-500">
//                     *
//                   </span>
//                 </label>

//                 <AnimatePresence>
//                   {verified && (
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
//                       <ShieldCheck size={14} />
//                       Verified
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>

//               {/* UPLOAD AREA */}

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
//                     ? verified
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
//                     verified
//                       ? "text-emerald-600 shadow-emerald-100"
//                       : "text-blue-600 shadow-blue-100"
//                   }`}
//                 >
//                   {verified ? (
//                     <CheckCircle2 size={30} />
//                   ) : (
//                     <FileUp size={30} />
//                   )}
//                 </motion.div>

//                 <span className="text-base font-semibold text-slate-700 transition-colors group-hover/upload:text-blue-700">
//                   {form.fileName ||
//                     "Choose file or drag and drop"}
//                 </span>

//                 <span className="mt-2 text-xs text-slate-400">
//                   Supported: PDF, JPG, JPEG, PNG • Maximum
//                   size 10MB
//                 </span>

//                 <input
//                   type="file"
//                   accept=".pdf,.jpg,.jpeg,.png"
//                   onChange={handleFileChange}
//                   className="hidden"
//                 />
//               </motion.label>

//               {/* FILE INFORMATION */}

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
//                           <FileText size={21} />
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
//                         onClick={removeFile}
//                         className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
//                         title="Remove Document"
//                       >
//                         <X size={18} />
//                       </motion.button>
//                     </motion.div>

//                     {/* VERIFY DOCUMENT BUTTON */}

//                     <motion.button
//                       type="button"
//                       whileHover={
//                         !verified && !verifying
//                           ? {
//                               y: -2,
//                               scale: 1.01,
//                             }
//                           : {}
//                       }
//                       whileTap={
//                         !verified && !verifying
//                           ? {
//                               scale: 0.98,
//                             }
//                           : {}
//                       }
//                       onClick={handleVerifyDocument}
//                       disabled={verified || verifying}
//                       className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
//                         verified
//                           ? "cursor-default bg-emerald-100 text-emerald-700"
//                           : verifying
//                             ? "cursor-wait bg-blue-100 text-blue-600"
//                             : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 hover:shadow-xl"
//                       }`}
//                     >
//                       {verifying ? (
//                         <>
//                           <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
//                           Verifying Document...
//                         </>
//                       ) : verified ? (
//                         <>
//                           <CheckCircle2 size={19} />
//                           Document Verified Successfully
//                         </>
//                       ) : (
//                         <>
//                           <ShieldCheck size={19} />
//                           Verify Document
//                           <ArrowRight size={16} />
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
//                 onChange={handleChange}
//                 className="input min-h-32 resize-none border-slate-200 bg-slate-50 transition-all duration-300 hover:border-blue-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
//                 placeholder="Enter additional remarks or important information..."
//               />
//             </FormField>
//           </motion.div>
//         </div>

//         {/* ===================================================
//             FORM FOOTER
//         =================================================== */}

//         <motion.div
//           variants={itemVariants}
//           className="relative z-[10] mt-8 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between"
//         >
//           {/* VERIFICATION STATUS */}

//           <motion.div
//             layout
//             className="flex items-center gap-2 text-sm"
//           >
//             <AnimatePresence mode="wait">
//               {verified ? (
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
//                     Document verified and ready to save
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
//               onClick={() => navigate("/documents")}
//               className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition-all duration-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-sm"
//             >
//               Cancel
//             </motion.button>

//             {/* SAVE */}

//             <motion.button
//               type="submit"
//               disabled={!verified}
//               whileHover={
//                 verified
//                   ? {
//                       y: -2,
//                       scale: 1.01,
//                     }
//                   : {}
//               }
//               whileTap={
//                 verified
//                   ? {
//                       scale: 0.98,
//                     }
//                   : {}
//               }
//               className={`group/save relative flex items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 ${
//                 verified
//                   ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 hover:shadow-xl"
//                   : "cursor-not-allowed bg-slate-200 text-slate-400"
//               }`}
//             >
//               {/* BUTTON SHINE */}

//               {verified && (
//                 <motion.span
//                   initial={{
//                     x: "-120%",
//                   }}
//                   animate={{
//                     x: "120%",
//                   }}
//                   transition={{
//                     duration: 2,
//                     repeat: Infinity,
//                     repeatDelay: 3,
//                     ease: "easeInOut",
//                   }}
//                   className="absolute inset-y-0 w-12 -skew-x-12 bg-white/20"
//                 />
//               )}

//               <Save
//                 size={18}
//                 className="relative z-10 transition-transform duration-300 group-hover/save:rotate-[-8deg] group-hover/save:scale-110"
//               />

//               <span className="relative z-10">
//                 Save Document
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
  CheckCircle2,
  Car,
  FileText,
  ChevronDown,
  X,
  AlertCircle,
  ShieldCheck,
  Calendar,
  IndianRupee,
  FileUp,
  Sparkles,
  ArrowRight,
  Search,
  Truck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import PageHeader from "../components/PageHeader";

import {
  useFleet,
  formatDate,
} from "../context/fleetContext";

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
    scale: 0.95,
    y: 15,
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
    scale: 0.95,
    y: 15,
    transition: {
      duration: 0.2,
    },
  },
};

/* =========================================================
   FORM FIELD WRAPPER
========================================================= */

function FormField({ children, className = "" }) {
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
   ADD DOCUMENT
========================================================= */

export default function AddDocument() {
  const {
    vehicles,
    addDocument,
    settings,
  } = useFleet();

  const navigate = useNavigate();

  /* =====================================================
     FORM STATE
  ===================================================== */

  const [form, setForm] = useState({
    vehicle: "",
    type: "",
    customType: "",
    number: "",
    start: "",
    expiry: "",
    amount: "",
    remarks: "",
    fileName: "",
    fileData: "",
    fileType: "",
    fileSize: 0,
  });

  /* =====================================================
     SEARCH DROPDOWN STATE
  ===================================================== */

  const [vehicleSearch, setVehicleSearch] = useState("");
  const [showVehicleDropdown, setShowVehicleDropdown] =
    useState(false);

  const [documentTypeSearch, setDocumentTypeSearch] =
    useState("");
  const [showDocumentTypeDropdown, setShowDocumentTypeDropdown] =
    useState(false);

  /* =====================================================
     DROPDOWN REF
  ===================================================== */

  const vehicleDropdownRef = useRef(null);
  const documentTypeDropdownRef = useRef(null);

  /* =====================================================
     FILE STATE
  ===================================================== */

  const [selectedFile, setSelectedFile] = useState(null);

  /* =====================================================
     VERIFICATION STATE
  ===================================================== */

  const [verified, setVerified] = useState(false);

  const [verifying, setVerifying] = useState(false);

  /* =====================================================
     CUSTOM ALERT STATE
  ===================================================== */

  const [alertData, setAlertData] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  /* =====================================================
     DOCUMENT TYPES

     Document types are now controlled centrally from:

       Settings -> Documents -> Document Types

     If settings.documentTypes has not yet been created,
     the existing default list is used.

     PUC Certificate is intentionally preserved.
  ===================================================== */

  const fallbackDocumentTypes = [
    "Registration Certificate",
    "Insurance",
    "PUC Certificate",
    "Fitness Certificate",
    "State Permit",
    "National Permit",
    "Road Tax",
    "Other",
  ];

  const documentTypes = Array.isArray(settings?.documentTypes)
    ? settings.documentTypes
    : fallbackDocumentTypes;

  /* =====================================================
     NORMALIZE SEARCH VALUE
  ===================================================== */

  const normalizeSearch = (value) => {
    return String(value || "")
      .replace(/\s+/g, "")
      .trim()
      .toLowerCase();
  };

  /* =====================================================
     FILTER VEHICLES
  ===================================================== */

  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchValue = normalizeSearch(vehicleSearch);

    if (!searchValue) return true;

    return normalizeSearch(vehicle?.number).includes(
      searchValue
    );
  });

  /* =====================================================
     FILTER DOCUMENT TYPES
  ===================================================== */

  const filteredDocumentTypes = documentTypes.filter((type) => {
    const searchValue = String(documentTypeSearch || "")
      .trim()
      .toLowerCase();

    if (!searchValue) return true;

    return String(type)
      .toLowerCase()
      .includes(searchValue);
  });

  /* =====================================================
     OUTSIDE CLICK HANDLER
  ===================================================== */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        vehicleDropdownRef.current &&
        !vehicleDropdownRef.current.contains(event.target)
      ) {
        setShowVehicleDropdown(false);
      }

      if (
        documentTypeDropdownRef.current &&
        !documentTypeDropdownRef.current.contains(event.target)
      ) {
        setShowDocumentTypeDropdown(false);
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

  /* =====================================================
     SHOW ALERT
  ===================================================== */

  const showAlert = (type, title, message) => {
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

  /* =====================================================
     HANDLE INPUT CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (
      name === "number" ||
      name === "type" ||
      name === "customType"
    ) {
      setVerified(false);
    }
  };

  /* =====================================================
     VEHICLE SELECT
  ===================================================== */

  const handleVehicleSelect = (vehicle) => {
    const vehicleNumber = vehicle?.number || "";

    setForm((prev) => ({
      ...prev,
      vehicle: vehicleNumber,
    }));

    setVehicleSearch(vehicleNumber);
    setShowVehicleDropdown(false);
  };

  /* =====================================================
     DOCUMENT TYPE SELECT
  ===================================================== */

  const handleDocumentTypeSelect = (type) => {
    setForm((prev) => ({
      ...prev,
      type,
      customType: type === "Other" ? prev.customType : "",
    }));

    setDocumentTypeSearch(type);
    setShowDocumentTypeDropdown(false);

    setVerified(false);
  };

  /* =====================================================
     FILE TO DATA URL
  ===================================================== */

  const fileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = () => {
        reject(
          new Error("Unable to read the selected file.")
        );
      };

      reader.readAsDataURL(file);
    });
  };

  /* =====================================================
     HANDLE FILE CHANGE
  ===================================================== */

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    const maxFileSize = 10 * 1024 * 1024;

    const isValidType = allowedTypes.includes(file.type);
    const isValidSize = file.size <= maxFileSize;

    if (!isValidType || !isValidSize) {
      setSelectedFile(null);

      setVerified(false);

      setForm((prev) => ({
        ...prev,
        fileName: "",
        fileData: "",
        fileType: "",
        fileSize: 0,
      }));

      showAlert(
        "error",
        "Invalid Document",
        "Please enter a valid document. Only PDF, JPG, JPEG and PNG files up to 10MB are allowed."
      );

      e.target.value = "";

      return;
    }

    try {
      const fileData = await fileToDataURL(file);

      setSelectedFile(file);

      setForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileData,
        fileType: file.type,
        fileSize: file.size,
      }));

      setVerified(false);

      showAlert(
        "info",
        "Document Uploaded",
        "Your document has been uploaded. Please verify it before saving."
      );
    } catch (error) {
      console.error("File reading error:", error);

      setSelectedFile(null);

      setVerified(false);

      setForm((prev) => ({
        ...prev,
        fileName: "",
        fileData: "",
        fileType: "",
        fileSize: 0,
      }));

      showAlert(
        "error",
        "File Error",
        "Unable to read the selected document. Please try again."
      );

      e.target.value = "";
    }
  };

  /* =====================================================
     REMOVE FILE
  ===================================================== */

  const removeFile = () => {
    setSelectedFile(null);

    setVerified(false);

    setForm((prev) => ({
      ...prev,
      fileName: "",
      fileData: "",
      fileType: "",
      fileSize: 0,
    }));
  };

  /* =====================================================
     VERIFY DOCUMENT
  ===================================================== */

  const handleVerifyDocument = () => {
    if (!selectedFile) {
      showAlert(
        "error",
        "Document Required",
        "Please upload a document before verification."
      );

      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    const maxFileSize = 10 * 1024 * 1024;

    setVerifying(true);

    setTimeout(() => {
      const isValidType = allowedTypes.includes(
        selectedFile.type
      );

      const isValidSize =
        selectedFile.size <= maxFileSize;

      if (!isValidType || !isValidSize) {
        setVerified(false);

        setVerifying(false);

        showAlert(
          "error",
          "Invalid Document",
          "Please enter a valid document. Only PDF, JPG, JPEG and PNG files up to 10MB are allowed."
        );

        return;
      }

      if (!form.fileData) {
        setVerified(false);

        setVerifying(false);

        showAlert(
          "error",
          "File Storage Error",
          "The document could not be prepared for storage. Please upload it again."
        );

        return;
      }

      setVerified(true);

      setVerifying(false);

      showAlert(
        "success",
        "Document Verified",
        "Your document has been verified successfully."
      );
    }, 1500);
  };

  /* =====================================================
     SUBMIT FORM
  ===================================================== */

  const submit = (e) => {
    e.preventDefault();

    const finalDocumentType =
      form.type === "Other"
        ? form.customType
        : form.type;

    if (
      !form.vehicle ||
      !form.type ||
      !form.number ||
      !form.expiry
    ) {
      showAlert(
        "error",
        "Required Fields Missing",
        "Please fill all required fields."
      );

      return;
    }

    if (
      form.type === "Other" &&
      !form.customType.trim()
    ) {
      showAlert(
        "error",
        "Document Type Required",
        "Please enter the custom document type."
      );

      return;
    }

    if (!selectedFile || !form.fileData) {
      showAlert(
        "error",
        "Document Required",
        "Please upload a document before saving."
      );

      return;
    }

    if (!verified) {
      showAlert(
        "error",
        "Verification Required",
        "Please verify the document before saving."
      );

      return;
    }

    addDocument({
      ...form,
      type: finalDocumentType,
      start: formatDate(form.start),
      expiry: formatDate(form.expiry),
      amount: Number(form.amount || 0),

      fileName: form.fileName,
      fileData: form.fileData,
      fileType: form.fileType,
      fileSize: form.fileSize,

      verificationStatus: "Verified",
      verificationMessage:
        "Your document has been verified successfully.",
      verifiedAt: new Date().toISOString(),
    });

    showAlert(
      "success",
      "Document Saved",
      "Your document has been saved successfully."
    );

    setTimeout(() => {
      navigate("/documents");
    }, 1200);
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
            className="fixed right-5 top-5 z-50 w-[90%] max-w-md"
          >
            <div
              className={`flex items-start gap-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition ${
                alertData.type === "success"
                  ? "border-emerald-200 bg-emerald-50"
                  : alertData.type === "error"
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
                  alertData.type === "success"
                    ? "bg-emerald-100 text-emerald-600"
                    : alertData.type === "error"
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600"
                }`}
              >
                {alertData.type === "success" && (
                  <CheckCircle2 size={21} />
                )}

                {alertData.type === "error" && (
                  <AlertCircle size={21} />
                )}

                {alertData.type === "info" && (
                  <FileText size={21} />
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
                  setAlertData((prev) => ({
                    ...prev,
                    show: false,
                  }))
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
                <FileText size={23} />
              </motion.div>

              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Add New Document
                </h1>
              </div>
            </div>
          }
          subtitle="Enter vehicle document details, upload your file and verify it securely."
        />
      </motion.div>

      {/* =====================================================
          MAIN FORM
      ===================================================== */}

      <motion.form
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onSubmit={submit}
        className="group relative overflow-visible rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-8"
      >
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
                <Sparkles size={26} />
              </motion.div>

              <div>
                <h2 className="text-xl font-bold">
                  Document Information
                </h2>

                <p className="mt-1 text-sm text-blue-100">
                  Complete the details below to securely store
                  your vehicle document.
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
              <ShieldCheck size={15} />
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
            {/* VEHICLE NUMBER */}

            <FormField className="relative z-[60]">
              <label className="label">
                Vehicle Number
                <span className="ml-1 text-red-500">*</span>
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
                    setShowVehicleDropdown(true);
                    setVehicleSearch(form.vehicle);
                  }}
                  onChange={(e) => {
                    setVehicleSearch(e.target.value);
                    setShowVehicleDropdown(true);

                    setForm((prev) => ({
                      ...prev,
                      vehicle: "",
                    }));
                  }}
                  onClick={() => {
                    setShowVehicleDropdown(true);
                    setVehicleSearch(form.vehicle);
                  }}
                  placeholder="Select Vehicle Number"
                  className="input border-slate-200 bg-slate-50 pl-10 pr-10 transition-all duration-300 hover:border-blue-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => {
                    setShowVehicleDropdown((prev) => !prev);

                    if (!showVehicleDropdown) {
                      setVehicleSearch(form.vehicle);
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
                      {filteredVehicles.length > 0 ? (
                        filteredVehicles.map((vehicle) => {
                          const isSelected =
                            form.vehicle ===
                            vehicle.number;

                          return (
                            <button
                              key={vehicle.id}
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
                                <Truck size={16} />
                              </div>

                              <span className="font-medium">
                                {vehicle.number}
                              </span>

                              {isSelected && (
                                <CheckCircle2
                                  size={16}
                                  className="ml-auto text-blue-500"
                                />
                              )}
                            </button>
                          );
                        })
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

            {/* DOCUMENT TYPE */}

            <FormField className="relative z-[55]">
              <label className="label">
                Document Type
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div
                ref={documentTypeDropdownRef}
                className="group/input relative"
              >
                <FileText
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-purple-500 transition-transform duration-300 group-hover/input:scale-110"
                />

                <input
                  required
                  type="text"
                  value={
                    showDocumentTypeDropdown
                      ? documentTypeSearch
                      : form.type
                  }
                  onFocus={() => {
                    setShowDocumentTypeDropdown(true);
                    setDocumentTypeSearch(form.type);
                  }}
                  onClick={() => {
                    setShowDocumentTypeDropdown(true);
                    setDocumentTypeSearch(form.type);
                  }}
                  onChange={(e) => {
                    setDocumentTypeSearch(
                      e.target.value
                    );

                    setShowDocumentTypeDropdown(true);

                    setForm((prev) => ({
                      ...prev,
                      type: "",
                    }));

                    setVerified(false);
                  }}
                  placeholder="Select Document Type"
                  className="input border-slate-200 bg-slate-50 pl-10 pr-10 transition-all duration-300 hover:border-purple-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => {
                    setShowDocumentTypeDropdown(
                      (prev) => !prev
                    );

                    if (!showDocumentTypeDropdown) {
                      setDocumentTypeSearch(form.type);
                    }
                  }}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition hover:text-purple-500"
                >
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${
                      showDocumentTypeDropdown
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showDocumentTypeDropdown && (
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
                      {filteredDocumentTypes.length > 0 ? (
                        filteredDocumentTypes.map(
                          (type) => {
                            const isSelected =
                              form.type === type;

                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() =>
                                  handleDocumentTypeSelect(
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
                                  <FileText
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
                          No document type found
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FormField>

            {/* CUSTOM DOCUMENT TYPE */}

            <AnimatePresence mode="wait">
              {form.type === "Other" && (
                <motion.div
                  key="custom-document-type"
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
                  className="relative z-[10] md:col-span-2"
                >
                  <label className="label">
                    Enter Document Type
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="group/input relative">
                    <FileText
                      size={18}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 transition-transform duration-300 group-hover/input:scale-110"
                    />

                    <input
                      required
                      type="text"
                      name="customType"
                      value={form.customType}
                      onChange={handleChange}
                      className="input border-slate-200 bg-slate-50 pl-10 transition-all duration-300 hover:border-purple-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      placeholder="Enter document type manually"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* DOCUMENT NUMBER */}

            <FormField className="relative z-[10]">
              <label className="label">
                Document Number
                <span className="ml-1 text-red-500">*</span>
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
                  className="input border-slate-200 bg-slate-50 pl-10 transition-all duration-300 hover:border-indigo-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="Enter document number"
                />
              </div>
            </FormField>

            {/* START DATE */}

            <FormField className="relative z-[10]">
              <label className="label">
                Start Date
              </label>

              <div className="group/input relative">
                <Calendar
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 transition-transform duration-300 group-hover/input:scale-110"
                />

                <input
                  type="date"
                  name="start"
                  value={form.start}
                  onChange={handleChange}
                  className="input border-slate-200 bg-slate-50 pl-10 transition-all duration-300 hover:border-blue-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </FormField>

            {/* EXPIRY DATE */}

            <FormField className="relative z-[10]">
              <label className="label">
                Expiry / Due Date
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="group/input relative">
                <Calendar
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-red-500 transition-transform duration-300 group-hover/input:scale-110"
                />

                <input
                  required
                  type="date"
                  name="expiry"
                  value={form.expiry}
                  onChange={handleChange}
                  className="input border-slate-200 bg-slate-50 pl-10 transition-all duration-300 hover:border-red-300 hover:bg-white focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100"
                />
              </div>
            </FormField>

            {/* AMOUNT */}

            <FormField className="relative z-[10]">
              <label className="label">
                Amount
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
                  className="input border-slate-200 bg-slate-50 pl-10 transition-all duration-300 hover:border-emerald-300 hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  placeholder="Enter amount"
                  min="0"
                />
              </div>
            </FormField>

            {/* UPLOAD DOCUMENT */}

            <FormField className="relative z-[10] md:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <label className="label mb-0">
                  Upload Document
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <AnimatePresence>
                  {verified && (
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
                      <ShieldCheck size={14} />
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
                    ? verified
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
                    verified
                      ? "text-emerald-600 shadow-emerald-100"
                      : "text-blue-600 shadow-blue-100"
                  }`}
                >
                  {verified ? (
                    <CheckCircle2 size={30} />
                  ) : (
                    <FileUp size={30} />
                  )}
                </motion.div>

                <span className="text-base font-semibold text-slate-700 transition-colors group-hover/upload:text-blue-700">
                  {form.fileName ||
                    "Choose file or drag and drop"}
                </span>

                <span className="mt-2 text-xs text-slate-400">
                  Supported: PDF, JPG, JPEG, PNG • Maximum
                  size 10MB
                </span>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </motion.label>

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
                          <FileText size={21} />
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
                        onClick={removeFile}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                        title="Remove Document"
                      >
                        <X size={18} />
                      </motion.button>
                    </motion.div>

                    <motion.button
                      type="button"
                      whileHover={
                        !verified && !verifying
                          ? {
                              y: -2,
                              scale: 1.01,
                            }
                          : {}
                      }
                      whileTap={
                        !verified && !verifying
                          ? {
                              scale: 0.98,
                            }
                          : {}
                      }
                      onClick={handleVerifyDocument}
                      disabled={verified || verifying}
                      className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                        verified
                          ? "cursor-default bg-emerald-100 text-emerald-700"
                          : verifying
                            ? "cursor-wait bg-blue-100 text-blue-600"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 hover:shadow-xl"
                      }`}
                    >
                      {verifying ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                          Verifying Document...
                        </>
                      ) : verified ? (
                        <>
                          <CheckCircle2 size={19} />
                          Document Verified Successfully
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={19} />
                          Verify Document
                          <ArrowRight size={16} />
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </FormField>

            {/* REMARKS */}

            <FormField className="relative z-[10] md:col-span-2">
              <label className="label">
                Remarks
              </label>

              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                className="input min-h-32 resize-none border-slate-200 bg-slate-50 transition-all duration-300 hover:border-blue-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="Enter additional remarks or important information..."
              />
            </FormField>
          </motion.div>
        </div>

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
              {verified ? (
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
                    Document verified and ready to save
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

          <div className="flex flex-col gap-3 sm:flex-row">
            <motion.button
              type="button"
              whileHover={{
                y: -2,
                scale: 1.01,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={() => navigate("/documents")}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition-all duration-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-sm"
            >
              Cancel
            </motion.button>

            <motion.button
              type="submit"
              disabled={!verified}
              whileHover={
                verified
                  ? {
                      y: -2,
                      scale: 1.01,
                    }
                  : {}
              }
              whileTap={
                verified
                  ? {
                      scale: 0.98,
                    }
                  : {}
              }
              className={`group/save relative flex items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                verified
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 hover:shadow-xl"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
              }`}
            >
              {verified && (
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
              )}

              <Save
                size={18}
                className="relative z-10 transition-transform duration-300 group-hover/save:rotate-[-8deg] group-hover/save:scale-110"
              />

              <span className="relative z-10">
                Save Document
              </span>
            </motion.button>
          </div>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}