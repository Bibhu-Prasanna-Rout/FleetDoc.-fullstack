
// import { useEffect, useState } from "react";
// import {
//   ShieldCheck,
//   Mail,
//   Lock,
//   Eye,
//   EyeOff,
//   ArrowRight,
//   CheckCircle2,
//   X,
//   AlertCircle,
//   KeyRound,
//   User,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useFleet } from "../context/fleetContext";
// import logo from "../assets/FleetDoc-logo 1.png";

// export default function Login() {
//   const navigate = useNavigate();

//   const {
//     users = [],
//     addUser,
//     settings,
//     login,
//     verifyLogin2FA,
//     forgotPasswordRequest,
//     verifyForgotPasswordOtp,
//     resetPassword,
//   } = useFleet();

//   /* =========================================================
//      NORMAL LOGIN STATES
//   ========================================================= */
//   const [showPassword, setShowPassword] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [remember, setRemember] = useState(false);
//   const [error, setError] = useState("");
//   const [busy, setBusy] = useState(false);
//   const [showTwoFactor, setShowTwoFactor] = useState(false);
//   const [twoFactorOtp, setTwoFactorOtp] = useState("");
//   const [twoFactorChallengeId, setTwoFactorChallengeId] = useState(null);
//   const [twoFactorError, setTwoFactorError] = useState("");
//   const [twoFactorExpiresAt, setTwoFactorExpiresAt] = useState(null);
//   const [loginLockedUntil, setLoginLockedUntil] = useState(null);

//   /* =========================================================
//      CONTACT ADMINISTRATOR POPUP
//   ========================================================= */
//   const [showContactAdmin, setShowContactAdmin] = useState(false);

//   /* =========================================================
//      FIRST ADMIN SETUP STATES
//   ========================================================= */
//   const [adminName, setAdminName] = useState("");
//   const [adminEmail, setAdminEmail] = useState("");
//   const [adminPassword, setAdminPassword] = useState("");
//   const [adminConfirmPassword, setAdminConfirmPassword] =
//     useState("");

//   const [showAdminPassword, setShowAdminPassword] =
//     useState(false);

//   const [showAdminConfirmPassword, setShowAdminConfirmPassword] =
//     useState(false);

//   const [adminError, setAdminError] = useState("");
//   const [adminSuccess, setAdminSuccess] = useState("");

//   /* =========================================================
//      FORGOT PASSWORD STATES
//   ========================================================= */
//   const [showForgotPassword, setShowForgotPassword] =
//     useState(false);

//   const [forgotEmail, setForgotEmail] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] =
//     useState(false);

//   const [forgotError, setForgotError] = useState("");
//   const [forgotSuccess, setForgotSuccess] = useState("");

//   const [emailChecked, setEmailChecked] = useState(false);
//   const [registeredUser, setRegisteredUser] = useState(null);

//   /* =========================================================
//      EMAIL OTP STATES
//   ========================================================= */
//   const [otp, setOtp] = useState("");
//   const [otpVerified, setOtpVerified] = useState(false);
//   const [otpExpiresAt, setOtpExpiresAt] = useState(null);

//   /* =========================================================
//      FIRST ADMINISTRATOR SETUP DETECTION
//   ========================================================= */

//   const isFirstSetup = users.length === 0;

//   /* =========================================================
//      PASSWORD RULES
//   ========================================================= */

//   const passwordRules = {
//     length: adminPassword.length >= 6,
//     capital: /[A-Z]/.test(adminPassword),
//     number: /[0-9]/.test(adminPassword),
//     special: /[^A-Za-z0-9]/.test(adminPassword),
//   };

//   const resetPasswordRules = {
//     length: newPassword.length >= 6,
//     capital: /[A-Z]/.test(newPassword),
//     number: /[0-9]/.test(newPassword),
//     special: /[^A-Za-z0-9]/.test(newPassword),
//   };

//   /* =========================================================
//      HELPER — ERROR MESSAGE
//   ========================================================= */

//   const getErrorMessage = (err, fallback) => {
//     if (!err) return fallback;

//     if (typeof err === "string") {
//       return err;
//     }

//     if (err?.message) {
//       return err.message;
//     }

//     if (err?.detail) {
//       if (typeof err.detail === "string") {
//         return err.detail;
//       }

//       if (Array.isArray(err.detail)) {
//         return err.detail
//           .map((item) => {
//             if (typeof item === "string") {
//               return item;
//             }

//             return item?.msg || "Validation error";
//           })
//           .join("\n");
//       }

//       if (typeof err.detail === "object") {
//         return (
//           err.detail?.message ||
//           err.detail?.msg ||
//           JSON.stringify(err.detail)
//         );
//       }
//     }

//     return fallback;
//   };

//   /* =========================================================
//      HELPER — LOGIN SESSION
//   ========================================================= */

//   const createLoginSession = (user) => {
//     if (!user) return;

//     localStorage.setItem("fleetdoc_logged_in", "true");

//     localStorage.setItem(
//       "fleetdoc_user_id",
//       String(user.id)
//     );

//     localStorage.setItem(
//       "fleetdoc_user_email",
//       user.email || ""
//     );

//     localStorage.setItem(
//       "fleetdoc_user_name",
//       user.name || ""
//     );

//     localStorage.setItem(
//       "fleetdoc_user_role",
//       user.role || "Admin"
//     );
//   };

//   /* =========================================================
//      NORMAL LOGIN
//   ========================================================= */

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (!email.trim() || !password) {
//       setError("Please enter your email and password.");
//       return;
//     }

//     if (loginLockedUntil && Date.now() < loginLockedUntil) {
//       setError("You reached the attempt limit. Please try again after 15 minutes and contact the admin.");
//       return;
//     }

//     if (loginLockedUntil && Date.now() >= loginLockedUntil) {
//       setLoginLockedUntil(null);
//     }

//     setBusy(true);

//     try {
//       const result = await login(email.trim(), password, remember);

//       if (result?.requires_2fa) {
//         setTwoFactorChallengeId(result.challenge_id);
//         setTwoFactorOtp("");
//         setTwoFactorError("");
//         setTwoFactorExpiresAt(
//           result?.expires_at ? new Date(result.expires_at).getTime() : null
//         );
//         setShowTwoFactor(true);
//         return;
//       }

//       setLoginLockedUntil(null);
//       navigate("/");
//     } catch (err) {
//       if (err?.status === 423) {
//         const lockedUntil = err?.detail?.locked_until || err?.data?.detail?.locked_until;
//         const timestamp = lockedUntil ? new Date(lockedUntil).getTime() : Date.now() + 15 * 60 * 1000;
//         setLoginLockedUntil(timestamp);
//         setPassword("");
//         setError("You reached the attempt limit. Please try again after 15 minutes and contact the admin.");
//         window.setTimeout(() => {
//           setLoginLockedUntil(null);
//           setError("");
//         }, Math.max(1000, timestamp - Date.now()));
//       } else {
//         setError(getErrorMessage(err, "Unable to sign in. Please try again."));
//       }
//     } finally {
//       setBusy(false);
//     }
//   };

//   /* =========================================================
//      FIRST ADMINISTRATOR ACCOUNT
//   ========================================================= */

//   const handleCreateAdministrator = async (e) => {
//     e.preventDefault();

//     setAdminError("");
//     setAdminSuccess("");

//     const name = adminName.trim();

//     const normalizedEmail =
//       adminEmail.trim().toLowerCase();

//     /* -------------------------------------------------------
//        BASIC VALIDATION
//     ------------------------------------------------------- */

//     if (!name) {
//       setAdminError("Please enter your full name.");
//       return;
//     }

//     if (!normalizedEmail) {
//       setAdminError("Please enter your email address.");
//       return;
//     }

//     if (
//       !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
//         normalizedEmail
//       )
//     ) {
//       setAdminError("Please enter a valid email address.");
//       return;
//     }

//     if (
//       !adminPassword ||
//       !adminConfirmPassword
//     ) {
//       setAdminError(
//         "Please enter and confirm your password."
//       );
//       return;
//     }

//     /* -------------------------------------------------------
//        MAKE SURE FIRST SETUP IS STILL REQUIRED
//     ------------------------------------------------------- */

//     if (users.length > 0) {
//       setAdminError(
//         "An administrator account already exists. Please sign in."
//       );
//       return;
//     }

//     /* -------------------------------------------------------
//        STRONG PASSWORD VALIDATION
//     ------------------------------------------------------- */

//     const strongPasswordRequired =
//       settings?.strongPasswordRequired ??
//       settings?.strongPassword ??
//       true;

//     if (
//       strongPasswordRequired &&
//       adminPassword.length < 6
//     ) {
//       setAdminError(
//         "Password must be at least 6 characters."
//       );
//       return;
//     }

//     if (
//       strongPasswordRequired &&
//       !/[A-Z]/.test(adminPassword)
//     ) {
//       setAdminError(
//         "Password must contain at least one capital letter."
//       );
//       return;
//     }

//     if (
//       strongPasswordRequired &&
//       !/[0-9]/.test(adminPassword)
//     ) {
//       setAdminError(
//         "Password must contain at least one number."
//       );
//       return;
//     }

//     if (
//       strongPasswordRequired &&
//       !/[^A-Za-z0-9]/.test(adminPassword)
//     ) {
//       setAdminError(
//         "Password must contain at least one special character."
//       );
//       return;
//     }

//     if (
//       adminPassword !==
//       adminConfirmPassword
//     ) {
//       setAdminError("Passwords do not match.");
//       return;
//     }

//     /* -------------------------------------------------------
//        CREATE FIRST ADMIN
//     ------------------------------------------------------- */

//     const administrator = {
//       name,
//       email: normalizedEmail,
//       password: adminPassword,
//       role: "Admin",
//       status: "Active",
//     };

//     try {
//       await addUser(administrator);

//       createLoginSession(administrator);

//       if (remember) {
//         localStorage.setItem(
//           "fleetdoc_email",
//           normalizedEmail
//         );
//       }

//       setAdminSuccess(
//         "Administrator account created successfully."
//       );

//       setTimeout(() => {
//         navigate("/");
//       }, 700);
//     } catch (err) {
//       console.error(
//         "Administrator account creation failed:",
//         err
//       );

//       setAdminError(
//         getErrorMessage(
//           err,
//           "Unable to create the administrator account. Please try again."
//         )
//       );
//     }
//   };

//   /* =========================================================
//      FORGOT PASSWORD
//   ========================================================= */

//   const openForgotPassword = () => {
//     setForgotEmail("");
//     setNewPassword("");
//     setConfirmPassword("");
//     setForgotError("");
//     setForgotSuccess("");
//     setEmailChecked(false);
//     setRegisteredUser(null);
//     setOtp("");
//     setOtpVerified(false);
//     setOtpExpiresAt(null);
//     setShowForgotPassword(true);
//   };

//   const closeForgotPassword = () => {
//     setShowForgotPassword(false);
//     setForgotEmail("");
//     setNewPassword("");
//     setConfirmPassword("");
//     setForgotError("");
//     setForgotSuccess("");
//     setEmailChecked(false);
//     setRegisteredUser(null);
//     setOtp("");
//     setOtpVerified(false);
//     setOtpExpiresAt(null);
//   };

//   /* =========================================================
//      CHECK REGISTERED EMAIL + SEND EMAIL OTP
     
//      IMPORTANT:
//      This uses EMAIL only.
//      No phone number is involved.
//   ========================================================= */

//   const checkRegisteredEmail = async () => {
//     setForgotError("");
//     setForgotSuccess("");
//     setOtp("");
//     setOtpVerified(false);
//     setOtpExpiresAt(null);

//     const normalizedEmail = forgotEmail.trim().toLowerCase();

//     if (!normalizedEmail) {
//       setForgotError("Please enter your registered email address.");
//       return;
//     }

//     try {
//       const result = await forgotPasswordRequest(normalizedEmail);

//       setRegisteredUser({ email: normalizedEmail });
//       setEmailChecked(true);
//       setOtpExpiresAt(
//         result?.expires_at ? new Date(result.expires_at).getTime() : Date.now() + 3 * 60 * 1000
//       );
//       setForgotSuccess("OTP sent to your registered email.");
//     } catch (err) {
//       setEmailChecked(false);
//       setRegisteredUser(null);
//       setOtpExpiresAt(null);
//       setForgotError(
//         getErrorMessage(
//           err,
//           "This is not an existing email. Please contact the admin."
//         )
//       );
//     }
//   };

//   /* =========================================================
//      VERIFY EMAIL OTP
//   ========================================================= */

//   const handleVerifyOtp = async () => {
//     setForgotError("");
//     setForgotSuccess("");

//     if (!registeredUser?.email) {
//       setForgotError("Please verify your registered email first.");
//       return;
//     }

//     if (!otp.trim()) {
//       setForgotError("Please enter the OTP sent to your registered email.");
//       return;
//     }

//     if (otp.length !== 6) {
//       setForgotError("Please enter the 6-digit OTP.");
//       return;
//     }

//     if (otpExpiresAt && Date.now() > otpExpiresAt) {
//       setForgotError("This OTP has expired. Please request a new OTP.");
//       setOtpVerified(false);
//       return;
//     }

//     try {
//       await verifyForgotPasswordOtp(registeredUser.email, otp.trim());
//       setOtpVerified(true);
//       setForgotSuccess("OTP verified successfully.");
//     } catch (err) {
//       setOtpVerified(false);
//       setForgotError(
//         getErrorMessage(err, "Invalid or expired OTP. Please request a new OTP.")
//       );
//     }
//   };

//   /* =========================================================
//      RESEND EMAIL OTP
//   ========================================================= */

//   const resendOtp = async () => {
//     if (!registeredUser?.email) return;

//     setForgotError("");
//     setForgotSuccess("");
//     setOtp("");
//     setOtpVerified(false);

//     try {
//       const result = await forgotPasswordRequest(registeredUser.email);

//       setOtpExpiresAt(
//         result?.expires_at ? new Date(result.expires_at).getTime() : Date.now() + 3 * 60 * 1000
//       );

//       setForgotSuccess("A new OTP has been sent to your registered email. The previous OTP is no longer valid.");
//     } catch (err) {
//       setForgotError(
//         getErrorMessage(err, "Unable to resend OTP. Please try again.")
//       );
//     }
//   };

//   /* =========================================================
//      RESET PASSWORD
     
//      IMPORTANT:
//      Only EMAIL + EMAIL OTP are required.
//      Phone verification is NOT checked here.
//   ========================================================= */

//   const handleResetPassword = async (e) => {
//     e.preventDefault();

//     setForgotError("");
//     setForgotSuccess("");

//     if (!registeredUser?.email) {
//       setForgotError(
//         "Please verify your registered email first."
//       );
//       return;
//     }

//     if (!otpVerified) {
//       setForgotError(
//         "Please verify the OTP before resetting your password."
//       );
//       return;
//     }

//     if (!newPassword || !confirmPassword) {
//       setForgotError(
//         "Please enter and confirm your new password."
//       );
//       return;
//     }

//     const strongPasswordRequired =
//       settings?.strongPasswordRequired ??
//       settings?.strongPassword ??
//       true;

//     if (
//       strongPasswordRequired &&
//       newPassword.length < 6
//     ) {
//       setForgotError(
//         "Password must be at least 6 characters."
//       );
//       return;
//     }

//     if (
//       strongPasswordRequired &&
//       !/[A-Z]/.test(newPassword)
//     ) {
//       setForgotError(
//         "Password must contain at least one capital letter."
//       );
//       return;
//     }

//     if (
//       strongPasswordRequired &&
//       !/[0-9]/.test(newPassword)
//     ) {
//       setForgotError(
//         "Password must contain at least one number."
//       );
//       return;
//     }

//     if (
//       strongPasswordRequired &&
//       !/[^A-Za-z0-9]/.test(newPassword)
//     ) {
//       setForgotError(
//         "Password must contain at least one special character."
//       );
//       return;
//     }

//     if (
//       newPassword !==
//       confirmPassword
//     ) {
//       setForgotError(
//         "Passwords do not match."
//       );
//       return;
//     }

//     try {
//       /*
//        * IMPORTANT:
//        * This sends only:
//        *
//        * email
//        * otp
//        * new_password
//        *
//        * No phone number is sent or checked.
//        */
//       await resetPassword(
//         registeredUser.email,
//         otp.trim(),
//         newPassword
//       );

//       setForgotSuccess(
//         "Password reset successfully. You can now sign in."
//       );

//       setTimeout(() => {
//         setEmail(
//           registeredUser.email
//         );

//         setPassword("");

//         closeForgotPassword();
//       }, 1200);
//     } catch (err) {
//       setForgotError(
//         getErrorMessage(
//           err,
//           "Unable to reset password. Please try again."
//         )
//       );
//     }
//   };

//   /* =========================================================
//      TWO-FACTOR VERIFICATION
//   ========================================================= */

//   const handleTwoFactorVerify = async (e) => {
//     e.preventDefault();
//     setTwoFactorError("");

//     if (!/^\d{6}$/.test(twoFactorOtp.trim())) {
//       setTwoFactorError("Enter the 6-digit verification code.");
//       return;
//     }

//     if (twoFactorExpiresAt && Date.now() > twoFactorExpiresAt) {
//       setTwoFactorError("This verification code has expired. Please sign in again to receive a new code.");
//       return;
//     }

//     setBusy(true);
//     try {
//       await verifyLogin2FA(
//         twoFactorChallengeId,
//         twoFactorOtp.trim(),
//         remember
//       );
//       setShowTwoFactor(false);
//       setTwoFactorOtp("");
//       setTwoFactorExpiresAt(null);
//       navigate("/");
//     } catch (err) {
//       setTwoFactorError(
//         getErrorMessage(err, "Unable to verify the code. Please try again.")
//       );
//     } finally {
//       setBusy(false);
//     }
//   };

//   const closeTwoFactor = () => {
//     setShowTwoFactor(false);
//     setTwoFactorOtp("");
//     setTwoFactorError("");
//     setTwoFactorExpiresAt(null);
//       };

//   /* =========================================================
//      CONTACT ADMINISTRATOR
//   ========================================================= */

//   const openContactAdmin = () => {
//     setShowContactAdmin(true);
//   };

//   const closeContactAdmin = () => {
//     setShowContactAdmin(false);
//   };

//   /* =========================================================
//      MAIN UI
//   ========================================================= */

//   return (
//     <div className="min-h-screen bg-slate-100">
//       <div className="grid min-h-screen lg:grid-cols-2">

//         {/* =====================================================
//             LEFT BRAND SECTION
//         ====================================================== */}

//         <div className="relative hidden overflow-hidden bg-[#0d1d35] p-12 text-white lg:flex lg:flex-col lg:justify-between">

//           <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

//           <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

//           <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-3xl" />

//           <div className="relative z-10 flex items-center gap-3">

//             <img
//               src={logo}
//               alt="FleetDoc Logo"
//               className="h-12 w-12 rounded-xl object-contain"
//             />

//             <div>

//               <h1 className="text-2xl font-bold text-white">
//                 Fleet<span className="text-blue-400">Doc.</span>
//               </h1>

//               <p className="text-sm text-slate-400">
//                 Vehicle Document Manager
//               </p>

//             </div>

//           </div>

//           <div className="relative z-10 max-w-lg">

//             <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">

//               <ShieldCheck size={16} />

//               Smart Vehicle Compliance Management

//             </div>

//             <h2 className="text-5xl font-bold leading-tight">
//               Manage your vehicle documents in one place.
//             </h2>

//             <p className="mt-6 text-lg leading-8 text-slate-400">
//               Track important vehicle documents, EMI payments,
//               challans, permits and taxes. Get notified before
//               documents expire.
//             </p>

//             <div className="mt-10 space-y-4">

//               <Feature text="Store all vehicle documents securely" />

//               <Feature text="Get automatic expiry reminders" />

//               <Feature text="Track EMI, challans and road tax" />

//               <Feature text="Monitor vehicle compliance from one dashboard" />

//             </div>

//           </div>

//           <div className="relative z-10 text-sm text-slate-500">
//             © 2026 FleetDoc. All rights reserved.
//           </div>

//         </div>

//         {/* =====================================================
//             RIGHT SECTION
//         ====================================================== */}

//         <div className="flex items-center justify-center bg-white p-6 sm:p-10">

//           <div className="w-full max-w-md">

//             <div className="mb-10 flex items-center gap-3 lg:hidden">

//               <img
//                 src={logo}
//                 alt="FleetDoc Logo"
//                 className="h-12 w-12 rounded-xl object-contain"
//               />

//               <div>

//                 <h1 className="text-xl font-bold text-slate-800">
//                   Fleet<span className="text-blue-600">Doc.</span>
//                 </h1>

//                 <p className="text-xs text-slate-500">
//                   Vehicle Document Manager
//                 </p>

//               </div>

//             </div>

//             {isFirstSetup ? (
//               <>

//                 <div className="mb-8">

//                   <h2 className="text-3xl font-bold text-slate-800">
//                     Create Administrator
//                   </h2>

//                   <p className="mt-2 text-sm text-slate-500">
//                     No FleetDoc user account exists. Create the
//                     first administrator account to get started.
//                   </p>

//                 </div>

//                 <form
//                   onSubmit={handleCreateAdministrator}
//                   className="space-y-5"
//                 >

//                   {adminSuccess && (
//                     <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

//                       <CheckCircle2
//                         size={18}
//                         className="mt-0.5 shrink-0"
//                       />

//                       <span>{adminSuccess}</span>

//                     </div>
//                   )}

//                   {adminError && (
//                     <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

//                       <AlertCircle
//                         size={18}
//                         className="mt-0.5 shrink-0"
//                       />

//                       <span>{adminError}</span>

//                     </div>
//                   )}

//                   <div>

//                     <label className="label">
//                       Full Name
//                     </label>

//                     <div className="relative">

//                       <User
//                         size={18}
//                         className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                       />

//                       <input
//                         type="text"
//                         value={adminName}
//                         onChange={(e) => {
//                           setAdminName(e.target.value);
//                           setAdminError("");
//                         }}
//                         placeholder="Enter administrator name"
//                         className="input pl-10"
//                         autoFocus
//                       />

//                     </div>

//                   </div>

//                   <div>

//                     <label className="label">
//                       Email Address
//                     </label>

//                     <div className="relative">

//                       <Mail
//                         size={18}
//                         className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                       />

//                       <input
//                         type="email"
//                         value={adminEmail}
//                         onChange={(e) => {
//                           setAdminEmail(e.target.value);
//                           setAdminError("");
//                         }}
//                         placeholder="Enter administrator email"
//                         className="input pl-10"
//                       />

//                     </div>

//                   </div>

//                   <div>

//                     <label className="label">
//                       Password
//                     </label>

//                     <div className="relative">

//                       <Lock
//                         size={18}
//                         className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                       />

//                       <input
//                         type={
//                           showAdminPassword
//                             ? "text"
//                             : "password"
//                         }
//                         value={adminPassword}
//                         onChange={(e) => {
//                           setAdminPassword(e.target.value);
//                           setAdminError("");
//                         }}
//                         placeholder="Create a strong password"
//                         className="input px-10 pr-12"
//                       />

//                       <button
//                         type="button"
//                         onClick={() =>
//                           setShowAdminPassword(
//                             !showAdminPassword
//                           )
//                         }
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
//                       >
//                         {showAdminPassword ? (
//                           <EyeOff size={18} />
//                         ) : (
//                           <Eye size={18} />
//                         )}
//                       </button>

//                     </div>

//                   </div>

//                   <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">

//                     <p className="mb-2 text-xs font-semibold text-slate-600">
//                       Password must contain:
//                     </p>

//                     <div className="grid grid-cols-2 gap-2 text-xs">

//                       <PasswordRule
//                         valid={passwordRules.length}
//                         text="6+ characters"
//                       />

//                       <PasswordRule
//                         valid={passwordRules.capital}
//                         text="Capital letter"
//                       />

//                       <PasswordRule
//                         valid={passwordRules.number}
//                         text="Number"
//                       />

//                       <PasswordRule
//                         valid={passwordRules.special}
//                         text="Special character"
//                       />

//                     </div>

//                   </div>

//                   <div>

//                     <label className="label">
//                       Confirm Password
//                     </label>

//                     <div className="relative">

//                       <Lock
//                         size={18}
//                         className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                       />

//                       <input
//                         type={
//                           showAdminConfirmPassword
//                             ? "text"
//                             : "password"
//                         }
//                         value={adminConfirmPassword}
//                         onChange={(e) => {
//                           setAdminConfirmPassword(
//                             e.target.value
//                           );

//                           setAdminError("");
//                         }}
//                         placeholder="Confirm administrator password"
//                         className="input px-10 pr-12"
//                       />

//                       <button
//                         type="button"
//                         onClick={() =>
//                           setShowAdminConfirmPassword(
//                             !showAdminConfirmPassword
//                           )
//                         }
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
//                       >
//                         {showAdminConfirmPassword ? (
//                           <EyeOff size={18} />
//                         ) : (
//                           <Eye size={18} />
//                         )}
//                       </button>

//                     </div>

//                   </div>

//                   <button
//                     type="submit"
//                     className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200"
//                   >
//                     Create Administrator Account
//                     <ArrowRight size={18} />
//                   </button>

//                 </form>

//                 <div className="my-8 flex items-center gap-4">

//                   <div className="h-px flex-1 bg-slate-200" />

//                   <span className="text-xs text-slate-400">
//                     First Time Setup
//                   </span>

//                   <div className="h-px flex-1 bg-slate-200" />

//                 </div>

//                 <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

//                   <div className="flex gap-3">

//                     <div className="mt-0.5 text-blue-600">
//                       <ShieldCheck size={20} />
//                     </div>

//                     <div>

//                       <h4 className="text-sm font-semibold text-slate-700">
//                         Administrator Access
//                       </h4>

//                       <p className="mt-1 text-xs leading-5 text-slate-500">
//                         This is the first account for your
//                         FleetDoc installation. It will be created
//                         with Administrator access.
//                       </p>

//                     </div>

//                   </div>

//                 </div>

//               </>
//             ) : (
//               <>

//                 <div className="mb-8">

//                   <h2 className="text-3xl font-bold text-slate-800">
//                     Welcome back...
//                   </h2>

//                   <p className="mt-2 text-sm text-slate-500">
//                     Sign in to access your FleetDoc. dashboard.
//                   </p>

//                 </div>

//                 <form
//                   onSubmit={handleSubmit}
//                   className="space-y-5"
//                 >

//                   {error && (
//                     <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

//                       <AlertCircle
//                         size={18}
//                         className="mt-0.5 shrink-0"
//                       />

//                       <span>{error}</span>

//                     </div>
//                   )}

//                   <div>

//                     <label className="label">
//                       Email Address
//                     </label>

//                     <div className="relative">

//                       <Mail
//                         size={18}
//                         className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                       />

//                       <input
//                         type="email"
//                         value={email}
//                         onChange={(e) => {
//                           setEmail(e.target.value);
//                           setError("");
//                         }}
//                         placeholder="Enter your email"
//                         className="input pl-10"
//                       />

//                     </div>

//                   </div>

//                   <div>

//                     <div className="flex items-center justify-between">

//                       <label className="label">
//                         Password
//                       </label>

//                       <button
//                         type="button"
//                         onClick={openForgotPassword}
//                         className="mb-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
//                       >
//                         Forgot password?
//                       </button>

//                     </div>

//                     <div className="relative">

//                       <Lock
//                         size={18}
//                         className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                       />

//                       <input
//                         type={
//                           showPassword
//                             ? "text"
//                             : "password"
//                         }
//                         value={password}
//                         onChange={(e) => {
//                           setPassword(e.target.value);
//                           setError("");
//                         }}
//                         disabled={Boolean(loginLockedUntil && Date.now() < loginLockedUntil)}
//                         placeholder="Enter your password"
//                         className="input px-10 pr-12 disabled:cursor-not-allowed disabled:bg-slate-100"
//                       />

//                       <button
//                         type="button"
//                         onClick={() =>
//                           setShowPassword(!showPassword)
//                         }
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
//                       >
//                         {showPassword ? (
//                           <EyeOff size={18} />
//                         ) : (
//                           <Eye size={18} />
//                         )}
//                       </button>

//                     </div>

//                   </div>

//                   <div className="flex items-center">

//                     <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">

//                       <input
//                         type="checkbox"
//                         checked={remember}
//                         onChange={(e) =>
//                           setRemember(
//                             e.target.checked
//                           )
//                         }
//                         className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
//                       />

//                       Remember me

//                     </label>

//                   </div>

//                   <button
//                     type="submit"
//                     disabled={busy || Boolean(loginLockedUntil && Date.now() < loginLockedUntil)}
//                     className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
//                   >
//                     {busy ? "Signing in..." : "Sign In"}
//                     <ArrowRight size={18} />
//                   </button>

//                 </form>

//                 <div className="my-8 flex items-center gap-4">

//                   <div className="h-px flex-1 bg-slate-200" />

//                   <span className="text-xs text-slate-400">
//                     Fleet Management Website
//                   </span>

//                   <div className="h-px flex-1 bg-slate-200" />

//                 </div>

//                 <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

//                   <div className="flex gap-3">

//                     <div className="mt-0.5 text-blue-600">
//                       <ShieldCheck size={20} />
//                     </div>

//                     <div>

//                       <h4 className="text-sm font-semibold text-slate-700">
//                         FleetDoc. Access
//                       </h4>

//                       <p className="mt-1 text-xs leading-5 text-slate-500">
//                         Enter the valid email address and password
//                         to access the FleetDoc. website.
//                       </p>

//                     </div>

//                   </div>

//                 </div>

//                 <p className="mt-8 text-center text-sm text-slate-500">

//                   Don't have an account?

//                   <button
//                     type="button"
//                     onClick={openContactAdmin}
//                     className="ml-1 font-semibold text-blue-600 transition hover:text-blue-700"
//                   >
//                     Contact Administrator
//                   </button>

//                 </p>

//               </>
//             )}

//           </div>

//         </div>

//       </div>

//       {/* =========================================================
//           FORGOT PASSWORD MODAL
//       ========================================================== */}

//       {showForgotPassword && !isFirstSetup && (

//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

//           <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

//             <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl" />

//             <div className="relative border-b border-slate-100 bg-[#0d1d35] px-6 py-5 text-white">

//               <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-600/20 blur-2xl" />

//               <div className="relative flex items-center justify-between">

//                 <div className="flex items-center gap-3">

//                   <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">

//                     <KeyRound size={22} />

//                   </div>

//                   <div>

//                     <h3 className="text-lg font-bold">
//                       Reset Password
//                     </h3>

//                     <p className="text-xs text-slate-400">
//                       Recover your FleetDoc. account
//                     </p>

//                   </div>

//                 </div>

//                 <button
//                   type="button"
//                   onClick={closeForgotPassword}
//                   className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
//                 >
//                   <X size={19} />
//                 </button>

//               </div>

//             </div>

//             <div className="p-6">

//               {forgotSuccess && (

//                 <div className="mb-5 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

//                   <CheckCircle2
//                     size={18}
//                     className="mt-0.5 shrink-0"
//                   />

//                   <span>{forgotSuccess}</span>

//                 </div>

//               )}

//               {forgotError && (

//                 <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

//                   <AlertCircle
//                     size={18}
//                     className="mt-0.5 shrink-0"
//                   />

//                   <span>{forgotError}</span>

//                 </div>

//               )}

//               {!otpVerified ? (

//                 <>

//                   <div className="mb-6">

//                     <h4 className="text-lg font-semibold text-slate-800">
//                       Find your account
//                     </h4>

//                     <p className="mt-1 text-sm leading-6 text-slate-500">
//                       Enter your registered email address to
//                       continue.
//                     </p>

//                   </div>

//                   <div>

//                     <label className="label">
//                       Email Address
//                     </label>

//                     <div className="relative">

//                       <Mail
//                         size={18}
//                         className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                       />

//                       <input
//                         type="email"
//                         value={forgotEmail}
//                         onChange={(e) => {

//                           setForgotEmail(
//                             e.target.value
//                           );

//                           setForgotError("");

//                           setEmailChecked(false);
//                           setRegisteredUser(null);
//                           setOtp("");
//                                                     setOtpVerified(false);
//                           setOtpExpiresAt(null);

//                         }}
//                         placeholder="Enter your registered email"
//                         className="input pl-10"
//                         autoFocus
//                       />

//                     </div>

//                   </div>

//                   {emailChecked && registeredUser && (

//                     <div className="mt-5">

//                       <label className="label">
//                         Enter OTP
//                       </label>

//                       <div className="relative">

//                         <KeyRound
//                           size={18}
//                           className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                         />

//                         <input
//                           type="text"
//                           inputMode="numeric"
//                           maxLength={6}
//                           value={otp}
//                           onChange={(e) => {

//                             const value =
//                               e.target.value
//                                 .replace(
//                                   /\D/g,
//                                   ""
//                                 )
//                                 .slice(0, 6);

//                             setOtp(value);
//                             setForgotError("");

//                           }}
//                           placeholder="Enter 6-digit OTP"
//                           className="input pl-10 tracking-[0.3em]"
//                         />

//                       </div>

//                       <div className="mt-2 flex items-center justify-between">

//                         <p className="text-xs text-slate-500">
//                           OTP is valid for 3 minutes.
//                         </p>

//                         <button
//                           type="button"
//                           onClick={resendOtp}
//                           className="text-xs font-medium text-blue-600 transition hover:text-blue-700"
//                         >
//                           Resend OTP
//                         </button>

//                       </div>

//                       <button
//                         type="button"
//                         onClick={handleVerifyOtp}
//                         disabled={
//                           otp.length !== 6
//                         }
//                         className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 disabled:hover:shadow-none"
//                       >
//                         Verify OTP
//                         <ArrowRight size={18} />
//                       </button>

//                     </div>

//                   )}

//                   {!emailChecked && (

//                     <button
//                       type="button"
//                       onClick={checkRegisteredEmail}
//                       className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200"
//                     >
//                       Verify Email
//                       <ArrowRight size={18} />
//                     </button>

//                   )}

//                 </>

//               ) : (

//                 <form
//                   onSubmit={handleResetPassword}
//                   className="space-y-5"
//                 >

//                   <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">

//                     <div className="flex items-center gap-2">

//                       <CheckCircle2
//                         size={17}
//                         className="text-green-600"
//                       />

//                       <span className="text-sm font-medium text-green-700">
//                         Email verified
//                       </span>

//                     </div>

//                     <p className="mt-1 break-all text-xs text-green-600">
//                       {registeredUser?.email}
//                     </p>

//                   </div>

//                   <div>

//                     <label className="label">
//                       New Password
//                     </label>

//                     <div className="relative">

//                       <Lock
//                         size={18}
//                         className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                       />

//                       <input
//                         type={
//                           showNewPassword
//                             ? "text"
//                             : "password"
//                         }
//                         value={newPassword}
//                         onChange={(e) => {

//                           setNewPassword(
//                             e.target.value
//                           );

//                           setForgotError("");

//                         }}
//                         placeholder="Enter new password"
//                         className="input px-10 pr-12"
//                         autoFocus
//                       />

//                       <button
//                         type="button"
//                         onClick={() =>
//                           setShowNewPassword(
//                             !showNewPassword
//                           )
//                         }
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
//                       >
//                         {showNewPassword ? (
//                           <EyeOff size={18} />
//                         ) : (
//                           <Eye size={18} />
//                         )}
//                       </button>

//                     </div>

//                   </div>

//                   <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">

//                     <p className="mb-2 text-xs font-semibold text-slate-600">
//                       Password must contain:
//                     </p>

//                     <div className="grid grid-cols-2 gap-2 text-xs">

//                       <PasswordRule
//                         valid={resetPasswordRules.length}
//                         text="6+ characters"
//                       />

//                       <PasswordRule
//                         valid={resetPasswordRules.capital}
//                         text="Capital letter"
//                       />

//                       <PasswordRule
//                         valid={resetPasswordRules.number}
//                         text="Number"
//                       />

//                       <PasswordRule
//                         valid={resetPasswordRules.special}
//                         text="Special character"
//                       />

//                     </div>

//                   </div>

//                   <div>

//                     <label className="label">
//                       Confirm Password
//                     </label>

//                     <div className="relative">

//                       <Lock
//                         size={18}
//                         className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                       />

//                       <input
//                         type={
//                           showConfirmPassword
//                             ? "text"
//                             : "password"
//                         }
//                         value={confirmPassword}
//                         onChange={(e) => {

//                           setConfirmPassword(
//                             e.target.value
//                           );

//                           setForgotError("");

//                         }}
//                         placeholder="Confirm new password"
//                         className="input px-10 pr-12"
//                       />

//                       <button
//                         type="button"
//                         onClick={() =>
//                           setShowConfirmPassword(
//                             !showConfirmPassword
//                           )
//                         }
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
//                       >
//                         {showConfirmPassword ? (
//                           <EyeOff size={18} />
//                         ) : (
//                           <Eye size={18} />
//                         )}
//                       </button>

//                     </div>

//                   </div>

//                   <button
//                     type="submit"
//                     className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200"
//                   >
//                     Reset Password
//                     <CheckCircle2 size={18} />
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() => {

//                       setOtpVerified(false);

//                       setOtp("");
//                                             setOtpExpiresAt(null);

//                       setEmailChecked(true);

//                       setNewPassword("");
//                       setConfirmPassword("");

//                       setForgotError("");
//                       setForgotSuccess("");

//                     }}
//                     className="w-full text-sm font-medium text-blue-600 transition hover:text-blue-700"
//                   >
//                     Back to OTP Verification
//                   </button>

//                 </form>

//               )}

//             </div>

//           </div>

//         </div>

//       )}


//       {/* =========================================================
//           TWO-FACTOR VERIFICATION MODAL
//       ========================================================== */}

//       {showTwoFactor && !isFirstSetup && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
//           onMouseDown={closeTwoFactor}
//         >
//           <div
//             className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
//             onMouseDown={(e) => e.stopPropagation()}
//           >
//             <div className="relative border-b border-slate-100 bg-[#0d1d35] px-6 py-5 text-white">
//               <div className="relative flex items-center justify-between">
//                 <div>
//                   <h3 className="text-lg font-bold">Two-Factor Verification</h3>
//                   <p className="mt-1 text-xs text-slate-400">Enter the code sent to your registered email</p>
//                 </div>
//                 <button type="button" onClick={closeTwoFactor} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white">
//                   <X size={19} />
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={handleTwoFactorVerify} className="space-y-4 p-6">
//               <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
//                 <p className="text-xs font-medium text-blue-700">A 6-digit verification code has been sent to</p>
//                 <p className="mt-1 text-sm font-bold text-slate-800">{email}</p>
//               </div>

//               <div>
//                 <label className="mb-2 block text-sm font-semibold text-slate-700">Verification Code</label>
//                 <input
//                   autoFocus
//                   inputMode="numeric"
//                   maxLength={6}
//                   value={twoFactorOtp}
//                   onChange={(e) => setTwoFactorOtp(e.target.value.replace(/\D/g, ""))}
//                   placeholder="Enter 6-digit code"
//                   className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-lg font-bold tracking-[0.35em] outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
//                 />
//               </div>

//               {twoFactorError && (
//                 <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{twoFactorError}</div>
//               )}

//               <button
//                 type="submit"
//                 disabled={busy}
//                 className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
//               >
//                 {busy ? "Verifying..." : "Verify & Sign In"}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* =========================================================
//           CONTACT ADMINISTRATOR MODAL
//       ========================================================== */}

//       {showContactAdmin && !isFirstSetup && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
//           onMouseDown={closeContactAdmin}
//         >
//           <div
//             className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
//             onMouseDown={(e) => e.stopPropagation()}
//           >
//             <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl" />

//             <div className="relative border-b border-slate-100 bg-[#0d1d35] px-6 py-5 text-white">
//               <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-600/20 blur-2xl" />

//               <div className="relative flex items-center justify-between">
//                 <div>
//                   <h3 className="text-lg font-bold">
//                     Contact Administrator
//                   </h3>

//                   <p className="mt-1 text-xs text-slate-400">
//                     Contact your FleetDoc portal administrator
//                   </p>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={closeContactAdmin}
//                   className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
//                   aria-label="Close contact administrator"
//                 >
//                   <X size={19} />
//                 </button>
//               </div>
//             </div>

//             <div className="relative space-y-4 p-6">
//               <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
//                 <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
//                   Company Information
//                 </p>

//                 <h4 className="mt-1 text-lg font-bold text-slate-800">
//                   {settings?.companyName || "Company Name"}
//                 </h4>

//                 <p className="mt-1 text-sm text-slate-500">
//                   {settings?.portalName || "Fleet Portal"}
//                 </p>
//               </div>

//               <div className="space-y-3">
//                 <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
//                   <Mail
//                     size={18}
//                     className="mt-0.5 shrink-0 text-blue-600"
//                   />

//                   <div className="min-w-0">
//                     <p className="text-xs font-medium text-slate-400">
//                       Email Address
//                     </p>

//                     {settings?.email ? (
//                       <a
//                         href={`mailto:${settings.email}`}
//                         className="mt-0.5 block break-all text-sm font-medium text-slate-700 transition hover:text-blue-600"
//                       >
//                         {settings.email}
//                       </a>
//                     ) : (
//                       <p className="mt-0.5 text-sm font-medium text-slate-500">
//                         Not provided
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
//                   <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center text-blue-600">
//                     <span className="text-sm font-semibold">☎</span>
//                   </span>

//                   <div className="min-w-0">
//                     <p className="text-xs font-medium text-slate-400">
//                       Phone Number
//                     </p>

//                     {settings?.phone ? (
//                       <a
//                         href={`tel:${settings.phone}`}
//                         className="mt-0.5 block text-sm font-medium text-slate-700 transition hover:text-blue-600"
//                       >
//                         {settings.phone}
//                       </a>
//                     ) : (
//                       <p className="mt-0.5 text-sm font-medium text-slate-500">
//                         Not provided
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={closeContactAdmin}
//                 className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

// /* ============================================================
//    FEATURE ITEM
// ============================================================ */

// function Feature({ text }) {
//   return (
//     <div className="flex items-center gap-3">

//       <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">

//         <CheckCircle2 size={16} />

//       </div>

//       <span className="text-slate-300">
//         {text}
//       </span>

//     </div>
//   );
// }

// /* ============================================================
//    PASSWORD RULE
// ============================================================ */

// function PasswordRule({ valid, text }) {
//   return (
//     <div
//       className={`flex items-center gap-2 transition ${
//         valid
//           ? "text-green-600"
//           : "text-slate-400"
//       }`}
//     >

//       <CheckCircle2
//         size={14}
//         className={
//           valid
//             ? "opacity-100"
//             : "opacity-40"
//         }
//       />

//       <span>{text}</span>

//     </div>
//   );
// }










import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  X,
  AlertCircle,
  KeyRound,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFleet } from "../context/fleetContext";
import logo from "../assets/FleetDoc-logo 1.png";

export default function Login() {
  const navigate = useNavigate();

  const {
    users = [],
    addUser,
    settings,
    login,
    verifyLogin2FA,
    forgotPasswordRequest,
    verifyForgotPasswordOtp,
    resetPassword,
  } = useFleet();

  /* =========================================================
     NORMAL LOGIN STATES
  ========================================================= */
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorOtp, setTwoFactorOtp] = useState("");
  const [twoFactorChallengeId, setTwoFactorChallengeId] = useState(null);
  const [twoFactorError, setTwoFactorError] = useState("");
  const [twoFactorExpiresAt, setTwoFactorExpiresAt] = useState(null);
  const [loginLockedUntil, setLoginLockedUntil] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("fleetdoc_login_password_lock") || "null"
      );

      if (
        saved?.until &&
        saved?.email &&
        Number(saved.until) > Date.now()
      ) {
        return Number(saved.until);
      }

      localStorage.removeItem("fleetdoc_login_password_lock");
    } catch {
      localStorage.removeItem("fleetdoc_login_password_lock");
    }

    return null;
  });

  const [loginLockedEmail, setLoginLockedEmail] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("fleetdoc_login_password_lock") || "null"
      );
      return saved?.until && saved?.email ? String(saved.email) : "";
    } catch {
      return "";
    }
  });

  /* =========================================================
     CONTACT ADMINISTRATOR POPUP
  ========================================================= */
  const [showContactAdmin, setShowContactAdmin] = useState(false);

  /* =========================================================
     FIRST ADMIN SETUP STATES
  ========================================================= */
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] =
    useState("");

  const [showAdminPassword, setShowAdminPassword] =
    useState(false);

  const [showAdminConfirmPassword, setShowAdminConfirmPassword] =
    useState(false);

  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");

  /* =========================================================
     FORGOT PASSWORD STATES
  ========================================================= */
  const [showForgotPassword, setShowForgotPassword] =
    useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const [emailChecked, setEmailChecked] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  /* =========================================================
     EMAIL OTP STATES
  ========================================================= */
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);

  /* =========================================================
     FIRST ADMINISTRATOR SETUP DETECTION
  ========================================================= */

  const isFirstSetup = users.length === 0;

  /* =========================================================
     PASSWORD RULES
  ========================================================= */

  const passwordRules = {
    length: adminPassword.length >= 6,
    capital: /[A-Z]/.test(adminPassword),
    number: /[0-9]/.test(adminPassword),
    special: /[^A-Za-z0-9]/.test(adminPassword),
  };

  const resetPasswordRules = {
    length: newPassword.length >= 6,
    capital: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };

  /* =========================================================
     HELPER — ERROR MESSAGE
  ========================================================= */

  const getErrorMessage = (err, fallback) => {
    if (!err) return fallback;

    if (typeof err === "string") {
      return err;
    }

    if (err?.message) {
      return err.message;
    }

    if (err?.detail) {
      if (typeof err.detail === "string") {
        return err.detail;
      }

      if (Array.isArray(err.detail)) {
        return err.detail
          .map((item) => {
            if (typeof item === "string") {
              return item;
            }

            return item?.msg || "Validation error";
          })
          .join("\n");
      }

      if (typeof err.detail === "object") {
        return (
          err.detail?.message ||
          err.detail?.msg ||
          JSON.stringify(err.detail)
        );
      }
    }

    return fallback;
  };

  /* =========================================================
     HELPER — LOGIN SESSION
  ========================================================= */

  const createLoginSession = (user) => {
    if (!user) return;

    localStorage.setItem("fleetdoc_logged_in", "true");

    localStorage.setItem(
      "fleetdoc_user_id",
      String(user.id)
    );

    localStorage.setItem(
      "fleetdoc_user_email",
      user.email || ""
    );

    localStorage.setItem(
      "fleetdoc_user_name",
      user.name || ""
    );

    localStorage.setItem(
      "fleetdoc_user_role",
      user.role || "Admin"
    );
  };

  /* =========================================================
     NORMAL LOGIN
  ========================================================= */

  const normalizedLoginEmail = email.trim().toLowerCase();
  const isLoginPasswordLocked = Boolean(
    loginLockedUntil &&
    Date.now() < loginLockedUntil &&
    normalizedLoginEmail &&
    normalizedLoginEmail === loginLockedEmail
  );

  useEffect(() => {
    if (!loginLockedUntil) return undefined;

    const remaining = loginLockedUntil - Date.now();

    if (remaining <= 0) {
      setLoginLockedUntil(null);
      setLoginLockedEmail("");
      localStorage.removeItem("fleetdoc_login_password_lock");
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setLoginLockedUntil(null);
      setLoginLockedEmail("");
      setError("");
      localStorage.removeItem("fleetdoc_login_password_lock");
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [loginLockedUntil]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (isLoginPasswordLocked) {
      setError("You already reached the maximum limit. Please try again after 15 minutes and contact to the admin.");
      return;
    }

    if (loginLockedUntil && Date.now() >= loginLockedUntil) {
      setLoginLockedUntil(null);
      setLoginLockedEmail("");
      localStorage.removeItem("fleetdoc_login_password_lock");
    }

    setBusy(true);

    try {
      const result = await login(email.trim(), password, remember);

      if (result?.requires_2fa) {
        setTwoFactorChallengeId(result.challenge_id);
        setTwoFactorOtp("");
        setTwoFactorError("");
        setTwoFactorExpiresAt(
          result?.expires_at ? new Date(result.expires_at).getTime() : null
        );
        setShowTwoFactor(true);
        return;
      }

      setLoginLockedUntil(null);
      setLoginLockedEmail("");
      localStorage.removeItem("fleetdoc_login_password_lock");
      navigate("/");
    } catch (err) {
      if (err?.status === 423) {
        const lockedUntil =
          err?.detail?.locked_until ||
          err?.data?.detail?.locked_until;
        const timestamp = lockedUntil
          ? new Date(lockedUntil).getTime()
          : Date.now() + 15 * 60 * 1000;
        const lockedEmail = email.trim().toLowerCase();

        setLoginLockedUntil(timestamp);
        setLoginLockedEmail(lockedEmail);
        setPassword("");
        setError(
          "You already reached the maximum limit. Please try again after 15 minutes and contact to the admin."
        );

        localStorage.setItem(
          "fleetdoc_login_password_lock",
          JSON.stringify({
            email: lockedEmail,
            until: timestamp,
          })
        );
      } else {
        setError(getErrorMessage(err, "Unable to sign in. Please try again."));
      }
    } finally {
      setBusy(false);
    }
  };

  /* =========================================================
     FIRST ADMINISTRATOR ACCOUNT
  ========================================================= */

  const handleCreateAdministrator = async (e) => {
    e.preventDefault();

    setAdminError("");
    setAdminSuccess("");

    const name = adminName.trim();

    const normalizedEmail =
      adminEmail.trim().toLowerCase();

    /* -------------------------------------------------------
       BASIC VALIDATION
    ------------------------------------------------------- */

    if (!name) {
      setAdminError("Please enter your full name.");
      return;
    }

    if (!normalizedEmail) {
      setAdminError("Please enter your email address.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail
      )
    ) {
      setAdminError("Please enter a valid email address.");
      return;
    }

    if (
      !adminPassword ||
      !adminConfirmPassword
    ) {
      setAdminError(
        "Please enter and confirm your password."
      );
      return;
    }

    /* -------------------------------------------------------
       MAKE SURE FIRST SETUP IS STILL REQUIRED
    ------------------------------------------------------- */

    if (users.length > 0) {
      setAdminError(
        "An administrator account already exists. Please sign in."
      );
      return;
    }

    /* -------------------------------------------------------
       STRONG PASSWORD VALIDATION
    ------------------------------------------------------- */

    const strongPasswordRequired =
      settings?.strongPasswordRequired ??
      settings?.strongPassword ??
      true;

    if (
      strongPasswordRequired &&
      adminPassword.length < 6
    ) {
      setAdminError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      strongPasswordRequired &&
      !/[A-Z]/.test(adminPassword)
    ) {
      setAdminError(
        "Password must contain at least one capital letter."
      );
      return;
    }

    if (
      strongPasswordRequired &&
      !/[0-9]/.test(adminPassword)
    ) {
      setAdminError(
        "Password must contain at least one number."
      );
      return;
    }

    if (
      strongPasswordRequired &&
      !/[^A-Za-z0-9]/.test(adminPassword)
    ) {
      setAdminError(
        "Password must contain at least one special character."
      );
      return;
    }

    if (
      adminPassword !==
      adminConfirmPassword
    ) {
      setAdminError("Passwords do not match.");
      return;
    }

    /* -------------------------------------------------------
       CREATE FIRST ADMIN
    ------------------------------------------------------- */

    const administrator = {
      name,
      email: normalizedEmail,
      password: adminPassword,
      role: "Admin",
      status: "Active",
    };

    try {
      await addUser(administrator);

      createLoginSession(administrator);

      if (remember) {
        localStorage.setItem(
          "fleetdoc_email",
          normalizedEmail
        );
      }

      setAdminSuccess(
        "Administrator account created successfully."
      );

      setTimeout(() => {
        navigate("/");
      }, 700);
    } catch (err) {
      console.error(
        "Administrator account creation failed:",
        err
      );

      setAdminError(
        getErrorMessage(
          err,
          "Unable to create the administrator account. Please try again."
        )
      );
    }
  };

  /* =========================================================
     FORGOT PASSWORD
  ========================================================= */

  const openForgotPassword = () => {
    setForgotEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotError("");
    setForgotSuccess("");
    setEmailChecked(false);
    setRegisteredUser(null);
    setOtp("");
    setOtpVerified(false);
    setOtpExpiresAt(null);
    setShowForgotPassword(true);
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotError("");
    setForgotSuccess("");
    setEmailChecked(false);
    setRegisteredUser(null);
    setOtp("");
    setOtpVerified(false);
    setOtpExpiresAt(null);
  };

  /* =========================================================
     CHECK REGISTERED EMAIL + SEND EMAIL OTP
     
     IMPORTANT:
     This uses EMAIL only.
     No phone number is involved.
  ========================================================= */

  const checkRegisteredEmail = async () => {
    setForgotError("");
    setForgotSuccess("");
    setOtp("");
    setOtpVerified(false);
    setOtpExpiresAt(null);

    const normalizedEmail = forgotEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setForgotError("Please enter your registered email address.");
      return;
    }

    try {
      const result = await forgotPasswordRequest(normalizedEmail);

      setRegisteredUser({ email: normalizedEmail });
      setEmailChecked(true);
      setOtpExpiresAt(
        result?.expires_at ? new Date(result.expires_at).getTime() : Date.now() + 3 * 60 * 1000
      );
      setForgotSuccess("OTP sent to your registered email.");
    } catch (err) {
      setEmailChecked(false);
      setRegisteredUser(null);
      setOtpExpiresAt(null);
      setForgotError(
        getErrorMessage(
          err,
          "This is not an existing email. Please contact the admin."
        )
      );
    }
  };

  /* =========================================================
     VERIFY EMAIL OTP
  ========================================================= */

  const handleVerifyOtp = async () => {
    setForgotError("");
    setForgotSuccess("");

    if (!registeredUser?.email) {
      setForgotError("Please verify your registered email first.");
      return;
    }

    if (!otp.trim()) {
      setForgotError("Please enter the OTP sent to your registered email.");
      return;
    }

    if (otp.length !== 6) {
      setForgotError("Please enter the 6-digit OTP.");
      return;
    }

    if (otpExpiresAt && Date.now() > otpExpiresAt) {
      setForgotError("This OTP has expired. Please request a new OTP.");
      setOtpVerified(false);
      return;
    }

    try {
      await verifyForgotPasswordOtp(registeredUser.email, otp.trim());
      setOtpVerified(true);
      setForgotSuccess("OTP verified successfully.");
    } catch (err) {
      setOtpVerified(false);
      setForgotError(
        getErrorMessage(err, "Invalid or expired OTP. Please request a new OTP.")
      );
    }
  };

  /* =========================================================
     RESEND EMAIL OTP
  ========================================================= */

  const resendOtp = async () => {
    if (!registeredUser?.email) return;

    setForgotError("");
    setForgotSuccess("");
    setOtp("");
    setOtpVerified(false);

    try {
      const result = await forgotPasswordRequest(registeredUser.email);

      setOtpExpiresAt(
        result?.expires_at ? new Date(result.expires_at).getTime() : Date.now() + 3 * 60 * 1000
      );

      setForgotSuccess("A new OTP has been sent to your registered email. The previous OTP is no longer valid.");
    } catch (err) {
      setForgotError(
        getErrorMessage(err, "Unable to resend OTP. Please try again.")
      );
    }
  };

  /* =========================================================
     RESET PASSWORD
     
     IMPORTANT:
     Only EMAIL + EMAIL OTP are required.
     Phone verification is NOT checked here.
  ========================================================= */

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setForgotError("");
    setForgotSuccess("");

    if (!registeredUser?.email) {
      setForgotError(
        "Please verify your registered email first."
      );
      return;
    }

    if (!otpVerified) {
      setForgotError(
        "Please verify the OTP before resetting your password."
      );
      return;
    }

    if (!newPassword || !confirmPassword) {
      setForgotError(
        "Please enter and confirm your new password."
      );
      return;
    }

    const strongPasswordRequired =
      settings?.strongPasswordRequired ??
      settings?.strongPassword ??
      true;

    if (
      strongPasswordRequired &&
      newPassword.length < 6
    ) {
      setForgotError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      strongPasswordRequired &&
      !/[A-Z]/.test(newPassword)
    ) {
      setForgotError(
        "Password must contain at least one capital letter."
      );
      return;
    }

    if (
      strongPasswordRequired &&
      !/[0-9]/.test(newPassword)
    ) {
      setForgotError(
        "Password must contain at least one number."
      );
      return;
    }

    if (
      strongPasswordRequired &&
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      setForgotError(
        "Password must contain at least one special character."
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setForgotError(
        "Passwords do not match."
      );
      return;
    }

    try {
      /*
       * IMPORTANT:
       * This sends only:
       *
       * email
       * otp
       * new_password
       *
       * No phone number is sent or checked.
       */
      await resetPassword(
        registeredUser.email,
        otp.trim(),
        newPassword
      );

      setForgotSuccess(
        "Password reset successfully. You can now sign in."
      );

      setTimeout(() => {
        setEmail(
          registeredUser.email
        );

        setPassword("");

        closeForgotPassword();
      }, 1200);
    } catch (err) {
      setForgotError(
        getErrorMessage(
          err,
          "Unable to reset password. Please try again."
        )
      );
    }
  };

  /* =========================================================
     TWO-FACTOR VERIFICATION
  ========================================================= */

  const handleTwoFactorVerify = async (e) => {
    e.preventDefault();
    setTwoFactorError("");

    if (!/^\d{6}$/.test(twoFactorOtp.trim())) {
      setTwoFactorError("Enter the 6-digit verification code.");
      return;
    }

    if (twoFactorExpiresAt && Date.now() > twoFactorExpiresAt) {
      setTwoFactorError("This verification code has expired. Please sign in again to receive a new code.");
      return;
    }

    setBusy(true);
    try {
      await verifyLogin2FA(
        twoFactorChallengeId,
        twoFactorOtp.trim(),
        remember
      );
      setShowTwoFactor(false);
      setTwoFactorOtp("");
      setTwoFactorExpiresAt(null);
      navigate("/");
    } catch (err) {
      setTwoFactorError(
        getErrorMessage(err, "Unable to verify the code. Please try again.")
      );
    } finally {
      setBusy(false);
    }
  };

  const closeTwoFactor = () => {
    setShowTwoFactor(false);
    setTwoFactorOtp("");
    setTwoFactorError("");
    setTwoFactorExpiresAt(null);
      };

  /* =========================================================
     CONTACT ADMINISTRATOR
  ========================================================= */

  const openContactAdmin = () => {
    setShowContactAdmin(true);
  };

  const closeContactAdmin = () => {
    setShowContactAdmin(false);
  };

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =====================================================
            LEFT BRAND SECTION
        ====================================================== */}

        <div className="relative hidden overflow-hidden bg-[#0d1d35] p-12 text-white lg:flex lg:flex-col lg:justify-between">

          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-3xl" />

          <div className="relative z-10 flex items-center gap-3">

            <img
              src={logo}
              alt="FleetDoc Logo"
              className="h-12 w-12 rounded-xl object-contain"
            />

            <div>

              <h1 className="text-2xl font-bold text-white">
                Fleet<span className="text-blue-400">Doc.</span>
              </h1>

              <p className="text-sm text-slate-400">
                Vehicle Document Manager
              </p>

            </div>

          </div>

          <div className="relative z-10 max-w-lg">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">

              <ShieldCheck size={16} />

              Smart Vehicle Compliance Management

            </div>

            <h2 className="text-5xl font-bold leading-tight">
              Manage your vehicle documents in one place.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              Track important vehicle documents, EMI payments,
              challans, permits and taxes. Get notified before
              documents expire.
            </p>

            <div className="mt-10 space-y-4">

              <Feature text="Store all vehicle documents securely" />

              <Feature text="Get automatic expiry reminders" />

              <Feature text="Track EMI, challans and road tax" />

              <Feature text="Monitor vehicle compliance from one dashboard" />

            </div>

          </div>

          <div className="relative z-10 text-sm text-slate-500">
            © 2026 FleetDoc. All rights reserved.
          </div>

        </div>

        {/* =====================================================
            RIGHT SECTION
        ====================================================== */}

        <div className="flex items-center justify-center bg-white p-6 sm:p-10">

          <div className="w-full max-w-md">

            <div className="mb-10 flex items-center gap-3 lg:hidden">

              <img
                src={logo}
                alt="FleetDoc Logo"
                className="h-12 w-12 rounded-xl object-contain"
              />

              <div>

                <h1 className="text-xl font-bold text-slate-800">
                  Fleet<span className="text-blue-600">Doc.</span>
                </h1>

                <p className="text-xs text-slate-500">
                  Vehicle Document Manager
                </p>

              </div>

            </div>

            {isFirstSetup ? (
              <>

                <div className="mb-8">

                  <h2 className="text-3xl font-bold text-slate-800">
                    Create Administrator
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    No FleetDoc user account exists. Create the
                    first administrator account to get started.
                  </p>

                </div>

                <form
                  onSubmit={handleCreateAdministrator}
                  className="space-y-5"
                >

                  {adminSuccess && (
                    <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

                      <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <span>{adminSuccess}</span>

                    </div>
                  )}

                  {adminError && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

                      <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <span>{adminError}</span>

                    </div>
                  )}

                  <div>

                    <label className="label">
                      Full Name
                    </label>

                    <div className="relative">

                      <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        value={adminName}
                        onChange={(e) => {
                          setAdminName(e.target.value);
                          setAdminError("");
                        }}
                        placeholder="Enter administrator name"
                        className="input pl-10"
                        autoFocus
                      />

                    </div>

                  </div>

                  <div>

                    <label className="label">
                      Email Address
                    </label>

                    <div className="relative">

                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => {
                          setAdminEmail(e.target.value);
                          setAdminError("");
                        }}
                        placeholder="Enter administrator email"
                        className="input pl-10"
                      />

                    </div>

                  </div>

                  <div>

                    <label className="label">
                      Password
                    </label>

                    <div className="relative">

                      <Lock
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type={
                          showAdminPassword
                            ? "text"
                            : "password"
                        }
                        value={adminPassword}
                        onChange={(e) => {
                          setAdminPassword(e.target.value);
                          setAdminError("");
                        }}
                        placeholder="Create a strong password"
                        className="input px-10 pr-12"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowAdminPassword(
                            !showAdminPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                      >
                        {showAdminPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>

                    </div>

                  </div>

                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">

                    <p className="mb-2 text-xs font-semibold text-slate-600">
                      Password must contain:
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">

                      <PasswordRule
                        valid={passwordRules.length}
                        text="6+ characters"
                      />

                      <PasswordRule
                        valid={passwordRules.capital}
                        text="Capital letter"
                      />

                      <PasswordRule
                        valid={passwordRules.number}
                        text="Number"
                      />

                      <PasswordRule
                        valid={passwordRules.special}
                        text="Special character"
                      />

                    </div>

                  </div>

                  <div>

                    <label className="label">
                      Confirm Password
                    </label>

                    <div className="relative">

                      <Lock
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type={
                          showAdminConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={adminConfirmPassword}
                        onChange={(e) => {
                          setAdminConfirmPassword(
                            e.target.value
                          );

                          setAdminError("");
                        }}
                        placeholder="Confirm administrator password"
                        className="input px-10 pr-12"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowAdminConfirmPassword(
                            !showAdminConfirmPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                      >
                        {showAdminConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>

                    </div>

                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200"
                  >
                    Create Administrator Account
                    <ArrowRight size={18} />
                  </button>

                </form>

                <div className="my-8 flex items-center gap-4">

                  <div className="h-px flex-1 bg-slate-200" />

                  <span className="text-xs text-slate-400">
                    First Time Setup
                  </span>

                  <div className="h-px flex-1 bg-slate-200" />

                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

                  <div className="flex gap-3">

                    <div className="mt-0.5 text-blue-600">
                      <ShieldCheck size={20} />
                    </div>

                    <div>

                      <h4 className="text-sm font-semibold text-slate-700">
                        Administrator Access
                      </h4>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        This is the first account for your
                        FleetDoc installation. It will be created
                        with Administrator access.
                      </p>

                    </div>

                  </div>

                </div>

              </>
            ) : (
              <>

                <div className="mb-8">

                  <h2 className="text-3xl font-bold text-slate-800">
                    Welcome back...
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Sign in to access your FleetDoc. dashboard.
                  </p>

                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {error && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

                      <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <span>{error}</span>

                    </div>
                  )}

                  <div>

                    <label className="label">
                      Email Address
                    </label>

                    <div className="relative">

                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        placeholder="Enter your email"
                        className="input pl-10"
                      />

                    </div>

                  </div>

                  <div>

                    <div className="flex items-center justify-between">

                      <label className="label">
                        Password
                      </label>

                      <button
                        type="button"
                        onClick={openForgotPassword}
                        className="mb-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                      >
                        Forgot password?
                      </button>

                    </div>

                    <div className="relative">

                      <Lock
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        disabled={isLoginPasswordLocked}
                        placeholder="Enter your password"
                        className="input px-10 pr-12 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>

                    </div>

                  </div>

                  <div className="flex items-center">

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">

                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) =>
                          setRemember(
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />

                      Remember me

                    </label>

                  </div>

                  <button
                    type="submit"
                    disabled={busy || Boolean(loginLockedUntil && Date.now() < loginLockedUntil)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? "Signing in..." : "Sign In"}
                    <ArrowRight size={18} />
                  </button>

                </form>

                <div className="my-8 flex items-center gap-4">

                  <div className="h-px flex-1 bg-slate-200" />

                  <span className="text-xs text-slate-400">
                    Fleet Management Website
                  </span>

                  <div className="h-px flex-1 bg-slate-200" />

                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

                  <div className="flex gap-3">

                    <div className="mt-0.5 text-blue-600">
                      <ShieldCheck size={20} />
                    </div>

                    <div>

                      <h4 className="text-sm font-semibold text-slate-700">
                        FleetDoc. Access
                      </h4>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Enter the valid email address and password
                        to access the FleetDoc. website.
                      </p>

                    </div>

                  </div>

                </div>

                <p className="mt-8 text-center text-sm text-slate-500">

                  Don't have an account?

                  <button
                    type="button"
                    onClick={openContactAdmin}
                    className="ml-1 font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Contact Administrator
                  </button>

                </p>

              </>
            )}

          </div>

        </div>

      </div>

      {/* =========================================================
          FORGOT PASSWORD MODAL
      ========================================================== */}

      {showForgotPassword && !isFirstSetup && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl" />

            <div className="relative border-b border-slate-100 bg-[#0d1d35] px-6 py-5 text-white">

              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-600/20 blur-2xl" />

              <div className="relative flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">

                    <KeyRound size={22} />

                  </div>

                  <div>

                    <h3 className="text-lg font-bold">
                      Reset Password
                    </h3>

                    <p className="text-xs text-slate-400">
                      Recover your FleetDoc. account
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={closeForgotPassword}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={19} />
                </button>

              </div>

            </div>

            <div className="p-6">

              {forgotSuccess && (

                <div className="mb-5 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{forgotSuccess}</span>

                </div>

              )}

              {forgotError && (

                <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{forgotError}</span>

                </div>

              )}

              {!otpVerified ? (

                <>

                  <div className="mb-6">

                    <h4 className="text-lg font-semibold text-slate-800">
                      Find your account
                    </h4>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Enter your registered email address to
                      continue.
                    </p>

                  </div>

                  <div>

                    <label className="label">
                      Email Address
                    </label>

                    <div className="relative">

                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => {

                          setForgotEmail(
                            e.target.value
                          );

                          setForgotError("");

                          setEmailChecked(false);
                          setRegisteredUser(null);
                          setOtp("");
                                                    setOtpVerified(false);
                          setOtpExpiresAt(null);

                        }}
                        placeholder="Enter your registered email"
                        className="input pl-10"
                        autoFocus
                      />

                    </div>

                  </div>

                  {emailChecked && registeredUser && (

                    <div className="mt-5">

                      <label className="label">
                        Enter OTP
                      </label>

                      <div className="relative">

                        <KeyRound
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => {

                            const value =
                              e.target.value
                                .replace(
                                  /\D/g,
                                  ""
                                )
                                .slice(0, 6);

                            setOtp(value);
                            setForgotError("");

                          }}
                          placeholder="Enter 6-digit OTP"
                          className="input pl-10 tracking-[0.3em]"
                        />

                      </div>

                      <div className="mt-2 flex items-center justify-between">

                        <p className="text-xs text-slate-500">
                          OTP is valid for 3 minutes.
                        </p>

                        <button
                          type="button"
                          onClick={resendOtp}
                          className="text-xs font-medium text-blue-600 transition hover:text-blue-700"
                        >
                          Resend OTP
                        </button>

                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={
                          otp.length !== 6
                        }
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 disabled:hover:shadow-none"
                      >
                        Verify OTP
                        <ArrowRight size={18} />
                      </button>

                    </div>

                  )}

                  {!emailChecked && (

                    <button
                      type="button"
                      onClick={checkRegisteredEmail}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200"
                    >
                      Verify Email
                      <ArrowRight size={18} />
                    </button>

                  )}

                </>

              ) : (

                <form
                  onSubmit={handleResetPassword}
                  className="space-y-5"
                >

                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">

                    <div className="flex items-center gap-2">

                      <CheckCircle2
                        size={17}
                        className="text-green-600"
                      />

                      <span className="text-sm font-medium text-green-700">
                        Email verified
                      </span>

                    </div>

                    <p className="mt-1 break-all text-xs text-green-600">
                      {registeredUser?.email}
                    </p>

                  </div>

                  <div>

                    <label className="label">
                      New Password
                    </label>

                    <div className="relative">

                      <Lock
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type={
                          showNewPassword
                            ? "text"
                            : "password"
                        }
                        value={newPassword}
                        onChange={(e) => {

                          setNewPassword(
                            e.target.value
                          );

                          setForgotError("");

                        }}
                        placeholder="Enter new password"
                        className="input px-10 pr-12"
                        autoFocus
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowNewPassword(
                            !showNewPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                      >
                        {showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>

                    </div>

                  </div>

                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">

                    <p className="mb-2 text-xs font-semibold text-slate-600">
                      Password must contain:
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">

                      <PasswordRule
                        valid={resetPasswordRules.length}
                        text="6+ characters"
                      />

                      <PasswordRule
                        valid={resetPasswordRules.capital}
                        text="Capital letter"
                      />

                      <PasswordRule
                        valid={resetPasswordRules.number}
                        text="Number"
                      />

                      <PasswordRule
                        valid={resetPasswordRules.special}
                        text="Special character"
                      />

                    </div>

                  </div>

                  <div>

                    <label className="label">
                      Confirm Password
                    </label>

                    <div className="relative">

                      <Lock
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(e) => {

                          setConfirmPassword(
                            e.target.value
                          );

                          setForgotError("");

                        }}
                        placeholder="Confirm new password"
                        className="input px-10 pr-12"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>

                    </div>

                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200"
                  >
                    Reset Password
                    <CheckCircle2 size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {

                      setOtpVerified(false);

                      setOtp("");
                                            setOtpExpiresAt(null);

                      setEmailChecked(true);

                      setNewPassword("");
                      setConfirmPassword("");

                      setForgotError("");
                      setForgotSuccess("");

                    }}
                    className="w-full text-sm font-medium text-blue-600 transition hover:text-blue-700"
                  >
                    Back to OTP Verification
                  </button>

                </form>

              )}

            </div>

          </div>

        </div>

      )}


      {/* =========================================================
          TWO-FACTOR VERIFICATION MODAL
      ========================================================== */}

      {showTwoFactor && !isFirstSetup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={closeTwoFactor}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="relative border-b border-slate-100 bg-[#0d1d35] px-6 py-5 text-white">
              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Two-Factor Verification</h3>
                  <p className="mt-1 text-xs text-slate-400">Enter the code sent to your registered email</p>
                </div>
                <button type="button" onClick={closeTwoFactor} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white">
                  <X size={19} />
                </button>
              </div>
            </div>

            <form onSubmit={handleTwoFactorVerify} className="space-y-4 p-6">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-medium text-blue-700">A 6-digit verification code has been sent to</p>
                <p className="mt-1 text-sm font-bold text-slate-800">{email}</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Verification Code</label>
                <input
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  value={twoFactorOtp}
                  onChange={(e) => setTwoFactorOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit code"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-lg font-bold tracking-[0.35em] outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {twoFactorError && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{twoFactorError}</div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Verifying..." : "Verify & Sign In"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          CONTACT ADMINISTRATOR MODAL
      ========================================================== */}

      {showContactAdmin && !isFirstSetup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={closeContactAdmin}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl" />

            <div className="relative border-b border-slate-100 bg-[#0d1d35] px-6 py-5 text-white">
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-600/20 blur-2xl" />

              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">
                    Contact Administrator
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Contact your FleetDoc portal administrator
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeContactAdmin}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close contact administrator"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            <div className="relative space-y-4 p-6">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                  Company Information
                </p>

                <h4 className="mt-1 text-lg font-bold text-slate-800">
                  {settings?.companyName || "Company Name"}
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  {settings?.portalName || "Fleet Portal"}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                  <Mail
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">
                      Email Address
                    </p>

                    {settings?.email ? (
                      <a
                        href={`mailto:${settings.email}`}
                        className="mt-0.5 block break-all text-sm font-medium text-slate-700 transition hover:text-blue-600"
                      >
                        {settings.email}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-sm font-medium text-slate-500">
                        Not provided
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                  <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center text-blue-600">
                    <span className="text-sm font-semibold">☎</span>
                  </span>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">
                      Phone Number
                    </p>

                    {settings?.phone ? (
                      <a
                        href={`tel:${settings.phone}`}
                        className="mt-0.5 block text-sm font-medium text-slate-700 transition hover:text-blue-600"
                      >
                        {settings.phone}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-sm font-medium text-slate-500">
                        Not provided
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={closeContactAdmin}
                className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ============================================================
   FEATURE ITEM
============================================================ */

function Feature({ text }) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">

        <CheckCircle2 size={16} />

      </div>

      <span className="text-slate-300">
        {text}
      </span>

    </div>
  );
}

/* ============================================================
   PASSWORD RULE
============================================================ */

function PasswordRule({ valid, text }) {
  return (
    <div
      className={`flex items-center gap-2 transition ${
        valid
          ? "text-green-600"
          : "text-slate-400"
      }`}
    >

      <CheckCircle2
        size={14}
        className={
          valid
            ? "opacity-100"
            : "opacity-40"
        }
      />

      <span>{text}</span>

    </div>
  );
}