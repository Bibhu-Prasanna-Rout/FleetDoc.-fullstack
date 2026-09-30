  // import { useEffect,useState } from "react";
  // import { useNavigate,useParams } from "react-router-dom";
  // import { Mail,Phone,Lock,Eye,EyeOff,ShieldCheck,CheckCircle2,ArrowLeft,Save,RefreshCw,UserRound } from "lucide-react";
  // import PageHeader from "../components/PageHeader";
  // import { useFleet } from "../context/fleetContext";

  // const strong=p=>p.length>=6&&/[A-Z]/.test(p)&&/[0-9]/.test(p)&&/[^A-Za-z0-9]/.test(p);
  // export default function AddUser(){
  //  const nav=useNavigate(),{id}=useParams(); const editing=Boolean(id);
  //  const {users=[],addUser,updateUser,sendUserVerification,verifyUserVerification}=useFleet();
  //  const existing=users.find(x=>String(x.id)===String(id));
  //  const [form,setForm]=useState({name:"",email:"",contactNo:"",password:"",role:"User",status:"Active",photo:""});
  //  const [emailOtp,setEmailOtp]=useState(""),[phoneOtp,setPhoneOtp]=useState(""),[emailSent,setEmailSent]=useState(false),[phoneSent,setPhoneSent]=useState(false),[emailVerified,setEmailVerified]=useState(false),[phoneVerified,setPhoneVerified]=useState(false),[devEmail,setDevEmail]=useState(""),[devPhone,setDevPhone]=useState(""),[error,setError]=useState(""),[message,setMessage]=useState("");
  //  useEffect(()=>{if(existing)setForm({...existing,password:"",contactNo:existing.contactNo||existing.phone||""})},[existing]);
  //  const change=e=>setForm(x=>({...x,[e.target.name]:e.target.value}));
  //  const send=async channel=>{setError("");try{const uid=id||createdId;if(!uid)return setError("Create the user first.");if(channel==="email"){if(!form.email)return setError("Email is required.");const r=await sendUserVerification(uid,"email","user_email_verification");setEmailSent(true);setDevEmail(r.dev_otp||"");}else{if(!form.contactNo)return setError("Phone number is required.");const r=await sendUserVerification(uid,"phone","user_phone_verification");setPhoneSent(true);setDevPhone(r.dev_otp||"");}}catch(e){setError(editing?e.message:"Save the user first, then verify email/phone from the Users page.")}};
  //  const submit=async e=>{e.preventDefault();setError("");if(!form.name||!form.email)return setError("Name and email are required.");if(!editing&&!strong(form.password))return setError("Password must contain 6+ characters, uppercase, number and special character.");try{if(editing){await updateUser(id,form);nav("/users")}else{const u=await addUser(form);setCreatedId(u.id);const er=await sendUserVerification(u.id,"email","user_email_verification");setEmailSent(true);setDevEmail(er.dev_otp||"");if(form.contactNo){const pr=await sendUserVerification(u.id,"phone","user_phone_verification");setPhoneSent(true);setDevPhone(pr.dev_otp||"");}setMessage("User created. Verification OTPs have been sent to the registered email and phone.");}}catch(e){setError(e.message)}};
  //  const verify=async channel=>{try{const otp=channel==="email"?emailOtp:phoneOtp;const target=channel==="email"?form.email:form.contactNo;const r=await verifyUserVerification(id||createdId,target,otp,channel==="email"?"user_email_verification":"user_phone_verification");if(channel==="email")setEmailVerified(true);else setPhoneVerified(true);setMessage(r.message)}catch(e){setError(e.message)}};
  //  return <div className="space-y-6"><PageHeader title={editing?"Edit User":"Add User"} subtitle="Manage secure FleetDoc user access and verification."/>
  //  <form onSubmit={submit} className="mx-auto max-w-4xl space-y-6">
  //  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center gap-3"><UserRound className="text-blue-600"/><div><h2 className="font-bold text-slate-900">Account Details</h2><p className="text-xs text-slate-500">User identity, role and credentials</p></div></div>
  //  <div className="grid gap-4 md:grid-cols-2"><div><label className="label">Full Name</label><input className="input" name="name" value={form.name} onChange={change} required/></div><div><label className="label">Role</label><select className="input" name="role" value={form.role} onChange={change}><option>Admin</option><option>Manager</option><option>Finance</option><option>User</option></select></div><div><label className="label">Email</label><div className="flex gap-2"><input className="input flex-1" name="email" type="email" value={form.email} onChange={change} required/>{(editing||createdId)&&<button type="button" onClick={()=>send("email")} className="rounded-xl bg-blue-50 px-4 text-blue-700">{emailVerified?"Verified":"Verify"}</button>}</div>{devEmail&&<p className="mt-1 text-xs text-amber-700">Dev OTP: <b>{devEmail}</b></p>}{emailSent&&!emailVerified&&(editing||createdId)&&<div className="mt-2 flex gap-2"><input className="input" maxLength={6} value={emailOtp} onChange={e=>setEmailOtp(e.target.value.replace(/\D/g,""))} placeholder="Email OTP"/><button type="button" onClick={()=>verify("email")} className="rounded-xl bg-emerald-600 px-4 text-white">Verify</button></div>}</div><div><label className="label">Phone Number</label><div className="flex gap-2"><input className="input flex-1" name="contactNo" value={form.contactNo} onChange={change} placeholder="+91..."/>{(editing||createdId)&&<button type="button" onClick={()=>send("phone")} className="rounded-xl bg-violet-50 px-4 text-violet-700">{phoneVerified?"Verified":"Verify"}</button>}</div>{devPhone&&<p className="mt-1 text-xs text-amber-700">Dev OTP: <b>{devPhone}</b></p>}{phoneSent&&!phoneVerified&&(editing||createdId)&&<div className="mt-2 flex gap-2"><input className="input" maxLength={6} value={phoneOtp} onChange={e=>setPhoneOtp(e.target.value.replace(/\D/g,""))} placeholder="SMS OTP"/><button type="button" onClick={()=>verify("phone")} className="rounded-xl bg-emerald-600 px-4 text-white">Verify</button></div>}</div><div><label className="label">Password {editing&&"(leave blank to keep current)"}</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17}/><input className="input pl-10" name="password" type="password" value={form.password} onChange={change} required={!editing}/></div></div><div><label className="label">Status</label><select className="input" name="status" value={form.status} onChange={change}><option>Active</option><option>Inactive</option></select></div></div></section>
  //  {error&&<div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}{message&&<div className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 flex gap-2"><CheckCircle2 size={18}/>{message}</div>}
  //  <div className="flex justify-end gap-3"><button type="button" onClick={()=>nav("/users")} className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700"><ArrowLeft size={16} className="inline mr-2"/>Cancel</button><button className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white"><Save size={16} className="inline mr-2"/>{editing?"Update User":"Create User"}</button></div>
  //  </form></div>
  // }



  

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import { useFleet } from "../context/fleetContext";
import { motion } from "framer-motion";

import {
  ArrowLeft,
  Save,
  X,
  Mail,
  MailCheck,
  Phone,
  Lock,
  Camera,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
  UserRound,
  ChevronDown,
  UserPlus,
  ImagePlus,
  CircleCheck,
  EditIcon,
  UserPen,
  UserCheck2Icon,
} from "lucide-react";

/* =========================================================
   CONSTANTS
========================================================= */

const OTP_DURATION = 180;

const EMPTY_FORM = {
  name: "",
  email: "",
  contactNo: "",
  password: "",
  role: "User",
  status: "Active",
  photo: "",
};

/* =========================================================
   ITEM VARIANTS
========================================================= */

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
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
   HELPERS
========================================================= */

/*
 * Converts:
 *
 * +91 9876543210
 * 919876543210
 * 9876543210
 *
 * into:
 *
 * 9876543210
 *
 * IMPORTANT:
 * A 10-digit number beginning with 91 is NOT changed.
 */
const normalizeIndianPhone = (value) => {
  if (!value) return "";

  let digits = String(value).replace(/\D/g, "");

  /*
   * Remove country code only when the complete value
   * contains 12 digits.
   */
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }

  return digits.slice(0, 10);
};

/*
 * Display phone number in the existing UI as:
 *
 * +91 9876543210
 */
const formatIndianPhone = (value) => {
  const digits = normalizeIndianPhone(value);

  if (!digits) return "";

  return `+91 ${digits}`;
};

const validatePassword = (password) => {
  return {
    length: password.length >= 6,
    capital: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
};

const isPasswordValid = (password) => {
  const rules = validatePassword(password);

  return (
    rules.length &&
    rules.capital &&
    rules.number &&
    rules.special
  );
};

const formatTimer = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    secs
  ).padStart(2, "0")}`;
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AddUser() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    users = [],
    addUser,
    updateUser,
    sendUserVerification,
    verifyUserVerification,
    settings,
  } = useFleet();

  const isEditing = Boolean(id);

  /* =======================================================
     FORM
  ======================================================= */

  const [form, setForm] = useState({
    ...EMPTY_FORM,
  });

  /* =======================================================
     PASSWORD
  ======================================================= */

  const [showPassword, setShowPassword] = useState(false);

  /* =======================================================
     BACKEND USER CREATION
  ======================================================= */

  const [createdUserId, setCreatedUserId] = useState(null);
  const [, setIsCreatingUser] = useState(false);

  /* =======================================================
     EMAIL VERIFICATION
  ======================================================= */

  const [
    emailVerificationStarted,
    setEmailVerificationStarted,
  ] = useState(false);

  const [emailOTP, setEmailOTP] = useState("");

  const [
    generatedEmailOTP,
    setGeneratedEmailOTP,
  ] = useState("");

  const [emailTimer, setEmailTimer] = useState(0);

  const [emailVerified, setEmailVerified] =
    useState(false);

  const [emailError, setEmailError] =
    useState("");

  /* =======================================================
     CONTACT INFORMATION
     Mobile/SMS OTP is intentionally disabled for now.
  ======================================================= */

  const [contactError, setContactError] = useState("");

  /* =======================================================
     PHOTO
  ======================================================= */

  const fileInputRef = useRef(null);
  const newFormInitializedRef = useRef(false);

  /* =======================================================
     MESSAGE
  ======================================================= */

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  /* =======================================================
     OTP EMAIL TIMER
  ======================================================= */

  useEffect(() => {
    if (emailTimer <= 0) return;

    const interval = setInterval(() => {
      setEmailTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [emailTimer]);

  /* =======================================================
     AUTO CLEAR MESSAGE
  ======================================================= */

  useEffect(() => {
    if (!message.text) return;

    const timer = setTimeout(() => {
      setMessage({
        type: "",
        text: "",
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [message]);

  /* =======================================================
     RESET VERIFICATION STATES
  ======================================================= */

  const resetVerificationStates = () => {
    setEmailVerificationStarted(false);
    setEmailOTP("");
    setGeneratedEmailOTP("");
    setEmailTimer(0);
    setEmailVerified(false);
    setEmailError("");
    setCreatedUserId(null);
    setContactError("");
  };

  /* =======================================================
     RESET EMAIL VERIFICATION ONLY
  ======================================================= */

  const resetEmailVerification = () => {
    setEmailVerified(false);
    setEmailVerificationStarted(false);
    setEmailOTP("");
    setGeneratedEmailOTP("");
    setEmailTimer(0);
    setEmailError("");
  };

  /* =======================================================
     LOAD USER WHEN EDITING
  ======================================================= */

  useEffect(() => {
    if (!isEditing) {
      if (!newFormInitializedRef.current) {
        setForm({
          ...EMPTY_FORM,
        });

        resetVerificationStates();
        newFormInitializedRef.current = true;
      }

      return;
    }

    newFormInitializedRef.current = false;

    const user = users.find(
      (item) => String(item.id) === String(id)
    );

    if (!user) {
      setMessage({
        type: "error",
        text: "User not found.",
      });

      return;
    }

    /*
     * IMPORTANT:
     * Backend stores only the 10-digit phone number.
     * The existing UI displays it with +91.
     */
    setForm({
      name: user.name || "",
      email: user.email || "",
      contactNo: formatIndianPhone(
        normalizeIndianPhone(user.contactNo || user.phone || "")
      ),
      password: "",
      role: user.role || "User",
      status: user.status || "Active",
      photo: user.photo || "",
    });

    /*
     * Existing user can be considered verified.
     *
     * IMPORTANT:
     * In Edit mode the input remains editable even when
     * emailVerified is true.
     *
     * If the value is changed, handleChange() below will
     * automatically reset the verification.
     */

    setEmailVerified(
      user.emailVerified === true ||
      user.email_verified === true
    );

    setEmailVerificationStarted(false);
    setEmailOTP("");
    setGeneratedEmailOTP("");
    setEmailTimer(0);
    setEmailError("");
    setContactError("");
    setCreatedUserId(Number(user.id));
    setShowPassword(false);
  }, [id, isEditing, users]);

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    /* =====================================================
       EMAIL CHANGED
    ===================================================== */

    if (name === "email") {
      /*
       * Every email change invalidates the previous
       * verification.
       *
       * This is especially important in Edit mode.
       */

      resetEmailVerification();
    }

    /* =====================================================
       CONTACT CHANGED
       Contact number is informational only. No SMS OTP.
    ===================================================== */

    if (name === "contactNo") {
      setContactError("");
    }
  };

  /* =========================================================
     TEMPORARY PASSWORD FOR PENDING USER
     The backend requires a password when the user row is first
     created. A random temporary password is used only until the
     administrator enters the real password after email verification.
  ========================================================= */

  const generateTemporaryPassword = () => {
    try {
      const random =
        window.crypto?.randomUUID?.() ||
        Math.random().toString(36).slice(2) + Date.now();

      return `Fleet@${random.replace(
        /[^A-Za-z0-9]/g,
        ""
      )}A1!`;
    } catch {
      return `Fleet@${Math.random()
        .toString(36)
        .slice(2)}A1!`;
    }
  };

  /* =========================================================
     CREATE PENDING USER BEFORE EMAIL OTP
  ========================================================= */

  const ensureUserCreated = async () => {
    if (isEditing) {
      return Number(id);
    }

    if (createdUserId) {
      return Number(createdUserId);
    }

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    /*
     * IMPORTANT:
     * form.contactNo contains +91 9876543210
     * but backend must receive 9876543210.
     */
    const phone = normalizeIndianPhone(
      form.contactNo
    );

    if (!name) {
      setMessage({
        type: "error",
        text: "Please enter the user's full name first.",
      });
      return null;
    }

    if (!email) {
      setEmailError("Email address is required.");
      return null;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      setEmailError(
        "Please enter a valid email address."
      );
      return null;
    }

    if (!phone) {
      setContactError(
        "Please enter the user's contact number."
      );
      return null;
    }

    if (phone.length !== 10) {
      setContactError(
        "Please enter a valid 10-digit contact number."
      );
      return null;
    }

    try {
      setIsCreatingUser(true);

      const created = await addUser({
        name,
        email,
        phone,
        password: generateTemporaryPassword(),
        role: form.role,

        /* Keep the account inactive until the administrator finishes the flow. */
        status: "Inactive",

        photo: form.photo || "",
      });

      const newId = Number(created?.id);

      if (!newId) {
        throw new Error(
          "The user was created, but no user ID was returned by the server."
        );
      }

      setCreatedUserId(newId);
      return newId;
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error?.message ||
          "Unable to create the pending user account.",
      });

      return null;
    } finally {
      setIsCreatingUser(false);
    }
  };

  /* =========================================================
     SEND EMAIL OTP
  ========================================================= */

  const handleSendEmailCode = async () => {
    if (!form.email.trim()) {
      setEmailError("Email address is required.");
      return;
    }

    const email = form.email.trim().toLowerCase();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      setEmailError(
        "Please enter a valid email address."
      );
      return;
    }

    if (
      !isEditing &&
      !form.contactNo.trim()
    ) {
      setContactError(
        "Please enter the user's contact number before verifying the email."
      );
      return;
    }

    try {
      setEmailError("");
      setIsCreatingUser(true);

      const userId = await ensureUserCreated();

      if (!userId) return;

      /* If the email was changed while editing, synchronize it first. */
      if (isEditing) {
        const current = users.find(
          (u) => String(u.id) === String(userId)
        );

        const oldEmail = current?.email
          ?.trim()
          .toLowerCase();

        if (oldEmail !== email) {
          await updateUser(userId, {
            email,
            name: form.name.trim(),

            /*
             * Backend receives only the 10-digit number.
             */
            phone: normalizeIndianPhone(
              form.contactNo
            ),

            role: form.role,
            status: form.status,
            photo: form.photo || "",
          });
        }
      }

      await sendUserVerification(
        userId,
        "email",
        "user_email_verification"
      );

      setEmailVerificationStarted(true);
      setEmailTimer(OTP_DURATION);
      setEmailOTP("");
      setEmailVerified(false);

      setMessage({
        type: "success",
        text: `A verification code has been sent to ${email}.`,
      });
    } catch (error) {
      setEmailError(
        error?.message ||
          "Unable to send the email verification code."
      );
    } finally {
      setIsCreatingUser(false);
    }
  };

  /* =========================================================
     VERIFY EMAIL OTP
  ========================================================= */

  const handleVerifyEmailCode = async () => {
    if (!emailOTP) {
      setEmailError(
        "Please enter the verification code."
      );
      return;
    }

    if (emailTimer <= 0) {
      setEmailError(
        "This verification code has expired. Please resend the code."
      );
      return;
    }

    const userId = isEditing
      ? Number(id)
      : Number(createdUserId);

    if (!userId) {
      setEmailError(
        "Please click Verify first so the user account can be prepared."
      );
      return;
    }

    try {
      setIsCreatingUser(true);

      await verifyUserVerification(
        userId,
        form.email.trim().toLowerCase(),
        emailOTP,
        "user_email_verification"
      );

      setEmailVerified(true);
      setEmailError("");
      setEmailTimer(0);
      setEmailVerificationStarted(false);

      setMessage({
        type: "success",
        text: "Email verified successfully. You can now create the user's password and save the account.",
      });
    } catch (error) {
      setEmailError(
        error?.message ||
          "Invalid or expired verification code."
      );
    } finally {
      setIsCreatingUser(false);
    }
  };

  /* =========================================================
     RESEND EMAIL OTP
  ========================================================= */

  const handleResendEmailCode = () => {
    handleSendEmailCode();
  };

  /* =========================================================
     CONTACT INFORMATION
     No SMS/mobile OTP is sent or required.
  ========================================================= */

  /* =========================================================
     PHOTO UPLOAD
  ========================================================= */

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: "Please upload a valid image file.",
      });

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Photo size must be less than 5 MB.",
      });

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        photo: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  /* =========================================================
     PASSWORD RULES
  ========================================================= */

  const passwordRules = validatePassword(
    form.password
  );

  /* =========================================================
     SAVE USER
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setMessage({
        type: "error",
        text: "Please enter the user's full name.",
      });
      return;
    }

    const email = form.email.trim().toLowerCase();

    if (!email) {
      setMessage({
        type: "error",
        text: "Please enter the user's email.",
      });
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    if (!emailVerified) {
      setMessage({
        type: "error",
        text: "Please verify the user's email before saving.",
      });
      return;
    }

    /*
     * IMPORTANT:
     * The input displays:
     *
     * +91 9876543210
     *
     * But the backend must receive:
     *
     * 9876543210
     */
    const phone = normalizeIndianPhone(
      form.contactNo
    );

    if (!phone) {
      setMessage({
        type: "error",
        text: "Please enter the user's contact number.",
      });
      return;
    }

    if (phone.length !== 10) {
      setMessage({
        type: "error",
        text: "Please enter a valid 10-digit contact number.",
      });
      return;
    }

    /* Password can only be created after email verification. */
    if (!form.password) {
      setMessage({
        type: "error",
        text: "Please create a password for the user.",
      });
      return;
    }

    const strongPasswordRequired =
      settings?.strongPasswordRequired ??
      settings?.strongPassword ??
      true;

    if (
      strongPasswordRequired &&
      !isPasswordValid(form.password)
    ) {
      setMessage({
        type: "error",
        text: "Password does not meet all security requirements.",
      });
      return;
    }

    try {
      setIsCreatingUser(true);

      const userId = isEditing
        ? Number(id)
        : Number(createdUserId);

      if (!userId) {
        setMessage({
          type: "error",
          text: "Please verify the user's email first.",
        });
        return;
      }

      const payload = {
        name: form.name.trim(),
        email,

        /*
         * Only 10 digits are sent to backend.
         */
        phone,

        password: form.password,
        role: form.role,
        status: form.status,
        photo: form.photo || "",
        emailVerified: true,
      };

      await updateUser(userId, payload);

      setMessage({
        type: "success",
        text: isEditing
          ? "User updated successfully."
          : "User created successfully.",
      });

      setTimeout(() => {
        navigate("/users");
      }, 700);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error?.message ||
          "Unable to save the user.",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  /* =========================================================
     CANCEL
  ========================================================= */

  const handleCancel = () => {
    navigate("/users");
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="relative min-h-full pb-8">

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 transition duration-300 hover:scale-110 hover:rotate-3">
              {isEditing ? (
                <EditIcon
                  size={23}
                  strokeWidth={2.3}
                />
              ) : (
                <UserPlus
                  size={23}
                  strokeWidth={2.3}
                />
              )}
            </div>

            <div>
              <span className="block text-2xl font-bold text-slate-800">
                {isEditing
                  ? "Edit User"
                  : "Add User"}
              </span>
            </div>
          </div>
        }
        subtitle={
          isEditing
            ? "Update user details and account permissions."
            : "Create a new FleetDoc user account."
        }
        action={
          <button
            type="button"
            onClick={handleCancel}
            className="
              group
              flex items-center gap-2
              rounded-xl
              border border-slate-200
              bg-white
              px-4 py-2.5
              text-sm font-semibold text-slate-600
              shadow-sm
              transition-all duration-300
              hover:-translate-y-0.5
              hover:border-blue-200
              hover:bg-blue-50
              hover:text-blue-700
              hover:shadow-md
              active:scale-[0.98]
            "
          >
            <ArrowLeft
              size={17}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />

            Back to Users
          </button>
        }
      />

      {/* ===================================================
          MESSAGE
      =================================================== */}

      {message.text && (
        <div
          className={`
            mb-6 flex items-center gap-3
            rounded-2xl
            border px-4 py-3.5
            text-sm font-semibold
            shadow-sm
            transition-all duration-300
            ${
              message.type === "success"
                ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700"
                : "border-red-200 bg-gradient-to-r from-red-50 to-rose-50 text-red-700"
            }
          `}
        >
          <div
            className={`
              flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
              ${
                message.type === "success"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-red-100 text-red-600"
              }
            `}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={17} />
            ) : (
              <AlertCircle size={17} />
            )}
          </div>

          <span>{message.text}</span>

          <button
            type="button"
            onClick={() =>
              setMessage({
                type: "",
                text: "",
              })
            }
            className="
              ml-auto
              rounded-lg
              p-1.5
              text-slate-400
              transition-all duration-200
              hover:bg-white
              hover:text-slate-700
              hover:shadow-sm
            "
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* ===================================================
          SECURITY INFORMATION
      =================================================== */}

      <motion.div
        variants={itemVariants}
        className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-lg shadow-blue-100"
      >
        {/* DECORATIVE CIRCLES */}

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
              <UserCheck2Icon size={26} />
            </motion.div>

            <div>

              <h2 className="text-xl font-bold">
                Secure user account
              </h2>

              <p className="mt-1 text-sm text-blue-100">
                Verify the user's email before creating the account.
                The contact number is saved for information only.
                Passwords must meet all security requirements.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">

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
                  <MailCheck size={15} />
                  Email Verification
                </motion.div>

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
                  <Phone size={15} />
                  Contact Information
                </motion.div>

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
                  Secure Password
                </motion.div>

              </div>

            </div>
          </div>
        </div>
      </motion.div>

      {/* ===================================================
          MAIN FORM CARD
      =================================================== */}

      <div
        className="
          overflow-hidden
          rounded-3xl
          border border-slate-200/80
          bg-white
          shadow-sm
        "
      >

        {/* FORM HEADER */}

        <div
          className="
            relative
            overflow-hidden
            border-b border-slate-100
            bg-gradient-to-r
            from-slate-50
            via-white
            to-blue-50/50
            px-6 py-6
          "
        >

          <div
            className="
              absolute -right-16 -top-20
              h-40 w-40
              rounded-full
              bg-blue-100/40
              blur-3xl
            "
          />

          <div className="relative flex items-center gap-4">

            <div
              className="
                flex h-12 w-12 shrink-0 items-center justify-center
                rounded-2xl
                bg-gradient-to-br from-blue-500 to-indigo-600
                text-white
                shadow-lg shadow-blue-200
              "
            >
              {isEditing ? (
                <UserPen size={22} />
              ) : (
                <UserPlus size={22} />
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {isEditing
                  ? "Edit User Information"
                  : "New User Information"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {isEditing
                  ? "Update the user's account information."
                  : "Enter the information required to create the account."}
              </p>
            </div>

          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6"
        >

          {/* =================================================
              PHOTO
              MOVED HERE FROM BOTTOM
          ================================================= */}

          <section className="mb-8">

            <SectionHeading
              icon={<Camera size={17} />}
              title="User Photo"
              description="Upload a profile photo for this user."
              iconClass="bg-pink-50 text-pink-600"
            />

            <div
              className="
                rounded-2xl
                border border-slate-200
                bg-gradient-to-br from-white to-pink-50/20
                p-5
                shadow-sm
                transition-all duration-300
                hover:border-pink-200
                hover:shadow-md
              "
            >

              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">

                {/* PHOTO PREVIEW */}

                <div
                  className="
                    group relative
                    flex h-28 w-28 shrink-0
                    items-center justify-center
                    overflow-hidden
                    rounded-2xl
                    border-2 border-dashed
                    border-slate-200
                    bg-gradient-to-br from-slate-50 to-slate-100
                    shadow-sm
                    transition-all duration-300
                    hover:border-pink-300
                    hover:shadow-md
                  "
                >

                  {form.photo ? (
                    <>
                      <img
                        src={form.photo}
                        alt="User preview"
                        className="
                          h-full w-full
                          object-cover
                          transition-transform duration-500
                          group-hover:scale-105
                        "
                      />

                      <div
                        className="
                          pointer-events-none
                          absolute inset-0
                          bg-gradient-to-t
                          from-black/20
                          via-transparent
                          to-transparent
                          opacity-0
                          transition-opacity duration-300
                          group-hover:opacity-100
                        "
                      />
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1">

                      <UserRound
                        size={34}
                        className="text-slate-300"
                      />

                      <span className="text-[10px] font-semibold text-slate-400">
                        No Photo
                      </span>

                    </div>
                  )}

                </div>

                <div className="flex-1">

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="
                      group
                      flex items-center gap-2
                      rounded-xl
                      border border-slate-200
                      bg-white
                      px-4 py-2.5
                      text-sm font-bold text-slate-700
                      shadow-sm
                      transition-all duration-300
                      hover:-translate-y-0.5
                      hover:border-pink-200
                      hover:bg-pink-50
                      hover:text-pink-700
                      hover:shadow-md
                      active:scale-[0.98]
                    "
                  >

                    <ImagePlus
                      size={17}
                      className="transition-transform duration-300 group-hover:scale-110"
                    />

                    Choose Photo

                  </button>

                  <p className="mt-2.5 text-xs text-slate-400">
                    JPG, PNG or WEBP • Maximum 5 MB
                  </p>

                  {form.photo && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          photo: "",
                        }))
                      }
                      className="
                        mt-2
                        flex items-center gap-1.5
                        rounded-lg
                        px-2 py-1
                        text-xs font-semibold
                        text-red-500
                        transition-all duration-200
                        hover:bg-red-50
                        hover:text-red-600
                      "
                    >

                      <X size={13} />

                      Remove photo

                    </button>
                  )}

                </div>

              </div>

            </div>
          </section>

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <section className="mb-8">

            <SectionHeading
              icon={<UserRound size={17} />}
              title="Basic Information"
              description="Enter the user's primary account details."
              iconClass="bg-blue-50 text-blue-600"
            />

            <div className="grid gap-5 md:grid-cols-2">

              {/* NAME */}

              <div className="group">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name{" "}
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">

                  <UserRound
                    size={17}
                    className="
                      pointer-events-none
                      absolute left-3.5 top-1/2
                      -translate-y-1/2
                      text-slate-400
                      transition-colors duration-200
                      group-focus-within:text-blue-500
                    "
                  />

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                    className="
                      w-full rounded-xl
                      border border-slate-200
                      bg-white
                      py-3 pl-10 pr-4
                      text-sm text-slate-800
                      outline-none
                      placeholder:text-slate-400
                      shadow-sm
                      transition-all duration-200
                      hover:border-slate-300
                      hover:shadow
                      focus:border-blue-400
                      focus:ring-4 focus:ring-blue-50
                    "
                  />

                </div>
              </div>

              {/* ROLE */}

              <div className="group">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  User Role{" "}
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">

                  <ShieldCheck
                    size={17}
                    className="
                      pointer-events-none
                      absolute left-3.5 top-1/2
                      -translate-y-1/2
                      text-slate-400
                      transition-colors duration-200
                      group-focus-within:text-indigo-500
                    "
                  />

                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="
                      w-full appearance-none
                      rounded-xl
                      border border-slate-200
                      bg-white
                      py-3 pl-10 pr-10
                      text-sm text-slate-800
                      outline-none
                      shadow-sm
                      transition-all duration-200
                      hover:border-indigo-200
                      hover:shadow
                      focus:border-indigo-400
                      focus:ring-4 focus:ring-indigo-50
                    "
                  >

                    <option value="Admin">
                      Admin
                    </option>

                    <option value="Manager">
                      Manager
                    </option>

                    <option value="Finincer">
                      Finincer
                    </option>

                    <option value="User">
                      User
                    </option>

                  </select>

                  <ChevronDown
                    size={17}
                    className="
                      pointer-events-none
                      absolute right-3.5 top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                </div>
              </div>

              {/* STATUS */}

              <div className="group">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Account Status
                </label>

                <div className="relative">

                  <CircleCheck
                    size={17}
                    className="
                      pointer-events-none
                      absolute left-3.5 top-1/2
                      -translate-y-1/2
                      text-slate-400
                      transition-colors duration-200
                      group-focus-within:text-emerald-500
                    "
                  />

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="
                      w-full appearance-none
                      rounded-xl
                      border border-slate-200
                      bg-white
                      py-3 pl-10 pr-10
                      text-sm text-slate-800
                      outline-none
                      shadow-sm
                      transition-all duration-200
                      hover:border-emerald-200
                      hover:shadow
                      focus:border-emerald-400
                      focus:ring-4 focus:ring-emerald-50
                    "
                  >

                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>

                  </select>

                  <ChevronDown
                    size={17}
                    className="
                      pointer-events-none
                      absolute right-3.5 top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                </div>
              </div>

            </div>
          </section>

          {/* =================================================
              EMAIL VERIFICATION
          ================================================= */}

          <VerificationCard
            type="email"
            verified={emailVerified}
            icon={<Mail size={19} />}
            title="Email Verification"
            description="Verify the user's email before saving."
            verifiedText="Email Verified"
          >

            <div className="flex flex-col gap-3 md:flex-row">

              <div className="group relative flex-1">

                <Mail
                  size={17}
                  className="
                    pointer-events-none
                    absolute left-3.5 top-1/2
                    -translate-y-1/2
                    text-slate-400
                    transition-colors duration-200
                    group-focus-within:text-blue-500
                  "
                />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}

                  /*
                   * IMPORTANT CHANGE:
                   *
                   * Add User:
                   *   verified email becomes locked.
                   *
                   * Edit User:
                   *   email always remains editable.
                   *
                   * If the email changes, handleChange()
                   * automatically removes verification.
                   */

                  disabled={!isEditing && emailVerified}

                  required
                  placeholder="user@example.com"
                  className={`
                    w-full rounded-xl
                    border
                    py-3 pl-10 pr-4
                    text-sm
                    outline-none
                    shadow-sm
                    transition-all duration-200
                    placeholder:text-slate-400
                    ${
                      emailVerified
                        ? "border-emerald-200 bg-emerald-50/50 text-emerald-800"
                        : "border-slate-200 bg-white text-slate-800 hover:border-blue-200 hover:shadow focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    }
                  `}
                />

              </div>

              {!emailVerified && (
                <button
                  type="button"
                  onClick={handleSendEmailCode}
                  className="
                    group
                    flex items-center justify-center gap-2
                    rounded-xl
                    bg-gradient-to-r from-blue-500 to-indigo-600
                    px-5 py-3
                    text-sm font-bold text-white
                    shadow-md shadow-blue-100
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:from-blue-600
                    hover:to-indigo-700
                    hover:shadow-lg hover:shadow-blue-200
                    active:scale-[0.97]
                  "
                >

                  <Mail
                    size={16}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />

                  Verify
                </button>
              )}

            </div>

            {/* EMAIL OTP */}

            {emailVerificationStarted &&
              !emailVerified && (
                <div
                  className="
                    mt-4
                    rounded-2xl
                    border border-blue-100
                    bg-gradient-to-br from-blue-50/80 to-indigo-50/50
                    p-4
                    shadow-sm
                  "
                >

                  <div className="flex flex-col gap-3 md:flex-row md:items-end">

                    <div className="flex-1">

                      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
                        Enter Email Verification Code
                      </label>

                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={emailOTP}
                        onChange={(e) =>
                          setEmailOTP(
                            e.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                        placeholder="Enter 6-digit code"
                        className="
                          w-full rounded-xl
                          border border-blue-100
                          bg-white
                          py-3 px-4
                          text-sm font-semibold
                          tracking-[0.3em]
                          text-slate-800
                          outline-none
                          shadow-sm
                          transition-all duration-200
                          hover:border-blue-200
                          focus:border-blue-400
                          focus:ring-4 focus:ring-blue-100
                        "
                      />

                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyEmailCode}
                      disabled={
                        !emailOTP ||
                        emailTimer <= 0
                      }
                      className="
                        flex items-center justify-center gap-2
                        rounded-xl
                        bg-gradient-to-r from-emerald-500 to-green-600
                        px-5 py-3
                        text-sm font-bold text-white
                        shadow-md shadow-emerald-100
                        transition-all duration-300
                        hover:-translate-y-0.5
                        hover:from-emerald-600
                        hover:to-green-700
                        hover:shadow-lg
                        active:scale-[0.97]
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                        disabled:hover:translate-y-0
                      "
                    >

                      <CheckCircle2 size={16} />

                      Verify Code

                    </button>

                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">

                    <div className="flex items-center gap-2">

                      <span
                        className={`
                          inline-flex items-center gap-1.5
                          rounded-full
                          px-3 py-1.5
                          font-bold
                          ${
                            emailTimer > 0
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                          }
                        `}
                      >

                        <span
                          className={`
                            h-1.5 w-1.5 rounded-full
                            ${
                              emailTimer > 0
                                ? "bg-blue-500 animate-pulse"
                                : "bg-red-500"
                            }
                          `}
                        />

                        {emailTimer > 0
                          ? `Code expires in ${formatTimer(
                              emailTimer
                            )}`
                          : "Verification code expired"}

                      </span>

                    </div>

                    {emailTimer <= 0 && (
                      <button
                        type="button"
                        onClick={
                          handleResendEmailCode
                        }
                        className="
                          group
                          flex items-center gap-1.5
                          rounded-lg
                          px-2 py-1
                          font-bold text-blue-600
                          transition-all duration-200
                          hover:bg-blue-100
                          hover:text-blue-700
                        "
                      >

                        <RefreshCw
                          size={14}
                          className="transition-transform duration-500 group-hover:rotate-180"
                        />

                        Resend Code

                      </button>
                    )}

                  </div>

                  {emailError && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">

                      <AlertCircle size={14} />

                      {emailError}

                    </div>
                  )}

                </div>
              )}

            {emailVerified && (
              <div
                className="
                  mt-3 flex items-center gap-2
                  rounded-xl
                  border border-emerald-100
                  bg-gradient-to-r from-emerald-50 to-green-50
                  px-4 py-3
                  text-sm font-semibold text-emerald-700
                "
              >

                <CheckCircle2 size={17} />

                Email address has been successfully verified.

              </div>
            )}

            {emailError &&
              !emailVerificationStarted && (
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-red-600">

                  <AlertCircle size={14} />

                  {emailError}

                </div>
              )}

          </VerificationCard>

          {/* =================================================
              CONTACT INFORMATION
          ================================================= */}

          <VerificationCard
            type="contact"
            verified={false}
            icon={<Phone size={19} />}
            title="Contact Information"
            description="Add the user's contact number for information only. No SMS OTP is sent."
            verifiedText="Contact Added"
          >

            <div className="group relative">

              <Phone
                size={17}
                className="
                  pointer-events-none
                  absolute left-3.5 top-1/2
                  -translate-y-1/2
                  text-slate-400
                  transition-colors duration-200
                  group-focus-within:text-violet-500
                "
              />

              <input
                type="tel"
                name="contactNo"
                value={form.contactNo}
                onChange={(e) => {
                  const rawValue = e.target.value;

                  /*
                   * IMPORTANT CONTACT NUMBER FIX
                   *
                   * Do not treat every number beginning with 91
                   * as the +91 country code.
                   *
                   * A valid Indian 10-digit number can itself
                   * begin with 91. The old logic removed "91"
                   * as soon as more than 10 digits were present,
                   * which caused the number to jump/change while
                   * typing or editing.
                   *
                   * Only remove the country code when the user
                   * actually types/pastes an explicit +91 prefix.
                   */
                  const hasExplicitCountryCode =
                    /^\s*\+\s*91(?:\s|[-.]|$)/.test(rawValue);

                  let digits = rawValue.replace(/\D/g, "");

                  if (
                    hasExplicitCountryCode &&
                    digits.startsWith("91")
                  ) {
                    digits = digits.slice(2);
                  }

                  /*
                   * Maximum 10 digits.
                   */
                  digits = digits.slice(0, 10);

                  const formattedValue =
                    digits.length > 0
                      ? `+91 ${digits}`
                      : "";

                  handleChange({
                    target: {
                      name: "contactNo",
                      value: formattedValue,
                    },
                  });
                }}
                required
                placeholder="Enter 10-digit contact number"
                className="
                  w-full rounded-xl
                  border border-slate-200
                  bg-white
                  py-3 pl-10 pr-4
                  text-sm text-slate-800
                  outline-none
                  shadow-sm
                  transition-all duration-200
                  placeholder:text-slate-400
                  hover:border-violet-200
                  hover:shadow
                  focus:border-violet-400
                  focus:ring-4 focus:ring-violet-50
                "
              />

            </div>

            {contactError && (
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-red-600">
                <AlertCircle size={14} />
                {contactError}
              </div>
            )}

            <div className="mt-3 flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-3 text-xs font-semibold text-violet-700">
              <Phone size={15} />
              This number is stored as contact information.
            </div>

          </VerificationCard>

          {/* =================================================
              PASSWORD
          ================================================= */}

          <section className="mb-8">

            <SectionHeading
              icon={<Lock size={17} />}
              title="Account Password"
              description={
                isEditing
                  ? "Leave blank if you do not want to change the password. Email must be verified before changing it."
                  : "Verify the user's email first, then create a secure password for this user."
              }
              iconClass="bg-amber-50 text-amber-600"
            />

            <div
              className="
                rounded-2xl
                border border-slate-200
                bg-gradient-to-br from-white to-amber-50/20
                p-5
                shadow-sm
                transition-all duration-300
                hover:border-amber-200
                hover:shadow-md
              "
            >

              <div className="group relative">

                <Lock
                  size={17}
                  className="
                    pointer-events-none
                    absolute left-3.5 top-1/2
                    -translate-y-1/2
                    text-slate-400
                    transition-colors duration-200
                    group-focus-within:text-amber-500
                  "
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={!emailVerified}
                  placeholder={
                    isEditing
                      ? "Enter new password or leave blank"
                      : "Create password"
                  }
                  className="
                    w-full rounded-xl
                    border border-slate-200
                    bg-white
                    py-3 pl-10 pr-12
                    text-sm text-slate-800
                    outline-none
                    shadow-sm
                    transition-all duration-200
                    placeholder:text-slate-400
                    hover:border-amber-200
                    hover:shadow
                    focus:border-amber-400
                    focus:ring-4 focus:ring-amber-50
                    disabled:cursor-not-allowed
                    disabled:bg-slate-50
                    disabled:opacity-60
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  className="
                    absolute right-2.5 top-1/2
                    -translate-y-1/2
                    rounded-lg
                    p-1.5
                    text-slate-400
                    transition-all duration-200
                    hover:bg-amber-50
                    hover:text-amber-600
                  "
                >

                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

              {/* PASSWORD RULES */}

              <div className="mt-4 grid gap-2 sm:grid-cols-2">

                <PasswordRule
                  valid={passwordRules.length}
                  text="At least 6 characters"
                />

                <PasswordRule
                  valid={passwordRules.capital}
                  text="One capital letter"
                />

                <PasswordRule
                  valid={passwordRules.number}
                  text="One number"
                />

                <PasswordRule
                  valid={passwordRules.special}
                  text="One special character"
                />

              </div>

            </div>
          </section>

          {/* =================================================
              FORM ACTIONS
          ================================================= */}

          <div
            className="
              flex flex-col-reverse gap-3
              border-t border-slate-100
              pt-6
              sm:flex-row sm:justify-end
            "
          >

            <button
              type="button"
              onClick={handleCancel}
              className="
                group
                rounded-xl
                border border-slate-200
                bg-white
                px-5 py-3
                text-sm font-bold text-slate-600
                shadow-sm
                transition-all duration-300
                hover:-translate-y-0.5
                hover:border-slate-300
                hover:bg-slate-50
                hover:text-slate-800
                hover:shadow-md
                active:scale-[0.98]
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              className="
                group
                flex items-center justify-center gap-2
                rounded-xl
                bg-gradient-to-r
                from-blue-600
                via-indigo-600
                to-violet-600
                px-6 py-3
                text-sm font-bold text-white
                shadow-lg shadow-blue-100
                transition-all duration-300
                hover:-translate-y-0.5
                hover:from-blue-700
                hover:via-indigo-700
                hover:to-violet-700
                hover:shadow-xl hover:shadow-indigo-200
                active:scale-[0.97]
              "
            >

              <Save
                size={17}
                className="
                  transition-transform duration-300
                  group-hover:scale-110
                "
              />

              {isEditing
                ? "Update User"
                : "Save User"}

            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  icon,
  title,
  description,
  iconClass = "bg-slate-50 text-slate-600",
}) {
  return (
    <div className="mb-4 flex items-start gap-3">

      <div
        className={`
          flex h-10 w-10 shrink-0
          items-center justify-center
          rounded-xl
          ${iconClass}
          shadow-sm
          transition-transform duration-300
          hover:scale-105
        `}
      >
        {icon}
      </div>

      <div>

        <h3 className="font-bold text-slate-800">
          {title}
        </h3>

        <p className="mt-0.5 text-xs leading-5 text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   VERIFICATION CARD
========================================================= */

function VerificationCard({
  type,
  verified,
  icon,
  title,
  description,
  verifiedText,
  children,
}) {
  const isEmail = type === "email";

  return (
    <section className="mb-8">

      <div
        className={`
          group
          rounded-2xl
          border
          bg-white
          p-5
          shadow-sm
          transition-all duration-300
          hover:-translate-y-0.5
          hover:shadow-lg
          ${
            verified
              ? "border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30"
              : isEmail
                ? "border-blue-100 hover:border-blue-200"
                : "border-violet-100 hover:border-violet-200"
          }
        `}
      >

        {/* CARD HEADER */}

        <div className="mb-5 flex items-center justify-between gap-3">

          <div className="flex items-center gap-3">

            <div
              className={`
                flex h-11 w-11 shrink-0
                items-center justify-center
                rounded-xl
                shadow-sm
                transition-transform duration-300
                group-hover:scale-105
                ${
                  verified
                    ? "bg-emerald-100 text-emerald-600"
                    : isEmail
                      ? "bg-blue-50 text-blue-600"
                      : "bg-violet-50 text-violet-600"
                }
              `}
            >
              {icon}
            </div>

            <div>

              <h3 className="font-bold text-slate-800">
                {title}
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                {description}
              </p>

            </div>

          </div>

          {verified && (
            <span
              className="
                flex shrink-0
                items-center gap-1.5
                rounded-full
                border border-emerald-200
                bg-emerald-50
                px-3 py-1.5
                text-xs font-bold
                text-emerald-600
                shadow-sm
              "
            >

              <CheckCircle2 size={14} />

              <span className="hidden sm:inline">
                {verifiedText}
              </span>

              <span className="sm:hidden">
                Verified
              </span>

            </span>
          )}

        </div>

        {children}

      </div>
    </section>
  );
}

/* =========================================================
   PASSWORD RULE COMPONENT
========================================================= */

function PasswordRule({ valid, text }) {
  return (
    <div
      className={`
        flex items-center gap-2
        rounded-xl
        border
        px-3 py-2.5
        text-xs font-semibold
        transition-all duration-200
        ${
          valid
            ? "border-emerald-100 bg-emerald-50 text-emerald-700 shadow-sm"
            : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white"
        }
      `}
    >

      {valid ? (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">

          <CheckCircle2 size={13} />

        </span>
      ) : (
        <span className="h-5 w-5 rounded-full border-2 border-slate-300 bg-white" />
      )}

      {text}

    </div>
  );
}
