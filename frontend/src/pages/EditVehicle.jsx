// import {
//   Link,
//   useNavigate,
//   useParams,
// } from "react-router-dom";

// import {
//   useEffect,
//   useState,
// } from "react";

// import {
//   ArrowLeft,
//   Save,
//   X,
//   Truck,
//   Car,
//   Bus,
//   FileText,
//   Upload,
//   Trash2,
//   Plus,
//   Calendar,
//   User,
//   Phone,
//   Mail,
//   MapPin,
//   Hash,
//   Settings,
//   Building2,
//   CheckCircle2,
//   AlertTriangle,
//   ShieldCheck,
//   ShieldX,
//   ExternalLink,
//   Pencil,
// } from "lucide-react";

// import {
//   motion,
//   AnimatePresence,
// } from "framer-motion";

// import PageHeader from "../components/PageHeader";

// import {
//   useFleet,
//   parseDate,
// } from "../context/fleetContext";


// /* =========================================================
//    EMPTY DOCUMENT
// ========================================================= */

// const emptyDocument = {
//   type: "",
//   number: "",
//   issueDate: "",
//   expiry: "",
//   amount: "",
//   fileName: "",
//   fileData: "",
//   fileType: "",
//   fileSize: 0,

//   verificationStatus:
//     "Not Verified",

//   verificationMessage:
//     "Add a valid document and verify it before saving.",

//   verifiedAt: "",
// };


// /* =========================================================
//    DOCUMENT TYPES
// ========================================================= */

// const documentTypes = [
//   "Registration Certificate",
//   "Insurance",
//   "Pollution Certificate",
//   "Fitness Certificate",
//   "State Permit",
//   "National Permit",
//   "Road Tax",
//   "Fine Challan",
//   "Other",
// ];


// /* =========================================================
//    ALLOWED FILE TYPES
// ========================================================= */

// const allowedFileExtensions = [
//   "pdf",
//   "jpg",
//   "jpeg",
//   "png",
// ];

// const allowedMimeTypes = [
//   "application/pdf",
//   "image/jpeg",
//   "image/png",
// ];


// /* =========================================================
//    MAX FILE SIZE
//    5 MB
// ========================================================= */

// const MAX_FILE_SIZE =
//   5 * 1024 * 1024;


// /* =========================================================
//    NORMALIZE VEHICLE NUMBER
// ========================================================= */

// function normalizeVehicleNumber(value) {
//   return String(value || "")
//     .trim()
//     .replace(/\s+/g, "")
//     .toUpperCase();
// }


// /* =========================================================
//    DATE FOR INPUT
// ========================================================= */

// function toInputDate(value) {
//   if (!value) {
//     return "";
//   }

//   if (
//     typeof value === "string" &&
//     /^\d{4}-\d{2}-\d{2}$/.test(value)
//   ) {
//     return value;
//   }

//   const date =
//     parseDate(value);

//   if (!date) {
//     return "";
//   }

//   const year =
//     date.getFullYear();

//   const month =
//     String(
//       date.getMonth() + 1
//     ).padStart(2, "0");

//   const day =
//     String(
//       date.getDate()
//     ).padStart(2, "0");

//   return `${year}-${month}-${day}`;
// }


// /* =========================================================
//    OPEN DOCUMENT FILE
//    FIX FOR:
//    "Not allowed to navigate top frame to data URL"

//    DATA URL
//       ↓
//    BLOB
//       ↓
//    OBJECT URL
//       ↓
//    NEW TAB
// ========================================================= */

// async function openDocumentFile(document) {
//   if (!document) {
//     return;
//   }

//   const fileSource =
//     document.fileData ||
//     document.fileUrl;

//   if (!fileSource) {
//     console.warn(
//       "No document file source found."
//     );

//     return;
//   }

//   try {
//     /*
//      * -------------------------------------------------------
//      * CASE 1:
//      * Data URL
//      *
//      * Example:
//      * data:application/pdf;base64,JVBERi0xLjQ...
//      *
//      * Chrome may block directly opening this using
//      * window.open().
//      *
//      * Therefore convert it into a Blob URL first.
//      * -------------------------------------------------------
//      */

//     if (
//       typeof fileSource === "string" &&
//       fileSource.startsWith("data:")
//     ) {
//       const response =
//         await fetch(fileSource);

//       if (!response.ok) {
//         throw new Error(
//           "Unable to read document data."
//         );
//       }

//       const blob =
//         await response.blob();

//       const blobUrl =
//         URL.createObjectURL(blob);

//       /*
//        * Open the blank tab FIRST.
//        *
//        * This reduces the chance of popup blockers
//        * because the function is triggered by a user click.
//        */

//       const newWindow =
//         window.open(
//           "",
//           "_blank"
//         );

//       if (newWindow) {
//         /*
//          * Navigate the already-created tab
//          * to the Blob URL.
//          */

//         newWindow.location.href =
//           blobUrl;

//         /*
//          * Do NOT revoke immediately.
//          *
//          * The browser needs some time to load
//          * the PDF/image from the Blob URL.
//          */

//         setTimeout(() => {
//           URL.revokeObjectURL(
//             blobUrl
//           );
//         }, 60 * 1000);

//         return;
//       }

//       /*
//        * Popup was blocked.
//        *
//        * Use a temporary anchor as fallback.
//        */

//       const link =
//         document_createElement_safe(
//           "a"
//         );

//       link.href =
//         blobUrl;

//       link.target =
//         "_blank";

//       link.rel =
//         "noopener noreferrer";

//       link.click();

//       setTimeout(() => {
//         URL.revokeObjectURL(
//           blobUrl
//         );
//       }, 60 * 1000);

//       return;
//     }


//     /*
//      * -------------------------------------------------------
//      * CASE 2:
//      * Blob URL
//      *
//      * If the document is already stored as a Blob URL,
//      * open it directly.
//      * -------------------------------------------------------
//      */

//     if (
//       typeof fileSource === "string" &&
//       fileSource.startsWith("blob:")
//     ) {
//       const newWindow =
//         window.open(
//           fileSource,
//           "_blank",
//           "noopener,noreferrer"
//         );

//       if (!newWindow) {
//         const link =
//           document_createElement_safe(
//             "a"
//           );

//         link.href =
//           fileSource;

//         link.target =
//           "_blank";

//         link.rel =
//           "noopener noreferrer";

//         link.click();
//       }

//       return;
//     }


//     /*
//      * -------------------------------------------------------
//      * CASE 3:
//      * Normal HTTP / HTTPS URL
//      *
//      * Example:
//      * https://example.com/document.pdf
//      * -------------------------------------------------------
//      */

//     if (
//       typeof fileSource === "string" &&
//       (
//         fileSource.startsWith("http://") ||
//         fileSource.startsWith("https://")
//       )
//     ) {
//       const newWindow =
//         window.open(
//           fileSource,
//           "_blank",
//           "noopener,noreferrer"
//         );

//       if (!newWindow) {
//         const link =
//           document_createElement_safe(
//             "a"
//           );

//         link.href =
//           fileSource;

//         link.target =
//           "_blank";

//         link.rel =
//           "noopener noreferrer";

//         link.click();
//       }

//       return;
//     }


//     /*
//      * -------------------------------------------------------
//      * CASE 4:
//      * Unknown source
//      *
//      * Try opening it through a Blob URL.
//      * -------------------------------------------------------
//      */

//     const response =
//       await fetch(fileSource);

//     if (!response.ok) {
//       throw new Error(
//         "Unable to load document."
//       );
//     }

//     const blob =
//       await response.blob();

//     const blobUrl =
//       URL.createObjectURL(blob);

//     const newWindow =
//       window.open(
//         "",
//         "_blank"
//       );

//     if (newWindow) {
//       newWindow.location.href =
//         blobUrl;

//       setTimeout(() => {
//         URL.revokeObjectURL(
//           blobUrl
//         );
//       }, 60 * 1000);

//       return;
//     }

//     const link =
//       document_createElement_safe(
//         "a"
//       );

//     link.href =
//       blobUrl;

//     link.target =
//       "_blank";

//     link.rel =
//       "noopener noreferrer";

//     link.click();

//     setTimeout(() => {
//       URL.revokeObjectURL(
//         blobUrl
//       );
//     }, 60 * 1000);

//   } catch (error) {

//     console.error(
//       "Unable to open document:",
//       error
//     );

//     /*
//      * Last fallback:
//      * Try direct navigation only when the source
//      * is not a data URL.
//      */

//     if (
//       typeof fileSource === "string" &&
//       !fileSource.startsWith("data:")
//     ) {
//       try {
//         const newWindow =
//           window.open(
//             fileSource,
//             "_blank",
//             "noopener,noreferrer"
//           );

//         if (!newWindow) {
//           window.location.href =
//             fileSource;
//         }
//       } catch (fallbackError) {
//         console.error(
//           "Document fallback failed:",
//           fallbackError
//         );
//       }
//     } else {
//       alert(
//         "Unable to open this document. Please upload the document again."
//       );
//     }
//   }
// }


// /* =========================================================
//    SAFE CREATE ELEMENT
//    Used only for fallback anchor creation.

//    Keeping this separate prevents confusion between:
//    - React document objects
//    - Browser document object
// ========================================================= */

// function document_createElement_safe(tagName) {
//   if (
//     typeof window === "undefined" ||
//     !window.document
//   ) {
//     throw new Error(
//       "Browser document is not available."
//     );
//   }

//   return window.document.createElement(
//     tagName
//   );
// }


// /* =========================================================
//    EDIT VEHICLE
// ========================================================= */

// export default function EditVehicle() {
//   const { id } =
//     useParams();

//   const navigate =
//     useNavigate();


//   /* =======================================================
//      FLEET CONTEXT
//   ======================================================= */

//   const {
//     vehicles,
//     documents,
//     updateVehicle,
//     updateDocument,
//     addDocument,
//     deleteDocument,
//     notify,
//   } = useFleet();


//   /* =======================================================
//      FIND VEHICLE
//   ======================================================= */

//   const vehicle =
//     vehicles.find(
//       (item) =>
//         String(item.id) ===
//         String(id)
//     );


//   /* =======================================================
//      VEHICLE FORM
//   ======================================================= */

//   const [
//     form,
//     setForm,
//   ] = useState({});


//   /* =======================================================
//      EXISTING DOCUMENTS
//   ======================================================= */

//   const [
//     vehicleDocuments,
//     setVehicleDocuments,
//   ] = useState([]);


//   /* =======================================================
//      NEW INLINE DOCUMENTS
//   ======================================================= */

//   const [
//     newDocuments,
//     setNewDocuments,
//   ] = useState([]);


//   /* =======================================================
//      DOCUMENT DELETE MODAL
//   ======================================================= */

//   const [
//     documentDeleteModal,
//     setDocumentDeleteModal,
//   ] = useState(false);

//   const [
//     documentToDelete,
//     setDocumentToDelete,
//   ] = useState(null);

//   const [
//     deletingDocument,
//     setDeletingDocument,
//   ] = useState(false);


//   /* =======================================================
//      SAVING
//   ======================================================= */

//   const [
//     saving,
//     setSaving,
//   ] = useState(false);


//   /* =======================================================
//      LOAD VEHICLE
//   ======================================================= */

//   useEffect(() => {
//     if (!vehicle) {
//       return;
//     }

//     setForm({
//       ...vehicle,

//       registrationDate:
//         toInputDate(
//           vehicle.registrationDate
//         ),
//     });

//     const normalizedVehicleNumber =
//       normalizeVehicleNumber(
//         vehicle.number
//       );

//     const vehicleDocs =
//       documents.filter(
//         (document) =>
//           normalizeVehicleNumber(
//             document.vehicle
//           ) ===
//           normalizedVehicleNumber
//       );

//     setVehicleDocuments(
//       vehicleDocs.map(
//         (document) => ({
//           ...document,

//           issueDate:
//             toInputDate(
//               document.issueDate
//             ),

//           expiry:
//             toInputDate(
//               document.expiry
//             ),

//           verificationStatus:
//             document.verificationStatus ||
//             (
//               document.fileData ||
//               document.fileUrl ||
//               document.fileName
//             )
//               ? "Verified"
//               : "Not Verified",

//           verificationMessage:
//             document.verificationMessage ||
//             "",

//           verifiedAt:
//             document.verifiedAt ||
//             "",
//         })
//       )
//     );

//   }, [
//     vehicle,
//     documents,
//   ]);


//   /* =======================================================
//      VEHICLE NOT FOUND
//   ======================================================= */

//   if (!vehicle) {
//     return (
//       <div className="flex min-h-[400px] items-center justify-center">
//         <div className="text-center">

//           <Truck
//             size={50}
//             className="mx-auto mb-4 text-slate-300"
//           />

//           <h2 className="text-xl font-bold text-slate-700">
//             Vehicle Not Found
//           </h2>

//           <button
//             type="button"
//             onClick={() =>
//               navigate("/vehicles")
//             }
//             className="mt-4 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
//           >
//             Back to Vehicles
//           </button>

//         </div>
//       </div>
//     );
//   }


//   /* =======================================================
//      VEHICLE ICON
//   ======================================================= */

//   const vehicleType =
//     form.type
//       ?.toLowerCase()
//       ?.trim() || "";

//   const VehicleIcon =
//     vehicleType === "car"
//       ? Car
//       : vehicleType === "bus"
//       ? Bus
//       : Truck;


//   /* =======================================================
//      VEHICLE CHANGE
//   ======================================================= */

//   const handleChange =
//     (event) => {
//       const {
//         name,
//         value,
//       } = event.target;

//       setForm(
//         (previous) => ({
//           ...previous,
//           [name]: value,
//         })
//       );
//     };


//   /* =======================================================
//      DOCUMENT CHANGE
//   ======================================================= */

//   const handleDocumentChange =
//     (
//       documentId,
//       field,
//       value
//     ) => {
//       setVehicleDocuments(
//         (previous) =>
//           previous.map(
//             (document) =>
//               String(document.id) ===
//               String(documentId)
//                 ? {
//                     ...document,

//                     [field]:
//                       value,

//                     verificationStatus:
//                       "Not Verified",

//                     verificationMessage:
//                       "Document details changed. Please verify the document again.",

//                     verifiedAt:
//                       "",
//                   }
//                 : document
//           )
//       );
//     };


//   /* =======================================================
//      NEW DOCUMENT CHANGE
//   ======================================================= */

//   const handleNewDocumentChange =
//     (
//       index,
//       field,
//       value
//     ) => {
//       setNewDocuments(
//         (previous) =>
//           previous.map(
//             (
//               document,
//               documentIndex
//             ) =>
//               documentIndex ===
//               index
//                 ? {
//                     ...document,

//                     [field]:
//                       value,

//                     verificationStatus:
//                       "Not Verified",

//                     verificationMessage:
//                       "Document details changed. Please verify the document again.",

//                     verifiedAt:
//                       "",
//                   }
//                 : document
//           )
//       );
//     };


//   /* =======================================================
//      FILE TO DATA URL
//   ======================================================= */

//   const fileToDataURL =
//     (file) => {
//       return new Promise(
//         (
//           resolve,
//           reject
//         ) => {
//           const reader =
//             new FileReader();

//           reader.onload =
//             () =>
//               resolve(
//                 reader.result
//               );

//           reader.onerror =
//             reject;

//           reader.readAsDataURL(
//             file
//           );
//         }
//       );
//     };


//   /* =======================================================
//      VALIDATE FILE
//   ======================================================= */

//   const validateFile =
//     (file) => {
//       if (!file) {
//         return {
//           valid: false,
//           message:
//             "Please add a document file first.",
//         };
//       }

//       if (
//         file.size >
//         MAX_FILE_SIZE
//       ) {
//         return {
//           valid: false,
//           message:
//             "File size must be 5 MB or less.",
//         };
//       }

//       const extension =
//         file.name
//           .split(".")
//           .pop()
//           ?.toLowerCase();

//       if (
//         !allowedFileExtensions.includes(
//           extension
//         )
//       ) {
//         return {
//           valid: false,
//           message:
//             "Add a valid PDF, JPG, JPEG or PNG document.",
//         };
//       }

//       if (
//         file.type &&
//         !allowedMimeTypes.includes(
//           file.type
//         )
//       ) {
//         return {
//           valid: false,
//           message:
//             "The selected file type is not supported. Please upload PDF, JPG, JPEG or PNG.",
//         };
//       }

//       return {
//         valid: true,
//         message:
//           "File format is valid.",
//       };
//     };


//   /* =======================================================
//      EXISTING DOCUMENT FILE
//   ======================================================= */

//   const handleExistingDocumentFile =
//     async (
//       documentId,
//       event
//     ) => {
//       const file =
//         event.target.files?.[0];

//       if (!file) {
//         return;
//       }

//       const fileValidation =
//         validateFile(file);

//       if (
//         !fileValidation.valid
//       ) {
//         notify(
//           fileValidation.message,
//           "error"
//         );

//         event.target.value =
//           "";

//         return;
//       }

//       try {
//         const data =
//           await fileToDataURL(
//             file
//           );

//         setVehicleDocuments(
//           (previous) =>
//             previous.map(
//               (document) =>
//                 String(document.id) ===
//                 String(documentId)
//                   ? {
//                       ...document,

//                       fileName:
//                         file.name,

//                       fileData:
//                         data,

//                       fileType:
//                         file.type,

//                       fileSize:
//                         file.size,

//                       verificationStatus:
//                         "Not Verified",

//                       verificationMessage:
//                         "New file added. Please verify this document.",

//                       verifiedAt:
//                         "",
//                     }
//                   : document
//             )
//         );

//         notify(
//           "Document file added. Please verify it before saving.",
//           "warning"
//         );

//       } catch (error) {
//         console.error(
//           "File error:",
//           error
//         );

//         notify(
//           "Unable to upload file.",
//           "error"
//         );
//       }
//     };


//   /* =======================================================
//      NEW DOCUMENT FILE
//   ======================================================= */

//   const handleNewDocumentFile =
//     async (
//       index,
//       event
//     ) => {
//       const file =
//         event.target.files?.[0];

//       if (!file) {
//         return;
//       }

//       const fileValidation =
//         validateFile(file);

//       if (
//         !fileValidation.valid
//       ) {
//         notify(
//           fileValidation.message,
//           "error"
//         );

//         event.target.value =
//           "";

//         return;
//       }

//       try {
//         const data =
//           await fileToDataURL(
//             file
//           );

//         setNewDocuments(
//           (previous) =>
//             previous.map(
//               (
//                 document,
//                 documentIndex
//               ) =>
//                 documentIndex ===
//                 index
//                   ? {
//                       ...document,

//                       fileName:
//                         file.name,

//                       fileData:
//                         data,

//                       fileType:
//                         file.type,

//                       fileSize:
//                         file.size,

//                       verificationStatus:
//                         "Not Verified",

//                       verificationMessage:
//                         "New file added. Please verify this document.",

//                       verifiedAt:
//                         "",
//                     }
//                   : document
//             )
//         );

//         notify(
//           "Document file added. Please verify it before saving.",
//           "warning"
//         );

//       } catch (error) {
//         console.error(
//           "File error:",
//           error
//         );

//         notify(
//           "Unable to upload file.",
//           "error"
//         );
//       }
//     };


//   /* =======================================================
//      DOCUMENT VERIFICATION
//   ======================================================= */

//   const verifyDocument =
//     (document) => {

//       if (
//         !document.type
//       ) {
//         return {
//           valid: false,
//           message:
//             "Please select the document type.",
//         };
//       }

//       if (
//         !document.number ||
//         !String(
//           document.number
//         ).trim()
//       ) {
//         return {
//           valid: false,
//           message:
//             "Please enter the document number.",
//         };
//       }

//       if (
//         !document.expiry
//       ) {
//         return {
//           valid: false,
//           message:
//             "Please enter the document expiry date.",
//         };
//       }

//       const expiryDate =
//         parseDate(
//           document.expiry
//         );

//       if (!expiryDate) {
//         return {
//           valid: false,
//           message:
//             "Please enter a valid expiry date.",
//         };
//       }

//       if (
//         !document.fileData &&
//         !document.fileUrl &&
//         !document.fileName
//       ) {
//         return {
//           valid: false,
//           message:
//             "Please add a document file first.",
//         };
//       }

//       if (
//         document.fileName
//       ) {
//         const extension =
//           document.fileName
//             .split(".")
//             .pop()
//             ?.toLowerCase();

//         if (
//           !allowedFileExtensions.includes(
//             extension
//           )
//         ) {
//           return {
//             valid: false,
//             message:
//               "Add a valid PDF, JPG, JPEG or PNG document.",
//           };
//         }
//       }

//       if (
//         document.fileSize &&
//         document.fileSize >
//           MAX_FILE_SIZE
//       ) {
//         return {
//           valid: false,
//           message:
//             "File size must be 5 MB or less.",
//         };
//       }

//       return {
//         valid: true,

//         message:
//           "Document verified successfully.",

//         verifiedAt:
//           new Date().toISOString(),
//       };
//     };


//   /* =======================================================
//      VERIFY EXISTING DOCUMENT
//   ======================================================= */

//   const verifyExistingDocument =
//     (document) => {

//       const result =
//         verifyDocument(
//           document
//         );

//       setVehicleDocuments(
//         (previous) =>
//           previous.map(
//             (item) =>
//               String(item.id) ===
//               String(document.id)
//                 ? {
//                     ...item,

//                     verificationStatus:
//                       result.valid
//                         ? "Verified"
//                         : "Not Verified",

//                     verificationMessage:
//                       result.message,

//                     verifiedAt:
//                       result.valid
//                         ? result.verifiedAt
//                         : "",
//                   }
//                 : item
//           )
//       );

//       if (
//         result.valid
//       ) {
//         notify(
//           "Document verified successfully"
//         );
//       } else {
//         notify(
//           result.message,
//           "error"
//         );
//       }
//     };


//   /* =======================================================
//      VERIFY NEW DOCUMENT
//   ======================================================= */

//   const verifyNewDocument =
//     (index) => {

//       const document =
//         newDocuments[index];

//       const result =
//         verifyDocument(
//           document
//         );

//       setNewDocuments(
//         (previous) =>
//           previous.map(
//             (
//               item,
//               documentIndex
//             ) =>
//               documentIndex ===
//               index
//                 ? {
//                     ...item,

//                     verificationStatus:
//                       result.valid
//                         ? "Verified"
//                         : "Not Verified",

//                     verificationMessage:
//                       result.message,

//                     verifiedAt:
//                       result.valid
//                         ? result.verifiedAt
//                         : "",
//                   }
//                 : item
//           )
//       );

//       if (
//         result.valid
//       ) {
//         notify(
//           "Document verified successfully"
//         );
//       } else {
//         notify(
//           result.message,
//           "error"
//         );
//       }
//     };


//   /* =======================================================
//      ADD NEW DOCUMENT ROW
//   ======================================================= */

//   const addNewDocumentRow =
//     () => {
//       setNewDocuments(
//         (previous) => [
//           ...previous,
//           {
//             ...emptyDocument,
//           },
//         ]
//       );
//     };


//   /* =======================================================
//      REMOVE NEW DOCUMENT
//   ======================================================= */

//   const removeNewDocument =
//     (index) => {
//       setNewDocuments(
//         (previous) =>
//           previous.filter(
//             (
//               _,
//               documentIndex
//             ) =>
//               documentIndex !==
//               index
//           )
//       );
//     };


//   /* =======================================================
//      OPEN DELETE DOCUMENT MODAL
//   ======================================================= */

//   const removeExistingDocument =
//     (document) => {

//       if (
//         !document?.id
//       ) {
//         return;
//       }

//       setDocumentToDelete(
//         document
//       );

//       setDocumentDeleteModal(
//         true
//       );
//     };


//   /* =======================================================
//      CONFIRM DOCUMENT DELETE
//   ======================================================= */

//   const confirmDeleteExistingDocument =
//     async () => {

//       if (
//         !documentToDelete?.id ||
//         deletingDocument
//       ) {
//         return;
//       }

//       try {
//         setDeletingDocument(
//           true
//         );

//         const result =
//           deleteDocument(
//             documentToDelete.id
//           );

//         if (
//           result?.success === false
//         ) {
//           throw new Error(
//             result.message ||
//             "Unable to delete document."
//           );
//         }

//         setVehicleDocuments(
//           (previous) =>
//             previous.filter(
//               (document) =>
//                 String(document.id) !==
//                 String(
//                   documentToDelete.id
//                 )
//             )
//         );

//         setDocumentDeleteModal(
//           false
//         );

//         setDocumentToDelete(
//           null
//         );

//         notify(
//           "Document deleted successfully.",
//           "success"
//         );

//       } catch (error) {

//         console.error(
//           "Document delete error:",
//           error
//         );

//         notify(
//           "Unable to delete document.",
//           "error"
//         );

//       } finally {

//         setDeletingDocument(
//           false
//         );
//       }
//     };


//   /* =======================================================
//      CANCEL DOCUMENT DELETE
//   ======================================================= */

//   const cancelDeleteExistingDocument =
//     () => {

//       if (
//         deletingDocument
//       ) {
//         return;
//       }

//       setDocumentDeleteModal(
//         false
//       );

//       setDocumentToDelete(
//         null
//       );
//     };


//   /* =======================================================
//      OPEN ADD DOCUMENT PAGE
//   ======================================================= */

//   const addDocumentUrl =
//     `/documents/add?vehicle=${encodeURIComponent(
//       vehicle.number
//     )}&vehicleId=${vehicle.id}&returnTo=${encodeURIComponent(
//       `/vehicles/${vehicle.id}/edit`
//     )}`;


//   /* =======================================================
//      SAVE VEHICLE
//   ======================================================= */

//   const handleSave =
//     async (event) => {

//       event.preventDefault();

//       if (saving) {
//         return;
//       }


//       /* ===================================================
//          VEHICLE VALIDATION
//       =================================================== */

//       if (
//         !form.brand ||
//         !form.model ||
//         !form.type
//       ) {
//         notify(
//           "Please fill all required vehicle details.",
//           "error"
//         );

//         return;
//       }


//       /* ===================================================
//          EXISTING DOCUMENT VALIDATION
//       =================================================== */

//       const unverifiedExisting =
//         vehicleDocuments.filter(
//           (document) =>
//             document.verificationStatus !==
//             "Verified"
//         );

//       if (
//         unverifiedExisting.length >
//         0
//       ) {
//         notify(
//           "Please verify all uploaded documents before saving.",
//           "error"
//         );

//         return;
//       }


//       /* ===================================================
//          INLINE NEW DOCUMENTS
//       =================================================== */

//       const validNewDocuments =
//         newDocuments.filter(
//           (document) =>
//             document.type ||
//             document.number ||
//             document.expiry ||
//             document.fileName ||
//             document.fileData
//         );

//       const incompleteNewDocuments =
//         validNewDocuments.filter(
//           (document) =>
//             !document.type ||
//             !document.number ||
//             !document.expiry ||
//             !document.fileName
//         );

//       if (
//         incompleteNewDocuments.length >
//         0
//       ) {
//         notify(
//           "Please complete all new document details and upload a file.",
//           "error"
//         );

//         return;
//       }

//       const unverifiedNew =
//         validNewDocuments.filter(
//           (document) =>
//             document.verificationStatus !==
//             "Verified"
//         );

//       if (
//         unverifiedNew.length >
//         0
//       ) {
//         notify(
//           "Please verify all new documents before saving.",
//           "error"
//         );

//         return;
//       }

//       setSaving(true);

//       try {

//         /* =================================================
//            UPDATE VEHICLE
//         ================================================= */

//         const vehicleResult =
//           updateVehicle(
//             vehicle.id,
//             {
//               ...form,

//               number:
//                 vehicle.number,
//             }
//           );

//         if (
//           vehicleResult?.success === false
//         ) {
//           setSaving(false);
//           return;
//         }


//         /* =================================================
//            UPDATE EXISTING DOCUMENTS
//         ================================================= */

//         for (
//           const document
//           of vehicleDocuments
//         ) {

//           const result =
//             updateDocument(
//               document.id,

//               {
//                 ...document,

//                 vehicle:
//                   vehicle.number,

//                 verificationStatus:
//                   "Verified",

//                 verificationMessage:
//                   document.verificationMessage ||
//                   "Document verified successfully.",

//                 verifiedAt:
//                   document.verifiedAt ||
//                   new Date().toISOString(),
//               }
//             );

//           if (
//             result?.success === false
//           ) {
//             throw new Error(
//               "Unable to update document."
//             );
//           }
//         }


//         /* =================================================
//            ADD NEW DOCUMENTS
//         ================================================= */

//         for (
//           const document
//           of validNewDocuments
//         ) {

//           const result =
//             addDocument({
//               ...document,

//               vehicle:
//                 vehicle.number,

//               verificationStatus:
//                 "Verified",

//               verificationMessage:
//                 document.verificationMessage ||
//                 "Document verified successfully.",

//               verifiedAt:
//                 document.verifiedAt ||
//                 new Date().toISOString(),

//               createdAt:
//                 new Date().toISOString(),
//             });

//           if (
//             result?.success === false
//           ) {
//             throw new Error(
//               "Unable to add document."
//             );
//           }
//         }


//         notify(
//           "Vehicle details updated successfully"
//         );


//         /* =================================================
//            GO TO VEHICLE DETAILS
//         ================================================= */

//         setTimeout(() => {
//           navigate(
//             `/vehicles/${vehicle.id}`
//           );
//         }, 500);

//       } catch (error) {

//         console.error(
//           "Update vehicle error:",
//           error
//         );

//         notify(
//           "Unable to update vehicle.",
//           "error"
//         );

//         setSaving(false);
//       }
//     };


//   /* =======================================================
//      CANCEL
//   ======================================================= */

//   const handleCancel =
//     () => {
//       navigate(
//         `/vehicles/${vehicle.id}`
//       );
//     };


//   /* =======================================================
//      RETURN UI
//   ======================================================= */

//   return (
//     <>
//       <motion.div
//         initial={{
//           opacity: 0,
//           y: 15,
//         }}
//         animate={{
//           opacity: 1,
//           y: 0,
//         }}
//         transition={{
//           duration: 0.35,
//         }}
//         className="pb-10"
//       >

//         {/* =================================================
//             BACK
//         ================================================= */}

//         <button
//           type="button"
//           onClick={
//             handleCancel
//           }
//           className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
//         >
//           <ArrowLeft
//             size={17}
//           />

//           Back to Vehicle Details
//         </button>


//         {/* =================================================
//             PAGE HEADER
//         ================================================= */}

//         <PageHeader
//           title={
//             <div className="flex items-center gap-3">

//               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200">
//                 <Pencil
//                   size={21}
//                 />
//               </div>

//               <div>
//                 Edit Vehicle
//               </div>

//             </div>
//           }
//           subtitle={`Update vehicle information • ${vehicle.number}`}
//         />


//         <form
//           onSubmit={
//             handleSave
//           }
//           className="mt-6 space-y-6"
//         >


//           {/* =================================================
//               VEHICLE INFORMATION
//           ================================================= */}

//           <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

//             <SectionHeader
//               icon={VehicleIcon}
//               title="Vehicle Information"
//               subtitle="Update the basic vehicle information"
//             />

//             <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

//               <InputField
//                 label="Vehicle Number"
//                 name="number"
//                 value={
//                   vehicle.number
//                 }
//                 disabled
//                 required
//                 icon={Hash}
//                 helper="Vehicle number cannot be changed"
//               />

//               <div>

//                 <label className="mb-2 block text-sm font-semibold text-slate-700">

//                   Vehicle Type

//                   <span className="ml-1 text-red-500">
//                     *
//                   </span>

//                 </label>

//                 <div className="relative">

//                   <VehicleIcon
//                     size={17}
//                     className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                   />

//                   <select
//                     name="type"
//                     value={
//                       form.type ||
//                       ""
//                     }
//                     onChange={
//                       handleChange
//                     }
//                     required
//                     className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
//                   >

//                     <option value="">
//                       Select Vehicle Type
//                     </option>

//                     <option value="Car">
//                       Car
//                     </option>

//                     <option value="Truck">
//                       Truck
//                     </option>

//                     <option value="Bus">
//                       Bus
//                     </option>

//                     <option value="Other">
//                       Other
//                     </option>

//                   </select>

//                 </div>

//               </div>


//               <InputField
//                 label="Brand"
//                 name="brand"
//                 value={
//                   form.brand ||
//                   ""
//                 }
//                 onChange={
//                   handleChange
//                 }
//                 icon={Building2}
//                 required
//               />

//               <InputField
//                 label="Model"
//                 name="model"
//                 value={
//                   form.model ||
//                   ""
//                 }
//                 onChange={
//                   handleChange
//                 }
//                 icon={Car}
//                 required
//               />

//               <InputField
//                 label="Manufacturing Year"
//                 name="year"
//                 type="number"
//                 value={
//                   form.year ||
//                   ""
//                 }
//                 onChange={
//                   handleChange
//                 }
//                 icon={Calendar}
//               />

//               <InputField
//                 label="Registration Date"
//                 name="registrationDate"
//                 type="date"
//                 value={
//                   form.registrationDate ||
//                   ""
//                 }
//                 onChange={
//                   handleChange
//                 }
//                 icon={Calendar}
//               />

//               <InputField
//                 label="Chassis Number"
//                 name="chassis"
//                 value={
//                   form.chassis ||
//                   ""
//                 }
//                 onChange={
//                   handleChange
//                 }
//                 icon={Hash}
//               />

//               <InputField
//                 label="Engine Number"
//                 name="engine"
//                 value={
//                   form.engine ||
//                   ""
//                 }
//                 onChange={
//                   handleChange
//                 }
//                 icon={Settings}
//               />


//               <div>

//                 <label className="mb-2 block text-sm font-semibold text-slate-700">
//                   Vehicle Status
//                 </label>

//                 <select
//                   name="status"
//                   value={
//                     form.status ||
//                     "Active"
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
//                 >

//                   <option value="Active">
//                     Active
//                   </option>

//                   <option value="Inactive">
//                     Inactive
//                   </option>

//                   <option value="Maintenance">
//                     Maintenance
//                   </option>

//                 </select>

//               </div>

//             </div>

//           </section>


//           {/* =================================================
//               OWNER DETAILS
//           ================================================= */}

//           <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

//             <SectionHeader
//               icon={User}
//               title="Owner Details"
//               subtitle="Update the vehicle owner's information"
//             />

//             <div className="mt-6 grid gap-5 md:grid-cols-2">

//               <InputField
//                 label="Owner Name"
//                 name="owner"
//                 value={
//                   form.owner ||
//                   ""
//                 }
//                 onChange={
//                   handleChange
//                 }
//                 icon={User}
//               />

//               <InputField
//                 label="Mobile Number"
//                 name="mobile"
//                 value={
//                   form.mobile ||
//                   ""
//                 }
//                 onChange={
//                   handleChange
//                 }
//                 icon={Phone}
//                 type="tel"
//               />

//               <InputField
//                 label="Email Address"
//                 name="email"
//                 value={
//                   form.email ||
//                   ""
//                 }
//                 onChange={
//                   handleChange
//                 }
//                 icon={Mail}
//                 type="email"
//               />

//               <div className="md:col-span-2">

//                 <label className="mb-2 block text-sm font-semibold text-slate-700">
//                   Owner Address
//                 </label>

//                 <div className="relative">

//                   <MapPin
//                     size={17}
//                     className="absolute left-3 top-4 text-slate-400"
//                   />

//                   <textarea
//                     name="address"
//                     value={
//                       form.address ||
//                       ""
//                     }
//                     onChange={
//                       handleChange
//                     }
//                     rows={3}
//                     className="w-full resize-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
//                     placeholder="Enter owner address"
//                   />

//                 </div>

//               </div>

//             </div>

//           </section>


//           {/* =================================================
//               UPLOADED DOCUMENTS
//           ================================================= */}

//           <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

//             <SectionHeader
//               icon={FileText}
//               title="Uploaded Documents"
//               subtitle="Edit, replace and verify previously uploaded documents"
//             />

//             <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4">

//               <div className="flex items-start gap-3">

//                 <ShieldCheck
//                   size={20}
//                   className="mt-0.5 shrink-0 text-amber-600"
//                 />

//                 <div>

//                   <p className="text-sm font-semibold text-amber-800">
//                     Document verification required
//                   </p>

//                   <p className="mt-1 text-xs leading-5 text-amber-700">
//                     If you replace or change a document,
//                     click <b>Verify Document</b> before
//                     saving the vehicle.
//                   </p>

//                 </div>

//               </div>

//             </div>


//             {vehicleDocuments.length ===
//             0 ? (

//               <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">

//                 <FileText
//                   size={35}
//                   className="mx-auto text-slate-300"
//                 />

//                 <p className="mt-3 font-semibold text-slate-600">
//                   No documents found
//                 </p>

//                 <p className="mt-1 text-sm text-slate-400">
//                   Add a new document using the
//                   Add Document page below.
//                 </p>

//                 <Link
//                   to={
//                     addDocumentUrl
//                   }
//                   className="mx-auto mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
//                 >
//                   <Plus
//                     size={17}
//                   />

//                   Add Document

//                   <ExternalLink
//                     size={15}
//                   />
//                 </Link>

//               </div>

//             ) : (

//               <div className="mt-6 space-y-5">

//                 {vehicleDocuments.map(
//                   (
//                     document,
//                     index
//                   ) => (

//                     <ExistingDocument
//                       key={
//                         document.id
//                       }
//                       document={
//                         document
//                       }
//                       index={
//                         index
//                       }
//                       onChange={
//                         handleDocumentChange
//                       }
//                       onFileChange={
//                         handleExistingDocumentFile
//                       }
//                       onVerify={
//                         verifyExistingDocument
//                       }
//                       onDelete={
//                         removeExistingDocument
//                       }
//                     />

//                   )
//                 )}

//               </div>

//             )}

//           </section>


//           {/* =================================================
//               ADD NEW DOCUMENTS
//           ================================================= */}

//           <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

//             <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

//               <SectionHeader
//                 icon={Plus}
//                 title="Add New Documents"
//                 subtitle="Add documents that were not previously entered"
//               />

//               <Link
//                 to={
//                   addDocumentUrl
//                 }
//                 className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
//               >

//                 <Plus
//                   size={17}
//                 />

//                 Add Document

//                 <ExternalLink
//                   size={15}
//                 />

//               </Link>

//             </div>


//             <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">

//               <div className="flex items-start gap-3">

//                 <FileText
//                   size={20}
//                   className="mt-0.5 shrink-0 text-blue-600"
//                 />

//                 <div>

//                   <p className="text-sm font-semibold text-blue-800">
//                     Add document from the Document page
//                   </p>

//                   <p className="mt-1 text-xs leading-5 text-blue-600">
//                     Use the button below to open the
//                     Add Document page. The current
//                     vehicle number will be passed to
//                     that page.
//                   </p>

//                   <Link
//                     to={
//                       addDocumentUrl
//                     }
//                     className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900"
//                   >

//                     Open Add Document page

//                     <ExternalLink
//                       size={14}
//                     />

//                   </Link>

//                 </div>

//               </div>

//             </div>


//             {/* <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">

//               <div>

//                 <p className="text-sm font-semibold text-slate-700">
//                   Add document here
//                 </p>

//                 <p className="mt-1 text-xs text-slate-400">
//                   You can also add a document
//                   directly without leaving this page.
//                 </p>

//               </div>

//               <button
//                 type="button"
//                 onClick={
//                   addNewDocumentRow
//                 }
//                 className="flex shrink-0 items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
//               >

//                 <Plus
//                   size={17}
//                 />

//                 Add Here

//               </button>

//             </div> */}


//             {newDocuments.length >
//               0 && (

//               <div className="mt-6 space-y-5">

//                 {newDocuments.map(
//                   (
//                     document,
//                     index
//                   ) => (

//                     <NewDocument
//                       key={
//                         index
//                       }
//                       document={
//                         document
//                       }
//                       index={
//                         index
//                       }
//                       onChange={
//                         handleNewDocumentChange
//                       }
//                       onFileChange={
//                         handleNewDocumentFile
//                       }
//                       onVerify={
//                         verifyNewDocument
//                       }
//                       onRemove={
//                         removeNewDocument
//                       }
//                     />

//                   )
//                 )}

//               </div>

//             )}

//           </section>


//           {/* =================================================
//               SAVE BAR
//           ================================================= */}

//           <div className="sticky bottom-4 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">

//             <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

//               <div className="flex items-center gap-2 text-sm text-slate-500">

//                 <AlertTriangle
//                   size={17}
//                   className="text-amber-500"
//                 />

//                 <span>
//                   Vehicle number cannot be changed.
//                 </span>

//               </div>

//               <div className="flex gap-3">

//                 <button
//                   type="button"
//                   onClick={
//                     handleCancel
//                   }
//                   disabled={
//                     saving
//                   }
//                   className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
//                 >

//                   <X
//                     size={17}
//                   />

//                   Cancel

//                 </button>

//                 <button
//                   type="submit"
//                   disabled={
//                     saving
//                   }
//                   className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
//                 >

//                   {saving ? (
//                     <>

//                       <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

//                       Saving...

//                     </>
//                   ) : (
//                     <>

//                       <Save
//                         size={17}
//                       />

//                       Save Changes

//                     </>
//                   )}

//                 </button>

//               </div>

//             </div>

//           </div>

//         </form>

//       </motion.div>


//       {/* =====================================================
//           DELETE DOCUMENT CONFIRMATION MODAL
//       ===================================================== */}

//       <AnimatePresence>

//         {documentDeleteModal &&
//           documentToDelete && (

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
//             className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
//             onClick={
//               cancelDeleteExistingDocument
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
//               transition={{
//                 duration: 0.2,
//               }}
//               onClick={(
//                 event
//               ) =>
//                 event.stopPropagation()
//               }
//               className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
//             >

//               {/* MODAL HEADER */}

//               <div className="border-b border-slate-100 px-6 py-5">

//                 <div className="flex items-start gap-4">

//                   <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50">

//                     <Trash2
//                       size={22}
//                       className="text-red-600"
//                     />

//                   </div>

//                   <div>

//                     <h3 className="text-lg font-bold text-slate-800">
//                       Delete Document?
//                     </h3>

//                     <p className="mt-1 text-sm leading-5 text-slate-500">
//                       Are you sure you want to permanently
//                       delete this document?
//                     </p>

//                   </div>

//                 </div>

//               </div>


//               {/* DOCUMENT INFO */}

//               <div className="px-6 py-5">

//                 <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

//                   <div className="flex items-center gap-3">

//                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

//                       <FileText
//                         size={18}
//                       />

//                     </div>

//                     <div className="min-w-0">

//                       <p className="truncate text-sm font-bold text-slate-700">
//                         {documentToDelete.type ||
//                           "Document"}
//                       </p>

//                       <p className="mt-1 truncate text-xs text-slate-400">
//                         {documentToDelete.number ||
//                           "No document number"}
//                       </p>

//                     </div>

//                   </div>

//                 </div>


//                 <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3">

//                   <AlertTriangle
//                     size={17}
//                     className="mt-0.5 shrink-0 text-red-500"
//                   />

//                   <p className="text-xs leading-5 text-red-700">
//                     This action cannot be undone. The
//                     document will be removed from the
//                     Vehicle, Documents and Vehicle Details
//                     sections.
//                   </p>

//                 </div>

//               </div>


//               {/* MODAL ACTIONS */}

//               <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">

//                 <button
//                   type="button"
//                   onClick={
//                     cancelDeleteExistingDocument
//                   }
//                   disabled={
//                     deletingDocument
//                   }
//                   className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   No
//                 </button>

//                 <button
//                   type="button"
//                   onClick={
//                     confirmDeleteExistingDocument
//                   }
//                   disabled={
//                     deletingDocument
//                   }
//                   className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
//                 >

//                   {deletingDocument ? (
//                     <>

//                       <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

//                       Deleting...

//                     </>
//                   ) : (
//                     <>

//                       <Trash2
//                         size={16}
//                       />

//                       Yes, Delete

//                     </>
//                   )}

//                 </button>

//               </div>

//             </motion.div>

//           </motion.div>

//         )}

//       </AnimatePresence>

//     </>
//   );
// }


// /* =========================================================
//    SECTION HEADER
// ========================================================= */

// function SectionHeader({
//   icon: Icon,
//   title,
//   subtitle,
// }) {
//   return (
//     <div className="flex items-center gap-3">

//       <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

//         <Icon
//           size={21}
//         />

//       </div>

//       <div>

//         <h3 className="font-bold text-slate-800">
//           {title}
//         </h3>

//         <p className="text-xs text-slate-500">
//           {subtitle}
//         </p>

//       </div>

//     </div>
//   );
// }


// /* =========================================================
//    INPUT FIELD
// ========================================================= */

// function InputField({
//   label,
//   name,
//   value,
//   onChange,
//   type = "text",
//   icon: Icon,
//   disabled = false,
//   required = false,
//   helper,
// }) {
//   return (
//     <div>

//       <label className="mb-2 block text-sm font-semibold text-slate-700">

//         {label}

//         {required && (
//           <span className="ml-1 text-red-500">
//             *
//           </span>
//         )}

//       </label>

//       <div className="relative">

//         {Icon && (
//           <Icon
//             size={17}
//             className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//           />
//         )}

//         <input
//           type={type}
//           name={name}
//           value={
//             value ?? ""
//           }
//           onChange={
//             onChange
//           }
//           disabled={
//             disabled
//           }
//           required={
//             required
//           }
//           className={`w-full rounded-xl border py-3 pr-4 text-sm font-medium outline-none transition ${
//             Icon
//               ? "pl-10"
//               : "pl-4"
//           } ${
//             disabled
//               ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
//               : "border-slate-200 bg-white text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
//           }`}
//         />

//       </div>

//       {helper && (
//         <p className="mt-1 text-xs text-slate-400">
//           {helper}
//         </p>
//       )}

//     </div>
//   );
// }


// /* =========================================================
//    DOCUMENT VERIFICATION STATUS
// ========================================================= */

// function DocumentVerificationStatus({
//   document,
// }) {
//   const verified =
//     document.verificationStatus ===
//     "Verified";

//   if (verified) {
//     return (
//       <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

//         <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">

//           <ShieldCheck
//             size={19}
//             className="text-emerald-600"
//           />

//         </div>

//         <div>

//           <p className="text-sm font-bold text-emerald-700">
//             Document Verified
//           </p>

//           <p className="text-xs text-emerald-600">
//             The document passed the required
//             file and information checks.
//           </p>

//         </div>

//       </div>
//     );
//   }

//   return (
//     <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

//       <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">

//         <ShieldX
//           size={19}
//           className="text-red-600"
//         />

//       </div>

//       <div>

//         <p className="text-sm font-bold text-red-700">
//           Not Verified
//         </p>

//         <p className="text-xs text-red-600">
//           {document.verificationMessage ||
//             "Add a valid document and verify it before saving."}
//         </p>

//       </div>

//     </div>
//   );
// }


// /* =========================================================
//    EXISTING DOCUMENT
// ========================================================= */

// function ExistingDocument({
//   document,
//   index,
//   onChange,
//   onFileChange,
//   onVerify,
//   onDelete,
// }) {
//   const verified =
//     document.verificationStatus ===
//     "Verified";

//   const hasFile =
//     Boolean(
//       document.fileData ||
//       document.fileUrl ||
//       document.fileName
//     );

//   const canOpenFile =
//     Boolean(
//       document.fileData ||
//       document.fileUrl
//     );

//   return (
//     <motion.div
//       initial={{
//         opacity: 0,
//         y: 10,
//       }}
//       animate={{
//         opacity: 1,
//         y: 0,
//       }}
//       className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
//     >

//       {/* HEADER */}

//       <div className="flex items-start justify-between gap-4">

//         <div className="flex items-center gap-3">

//           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

//             <FileText
//               size={19}
//             />

//           </div>

//           <div>

//             <p className="font-semibold text-slate-700">
//               Document {index + 1}
//             </p>

//             <p className="text-xs text-slate-400">
//               Existing vehicle document
//             </p>

//           </div>

//         </div>

//         <button
//           type="button"
//           onClick={() =>
//             onDelete(
//               document
//             )
//           }
//           className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
//           title="Delete document"
//         >

//           <Trash2
//             size={17}
//           />

//         </button>

//       </div>


//       {/* FIELDS */}

//       <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">


//         {/* TYPE */}

//         <div>

//           <label className="mb-2 block text-sm font-semibold text-slate-700">
//             Document Type
//           </label>

//           <select
//             value={
//               document.type ||
//               ""
//             }
//             onChange={(event) =>
//               onChange(
//                 document.id,
//                 "type",
//                 event.target.value
//               )
//             }
//             className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
//           >

//             <option value="">
//               Select Document
//             </option>

//             {documentTypes.map(
//               (type) => (
//                 <option
//                   key={type}
//                   value={type}
//                 >
//                   {type}
//                 </option>
//               )
//             )}

//           </select>

//         </div>


//         {/* NUMBER */}

//         <InputField
//           label="Document Number"
//           value={
//             document.number ||
//             ""
//           }
//           onChange={(event) =>
//             onChange(
//               document.id,
//               "number",
//               event.target.value
//             )
//           }
//           icon={Hash}
//         />


//         {/* AMOUNT */}

//         <InputField
//           label="Amount"
//           type="number"
//           value={
//             document.amount ??
//             ""
//           }
//           onChange={(event) =>
//             onChange(
//               document.id,
//               "amount",
//               event.target.value
//             )
//           }
//         />


//         {/* ISSUE DATE */}

//         <InputField
//           label="Issue Date"
//           type="date"
//           value={
//             document.issueDate ||
//             ""
//           }
//           onChange={(event) =>
//             onChange(
//               document.id,
//               "issueDate",
//               event.target.value
//             )
//           }
//           icon={Calendar}
//         />


//         {/* EXPIRY DATE */}

//         <InputField
//           label="Expiry Date"
//           type="date"
//           value={
//             document.expiry ||
//             ""
//           }
//           onChange={(event) =>
//             onChange(
//               document.id,
//               "expiry",
//               event.target.value
//             )
//           }
//           icon={Calendar}
//         />


//         {/* FILE */}

//         <div>

//           <label className="mb-2 block text-sm font-semibold text-slate-700">
//             Replace Document File
//           </label>

//           <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-blue-400 hover:bg-blue-50">

//             <Upload
//               size={17}
//               className="shrink-0 text-blue-600"
//             />

//             <span className="truncate">
//               {document.fileName ||
//                 "Choose file"}
//             </span>

//             <input
//               type="file"
//               className="hidden"
//               accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
//               onChange={(event) =>
//                 onFileChange(
//                   document.id,
//                   event
//                 )
//               }
//             />

//           </label>

//         </div>

//       </div>


//       {/* FILE INFORMATION */}

//       {hasFile && (
//         <button
//           type="button"
//           className={`mt-4 flex w-full items-center gap-2 rounded-xl bg-white px-4 py-3 text-left text-sm font-medium text-slate-600 ${
//             canOpenFile
//               ? "cursor-pointer transition hover:bg-blue-50"
//               : "cursor-default"
//           }`}
//           onClick={() => {
//             if (canOpenFile) {
//               openDocumentFile(
//                 document
//               );
//             }
//           }}
//           title={
//             canOpenFile
//               ? "Click to open document"
//               : "Document file is not available to open"
//           }
//         >

//           <FileText
//             size={17}
//             className="shrink-0 text-blue-600"
//           />

//           <span className="truncate">
//             {document.fileName}
//           </span>

//           {canOpenFile && (
//             <ExternalLink
//               size={15}
//               className="ml-auto shrink-0 text-blue-500"
//             />
//           )}

//         </button>
//       )}


//       {/* VERIFY BUTTON */}

//       <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">

//         <div>

//           <p className="text-sm font-semibold text-slate-700">
//             Document Verification
//           </p>

//           <p className="mt-1 text-xs text-slate-400">
//             Verify the document before saving changes.
//           </p>

//         </div>

//         <button
//           type="button"
//           onClick={() =>
//             onVerify(
//               document
//             )
//           }
//           className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
//             verified
//               ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
//               : "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
//           }`}
//         >

//           {verified ? (
//             <>

//               <CheckCircle2
//                 size={17}
//               />

//               Verified

//             </>
//           ) : (
//             <>

//               <ShieldCheck
//                 size={17}
//               />

//               Verify Document

//             </>
//           )}

//         </button>

//       </div>


//       {/* STATUS */}

//       <DocumentVerificationStatus
//         document={
//           document
//         }
//       />

//     </motion.div>
//   );
// }


// /* =========================================================
//    NEW DOCUMENT
// ========================================================= */

// function NewDocument({
//   document,
//   index,
//   onChange,
//   onFileChange,
//   onVerify,
//   onRemove,
// }) {
//   const verified =
//     document.verificationStatus ===
//     "Verified";

//   const hasFile =
//     Boolean(
//       document.fileData ||
//       document.fileUrl ||
//       document.fileName
//     );

//   const canOpenFile =
//     Boolean(
//       document.fileData ||
//       document.fileUrl
//     );

//   return (
//     <motion.div
//       initial={{
//         opacity: 0,
//         y: 10,
//       }}
//       animate={{
//         opacity: 1,
//         y: 0,
//       }}
//       className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5"
//     >

//       {/* HEADER */}

//       <div className="flex items-center justify-between">

//         <div className="flex items-center gap-3">

//           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

//             <Plus
//               size={19}
//             />

//           </div>

//           <div>

//             <p className="font-semibold text-slate-700">
//               New Document {index + 1}
//             </p>

//             <p className="text-xs text-slate-400">
//               Add a new vehicle document
//             </p>

//           </div>

//         </div>

//         <button
//           type="button"
//           onClick={() =>
//             onRemove(index)
//           }
//           className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
//           title="Remove document"
//         >

//           <Trash2
//             size={17}
//           />

//         </button>

//       </div>


//       {/* FIELDS */}

//       <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">


//         {/* TYPE */}

//         <div>

//           <label className="mb-2 block text-sm font-semibold text-slate-700">
//             Document Type
//           </label>

//           <select
//             value={
//               document.type ||
//               ""
//             }
//             onChange={(event) =>
//               onChange(
//                 index,
//                 "type",
//                 event.target.value
//               )
//             }
//             className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
//           >

//             <option value="">
//               Select Document
//             </option>

//             {documentTypes.map(
//               (type) => (
//                 <option
//                   key={type}
//                   value={type}
//                 >
//                   {type}
//                 </option>
//               )
//             )}

//           </select>

//         </div>


//         {/* NUMBER */}

//         <InputField
//           label="Document Number"
//           value={
//             document.number ||
//             ""
//           }
//           onChange={(event) =>
//             onChange(
//               index,
//               "number",
//               event.target.value
//             )
//           }
//           icon={Hash}
//         />


//         {/* AMOUNT */}

//         <InputField
//           label="Amount"
//           type="number"
//           value={
//             document.amount ??
//             ""
//           }
//           onChange={(event) =>
//             onChange(
//               index,
//               "amount",
//               event.target.value
//             )
//           }
//         />


//         {/* ISSUE */}

//         <InputField
//           label="Issue Date"
//           type="date"
//           value={
//             document.issueDate ||
//             ""
//           }
//           onChange={(event) =>
//             onChange(
//               index,
//               "issueDate",
//               event.target.value
//             )
//           }
//           icon={Calendar}
//         />


//         {/* EXPIRY */}

//         <InputField
//           label="Expiry Date"
//           type="date"
//           value={
//             document.expiry ||
//             ""
//           }
//           onChange={(event) =>
//             onChange(
//               index,
//               "expiry",
//               event.target.value
//             )
//           }
//           icon={Calendar}
//         />


//         {/* FILE */}

//         <div>

//           <label className="mb-2 block text-sm font-semibold text-slate-700">
//             Upload File
//           </label>

//           <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-blue-400 hover:bg-blue-50">

//             <Upload
//               size={17}
//               className="shrink-0 text-blue-600"
//             />

//             <span className="truncate">
//               {document.fileName ||
//                 "Choose file"}
//             </span>

//             <input
//               type="file"
//               className="hidden"
//               accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
//               onChange={(event) =>
//                 onFileChange(
//                   index,
//                   event
//                 )
//               }
//             />

//           </label>

//         </div>

//       </div>


//       {/* FILE */}

//       {hasFile && (
//         <button
//           type="button"
//           className={`mt-4 flex w-full items-center gap-2 rounded-xl bg-white px-4 py-3 text-left text-sm font-medium text-slate-600 ${
//             canOpenFile
//               ? "cursor-pointer transition hover:bg-blue-50"
//               : "cursor-default"
//           }`}
//           onClick={() => {
//             if (canOpenFile) {
//               openDocumentFile(
//                 document
//               );
//             }
//           }}
//           title={
//             canOpenFile
//               ? "Click to open document"
//               : "Document file is not available to open"
//           }
//         >

//           <FileText
//             size={17}
//             className="shrink-0 text-blue-600"
//           />

//           <span className="truncate">
//             {document.fileName}
//           </span>

//           {canOpenFile && (
//             <ExternalLink
//               size={15}
//               className="ml-auto shrink-0 text-blue-500"
//             />
//           )}

//         </button>
//       )}


//       {/* VERIFY */}

//       <div className="mt-5 flex flex-col gap-3 border-t border-blue-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

//         <div>

//           <p className="text-sm font-semibold text-slate-700">
//             Document Verification
//           </p>

//           <p className="mt-1 text-xs text-slate-400">
//             Verify this document before saving.
//           </p>

//         </div>

//         <button
//           type="button"
//           onClick={() =>
//             onVerify(index)
//           }
//           className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
//             verified
//               ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
//               : "bg-blue-600 text-white hover:bg-blue-700"
//           }`}
//         >

//           {verified ? (
//             <>

//               <CheckCircle2
//                 size={17}
//               />

//               Verified

//             </>
//           ) : (
//             <>

//               <ShieldCheck
//                 size={17}
//               />

//               Verify Document

//             </>
//           )}

//         </button>

//       </div>


//       {/* STATUS */}

//       <DocumentVerificationStatus
//         document={
//           document
//         }
//       />

//     </motion.div>
//   );
// }











import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  ArrowLeft,
  Save,
  X,
  Truck,
  Car,
  Bus,
  FileText,
  Upload,
  Trash2,
  Plus,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Hash,
  Settings,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldX,
  ExternalLink,
  Pencil,
  ChevronDown,
  Search,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import PageHeader from "../components/PageHeader";

import {
  useFleet,
  parseDate,
} from "../context/fleetContext";


/* =========================================================
   EMPTY DOCUMENT
========================================================= */

const emptyDocument = {
  type: "",
  number: "",
  issueDate: "",
  expiry: "",
  amount: "",
  fileName: "",
  fileData: "",
  fileType: "",
  fileSize: 0,

  verificationStatus:
    "Not Verified",

  verificationMessage:
    "Add a valid document and verify it before saving.",

  verifiedAt: "",
};


/* =========================================================
   DOCUMENT TYPES
========================================================= */

const documentTypes = [
  "Registration Certificate",
  "Insurance",
  "PUC Certificate",
  "Fitness Certificate",
  "State Permit",
  "National Permit",
  "Road Tax",
  "Fine Challan",
  "Other",
];


/* =========================================================
   ALLOWED FILE TYPES
========================================================= */

const allowedFileExtensions = [
  "pdf",
  "jpg",
  "jpeg",
  "png",
];

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];


/* =========================================================
   MAX FILE SIZE
   5 MB
========================================================= */

const MAX_FILE_SIZE =
  5 * 1024 * 1024;


/* =========================================================
   NORMALIZE VEHICLE NUMBER
========================================================= */

function normalizeVehicleNumber(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}


/* =========================================================
   DATE FOR INPUT
========================================================= */

function toInputDate(value) {
  if (!value) {
    return "";
  }

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return value;
  }

  const date =
    parseDate(value);

  if (!date) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/* =========================================================
   OPEN DOCUMENT FILE
   FIX FOR:
   "Not allowed to navigate top frame to data URL"

   DATA URL
      ↓
   BLOB
      ↓
   OBJECT URL
      ↓
   NEW TAB
========================================================= */

async function openDocumentFile(document) {
  if (!document) {
    return;
  }

  const fileSource =
    document.fileData ||
    document.fileUrl;

  if (!fileSource) {
    console.warn(
      "No document file source found."
    );

    return;
  }

  try {
    /*
     * -------------------------------------------------------
     * CASE 1:
     * Data URL
     *
     * Example:
     * data:application/pdf;base64,JVBERi0xLjQ...
     *
     * Chrome may block directly opening this using
     * window.open().
     *
     * Therefore convert it into a Blob URL first.
     * -------------------------------------------------------
     */

    if (
      typeof fileSource === "string" &&
      fileSource.startsWith("data:")
    ) {
      const response =
        await fetch(fileSource);

      if (!response.ok) {
        throw new Error(
          "Unable to read document data."
        );
      }

      const blob =
        await response.blob();

      const blobUrl =
        URL.createObjectURL(blob);

      /*
       * Open the blank tab FIRST.
       *
       * This reduces the chance of popup blockers
       * because the function is triggered by a user click.
       */

      const newWindow =
        window.open(
          "",
          "_blank"
        );

      if (newWindow) {
        /*
         * Navigate the already-created tab
         * to the Blob URL.
         */

        newWindow.location.href =
          blobUrl;

        /*
         * Do NOT revoke immediately.
         *
         * The browser needs some time to load
         * the PDF/image from the Blob URL.
         */

        setTimeout(() => {
          URL.revokeObjectURL(
            blobUrl
          );
        }, 60 * 1000);

        return;
      }

      /*
       * Popup was blocked.
       *
       * Use a temporary anchor as fallback.
       */

      const link =
        document_createElement_safe(
          "a"
        );

      link.href =
        blobUrl;

      link.target =
        "_blank";

      link.rel =
        "noopener noreferrer";

      link.click();

      setTimeout(() => {
        URL.revokeObjectURL(
          blobUrl
        );
      }, 60 * 1000);

      return;
    }


    /*
     * -------------------------------------------------------
     * CASE 2:
     * Blob URL
     *
     * If the document is already stored as a Blob URL,
     * open it directly.
     * -------------------------------------------------------
     */

    if (
      typeof fileSource === "string" &&
      fileSource.startsWith("blob:")
    ) {
      const newWindow =
        window.open(
          fileSource,
          "_blank",
          "noopener,noreferrer"
        );

      if (!newWindow) {
        const link =
          document_createElement_safe(
            "a"
          );

        link.href =
          fileSource;

        link.target =
          "_blank";

        link.rel =
          "noopener noreferrer";

        link.click();
      }

      return;
    }


    /*
     * -------------------------------------------------------
     * CASE 3:
     * Normal HTTP / HTTPS URL
     *
     * Example:
     * https://example.com/document.pdf
     * -------------------------------------------------------
     */

    if (
      typeof fileSource === "string" &&
      (
        fileSource.startsWith("http://") ||
        fileSource.startsWith("https://")
      )
    ) {
      const newWindow =
        window.open(
          fileSource,
          "_blank",
          "noopener,noreferrer"
        );

      if (!newWindow) {
        const link =
          document_createElement_safe(
            "a"
          );

        link.href =
          fileSource;

        link.target =
          "_blank";

        link.rel =
          "noopener noreferrer";

        link.click();
      }

      return;
    }


    /*
     * -------------------------------------------------------
     * CASE 4:
     * Unknown source
     *
     * Try opening it through a Blob URL.
     * -------------------------------------------------------
     */

    const response =
      await fetch(fileSource);

    if (!response.ok) {
      throw new Error(
        "Unable to load document."
      );
    }

    const blob =
      await response.blob();

    const blobUrl =
      URL.createObjectURL(blob);

    const newWindow =
      window.open(
        "",
        "_blank"
      );

    if (newWindow) {
      newWindow.location.href =
        blobUrl;

      setTimeout(() => {
        URL.revokeObjectURL(
          blobUrl
        );
      }, 60 * 1000);

      return;
    }

    const link =
      document_createElement_safe(
        "a"
      );

    link.href =
      blobUrl;

    link.target =
      "_blank";

    link.rel =
      "noopener noreferrer";

    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(
        blobUrl
      );
    }, 60 * 1000);

  } catch (error) {

    console.error(
      "Unable to open document:",
      error
    );

    /*
     * Last fallback:
     * Try direct navigation only when the source
     * is not a data URL.
     */

    if (
      typeof fileSource === "string" &&
      !fileSource.startsWith("data:")
    ) {
      try {
        const newWindow =
          window.open(
            fileSource,
            "_blank",
            "noopener,noreferrer"
          );

        if (!newWindow) {
          window.location.href =
            fileSource;
        }
      } catch (fallbackError) {
        console.error(
          "Document fallback failed:",
          fallbackError
        );
      }
    } else {
      alert(
        "Unable to open this document. Please upload the document again."
      );
    }
  }
}


/* =========================================================
   SAFE CREATE ELEMENT
   Used only for fallback anchor creation.

   Keeping this separate prevents confusion between:
   - React document objects
   - Browser document object
========================================================= */

function document_createElement_safe(tagName) {
  if (
    typeof window === "undefined" ||
    !window.document
  ) {
    throw new Error(
      "Browser document is not available."
    );
  }

  return window.document.createElement(
    tagName
  );
}


/* =========================================================
   EDIT VEHICLE
========================================================= */

export default function EditVehicle() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();


  /* =======================================================
     FLEET CONTEXT
  ======================================================= */

  const {
    vehicles,
    documents,
    updateVehicle,
    updateDocument,
    addDocument,
    deleteDocument,
    notify,
  } = useFleet();


  /* =======================================================
     FIND VEHICLE
  ======================================================= */

  const vehicle =
    vehicles.find(
      (item) =>
        String(item.id) ===
        String(id)
    );


  /* =======================================================
     VEHICLE FORM
  ======================================================= */

  const [
    form,
    setForm,
  ] = useState({});


  /* =======================================================
     EXISTING DOCUMENTS
  ======================================================= */

  const [
    vehicleDocuments,
    setVehicleDocuments,
  ] = useState([]);


  /* =======================================================
     NEW INLINE DOCUMENTS
  ======================================================= */

  const [
    newDocuments,
    setNewDocuments,
  ] = useState([]);


  /* =======================================================
     DOCUMENT DELETE MODAL
  ======================================================= */

  const [
    documentDeleteModal,
    setDocumentDeleteModal,
  ] = useState(false);

  const [
    documentToDelete,
    setDocumentToDelete,
  ] = useState(null);

  const [
    deletingDocument,
    setDeletingDocument,
  ] = useState(false);


  /* =======================================================
     SAVING
  ======================================================= */

  const [
    saving,
    setSaving,
  ] = useState(false);


  /* =======================================================
     LOAD VEHICLE
  ======================================================= */

  useEffect(() => {
    if (!vehicle) {
      return;
    }

    setForm({
      ...vehicle,

      registrationDate:
        toInputDate(
          vehicle.registrationDate
        ),
    });

    const normalizedVehicleNumber =
      normalizeVehicleNumber(
        vehicle.number
      );

    const vehicleDocs =
      documents.filter(
        (document) =>
          normalizeVehicleNumber(
            document.vehicle
          ) ===
          normalizedVehicleNumber
      );

    setVehicleDocuments(
      vehicleDocs.map(
        (document) => ({
          ...document,

          issueDate:
            toInputDate(
              document.issueDate
            ),

          expiry:
            toInputDate(
              document.expiry
            ),

          verificationStatus:
            document.verificationStatus ||
            (
              document.fileData ||
              document.fileUrl ||
              document.fileName
            )
              ? "Verified"
              : "Not Verified",

          verificationMessage:
            document.verificationMessage ||
            "",

          verifiedAt:
            document.verifiedAt ||
            "",
        })
      )
    );

  }, [
    vehicle,
    documents,
  ]);


  /* =======================================================
     VEHICLE NOT FOUND
  ======================================================= */

  if (!vehicle) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">

          <Truck
            size={50}
            className="mx-auto mb-4 text-slate-300"
          />

          <h2 className="text-xl font-bold text-slate-700">
            Vehicle Not Found
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate("/vehicles")
            }
            className="mt-4 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Vehicles
          </button>

        </div>
      </div>
    );
  }


  /* =======================================================
     VEHICLE ICON
  ======================================================= */

  const vehicleType =
    form.type
      ?.toLowerCase()
      ?.trim() || "";

  const VehicleIcon =
    vehicleType === "car"
      ? Car
      : vehicleType === "bus"
      ? Bus
      : Truck;


  /* =======================================================
     VEHICLE CHANGE
  ======================================================= */

  const handleChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setForm(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );
    };


  /* =======================================================
     DOCUMENT CHANGE
  ======================================================= */

  const handleDocumentChange =
    (
      documentId,
      field,
      value
    ) => {
      setVehicleDocuments(
        (previous) =>
          previous.map(
            (document) =>
              String(document.id) ===
              String(documentId)
                ? {
                    ...document,

                    [field]:
                      value,

                    verificationStatus:
                      "Not Verified",

                    verificationMessage:
                      "Document details changed. Please verify the document again.",

                    verifiedAt:
                      "",
                  }
                : document
          )
      );
    };


  /* =======================================================
     NEW DOCUMENT CHANGE
  ======================================================= */

  const handleNewDocumentChange =
    (
      index,
      field,
      value
    ) => {
      setNewDocuments(
        (previous) =>
          previous.map(
            (
              document,
              documentIndex
            ) =>
              documentIndex ===
              index
                ? {
                    ...document,

                    [field]:
                      value,

                    verificationStatus:
                      "Not Verified",

                    verificationMessage:
                      "Document details changed. Please verify the document again.",

                    verifiedAt:
                      "",
                  }
                : document
          )
      );
    };


  /* =======================================================
     FILE TO DATA URL
  ======================================================= */

  const fileToDataURL =
    (file) => {
      return new Promise(
        (
          resolve,
          reject
        ) => {
          const reader =
            new FileReader();

          reader.onload =
            () =>
              resolve(
                reader.result
              );

          reader.onerror =
            reject;

          reader.readAsDataURL(
            file
          );
        }
      );
    };


  /* =======================================================
     VALIDATE FILE
  ======================================================= */

  const validateFile =
    (file) => {
      if (!file) {
        return {
          valid: false,
          message:
            "Please add a document file first.",
        };
      }

      if (
        file.size >
        MAX_FILE_SIZE
      ) {
        return {
          valid: false,
          message:
            "File size must be 5 MB or less.",
        };
      }

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase();

      if (
        !allowedFileExtensions.includes(
          extension
        )
      ) {
        return {
          valid: false,
          message:
            "Add a valid PDF, JPG, JPEG or PNG document.",
        };
      }

      if (
        file.type &&
        !allowedMimeTypes.includes(
          file.type
        )
      ) {
        return {
          valid: false,
          message:
            "The selected file type is not supported. Please upload PDF, JPG, JPEG or PNG.",
        };
      }

      return {
        valid: true,
        message:
          "File format is valid.",
      };
    };


  /* =======================================================
     EXISTING DOCUMENT FILE
  ======================================================= */

  const handleExistingDocumentFile =
    async (
      documentId,
      event
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      const fileValidation =
        validateFile(file);

      if (
        !fileValidation.valid
      ) {
        notify(
          fileValidation.message,
          "error"
        );

        event.target.value =
          "";

        return;
      }

      try {
        const data =
          await fileToDataURL(
            file
          );

        setVehicleDocuments(
          (previous) =>
            previous.map(
              (document) =>
                String(document.id) ===
                String(documentId)
                  ? {
                      ...document,

                      fileName:
                        file.name,

                      fileData:
                        data,

                      fileType:
                        file.type,

                      fileSize:
                        file.size,

                      verificationStatus:
                        "Not Verified",

                      verificationMessage:
                        "New file added. Please verify this document.",

                      verifiedAt:
                        "",
                    }
                  : document
            )
        );

        notify(
          "Document file added. Please verify it before saving.",
          "warning"
        );

      } catch (error) {
        console.error(
          "File error:",
          error
        );

        notify(
          "Unable to upload file.",
          "error"
        );
      }
    };


  /* =======================================================
     NEW DOCUMENT FILE
  ======================================================= */

  const handleNewDocumentFile =
    async (
      index,
      event
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      const fileValidation =
        validateFile(file);

      if (
        !fileValidation.valid
      ) {
        notify(
          fileValidation.message,
          "error"
        );

        event.target.value =
          "";

        return;
      }

      try {
        const data =
          await fileToDataURL(
            file
          );

        setNewDocuments(
          (previous) =>
            previous.map(
              (
                document,
                documentIndex
              ) =>
                documentIndex ===
                index
                  ? {
                      ...document,

                      fileName:
                        file.name,

                      fileData:
                        data,

                      fileType:
                        file.type,

                      fileSize:
                        file.size,

                      verificationStatus:
                        "Not Verified",

                      verificationMessage:
                        "New file added. Please verify this document.",

                      verifiedAt:
                        "",
                    }
                  : document
            )
        );

        notify(
          "Document file added. Please verify it before saving.",
          "warning"
        );

      } catch (error) {
        console.error(
          "File error:",
          error
        );

        notify(
          "Unable to upload file.",
          "error"
        );
      }
    };


  /* =======================================================
     DOCUMENT VERIFICATION
  ======================================================= */

  const verifyDocument =
    (document) => {

      if (
        !document.type
      ) {
        return {
          valid: false,
          message:
            "Please select the document type.",
        };
      }

      if (
        !document.number ||
        !String(
          document.number
        ).trim()
      ) {
        return {
          valid: false,
          message:
            "Please enter the document number.",
        };
      }

      if (
        !document.expiry
      ) {
        return {
          valid: false,
          message:
            "Please enter the document expiry date.",
        };
      }

      const expiryDate =
        parseDate(
          document.expiry
        );

      if (!expiryDate) {
        return {
          valid: false,
          message:
            "Please enter a valid expiry date.",
        };
      }

      if (
        !document.fileData &&
        !document.fileUrl &&
        !document.fileName
      ) {
        return {
          valid: false,
          message:
            "Please add a document file first.",
        };
      }

      if (
        document.fileName
      ) {
        const extension =
          document.fileName
            .split(".")
            .pop()
            ?.toLowerCase();

        if (
          !allowedFileExtensions.includes(
            extension
          )
        ) {
          return {
            valid: false,
            message:
              "Add a valid PDF, JPG, JPEG or PNG document.",
          };
        }
      }

      if (
        document.fileSize &&
        document.fileSize >
          MAX_FILE_SIZE
      ) {
        return {
          valid: false,
          message:
            "File size must be 5 MB or less.",
        };
      }

      return {
        valid: true,

        message:
          "Document verified successfully.",

        verifiedAt:
          new Date().toISOString(),
      };
    };


  /* =======================================================
     VERIFY EXISTING DOCUMENT
  ======================================================= */

  const verifyExistingDocument =
    (document) => {

      const result =
        verifyDocument(
          document
        );

      setVehicleDocuments(
        (previous) =>
          previous.map(
            (item) =>
              String(item.id) ===
              String(document.id)
                ? {
                    ...item,

                    verificationStatus:
                      result.valid
                        ? "Verified"
                        : "Not Verified",

                    verificationMessage:
                      result.message,

                    verifiedAt:
                      result.valid
                        ? result.verifiedAt
                        : "",
                  }
                : item
          )
      );

      if (
        result.valid
      ) {
        notify(
          "Document verified successfully"
        );
      } else {
        notify(
          result.message,
          "error"
        );
      }
    };


  /* =======================================================
     VERIFY NEW DOCUMENT
  ======================================================= */

  const verifyNewDocument =
    (index) => {

      const document =
        newDocuments[index];

      const result =
        verifyDocument(
          document
        );

      setNewDocuments(
        (previous) =>
          previous.map(
            (
              item,
              documentIndex
            ) =>
              documentIndex ===
              index
                ? {
                    ...item,

                    verificationStatus:
                      result.valid
                        ? "Verified"
                        : "Not Verified",

                    verificationMessage:
                      result.message,

                    verifiedAt:
                      result.valid
                        ? result.verifiedAt
                        : "",
                  }
                : item
          )
      );

      if (
        result.valid
      ) {
        notify(
          "Document verified successfully"
        );
      } else {
        notify(
          result.message,
          "error"
        );
      }
    };


  /* =======================================================
     ADD NEW DOCUMENT ROW
  ======================================================= */

  const addNewDocumentRow =
    () => {
      setNewDocuments(
        (previous) => [
          ...previous,
          {
            ...emptyDocument,
          },
        ]
      );
    };


  /* =======================================================
     REMOVE NEW DOCUMENT
  ======================================================= */

  const removeNewDocument =
    (index) => {
      setNewDocuments(
        (previous) =>
          previous.filter(
            (
              _,
              documentIndex
            ) =>
              documentIndex !==
              index
          )
      );
    };


  /* =======================================================
     OPEN DELETE DOCUMENT MODAL
  ======================================================= */

  const removeExistingDocument =
    (document) => {

      if (
        !document?.id
      ) {
        return;
      }

      setDocumentToDelete(
        document
      );

      setDocumentDeleteModal(
        true
      );
    };


  /* =======================================================
     CONFIRM DOCUMENT DELETE
  ======================================================= */

  const confirmDeleteExistingDocument =
    async () => {

      if (
        !documentToDelete?.id ||
        deletingDocument
      ) {
        return;
      }

      try {
        setDeletingDocument(
          true
        );

        const result =
          deleteDocument(
            documentToDelete.id
          );

        if (
          result?.success === false
        ) {
          throw new Error(
            result.message ||
            "Unable to delete document."
          );
        }

        setVehicleDocuments(
          (previous) =>
            previous.filter(
              (document) =>
                String(document.id) !==
                String(
                  documentToDelete.id
                )
            )
        );

        setDocumentDeleteModal(
          false
        );

        setDocumentToDelete(
          null
        );

        notify(
          "Document deleted successfully.",
          "success"
        );

      } catch (error) {

        console.error(
          "Document delete error:",
          error
        );

        notify(
          "Unable to delete document.",
          "error"
        );

      } finally {

        setDeletingDocument(
          false
        );
      }
    };


  /* =======================================================
     CANCEL DOCUMENT DELETE
  ======================================================= */

  const cancelDeleteExistingDocument =
    () => {

      if (
        deletingDocument
      ) {
        return;
      }

      setDocumentDeleteModal(
        false
      );

      setDocumentToDelete(
        null
      );
    };


  /* =======================================================
     OPEN ADD DOCUMENT PAGE
  ======================================================= */

  const addDocumentUrl =
    `/documents/add?vehicle=${encodeURIComponent(
      vehicle.number
    )}&vehicleId=${vehicle.id}&returnTo=${encodeURIComponent(
      `/vehicles/${vehicle.id}/edit`
    )}`;


  /* =======================================================
     SAVE VEHICLE
  ======================================================= */

  const handleSave =
    async (event) => {

      event.preventDefault();

      if (saving) {
        return;
      }


      /* ===================================================
         VEHICLE VALIDATION
      =================================================== */

      if (
        !form.brand ||
        !form.model ||
        !form.type
      ) {
        notify(
          "Please fill all required vehicle details.",
          "error"
        );

        return;
      }


      /* ===================================================
         EXISTING DOCUMENT VALIDATION
      =================================================== */

      const unverifiedExisting =
        vehicleDocuments.filter(
          (document) =>
            document.verificationStatus !==
            "Verified"
        );

      if (
        unverifiedExisting.length >
        0
      ) {
        notify(
          "Please verify all uploaded documents before saving.",
          "error"
        );

        return;
      }


      /* ===================================================
         INLINE NEW DOCUMENTS
      =================================================== */

      const validNewDocuments =
        newDocuments.filter(
          (document) =>
            document.type ||
            document.number ||
            document.expiry ||
            document.fileName ||
            document.fileData
        );

      const incompleteNewDocuments =
        validNewDocuments.filter(
          (document) =>
            !document.type ||
            !document.number ||
            !document.expiry ||
            !document.fileName
        );

      if (
        incompleteNewDocuments.length >
        0
      ) {
        notify(
          "Please complete all new document details and upload a file.",
          "error"
        );

        return;
      }

      const unverifiedNew =
        validNewDocuments.filter(
          (document) =>
            document.verificationStatus !==
            "Verified"
        );

      if (
        unverifiedNew.length >
        0
      ) {
        notify(
          "Please verify all new documents before saving.",
          "error"
        );

        return;
      }

      setSaving(true);

      try {

        /* =================================================
           UPDATE VEHICLE
        ================================================= */

        const vehicleResult =
          updateVehicle(
            vehicle.id,
            {
              ...form,

              number:
                vehicle.number,
            }
          );

        if (
          vehicleResult?.success === false
        ) {
          setSaving(false);
          return;
        }


        /* =================================================
           UPDATE EXISTING DOCUMENTS
        ================================================= */

        for (
          const document
          of vehicleDocuments
        ) {

          const result =
            updateDocument(
              document.id,

              {
                ...document,

                vehicle:
                  vehicle.number,

                verificationStatus:
                  "Verified",

                verificationMessage:
                  document.verificationMessage ||
                  "Document verified successfully.",

                verifiedAt:
                  document.verifiedAt ||
                  new Date().toISOString(),
              }
            );

          if (
            result?.success === false
          ) {
            throw new Error(
              "Unable to update document."
            );
          }
        }


        /* =================================================
           ADD NEW DOCUMENTS
        ================================================= */

        for (
          const document
          of validNewDocuments
        ) {

          const result =
            addDocument({
              ...document,

              vehicle:
                vehicle.number,

              verificationStatus:
                "Verified",

              verificationMessage:
                document.verificationMessage ||
                "Document verified successfully.",

              verifiedAt:
                document.verifiedAt ||
                new Date().toISOString(),

              createdAt:
                new Date().toISOString(),
            });

          if (
            result?.success === false
          ) {
            throw new Error(
              "Unable to add document."
            );
          }
        }


        notify(
          "Vehicle details updated successfully"
        );


        /* =================================================
           GO TO VEHICLE DETAILS
        ================================================= */

        setTimeout(() => {
          navigate(
            `/vehicles/${vehicle.id}`
          );
        }, 500);

      } catch (error) {

        console.error(
          "Update vehicle error:",
          error
        );

        notify(
          "Unable to update vehicle.",
          "error"
        );

        setSaving(false);
      }
    };


  /* =======================================================
     CANCEL
  ======================================================= */

  const handleCancel =
    () => {
      navigate(
        `/vehicles/${vehicle.id}`
      );
    };


  /* =======================================================
     RETURN UI
  ======================================================= */

  return (
    <>
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
          duration: 0.35,
        }}
        className="pb-10"
      >

        {/* =================================================
            BACK
        ================================================= */}

        <button
          type="button"
          onClick={
            handleCancel
          }
          className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft
            size={17}
          />

          Back to Vehicle Details
        </button>


        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <PageHeader
          title={
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200">
                <Pencil
                  size={21}
                />
              </div>

              <div>
                Edit Vehicle
              </div>

            </div>
          }
          subtitle={`Update vehicle information • ${vehicle.number}`}
        />


        <form
          onSubmit={
            handleSave
          }
          className="mt-6 space-y-6"
        >


          {/* =================================================
              VEHICLE INFORMATION
          ================================================= */}

          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

            <SectionHeader
              icon={VehicleIcon}
              title="Vehicle Information"
              subtitle="Update the basic vehicle information"
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              <InputField
                label="Vehicle Number"
                name="number"
                value={
                  vehicle.number
                }
                disabled
                required
                icon={Hash}
                helper="Vehicle number cannot be changed"
              />

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">

                  Vehicle Type

                  <span className="ml-1 text-red-500">
                    *
                  </span>

                </label>

                <SearchableDropdown
                  value={form.type || ""}
                  onChange={(value) =>
                    setForm((previous) => ({
                      ...previous,
                      type: value,
                    }))
                  }
                  options={[
                    "Car",
                    "Truck",
                    "Bus",
                    "Other",
                  ]}
                  placeholder="Select Vehicle Type"
                  icon={VehicleIcon}
                  required
                />

              </div>


              <InputField
                label="Brand"
                name="brand"
                value={
                  form.brand ||
                  ""
                }
                onChange={
                  handleChange
                }
                icon={Building2}
                required
              />

              <InputField
                label="Model"
                name="model"
                value={
                  form.model ||
                  ""
                }
                onChange={
                  handleChange
                }
                icon={Car}
                required
              />

              <InputField
                label="Manufacturing Year"
                name="year"
                type="number"
                value={
                  form.year ||
                  ""
                }
                onChange={
                  handleChange
                }
                icon={Calendar}
              />

              <InputField
                label="Registration Date"
                name="registrationDate"
                type="date"
                value={
                  form.registrationDate ||
                  ""
                }
                onChange={
                  handleChange
                }
                icon={Calendar}
              />

              <InputField
                label="Chassis Number"
                name="chassis"
                value={
                  form.chassis ||
                  ""
                }
                onChange={
                  handleChange
                }
                icon={Hash}
              />

              <InputField
                label="Engine Number"
                name="engine"
                value={
                  form.engine ||
                  ""
                }
                onChange={
                  handleChange
                }
                icon={Settings}
              />


              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Vehicle Status
                </label>

                <SearchableDropdown
                  value={form.status || "Active"}
                  onChange={(value) =>
                    setForm((previous) => ({
                      ...previous,
                      status: value,
                    }))
                  }
                  options={[
                    "Active",
                    "Inactive",
                    "Maintenance",
                  ]}
                  placeholder="Select Vehicle Status"
                />

              </div>

            </div>

          </section>


          {/* =================================================
              OWNER DETAILS
          ================================================= */}

          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

            <SectionHeader
              icon={User}
              title="Owner Details"
              subtitle="Update the vehicle owner's information"
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              <InputField
                label="Owner Name"
                name="owner"
                value={
                  form.owner ||
                  ""
                }
                onChange={
                  handleChange
                }
                icon={User}
              />

              <InputField
                label="Mobile Number"
                name="mobile"
                value={
                  form.mobile ||
                  ""
                }
                onChange={
                  handleChange
                }
                icon={Phone}
                type="tel"
              />

              <InputField
                label="Email Address"
                name="email"
                value={
                  form.email ||
                  ""
                }
                onChange={
                  handleChange
                }
                icon={Mail}
                type="email"
              />

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Owner Address
                </label>

                <div className="relative">

                  <MapPin
                    size={17}
                    className="absolute left-3 top-4 text-slate-400"
                  />

                  <textarea
                    name="address"
                    value={
                      form.address ||
                      ""
                    }
                    onChange={
                      handleChange
                    }
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    placeholder="Enter owner address"
                  />

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              UPLOADED DOCUMENTS
          ================================================= */}

          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

            <SectionHeader
              icon={FileText}
              title="Uploaded Documents"
              subtitle="Edit, replace and verify previously uploaded documents"
            />

            <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4">

              <div className="flex items-start gap-3">

                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-amber-600"
                />

                <div>

                  <p className="text-sm font-semibold text-amber-800">
                    Document verification required
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    If you replace or change a document,
                    click <b>Verify Document</b> before
                    saving the vehicle.
                  </p>

                </div>

              </div>

            </div>


            {vehicleDocuments.length ===
            0 ? (

              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">

                <FileText
                  size={35}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 font-semibold text-slate-600">
                  No documents found
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Add a new document using the
                  Add Document page below.
                </p>

                <Link
                  to={
                    addDocumentUrl
                  }
                  className="mx-auto mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Plus
                    size={17}
                  />

                  Add Document

                  <ExternalLink
                    size={15}
                  />
                </Link>

              </div>

            ) : (

              <div className="mt-6 space-y-5">

                {vehicleDocuments.map(
                  (
                    document,
                    index
                  ) => (

                    <ExistingDocument
                      key={
                        document.id
                      }
                      document={
                        document
                      }
                      index={
                        index
                      }
                      onChange={
                        handleDocumentChange
                      }
                      onFileChange={
                        handleExistingDocumentFile
                      }
                      onVerify={
                        verifyExistingDocument
                      }
                      onDelete={
                        removeExistingDocument
                      }
                    />

                  )
                )}

              </div>

            )}

          </section>


          {/* =================================================
              ADD NEW DOCUMENTS
          ================================================= */}

          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

              <SectionHeader
                icon={Plus}
                title="Add New Documents"
                subtitle="Add documents that were not previously entered"
              />

              <Link
                to={
                  addDocumentUrl
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >

                <Plus
                  size={17}
                />

                Add Document

                <ExternalLink
                  size={15}
                />

              </Link>

            </div>


            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">

              <div className="flex items-start gap-3">

                <FileText
                  size={20}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>

                  <p className="text-sm font-semibold text-blue-800">
                    Add document from the Document page
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-600">
                    Use the button below to open the
                    Add Document page. The current
                    vehicle number will be passed to
                    that page.
                  </p>

                  <Link
                    to={
                      addDocumentUrl
                    }
                    className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900"
                  >

                    Open Add Document page

                    <ExternalLink
                      size={14}
                    />

                  </Link>

                </div>

              </div>

            </div>


            {/* <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">

              <div>

                <p className="text-sm font-semibold text-slate-700">
                  Add document here
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  You can also add a document
                  directly without leaving this page.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  addNewDocumentRow
                }
                className="flex shrink-0 items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
              >

                <Plus
                  size={17}
                />

                Add Here

              </button>

            </div> */}


            {newDocuments.length >
              0 && (

              <div className="mt-6 space-y-5">

                {newDocuments.map(
                  (
                    document,
                    index
                  ) => (

                    <NewDocument
                      key={
                        index
                      }
                      document={
                        document
                      }
                      index={
                        index
                      }
                      onChange={
                        handleNewDocumentChange
                      }
                      onFileChange={
                        handleNewDocumentFile
                      }
                      onVerify={
                        verifyNewDocument
                      }
                      onRemove={
                        removeNewDocument
                      }
                    />

                  )
                )}

              </div>

            )}

          </section>


          {/* =================================================
              SAVE BAR
          ================================================= */}

          <div className="sticky bottom-4 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

              <div className="flex items-center gap-2 text-sm text-slate-500">

                <AlertTriangle
                  size={17}
                  className="text-amber-500"
                />

                <span>
                  Vehicle number cannot be changed.
                </span>

              </div>

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={
                    handleCancel
                  }
                  disabled={
                    saving
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >

                  <X
                    size={17}
                  />

                  Cancel

                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving ? (
                    <>

                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                      Saving...

                    </>
                  ) : (
                    <>

                      <Save
                        size={17}
                      />

                      Save Changes

                    </>
                  )}

                </button>

              </div>

            </div>

          </div>

        </form>

      </motion.div>


      {/* =====================================================
          DELETE DOCUMENT CONFIRMATION MODAL
      ===================================================== */}

      <AnimatePresence>

        {documentDeleteModal &&
          documentToDelete && (

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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={
              cancelDeleteExistingDocument
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
              transition={{
                duration: 0.2,
              }}
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
              className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >

              {/* MODAL HEADER */}

              <div className="border-b border-slate-100 px-6 py-5">

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50">

                    <Trash2
                      size={22}
                      className="text-red-600"
                    />

                  </div>

                  <div>

                    <h3 className="text-lg font-bold text-slate-800">
                      Delete Document?
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Are you sure you want to permanently
                      delete this document?
                    </p>

                  </div>

                </div>

              </div>


              {/* DOCUMENT INFO */}

              <div className="px-6 py-5">

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                      <FileText
                        size={18}
                      />

                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-bold text-slate-700">
                        {documentToDelete.type ||
                          "Document"}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-400">
                        {documentToDelete.number ||
                          "No document number"}
                      </p>

                    </div>

                  </div>

                </div>


                <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3">

                  <AlertTriangle
                    size={17}
                    className="mt-0.5 shrink-0 text-red-500"
                  />

                  <p className="text-xs leading-5 text-red-700">
                    This action cannot be undone. The
                    document will be removed from the
                    Vehicle, Documents and Vehicle Details
                    sections.
                  </p>

                </div>

              </div>


              {/* MODAL ACTIONS */}

              <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">

                <button
                  type="button"
                  onClick={
                    cancelDeleteExistingDocument
                  }
                  disabled={
                    deletingDocument
                  }
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  No
                </button>

                <button
                  type="button"
                  onClick={
                    confirmDeleteExistingDocument
                  }
                  disabled={
                    deletingDocument
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {deletingDocument ? (
                    <>

                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                      Deleting...

                    </>
                  ) : (
                    <>

                      <Trash2
                        size={16}
                      />

                      Yes, Delete

                    </>
                  )}

                </button>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </>
  );
}


/* =========================================================
   SEARCHABLE DROPDOWN

   Keeps the existing field styling while replacing the native
   select with a searchable dropdown.

   - Click field -> opens
   - Click field again -> closes
   - Type -> filters options
   - Click option -> selects and closes
   - Click outside -> closes
========================================================= */

function SearchableDropdown({
  value,
  onChange,
  options = [],
  placeholder = "Select",
  icon: Icon,
  required = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const filteredOptions = options.filter((option) =>
    String(option)
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  const handleToggle = () => {
    setOpen((previous) => {
      const next = !previous;

      if (!next) {
        setSearch("");
      }

      return next;
    });
  };

  const handleSelect = (option) => {
    onChange(option);
    setSearch("");
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">

      <div
        className={`relative flex w-full items-center rounded-xl border border-slate-200 bg-white transition ${
          open
            ? "border-blue-500 ring-4 ring-blue-50"
            : ""
        }`}
      >

        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          type="text"
          value={open ? search : value || ""}
          placeholder={
            open
              ? value || placeholder
              : placeholder
          }
          onClick={handleToggle}
          onChange={(event) => {
            if (!open) {
              setOpen(true);
            }

            setSearch(event.target.value);
          }}
          className={`w-full cursor-text rounded-xl bg-transparent py-3 pr-11 text-sm font-medium text-slate-700 outline-none ${
            Icon ? "pl-10" : "pl-4"
          }`}
          autoComplete="off"
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={handleToggle}
          className="absolute right-0 top-0 flex h-full w-11 items-center justify-center text-slate-400 transition hover:text-blue-600"
          aria-label={open ? "Close dropdown" : "Open dropdown"}
        >
          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${
              open ? "rotate-180 text-blue-600" : ""
            }`}
          />
        </button>

      </div>

      <AnimatePresence>
        {open && (
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
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          >

            <div className="max-h-72 overflow-y-auto p-2">

              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                      value === option
                        ? "bg-purple-50 text-purple-600"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >

                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      {Icon ? (
                        <Icon size={17} />
                      ) : (
                        <Search size={16} />
                      )}
                    </span>

                    <span className="truncate">
                      {option}
                    </span>

                  </button>
                ))
              ) : (
                <div className="px-3 py-8 text-center text-sm text-slate-400">
                  No matching options found
                </div>
              )}

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}


/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

        <Icon
          size={21}
        />

      </div>

      <div>

        <h3 className="font-bold text-slate-800">
          {title}
        </h3>

        <p className="text-xs text-slate-500">
          {subtitle}
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   INPUT FIELD
========================================================= */

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  icon: Icon,
  disabled = false,
  required = false,
  helper,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      <div className="relative">

        {Icon && (
          <Icon
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          type={type}
          name={name}
          value={
            value ?? ""
          }
          onChange={
            onChange
          }
          disabled={
            disabled
          }
          required={
            required
          }
          className={`w-full rounded-xl border py-3 pr-4 text-sm font-medium outline-none transition ${
            Icon
              ? "pl-10"
              : "pl-4"
          } ${
            disabled
              ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
              : "border-slate-200 bg-white text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          }`}
        />

      </div>

      {helper && (
        <p className="mt-1 text-xs text-slate-400">
          {helper}
        </p>
      )}

    </div>
  );
}


/* =========================================================
   DOCUMENT VERIFICATION STATUS
========================================================= */

function DocumentVerificationStatus({
  document,
}) {
  const verified =
    document.verificationStatus ===
    "Verified";

  if (verified) {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">

          <ShieldCheck
            size={19}
            className="text-emerald-600"
          />

        </div>

        <div>

          <p className="text-sm font-bold text-emerald-700">
            Document Verified
          </p>

          <p className="text-xs text-emerald-600">
            The document passed the required
            file and information checks.
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">

        <ShieldX
          size={19}
          className="text-red-600"
        />

      </div>

      <div>

        <p className="text-sm font-bold text-red-700">
          Not Verified
        </p>

        <p className="text-xs text-red-600">
          {document.verificationMessage ||
            "Add a valid document and verify it before saving."}
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   EXISTING DOCUMENT
========================================================= */

function ExistingDocument({
  document,
  index,
  onChange,
  onFileChange,
  onVerify,
  onDelete,
}) {
  const verified =
    document.verificationStatus ===
    "Verified";

  const hasFile =
    Boolean(
      document.fileData ||
      document.fileUrl ||
      document.fileName
    );

  const canOpenFile =
    Boolean(
      document.fileData ||
      document.fileUrl
    );

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
      className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
    >

      {/* HEADER */}

      <div className="flex items-start justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

            <FileText
              size={19}
            />

          </div>

          <div>

            <p className="font-semibold text-slate-700">
              Document {index + 1}
            </p>

            <p className="text-xs text-slate-400">
              Existing vehicle document
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={() =>
            onDelete(
              document
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
          title="Delete document"
        >

          <Trash2
            size={17}
          />

        </button>

      </div>


      {/* FIELDS */}

      <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">


        {/* TYPE */}

        <div>

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Document Type
          </label>

          <SearchableDropdown
            value={document.type || ""}
            onChange={(value) =>
              onChange(
                document.id,
                "type",
                value
              )
            }
            options={documentTypes}
            placeholder="Select Document Type"
            icon={FileText}
          />

        </div>


        {/* NUMBER */}

        <InputField
          label="Document Number"
          value={
            document.number ||
            ""
          }
          onChange={(event) =>
            onChange(
              document.id,
              "number",
              event.target.value
            )
          }
          icon={Hash}
        />


        {/* AMOUNT */}

        <InputField
          label="Amount"
          type="number"
          value={
            document.amount ??
            ""
          }
          onChange={(event) =>
            onChange(
              document.id,
              "amount",
              event.target.value
            )
          }
        />


        {/* ISSUE DATE */}

        <InputField
          label="Issue Date"
          type="date"
          value={
            document.issueDate ||
            ""
          }
          onChange={(event) =>
            onChange(
              document.id,
              "issueDate",
              event.target.value
            )
          }
          icon={Calendar}
        />


        {/* EXPIRY DATE */}

        <InputField
          label="Expiry Date"
          type="date"
          value={
            document.expiry ||
            ""
          }
          onChange={(event) =>
            onChange(
              document.id,
              "expiry",
              event.target.value
            )
          }
          icon={Calendar}
        />


        {/* FILE */}

        <div>

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Replace Document File
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-blue-400 hover:bg-blue-50">

            <Upload
              size={17}
              className="shrink-0 text-blue-600"
            />

            <span className="truncate">
              {document.fileName ||
                "Choose file"}
            </span>

            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={(event) =>
                onFileChange(
                  document.id,
                  event
                )
              }
            />

          </label>

        </div>

      </div>


      {/* FILE INFORMATION */}

      {hasFile && (
        <button
          type="button"
          className={`mt-4 flex w-full items-center gap-2 rounded-xl bg-white px-4 py-3 text-left text-sm font-medium text-slate-600 ${
            canOpenFile
              ? "cursor-pointer transition hover:bg-blue-50"
              : "cursor-default"
          }`}
          onClick={() => {
            if (canOpenFile) {
              openDocumentFile(
                document
              );
            }
          }}
          title={
            canOpenFile
              ? "Click to open document"
              : "Document file is not available to open"
          }
        >

          <FileText
            size={17}
            className="shrink-0 text-blue-600"
          />

          <span className="truncate">
            {document.fileName}
          </span>

          {canOpenFile && (
            <ExternalLink
              size={15}
              className="ml-auto shrink-0 text-blue-500"
            />
          )}

        </button>
      )}


      {/* VERIFY BUTTON */}

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <p className="text-sm font-semibold text-slate-700">
            Document Verification
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Verify the document before saving changes.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            onVerify(
              document
            )
          }
          className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
            verified
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              : "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
          }`}
        >

          {verified ? (
            <>

              <CheckCircle2
                size={17}
              />

              Verified

            </>
          ) : (
            <>

              <ShieldCheck
                size={17}
              />

              Verify Document

            </>
          )}

        </button>

      </div>


      {/* STATUS */}

      <DocumentVerificationStatus
        document={
          document
        }
      />

    </motion.div>
  );
}


/* =========================================================
   NEW DOCUMENT
========================================================= */

function NewDocument({
  document,
  index,
  onChange,
  onFileChange,
  onVerify,
  onRemove,
}) {
  const verified =
    document.verificationStatus ===
    "Verified";

  const hasFile =
    Boolean(
      document.fileData ||
      document.fileUrl ||
      document.fileName
    );

  const canOpenFile =
    Boolean(
      document.fileData ||
      document.fileUrl
    );

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
      className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5"
    >

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

            <Plus
              size={19}
            />

          </div>

          <div>

            <p className="font-semibold text-slate-700">
              New Document {index + 1}
            </p>

            <p className="text-xs text-slate-400">
              Add a new vehicle document
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={() =>
            onRemove(index)
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
          title="Remove document"
        >

          <Trash2
            size={17}
          />

        </button>

      </div>


      {/* FIELDS */}

      <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">


        {/* TYPE */}

        <div>

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Document Type
          </label>

          <SearchableDropdown
            value={document.type || ""}
            onChange={(value) =>
              onChange(
                index,
                "type",
                value
              )
            }
            options={documentTypes}
            placeholder="Select Document Type"
            icon={FileText}
          />

        </div>


        {/* NUMBER */}

        <InputField
          label="Document Number"
          value={
            document.number ||
            ""
          }
          onChange={(event) =>
            onChange(
              index,
              "number",
              event.target.value
            )
          }
          icon={Hash}
        />


        {/* AMOUNT */}

        <InputField
          label="Amount"
          type="number"
          value={
            document.amount ??
            ""
          }
          onChange={(event) =>
            onChange(
              index,
              "amount",
              event.target.value
            )
          }
        />


        {/* ISSUE */}

        <InputField
          label="Issue Date"
          type="date"
          value={
            document.issueDate ||
            ""
          }
          onChange={(event) =>
            onChange(
              index,
              "issueDate",
              event.target.value
            )
          }
          icon={Calendar}
        />


        {/* EXPIRY */}

        <InputField
          label="Expiry Date"
          type="date"
          value={
            document.expiry ||
            ""
          }
          onChange={(event) =>
            onChange(
              index,
              "expiry",
              event.target.value
            )
          }
          icon={Calendar}
        />


        {/* FILE */}

        <div>

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Upload File
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-blue-400 hover:bg-blue-50">

            <Upload
              size={17}
              className="shrink-0 text-blue-600"
            />

            <span className="truncate">
              {document.fileName ||
                "Choose file"}
            </span>

            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={(event) =>
                onFileChange(
                  index,
                  event
                )
              }
            />

          </label>

        </div>

      </div>


      {/* FILE */}

      {hasFile && (
        <button
          type="button"
          className={`mt-4 flex w-full items-center gap-2 rounded-xl bg-white px-4 py-3 text-left text-sm font-medium text-slate-600 ${
            canOpenFile
              ? "cursor-pointer transition hover:bg-blue-50"
              : "cursor-default"
          }`}
          onClick={() => {
            if (canOpenFile) {
              openDocumentFile(
                document
              );
            }
          }}
          title={
            canOpenFile
              ? "Click to open document"
              : "Document file is not available to open"
          }
        >

          <FileText
            size={17}
            className="shrink-0 text-blue-600"
          />

          <span className="truncate">
            {document.fileName}
          </span>

          {canOpenFile && (
            <ExternalLink
              size={15}
              className="ml-auto shrink-0 text-blue-500"
            />
          )}

        </button>
      )}


      {/* VERIFY */}

      <div className="mt-5 flex flex-col gap-3 border-t border-blue-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <p className="text-sm font-semibold text-slate-700">
            Document Verification
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Verify this document before saving.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            onVerify(index)
          }
          className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
            verified
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >

          {verified ? (
            <>

              <CheckCircle2
                size={17}
              />

              Verified

            </>
          ) : (
            <>

              <ShieldCheck
                size={17}
              />

              Verify Document

            </>
          )}

        </button>

      </div>


      {/* STATUS */}

      <DocumentVerificationStatus
        document={
          document
        }
      />

    </motion.div>
  );
}