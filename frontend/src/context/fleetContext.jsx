// import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

// const FleetContext = createContext(null);
// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

// export const defaultDocumentTypes = ["Registration Certificate","Insurance","PUC Certificate","Fitness Certificate","State Permit","National Permit","Road Tax","Other"];
// export const defaultVehicleTypes = ["Truck","Trailer","Tanker","Pickup","Bus","Car","Van","Other"];
// export const defaultVehicleStatuses = ["Active","Inactive","Maintenance","Sold"];

// export const defaultRolePermissions = {
//   Admin:{view:true,add:true,edit:true,delete:true,paid:true,settings:true,users:true,password:true},
//   Manager:{view:true,add:true,edit:false,delete:false,paid:false,settings:false,users:false,password:false},
//   Finance:{view:true,add:false,edit:false,delete:false,paid:true,settings:false,users:false,password:false},
//   User:{view:true,add:true,edit:false,delete:false,paid:false,settings:false,users:false,password:false},
// };

// export function normalizeRolePermissions(source={}) {
//   const out={};
//   for(const role of Object.keys(defaultRolePermissions)) out[role]={...defaultRolePermissions[role],...(source?.[role]||{})};
//   out.Admin={...out.Admin,view:true,add:true,edit:true,delete:true,paid:true,settings:true,users:true,password:true};
//   return out;
// }

// export function parseDate(value){
//   if(!value) return null;
//   if(value instanceof Date) return isNaN(value) ? null : value;
//   const s=String(value).trim();
//   const d=new Date(s);
//   if(!isNaN(d)) return d;
//   const m=s.match(/^(\d{1,2})[ -](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[ -](\d{4})$/i);
//   if(m) return new Date(`${m[2]} ${m[1]}, ${m[3]}`);
//   const n=s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
//   if(n) return new Date(Number(n[3]),Number(n[2])-1,Number(n[1]));
//   return null;
// }
// export function formatDate(value){
//   const d=parseDate(value); if(!d) return value||"—";
//   return d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
// }
// export function getDaysLeft(value){
//   const d=parseDate(value); if(!d) return null;
//   const today=new Date(); today.setHours(0,0,0,0); d.setHours(0,0,0,0);
//   return Math.ceil((d-today)/86400000);
// }
// export function getExpiryStatus(value, reminderDays=10){
//   const days=getDaysLeft(value); if(days===null) return "Unknown";
//   if(days<0) return "Expired"; if(days<=Number(reminderDays)) return "Expiring Soon"; return "Active";
// }

// function token(){ return localStorage.getItem("fleetdoc_access_token"); }
// async function api(path, options={}){
//   const headers={"Content-Type":"application/json",...(options.headers||{})};
//   const t=token(); if(t) headers.Authorization=`Bearer ${t}`;
//   const res=await fetch(`${API_BASE}${path}`,{...options,headers});
//   const text=await res.text(); let data={}; try{data=text?JSON.parse(text):{}}catch{data={detail:text}};
//   if(!res.ok && res.status===401 && localStorage.getItem("fleetdoc_refresh_token") && !path.startsWith("/auth/")){
//     try{
//       const rr=await fetch(`${API_BASE}/auth/refresh`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refresh_token:localStorage.getItem("fleetdoc_refresh_token")})});
//       if(rr.ok){const rt=await rr.json();localStorage.setItem("fleetdoc_access_token",rt.access_token);return api(path,options);}
//     }catch{}
//   }
//   if(!res.ok) throw new Error(data.detail||data.message||`Request failed (${res.status})`);
//   return data;
// }
// async function list(path){ return api(path); }

// const defaultSettings={
//   companyName:"STEELS AND CARRIERS PRIVATE LIMITED",portalName:"TRANZOL",email:"",phone:"",
//   dateFormat:"DD MMM YYYY",currency:"Indian Rupee (₹)",timezone:"Asia/Kolkata",reminderDays:10,
//   dashboardNotifications:true,emailNotifications:true,smsNotifications:false,whatsappNotifications:false,
//   documentAlerts:true,emiAlerts:true,challanAlerts:true,roadTaxAlerts:true,inAppNotifications:true,pushNotifications:true,
//   tripReminders:true,paymentMode:"Bank Transfer",defaultPaymentMode:"Bank Transfer",autoGenerateEMIs:true,
//   challanAutoSync:false,syncFrequency:"30",challanSyncFrequency:"Daily",sessionTimeout:60,
//   theme:"light",animationsEnabled:true,compactTables:false,strongPasswordRequired:true,
//   rolePermissions:normalizeRolePermissions()
// };

// export function FleetProvider({children}){
//   const [vehicles,setVehicles]=useState([]);
//   const [documents,setDocuments]=useState([]);
//   const [emis,setEmis]=useState([]);
//   const [loans,setLoans]=useState([]);
//   const [challans,setChallans]=useState([]);
//   const [roadTaxes,setRoadTaxes]=useState([]);
//   const [users,setUsers]=useState([]);
//   const [settings,setSettings]=useState(defaultSettings);
//   const [dismissedNotifications,setDismissedNotifications]=useState([]);
//   const [auditLogs,setAuditLogs]=useState([]);
//   const [toast,setToast]=useState(null);

//   const notify=useCallback((message,type="success")=>{
//     setToast({message,type}); window.clearTimeout(window.__fleetToast);
//     window.__fleetToast=window.setTimeout(()=>setToast(null),3500);
//   },[]);

//   const load=useCallback(async()=>{
//     if(!token()) return;
//     try{
//       const [v,d,e,l,c,r,u,s]=await Promise.all([
//         list("/vehicles"),list("/documents"),list("/emis"),list("/loans"),list("/challans"),list("/road-taxes"),list("/users"),api("/settings/global")
//       ]);
//       setVehicles(v);setDocuments(d);setEmis(e);setLoans(l);setChallans(c);setRoadTaxes(r);setUsers(u);setSettings({...defaultSettings,...s,rolePermissions:normalizeRolePermissions(s?.rolePermissions)});
//     }catch(err){ if(!String(err.message).includes("token")) console.warn("FleetDoc API:",err.message); }
//   },[]);

//   useEffect(()=>{ load(); },[load]);

//   const mutate=useCallback(async(method,path,payload)=>{
//     try { const data=await api(path,{method,body:payload===undefined?undefined:JSON.stringify(payload)}); await load(); return data; }
//     catch(err){ notify(err.message,"error"); throw err; }
//   },[load,notify]);

//   const addVehicle=(x)=>mutate("POST","/vehicles",x);
//   const updateVehicle=(id,x)=>mutate("PATCH",`/vehicles/${id}`,x);
//   const deleteVehicle=(id)=>mutate("DELETE",`/vehicles/${id}`);
//   const addDocument=(x)=>mutate("POST","/documents",x);
//   const updateDocument=(id,x)=>mutate("PATCH",`/documents/${id}`,x);
//   const deleteDocument=(id)=>mutate("DELETE",`/documents/${id}`);
//   const addLoan=(x)=>mutate("POST","/loans",x);
//   const updateLoan=(id,x)=>mutate("PATCH",`/loans/${id}`,x);
//   const deleteLoan=(id)=>mutate("DELETE",`/loans/${id}`);
//   const addEMI=(x)=>mutate("POST","/emis",x);
//   const updateEMI=(id,x)=>mutate("PATCH",`/emis/${id}`,x);
//   const markEMIPaid=(id)=>mutate("POST",`/emis/${id}/pay`,{});
//   const deleteEMI=(id)=>mutate("DELETE",`/emis/${id}`);
//   const addChallan=(x)=>mutate("POST","/challans",x);
//   const updateChallan=(id,x)=>mutate("PATCH",`/challans/${id}`,x);
//   const deleteChallan=(id)=>mutate("DELETE",`/challans/${id}`);
//   const addRoadTax=(x)=>mutate("POST","/road-taxes",x);
//   const updateRoadTax=(id,x)=>mutate("PATCH",`/road-taxes/${id}`,x);
//   const deleteRoadTax=(id)=>mutate("DELETE",`/road-taxes/${id}`);
//   const addUser=async(x)=>mutate("POST","/users",x);
//   const updateUser=(id,x)=>mutate("PATCH",`/users/${id}`,x);
//   const deleteUser=(id)=>mutate("DELETE",`/users/${id}`);

//   const updateSettings=async(patch)=>{
//     const next={...settings,...patch};
//     try{ const saved=await api("/settings/global",{method:"PUT",body:JSON.stringify(next)}); setSettings(saved); notify("Settings saved successfully."); return saved; }
//     catch(err){notify(err.message,"error");return false;}
//   };
//   const getSetting=(key,def=null)=>settings?.[key]??def;
//   const setSetting=(key,value)=>updateSettings({[key]:value});
//   const resetSettings=()=>updateSettings(defaultSettings);

//   const getCurrentUser=()=>{
//     const id=Number(localStorage.getItem("fleetdoc_user_id")); return users.find(x=>Number(x.id)===id)||null;
//   };
//   const getCurrentUserRole=()=>localStorage.getItem("fleetdoc_user_role")||getCurrentUser()?.role||"User";
//   const getRolePermissions=(role=getCurrentUserRole())=>settings?.rolePermissions?.[role]||defaultRolePermissions[role]||defaultRolePermissions.User;
//   const hasPermission=(action)=>getCurrentUserRole()==="Admin"||Boolean(getRolePermissions()[action]);
//   const isCurrentUserAdmin=()=>getCurrentUserRole()==="Admin";
//   const isVehicleNumberExists=(number,excludeId)=>vehicles.some(v=>v.number?.replace(/\s/g,"").toLowerCase()===number?.replace(/\s/g,"").toLowerCase()&&String(v.id)!==String(excludeId));

//   const dismissNotification=(id)=>setDismissedNotifications(x=>[...new Set([...x,id])]);
//   const restoreNotification=(id)=>setDismissedNotifications(x=>x.filter(v=>String(v)!==String(id)));
//   const clearDismissedNotifications=()=>setDismissedNotifications([]);
//   const clearAuditLogs=()=>setAuditLogs([]);
//   const addAuditLog=(x)=>setAuditLogs(v=>[...v,{...x,id:Date.now(),createdAt:new Date().toISOString()}]);
//   const resetData=()=>load();
//   const exportSettings=()=>JSON.stringify({settings,exportedAt:new Date().toISOString()},null,2);
//   const importSettings=(input)=>{try{const x=typeof input==="string"?JSON.parse(input):input;updateSettings(x.settings||x);return true}catch{return false}};
//   const exportFleetData=()=>JSON.stringify({vehicles,documents,emis,loans,challans,roadTaxes,users,settings,exportedAt:new Date().toISOString()},null,2);
//   const importFleetData=()=>{notify("FleetDoc cloud data is protected by the backend. Use database backups for full restore.","warning");return false};
//   const deleteExpenseRecord=(source,id)=>{const map={roadTax:deleteRoadTax,document:deleteDocument,emi:deleteEMI,challan:deleteChallan};return map[source]?.(id)};
//   const login=async(email,password,remember)=>{
//     const r=await api("/auth/login",{method:"POST",body:JSON.stringify({email,password,remember})});
//     localStorage.setItem("fleetdoc_access_token",r.access_token);localStorage.setItem("fleetdoc_refresh_token",r.refresh_token);
//     localStorage.setItem("fleetdoc_logged_in","true");localStorage.setItem("fleetdoc_user_id",String(r.user.id));localStorage.setItem("fleetdoc_user_email",r.user.email);localStorage.setItem("fleetdoc_user_name",r.user.name);localStorage.setItem("fleetdoc_user_role",r.user.role);
//     if(remember)localStorage.setItem("fleetdoc_email",email);else localStorage.removeItem("fleetdoc_email");
//     await load(); return r.user;
//   };
//   const logout=()=>{["fleetdoc_access_token","fleetdoc_refresh_token","fleetdoc_logged_in","fleetdoc_user_id","fleetdoc_user_email","fleetdoc_user_name","fleetdoc_user_role"].forEach(k=>localStorage.removeItem(k));window.location.replace("/login")};
//   const forgotPasswordRequest=(email)=>api("/auth/forgot-password/request",{method:"POST",body:JSON.stringify({email})});
//   const resetPassword=(email,otp,newPassword)=>api("/auth/forgot-password/reset",{method:"POST",body:JSON.stringify({email,otp,new_password:newPassword})});
//   const sendUserVerification=(id,channel,purpose)=>api(`/users/${id}/verification/send`,{method:"POST",body:JSON.stringify({target:channel==="email"?"email":"phone",channel:channel==="phone"?"sms":"email",purpose})});
//   const verifyUserVerification=(id,target,otp,purpose)=>api(`/users/${id}/verification/verify`,{method:"POST",body:JSON.stringify({target,otp,purpose})});
//   const uploadFile=async(file)=>{const fd=new FormData();fd.append("file",file);const res=await fetch(`${API_BASE}/files/upload`,{method:"POST",headers:token()?{Authorization:`Bearer ${token()}`}:{},body:fd});if(!res.ok)throw new Error((await res.json()).detail||"Upload failed");return res.json()};

//   const value=useMemo(()=>({vehicles,documents,emis,loans,challans,roadTaxes,users,settings,dismissedNotifications,auditLogs,toast,notify,
//     addVehicle,updateVehicle,deleteVehicle,isVehicleNumberExists,addDocument,updateDocument,deleteDocument,addLoan,updateLoan,deleteLoan,
//     addEMI,updateEMI,markEMIPaid,deleteEMI,addChallan,updateChallan,deleteChallan,addRoadTax,updateRoadTax,deleteRoadTax,deleteExpenseRecord,
//     addUser,updateUser,deleteUser,getCurrentUser,getCurrentUserRole,getRolePermissions,hasPermission,isCurrentUserAdmin,updateSettings,getSetting,setSetting,
//     resetSettings,exportSettings,importSettings,exportFleetData,importFleetData,addAuditLog,clearAuditLogs,dismissNotification,restoreNotification,clearDismissedNotifications,
//     resetData,login,logout,forgotPasswordRequest,resetPassword,sendUserVerification,verifyUserVerification,uploadFile}),[vehicles,documents,emis,loans,challans,roadTaxes,users,settings,dismissedNotifications,auditLogs,toast,notify,load]);
//   return <FleetContext.Provider value={value}>{children}{toast&&<div className="fixed bottom-5 right-5 z-[9999]"><div className={`rounded-xl border bg-white px-5 py-3 shadow-xl ${toast.type==="error"?"border-red-200 text-red-700":toast.type==="warning"?"border-amber-200 text-amber-700":"border-emerald-200 text-emerald-700"}`}><p className="text-sm font-medium">{toast.message}</p></div></div>}</FleetContext.Provider>;
// }
// export function useFleet(){const c=useContext(FleetContext);if(!c)throw new Error("useFleet must be used inside FleetProvider");return c}
// export default FleetContext;






import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

const FleetContext = createContext(null);

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000/api/v1";

/* =========================================================
   DEFAULT DATA
========================================================= */

export const defaultDocumentTypes = [
  "Registration Certificate",
  "Insurance",
  "PUC Certificate",
  "Fitness Certificate",
  "State Permit",
  "National Permit",
  "Road Tax",
  "Other",
];

export const defaultVehicleTypes = [
  "Truck",
  "Trailer",
  "Tanker",
  "Pickup",
  "Bus",
  "Car",
  "Van",
  "Other",
];

export const defaultVehicleStatuses = [
  "Active",
  "Inactive",
  "Maintenance",
  "Sold",
];

/* =========================================================
   ROLE PERMISSIONS
========================================================= */

export const defaultRolePermissions = {
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
    edit: false,
    delete: false,
    paid: false,
    settings: false,
    users: false,
    password: false,
  },

  Finance: {
    view: true,
    add: false,
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

export function normalizeRolePermissions(source = {}) {
  const out = {};

  for (const role of Object.keys(defaultRolePermissions)) {
    out[role] = {
      ...defaultRolePermissions[role],
      ...(source?.[role] || {}),
    };
  }

  /*
   * Admin always keeps complete access.
   */
  out.Admin = {
    ...out.Admin,
    view: true,
    add: true,
    edit: true,
    delete: true,
    paid: true,
    settings: true,
    users: true,
    password: true,
  };

  return out;
}

/* =========================================================
   DATE HELPERS
========================================================= */

export function parseDate(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return isNaN(value) ? null : value;
  }

  const s = String(value).trim();

  const d = new Date(s);

  if (!isNaN(d)) {
    return d;
  }

  const m = s.match(
    /^(\d{1,2})[ -](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[ -](\d{4})$/i
  );

  if (m) {
    return new Date(`${m[2]} ${m[1]}, ${m[3]}`);
  }

  const n = s.match(
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/
  );

  if (n) {
    return new Date(
      Number(n[3]),
      Number(n[2]) - 1,
      Number(n[1])
    );
  }

  return null;
}

export function formatDate(value) {
  const d = parseDate(value);

  if (!d) return value || "—";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getDaysLeft(value) {
  const d = parseDate(value);

  if (!d) return null;

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);

  return Math.ceil(
    (d - today) / 86400000
  );
}

export function getExpiryStatus(
  value,
  reminderDays = 10
) {
  const days = getDaysLeft(value);

  if (days === null) return "Unknown";

  if (days < 0) return "Expired";

  if (days <= Number(reminderDays)) {
    return "Expiring Soon";
  }

  return "Active";
}

/* =========================================================
   TOKEN
========================================================= */

function token() {
  return localStorage.getItem(
    "fleetdoc_access_token"
  );
}

/* =========================================================
   API ERROR FORMATTER
========================================================= */

function formatApiError(data, status) {
  const fallback =
    `Request failed (${status})`;

  if (!data) {
    return fallback;
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data.detail)) {
    const messages = data.detail
      .map((item) => {
        if (!item) return "";

        const location = Array.isArray(item.loc)
          ? item.loc.join(" → ")
          : "";

        const message =
          item.msg ||
          item.message ||
          "Validation error";

        return location
          ? `${location}: ${message}`
          : message;
      })
      .filter(Boolean);

    if (messages.length) {
      return messages.join("\n");
    }
  }

  if (
    data.detail &&
    typeof data.detail === "object"
  ) {
    if (
      typeof data.detail.message ===
      "string"
    ) {
      return data.detail.message;
    }

    if (
      typeof data.detail.msg ===
      "string"
    ) {
      return data.detail.msg;
    }

    try {
      return JSON.stringify(
        data.detail
      );
    } catch {
      return fallback;
    }
  }

  if (
    typeof data.message ===
    "string"
  ) {
    return data.message;
  }

  if (
    typeof data.error ===
    "string"
  ) {
    return data.error;
  }

  return fallback;
}

/* =========================================================
   API HELPER
========================================================= */

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const accessToken = token();

  if (accessToken) {
    headers.Authorization =
      `Bearer ${accessToken}`;
  }

  let res;

  try {
    res = await fetch(
      `${API_BASE}${path}`,
      {
        ...options,
        headers,
      }
    );
  } catch (networkError) {
    console.error(
      "FleetDoc API network error:",
      networkError
    );

    throw new Error(
      "Failed to connect to FleetDoc backend. Please make sure the FastAPI server is running."
    );
  }

  const text = await res.text();

  let data = {};

  try {
    data = text
      ? JSON.parse(text)
      : {};
  } catch {
    data = {
      detail: text || "",
    };
  }

  /* =======================================================
     ACCESS TOKEN EXPIRED
  ======================================================= */

  if (
    !res.ok &&
    res.status === 401 &&
    localStorage.getItem(
      "fleetdoc_refresh_token"
    ) &&
    !path.startsWith("/auth/")
  ) {
    try {
      const refreshResponse =
        await fetch(
          `${API_BASE}/auth/refresh`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              refresh_token:
                localStorage.getItem(
                  "fleetdoc_refresh_token"
                ),
            }),
          }
        );

      if (refreshResponse.ok) {
        const refreshed =
          await refreshResponse.json();

        if (
          refreshed?.access_token
        ) {
          localStorage.setItem(
            "fleetdoc_access_token",
            refreshed.access_token
          );

          return api(
            path,
            options
          );
        }
      }
    } catch (refreshError) {
      console.warn(
        "FleetDoc token refresh failed:",
        refreshError
      );
    }
  }

  /* =======================================================
     API ERROR
  ======================================================= */

  if (!res.ok) {
    const error = new Error(
      formatApiError(
        data,
        res.status
      )
    );
    error.status = res.status;
    error.detail = data?.detail;
    error.data = data;
    throw error;
  }

  return data;
}

async function list(path) {
  return api(path);
}

/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const defaultSettings = {
  companyName:
    "STEELS AND CARRIERS PRIVATE LIMITED",

  portalName: "TRANZOL",

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

  sessionTimeout: 60,

  theme: "light",
  animationsEnabled: true,
  compactTables: false,

  strongPasswordRequired: true,

  rolePermissions:
    normalizeRolePermissions(),
};

/* =========================================================
   PROVIDER
========================================================= */

export function FleetProvider({
  children,
}) {
  const [vehicles, setVehicles] =
    useState([]);

  const [documents, setDocuments] =
    useState([]);

  const [emis, setEmis] =
    useState([]);

  const [loans, setLoans] =
    useState([]);

  const [challans, setChallans] =
    useState([]);

  const [roadTaxes, setRoadTaxes] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [settings, setSettings] =
    useState(defaultSettings);

  const [
    dismissedNotifications,
    setDismissedNotifications,
  ] = useState([]);

  const [auditLogs, setAuditLogs] =
    useState([]);

  const [toast, setToast] =
    useState(null);

  /* =======================================================
     TOAST
  ======================================================= */

  const notify = useCallback(
    (
      message,
      type = "success"
    ) => {
      setToast({
        message,
        type,
      });

      window.clearTimeout(
        window.__fleetToast
      );

      window.__fleetToast =
        window.setTimeout(() => {
          setToast(null);
        }, 3500);
    },
    []
  );

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const load = useCallback(
    async () => {
      if (!token()) return;

      try {
        const [
          v,
          d,
          e,
          l,
          c,
          r,
          u,
          s,
          a,
        ] = await Promise.all([
          list("/vehicles"),
          list("/documents"),
          list("/emis"),
          list("/loans"),
          list("/challans"),
          list("/road-taxes"),
          list("/users"),
          api("/settings/global"),
          list("/audit-logs").catch(() => []),
        ]);

        setVehicles(v || []);
        setDocuments(d || []);
        setEmis(e || []);
        setLoans(l || []);
        setChallans(c || []);
        setRoadTaxes(r || []);
        setUsers(u || []);
        const normalizedAuditLogs = (Array.isArray(a) ? a : []).map((log) => ({
          ...log,
          user: log.user || log.userName || log.userEmail || "System",
          module: log.module || log.entity || "System",
          timestamp: log.timestamp || log.createdAt || log.time || null,
          time: log.time || log.createdAt || log.timestamp || null,
          action: log.action || log.actionKey || "Activity",
        }));
        setAuditLogs(normalizedAuditLogs);

        setSettings({
          ...defaultSettings,
          ...(s || {}),
          rolePermissions:
            normalizeRolePermissions(
              s?.rolePermissions
            ),
        });
      } catch (err) {
        if (
          !String(
            err?.message || ""
          ).includes("token")
        ) {
          console.warn(
            "FleetDoc API:",
            err?.message ||
              err
          );
        }
      }
    },
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  /* =======================================================
     GENERIC MUTATION
     
     IMPORTANT:
     Do NOT put useCallback inside this function.
  ======================================================= */

  const mutate = useCallback(
    async (
      method,
      path,
      payload
    ) => {
      try {
        const data =
          await api(path, {
            method,
            body:
              payload === undefined
                ? undefined
                : JSON.stringify(
                    payload
                  ),
          });

        /*
         * Database operation succeeded.
         *
         * Refreshing the dashboard is a
         * separate operation. If refresh
         * fails, don't report the original
         * save as failed.
         */
        try {
          await load();
        } catch (
          refreshError
        ) {
          console.warn(
            "FleetDoc: Record saved, but data refresh failed:",
            refreshError
          );
        }

        return data;
      } catch (err) {
        notify(
          err?.message ||
            "Unable to save record.",
          "error"
        );

        throw err;
      }
    },
    [load, notify]
  );

  /* =======================================================
     VEHICLES
  ======================================================= */

  const addVehicle = (x) =>
    mutate(
      "POST",
      "/vehicles",
      x
    );

  const updateVehicle = (
    id,
    x
  ) =>
    mutate(
      "PATCH",
      `/vehicles/${id}`,
      x
    );

  const deleteVehicle = (
    id
  ) =>
    mutate(
      "DELETE",
      `/vehicles/${id}`
    );

  /* =======================================================
     DOCUMENTS
  ======================================================= */

  const addDocument = (x) =>
    mutate(
      "POST",
      "/documents",
      x
    );

  const updateDocument = (
    id,
    x
  ) =>
    mutate(
      "PATCH",
      `/documents/${id}`,
      x
    );

  const deleteDocument = (
    id
  ) =>
    mutate(
      "DELETE",
      `/documents/${id}`
    );

  /* =======================================================
     LOANS
  ======================================================= */

  const addLoan = (x) =>
    mutate(
      "POST",
      "/loans",
      x
    );

  const updateLoan = (
    id,
    x
  ) =>
    mutate(
      "PATCH",
      `/loans/${id}`,
      x
    );

  const deleteLoan = (
    id
  ) =>
    mutate(
      "DELETE",
      `/loans/${id}`
    );

  /* =======================================================
     EMI
  ======================================================= */

  const addEMI = (x) =>
    mutate(
      "POST",
      "/emis",
      x
    );

  const updateEMI = (
    id,
    x
  ) =>
    mutate(
      "PATCH",
      `/emis/${id}`,
      x
    );

  const markEMIPaid = (
    id
  ) =>
    mutate(
      "POST",
      `/emis/${id}/pay`,
      {}
    );

  const deleteEMI = (
    id
  ) =>
    mutate(
      "DELETE",
      `/emis/${id}`
    );

  /* =======================================================
     CHALLANS
  ======================================================= */

  const addChallan = (x) =>
    mutate(
      "POST",
      "/challans",
      x
    );

  const updateChallan = (
    id,
    x
  ) =>
    mutate(
      "PATCH",
      `/challans/${id}`,
      x
    );

  const deleteChallan = (
    id
  ) =>
    mutate(
      "DELETE",
      `/challans/${id}`
    );

  /* =======================================================
     ROAD TAX
  ======================================================= */

  const addRoadTax = (x) =>
    mutate(
      "POST",
      "/road-taxes",
      x
    );

  const updateRoadTax = (
    id,
    x
  ) =>
    mutate(
      "PATCH",
      `/road-taxes/${id}`,
      x
    );

  const deleteRoadTax = (
    id
  ) =>
    mutate(
      "DELETE",
      `/road-taxes/${id}`
    );

  /* =======================================================
     USERS
  ======================================================= */

  const addUser = async (x) =>
    mutate(
      "POST",
      "/users",
      x
    );

  const updateUser = async (
    id,
    x
  ) =>
    mutate(
      "PATCH",
      `/users/${id}`,
      x
    );

  const deleteUser = async (
    id
  ) =>
    mutate(
      "DELETE",
      `/users/${id}`
    );

  /* =======================================================
     SETTINGS
  ======================================================= */

  const updateSettings =
    async (patch) => {
      const next = {
        ...settings,
        ...patch,
      };

      try {
        const saved =
          await api(
            "/settings/global",
            {
              method: "PUT",
              body: JSON.stringify(
                next
              ),
            }
          );

        setSettings({
          ...defaultSettings,
          ...saved,
          rolePermissions:
            normalizeRolePermissions(
              saved?.rolePermissions
            ),
        });

        notify(
          "Settings saved successfully."
        );

        return saved;
      } catch (err) {
        notify(
          err?.message ||
            "Unable to save settings.",
          "error"
        );

        return false;
      }
    };

  const getSetting = (
    key,
    def = null
  ) =>
    settings?.[key] ?? def;

  const setSetting = (
    key,
    value
  ) =>
    updateSettings({
      [key]: value,
    });

  const resetSettings = () =>
    updateSettings(
      defaultSettings
    );

  /* =======================================================
     CURRENT USER
  ======================================================= */

  const getCurrentUser =
    () => {
      const currentId =
        Number(
          localStorage.getItem(
            "fleetdoc_user_id"
          )
        );

      return (
        users.find(
          (x) =>
            Number(x.id) ===
            currentId
        ) || null
      );
    };

  const getCurrentUserRole =
    () =>
      localStorage.getItem(
        "fleetdoc_user_role"
      ) ||
      getCurrentUser()?.role ||
      "User";

  const getRolePermissions = (
    role = getCurrentUserRole()
  ) =>
    settings?.rolePermissions?.[
      role
    ] ||
    defaultRolePermissions[
      role
    ] ||
    defaultRolePermissions.User;

  const hasPermission = (
    action
  ) =>
    getCurrentUserRole() ===
      "Admin" ||
    Boolean(
      getRolePermissions()[
        action
      ]
    );

  const isCurrentUserAdmin =
    () =>
      getCurrentUserRole() ===
      "Admin";

  /* =======================================================
     VEHICLE NUMBER CHECK
  ======================================================= */

  const isVehicleNumberExists = (
    number,
    excludeId
  ) => {
    return vehicles.some(
      (v) =>
        v.number
          ?.replace(/\s/g, "")
          .toLowerCase() ===
          number
            ?.replace(/\s/g, "")
            .toLowerCase() &&
        String(v.id) !==
          String(excludeId)
    );
  };

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const dismissNotification = (
    id
  ) =>
    setDismissedNotifications(
      (x) => [
        ...new Set([
          ...x,
          id,
        ]),
      ]
    );

  const restoreNotification = (
    id
  ) =>
    setDismissedNotifications(
      (x) =>
        x.filter(
          (v) =>
            String(v) !==
            String(id)
        )
    );

  const clearDismissedNotifications =
    () =>
      setDismissedNotifications(
        []
      );

  /* =======================================================
     AUDIT
  ======================================================= */

  const clearAuditLogs = async () => {
    try {
      await api("/audit-logs", { method: "DELETE" });
      setAuditLogs([]);
      notify("Audit logs cleared successfully.");
      return true;
    } catch (err) {
      notify(err.message || "Unable to clear audit logs.", "error");
      return false;
    }
  };

  const addAuditLog = async (x) => {
    // Audit records are generated by the backend for security and data
    // mutations. Keep this compatibility helper so older pages do not fail.
    // It refreshes the persisted audit list instead of writing fake local rows.
    try {
      const logs = await api("/audit-logs");
      setAuditLogs(
        (Array.isArray(logs) ? logs : []).map((log) => ({
          ...log,
          user: log.user || log.userName || log.userEmail || "System",
          module: log.module || log.entity || "System",
          timestamp: log.timestamp || log.createdAt || log.time || null,
          time: log.time || log.createdAt || log.timestamp || null,
          action: log.action || log.actionKey || "Activity",
        }))
      );
    } catch (err) {
      console.debug("Audit log refresh skipped:", err?.message || err);
    }
  };

  const changePassword = async (currentPassword, newPassword) =>
    api("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

  const verifyLogin2FA = async (challengeId, otp, remember = false) => {
    const r = await api("/auth/login/2fa/verify", {
      method: "POST",
      body: JSON.stringify({
        challenge_id: Number(challengeId),
        otp: String(otp || "").trim(),
        remember,
      }),
    });

    localStorage.setItem("fleetdoc_access_token", r.access_token);
    localStorage.setItem("fleetdoc_refresh_token", r.refresh_token);
    localStorage.setItem("fleetdoc_logged_in", "true");
    localStorage.setItem("fleetdoc_user_id", String(r.user.id));
    localStorage.setItem("fleetdoc_user_email", r.user.email || "");
    localStorage.setItem("fleetdoc_user_name", r.user.name || "");
    localStorage.setItem("fleetdoc_user_role", r.user.role || "User");
    await load();
    return r.user;
  };

  /* =======================================================
     DATA HELPERS
  ======================================================= */

  const resetData = () =>
    load();

  const exportSettings = () =>
    JSON.stringify(
      {
        settings,
        exportedAt:
          new Date().toISOString(),
      },
      null,
      2
    );

  const importSettings = (
    input
  ) => {
    try {
      const x =
        typeof input === "string"
          ? JSON.parse(input)
          : input;

      updateSettings(
        x.settings || x
      );

      return true;
    } catch {
      return false;
    }
  };

  /* =========================================================
     POSTGRESQL BACKUP / RESTORE
  ========================================================= */

  const exportFleetData = async () => {
    const backup = await api("/backup/export");

    return JSON.stringify(
      backup,
      null,
      2
    );
  };

  const importFleetData = async (backup) => {
    if (!backup || typeof backup !== "object") {
      throw new Error("Invalid FleetDoc backup data.");
    }

    const result = await api("/backup/restore", {
      method: "POST",
      body: JSON.stringify(backup),
    });

    // Refresh every React collection from PostgreSQL after restore so
    // every page immediately reflects the restored database state.
    await load();

    notify(
      "FleetDoc PostgreSQL backup restored successfully.",
      "success"
    );

    return result;
  };

  const deleteExpenseRecord = (
    source,
    id
  ) => {
    const map = {
      roadTax:
        deleteRoadTax,
      document:
        deleteDocument,
      emi: deleteEMI,
      challan:
        deleteChallan,
    };

    return map[source]?.(id);
  };

  /* =======================================================
     AUTH LOGIN
  ======================================================= */

  const login = async (
    email,
    password,
    remember
  ) => {
    const r =
      await api(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
            remember,
          }),
        }
      );

    if (r?.requires_2fa) {
      return r;
    }

    localStorage.setItem(
      "fleetdoc_access_token",
      r.access_token
    );

    localStorage.setItem(
      "fleetdoc_refresh_token",
      r.refresh_token
    );

    localStorage.setItem(
      "fleetdoc_logged_in",
      "true"
    );

    localStorage.setItem(
      "fleetdoc_user_id",
      String(r.user.id)
    );

    localStorage.setItem(
      "fleetdoc_user_email",
      r.user.email
    );

    localStorage.setItem(
      "fleetdoc_user_name",
      r.user.name
    );

    localStorage.setItem(
      "fleetdoc_user_role",
      r.user.role
    );

    if (remember) {
      localStorage.setItem(
        "fleetdoc_email",
        email
      );
    } else {
      localStorage.removeItem(
        "fleetdoc_email"
      );
    }

    await load();

    return r.user;
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = () => {
    [
      "fleetdoc_access_token",
      "fleetdoc_refresh_token",
      "fleetdoc_logged_in",
      "fleetdoc_user_id",
      "fleetdoc_user_email",
      "fleetdoc_user_name",
      "fleetdoc_user_role",
    ].forEach((key) =>
      localStorage.removeItem(
        key
      )
    );

    window.location.replace(
      "/login"
    );
  };

  /* =======================================================
     FORGOT PASSWORD
  ======================================================= */

  const forgotPasswordRequest = (
    email
  ) =>
    api(
      "/auth/forgot-password/request",
      {
        method: "POST",
        body: JSON.stringify({
          email:
            String(email || "")
              .trim()
              .toLowerCase(),
        }),
      }
    );

  const verifyForgotPasswordOtp = (
    email,
    otp
  ) =>
    api(
      "/auth/forgot-password/verify",
      {
        method: "POST",
        body: JSON.stringify({
          email:
            String(email || "")
              .trim()
              .toLowerCase(),
          otp: String(otp || "").trim(),
        }),
      }
    );

  const resetPassword = (
    email,
    otp,
    newPassword
  ) =>
    api(
      "/auth/forgot-password/reset",
      {
        method: "POST",
        body: JSON.stringify({
          email:
            String(email || "")
              .trim()
              .toLowerCase(),
          otp: String(
            otp || ""
          ).trim(),
          new_password:
            newPassword,
        }),
      }
    );

  /* =======================================================
     USER EMAIL / PHONE OTP
  ======================================================= */

  const sendUserVerification =
    async (
      id,
      channel,
      purpose,
      target
    ) => {
      if (!id) {
        throw new Error(
          "User ID is required before sending a verification code."
        );
      }

      const normalizedTarget =
        channel === "email"
          ? String(
              target || ""
            )
              .trim()
              .toLowerCase()
          : String(
              target || ""
            ).replace(
              /\D/g,
              ""
            );

      const payload = {
        target:
          normalizedTarget,

        channel:
          channel === "phone"
            ? "sms"
            : "email",

        purpose,
      };

      return api(
        `/users/${id}/verification/send`,
        {
          method: "POST",
          body: JSON.stringify(
            payload
          ),
        }
      );
    };

  /* =======================================================
     VERIFY USER OTP
  ======================================================= */

  const verifyUserVerification =
    async (
      id,
      target,
      otp,
      purpose
    ) => {
      if (!id) {
        throw new Error(
          "User ID is required for OTP verification."
        );
      }

      const normalizedTarget =
        purpose ===
        "user_email_verification"
          ? String(
              target || ""
            )
              .trim()
              .toLowerCase()
          : String(
              target || ""
            ).replace(
              /\D/g,
              ""
            );

      const cleanOTP =
        String(
          otp || ""
        ).replace(
          /\D/g,
          ""
        );

      if (!cleanOTP) {
        throw new Error(
          "Please enter the verification code."
        );
      }

      return api(
        `/users/${id}/verification/verify`,
        {
          method: "POST",
          body: JSON.stringify({
            target:
              normalizedTarget,
            otp: cleanOTP,
            purpose,
          }),
        }
      );
    };

  /* =======================================================
     FILE UPLOAD
  ======================================================= */

  const uploadFile =
    async (file) => {
      const fd =
        new FormData();

      fd.append(
        "file",
        file
      );

      const response =
        await fetch(
          `${API_BASE}/files/upload`,
          {
            method: "POST",

            headers: token()
              ? {
                  Authorization:
                    `Bearer ${token()}`,
                }
              : {},

            body: fd,
          }
        );

      if (!response.ok) {
        let errorData = {};

        try {
          errorData =
            await response.json();
        } catch {
          errorData = {};
        }

        throw new Error(
          formatApiError(
            errorData,
            response.status
          )
        );
      }

      return response.json();
    };

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const value = useMemo(
    () => ({
      vehicles,
      documents,
      emis,
      loans,
      challans,
      roadTaxes,
      users,
      settings,

      dismissedNotifications,
      auditLogs,
      toast,

      notify,

      /* Vehicles */
      addVehicle,
      updateVehicle,
      deleteVehicle,
      isVehicleNumberExists,

      /* Documents */
      addDocument,
      updateDocument,
      deleteDocument,

      /* Loans */
      addLoan,
      updateLoan,
      deleteLoan,

      /* EMI */
      addEMI,
      updateEMI,
      markEMIPaid,
      deleteEMI,

      /* Challans */
      addChallan,
      updateChallan,
      deleteChallan,

      /* Road Tax */
      addRoadTax,
      updateRoadTax,
      deleteRoadTax,

      /* Expenses */
      deleteExpenseRecord,

      /* Users */
      addUser,
      updateUser,
      deleteUser,

      /* User permissions */
      getCurrentUser,
      getCurrentUserRole,
      getRolePermissions,
      hasPermission,
      isCurrentUserAdmin,

      /* Settings */
      updateSettings,
      getSetting,
      setSetting,
      resetSettings,

      /* Backup */
      exportSettings,
      importSettings,
      exportFleetData,
      importFleetData,

      /* Audit */
      addAuditLog,
      clearAuditLogs,

      /* Security */
      changePassword,
      verifyLogin2FA,

      /* Notifications */
      dismissNotification,
      restoreNotification,
      clearDismissedNotifications,

      /* General */
      resetData,

      /* Authentication */
      login,
      logout,

      /* Password reset */
      forgotPasswordRequest,
      verifyForgotPasswordOtp,
      resetPassword,

      /* OTP */
      sendUserVerification,
      verifyUserVerification,

      /* Upload */
      uploadFile,
    }),
    [
      vehicles,
      documents,
      emis,
      loans,
      challans,
      roadTaxes,
      users,
      settings,
      dismissedNotifications,
      auditLogs,
      toast,
      notify,
      load,
      changePassword,
      verifyLogin2FA,
      clearAuditLogs,
      addAuditLog,
      login,
      logout,
      forgotPasswordRequest,
      verifyForgotPasswordOtp,
      resetPassword,
      sendUserVerification,
      verifyUserVerification,
      uploadFile,
    ]
  );

  /* =======================================================
     PROVIDER
  ======================================================= */

  return (
    <FleetContext.Provider
      value={value}
    >
      {children}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[9999]">
          <div
            className={`rounded-xl border bg-white px-5 py-3 shadow-xl ${
              toast.type ===
              "error"
                ? "border-red-200 text-red-700"
                : toast.type ===
                  "warning"
                ? "border-amber-200 text-amber-700"
                : "border-emerald-200 text-emerald-700"
            }`}
          >
            <p className="whitespace-pre-line text-sm font-medium">
              {toast.message}
            </p>
          </div>
        </div>
      )}
    </FleetContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useFleet() {
  const context =
    useContext(FleetContext);

  if (!context) {
    throw new Error(
      "useFleet must be used inside FleetProvider"
    );
  }

  return context;
}

export default FleetContext;