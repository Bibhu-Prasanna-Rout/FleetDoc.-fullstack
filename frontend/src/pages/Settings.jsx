// import { useEffect, useMemo, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import {
//   Settings as SettingsIcon,
//   Building2,
//   AlertTriangle,
//   Bell,
//   FileText,
//   Truck,
//   IndianRupee,
//   ReceiptText,
//   Users,
//   ShieldCheck,
//   Database,
//   Plug,
//   Palette,
//   ClipboardList,
//   Save,
//   RotateCcw,
//   CheckCircle2,
//   ChevronRight,
//   ChevronDown,
//   Moon,
//   Sun,
//   Monitor,
//   Mail,
//   MessageSquare,
//   Smartphone,
//   Lock,
//   KeyRound,
//   Download,
//   Upload,
//   RefreshCw,
//   Clock3,
//   Globe2,
//   CalendarDays,
//   Eye,
//   EyeOff,
//   Plus,
//   Trash2,
//   Pencil,
//   X,
//   CircleHelp,
//   Activity,
//   Server,
//   CreditCard,
//   WifiOff,
//   User2,
// } from "lucide-react";

// import PageHeader from "../components/PageHeader";
// import { useFleet } from "../context/fleetContext";

// const API_BASE =
//   import.meta.env.VITE_API_URL ||
//   "http://localhost:8000/api/v1";

// function getAccessToken() {
//   return localStorage.getItem("fleetdoc_access_token");
// }

// async function settingsApi(path, options = {}) {
//   const headers = {
//     "Content-Type": "application/json",
//     ...(options.headers || {}),
//   };

//   const accessToken = getAccessToken();
//   if (accessToken) {
//     headers.Authorization = `Bearer ${accessToken}`;
//   }

//   let response;
//   try {
//     response = await fetch(`${API_BASE}${path}`, {
//       ...options,
//       headers,
//     });
//   } catch {
//     throw new Error(
//       "Failed to connect to FleetDoc backend. Please make sure the FastAPI server is running."
//     );
//   }

//   const text = await response.text();
//   let data = {};
//   try {
//     data = text ? JSON.parse(text) : {};
//   } catch {
//     data = { detail: text };
//   }

//   if (!response.ok) {
//     let message = `Request failed (${response.status})`;
//     if (typeof data?.detail === "string") {
//       message = data.detail;
//     } else if (Array.isArray(data?.detail)) {
//       message = data.detail
//         .map((item) => item?.msg || item?.message)
//         .filter(Boolean)
//         .join("\n") || message;
//     } else if (typeof data?.message === "string") {
//       message = data.message;
//     }
//     throw new Error(message);
//   }

//   return data;
// }

// /* ============================================================
//    ANIMATION VARIANTS
// ============================================================ */

// const pageVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       duration: 0.35,
//       staggerChildren: 0.05,
//     },
//   },
// };

// const itemVariants = {
//   hidden: {
//     opacity: 0,
//     y: 16,
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

// const tabVariants = {
//   hidden: {
//     opacity: 0,
//     x: 12,
//   },
//   visible: {
//     opacity: 1,
//     x: 0,
//     transition: {
//       duration: 0.3,
//     },
//   },
// };

// /* ============================================================
//    SETTINGS MENU
// ============================================================ */

// const settingsMenu = [
//   {
//     id: "general",
//     label: "General",
//     description: "Company and portal information",
//     icon: Building2,
//   },
//   {
//     id: "notifications",
//     label: "Notifications",
//     description: "Alerts and reminders",
//     icon: Bell,
//   },
//   {
//     id: "documents",
//     label: "Documents",
//     description: "Vehicle document configuration",
//     icon: FileText,
//   },
//   {
//     id: "vehicles",
//     label: "Vehicles",
//     description: "Vehicle types and status",
//     icon: Truck,
//   },
//   {
//     id: "emi",
//     label: "EMI & Finance",
//     description: "Loan and payment settings",
//     icon: IndianRupee,
//   },
//   {
//     id: "challans",
//     label: "Challans",
//     description: "Challan synchronization",
//     icon: ReceiptText,
//   },
//   {
//     id: "users",
//     label: "Users & Roles",
//     description: "Access and permissions",
//     icon: Users,
//   },
//   {
//     id: "security",
//     label: "Security",
//     description: "Password and account security",
//     icon: ShieldCheck,
//   },
//   {
//     id: "backup",
//     label: "Backup & Data",
//     description: "Backup and data management",
//     icon: Database,
//   },
//   {
//     id: "integrations",
//     label: "Integrations",
//     description: "External services and APIs",
//     icon: Plug,
//   },
//   {
//     id: "appearance",
//     label: "Appearance",
//     description: "Theme and interface",
//     icon: Palette,
//   },
//   {
//     id: "audit",
//     label: "Audit Logs",
//     description: "System activity history",
//     icon: ClipboardList,
//   },
// ];

// /* ============================================================
//    DEFAULT VEHICLE CONFIGURATION
// ============================================================ */

// const defaultVehicleTypes = [
//   "Truck",
//   "Car",
//   "Bus",
//   "Trailer",
//   "Other",
// ];

// const defaultVehicleStatuses = [
//   "Active",
//   "Inactive",
//   "Under Maintenance",
// ];

// /* ============================================================
//    DEFAULT ROLE PERMISSIONS
// ============================================================ */

// const defaultRolePermissions = {
//   Admin: {
//     view: true,
//     add: true,
//     edit: true,
//     delete: true,
//     paid: true,
//     settings: true,
//     users: true,
//     password: true,
//   },

//   Manager: {
//     view: true,
//     add: true,
//     edit: true,
//     delete: false,
//     paid: false,
//     settings: false,
//     users: false,
//     password: false,
//   },

//   Finance: {
//     view: true,
//     add: true,
//     edit: false,
//     delete: false,
//     paid: true,
//     settings: false,
//     users: false,
//     password: false,
//   },

//   User: {
//     view: true,
//     add: true,
//     edit: false,
//     delete: false,
//     paid: false,
//     settings: false,
//     users: false,
//     password: false,
//   },
// };

// /* ============================================================
//    ROLE PERMISSION NORMALIZER
// ============================================================ */

// const normalizeRolePermissions = (source) => {
//   const permissions =
//     source && typeof source === "object"
//       ? source
//       : {};

//   const normalized = Object.keys(
//     defaultRolePermissions
//   ).reduce((result, role) => {
//     result[role] = {
//       ...defaultRolePermissions[role],
//       ...(permissions[role] || {}),
//     };

//     return result;
//   }, {});

//   /*
//     Admin must always retain complete access.
//     This prevents the permission system from
//     accidentally locking the administrator out.
//   */
//   normalized.Admin = {
//     ...normalized.Admin,
//     view: true,
//     add: true,
//     edit: true,
//     delete: true,
//     paid: true,
//     settings: true,
//     users: true,
//     password: true,
//   };

//   return normalized;
// };

// /* ============================================================
//    DEFAULT SETTINGS
// ============================================================ */

// const defaultSettings = {
//   companyName: "BIBHU Logistics",
//   portalName: "Fleet Portal",

//   email: "",
//   phone: "",

//   dateFormat: "DD MMM YYYY",
//   currency: "Indian Rupee (₹)",
//   timezone: "Asia/Kolkata",

//   reminderDays: 10,

//   dashboardNotifications: true,
//   emailNotifications: true,
//   smsNotifications: false,
//   whatsappNotifications: false,

//   documentAlerts: true,
//   emiAlerts: true,
//   challanAlerts: true,
//   roadTaxAlerts: true,

//   inAppNotifications: true,
//   pushNotifications: true,

//   tripReminders: true,

//   paymentMode: "Bank Transfer",
//   defaultPaymentMode: "Bank Transfer",
//   autoGenerateEMIs: true,

//   challanAutoSync: false,
//   syncFrequency: "30",
//   challanSyncFrequency: "Daily",

//   twoFactor: false,
//   strongPassword: true,
//   twoFactorAuthentication: false,
//   strongPasswordRequired: true,
//   sessionTimeout: 30,

//   theme: "light",
//   animations: true,
//   animationsEnabled: true,
//   compactTables: false,

//   vehicleTypes: defaultVehicleTypes,
//   vehicleStatuses: defaultVehicleStatuses,

//   rolePermissions: defaultRolePermissions,

//   lastUpdated: null,
// };

// /* ============================================================
//    REUSABLE COMPONENTS
// ============================================================ */

// function SectionTitle({
//   icon: Icon,
//   title,
//   description,
// }) {
//   return (
//     <div className="mb-6 flex items-start gap-4">
//       <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
//         <Icon size={21} strokeWidth={2.2} />
//       </div>

//       <div>
//         <h2 className="text-lg font-bold text-slate-900">
//           {title}
//         </h2>

//         <p className="mt-1 text-sm text-slate-500">
//           {description}
//         </p>
//       </div>
//     </div>
//   );
// }

// function SettingCard({
//   children,
//   className = "",
// }) {
//   return (
//     <motion.div
//       variants={itemVariants}
//       className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${className}`}
//     >
//       {children}
//     </motion.div>
//   );
// }

// function Toggle({ checked, onChange }) {
//   return (
//     <button
//       type="button"
//       onClick={() => onChange(!checked)}
//       className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-300 ${
//         checked
//           ? "bg-blue-600 shadow-md shadow-blue-200"
//           : "bg-slate-300"
//       }`}
//       aria-pressed={checked}
//     >
//       <span
//         className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
//           checked ? "left-6" : "left-1"
//         }`}
//       />
//     </button>
//   );
// }

// function SettingRow({
//   icon: Icon,
//   title,
//   description,
//   children,
// }) {
//   return (
//     <div className="flex flex-col gap-4 border-b border-slate-100 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
//       <div className="flex items-start gap-3">
//         {Icon && (
//           <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
//             <Icon size={17} />
//           </div>
//         )}

//         <div>
//           <p className="font-semibold text-slate-800">
//             {title}
//           </p>

//           {description && (
//             <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
//               {description}
//             </p>
//           )}
//         </div>
//       </div>

//       <div className="sm:shrink-0">
//         {children}
//       </div>
//     </div>
//   );
// }

// function InputField({
//   label,
//   value,
//   onChange,
//   placeholder,
//   type = "text",
// }) {
//   return (
//     <label className="block">
//       <span className="mb-2 block text-sm font-semibold text-slate-700">
//         {label}
//       </span>

//       <input
//         type={type}
//         value={value ?? ""}
//         onChange={(e) =>
//           onChange(e.target.value)
//         }
//         placeholder={placeholder}
//         className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
//       />
//     </label>
//   );
// }

// function CustomDropdown({
//   value,
//   onChange,
//   children,
//   className = "",
// }) {
//   const [open, setOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   const options = (Array.isArray(children) ? children : [children]).filter(
//     (child) => child && child.props
//   );

//   const selectedOption =
//     options.find(
//       (option) => String(option.props.value) === String(value ?? "")
//     ) || options[0];

//   useEffect(() => {
//     if (!open) return;

//     const handleOutsideClick = (event) => {
//       if (!dropdownRef.current?.contains(event.target)) {
//         setOpen(false);
//       }
//     };

//     const handleEscape = (event) => {
//       if (event.key === "Escape") {
//         setOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleOutsideClick);
//     document.addEventListener("keydown", handleEscape);

//     return () => {
//       document.removeEventListener("mousedown", handleOutsideClick);
//       document.removeEventListener("keydown", handleEscape);
//     };
//   }, [open]);

//   return (
//     <div ref={dropdownRef} className={`relative ${className}`}>
//       <button
//         type="button"
//         aria-haspopup="listbox"
//         aria-expanded={open}
//         onClick={() => setOpen((previous) => !previous)}
//         className={`flex min-h-[48px] w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left text-sm outline-none transition-all duration-200 ${
//           open
//             ? "border-blue-400 ring-4 ring-blue-50"
//             : "border-slate-200 hover:border-slate-300"
//         }`}
//       >
//         <span className="min-w-0 flex-1 truncate text-slate-800">
//           {selectedOption?.props?.children ?? "Select an option"}
//         </span>

//         <ChevronDown
//           size={18}
//           className={`shrink-0 text-slate-400 transition-transform duration-200 ${
//             open ? "rotate-180 text-blue-600" : ""
//           }`}
//         />
//       </button>

//       <AnimatePresence>
//         {open && (
//           <motion.div
//             initial={{ opacity: 0, y: -6, scale: 0.98 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: -6, scale: 0.98 }}
//             transition={{ duration: 0.15 }}
//             className="absolute left-0 right-0 top-[calc(100%+6px)] z-[70] max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-200/60"
//             role="listbox"
//           >
//             {options.map((option) => {
//               const optionValue = option.props.value;
//               const selected =
//                 String(optionValue) === String(value ?? "");

//               return (
//                 <button
//                   key={String(optionValue)}
//                   type="button"
//                   role="option"
//                   aria-selected={selected}
//                   onClick={() => {
//                     onChange(optionValue);
//                     setOpen(false);
//                   }}
//                   className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition-colors duration-150 ${
//                     selected
//                       ? "bg-blue-50 font-semibold text-blue-700"
//                       : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
//                   }`}
//                 >
//                   <span className="pr-3">
//                     {option.props.children}
//                   </span>

//                   {selected && (
//                     <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
//                   )}
//                 </button>
//               );
//             })}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// function SelectField({
//   label,
//   value,
//   onChange,
//   children,
// }) {
//   return (
//     <label className="block">
//       <span className="mb-2 block text-sm font-semibold text-slate-700">
//         {label}
//       </span>

//       <CustomDropdown
//         value={value}
//         onChange={onChange}
//       >
//         {children}
//       </CustomDropdown>
//     </label>
//   );
// }

// function StatusBadge({
//   connected,
//   children,
// }) {
//   return (
//     <span
//       className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
//         connected
//           ? "bg-emerald-50 text-emerald-700"
//           : "bg-slate-100 text-slate-600"
//       }`}
//     >
//       <span
//         className={`h-1.5 w-1.5 rounded-full ${
//           connected
//             ? "bg-emerald-500"
//             : "bg-slate-400"
//         }`}
//       />

//       {children}
//     </span>
//   );
// }

// /* ============================================================
//    GENERAL
// ============================================================ */

// function GeneralSettings({
//   settings,
//   updateSetting,
// }) {
//   return (
//     <motion.div
//       variants={tabVariants}
//       initial="hidden"
//       animate="visible"
//       className="space-y-5"
//     >
//       <SettingCard>
//         <SectionTitle
//           icon={Building2}
//           title="Company Information"
//           description="Manage the basic information displayed across your fleet portal."
//         />

//         <div className="grid gap-5 md:grid-cols-2">
//           <InputField
//             label="Company Name"
//             value={settings.companyName}
//             onChange={(value) =>
//               updateSetting(
//                 "companyName",
//                 value
//               )
//             }
//             placeholder="Enter company name"
//           />

//           <InputField
//             label="Portal Name"
//             value={settings.portalName}
//             onChange={(value) =>
//               updateSetting(
//                 "portalName",
//                 value
//               )
//             }
//             placeholder="Fleet Portal"
//           />

//           <InputField
//             label="Email Address"
//             value={settings.email}
//             onChange={(value) =>
//               updateSetting(
//                 "email",
//                 value
//               )
//             }
//             placeholder="company@example.com"
//             type="email"
//           />

//           <InputField
//             label="Phone Number"
//             value={settings.phone}
//             onChange={(value) =>
//               updateSetting(
//                 "phone",
//                 value
//               )
//             }
//             placeholder="+91 XXXXX XXXXX"
//           />
//         </div>
//       </SettingCard>

//       <SettingCard>
//         <SectionTitle
//           icon={Globe2}
//           title="Regional Settings"
//           description="Configure date, currency and regional preferences."
//         />

//         <div className="grid gap-5 md:grid-cols-3">
//           <SelectField
//             label="Currency"
//             value={settings.currency}
//             onChange={(value) =>
//               updateSetting(
//                 "currency",
//                 value
//               )
//             }
//           >
//             <option value="Indian Rupee (₹)">
//               ₹ INR — Indian Rupee
//             </option>
//             <option value="USD">
//               $ USD — US Dollar
//             </option>
//             <option value="EUR">
//               € EUR — Euro
//             </option>
//           </SelectField>

//           <SelectField
//             label="Date Format"
//             value={settings.dateFormat}
//             onChange={(value) =>
//               updateSetting(
//                 "dateFormat",
//                 value
//               )
//             }
//           >
//             <option value="DD MMM YYYY">
//               DD MMM YYYY
//             </option>
//             <option value="DD/MM/YYYY">
//               DD/MM/YYYY
//             </option>
//             <option value="MM/DD/YYYY">
//               MM/DD/YYYY
//             </option>
//             <option value="YYYY-MM-DD">
//               YYYY-MM-DD
//             </option>
//           </SelectField>

//           <SelectField
//             label="Time Zone"
//             value={settings.timezone}
//             onChange={(value) =>
//               updateSetting(
//                 "timezone",
//                 value
//               )
//             }
//           >
//             <option value="Asia/Kolkata">
//               Asia/Kolkata — IST
//             </option>
//             <option value="UTC">
//               UTC
//             </option>
//           </SelectField>
//         </div>
//       </SettingCard>
//     </motion.div>
//   );
// }

// /* ============================================================
//    NOTIFICATIONS
// ============================================================ */

// function NotificationSettings({
//   settings,
//   updateSetting,
// }) {
//   return (
//     <motion.div
//       variants={tabVariants}
//       initial="hidden"
//       animate="visible"
//       className="space-y-5"
//     >
//       <SettingCard>
//         <SectionTitle
//           icon={Bell}
//           title="Notification Preferences"
//           description="Control the alerts displayed and delivered by the fleet portal."
//         />

//         <SettingRow
//           icon={Bell}
//           title="Dashboard Notifications"
//           description="Show important fleet alerts and reminders on the dashboard."
//         >
//           <Toggle
//             checked={Boolean(
//               settings.dashboardNotifications
//             )}
//             onChange={(value) =>
//               updateSetting(
//                 "dashboardNotifications",
//                 value
//               )
//             }
//           />
//         </SettingRow>

//         <SettingRow
//           icon={FileText}
//           title="Document Expiry Alerts"
//           description="Notify users when vehicle documents are approaching expiry."
//         >
//           <Toggle
//             checked={Boolean(
//               settings.documentAlerts
//             )}
//             onChange={(value) =>
//               updateSetting(
//                 "documentAlerts",
//                 value
//               )
//             }
//           />
//         </SettingRow>

//         <SettingRow
//           icon={IndianRupee}
//           title="EMI Due Alerts"
//           description="Show notifications for upcoming EMI payments."
//         >
//           <Toggle
//             checked={Boolean(
//               settings.emiAlerts
//             )}
//             onChange={(value) =>
//               updateSetting(
//                 "emiAlerts",
//                 value
//               )
//             }
//           />
//         </SettingRow>

//         <SettingRow
//           icon={ReceiptText}
//           title="Challan Alerts"
//           description="Notify users when new or pending challans are available."
//         >
//           <Toggle
//             checked={Boolean(
//               settings.challanAlerts
//             )}
//             onChange={(value) =>
//               updateSetting(
//                 "challanAlerts",
//                 value
//               )
//             }
//           />
//         </SettingRow>

//         <SettingRow
//           icon={CalendarDays}
//           title="Road Tax Alerts"
//           description="Show reminders for upcoming road tax payments."
//         >
//           <Toggle
//             checked={Boolean(
//               settings.roadTaxAlerts
//             )}
//             onChange={(value) =>
//               updateSetting(
//                 "roadTaxAlerts",
//                 value
//               )
//             }
//           />
//         </SettingRow>

//         <SettingRow
//           icon={Truck}
//           title="Trip Reminders"
//           description="Show reminders related to fleet trips and operations."
//         >
//           <Toggle
//             checked={Boolean(
//               settings.tripReminders
//             )}
//             onChange={(value) =>
//               updateSetting(
//                 "tripReminders",
//                 value
//               )
//             }
//           />
//         </SettingRow>
//       </SettingCard>

//       <SettingCard>
//         <SectionTitle
//           icon={Clock3}
//           title="Reminder Timing"
//           description="Set how early the portal should notify users."
//         />

//         <div className="max-w-sm">
//           <SelectField
//             label="Remind Before Expiry"
//             value={settings.reminderDays}
//             onChange={(value) =>
//               updateSetting(
//                 "reminderDays",
//                 Number(value)
//               )
//             }
//           >
//             <option value={7}>7 days</option>
//             <option value={10}>10 days</option>
//             <option value={15}>15 days</option>
//             <option value={30}>30 days</option>
//             <option value={45}>45 days</option>
//             <option value={60}>60 days</option>
//           </SelectField>
//         </div>
//       </SettingCard>

//       <SettingCard>
//         <SectionTitle
//           icon={Smartphone}
//           title="Notification Channels"
//           description="Choose how notifications are delivered."
//         />

//         <SettingRow
//           icon={Mail}
//           title="Email Notifications"
//           description="Send important alerts through email."
//         >
//           <Toggle
//             checked={Boolean(
//               settings.emailNotifications
//             )}
//             onChange={(value) =>
//               updateSetting(
//                 "emailNotifications",
//                 value
//               )
//             }
//           />
//         </SettingRow>

//         <SettingRow
//           icon={MessageSquare}
//           title="SMS Notifications"
//           description="Send important alerts through SMS."
//         >
//           <Toggle
//             checked={Boolean(
//               settings.smsNotifications
//             )}
//             onChange={(value) =>
//               updateSetting(
//                 "smsNotifications",
//                 value
//               )
//             }
//           />
//         </SettingRow>

//         <SettingRow
//           icon={MessageSquare}
//           title="WhatsApp Notifications"
//           description="Send supported fleet alerts through WhatsApp."
//         >
//           <Toggle
//             checked={Boolean(
//               settings.whatsappNotifications
//             )}
//             onChange={(value) =>
//               updateSetting(
//                 "whatsappNotifications",
//                 value
//               )
//             }
//           />
//         </SettingRow>

//         <SettingRow
//           icon={Bell}
//           title="Push Notifications"
//           description="Enable browser or application push notifications when supported."
//         >
//           <Toggle
//             checked={Boolean(
//               settings.pushNotifications
//             )}
//             onChange={async (value) => {
//               if (
//                 value &&
//                 "Notification" in window
//               ) {
//                 const permission =
//                   await Notification.requestPermission();

//                 if (
//                   permission !==
//                   "granted"
//                 ) {
//                   updateSetting(
//                     "pushNotifications",
//                     false
//                   );
//                   return;
//                 }
//               }

//               updateSetting(
//                 "pushNotifications",
//                 value
//               );
//             }}
//           />
//         </SettingRow>
//       </SettingCard>
//     </motion.div>
//   );
// }

// /* ============================================================
//    DOCUMENTS
// ============================================================ */

// function DocumentSettings({
//   settings,
//   updateSetting,
// }) {
//   const defaultTypes = [
//     "Registration Certificate",
//     "Pollution Certificate",
//     "Fitness Certificate",
//     "State Permit",
//     "National Permit",
//     "Insurance",
//     "Road Tax",
//   ];

//   const [documentTypes, setDocumentTypes] =
//     useState(
//       Array.isArray(settings.documentTypes)
//         ? settings.documentTypes
//         : defaultTypes
//     );

//   const [newType, setNewType] =
//     useState("");

//   const [editingIndex, setEditingIndex] =
//     useState(null);

//   const [editValue, setEditValue] =
//     useState("");

//   useEffect(() => {
//     if (
//       Array.isArray(
//         settings.documentTypes
//       )
//     ) {
//       setDocumentTypes(
//         settings.documentTypes
//       );
//     }
//   }, [settings.documentTypes]);

//   const persistTypes = (types) => {
//     setDocumentTypes(types);
//     updateSetting(
//       "documentTypes",
//       types
//     );
//   };

//   const addType = () => {
//     const value = newType.trim();

//     if (!value) return;

//     if (
//       documentTypes.some(
//         (item) =>
//           item.toLowerCase() ===
//           value.toLowerCase()
//       )
//     ) {
//       return;
//     }

//     persistTypes([
//       ...documentTypes,
//       value,
//     ]);

//     setNewType("");
//   };

//   const removeType = (index) => {
//     persistTypes(
//       documentTypes.filter(
//         (_, itemIndex) =>
//           itemIndex !== index
//       )
//     );
//   };

//   const startEdit = (index) => {
//     setEditingIndex(index);
//     setEditValue(
//       documentTypes[index]
//     );
//   };

//   const saveEdit = () => {
//     const value = editValue.trim();

//     if (
//       !value ||
//       editingIndex === null
//     ) {
//       return;
//     }

//     const duplicate =
//       documentTypes.some(
//         (item, index) =>
//           index !== editingIndex &&
//           item.toLowerCase() ===
//             value.toLowerCase()
//       );

//     if (duplicate) return;

//     persistTypes(
//       documentTypes.map(
//         (item, index) =>
//           index === editingIndex
//             ? value
//             : item
//       )
//     );

//     setEditingIndex(null);
//     setEditValue("");
//   };

//   return (
//     <motion.div
//       variants={tabVariants}
//       initial="hidden"
//       animate="visible"
//       className="space-y-5"
//     >
//       <SettingCard>
//         <SectionTitle
//           icon={FileText}
//           title="Vehicle Document Types"
//           description="Configure the document types available when adding vehicle documents."
//         />

//         <div className="mb-5 flex flex-col gap-3 sm:flex-row">
//           <input
//             value={newType}
//             onChange={(e) =>
//               setNewType(e.target.value)
//             }
//             onKeyDown={(e) => {
//               if (e.key === "Enter")
//                 addType();
//             }}
//             placeholder="Add new document type"
//             className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
//           />

//           <button
//             type="button"
//             onClick={addType}
//             className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
//           >
//             <Plus size={17} />
//             Add Type
//           </button>
//         </div>

//         <div className="space-y-2">
//           {documentTypes.map(
//             (type, index) => (
//               <motion.div
//                 key={`${type}-${index}`}
//                 layout
//                 className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 transition-all duration-200 hover:bg-blue-50/50"
//               >
//                 {editingIndex ===
//                 index ? (
//                   <div className="flex flex-1 items-center gap-2">
//                     <input
//                       value={editValue}
//                       onChange={(e) =>
//                         setEditValue(
//                           e.target.value
//                         )
//                       }
//                       onKeyDown={(e) => {
//                         if (
//                           e.key ===
//                           "Enter"
//                         ) {
//                           saveEdit();
//                         }
//                       }}
//                       className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-blue-50"
//                       autoFocus
//                     />

//                     <button
//                       type="button"
//                       onClick={saveEdit}
//                       className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition hover:bg-emerald-100"
//                     >
//                       <CheckCircle2
//                         size={17}
//                       />
//                     </button>

//                     <button
//                       type="button"
//                       onClick={() => {
//                         setEditingIndex(
//                           null
//                         );
//                         setEditValue("");
//                       }}
//                       className="rounded-lg bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
//                     >
//                       <X size={17} />
//                     </button>
//                   </div>
//                 ) : (
//                   <>
//                     <div className="flex items-center gap-3">
//                       <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
//                         <FileText
//                           size={16}
//                         />
//                       </div>

//                       <span className="text-sm font-medium text-slate-700">
//                         {type}
//                       </span>
//                     </div>

//                     <div className="flex items-center gap-1">
//                       <button
//                         type="button"
//                         onClick={() =>
//                           startEdit(
//                             index
//                           )
//                         }
//                         className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-blue-600"
//                       >
//                         <Pencil
//                           size={16}
//                         />
//                       </button>

//                       <button
//                         type="button"
//                         onClick={() =>
//                           removeType(
//                             index
//                           )
//                         }
//                         className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
//                       >
//                         <Trash2
//                           size={16}
//                         />
//                       </button>
//                     </div>
//                   </>
//                 )}
//               </motion.div>
//             )
//           )}
//         </div>
//       </SettingCard>
//     </motion.div>
//   );
// }

// /* ============================================================
//    VEHICLES
// ============================================================ */

// function VehicleSettings({
//   settings,
//   updateSetting,
// }) {
//   const [vehicleTypes, setVehicleTypes] =
//     useState(
//       Array.isArray(
//         settings.vehicleTypes
//       )
//         ? settings.vehicleTypes
//         : defaultVehicleTypes
//     );

//   const [
//     vehicleStatuses,
//     setVehicleStatuses,
//   ] = useState(
//     Array.isArray(
//       settings.vehicleStatuses
//     )
//       ? settings.vehicleStatuses
//       : defaultVehicleStatuses
//   );

//   const [
//     newVehicleType,
//     setNewVehicleType,
//   ] = useState("");

//   const [
//     newVehicleStatus,
//     setNewVehicleStatus,
//   ] = useState("");

//   const [
//     editingTypeIndex,
//     setEditingTypeIndex,
//   ] = useState(null);

//   const [
//     editingStatusIndex,
//     setEditingStatusIndex,
//   ] = useState(null);

//   const [
//     editTypeValue,
//     setEditTypeValue,
//   ] = useState("");

//   const [
//     editStatusValue,
//     setEditStatusValue,
//   ] = useState("");

//   useEffect(() => {
//     setVehicleTypes(
//       Array.isArray(
//         settings.vehicleTypes
//       )
//         ? settings.vehicleTypes
//         : defaultVehicleTypes
//     );

//     setVehicleStatuses(
//       Array.isArray(
//         settings.vehicleStatuses
//       )
//         ? settings.vehicleStatuses
//         : defaultVehicleStatuses
//     );
//   }, [
//     settings.vehicleTypes,
//     settings.vehicleStatuses,
//   ]);

//   const persistVehicleTypes = (
//     types
//   ) => {
//     setVehicleTypes(types);
//     updateSetting(
//       "vehicleTypes",
//       types
//     );
//   };

//   const persistVehicleStatuses = (
//     statuses
//   ) => {
//     setVehicleStatuses(statuses);
//     updateSetting(
//       "vehicleStatuses",
//       statuses
//     );
//   };

//   const addVehicleType = () => {
//     const value =
//       newVehicleType.trim();

//     if (!value) return;

//     if (
//       vehicleTypes.some(
//         (item) =>
//           String(item).toLowerCase() ===
//           value.toLowerCase()
//       )
//     ) {
//       return;
//     }

//     persistVehicleTypes([
//       ...vehicleTypes,
//       value,
//     ]);

//     setNewVehicleType("");
//   };

//   const removeVehicleType = (
//     index
//   ) => {
//     if (vehicleTypes.length <= 1)
//       return;

//     persistVehicleTypes(
//       vehicleTypes.filter(
//         (_, itemIndex) =>
//           itemIndex !== index
//       )
//     );
//   };

//   const startEditVehicleType = (
//     index
//   ) => {
//     setEditingTypeIndex(index);
//     setEditTypeValue(
//       vehicleTypes[index]
//     );
//   };

//   const saveVehicleTypeEdit = () => {
//     const value =
//       editTypeValue.trim();

//     if (
//       !value ||
//       editingTypeIndex === null
//     ) {
//       return;
//     }

//     const duplicate =
//       vehicleTypes.some(
//         (item, index) =>
//           index !== editingTypeIndex &&
//           String(item).toLowerCase() ===
//             value.toLowerCase()
//       );

//     if (duplicate) return;

//     persistVehicleTypes(
//       vehicleTypes.map(
//         (item, index) =>
//           index === editingTypeIndex
//             ? value
//             : item
//       )
//     );

//     setEditingTypeIndex(null);
//     setEditTypeValue("");
//   };

//   const addVehicleStatus = () => {
//     const value =
//       newVehicleStatus.trim();

//     if (!value) return;

//     if (
//       vehicleStatuses.some(
//         (item) =>
//           String(item).toLowerCase() ===
//           value.toLowerCase()
//       )
//     ) {
//       return;
//     }

//     persistVehicleStatuses([
//       ...vehicleStatuses,
//       value,
//     ]);

//     setNewVehicleStatus("");
//   };

//   const removeVehicleStatus = (
//     index
//   ) => {
//     if (vehicleStatuses.length <= 1)
//       return;

//     persistVehicleStatuses(
//       vehicleStatuses.filter(
//         (_, itemIndex) =>
//           itemIndex !== index
//       )
//     );
//   };

//   const startEditVehicleStatus = (
//     index
//   ) => {
//     setEditingStatusIndex(index);
//     setEditStatusValue(
//       vehicleStatuses[index]
//     );
//   };

//   const saveVehicleStatusEdit = () => {
//     const value =
//       editStatusValue.trim();

//     if (
//       !value ||
//       editingStatusIndex === null
//     ) {
//       return;
//     }

//     const duplicate =
//       vehicleStatuses.some(
//         (item, index) =>
//           index !==
//             editingStatusIndex &&
//           String(item).toLowerCase() ===
//             value.toLowerCase()
//       );

//     if (duplicate) return;

//     persistVehicleStatuses(
//       vehicleStatuses.map(
//         (item, index) =>
//           index === editingStatusIndex
//             ? value
//             : item
//       )
//     );

//     setEditingStatusIndex(null);
//     setEditStatusValue("");
//   };

//   return (
//     <motion.div
//       variants={tabVariants}
//       initial="hidden"
//       animate="visible"
//       className="space-y-5"
//     >
//       <SettingCard>
//         <SectionTitle
//           icon={Truck}
//           title="Vehicle Types"
//           description="Manage vehicle categories available throughout the fleet portal."
//         />

//         <div className="mb-5 flex flex-col gap-3 sm:flex-row">
//           <input
//             value={newVehicleType}
//             onChange={(e) =>
//               setNewVehicleType(
//                 e.target.value
//               )
//             }
//             onKeyDown={(e) => {
//               if (e.key === "Enter")
//                 addVehicleType();
//             }}
//             placeholder="Add new vehicle type"
//             className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
//           />

//           <button
//             type="button"
//             onClick={addVehicleType}
//             className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
//           >
//             <Plus size={17} />
//             Add Type
//           </button>
//         </div>

//         <div className="space-y-2">
//           {vehicleTypes.map(
//             (type, index) => (
//               <motion.div
//                 key={`${type}-${index}`}
//                 layout
//                 className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 transition-all duration-200 hover:bg-blue-50/50"
//               >
//                 {editingTypeIndex ===
//                 index ? (
//                   <div className="flex flex-1 items-center gap-2">
//                     <input
//                       value={
//                         editTypeValue
//                       }
//                       onChange={(e) =>
//                         setEditTypeValue(
//                           e.target.value
//                         )
//                       }
//                       onKeyDown={(e) => {
//                         if (
//                           e.key ===
//                           "Enter"
//                         ) {
//                           saveVehicleTypeEdit();
//                         }
//                       }}
//                       className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-blue-50"
//                       autoFocus
//                     />

//                     <button
//                       type="button"
//                       onClick={
//                         saveVehicleTypeEdit
//                       }
//                       className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition hover:bg-emerald-100"
//                     >
//                       <CheckCircle2
//                         size={17}
//                       />
//                     </button>

//                     <button
//                       type="button"
//                       onClick={() => {
//                         setEditingTypeIndex(
//                           null
//                         );
//                         setEditTypeValue(
//                           ""
//                         );
//                       }}
//                       className="rounded-lg bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
//                     >
//                       <X size={17} />
//                     </button>
//                   </div>
//                 ) : (
//                   <>
//                     <div className="flex items-center gap-3">
//                       <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
//                         <Truck size={18} />
//                       </div>

//                       <span className="text-sm font-semibold text-slate-700">
//                         {type}
//                       </span>
//                     </div>

//                     <div className="flex items-center gap-1">
//                       <button
//                         type="button"
//                         onClick={() =>
//                           startEditVehicleType(
//                             index
//                           )
//                         }
//                         className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-blue-600"
//                       >
//                         <Pencil size={16} />
//                       </button>

//                       <button
//                         type="button"
//                         onClick={() =>
//                           removeVehicleType(
//                             index
//                           )
//                         }
//                         disabled={
//                           vehicleTypes.length <=
//                           1
//                         }
//                         className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </>
//                 )}
//               </motion.div>
//             )
//           )}
//         </div>
//       </SettingCard>

//       <SettingCard>
//         <SectionTitle
//           icon={CheckCircle2}
//           title="Vehicle Status"
//           description="Manage the statuses available for vehicles in the fleet portal."
//         />

//         <div className="mb-5 flex flex-col gap-3 sm:flex-row">
//           <input
//             value={newVehicleStatus}
//             onChange={(e) =>
//               setNewVehicleStatus(
//                 e.target.value
//               )
//             }
//             onKeyDown={(e) => {
//               if (e.key === "Enter")
//                 addVehicleStatus();
//             }}
//             placeholder="Add new vehicle status"
//             className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
//           />

//           <button
//             type="button"
//             onClick={addVehicleStatus}
//             className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
//           >
//             <Plus size={17} />
//             Add Status
//           </button>
//         </div>

//         <div className="space-y-2">
//           {vehicleStatuses.map(
//             (status, index) => (
//               <motion.div
//                 key={`${status}-${index}`}
//                 layout
//                 className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 transition-all duration-200 hover:bg-blue-50/50"
//               >
//                 {editingStatusIndex ===
//                 index ? (
//                   <div className="flex flex-1 items-center gap-2">
//                     <input
//                       value={
//                         editStatusValue
//                       }
//                       onChange={(e) =>
//                         setEditStatusValue(
//                           e.target.value
//                         )
//                       }
//                       onKeyDown={(e) => {
//                         if (
//                           e.key ===
//                           "Enter"
//                         ) {
//                           saveVehicleStatusEdit();
//                         }
//                       }}
//                       className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-blue-50"
//                       autoFocus
//                     />

//                     <button
//                       type="button"
//                       onClick={
//                         saveVehicleStatusEdit
//                       }
//                       className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition hover:bg-emerald-100"
//                     >
//                       <CheckCircle2 size={17} />
//                     </button>

//                     <button
//                       type="button"
//                       onClick={() => {
//                         setEditingStatusIndex(
//                           null
//                         );
//                         setEditStatusValue(
//                           ""
//                         );
//                       }}
//                       className="rounded-lg bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
//                     >
//                       <X size={17} />
//                     </button>
//                   </div>
//                 ) : (
//                   <>
//                     <div className="flex items-center gap-3">
//                       <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
//                         <CheckCircle2 size={18} />
//                       </div>

//                       <span className="text-sm font-semibold text-slate-700">
//                         {status}
//                       </span>
//                     </div>

//                     <div className="flex items-center gap-1">
//                       <button
//                         type="button"
//                         onClick={() =>
//                           startEditVehicleStatus(
//                             index
//                           )
//                         }
//                         className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-blue-600"
//                       >
//                         <Pencil size={16} />
//                       </button>

//                       <button
//                         type="button"
//                         onClick={() =>
//                           removeVehicleStatus(
//                             index
//                           )
//                         }
//                         disabled={
//                           vehicleStatuses.length <=
//                           1
//                         }
//                         className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </>
//                 )}
//               </motion.div>
//             )
//           )}
//         </div>
//       </SettingCard>

//       <SettingCard>
//         <SectionTitle
//           icon={Activity}
//           title="Fuel Types"
//           description="Fuel options available while adding or editing vehicles."
//         />

//         <div className="flex flex-wrap gap-2">
//           {[
//             "Diesel",
//             "Petrol",
//             "CNG",
//             "Electric",
//             "Hybrid",
//           ].map((fuel) => (
//             <span
//               key={fuel}
//               className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
//             >
//               {fuel}
//             </span>
//           ))}
//         </div>
//       </SettingCard>
//     </motion.div>
//   );
// }

// /* ============================================================
//    EMI
// ============================================================ */

// function EMISettings({
//   settings,
//   updateSetting,
// }) {
//   return (
//     <motion.div
//       variants={tabVariants}
//       initial="hidden"
//       animate="visible"
//       className="space-y-5"
//     >
//       <SettingCard>
//         <SectionTitle
//           icon={IndianRupee}
//           title="EMI & Finance"
//           description="Configure payment preferences used by the EMI management module."
//         />

//         <div className="grid gap-5 md:grid-cols-2">
//           <SelectField
//             label="Default Payment Mode"
//             value={
//               settings.paymentMode ??
//               settings.defaultPaymentMode ??
//               "Bank Transfer"
//             }
//             onChange={(value) =>
//               updateSetting(
//                 "paymentMode",
//                 value
//               )
//             }
//           >
//             <option value="Bank Transfer">
//               Bank Transfer
//             </option>
//             <option value="UPI">UPI</option>
//             <option value="Cash">Cash</option>
//             <option value="Cheque">Cheque</option>
//           </SelectField>
//         </div>

//         <div className="mt-5">
//           <SettingRow
//             icon={Bell}
//             title="EMI Payment Reminders"
//             description="Automatically show upcoming EMI payments on the dashboard."
//           >
//             <Toggle
//               checked={Boolean(
//                 settings.emiAlerts
//               )}
//               onChange={(value) =>
//                 updateSetting(
//                   "emiAlerts",
//                   value
//                 )
//               }
//             />
//           </SettingRow>
//         </div>
//       </SettingCard>
//     </motion.div>
//   );
// }

// /* ============================================================
//    CHALLANS
// ============================================================ */

// function ChallanSettings({
//   settings,
//   updateSetting,
// }) {
//   return (
//     <motion.div
//       variants={tabVariants}
//       initial="hidden"
//       animate="visible"
//       className="space-y-5"
//     >
//       <SettingCard>
//         <SectionTitle
//           icon={ReceiptText}
//           title="e-Challan Integration"
//           description="Configure automatic challan synchronization with external services."
//         />

//         <div className="mb-5 flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
//           <div className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
//               <WifiOff size={18} />
//             </div>

//             <div>
//               <p className="text-sm font-bold text-slate-800">
//                 Integration Status
//               </p>

//               <p className="text-xs text-slate-500">
//                 Backend/API configuration required
//               </p>
//             </div>
//           </div>

//           <StatusBadge connected={false}>
//             Not Configured
//           </StatusBadge>
//         </div>

//         <SettingRow
//           icon={RefreshCw}
//           title="Automatic Synchronization"
//           description="Automatically fetch new vehicle challans after a supported backend integration is configured."
//         >
//           <Toggle
//             checked={Boolean(
//               settings.challanAutoSync
//             )}
//             onChange={(value) =>
//               updateSetting(
//                 "challanAutoSync",
//                 value
//               )
//             }
//           />
//         </SettingRow>

//         <div className="py-5">
//           <SelectField
//             label="Synchronization Frequency"
//             value={settings.syncFrequency}
//             onChange={(value) =>
//               updateSetting(
//                 "syncFrequency",
//                 value
//               )
//             }
//           >
//             <option value="15">
//               Every 15 minutes
//             </option>
//             <option value="30">
//               Every 30 minutes
//             </option>
//             <option value="60">
//               Every 1 hour
//             </option>
//             <option value="180">
//               Every 3 hours
//             </option>
//             <option value="360">
//               Every 6 hours
//             </option>
//           </SelectField>
//         </div>

//         <button
//           type="button"
//           disabled
//           className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-400"
//         >
//           <RefreshCw size={17} />
//           Sync Now
//         </button>

//         <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
//           <CircleHelp
//             size={18}
//             className="mt-0.5 shrink-0 text-blue-600"
//           />

//           <p className="text-xs leading-5 text-blue-700">
//             The Sync Now action will be enabled after the
//             backend e-Challan integration is implemented.
//           </p>
//         </div>
//       </SettingCard>
//     </motion.div>
//   );
// }

// /* ============================================================
//    USERS & ROLES
// ============================================================ */

// function UserRoleSettings({
//   settings,
//   updateSetting,
//   currentUserRole,
// }) {
//   const roles = [
//     {
//       name: "Admin",
//       description:
//         "Full access to the complete fleet portal.",
//       color: "bg-blue-50 text-blue-700",
//     },
//     {
//       name: "Manager",
//       description:
//         "Can view and add fleet records, but cannot edit/delete records, manage users or change settings.",
//       color:
//         "bg-emerald-50 text-emerald-700",
//     },
//     {
//       name: "Finance",
//       description:
//         "Finance access for viewing EMI and payment information and marking eligible payments as paid.",
//       color:
//         "bg-amber-50 text-amber-700",
//     },
//     {
//       name: "User",
//       description:
//         "Can view and add records, but cannot edit, delete or mark payments as paid.",
//       color:
//         "bg-slate-100 text-slate-600",
//     },
//   ];

//   const permissionLabels = [
//     {
//       key: "view",
//       label: "View",
//     },
//     {
//       key: "add",
//       label: "Add",
//     },
//     {
//       key: "edit",
//       label: "Edit",
//     },
//     {
//       key: "delete",
//       label: "Delete",
//     },
//     {
//       key: "paid",
//       label: "Paid",
//     },
//     {
//       key: "settings",
//       label: "Settings",
//     },
//     {
//       key: "users",
//       label: "Users",
//     },
//   ];

//   const canManagePermissions =
//     currentUserRole === "Admin";

//   const currentPermissions =
//     normalizeRolePermissions(
//       settings.rolePermissions
//     );

//   const getRolePermissions = (
//     role
//   ) => {
//     return {
//       ...defaultRolePermissions[role],
//       ...(currentPermissions?.[role] ||
//         {}),
//     };
//   };

//   const updateRolePermission = (
//     role,
//     permission,
//     value
//   ) => {
//     /*
//       Only Admin can change the permission
//       matrix.

//       This is intentionally checked here
//       instead of only hiding the UI because
//       UI hiding alone is not permission
//       enforcement.
//     */
//     if (!canManagePermissions) {
//       return;
//     }

//     /*
//       Admin must always retain complete access.
//     */
//     if (role === "Admin") {
//       return;
//     }

//     const updatedPermissions =
//       normalizeRolePermissions(
//         currentPermissions
//       );

//     updatedPermissions[role] = {
//       ...getRolePermissions(role),
//       [permission]: Boolean(value),
//     };

//     updateSetting(
//       "rolePermissions",
//       updatedPermissions
//     );
//   };

//   return (
//     <motion.div
//       variants={tabVariants}
//       initial="hidden"
//       animate="visible"
//       className="space-y-5"
//     >
//       <SettingCard>
//         <SectionTitle
//           icon={Users}
//           title="Users & Roles"
//           description="Define access levels and responsibilities for portal users."
//         />

//         <div className="space-y-3">
//           {roles.map((role) => (
//             <div
//               key={role.name}
//               className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4"
//             >
//               <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
//                     <Users size={18} />
//                   </div>

//                   <div>
//                     <p className="text-sm font-bold text-slate-800">
//                       {role.name}
//                     </p>

//                     <p className="mt-0.5 text-xs text-slate-500">
//                       {role.description}
//                     </p>
//                   </div>
//                 </div>

//                 <span
//                   className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${role.color}`}
//                 >
//                   Role
//                 </span>
//               </div>

//               <div className="mt-2 border-t border-slate-200 pt-3">
//                 <div className="flex flex-wrap gap-2">
//                   {permissionLabels.map(
//                     (permission) => {
//                       const enabled =
//                         Boolean(
//                           getRolePermissions(
//                             role.name
//                           )[permission.key]
//                         );

//                       return (
//                         <button
//                           key={`${role.name}-${permission.key}`}
//                           type="button"
//                           disabled={
//                             !canManagePermissions ||
//                             role.name === "Admin"
//                           }
//                           onClick={() =>
//                             updateRolePermission(
//                               role.name,
//                               permission.key,
//                               !enabled
//                             )
//                           }
//                           className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
//                             enabled
//                               ? "border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100"
//                               : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50"
//                           }`}
//                         >
//                           {enabled ? (
//                             <CheckCircle2
//                               size={13}
//                             />
//                           ) : (
//                             <X size={13} />
//                           )}

//                           {permission.label}
//                         </button>
//                       );
//                     }
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </SettingCard>

//       <SettingCard>
//         <SectionTitle
//           icon={ShieldCheck}
//           title="Permission Summary"
//           description="These permissions are stored in FleetDoc Settings and can be used by the Users module."
//         />

//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[700px]">
//             <thead>
//               <tr className="border-b border-slate-100 text-left">
//                 <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
//                   Role
//                 </th>

//                 {permissionLabels.map(
//                   (permission) => (
//                     <th
//                       key={permission.key}
//                       className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500"
//                     >
//                       {permission.label}
//                     </th>
//                   )
//                 )}
//               </tr>
//             </thead>

//             <tbody>
//               {roles.map((role) => {
//                 const permissions =
//                   getRolePermissions(
//                     role.name
//                   );

//                 return (
//                   <tr
//                     key={`summary-${role.name}`}
//                     className="border-b border-slate-50 transition-colors duration-200 hover:bg-slate-50"
//                   >
//                     <td className="px-3 py-4">
//                       <span className="text-sm font-semibold text-slate-700">
//                         {role.name}
//                       </span>
//                     </td>

//                     {permissionLabels.map(
//                       (permission) => {
//                         const enabled =
//                           Boolean(
//                             permissions[
//                               permission.key
//                             ]
//                           );

//                         return (
//                           <td
//                             key={`${role.name}-summary-${permission.key}`}
//                             className="px-3 py-4 text-center"
//                           >
//                             {enabled ? (
//                               <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
//                                 <CheckCircle2
//                                   size={15}
//                                 />
//                               </span>
//                             ) : (
//                               <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400">
//                                 <X size={14} />
//                               </span>
//                             )}
//                           </td>
//                         );
//                       }
//                     )}
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </SettingCard>

//       <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
//         <CircleHelp
//           size={19}
//           className="mt-0.5 shrink-0 text-blue-600"
//         />

//         <p className="text-xs leading-5 text-blue-700">
//           Role permissions are stored with FleetDoc Settings.
//           The Users module and individual portal pages should
//           enforce these permissions before showing or executing
//           Add, Edit, Delete and Paid actions.
//         </p>
//       </div>
//     </motion.div>
//   );
// }

// // /* ============================================================
// //    SECURITY
// // ============================================================ */

// function SecuritySettings({
//   settings,
//   updateSetting,
// }) {
//   const {
//     notify,
//     getCurrentUser,
//     getCurrentUserRole,
//   } = useFleet();

//   const [showPassword, setShowPassword] =
//     useState(false);
//   const [showCurrentPassword, setShowCurrentPassword] =
//     useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] =
//     useState(false);
//   const [currentPassword, setCurrentPassword] =
//     useState("");
//   const [password, setPassword] =
//     useState("");
//   const [confirmPassword, setConfirmPassword] =
//     useState("");
//   const [changingPassword, setChangingPassword] =
//     useState(false);

//   const currentRole =
//     getCurrentUserRole?.() ||
//     localStorage.getItem("fleetdoc_user_role") ||
//     "User";

//   const rolePermissions =
//     normalizeRolePermissions(
//       settings?.rolePermissions
//     );

//   const canChangePassword =
//     currentRole === "Admin" ||
//     Boolean(
//       rolePermissions?.[currentRole]?.password
//     );

//   const handleChangePassword = async () => {
//     if (!canChangePassword) {
//       notify?.(
//         "You do not have permission to change the password.",
//         "error"
//       );
//       return;
//     }

//     if (!currentPassword) {
//       notify?.(
//         "Please enter your current password.",
//         "error"
//       );
//       return;
//     }

//     if (!password) {
//       notify?.(
//         "Please enter a new password.",
//         "error"
//       );
//       return;
//     }

//     if (password !== confirmPassword) {
//       notify?.(
//         "New password and confirm password do not match.",
//         "error"
//       );
//       return;
//     }

//     if (currentPassword === password) {
//       notify?.(
//         "New password must be different from the current password.",
//         "error"
//       );
//       return;
//     }

//     if (Boolean(settings?.strongPassword ?? settings?.strongPasswordRequired)) {
//       if (password.length < 6) {
//         notify?.(
//           "Password must be at least 6 characters.",
//           "error"
//         );
//         return;
//       }
//       if (!/[A-Z]/.test(password)) {
//         notify?.(
//           "Password must contain at least one capital letter.",
//           "error"
//         );
//         return;
//       }
//       if (!/[0-9]/.test(password)) {
//         notify?.(
//           "Password must contain at least one number.",
//           "error"
//         );
//         return;
//       }
//       if (!/[^A-Za-z0-9]/.test(password)) {
//         notify?.(
//           "Password must contain at least one special character.",
//           "error"
//         );
//         return;
//       }
//     }

//     setChangingPassword(true);

//     try {
//       await settingsApi("/auth/change-password", {
//         method: "POST",
//         body: JSON.stringify({
//           current_password: currentPassword,
//           new_password: password,
//         }),
//       });

//       const user = getCurrentUser?.();
//       const userName =
//         user?.name ||
//         localStorage.getItem("fleetdoc_user_name") ||
//         localStorage.getItem("fleetdoc_user_email") ||
//         "Current User";

//       /* Notify the Audit Logs screen immediately. The backend also
//          stores the authoritative audit record in PostgreSQL. */
//       window.dispatchEvent(
//         new CustomEvent("fleetdoc-audit-updated", {
//           detail: {
//             user: userName,
//             action: "Password changed",
//             module: "Security",
//           },
//         })
//       );

//       setCurrentPassword("");
//       setPassword("");
//       setConfirmPassword("");

//       notify?.(
//         "Password changed successfully.",
//         "success"
//       );
//     } catch (error) {
//       console.error(
//         "Password change failed:",
//         error
//       );
//       notify?.(
//         error?.message ||
//           "Unable to change password.",
//         "error"
//       );
//     } finally {
//       setChangingPassword(false);
//     }
//   };

//   const PasswordInput = ({
//     label,
//     value,
//     onChange,
//     visible,
//     onToggle,
//     placeholder,
//   }) => (
//     <label className="block">
//       <span className="mb-2 block text-sm font-semibold text-slate-700">
//         {label}
//       </span>

//       <div className="relative">
//         <input
//           type={visible ? "text" : "password"}
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           placeholder={placeholder}
//           autoComplete="new-password"
//           className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
//         />

//         <button
//           type="button"
//           onClick={onToggle}
//           className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
//           aria-label={visible ? `Hide ${label}` : `Show ${label}`}
//         >
//           {visible ? <EyeOff size={18} /> : <Eye size={18} />}
//         </button>
//       </div>
//     </label>
//   );

//   return (
//     <motion.div
//       variants={tabVariants}
//       initial="hidden"
//       animate="visible"
//       className="space-y-5"
//     >
//       <SettingCard>
//         <SectionTitle
//           icon={ShieldCheck}
//           title="Security"
//           description="Protect your fleet portal and user accounts."
//         />

//         <SettingRow
//           icon={KeyRound}
//           title="Two-Factor Authentication"
//           description="Require an additional verification step during login."
//         >
//           <Toggle
//             checked={Boolean(settings.twoFactor)}
//             onChange={(value) =>
//               updateSetting("twoFactor", value)
//             }
//           />
//         </SettingRow>

//         <SettingRow
//           icon={Lock}
//           title="Strong Password Policy"
//           description="Require users to use stronger passwords."
//         >
//           <Toggle
//             checked={Boolean(settings.strongPassword)}
//             onChange={(value) =>
//               updateSetting("strongPassword", value)
//             }
//           />
//         </SettingRow>

//         <SettingRow
//           icon={Clock3}
//           title="Session Timeout"
//           description="Automatically log users out after a period of inactivity."
//         >
//           <select
//             value={settings.sessionTimeout}
//             onChange={(e) =>
//               updateSetting(
//                 "sessionTimeout",
//                 Number(e.target.value)
//               )
//             }
//             className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
//           >
//             <option value={15}>15 minutes</option>
//             <option value={30}>30 minutes</option>
//             <option value={60}>1 hour</option>
//             <option value={120}>2 hours</option>
//           </select>
//         </SettingRow>
//       </SettingCard>

//       <SettingCard>
//         <SectionTitle
//           icon={Lock}
//           title="Password"
//           description="Password changes should be handled securely by the backend."
//         />

//         <div className="max-w-xl space-y-4">
//           {!canChangePassword && (
//             <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
//               <AlertTriangle
//                 size={18}
//                 className="mt-0.5 shrink-0 text-amber-600"
//               />
//               <p className="text-xs leading-5 text-amber-700">
//                 Your current role does not have password-change permission. An Admin can enable the Password permission in Users & Roles.
//               </p>
//             </div>
//           )}

//           <PasswordInput
//             label="Current Password"
//             value={currentPassword}
//             onChange={setCurrentPassword}
//             visible={showCurrentPassword}
//             onToggle={() =>
//               setShowCurrentPassword((prev) => !prev)
//             }
//             placeholder="Enter current password"
//           />

//           <PasswordInput
//             label="New Password"
//             value={password}
//             onChange={setPassword}
//             visible={showPassword}
//             onToggle={() =>
//               setShowPassword((prev) => !prev)
//             }
//             placeholder="Enter new password"
//           />

//           <PasswordInput
//             label="Confirm New Password"
//             value={confirmPassword}
//             onChange={setConfirmPassword}
//             visible={showConfirmPassword}
//             onToggle={() =>
//               setShowConfirmPassword((prev) => !prev)
//             }
//             placeholder="Re-enter new password"
//           />

//           <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//             <p className="text-xs leading-5 text-slate-500">
//               {settings?.strongPassword ?? settings?.strongPasswordRequired
//                 ? "Use at least 6 characters with a capital letter, number and special character."
//                 : "Use a secure password that you do not reuse elsewhere."}
//             </p>

//             <button
//               type="button"
//               onClick={handleChangePassword}
//               disabled={changingPassword || !canChangePassword}
//               className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {changingPassword ? (
//                 <RefreshCw size={16} className="animate-spin" />
//               ) : (
//                 <Lock size={16} />
//               )}
//               {changingPassword ? "Changing..." : "Change Password"}
//             </button>
//           </div>

//           <div className="mt-1 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
//             <ShieldCheck
//               size={18}
//               className="mt-0.5 shrink-0 text-blue-600"
//             />
//             <p className="text-xs leading-5 text-blue-700">
//               Your current password is verified by the backend, the new password is securely hashed, and the change is recorded in Audit Logs.
//             </p>
//           </div>
//         </div>
//       </SettingCard>
//     </motion.div>
//   );
// }

// /* ============================================================
//    BACKUP
// ============================================================ */

// function BackupSettings() {
//   const {
//     exportFleetData,
//     importFleetData,
//     notify,
//   } = useFleet();

//   const fileInputRef = useRef(null);

//   const [restoring, setRestoring] =
//     useState(false);

//   const handleExport = async () => {
//     try {
//       const data =
//         await exportFleetData?.();

//       if (!data) {
//         notify?.(
//           "No FleetDoc data is available to export.",
//           "error"
//         );
//         return;
//       }

//       const blob = new Blob([data], {
//         type: "application/json;charset=utf-8",
//       });

//       const url =
//         URL.createObjectURL(blob);

//       const link =
//         document.createElement("a");

//       link.href = url;

//       link.download = `fleetdoc-backup-${new Date()
//         .toISOString()
//         .slice(0, 10)}.json`;

//       document.body.appendChild(link);
//       link.click();
//       link.remove();

//       URL.revokeObjectURL(url);

//       notify?.(
//         "FleetDoc backup exported successfully.",
//         "success"
//       );
//     } catch (error) {
//       console.error(
//         "FleetDoc: Backup export failed",
//         error
//       );

//       notify?.(
//         "Unable to export FleetDoc backup.",
//         "error"
//       );
//     }
//   };

//   const handleRestoreFile = async (
//     event
//   ) => {
//     const file =
//       event.target.files?.[0];

//     event.target.value = "";

//     if (!file) return;

//     if (
//       file.type &&
//       file.type !==
//         "application/json" &&
//       !file.name
//         .toLowerCase()
//         .endsWith(".json")
//     ) {
//       notify?.(
//         "Please select a valid FleetDoc JSON backup file.",
//         "error"
//       );
//       return;
//     }

//     setRestoring(true);

//     try {
//       const parsed = JSON.parse(
//         await file.text()
//       );

//       const confirmed =
//         window.confirm(
//           "Restore this FleetDoc backup? Current local fleet data will be replaced by the backup."
//         );

//       if (!confirmed) return;

//       await importFleetData?.(parsed);
//     } catch (error) {
//       console.error(
//         "FleetDoc: Backup restore failed",
//         error
//       );

//       notify?.(
//         "Invalid or corrupted FleetDoc backup file.",
//         "error"
//       );
//     } finally {
//       setRestoring(false);
//     }
//   };

//   return (
//     <motion.div
//       variants={tabVariants}
//       initial="hidden"
//       animate="visible"
//       className="space-y-5"
//     >
//       <SettingCard>
//         <SectionTitle
//           icon={Database}
//           title="Backup & Data"
//           description="Manage your portal data backup and export options."
//         />

//         <div className="grid gap-4 md:grid-cols-2">
//           <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
//             <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
//               <Download size={20} />
//             </div>

//             <h3 className="font-bold text-slate-800">
//               Export Data
//             </h3>

//             <p className="mt-1 text-xs leading-5 text-slate-500">
//               Export your current fleet portal data as a JSON backup file.
//             </p>

//             <button
//               type="button"
//               onClick={handleExport}
//               className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
//             >
//               <Download size={16} />
//               Export Data
//             </button>
//           </div>

//           <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
//             <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
//               <Upload size={20} />
//             </div>

//             <h3 className="font-bold text-slate-800">
//               Restore Data
//             </h3>

//             <p className="mt-1 text-xs leading-5 text-slate-500">
//               Restore FleetDoc data from a previously exported JSON backup file.
//             </p>

//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="application/json,.json"
//               onChange={
//                 handleRestoreFile
//               }
//               className="hidden"
//             />

//             <button
//               type="button"
//               onClick={() =>
//                 fileInputRef.current?.click()
//               }
//               disabled={restoring}
//               className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {restoring ? (
//                 <RefreshCw
//                   size={16}
//                   className="animate-spin"
//                 />
//               ) : (
//                 <Upload size={16} />
//               )}

//               {restoring
//                 ? "Restoring..."
//                 : "Restore Backup"}
//             </button>
//           </div>
//         </div>
//       </SettingCard>

//       <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
//         <Database
//           size={19}
//           className="mt-0.5 shrink-0 text-blue-600"
//         />

//         <div>
//           <p className="text-sm font-semibold text-blue-800">
//             PostgreSQL Database Storage
//           </p>

//           <p className="mt-1 text-xs leading-5 text-blue-700">
//             Your FleetDoc data is securely managed through the PostgreSQL database.
//             Use Backup & Data to export a complete backup or restore your data
//             whenever required. All backup and restore operations are processed
//             securely through the FleetDoc backend.
//           </p>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// /* ============================================================
//    INTEGRATIONS
// ============================================================ */

// function IntegrationSettings() {
//   const integrations = [
//     {
//       name: "e-Challan Service",
//       description:
//         "Fetch vehicle challans automatically after API integration.",
//       icon: ReceiptText,
//       connected: false,
//     },
//     {
//       name: "Dispatch Portal",
//       description:
//         "Synchronize dispatch and trip information.",
//       icon: Truck,
//       connected: false,
//     },
//     {
//       name: "Payment Gateway",
//       description:
//         "Process online challan and other payments.",
//       icon: CreditCard,
//       connected: false,
//     },
//     {
//       name: "Email Service",
//       description:
//         "Send automated portal notifications.",
//       icon: Mail,
//       connected: false,
//     },
//   ];

//   return (
//     <motion.div
//       variants={tabVariants}
//       initial="hidden"
//       animate="visible"
//       className="space-y-5"
//     >
//       <SettingCard>
//         <SectionTitle
//           icon={Plug}
//           title="External Integrations"
//           description="Connect your fleet portal with external services."
//         />

//         <div className="grid gap-4 md:grid-cols-2">
//           {integrations.map(
//             (integration) => {
//               const Icon =
//                 integration.icon;

//               return (
//                 <div
//                   key={integration.name}
//                   className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md"
//                 >
//                   <div className="flex items-start justify-between gap-3">
//                     <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
//                       <Icon size={20} />
//                     </div>

//                     <StatusBadge
//                       connected={
//                         integration.connected
//                       }
//                     >
//                       {integration.connected
//                         ? "Connected"
//                         : "Not Connected"}
//                     </StatusBadge>
//                   </div>

//                   <h3 className="mt-4 text-sm font-bold text-slate-800">
//                     {integration.name}
//                   </h3>

//                   <p className="mt-1 text-xs leading-5 text-slate-500">
//                     {integration.description}
//                   </p>

//                   <button
//                     type="button"
//                     disabled
//                     className="mt-4 inline-flex cursor-not-allowed items-center gap-1.5 text-sm font-semibold text-slate-400"
//                   >
//                     Configure
//                     <ChevronRight size={16} />
//                   </button>
//                 </div>
//               );
//             }
//           )}
//         </div>
//       </SettingCard>

//       <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
//         <CircleHelp
//           size={19}
//           className="mt-0.5 shrink-0 text-amber-600"
//         />

//         <div>
//           <p className="text-sm font-semibold text-amber-800">
//             API credentials
//           </p>

//           <p className="mt-1 text-xs leading-5 text-amber-700">
//             API keys and secret credentials should be stored
//             securely in the Python backend environment, not
//             directly inside the React frontend.
//           </p>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// /* ============================================================
//    APPEARANCE
// ============================================================ */

// function AppearanceSettings({
//   settings,
//   updateSetting,
// }) {
//   return (
//     <motion.div
//       variants={tabVariants}
//       initial="hidden"
//       animate="visible"
//       className="space-y-5"
//     >
//       <SettingCard>
//         <SectionTitle
//           icon={Palette}
//           title="Appearance"
//           description="Customize the look and behavior of your fleet portal."
//         />

//         <div className="grid gap-3 sm:grid-cols-3">
//           {[
//             {
//               id: "light",
//               label: "Light",
//               icon: Sun,
//             },
//             {
//               id: "dark",
//               label: "Dark",
//               icon: Moon,
//             },
//             {
//               id: "system",
//               label: "System",
//               icon: Monitor,
//             },
//           ].map((theme) => {
//             const Icon = theme.icon;

//             const active =
//               settings.theme ===
//               theme.id;

//             return (
//               <button
//                 key={theme.id}
//                 type="button"
//                 onClick={() =>
//                   updateSetting(
//                     "theme",
//                     theme.id
//                   )
//                 }
//                 className={`rounded-2xl border p-5 text-left transition-all duration-300 ${
//                   active
//                     ? "border-blue-300 bg-blue-50 shadow-sm"
//                     : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md"
//                 }`}
//               >
//                 <Icon
//                   size={21}
//                   className={
//                     active
//                       ? "text-blue-600"
//                       : "text-slate-500"
//                   }
//                 />

//                 <p className="mt-3 text-sm font-bold text-slate-800">
//                   {theme.label}
//                 </p>

//                 {active && (
//                   <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-blue-600">
//                     <CheckCircle2 size={14} />
//                     Selected
//                   </div>
//                 )}
//               </button>
//             );
//           })}
//         </div>
//       </SettingCard>

//       <SettingCard>
//         <SettingRow
//           icon={Activity}
//           title="Interface Animations"
//           description="Enable smooth transitions and animations throughout the portal."
//         >
//           <Toggle
//             checked={Boolean(
//               settings.animations
//             )}
//             onChange={(value) =>
//               updateSetting(
//                 "animations",
//                 value
//               )
//             }
//           />
//         </SettingRow>

//         <SettingRow
//           icon={Palette}
//           title="Compact Tables"
//           description="Reduce table row spacing to display more fleet data."
//         >
//           <Toggle
//             checked={Boolean(
//               settings.compactTables
//             )}
//             onChange={(value) =>
//               updateSetting(
//                 "compactTables",
//                 value
//               )
//             }
//           />
//         </SettingRow>
//       </SettingCard>
//     </motion.div>
//   );
// }

// /* ============================================================
//    AUDIT LOGS
// ============================================================ */

// function AuditSettings() {
//   const {
//     auditLogs: contextAuditLogs = [],
//     settings,
//     notify,
//   } = useFleet();

//   const [serverLogs, setServerLogs] = useState([]);
//   const [loadingLogs, setLoadingLogs] = useState(false);
//   const [showClearModal, setShowClearModal] = useState(false);

//   const logs = Array.isArray(serverLogs)
//     ? serverLogs
//     : Array.isArray(contextAuditLogs)
//     ? contextAuditLogs
//     : [];

//   const loadAuditLogs = async () => {
//     if (settings?.auditLogsEnabled === false) {
//       setServerLogs([]);
//       return;
//     }

//     setLoadingLogs(true);
//     try {
//       const data = await settingsApi("/audit-logs?limit=500");
//       setServerLogs(Array.isArray(data) ? data : []);
//     } catch (error) {
//       console.error("Unable to load audit logs:", error);
//       // Keep the existing context logs as a compatibility fallback.
//       setServerLogs(
//         Array.isArray(contextAuditLogs)
//           ? contextAuditLogs
//           : []
//       );
//     } finally {
//       setLoadingLogs(false);
//     }
//   };

//   useEffect(() => {
//     loadAuditLogs();
//   }, [settings?.auditLogsEnabled]);

//   useEffect(() => {
//     const refresh = () => loadAuditLogs();
//     window.addEventListener(
//       "fleetdoc-audit-updated",
//       refresh
//     );
//     return () =>
//       window.removeEventListener(
//         "fleetdoc-audit-updated",
//         refresh
//       );
//   }, [settings?.auditLogsEnabled]);

//   const formatLogTime = (value) => {
//     if (!value) return "-";
//     const date = new Date(value);
//     if (Number.isNaN(date.getTime())) return String(value);
//     return date.toLocaleString("en-IN", {
//       dateStyle: "medium",
//       timeStyle: "short",
//     });
//   };

//   const moduleIcon = {
//     Settings: SettingsIcon,
//     Vehicles: Truck,
//     Documents: FileText,
//     EMI: IndianRupee,
//     Challans: ReceiptText,
//     Users,
//     Security: ShieldCheck,
//     Backup: Database,
//     System: Activity,
//   };

//   const handleClear = () => {
//     if (!logs.length) return;
//     setShowClearModal(true);
//   };

//   const confirmClearLogs = async () => {
//     try {
//       await settingsApi("/audit-logs", {
//         method: "DELETE",
//       });
//       setServerLogs([]);
//       setShowClearModal(false);
//       notify?.("Audit logs cleared successfully.", "success");
//     } catch (error) {
//       console.error("Unable to clear audit logs:", error);
//       notify?.(
//         error?.message || "Unable to clear audit logs.",
//         "error"
//       );
//     }
//   };

//   return (
//     <>
//       <motion.div
//         variants={tabVariants}
//         initial="hidden"
//         animate="visible"
//         className="space-y-5"
//       >
//         <SettingCard>
//           <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
//             <SectionTitle
//               icon={ClipboardList}
//               title="Audit Logs"
//               description="Track important actions performed inside the fleet portal."
//             />

//             {settings?.auditLogsEnabled !== false && logs.length > 0 && (
//               <button
//                 type="button"
//                 onClick={handleClear}
//                 className="group inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-100 hover:shadow-md hover:shadow-red-100"
//               >
//                 <Trash2
//                   size={16}
//                   className="transition-transform duration-300 group-hover:scale-110"
//                 />
//                 Clear Logs
//               </button>
//             )}
//           </div>

//           <div className="mb-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
//             <Activity
//               size={18}
//               className="mt-0.5 shrink-0 text-blue-600"
//             />
//             <p className="text-xs leading-5 text-blue-700">
//               Audit entries are stored in the FleetDoc backend database and loaded here for the signed-in user.
//             </p>
//           </div>

//           {settings?.auditLogsEnabled === false ? (
//             <div className="rounded-xl border border-slate-100 bg-slate-50 p-8 text-center">
//               <ClipboardList className="mx-auto text-slate-400" size={28} />
//               <p className="mt-3 text-sm font-semibold text-slate-700">
//                 Audit logging is disabled
//               </p>
//               <p className="mt-1 text-xs text-slate-500">
//                 Turn on audit logging to record future activity.
//               </p>
//             </div>
//           ) : loadingLogs ? (
//             <div className="rounded-xl border border-slate-100 bg-slate-50 p-8 text-center">
//               <RefreshCw className="mx-auto animate-spin text-blue-500" size={28} />
//               <p className="mt-3 text-sm font-semibold text-slate-700">
//                 Loading audit activity...
//               </p>
//             </div>
//           ) : logs.length === 0 ? (
//             <div className="rounded-xl border border-slate-100 bg-slate-50 p-8 text-center">
//               <Activity className="mx-auto text-slate-400" size={28} />
//               <p className="mt-3 text-sm font-semibold text-slate-700">
//                 No audit activity yet
//               </p>
//               <p className="mt-1 text-xs text-slate-500">
//                 Actions performed in FleetDoc will appear here.
//               </p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[650px]">
//                 <thead>
//                   <tr className="border-b border-slate-100 text-left">
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">User</th>
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Action</th>
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Module</th>
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Time</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {logs.map((log, index) => {
//                     const Icon = moduleIcon[log.module] || Activity;
//                     return (
//                       <motion.tr
//                         key={log.id || `${log.user}-${log.timestamp}-${index}`}
//                         initial={{ opacity: 0, y: 8 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: index * 0.03 }}
//                         className="transition-colors duration-200 hover:bg-slate-50"
//                       >
//                         <td className="px-3 py-4">
//                           <div className="flex items-center gap-2">
//                             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
//                               <User2 size={15} />
//                             </div>
//                             <div>
//                               <span className="text-sm font-semibold text-slate-700">
//                                 {log.user || "System"}
//                               </span>
//                               {log.email && (
//                                 <div className="text-[11px] text-slate-400">
//                                   {log.email}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-3 py-4 text-sm text-slate-600">
//                           <div className="font-medium">
//                             {log.action || "Activity"}
//                           </div>
//                           {log.description && (
//                             <div className="mt-0.5 text-xs text-slate-400">
//                               {log.description}
//                             </div>
//                           )}
//                         </td>
//                         <td className="px-3 py-4">
//                           <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
//                             <Icon size={13} />
//                             {log.module || "System"}
//                           </span>
//                         </td>
//                         <td className="px-3 py-4 text-xs text-slate-500">
//                           {formatLogTime(log.timestamp || log.time)}
//                         </td>
//                       </motion.tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </SettingCard>
//       </motion.div>

//       <AnimatePresence>
//         {showClearModal && (
//           <motion.div
//             className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onMouseDown={(e) => {
//               if (e.target === e.currentTarget) setShowClearModal(false);
//             }}
//           >
//             <motion.div
//               initial={{ opacity: 0, scale: 0.92, y: 25 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.92, y: 15 }}
//               transition={{ duration: 0.25, ease: "easeOut" }}
//               className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 dark:border-slate-700 dark:bg-slate-900"
//             >
//               <div className="relative px-6 pb-5 pt-6">
//                 <button
//                   type="button"
//                   onClick={() => setShowClearModal(false)}
//                   className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
//                   aria-label="Close"
//                 >
//                   <X size={18} />
//                 </button>
//                 <div className="flex flex-col items-center text-center">
//                   <motion.div
//                     initial={{ scale: 0.7, rotate: -8 }}
//                     animate={{ scale: 1, rotate: 0 }}
//                     transition={{ delay: 0.08, duration: 0.3 }}
//                     className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-lg shadow-red-100 dark:bg-red-500/10 dark:text-red-400 dark:shadow-none"
//                   >
//                     <Trash2 size={28} strokeWidth={2} />
//                   </motion.div>
//                   <h3 className="mt-5 text-xl font-bold text-slate-800 dark:text-white">
//                     Clear Audit Logs?
//                   </h3>
//                   <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
//                     Are you sure you want to permanently delete all audit logs? This action cannot be undone.
//                   </p>
//                 </div>
//               </div>

//               <div className="mx-6 mb-5 rounded-2xl border border-red-100 bg-red-50/70 p-4 dark:border-red-500/20 dark:bg-red-500/10">
//                 <div className="flex items-center gap-3">
//                   <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm dark:bg-slate-800 dark:text-red-400">
//                     <ClipboardList size={18} />
//                   </div>
//                   <div>
//                     <p className="text-sm font-bold text-red-700 dark:text-red-400">
//                       {logs.length} {logs.length === 1 ? "audit entry" : "audit entries"}
//                     </p>
//                     <p className="mt-0.5 text-xs text-red-600/70 dark:text-red-400/70">
//                       All recorded activity will be removed.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:justify-end dark:border-slate-800 dark:bg-slate-950/40">
//                 <button
//                   type="button"
//                   onClick={() => setShowClearModal(false)}
//                   className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
//                 >
//                   Cancel
//                 </button>
//                 <motion.button
//                   type="button"
//                   onClick={confirmClearLogs}
//                   whileHover={{ scale: 1.02, y: -1 }}
//                   whileTap={{ scale: 0.98 }}
//                   className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white shadow-lg shadow-red-200 transition-all duration-300 hover:bg-red-700 hover:shadow-red-300 dark:shadow-none"
//                 >
//                   <Trash2 size={16} />
//                   Clear Logs
//                 </motion.button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }

// /* ============================================================
//    MAIN COMPONENT
// ============================================================ */

// export default function Settings() {
//   const navigate = useNavigate();
//   const fleetContext = useFleet();

//   const contextSettings =
//     fleetContext?.settings || {};

//   const updateContextSettings =
//     fleetContext?.updateSettings;

//   /* ==========================================================
//      CURRENT USER
//   ========================================================== */

//   const getCurrentUserRole =
//     fleetContext?.getCurrentUserRole;

//   const currentUserRole =
//     getCurrentUserRole?.() ||
//     "User";

//   const isAdmin =
//     currentUserRole === "Admin";

//   const [activeSection, setActiveSection] =
//     useState("general");

//   /* ==========================================================
//      SETTINGS STATE
//   ========================================================== */

//   const [settings, setSettings] =
//     useState(() => ({
//       ...defaultSettings,
//       ...contextSettings,

//       vehicleTypes:
//         Array.isArray(
//           contextSettings.vehicleTypes
//         )
//           ? contextSettings.vehicleTypes
//           : defaultVehicleTypes,

//       vehicleStatuses:
//         Array.isArray(
//           contextSettings.vehicleStatuses
//         )
//           ? contextSettings.vehicleStatuses
//           : defaultVehicleStatuses,

//       rolePermissions:
//         normalizeRolePermissions(
//           contextSettings.rolePermissions
//         ),
//     }));

//   /*
//     The current user's Settings permission is
//     read from the role permission configuration.

//     Admin is always allowed.
//   */
//   const currentRolePermissions =
//     normalizeRolePermissions(
//       settings.rolePermissions
//     );

//   const hasSettingsPermission =
//     Boolean(
//       currentRolePermissions?.[
//         currentUserRole
//       ]?.settings
//     );

//   /*
//     Optional compatibility with a FleetContext
//     that already exposes hasPermission().
//   */
//   const contextHasSettingsPermission =
//     typeof fleetContext?.hasPermission ===
//     "function"
//       ? fleetContext.hasPermission(
//           "settings"
//         )
//       : undefined;

//   const canAccessSettings =
//     isAdmin ||
//     (typeof contextHasSettingsPermission ===
//     "boolean"
//       ? contextHasSettingsPermission
//       : hasSettingsPermission);

//   /* ==========================================================
//      SETTINGS ACCESS PROTECTION

//      IMPORTANT:
//      Settings is no longer Admin-only.

//      Admin:
//        Always allowed.

//      Other roles:
//        Allowed only when their role has
//        Settings permission enabled.
//   ========================================================== */

//   useEffect(() => {
//     if (!canAccessSettings) {
//       navigate("/", {
//         replace: true,
//       });
//     }
//   }, [canAccessSettings, navigate]);

//   const [saved, setSaved] =
//     useState(false);

//   const [saving, setSaving] =
//     useState(false);

//   /* ==========================================================
//      SYNC SETTINGS FROM FLEET CONTEXT
//   ========================================================== */

//   useEffect(() => {
//     setSettings((previous) => ({
//       ...defaultSettings,
//       ...previous,
//       ...contextSettings,

//       vehicleTypes:
//         Array.isArray(
//           contextSettings.vehicleTypes
//         )
//           ? contextSettings.vehicleTypes
//           : Array.isArray(
//               previous.vehicleTypes
//             )
//           ? previous.vehicleTypes
//           : defaultVehicleTypes,

//       vehicleStatuses:
//         Array.isArray(
//           contextSettings.vehicleStatuses
//         )
//           ? contextSettings.vehicleStatuses
//           : Array.isArray(
//               previous.vehicleStatuses
//             )
//           ? previous.vehicleStatuses
//           : defaultVehicleStatuses,

//       rolePermissions:
//         normalizeRolePermissions(
//           contextSettings.rolePermissions ||
//             previous.rolePermissions
//         ),
//     }));
//   }, [contextSettings]);

//   /* ==========================================================
//      UPDATE SETTING
//   ========================================================== */

//   const updateSetting = (
//     key,
//     value
//   ) => {
//     const aliases = {
//       paymentMode:
//         "defaultPaymentMode",

//       syncFrequency:
//         "challanSyncFrequency",

//       twoFactor:
//         "twoFactorAuthentication",

//       strongPassword:
//         "strongPasswordRequired",

//       animations:
//         "animationsEnabled",
//     };

//     const canonicalKey =
//       aliases[key] || key;

//     setSettings((prev) => ({
//       ...prev,
//       [key]: value,
//       [canonicalKey]: value,
//     }));

//     if (
//       [
//         "theme",
//         "animations",
//         "animationsEnabled",
//         "compactTables",
//       ].includes(canonicalKey)
//     ) {
//       try {
//         if (
//           canonicalKey ===
//           "theme"
//         ) {
//           const root =
//             document.documentElement;

//           const media =
//             window.matchMedia(
//               "(prefers-color-scheme: dark)"
//             );

//           const isDark =
//             value === "dark" ||
//             (value === "system" &&
//               media.matches);

//           root.classList.toggle(
//             "dark",
//             isDark
//           );

//           root.dataset.theme =
//             isDark
//               ? "dark"
//               : "light";

//           document.body.classList.toggle(
//             "dark",
//             isDark
//           );
//         }

//         if (
//           canonicalKey ===
//             "animations" ||
//           canonicalKey ===
//             "animationsEnabled"
//         ) {
//           document.body.classList.toggle(
//             "fleetdoc-animations-off",
//             !Boolean(value)
//           );
//         }

//         if (
//           canonicalKey ===
//           "compactTables"
//         ) {
//           document.body.classList.toggle(
//             "fleetdoc-compact",
//             Boolean(value)
//           );
//         }
//       } catch (error) {
//         console.debug(
//           "FleetDoc: runtime preference preview unavailable",
//           error
//         );
//       }
//     }

//     setSaved(false);
//   };

//   /* ==========================================================
//      SAVE SETTINGS
//   ========================================================== */

//   const handleSave = async () => {
//     setSaving(true);

//     try {
//       const updatedSettings = {
//         ...settings,

//         defaultPaymentMode:
//           settings.defaultPaymentMode ??
//           settings.paymentMode ??
//           "Bank Transfer",

//         challanSyncFrequency:
//           settings.challanSyncFrequency ??
//           settings.syncFrequency ??
//           "30",

//         twoFactorAuthentication:
//           Boolean(
//             settings.twoFactorAuthentication ??
//               settings.twoFactor
//           ),

//         strongPasswordRequired:
//           Boolean(
//             settings.strongPasswordRequired ??
//               settings.strongPassword
//           ),

//         animationsEnabled:
//           Boolean(
//             settings.animationsEnabled ??
//               settings.animations
//           ),

//         vehicleTypes:
//           Array.isArray(
//             settings.vehicleTypes
//           )
//             ? settings.vehicleTypes
//             : defaultVehicleTypes,

//         vehicleStatuses:
//           Array.isArray(
//             settings.vehicleStatuses
//           )
//             ? settings.vehicleStatuses
//             : defaultVehicleStatuses,

//         /*
//           Normalize the complete role permission
//           matrix before persistence.

//           Admin is automatically restored to
//           full access by the normalizer.
//         */
//         rolePermissions:
//           normalizeRolePermissions(
//             settings.rolePermissions
//           ),

//         lastUpdated:
//           new Date().toISOString(),
//       };

//       if (
//         typeof updateContextSettings ===
//         "function"
//       ) {
//         await updateContextSettings(
//           updatedSettings
//         );
//       } else {
//         localStorage.setItem(
//           "fleetPortalSettings",
//           JSON.stringify(
//             updatedSettings
//           )
//         );
//       }

//       setSettings(updatedSettings);
//       setSaved(true);

//       window.setTimeout(() => {
//         setSaved(false);
//       }, 3000);
//     } catch (error) {
//       console.error(
//         "Unable to save settings:",
//         error
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* ==========================================================
//      RESET
//   ========================================================== */

//   const handleReset = () => {
//     setSettings({
//       ...defaultSettings,
//       ...contextSettings,

//       vehicleTypes:
//         Array.isArray(
//           contextSettings.vehicleTypes
//         )
//           ? contextSettings.vehicleTypes
//           : defaultVehicleTypes,

//       vehicleStatuses:
//         Array.isArray(
//           contextSettings.vehicleStatuses
//         )
//           ? contextSettings.vehicleStatuses
//           : defaultVehicleStatuses,

//       rolePermissions:
//         normalizeRolePermissions(
//           contextSettings.rolePermissions
//         ),
//     });

//     setSaved(false);
//   };

//   const activeMenu = useMemo(
//     () =>
//       settingsMenu.find(
//         (item) =>
//           item.id ===
//           activeSection
//       ),
//     [activeSection]
//   );

//   /* ==========================================================
//      RENDER ACTIVE SECTION
//   ========================================================== */

//   const renderSection = () => {
//     switch (activeSection) {
//       case "general":
//         return (
//           <GeneralSettings
//             settings={settings}
//             updateSetting={
//               updateSetting
//             }
//           />
//         );

//       case "notifications":
//         return (
//           <NotificationSettings
//             settings={settings}
//             updateSetting={
//               updateSetting
//             }
//           />
//         );

//       case "documents":
//         return (
//           <DocumentSettings
//             settings={settings}
//             updateSetting={
//               updateSetting
//             }
//           />
//         );

//       case "vehicles":
//         return (
//           <VehicleSettings
//             settings={settings}
//             updateSetting={
//               updateSetting
//             }
//           />
//         );

//       case "emi":
//         return (
//           <EMISettings
//             settings={settings}
//             updateSetting={
//               updateSetting
//             }
//           />
//         );

//       case "challans":
//         return (
//           <ChallanSettings
//             settings={settings}
//             updateSetting={
//               updateSetting
//             }
//           />
//         );

//       case "users":
//         return (
//           <UserRoleSettings
//             settings={settings}
//             updateSetting={
//               updateSetting
//             }
//             currentUserRole={
//               currentUserRole
//             }
//           />
//         );

//       case "security":
//         return (
//           <SecuritySettings
//             settings={settings}
//             updateSetting={
//               updateSetting
//             }
//           />
//         );

//       case "backup":
//         return <BackupSettings />;

//       case "integrations":
//         return (
//           <IntegrationSettings />
//         );

//       case "appearance":
//         return (
//           <AppearanceSettings
//             settings={settings}
//             updateSetting={
//               updateSetting
//             }
//           />
//         );

//       case "audit":
//         return <AuditSettings />;

//       default:
//         return null;
//     }
//   };

//   const ActiveIcon =
//     activeMenu?.icon;

//   const lastUpdatedText =
//     settings.lastUpdated
//       ? new Date(
//           settings.lastUpdated
//         ).toLocaleString(
//           "en-IN",
//           {
//             dateStyle: "medium",
//             timeStyle: "short",
//           }
//         )
//       : "Not saved yet";

//   /*
//     Prevent the Settings UI from rendering
//     while an unauthorized user is redirected.
//   */
//   if (!canAccessSettings) {
//     return null;
//   }

//   return (
//     <motion.div
//       variants={pageVariants}
//       initial="hidden"
//       animate="visible"
//       className="space-y-6"
//     >
//       {/* PAGE HEADER */}

//       <PageHeader
//         title={
//           <div className="flex items-center gap-3">
//             <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 transition duration-300 hover:scale-110 hover:rotate-3">
//               <SettingsIcon
//                 size={23}
//                 strokeWidth={2.3}
//               />
//             </div>

//             <div>
//               <span className="block text-2xl font-bold text-slate-800">
//                 Settings
//               </span>
//             </div>
//           </div>
//         }
//         subtitle="Manage your fleet portal configuration and preferences."
//       />

//       {/* TOP STATUS BAR */}

//       <motion.div
//         variants={itemVariants}
//         className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-5 text-white shadow-xl shadow-blue-100"
//       >
//         <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
//           <div className="flex items-center gap-4">
//             <motion.div
//               whileHover={{
//                 scale: 1.08,
//                 rotate: 5,
//               }}
//               className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-md"
//             >
//               <SettingsIcon
//                 size={26}
//                 strokeWidth={2.3}
//               />
//             </motion.div>

//             <div>
//               <p className="text-sm font-medium text-blue-100">
//                 Fleet Portal Configuration
//               </p>

//               <h1 className="mt-1 text-xl font-bold sm:text-2xl">
//                 System Settings
//               </h1>

//               <p className="mt-1 max-w-2xl text-sm text-blue-100">
//                 Configure your company,
//                 vehicles, documents,
//                 notifications, security
//                 and integrations from one place.
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <div className="hidden items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm backdrop-blur-sm sm:flex">
//               <Server size={17} />

//               <span>
//                 Portal Online
//               </span>

//               <span className="h-2 w-2 rounded-full bg-emerald-300" />
//             </div>
//           </div>
//         </div>
//       </motion.div>

//       {/* SETTINGS LAYOUT */}

//       <motion.div
//         variants={itemVariants}
//         className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]"
//       >
//         {/* SIDEBAR */}

//         <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-6">
//           <div className="mb-3 px-3 py-2">
//             <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
//               Configuration
//             </p>
//           </div>

//           <nav className="space-y-1">
//             {settingsMenu.map(
//               (item) => {
//                 const Icon =
//                   item.icon;

//                 const active =
//                   activeSection ===
//                   item.id;

//                 return (
//                   <button
//                     key={item.id}
//                     type="button"
//                     onClick={() =>
//                       setActiveSection(
//                         item.id
//                       )
//                     }
//                     className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${
//                       active
//                         ? "bg-blue-50 text-blue-700 shadow-sm"
//                         : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//                     }`}
//                   >
//                     <div
//                       className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
//                         active
//                           ? "bg-blue-600 text-white shadow-md shadow-blue-200"
//                           : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm"
//                       }`}
//                     >
//                       <Icon size={17} />
//                     </div>

//                     <div className="min-w-0 flex-1">
//                       <p
//                         className={`truncate text-sm font-semibold ${
//                           active
//                             ? "text-blue-700"
//                             : "text-slate-700"
//                         }`}
//                       >
//                         {item.label}
//                       </p>

//                       <p className="mt-0.5 hidden truncate text-[11px] text-slate-400 xl:block">
//                         {item.description}
//                       </p>
//                     </div>

//                     {active && (
//                       <ChevronRight
//                         size={16}
//                         className="shrink-0 text-blue-500"
//                       />
//                     )}
//                   </button>
//                 );
//               }
//             )}
//           </nav>
//         </aside>

//         {/* CONTENT */}

//         <main className="min-w-0">
//           <AnimatePresence
//             mode="wait"
//           >
//             <motion.div
//               key={activeSection}
//               initial={{
//                 opacity: 0,
//                 y: 10,
//               }}
//               animate={{
//                 opacity: 1,
//                 y: 0,
//               }}
//               exit={{
//                 opacity: 0,
//                 y: -10,
//               }}
//               transition={{
//                 duration: 0.25,
//               }}
//             >
//               {/* CONTENT HEADER */}

//               <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
//                 <div className="flex items-center gap-3">
//                   {ActiveIcon && (
//                     <>
//                       <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//                         <ActiveIcon
//                           size={21}
//                         />
//                       </div>

//                       <div>
//                         <h2 className="text-lg font-bold text-slate-900">
//                           {
//                             activeMenu.label
//                           }
//                         </h2>

//                         <p className="mt-0.5 text-xs text-slate-500">
//                           {
//                             activeMenu.description
//                           }
//                         </p>
//                       </div>
//                     </>
//                   )}
//                 </div>

//                 {activeSection !==
//                   "audit" && (
//                   <div className="flex items-center gap-2">
//                     <button
//                       type="button"
//                       onClick={
//                         handleReset
//                       }
//                       className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-800"
//                     >
//                       <RotateCcw
//                         size={16}
//                       />

//                       <span className="hidden sm:inline">
//                         Reset
//                       </span>
//                     </button>

//                     <button
//                       type="button"
//                       onClick={
//                         handleSave
//                       }
//                       disabled={saving}
//                       className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
//                     >
//                       {saving ? (
//                         <RefreshCw
//                           size={16}
//                           className="animate-spin"
//                         />
//                       ) : (
//                         <Save size={16} />
//                       )}

//                       {saving
//                         ? "Saving..."
//                         : "Save Changes"}
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {/* SAVE MESSAGE */}

//               <AnimatePresence>
//                 {saved && (
//                   <motion.div
//                     initial={{
//                       opacity: 0,
//                       y: -8,
//                       scale: 0.98,
//                     }}
//                     animate={{
//                       opacity: 1,
//                       y: 0,
//                       scale: 1,
//                     }}
//                     exit={{
//                       opacity: 0,
//                       y: -8,
//                       scale: 0.98,
//                     }}
//                     className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
//                   >
//                     <CheckCircle2
//                       size={19}
//                     />

//                     <div>
//                       <p className="font-semibold">
//                         Settings saved successfully
//                       </p>

//                       <p className="mt-0.5 text-xs text-emerald-600">
//                         Your fleet portal
//                         preferences
//                         have been updated.
//                       </p>
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* ACTIVE SECTION */}

//               {renderSection()}
//             </motion.div>
//           </AnimatePresence>
//         </main>
//       </motion.div>

//       {/* FOOTER */}

//       <motion.div
//         variants={itemVariants}
//         className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
//       >
//         <div className="flex items-center gap-3">
//           <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
//             <ShieldCheck size={17} />
//           </div>

//           <div>
//             <p className="text-sm font-semibold text-slate-700">
//               Your settings are secure
//             </p>

//             <p className="text-xs text-slate-500">
//               Last saved:{" "}
//               {lastUpdatedText}
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
//           <Clock3 size={14} />
//           Fleet Portal Settings
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }









import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  Building2,
  AlertTriangle,
  Bell,
  FileText,
  Truck,
  IndianRupee,
  ReceiptText,
  Users,
  ShieldCheck,
  Database,
  Plug,
  Palette,
  ClipboardList,
  Save,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Moon,
  Sun,
  Monitor,
  Mail,
  MessageSquare,
  Smartphone,
  Lock,
  KeyRound,
  Download,
  Upload,
  RefreshCw,
  Clock3,
  Globe2,
  CalendarDays,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Pencil,
  X,
  CircleHelp,
  Activity,
  Server,
  CreditCard,
  WifiOff,
  User2,
} from "lucide-react";

import PageHeader from "../components/PageHeader";
import { useFleet } from "../context/fleetContext";

/* ============================================================
   ANIMATION VARIANTS
============================================================ */

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.35,
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 16,
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

const tabVariants = {
  hidden: {
    opacity: 0,
    x: 12,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
    },
  },
};

/* ============================================================
   SETTINGS MENU
============================================================ */

const settingsMenu = [
  {
    id: "general",
    label: "General",
    description: "Company and portal information",
    icon: Building2,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Alerts and reminders",
    icon: Bell,
  },
  {
    id: "documents",
    label: "Documents",
    description: "Vehicle document configuration",
    icon: FileText,
  },
  {
    id: "vehicles",
    label: "Vehicles",
    description: "Vehicle types and status",
    icon: Truck,
  },
  {
    id: "emi",
    label: "EMI & Finance",
    description: "Loan and payment settings",
    icon: IndianRupee,
  },
  {
    id: "challans",
    label: "Challans",
    description: "Challan synchronization",
    icon: ReceiptText,
  },
  {
    id: "users",
    label: "Users & Roles",
    description: "Access and permissions",
    icon: Users,
  },
  {
    id: "security",
    label: "Security",
    description: "Password and account security",
    icon: ShieldCheck,
  },
  {
    id: "backup",
    label: "Backup & Data",
    description: "Backup and data management",
    icon: Database,
  },
  {
    id: "integrations",
    label: "Integrations",
    description: "External services and APIs",
    icon: Plug,
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme and interface",
    icon: Palette,
  },
  {
    id: "audit",
    label: "Audit Logs",
    description: "System activity history",
    icon: ClipboardList,
  },
];

/* ============================================================
   DEFAULT VEHICLE CONFIGURATION
============================================================ */

const defaultVehicleTypes = [
  "Truck",
  "Car",
  "Bus",
  "Trailer",
  "Other",
];

const defaultVehicleStatuses = [
  "Active",
  "Inactive",
  "Under Maintenance",
];

/* ============================================================
   DEFAULT ROLE PERMISSIONS
============================================================ */

const defaultRolePermissions = {
  Admin: {
    view: true,
    add: true,
    edit: true,
    delete: true,
    paid: true,
    settings: true,
    users: true,
    password: true,
  },

  Manager: {
    view: true,
    add: true,
    edit: true,
    delete: false,
    paid: false,
    settings: false,
    users: false,
    password: false,
  },

  Finance: {
    view: true,
    add: true,
    edit: false,
    delete: false,
    paid: true,
    settings: false,
    users: false,
    password: false,
  },

  User: {
    view: true,
    add: true,
    edit: false,
    delete: false,
    paid: false,
    settings: false,
    users: false,
    password: false,
  },
};

/* ============================================================
   ROLE PERMISSION NORMALIZER
============================================================ */

const normalizeRolePermissions = (source) => {
  const permissions =
    source && typeof source === "object"
      ? source
      : {};

  const normalized = Object.keys(
    defaultRolePermissions
  ).reduce((result, role) => {
    result[role] = {
      ...defaultRolePermissions[role],
      ...(permissions[role] || {}),
    };

    return result;
  }, {});

  /*
    Admin must always retain complete access.
    This prevents the permission system from
    accidentally locking the administrator out.
  */
  normalized.Admin = {
    ...normalized.Admin,
    view: true,
    add: true,
    edit: true,
    delete: true,
    paid: true,
    settings: true,
    users: true,
    password: true,
  };

  return normalized;
};

/* ============================================================
   DEFAULT SETTINGS
============================================================ */

const defaultSettings = {
  companyName: "BIBHU Logistics",
  portalName: "Fleet Portal",

  email: "",
  phone: "",

  dateFormat: "DD MMM YYYY",
  currency: "Indian Rupee (₹)",
  timezone: "Asia/Kolkata",

  reminderDays: 10,

  dashboardNotifications: true,
  emailNotifications: true,
  smsNotifications: false,
  whatsappNotifications: false,

  documentAlerts: true,
  emiAlerts: true,
  challanAlerts: true,
  roadTaxAlerts: true,

  inAppNotifications: true,
  pushNotifications: true,

  tripReminders: true,

  paymentMode: "Bank Transfer",
  defaultPaymentMode: "Bank Transfer",
  autoGenerateEMIs: true,

  challanAutoSync: false,
  syncFrequency: "30",
  challanSyncFrequency: "Daily",

  twoFactor: false,
  strongPassword: true,
  twoFactorAuthentication: false,
  strongPasswordRequired: true,
  sessionTimeout: 30,

  theme: "light",
  animations: true,
  animationsEnabled: true,
  compactTables: false,

  vehicleTypes: defaultVehicleTypes,
  vehicleStatuses: defaultVehicleStatuses,

  rolePermissions: defaultRolePermissions,

  lastUpdated: null,
};

/* ============================================================
   REUSABLE COMPONENTS
============================================================ */

function SectionTitle({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon size={21} strokeWidth={2.2} />
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function SettingCard({
  children,
  className = "",
}) {
  return (
    <motion.div
      variants={itemVariants}
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${className}`}
    >
      {children}
    </motion.div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-300 ${
        checked
          ? "bg-blue-600 shadow-md shadow-blue-200"
          : "bg-slate-300"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
            <Icon size={17} />
          </div>
        )}

        <div>
          <p className="font-semibold text-slate-800">
            {title}
          </p>

          {description && (
            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="sm:shrink-0">
        {children}
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      <input
        type={type}
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
      />
    </label>
  );
}

function CustomDropdown({
  value,
  onChange,
  children,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = (Array.isArray(children) ? children : [children]).filter(
    (child) => child && child.props
  );

  const selectedOption =
    options.find(
      (option) => String(option.props.value) === String(value ?? "")
    ) || options[0];

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className={`flex min-h-[48px] w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left text-sm outline-none transition-all duration-200 ${
          open
            ? "border-blue-400 ring-4 ring-blue-50"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <span className="min-w-0 flex-1 truncate text-slate-800">
          {selectedOption?.props?.children ?? "Select an option"}
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-[70] max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-200/60"
            role="listbox"
          >
            {options.map((option) => {
              const optionValue = option.props.value;
              const selected =
                String(optionValue) === String(value ?? "");

              return (
                <button
                  key={String(optionValue)}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(optionValue);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition-colors duration-150 ${
                    selected
                      ? "bg-blue-50 font-semibold text-blue-700"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`}
                >
                  <span className="pr-3">
                    {option.props.children}
                  </span>

                  {selected && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      <CustomDropdown
        value={value}
        onChange={onChange}
      >
        {children}
      </CustomDropdown>
    </label>
  );
}

function StatusBadge({
  connected,
  children,
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
        connected
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          connected
            ? "bg-emerald-500"
            : "bg-slate-400"
        }`}
      />

      {children}
    </span>
  );
}

/* ============================================================
   GENERAL
============================================================ */

function GeneralSettings({
  settings,
  updateSetting,
}) {
  return (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <SettingCard>
        <SectionTitle
          icon={Building2}
          title="Company Information"
          description="Manage the basic information displayed across your fleet portal."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <InputField
            label="Company Name"
            value={settings.companyName}
            onChange={(value) =>
              updateSetting(
                "companyName",
                value
              )
            }
            placeholder="Enter company name"
          />

          <InputField
            label="Portal Name"
            value={settings.portalName}
            onChange={(value) =>
              updateSetting(
                "portalName",
                value
              )
            }
            placeholder="Fleet Portal"
          />

          <InputField
            label="Email Address"
            value={settings.email}
            onChange={(value) =>
              updateSetting(
                "email",
                value
              )
            }
            placeholder="company@example.com"
            type="email"
          />

          <InputField
            label="Phone Number"
            value={settings.phone}
            onChange={(value) =>
              updateSetting(
                "phone",
                value
              )
            }
            placeholder="+91 XXXXX XXXXX"
          />
        </div>
      </SettingCard>

      <SettingCard>
        <SectionTitle
          icon={Globe2}
          title="Regional Settings"
          description="Configure date, currency and regional preferences."
        />

        <div className="grid gap-5 md:grid-cols-3">
          <SelectField
            label="Currency"
            value={settings.currency}
            onChange={(value) =>
              updateSetting(
                "currency",
                value
              )
            }
          >
            <option value="Indian Rupee (₹)">
              ₹ INR — Indian Rupee
            </option>
            <option value="USD">
              $ USD — US Dollar
            </option>
            <option value="EUR">
              € EUR — Euro
            </option>
          </SelectField>

          <SelectField
            label="Date Format"
            value={settings.dateFormat}
            onChange={(value) =>
              updateSetting(
                "dateFormat",
                value
              )
            }
          >
            <option value="DD MMM YYYY">
              DD MMM YYYY
            </option>
            <option value="DD/MM/YYYY">
              DD/MM/YYYY
            </option>
            <option value="MM/DD/YYYY">
              MM/DD/YYYY
            </option>
            <option value="YYYY-MM-DD">
              YYYY-MM-DD
            </option>
          </SelectField>

          <SelectField
            label="Time Zone"
            value={settings.timezone}
            onChange={(value) =>
              updateSetting(
                "timezone",
                value
              )
            }
          >
            <option value="Asia/Kolkata">
              Asia/Kolkata — IST
            </option>
            <option value="UTC">
              UTC
            </option>
          </SelectField>
        </div>
      </SettingCard>
    </motion.div>
  );
}

/* ============================================================
   NOTIFICATIONS
============================================================ */

function NotificationSettings({
  settings,
  updateSetting,
}) {
  return (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <SettingCard>
        <SectionTitle
          icon={Bell}
          title="Notification Preferences"
          description="Control the alerts displayed and delivered by the fleet portal."
        />

        <SettingRow
          icon={Bell}
          title="Dashboard Notifications"
          description="Show important fleet alerts and reminders on the dashboard."
        >
          <Toggle
            checked={Boolean(
              settings.dashboardNotifications
            )}
            onChange={(value) =>
              updateSetting(
                "dashboardNotifications",
                value
              )
            }
          />
        </SettingRow>

        <SettingRow
          icon={FileText}
          title="Document Expiry Alerts"
          description="Notify users when vehicle documents are approaching expiry."
        >
          <Toggle
            checked={Boolean(
              settings.documentAlerts
            )}
            onChange={(value) =>
              updateSetting(
                "documentAlerts",
                value
              )
            }
          />
        </SettingRow>

        <SettingRow
          icon={IndianRupee}
          title="EMI Due Alerts"
          description="Show notifications for upcoming EMI payments."
        >
          <Toggle
            checked={Boolean(
              settings.emiAlerts
            )}
            onChange={(value) =>
              updateSetting(
                "emiAlerts",
                value
              )
            }
          />
        </SettingRow>

        <SettingRow
          icon={ReceiptText}
          title="Challan Alerts"
          description="Notify users when new or pending challans are available."
        >
          <Toggle
            checked={Boolean(
              settings.challanAlerts
            )}
            onChange={(value) =>
              updateSetting(
                "challanAlerts",
                value
              )
            }
          />
        </SettingRow>

        <SettingRow
          icon={CalendarDays}
          title="Road Tax Alerts"
          description="Show reminders for upcoming road tax payments."
        >
          <Toggle
            checked={Boolean(
              settings.roadTaxAlerts
            )}
            onChange={(value) =>
              updateSetting(
                "roadTaxAlerts",
                value
              )
            }
          />
        </SettingRow>

        <SettingRow
          icon={Truck}
          title="Trip Reminders"
          description="Show reminders related to fleet trips and operations."
        >
          <Toggle
            checked={Boolean(
              settings.tripReminders
            )}
            onChange={(value) =>
              updateSetting(
                "tripReminders",
                value
              )
            }
          />
        </SettingRow>
      </SettingCard>

      <SettingCard>
        <SectionTitle
          icon={Clock3}
          title="Reminder Timing"
          description="Set how early the portal should notify users."
        />

        <div className="max-w-sm">
          <SelectField
            label="Remind Before Expiry"
            value={settings.reminderDays}
            onChange={(value) =>
              updateSetting(
                "reminderDays",
                Number(value)
              )
            }
          >
            <option value={7}>7 days</option>
            <option value={10}>10 days</option>
            <option value={15}>15 days</option>
            <option value={30}>30 days</option>
            <option value={45}>45 days</option>
            <option value={60}>60 days</option>
          </SelectField>
        </div>
      </SettingCard>

      <SettingCard>
        <SectionTitle
          icon={Smartphone}
          title="Notification Channels"
          description="Choose how notifications are delivered."
        />

        <SettingRow
          icon={Mail}
          title="Email Notifications"
          description="Send important alerts through email."
        >
          <Toggle
            checked={Boolean(
              settings.emailNotifications
            )}
            onChange={(value) =>
              updateSetting(
                "emailNotifications",
                value
              )
            }
          />
        </SettingRow>

        <SettingRow
          icon={MessageSquare}
          title="SMS Notifications"
          description="Send important alerts through SMS."
        >
          <Toggle
            checked={Boolean(
              settings.smsNotifications
            )}
            onChange={(value) =>
              updateSetting(
                "smsNotifications",
                value
              )
            }
          />
        </SettingRow>

        <SettingRow
          icon={MessageSquare}
          title="WhatsApp Notifications"
          description="Send supported fleet alerts through WhatsApp."
        >
          <Toggle
            checked={Boolean(
              settings.whatsappNotifications
            )}
            onChange={(value) =>
              updateSetting(
                "whatsappNotifications",
                value
              )
            }
          />
        </SettingRow>

        <SettingRow
          icon={Bell}
          title="Push Notifications"
          description="Enable browser or application push notifications when supported."
        >
          <Toggle
            checked={Boolean(
              settings.pushNotifications
            )}
            onChange={async (value) => {
              if (
                value &&
                "Notification" in window
              ) {
                const permission =
                  await Notification.requestPermission();

                if (
                  permission !==
                  "granted"
                ) {
                  updateSetting(
                    "pushNotifications",
                    false
                  );
                  return;
                }
              }

              updateSetting(
                "pushNotifications",
                value
              );
            }}
          />
        </SettingRow>
      </SettingCard>
    </motion.div>
  );
}

/* ============================================================
   DOCUMENTS
============================================================ */

function DocumentSettings({
  settings,
  updateSetting,
}) {
  const defaultTypes = [
    "Registration Certificate",
    "Pollution Certificate",
    "Fitness Certificate",
    "State Permit",
    "National Permit",
    "Insurance",
    "Road Tax",
  ];

  const [documentTypes, setDocumentTypes] =
    useState(
      Array.isArray(settings.documentTypes)
        ? settings.documentTypes
        : defaultTypes
    );

  const [newType, setNewType] =
    useState("");

  const [editingIndex, setEditingIndex] =
    useState(null);

  const [editValue, setEditValue] =
    useState("");

  useEffect(() => {
    if (
      Array.isArray(
        settings.documentTypes
      )
    ) {
      setDocumentTypes(
        settings.documentTypes
      );
    }
  }, [settings.documentTypes]);

  const persistTypes = (types) => {
    setDocumentTypes(types);
    updateSetting(
      "documentTypes",
      types
    );
  };

  const addType = () => {
    const value = newType.trim();

    if (!value) return;

    if (
      documentTypes.some(
        (item) =>
          item.toLowerCase() ===
          value.toLowerCase()
      )
    ) {
      return;
    }

    persistTypes([
      ...documentTypes,
      value,
    ]);

    setNewType("");
  };

  const removeType = (index) => {
    persistTypes(
      documentTypes.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditValue(
      documentTypes[index]
    );
  };

  const saveEdit = () => {
    const value = editValue.trim();

    if (
      !value ||
      editingIndex === null
    ) {
      return;
    }

    const duplicate =
      documentTypes.some(
        (item, index) =>
          index !== editingIndex &&
          item.toLowerCase() ===
            value.toLowerCase()
      );

    if (duplicate) return;

    persistTypes(
      documentTypes.map(
        (item, index) =>
          index === editingIndex
            ? value
            : item
      )
    );

    setEditingIndex(null);
    setEditValue("");
  };

  return (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <SettingCard>
        <SectionTitle
          icon={FileText}
          title="Vehicle Document Types"
          description="Configure the document types available when adding vehicle documents."
        />

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <input
            value={newType}
            onChange={(e) =>
              setNewType(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter")
                addType();
            }}
            placeholder="Add new document type"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          />

          <button
            type="button"
            onClick={addType}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
          >
            <Plus size={17} />
            Add Type
          </button>
        </div>

        <div className="space-y-2">
          {documentTypes.map(
            (type, index) => (
              <motion.div
                key={`${type}-${index}`}
                layout
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 transition-all duration-200 hover:bg-blue-50/50"
              >
                {editingIndex ===
                index ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      value={editValue}
                      onChange={(e) =>
                        setEditValue(
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key ===
                          "Enter"
                        ) {
                          saveEdit();
                        }
                      }}
                      className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-blue-50"
                      autoFocus
                    />

                    <button
                      type="button"
                      onClick={saveEdit}
                      className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition hover:bg-emerald-100"
                    >
                      <CheckCircle2
                        size={17}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingIndex(
                          null
                        );
                        setEditValue("");
                      }}
                      className="rounded-lg bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
                    >
                      <X size={17} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                        <FileText
                          size={16}
                        />
                      </div>

                      <span className="text-sm font-medium text-slate-700">
                        {type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          startEdit(
                            index
                          )
                        }
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-blue-600"
                      >
                        <Pencil
                          size={16}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeType(
                            index
                          )
                        }
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2
                          size={16}
                        />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )
          )}
        </div>
      </SettingCard>
    </motion.div>
  );
}

/* ============================================================
   VEHICLES
============================================================ */

function VehicleSettings({
  settings,
  updateSetting,
}) {
  const [vehicleTypes, setVehicleTypes] =
    useState(
      Array.isArray(
        settings.vehicleTypes
      )
        ? settings.vehicleTypes
        : defaultVehicleTypes
    );

  const [
    vehicleStatuses,
    setVehicleStatuses,
  ] = useState(
    Array.isArray(
      settings.vehicleStatuses
    )
      ? settings.vehicleStatuses
      : defaultVehicleStatuses
  );

  const [
    newVehicleType,
    setNewVehicleType,
  ] = useState("");

  const [
    newVehicleStatus,
    setNewVehicleStatus,
  ] = useState("");

  const [
    editingTypeIndex,
    setEditingTypeIndex,
  ] = useState(null);

  const [
    editingStatusIndex,
    setEditingStatusIndex,
  ] = useState(null);

  const [
    editTypeValue,
    setEditTypeValue,
  ] = useState("");

  const [
    editStatusValue,
    setEditStatusValue,
  ] = useState("");

  useEffect(() => {
    setVehicleTypes(
      Array.isArray(
        settings.vehicleTypes
      )
        ? settings.vehicleTypes
        : defaultVehicleTypes
    );

    setVehicleStatuses(
      Array.isArray(
        settings.vehicleStatuses
      )
        ? settings.vehicleStatuses
        : defaultVehicleStatuses
    );
  }, [
    settings.vehicleTypes,
    settings.vehicleStatuses,
  ]);

  const persistVehicleTypes = (
    types
  ) => {
    setVehicleTypes(types);
    updateSetting(
      "vehicleTypes",
      types
    );
  };

  const persistVehicleStatuses = (
    statuses
  ) => {
    setVehicleStatuses(statuses);
    updateSetting(
      "vehicleStatuses",
      statuses
    );
  };

  const addVehicleType = () => {
    const value =
      newVehicleType.trim();

    if (!value) return;

    if (
      vehicleTypes.some(
        (item) =>
          String(item).toLowerCase() ===
          value.toLowerCase()
      )
    ) {
      return;
    }

    persistVehicleTypes([
      ...vehicleTypes,
      value,
    ]);

    setNewVehicleType("");
  };

  const removeVehicleType = (
    index
  ) => {
    if (vehicleTypes.length <= 1)
      return;

    persistVehicleTypes(
      vehicleTypes.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const startEditVehicleType = (
    index
  ) => {
    setEditingTypeIndex(index);
    setEditTypeValue(
      vehicleTypes[index]
    );
  };

  const saveVehicleTypeEdit = () => {
    const value =
      editTypeValue.trim();

    if (
      !value ||
      editingTypeIndex === null
    ) {
      return;
    }

    const duplicate =
      vehicleTypes.some(
        (item, index) =>
          index !== editingTypeIndex &&
          String(item).toLowerCase() ===
            value.toLowerCase()
      );

    if (duplicate) return;

    persistVehicleTypes(
      vehicleTypes.map(
        (item, index) =>
          index === editingTypeIndex
            ? value
            : item
      )
    );

    setEditingTypeIndex(null);
    setEditTypeValue("");
  };

  const addVehicleStatus = () => {
    const value =
      newVehicleStatus.trim();

    if (!value) return;

    if (
      vehicleStatuses.some(
        (item) =>
          String(item).toLowerCase() ===
          value.toLowerCase()
      )
    ) {
      return;
    }

    persistVehicleStatuses([
      ...vehicleStatuses,
      value,
    ]);

    setNewVehicleStatus("");
  };

  const removeVehicleStatus = (
    index
  ) => {
    if (vehicleStatuses.length <= 1)
      return;

    persistVehicleStatuses(
      vehicleStatuses.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const startEditVehicleStatus = (
    index
  ) => {
    setEditingStatusIndex(index);
    setEditStatusValue(
      vehicleStatuses[index]
    );
  };

  const saveVehicleStatusEdit = () => {
    const value =
      editStatusValue.trim();

    if (
      !value ||
      editingStatusIndex === null
    ) {
      return;
    }

    const duplicate =
      vehicleStatuses.some(
        (item, index) =>
          index !==
            editingStatusIndex &&
          String(item).toLowerCase() ===
            value.toLowerCase()
      );

    if (duplicate) return;

    persistVehicleStatuses(
      vehicleStatuses.map(
        (item, index) =>
          index === editingStatusIndex
            ? value
            : item
      )
    );

    setEditingStatusIndex(null);
    setEditStatusValue("");
  };

  return (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <SettingCard>
        <SectionTitle
          icon={Truck}
          title="Vehicle Types"
          description="Manage vehicle categories available throughout the fleet portal."
        />

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <input
            value={newVehicleType}
            onChange={(e) =>
              setNewVehicleType(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (e.key === "Enter")
                addVehicleType();
            }}
            placeholder="Add new vehicle type"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          />

          <button
            type="button"
            onClick={addVehicleType}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
          >
            <Plus size={17} />
            Add Type
          </button>
        </div>

        <div className="space-y-2">
          {vehicleTypes.map(
            (type, index) => (
              <motion.div
                key={`${type}-${index}`}
                layout
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 transition-all duration-200 hover:bg-blue-50/50"
              >
                {editingTypeIndex ===
                index ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      value={
                        editTypeValue
                      }
                      onChange={(e) =>
                        setEditTypeValue(
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key ===
                          "Enter"
                        ) {
                          saveVehicleTypeEdit();
                        }
                      }}
                      className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-blue-50"
                      autoFocus
                    />

                    <button
                      type="button"
                      onClick={
                        saveVehicleTypeEdit
                      }
                      className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition hover:bg-emerald-100"
                    >
                      <CheckCircle2
                        size={17}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingTypeIndex(
                          null
                        );
                        setEditTypeValue(
                          ""
                        );
                      }}
                      className="rounded-lg bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
                    >
                      <X size={17} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                        <Truck size={18} />
                      </div>

                      <span className="text-sm font-semibold text-slate-700">
                        {type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          startEditVehicleType(
                            index
                          )
                        }
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-blue-600"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeVehicleType(
                            index
                          )
                        }
                        disabled={
                          vehicleTypes.length <=
                          1
                        }
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )
          )}
        </div>
      </SettingCard>

      <SettingCard>
        <SectionTitle
          icon={CheckCircle2}
          title="Vehicle Status"
          description="Manage the statuses available for vehicles in the fleet portal."
        />

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <input
            value={newVehicleStatus}
            onChange={(e) =>
              setNewVehicleStatus(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (e.key === "Enter")
                addVehicleStatus();
            }}
            placeholder="Add new vehicle status"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          />

          <button
            type="button"
            onClick={addVehicleStatus}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
          >
            <Plus size={17} />
            Add Status
          </button>
        </div>

        <div className="space-y-2">
          {vehicleStatuses.map(
            (status, index) => (
              <motion.div
                key={`${status}-${index}`}
                layout
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 transition-all duration-200 hover:bg-blue-50/50"
              >
                {editingStatusIndex ===
                index ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      value={
                        editStatusValue
                      }
                      onChange={(e) =>
                        setEditStatusValue(
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key ===
                          "Enter"
                        ) {
                          saveVehicleStatusEdit();
                        }
                      }}
                      className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-blue-50"
                      autoFocus
                    />

                    <button
                      type="button"
                      onClick={
                        saveVehicleStatusEdit
                      }
                      className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition hover:bg-emerald-100"
                    >
                      <CheckCircle2 size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingStatusIndex(
                          null
                        );
                        setEditStatusValue(
                          ""
                        );
                      }}
                      className="rounded-lg bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
                    >
                      <X size={17} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                        <CheckCircle2 size={18} />
                      </div>

                      <span className="text-sm font-semibold text-slate-700">
                        {status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          startEditVehicleStatus(
                            index
                          )
                        }
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-blue-600"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeVehicleStatus(
                            index
                          )
                        }
                        disabled={
                          vehicleStatuses.length <=
                          1
                        }
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )
          )}
        </div>
      </SettingCard>

      <SettingCard>
        <SectionTitle
          icon={Activity}
          title="Fuel Types"
          description="Fuel options available while adding or editing vehicles."
        />

        <div className="flex flex-wrap gap-2">
          {[
            "Diesel",
            "Petrol",
            "CNG",
            "Electric",
            "Hybrid",
          ].map((fuel) => (
            <span
              key={fuel}
              className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
            >
              {fuel}
            </span>
          ))}
        </div>
      </SettingCard>
    </motion.div>
  );
}

/* ============================================================
   EMI
============================================================ */

function EMISettings({
  settings,
  updateSetting,
}) {
  return (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <SettingCard>
        <SectionTitle
          icon={IndianRupee}
          title="EMI & Finance"
          description="Configure payment preferences used by the EMI management module."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <SelectField
            label="Default Payment Mode"
            value={
              settings.paymentMode ??
              settings.defaultPaymentMode ??
              "Bank Transfer"
            }
            onChange={(value) =>
              updateSetting(
                "paymentMode",
                value
              )
            }
          >
            <option value="Bank Transfer">
              Bank Transfer
            </option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
          </SelectField>
        </div>

        <div className="mt-5">
          <SettingRow
            icon={Bell}
            title="EMI Payment Reminders"
            description="Automatically show upcoming EMI payments on the dashboard."
          >
            <Toggle
              checked={Boolean(
                settings.emiAlerts
              )}
              onChange={(value) =>
                updateSetting(
                  "emiAlerts",
                  value
                )
              }
            />
          </SettingRow>
        </div>
      </SettingCard>
    </motion.div>
  );
}

/* ============================================================
   CHALLANS
============================================================ */

function ChallanSettings({
  settings,
  updateSetting,
}) {
  return (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <SettingCard>
        <SectionTitle
          icon={ReceiptText}
          title="e-Challan Integration"
          description="Configure automatic challan synchronization with external services."
        />

        <div className="mb-5 flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
              <WifiOff size={18} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                Integration Status
              </p>

              <p className="text-xs text-slate-500">
                Backend/API configuration required
              </p>
            </div>
          </div>

          <StatusBadge connected={false}>
            Not Configured
          </StatusBadge>
        </div>

        <SettingRow
          icon={RefreshCw}
          title="Automatic Synchronization"
          description="Automatically fetch new vehicle challans after a supported backend integration is configured."
        >
          <Toggle
            checked={Boolean(
              settings.challanAutoSync
            )}
            onChange={(value) =>
              updateSetting(
                "challanAutoSync",
                value
              )
            }
          />
        </SettingRow>

        <div className="py-5">
          <SelectField
            label="Synchronization Frequency"
            value={settings.syncFrequency}
            onChange={(value) =>
              updateSetting(
                "syncFrequency",
                value
              )
            }
          >
            <option value="15">
              Every 15 minutes
            </option>
            <option value="30">
              Every 30 minutes
            </option>
            <option value="60">
              Every 1 hour
            </option>
            <option value="180">
              Every 3 hours
            </option>
            <option value="360">
              Every 6 hours
            </option>
          </SelectField>
        </div>

        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-400"
        >
          <RefreshCw size={17} />
          Sync Now
        </button>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <CircleHelp
            size={18}
            className="mt-0.5 shrink-0 text-blue-600"
          />

          <p className="text-xs leading-5 text-blue-700">
            The Sync Now action will be enabled after the
            backend e-Challan integration is implemented.
          </p>
        </div>
      </SettingCard>
    </motion.div>
  );
}

/* ============================================================
   USERS & ROLES
============================================================ */

function UserRoleSettings({
  settings,
  updateSetting,
  currentUserRole,
}) {
  const roles = [
    {
      name: "Admin",
      description:
        "Full access to the complete fleet portal.",
      color: "bg-blue-50 text-blue-700",
    },
    {
      name: "Manager",
      description:
        "Can view and add fleet records, but cannot edit/delete records, manage users or change settings.",
      color:
        "bg-emerald-50 text-emerald-700",
    },
    {
      name: "Finance",
      description:
        "Finance access for viewing EMI and payment information and marking eligible payments as paid.",
      color:
        "bg-amber-50 text-amber-700",
    },
    {
      name: "User",
      description:
        "Can view and add records, but cannot edit, delete or mark payments as paid.",
      color:
        "bg-slate-100 text-slate-600",
    },
  ];

  const permissionLabels = [
    {
      key: "view",
      label: "View",
    },
    {
      key: "add",
      label: "Add",
    },
    {
      key: "edit",
      label: "Edit",
    },
    {
      key: "delete",
      label: "Delete",
    },
    {
      key: "paid",
      label: "Paid",
    },
    {
      key: "settings",
      label: "Settings",
    },
    {
      key: "users",
      label: "Users",
    },
  ];

  const canManagePermissions =
    currentUserRole === "Admin";

  const currentPermissions =
    normalizeRolePermissions(
      settings.rolePermissions
    );

  const getRolePermissions = (
    role
  ) => {
    return {
      ...defaultRolePermissions[role],
      ...(currentPermissions?.[role] ||
        {}),
    };
  };

  const updateRolePermission = (
    role,
    permission,
    value
  ) => {
    /*
      Only Admin can change the permission
      matrix.

      This is intentionally checked here
      instead of only hiding the UI because
      UI hiding alone is not permission
      enforcement.
    */
    if (!canManagePermissions) {
      return;
    }

    /*
      Admin must always retain complete access.
    */
    if (role === "Admin") {
      return;
    }

    const updatedPermissions =
      normalizeRolePermissions(
        currentPermissions
      );

    updatedPermissions[role] = {
      ...getRolePermissions(role),
      [permission]: Boolean(value),
    };

    updateSetting(
      "rolePermissions",
      updatedPermissions
    );
  };

  return (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <SettingCard>
        <SectionTitle
          icon={Users}
          title="Users & Roles"
          description="Define access levels and responsibilities for portal users."
        />

        <div className="space-y-3">
          {roles.map((role) => (
            <div
              key={role.name}
              className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <Users size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {role.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {role.description}
                    </p>
                  </div>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${role.color}`}
                >
                  Role
                </span>
              </div>

              <div className="mt-2 border-t border-slate-200 pt-3">
                <div className="flex flex-wrap gap-2">
                  {permissionLabels.map(
                    (permission) => {
                      const enabled =
                        Boolean(
                          getRolePermissions(
                            role.name
                          )[permission.key]
                        );

                      return (
                        <button
                          key={`${role.name}-${permission.key}`}
                          type="button"
                          disabled={
                            !canManagePermissions ||
                            role.name === "Admin"
                          }
                          onClick={() =>
                            updateRolePermission(
                              role.name,
                              permission.key,
                              !enabled
                            )
                          }
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                            enabled
                              ? "border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100"
                              : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50"
                          }`}
                        >
                          {enabled ? (
                            <CheckCircle2
                              size={13}
                            />
                          ) : (
                            <X size={13} />
                          )}

                          {permission.label}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SettingCard>

      <SettingCard>
        <SectionTitle
          icon={ShieldCheck}
          title="Permission Summary"
          description="These permissions are stored in FleetDoc Settings and can be used by the Users module."
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Role
                </th>

                {permissionLabels.map(
                  (permission) => (
                    <th
                      key={permission.key}
                      className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500"
                    >
                      {permission.label}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {roles.map((role) => {
                const permissions =
                  getRolePermissions(
                    role.name
                  );

                return (
                  <tr
                    key={`summary-${role.name}`}
                    className="border-b border-slate-50 transition-colors duration-200 hover:bg-slate-50"
                  >
                    <td className="px-3 py-4">
                      <span className="text-sm font-semibold text-slate-700">
                        {role.name}
                      </span>
                    </td>

                    {permissionLabels.map(
                      (permission) => {
                        const enabled =
                          Boolean(
                            permissions[
                              permission.key
                            ]
                          );

                        return (
                          <td
                            key={`${role.name}-summary-${permission.key}`}
                            className="px-3 py-4 text-center"
                          >
                            {enabled ? (
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                <CheckCircle2
                                  size={15}
                                />
                              </span>
                            ) : (
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <X size={14} />
                              </span>
                            )}
                          </td>
                        );
                      }
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SettingCard>

      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <CircleHelp
          size={19}
          className="mt-0.5 shrink-0 text-blue-600"
        />

        <p className="text-xs leading-5 text-blue-700">
          Role permissions are stored with FleetDoc Settings.
          The Users module and individual portal pages should
          enforce these permissions before showing or executing
          Add, Edit, Delete and Paid actions.
        </p>
      </div>
    </motion.div>
  );
}

// /* ============================================================
//    SECURITY
// ============================================================ */

// function SecuritySettings({
//   settings,
//   updateSetting,
// }) {
//   const [showPassword, setShowPassword] =
//     useState(false);

//   const [password, setPassword] =
//     useState("");

//   return (
//     <motion.div
//       variants={tabVariants}
//       initial="hidden"
//       animate="visible"
//       className="space-y-5"
//     >
//       <SettingCard>
//         <SectionTitle
//           icon={ShieldCheck}
//           title="Security"
//           description="Protect your fleet portal and user accounts."
//         />

//         <SettingRow
//           icon={KeyRound}
//           title="Two-Factor Authentication"
//           description="Require an additional verification step during login."
//         >
//           <Toggle
//             checked={Boolean(
//               settings.twoFactor
//             )}
//             onChange={(value) =>
//               updateSetting(
//                 "twoFactor",
//                 value
//               )
//             }
//           />
//         </SettingRow>

//         <SettingRow
//           icon={Lock}
//           title="Strong Password Policy"
//           description="Require users to use stronger passwords."
//         >
//           <Toggle
//             checked={Boolean(
//               settings.strongPassword
//             )}
//             onChange={(value) =>
//               updateSetting(
//                 "strongPassword",
//                 value
//               )
//             }
//           />
//         </SettingRow>

//         <SettingRow
//           icon={Clock3}
//           title="Session Timeout"
//           description="Automatically log users out after a period of inactivity."
//         >
//           <CustomDropdown
//             value={settings.sessionTimeout}
//             onChange={(value) =>
//               updateSetting(
//                 "sessionTimeout",
//                 Number(value)
//               )
//             }
//             className="w-44"
//           >
//             <option value={15}>
//               15 minutes
//             </option>
//             <option value={30}>
//               30 minutes
//             </option>
//             <option value={60}>
//               1 hour
//             </option>
//             <option value={120}>
//               2 hours
//             </option>
//           </CustomDropdown>
//         </SettingRow>
//       </SettingCard>

//       <SettingCard>
//         <SectionTitle
//           icon={Lock}
//           title="Password"
//           description="Password changes should be handled securely by the backend."
//         />

//         <div className="max-w-xl">
//           <label className="block">
//             <span className="mb-2 block text-sm font-semibold text-slate-700">
//               New Password
//             </span>

//             <div className="relative">
//               <input
//                 type={
//                   showPassword
//                     ? "text"
//                     : "password"
//                 }
//                 value={password}
//                 onChange={(e) =>
//                   setPassword(
//                     e.target.value
//                   )
//                 }
//                 placeholder="Enter new password"
//                 className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
//               />

//               <button
//                 type="button"
//                 onClick={() =>
//                   setShowPassword(
//                     (prev) => !prev
//                   )
//                 }
//                 className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
//               >
//                 {showPassword ? (
//                   <EyeOff size={18} />
//                 ) : (
//                   <Eye size={18} />
//                 )}
//               </button>
//             </div>
//           </label>

//           <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
//             <AlertTriangle
//               size={18}
//               className="mt-0.5 shrink-0 text-amber-600"
//             />

//             <p className="text-xs leading-5 text-amber-700">
//               The password field is intentionally kept out
//               of Settings persistence. When the backend is
//               connected, this should call the secure password
//               change API.
//             </p>
//           </div>
//         </div>
//       </SettingCard>
//     </motion.div>
//   );
// }


/* ============================================================
   SECURITY
============================================================ */

function SecuritySettings({
  settings,
  updateSetting,
}) {
  const {
    changePassword,
    notify,
  } = useFleet();
  const [showPassword, setShowPassword] =
    useState(false);

  const [password, setPassword] =
    useState("");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [changingPassword, setChangingPassword] =
    useState(false);

  return (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <SettingCard>
        <SectionTitle
          icon={ShieldCheck}
          title="Security"
          description="Protect your fleet portal and user accounts."
        />

        <SettingRow
          icon={KeyRound}
          title="Two-Factor Authentication"
          description="Require an additional verification step during login."
        >
          <Toggle
            checked={Boolean(
              settings.twoFactor
            )}
            onChange={(value) =>
              updateSetting(
                "twoFactor",
                value
              )
            }
          />
        </SettingRow>

        <SettingRow
          icon={Lock}
          title="Strong Password Policy"
          description="Require users to use stronger passwords."
        >
          <Toggle
            checked={Boolean(
              settings.strongPassword
            )}
            onChange={(value) =>
              updateSetting(
                "strongPassword",
                value
              )
            }
          />
        </SettingRow>

        <SettingRow
          icon={Clock3}
          title="Session Timeout"
          description="Automatically log users out after a period of inactivity."
        >
          <select
            value={settings.sessionTimeout}
            onChange={(e) =>
              updateSetting(
                "sessionTimeout",
                Number(e.target.value)
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          >
            <option value={15}>
              15 minutes
            </option>
            <option value={30}>
              30 minutes
            </option>
            <option value={60}>
              1 hour
            </option>
            <option value={120}>
              2 hours
            </option>
          </select>
        </SettingRow>
      </SettingCard>

      <SettingCard>
        <SectionTitle
          icon={Lock}
          title="Password"
          description="Password changes should be handled securely by the backend."
        />

        <div className="max-w-xl">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Current Password
            </span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              New Password
            </span>

            <div className="relative">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Enter new password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Confirm New Password
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </label>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={changingPassword}
              onClick={async () => {
                if (!currentPassword || !password || !confirmPassword) {
                  notify?.("Please fill current, new and confirm password fields.", "error");
                  return;
                }
                if (password !== confirmPassword) {
                  notify?.("New password and confirmation do not match.", "error");
                  return;
                }
                setChangingPassword(true);
                try {
                  const result = await changePassword(currentPassword, password);
                  notify?.(result?.message || "Password changed successfully.");
                  setCurrentPassword("");
                  setPassword("");
                  setConfirmPassword("");
                } catch (error) {
                  notify?.(error?.message || "Unable to change password.", "error");
                } finally {
                  setChangingPassword(false);
                }
              }}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {changingPassword ? "Changing..." : "Change Password"}
            </button>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <p className="text-xs leading-5 text-amber-700">
              Password changes are verified and securely saved by the backend.
              Your password is never stored in FleetDoc settings.
            </p>
          </div>
        </div>
      </SettingCard>
    </motion.div>
  );
}

/* ============================================================
   BACKUP
============================================================ */

function BackupSettings() {
  const {
    exportFleetData,
    importFleetData,
    notify,
  } = useFleet();

  const fileInputRef = useRef(null);

  const [restoring, setRestoring] =
    useState(false);

  const handleExport = async () => {
    try {
      const data =
        await exportFleetData?.();

      if (!data) {
        notify?.(
          "No FleetDoc data is available to export.",
          "error"
        );
        return;
      }

      const blob = new Blob([data], {
        type: "application/json;charset=utf-8",
      });

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download = `fleetdoc-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      notify?.(
        "FleetDoc backup exported successfully.",
        "success"
      );
    } catch (error) {
      console.error(
        "FleetDoc: Backup export failed",
        error
      );

      notify?.(
        "Unable to export FleetDoc backup.",
        "error"
      );
    }
  };

  const handleRestoreFile = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (
      file.type &&
      file.type !==
        "application/json" &&
      !file.name
        .toLowerCase()
        .endsWith(".json")
    ) {
      notify?.(
        "Please select a valid FleetDoc JSON backup file.",
        "error"
      );
      return;
    }

    setRestoring(true);

    try {
      const parsed = JSON.parse(
        await file.text()
      );

      const confirmed =
        window.confirm(
          "Restore this FleetDoc backup? Current local fleet data will be replaced by the backup."
        );

      if (!confirmed) return;

      await importFleetData?.(parsed);
    } catch (error) {
      console.error(
        "FleetDoc: Backup restore failed",
        error
      );

      notify?.(
        "Invalid or corrupted FleetDoc backup file.",
        "error"
      );
    } finally {
      setRestoring(false);
    }
  };

  return (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <SettingCard>
        <SectionTitle
          icon={Database}
          title="Backup & Data"
          description="Manage your portal data backup and export options."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <Download size={20} />
            </div>

            <h3 className="font-bold text-slate-800">
              Export Data
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Export your current fleet portal data as a JSON backup file.
            </p>

            <button
              type="button"
              onClick={handleExport}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
            >
              <Download size={16} />
              Export Data
            </button>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
              <Upload size={20} />
            </div>

            <h3 className="font-bold text-slate-800">
              Restore Data
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Restore FleetDoc data from a previously exported JSON backup file.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={
                handleRestoreFile
              }
              className="hidden"
            />

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={restoring}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {restoring ? (
                <RefreshCw
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Upload size={16} />
              )}

              {restoring
                ? "Restoring..."
                : "Restore Backup"}
            </button>
          </div>
        </div>
      </SettingCard>

      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <Database
          size={19}
          className="mt-0.5 shrink-0 text-blue-600"
        />

        <div>
          <p className="text-sm font-semibold text-blue-800">
            PostgreSQL Database Storage
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-700">
            Your FleetDoc data is securely managed through the PostgreSQL database.
            Use Backup & Data to export a complete backup or restore your data
            whenever required. All backup and restore operations are processed
            securely through the FleetDoc backend.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   INTEGRATIONS
============================================================ */

function IntegrationSettings() {
  const integrations = [
    {
      name: "e-Challan Service",
      description:
        "Fetch vehicle challans automatically after API integration.",
      icon: ReceiptText,
      connected: false,
    },
    {
      name: "Dispatch Portal",
      description:
        "Synchronize dispatch and trip information.",
      icon: Truck,
      connected: false,
    },
    {
      name: "Payment Gateway",
      description:
        "Process online challan and other payments.",
      icon: CreditCard,
      connected: false,
    },
    {
      name: "Email Service",
      description:
        "Send automated portal notifications.",
      icon: Mail,
      connected: false,
    },
  ];

  return (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <SettingCard>
        <SectionTitle
          icon={Plug}
          title="External Integrations"
          description="Connect your fleet portal with external services."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {integrations.map(
            (integration) => {
              const Icon =
                integration.icon;

              return (
                <div
                  key={integration.name}
                  className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <Icon size={20} />
                    </div>

                    <StatusBadge
                      connected={
                        integration.connected
                      }
                    >
                      {integration.connected
                        ? "Connected"
                        : "Not Connected"}
                    </StatusBadge>
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-slate-800">
                    {integration.name}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {integration.description}
                  </p>

                  <button
                    type="button"
                    disabled
                    className="mt-4 inline-flex cursor-not-allowed items-center gap-1.5 text-sm font-semibold text-slate-400"
                  >
                    Configure
                    <ChevronRight size={16} />
                  </button>
                </div>
              );
            }
          )}
        </div>
      </SettingCard>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <CircleHelp
          size={19}
          className="mt-0.5 shrink-0 text-amber-600"
        />

        <div>
          <p className="text-sm font-semibold text-amber-800">
            API credentials
          </p>

          <p className="mt-1 text-xs leading-5 text-amber-700">
            API keys and secret credentials should be stored
            securely in the Python backend environment, not
            directly inside the React frontend.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   APPEARANCE
============================================================ */

function AppearanceSettings({
  settings,
  updateSetting,
}) {
  return (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <SettingCard>
        <SectionTitle
          icon={Palette}
          title="Appearance"
          description="Customize the look and behavior of your fleet portal."
        />

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              id: "light",
              label: "Light",
              icon: Sun,
            },
            {
              id: "dark",
              label: "Dark",
              icon: Moon,
            },
            {
              id: "system",
              label: "System",
              icon: Monitor,
            },
          ].map((theme) => {
            const Icon = theme.icon;

            const active =
              settings.theme ===
              theme.id;

            return (
              <button
                key={theme.id}
                type="button"
                onClick={() =>
                  updateSetting(
                    "theme",
                    theme.id
                  )
                }
                className={`rounded-2xl border p-5 text-left transition-all duration-300 ${
                  active
                    ? "border-blue-300 bg-blue-50 shadow-sm"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                <Icon
                  size={21}
                  className={
                    active
                      ? "text-blue-600"
                      : "text-slate-500"
                  }
                />

                <p className="mt-3 text-sm font-bold text-slate-800">
                  {theme.label}
                </p>

                {active && (
                  <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-blue-600">
                    <CheckCircle2 size={14} />
                    Selected
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </SettingCard>

      <SettingCard>
        <SettingRow
          icon={Activity}
          title="Interface Animations"
          description="Enable smooth transitions and animations throughout the portal."
        >
          <Toggle
            checked={Boolean(
              settings.animations
            )}
            onChange={(value) =>
              updateSetting(
                "animations",
                value
              )
            }
          />
        </SettingRow>

        <SettingRow
          icon={Palette}
          title="Compact Tables"
          description="Reduce table row spacing to display more fleet data."
        >
          <Toggle
            checked={Boolean(
              settings.compactTables
            )}
            onChange={(value) =>
              updateSetting(
                "compactTables",
                value
              )
            }
          />
        </SettingRow>
      </SettingCard>
    </motion.div>
  );
}

/* ============================================================
   AUDIT LOGS
============================================================ */

// function AuditSettings() {
//   const {
//     auditLogs = [],
//     clearAuditLogs,
//     settings,
//   } = useFleet();

//   const logs = Array.isArray(
//     auditLogs
//   )
//     ? auditLogs
//     : [];

//   const formatLogTime = (
//     value
//   ) => {
//     if (!value) return "-";

//     const date = new Date(value);

//     if (
//       Number.isNaN(
//         date.getTime()
//       )
//     ) {
//       return String(value);
//     }

//     return date.toLocaleString(
//       "en-IN",
//       {
//         dateStyle: "medium",
//         timeStyle: "short",
//       }
//     );
//   };

//   const moduleIcon = {
//     Settings: SettingsIcon,
//     Vehicles: Truck,
//     Documents: FileText,
//     EMI: IndianRupee,
//     Challans: ReceiptText,
//     Users,
//     Security: ShieldCheck,
//   };

//   const handleClear = () => {
//     if (!logs.length) return;

//     if (
//       window.confirm(
//         "Clear all audit logs? This action cannot be undone."
//       )
//     ) {
//       clearAuditLogs?.();
//     }
//   };

//   return (
//     <motion.div
//       variants={tabVariants}
//       initial="hidden"
//       animate="visible"
//       className="space-y-5"
//     >
//       <SettingCard>
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
//           <SectionTitle
//             icon={ClipboardList}
//             title="Audit Logs"
//             description="Track important actions performed inside the fleet portal."
//           />

//           {settings?.auditLogsEnabled !==
//             false &&
//             logs.length > 0 && (
//               <button
//                 type="button"
//                 onClick={handleClear}
//                 className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-100"
//               >
//                 <Trash2 size={16} />
//                 Clear Logs
//               </button>
//             )}
//         </div>

//         <div className="mb-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
//           <Activity
//             size={18}
//             className="mt-0.5 shrink-0 text-blue-600"
//           />

//           <p className="text-xs leading-5 text-blue-700">
//             Audit entries are generated by FleetDoc actions and stored with the current frontend data. Backend persistence can be added later.
//           </p>
//         </div>

//         {settings?.auditLogsEnabled ===
//         false ? (
//           <div className="rounded-xl border border-slate-100 bg-slate-50 p-8 text-center">
//             <ClipboardList
//               className="mx-auto text-slate-400"
//               size={28}
//             />

//             <p className="mt-3 text-sm font-semibold text-slate-700">
//               Audit logging is disabled
//             </p>

//             <p className="mt-1 text-xs text-slate-500">
//               Turn on audit logging to record future activity.
//             </p>
//           </div>
//         ) : logs.length === 0 ? (
//           <div className="rounded-xl border border-slate-100 bg-slate-50 p-8 text-center">
//             <Activity
//               className="mx-auto text-slate-400"
//               size={28}
//             />

//             <p className="mt-3 text-sm font-semibold text-slate-700">
//               No audit activity yet
//             </p>

//             <p className="mt-1 text-xs text-slate-500">
//               Actions performed in FleetDoc will appear here.
//             </p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[650px]">
//               <thead>
//                 <tr className="border-b border-slate-100 text-left">
//                   <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
//                     User
//                   </th>

//                   <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
//                     Action
//                   </th>

//                   <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
//                     Module
//                   </th>

//                   <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
//                     Time
//                   </th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {logs.map(
//                   (log, index) => {
//                     const Icon =
//                       moduleIcon[
//                         log.module
//                       ] ||
//                       Activity;

//                     return (
//                       <motion.tr
//                         key={
//                           log.id ||
//                           `${log.user}-${log.timestamp}-${index}`
//                         }
//                         initial={{
//                           opacity: 0,
//                           y: 8,
//                         }}
//                         animate={{
//                           opacity: 1,
//                           y: 0,
//                         }}
//                         transition={{
//                           delay:
//                             index * 0.03,
//                         }}
//                         className="transition-colors duration-200 hover:bg-slate-50"
//                       >
//                         <td className="px-3 py-4">
//                           <div className="flex items-center gap-2">
//                             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
//                               <Users size={15} />
//                             </div>

//                             <span className="text-sm font-semibold text-slate-700">
//                               {log.user ||
//                                 "System"}
//                             </span>
//                           </div>
//                         </td>

//                         <td className="px-3 py-4 text-sm text-slate-600">
//                           <div className="font-medium">
//                             {log.action ||
//                               "Activity"}
//                           </div>

//                           {log.description && (
//                             <div className="mt-0.5 text-xs text-slate-400">
//                               {
//                                 log.description
//                               }
//                             </div>
//                           )}
//                         </td>

//                         <td className="px-3 py-4">
//                           <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
//                             <Icon size={13} />
//                             {log.module ||
//                               "System"}
//                           </span>
//                         </td>

//                         <td className="px-3 py-4 text-xs text-slate-500">
//                           {formatLogTime(
//                             log.timestamp ||
//                               log.time
//                           )}
//                         </td>
//                       </motion.tr>
//                     );
//                   }
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </SettingCard>
//     </motion.div>
//   );
// }

function AuditSettings() {
  const {
    auditLogs = [],
    clearAuditLogs,
    settings,
  } = useFleet();

  const [showClearModal, setShowClearModal] = useState(false);

  const logs = Array.isArray(auditLogs)
    ? auditLogs
    : [];

  const formatLogTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const moduleIcon = {
    Settings: SettingsIcon,
    Vehicles: Truck,
    Documents: FileText,
    EMI: IndianRupee,
    Challans: ReceiptText,
    Users,
    Security: ShieldCheck,
  };

  const handleClear = () => {
    if (!logs.length) return;

    setShowClearModal(true);
  };

  const confirmClearLogs = async () => {
    await clearAuditLogs?.();
    setShowClearModal(false);
  };

  return (
    <>
      <motion.div
        variants={tabVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        <SettingCard>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <SectionTitle
              icon={ClipboardList}
              title="Audit Logs"
              description="Track important actions performed inside the fleet portal."
            />

            {settings?.auditLogsEnabled !== false &&
              logs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-100 hover:shadow-md hover:shadow-red-100"
                >
                  <Trash2
                    size={16}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                  Clear Logs
                </button>
              )}
          </div>

          <div className="mb-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <Activity
              size={18}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <p className="text-xs leading-5 text-blue-700">
              Audit entries are generated by FleetDoc actions and stored securely
              in the FleetDoc database.
            </p>
          </div>

          {settings?.auditLogsEnabled === false ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-8 text-center">
              <ClipboardList
                className="mx-auto text-slate-400"
                size={28}
              />

              <p className="mt-3 text-sm font-semibold text-slate-700">
                Audit logging is disabled
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Turn on audit logging to record future activity.
              </p>
            </div>
          ) : logs.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-8 text-center">
              <Activity
                className="mx-auto text-slate-400"
                size={28}
              />

              <p className="mt-3 text-sm font-semibold text-slate-700">
                No audit activity yet
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Actions performed in FleetDoc will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      User
                    </th>

                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Action
                    </th>

                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Module
                    </th>

                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Time
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log, index) => {
                    const Icon =
                      moduleIcon[log.module] ||
                      Activity;

                    return (
                      <motion.tr
                        key={
                          log.id ||
                          `${log.user}-${log.timestamp}-${index}`
                        }
                        initial={{
                          opacity: 0,
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: index * 0.03,
                        }}
                        className="transition-colors duration-200 hover:bg-slate-50"
                      >
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                              <User2 size={15} />
                            </div>

                            <span className="text-sm font-semibold text-slate-700">
                              {log.user || "System"}
                            </span>
                          </div>
                        </td>

                        <td className="px-3 py-4 text-sm text-slate-600">
                          <div className="font-medium">
                            {log.action || "Activity"}
                          </div>

                          {log.description && (
                            <div className="mt-0.5 text-xs text-slate-400">
                              {log.description}
                            </div>
                          )}
                        </td>

                        <td className="px-3 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                            <Icon size={13} />
                            {log.module || "System"}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-xs text-slate-500">
                          {formatLogTime(
                            log.timestamp || log.time
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SettingCard>
      </motion.div>

      {/* =========================================================
          CLEAR AUDIT LOGS CONFIRMATION MODAL
      ========================================================= */}
      <AnimatePresence>
        {showClearModal && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setShowClearModal(false);
              }
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.92,
                y: 25,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.92,
                y: 15,
              }}
              transition={{
                duration: 0.25,
                ease: "easeOut",
              }}
              className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 dark:border-slate-700 dark:bg-slate-900"
            >
              {/* Modal Header */}
              <div className="relative px-6 pb-5 pt-6">
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>

                <div className="flex flex-col items-center text-center">
                  {/* Warning Icon */}
                  <motion.div
                    initial={{
                      scale: 0.7,
                      rotate: -8,
                    }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                    }}
                    transition={{
                      delay: 0.08,
                      duration: 0.3,
                    }}
                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-lg shadow-red-100 dark:bg-red-500/10 dark:text-red-400 dark:shadow-none"
                  >
                    <Trash2
                      size={28}
                      strokeWidth={2}
                    />
                  </motion.div>

                  <h3 className="mt-5 text-xl font-bold text-slate-800 dark:text-white">
                    Clear Audit Logs?
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Are you sure you want to permanently delete all
                    audit logs? This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Log Count */}
              <div className="mx-6 mb-5 rounded-2xl border border-red-100 bg-red-50/70 p-4 dark:border-red-500/20 dark:bg-red-500/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm dark:bg-slate-800 dark:text-red-400">
                    <ClipboardList size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-red-700 dark:text-red-400">
                      {logs.length}{" "}
                      {logs.length === 1
                        ? "audit entry"
                        : "audit entries"}
                    </p>

                    <p className="mt-0.5 text-xs text-red-600/70 dark:text-red-400/70">
                      All recorded activity will be removed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:justify-end dark:border-slate-800 dark:bg-slate-950/40">
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <motion.button
                  type="button"
                  onClick={confirmClearLogs}
                  whileHover={{
                    scale: 1.02,
                    y: -1,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white shadow-lg shadow-red-200 transition-all duration-300 hover:bg-red-700 hover:shadow-red-300 dark:shadow-none"
                >
                  <Trash2 size={16} />
                  Clear All Logs
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function Settings() {
  const navigate = useNavigate();
  const fleetContext = useFleet();

  const contextSettings =
    fleetContext?.settings || {};

  const updateContextSettings =
    fleetContext?.updateSettings;

  /* ==========================================================
     CURRENT USER
  ========================================================== */

  const getCurrentUserRole =
    fleetContext?.getCurrentUserRole;

  const currentUserRole =
    getCurrentUserRole?.() ||
    "User";

  const isAdmin =
    currentUserRole === "Admin";

  const [activeSection, setActiveSection] =
    useState("general");

  /* ==========================================================
     SETTINGS STATE
  ========================================================== */

  const [settings, setSettings] =
    useState(() => ({
      ...defaultSettings,
      ...contextSettings,

      vehicleTypes:
        Array.isArray(
          contextSettings.vehicleTypes
        )
          ? contextSettings.vehicleTypes
          : defaultVehicleTypes,

      vehicleStatuses:
        Array.isArray(
          contextSettings.vehicleStatuses
        )
          ? contextSettings.vehicleStatuses
          : defaultVehicleStatuses,

      rolePermissions:
        normalizeRolePermissions(
          contextSettings.rolePermissions
        ),
    }));

  /*
    The current user's Settings permission is
    read from the role permission configuration.

    Admin is always allowed.
  */
  const currentRolePermissions =
    normalizeRolePermissions(
      settings.rolePermissions
    );

  const hasSettingsPermission =
    Boolean(
      currentRolePermissions?.[
        currentUserRole
      ]?.settings
    );

  /*
    Optional compatibility with a FleetContext
    that already exposes hasPermission().
  */
  const contextHasSettingsPermission =
    typeof fleetContext?.hasPermission ===
    "function"
      ? fleetContext.hasPermission(
          "settings"
        )
      : undefined;

  const canAccessSettings =
    isAdmin ||
    (typeof contextHasSettingsPermission ===
    "boolean"
      ? contextHasSettingsPermission
      : hasSettingsPermission);

  /* ==========================================================
     SETTINGS ACCESS PROTECTION

     IMPORTANT:
     Settings is no longer Admin-only.

     Admin:
       Always allowed.

     Other roles:
       Allowed only when their role has
       Settings permission enabled.
  ========================================================== */

  useEffect(() => {
    if (!canAccessSettings) {
      navigate("/", {
        replace: true,
      });
    }
  }, [canAccessSettings, navigate]);

  const [saved, setSaved] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  /* ==========================================================
     SYNC SETTINGS FROM FLEET CONTEXT
  ========================================================== */

  useEffect(() => {
    setSettings((previous) => ({
      ...defaultSettings,
      ...previous,
      ...contextSettings,

      vehicleTypes:
        Array.isArray(
          contextSettings.vehicleTypes
        )
          ? contextSettings.vehicleTypes
          : Array.isArray(
              previous.vehicleTypes
            )
          ? previous.vehicleTypes
          : defaultVehicleTypes,

      vehicleStatuses:
        Array.isArray(
          contextSettings.vehicleStatuses
        )
          ? contextSettings.vehicleStatuses
          : Array.isArray(
              previous.vehicleStatuses
            )
          ? previous.vehicleStatuses
          : defaultVehicleStatuses,

      rolePermissions:
        normalizeRolePermissions(
          contextSettings.rolePermissions ||
            previous.rolePermissions
        ),
    }));
  }, [contextSettings]);

  /* ==========================================================
     UPDATE SETTING
  ========================================================== */

  const updateSetting = (
    key,
    value
  ) => {
    const aliases = {
      paymentMode:
        "defaultPaymentMode",

      syncFrequency:
        "challanSyncFrequency",

      twoFactor:
        "twoFactorAuthentication",

      strongPassword:
        "strongPasswordRequired",

      animations:
        "animationsEnabled",
    };

    const canonicalKey =
      aliases[key] || key;

    setSettings((prev) => ({
      ...prev,
      [key]: value,
      [canonicalKey]: value,
    }));

    if (
      [
        "theme",
        "animations",
        "animationsEnabled",
        "compactTables",
      ].includes(canonicalKey)
    ) {
      try {
        if (
          canonicalKey ===
          "theme"
        ) {
          const root =
            document.documentElement;

          const media =
            window.matchMedia(
              "(prefers-color-scheme: dark)"
            );

          const isDark =
            value === "dark" ||
            (value === "system" &&
              media.matches);

          root.classList.toggle(
            "dark",
            isDark
          );

          root.dataset.theme =
            isDark
              ? "dark"
              : "light";

          document.body.classList.toggle(
            "dark",
            isDark
          );
        }

        if (
          canonicalKey ===
            "animations" ||
          canonicalKey ===
            "animationsEnabled"
        ) {
          document.body.classList.toggle(
            "fleetdoc-animations-off",
            !Boolean(value)
          );
        }

        if (
          canonicalKey ===
          "compactTables"
        ) {
          document.body.classList.toggle(
            "fleetdoc-compact",
            Boolean(value)
          );
        }
      } catch (error) {
        console.debug(
          "FleetDoc: runtime preference preview unavailable",
          error
        );
      }
    }

    setSaved(false);
  };

  /* ==========================================================
     SAVE SETTINGS
  ========================================================== */

  const handleSave = async () => {
    setSaving(true);

    try {
      const updatedSettings = {
        ...settings,

        defaultPaymentMode:
          settings.defaultPaymentMode ??
          settings.paymentMode ??
          "Bank Transfer",

        challanSyncFrequency:
          settings.challanSyncFrequency ??
          settings.syncFrequency ??
          "30",

        twoFactorAuthentication:
          Boolean(
            settings.twoFactorAuthentication ??
              settings.twoFactor
          ),

        strongPasswordRequired:
          Boolean(
            settings.strongPasswordRequired ??
              settings.strongPassword
          ),

        animationsEnabled:
          Boolean(
            settings.animationsEnabled ??
              settings.animations
          ),

        vehicleTypes:
          Array.isArray(
            settings.vehicleTypes
          )
            ? settings.vehicleTypes
            : defaultVehicleTypes,

        vehicleStatuses:
          Array.isArray(
            settings.vehicleStatuses
          )
            ? settings.vehicleStatuses
            : defaultVehicleStatuses,

        /*
          Normalize the complete role permission
          matrix before persistence.

          Admin is automatically restored to
          full access by the normalizer.
        */
        rolePermissions:
          normalizeRolePermissions(
            settings.rolePermissions
          ),

        lastUpdated:
          new Date().toISOString(),
      };

      if (
        typeof updateContextSettings ===
        "function"
      ) {
        await updateContextSettings(
          updatedSettings
        );
      } else {
        localStorage.setItem(
          "fleetPortalSettings",
          JSON.stringify(
            updatedSettings
          )
        );
      }

      setSettings(updatedSettings);
      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Unable to save settings:",
        error
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     RESET
  ========================================================== */

  const handleReset = () => {
    setSettings({
      ...defaultSettings,
      ...contextSettings,

      vehicleTypes:
        Array.isArray(
          contextSettings.vehicleTypes
        )
          ? contextSettings.vehicleTypes
          : defaultVehicleTypes,

      vehicleStatuses:
        Array.isArray(
          contextSettings.vehicleStatuses
        )
          ? contextSettings.vehicleStatuses
          : defaultVehicleStatuses,

      rolePermissions:
        normalizeRolePermissions(
          contextSettings.rolePermissions
        ),
    });

    setSaved(false);
  };

  const activeMenu = useMemo(
    () =>
      settingsMenu.find(
        (item) =>
          item.id ===
          activeSection
      ),
    [activeSection]
  );

  /* ==========================================================
     RENDER ACTIVE SECTION
  ========================================================== */

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return (
          <GeneralSettings
            settings={settings}
            updateSetting={
              updateSetting
            }
          />
        );

      case "notifications":
        return (
          <NotificationSettings
            settings={settings}
            updateSetting={
              updateSetting
            }
          />
        );

      case "documents":
        return (
          <DocumentSettings
            settings={settings}
            updateSetting={
              updateSetting
            }
          />
        );

      case "vehicles":
        return (
          <VehicleSettings
            settings={settings}
            updateSetting={
              updateSetting
            }
          />
        );

      case "emi":
        return (
          <EMISettings
            settings={settings}
            updateSetting={
              updateSetting
            }
          />
        );

      case "challans":
        return (
          <ChallanSettings
            settings={settings}
            updateSetting={
              updateSetting
            }
          />
        );

      case "users":
        return (
          <UserRoleSettings
            settings={settings}
            updateSetting={
              updateSetting
            }
            currentUserRole={
              currentUserRole
            }
          />
        );

      case "security":
        return (
          <SecuritySettings
            settings={settings}
            updateSetting={
              updateSetting
            }
          />
        );

      case "backup":
        return <BackupSettings />;

      case "integrations":
        return (
          <IntegrationSettings />
        );

      case "appearance":
        return (
          <AppearanceSettings
            settings={settings}
            updateSetting={
              updateSetting
            }
          />
        );

      case "audit":
        return <AuditSettings />;

      default:
        return null;
    }
  };

  const ActiveIcon =
    activeMenu?.icon;

  const lastUpdatedText =
    settings.lastUpdated
      ? new Date(
          settings.lastUpdated
        ).toLocaleString(
          "en-IN",
          {
            dateStyle: "medium",
            timeStyle: "short",
          }
        )
      : "Not saved yet";

  /*
    Prevent the Settings UI from rendering
    while an unauthorized user is redirected.
  */
  if (!canAccessSettings) {
    return null;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* PAGE HEADER */}

      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 transition duration-300 hover:scale-110 hover:rotate-3">
              <SettingsIcon
                size={23}
                strokeWidth={2.3}
              />
            </div>

            <div>
              <span className="block text-2xl font-bold text-slate-800">
                Settings
              </span>
            </div>
          </div>
        }
        subtitle="Manage your fleet portal configuration and preferences."
      />

      {/* TOP STATUS BAR */}

      <motion.div
        variants={itemVariants}
        className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-5 text-white shadow-xl shadow-blue-100"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{
                scale: 1.08,
                rotate: 5,
              }}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-md"
            >
              <SettingsIcon
                size={26}
                strokeWidth={2.3}
              />
            </motion.div>

            <div>
              <p className="text-sm font-medium text-blue-100">
                Fleet Portal Configuration
              </p>

              <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                System Settings
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-blue-100">
                Configure your company,
                vehicles, documents,
                notifications, security
                and integrations from one place.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm backdrop-blur-sm sm:flex">
              <Server size={17} />

              <span>
                Portal Online
              </span>

              <span className="h-2 w-2 rounded-full bg-emerald-300" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* SETTINGS LAYOUT */}

      <motion.div
        variants={itemVariants}
        className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]"
      >
        {/* SIDEBAR */}

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-6">
          <div className="mb-3 px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Configuration
            </p>
          </div>

          <nav className="space-y-1">
            {settingsMenu.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  activeSection ===
                  item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setActiveSection(
                        item.id
                      )
                    }
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${
                      active
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                        active
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm"
                      }`}
                    >
                      <Icon size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-semibold ${
                          active
                            ? "text-blue-700"
                            : "text-slate-700"
                        }`}
                      >
                        {item.label}
                      </p>

                      <p className="mt-0.5 hidden truncate text-[11px] text-slate-400 xl:block">
                        {item.description}
                      </p>
                    </div>

                    {active && (
                      <ChevronRight
                        size={16}
                        className="shrink-0 text-blue-500"
                      />
                    )}
                  </button>
                );
              }
            )}
          </nav>
        </aside>

        {/* CONTENT */}

        <main className="min-w-0">
          <AnimatePresence
            mode="wait"
          >
            <motion.div
              key={activeSection}
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
                y: -10,
              }}
              transition={{
                duration: 0.25,
              }}
            >
              {/* CONTENT HEADER */}

              <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {ActiveIcon && (
                    <>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <ActiveIcon
                          size={21}
                        />
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          {
                            activeMenu.label
                          }
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {
                            activeMenu.description
                          }
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {activeSection !==
                  "audit" && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={
                        handleReset
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-800"
                    >
                      <RotateCcw
                        size={16}
                      />

                      <span className="hidden sm:inline">
                        Reset
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleSave
                      }
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <RefreshCw
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Save size={16} />
                      )}

                      {saving
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>

              {/* SAVE MESSAGE */}

              <AnimatePresence>
                {saved && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                      scale: 0.98,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                      scale: 0.98,
                    }}
                    className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                  >
                    <CheckCircle2
                      size={19}
                    />

                    <div>
                      <p className="font-semibold">
                        Settings saved successfully
                      </p>

                      <p className="mt-0.5 text-xs text-emerald-600">
                        Your fleet portal
                        preferences
                        have been updated.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ACTIVE SECTION */}

              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>

      {/* FOOTER */}

      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
            <ShieldCheck size={17} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700">
              Your settings are secure
            </p>

            <p className="text-xs text-slate-500">
              Last saved:{" "}
              {lastUpdatedText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Clock3 size={14} />
          Fleet Portal Settings
        </div>
      </motion.div>
    </motion.div>
  );
}