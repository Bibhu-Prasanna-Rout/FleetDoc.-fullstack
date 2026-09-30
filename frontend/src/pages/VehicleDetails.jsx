
import React, { useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import {
  FilePlus,
  CreditCard,
  ReceiptText,
  Eye,
  Truck,
  Bus,
  Calendar,
  FileText,
  AlertTriangle,
  CircleX,
  ArrowLeft,
  Car,
  History,
  Building2,
  User,
  Gauge,
  Mail,
  MapPin,
  Phone,
  Hash,
  Settings,
  Pencil,
  ShieldCheck,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import PageHeader from "../components/PageHeader";

import StatusBadge from "../components/StatusBadge";

import {
  useFleet,
  getExpiryStatus,
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
   DOCUMENT STATUS
   Renewed documents are historical records and should not
   be treated as Active / Expiring Soon / Expired.
========================================================= */

const getDocumentStatus = (
  document,
  reminderDays
) => {
  if (
    String(document?.status || "")
      .trim()
      .toLowerCase() === "renewed"
  ) {
    return "Renewed";
  }

  if (
    String(document?.documentStatus || "")
      .trim()
      .toLowerCase() === "renewed"
  ) {
    return "Renewed";
  }

  return getExpiryStatus(
    document?.expiry,
    reminderDays
  );
};


/* =========================================================
   IS RENEWED DOCUMENT
========================================================= */

const isRenewedDocument = (document) => {
  const status =
    String(document?.status || "")
      .trim()
      .toLowerCase();

  const documentStatus =
    String(document?.documentStatus || "")
      .trim()
      .toLowerCase();

  return (
    status === "renewed" ||
    documentStatus === "renewed" ||
    document?.renewed === true ||
    document?.isRenewed === true
  );
};


/* =========================================================
   VEHICLE DETAILS COMPONENT
========================================================= */

export default function VehicleDetails() {

  const { id } = useParams();

  const navigate = useNavigate();


  /* =========================================================
     FLEET DATA
  ========================================================= */

  const {
    vehicles,
    documents,
    emis,
    loans,
    challans,
    settings,
    users = [],
  } = useFleet();


  /* =========================================================
     USERS & ROLES / PERMISSIONS
  ========================================================= */

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
   * Existing AddUser.jsx uses "Finincer"
   * for the Finance role in some cases.
   *
   * Normalize it here so both values work.
   */

  const permissionRole =
    currentUserRole === "Finincer"
      ? "Finance"
      : currentUserRole;


  const rolePermissions =
    settings?.rolePermissions || {};


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
    };


  /* =========================================================
     PAGE PERMISSIONS
  ========================================================= */

  const canViewVehicles =
    currentPermissions.view === true;


  const canAddVehicles =
    currentPermissions.add === true;


  const canEditVehicles =
    currentPermissions.edit === true;


  const canDeleteVehicles =
    currentPermissions.delete === true;


  const canMarkPaid =
    currentPermissions.paid === true;


  /*
   * canDeleteVehicles and canMarkPaid are intentionally
   * resolved here because the permission system is shared
   * across the FleetDoc application.
   *
   * VehicleDetails currently has no direct Delete/Paid
   * action, so these permissions do not alter the existing UI.
   */


  const vehicle =
    vehicles.find(
      (v) => v.id === Number(id)
    ) || vehicles[0];


  const [tab, setTab] =
    useState("Overview");


  /* =========================================================
     VIEW PERMISSION
  ========================================================= */

  if (!canViewVehicles) {

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

            <ShieldCheck size={30} />

          </div>


          <h2 className="mt-5 text-xl font-bold text-slate-800">
            Access Restricted
          </h2>


          <p className="mt-2 text-sm leading-6 text-slate-500">
            You do not have permission to view vehicle details.
          </p>

        </div>

      </motion.div>

    );
  }


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
            onClick={() =>
              navigate("/vehicles")
            }
            className="btn-primary mt-4"
          >
            Back to Vehicles
          </button>

        </div>

      </div>

    );
  }


  /* =========================================================
     VEHICLE ICON LOGIC
  ========================================================= */

  const vehicleType =
    vehicle.type?.toLowerCase() || "";


  const VehicleIcon =
    vehicleType === "car"
      ? Car
      : vehicleType === "bus"
      ? Bus
      : Truck;


  /* =========================================================
     FILTER VEHICLE DATA
  ========================================================= */

  const docs =
    documents.filter(
      (document) =>
        String(document.vehicle || "")
          .trim()
          .toUpperCase() ===
        String(vehicle.number || "")
          .trim()
          .toUpperCase()
    );


  /* =========================================================
     CURRENT DOCUMENTS / DOCUMENT HISTORY
  ========================================================= */

  const currentDocs =
    docs.filter(
      (document) =>
        !isRenewedDocument(document)
    );


  const documentHistory =
    docs.filter(
      (document) =>
        isRenewedDocument(document)
    );


  /* =========================================================
     EMI DATA
  ========================================================= */

  const vehicleEmi = emis
    .filter((emi) => {

      const emiVehicle =
        emi.vehicleNumber ||
        emi.vehicle ||
        emi.vehicleNo ||
        "";

      return (
        String(emiVehicle)
          .trim()
          .toUpperCase() ===
        String(vehicle.number)
          .trim()
          .toUpperCase()
      );

    })
    .map((emi) => {

      const relatedLoan =
        loans.find(
          (loan) =>
            String(loan.id) ===
            String(emi.loanId)
        );


      return {

        ...emi,


        /* BANK / FINANCER */

        bank:
          emi.bank ||
          emi.financerBank ||
          emi.financierBank ||
          emi.financer ||
          emi.financier ||
          emi.bankName ||
          relatedLoan?.financerBank ||
          relatedLoan?.financierBank ||
          relatedLoan?.bank ||
          relatedLoan?.bankName ||
          "—",


        /* LOAN NUMBER */

        loanNumber:
          emi.loanNumber ||
          emi.loanNo ||
          relatedLoan?.loanNumber ||
          relatedLoan?.loanNo ||
          "—",


        /* EMI NUMBER */

        emiNumber:
          emi.emiNumber ||
          emi.installmentNumber ||
          "—",


        /* EMI AMOUNT */

        amount:
          emi.amount ??
          emi.emiAmount ??
          emi.monthlyEMI ??
          relatedLoan?.emiAmount ??
          relatedLoan?.monthlyEMI ??
          0,


        /* EMI START DATE */

        emiStartDate:
          emi.emiStartDate ||
          emi.startDate ||
          relatedLoan?.emiStartDate ||
          relatedLoan?.startDate ||
          "",


        /* EMI CLOSING DATE */

        emiClosingDate:
          emi.emiClosingDate ||
          emi.emiEndDate ||
          emi.closingDate ||
          emi.endDate ||
          relatedLoan?.emiClosingDate ||
          relatedLoan?.emiEndDate ||
          relatedLoan?.endDate ||
          "",


        /* EMI DUE DATE */

        dueDate:
          emi.dueDate ||
          emi.paymentDate ||
          "",


        /* EMI STATUS */

        status:
          emi.status ||
          (
            emi.paid === true
              ? "Paid"
              : "Pending"
          ),

      };

    });


  const vehicleChallans =
    challans.filter(
      (challan) =>
        String(challan.vehicle || "")
          .trim()
          .toUpperCase() ===
        String(vehicle.number || "")
          .trim()
          .toUpperCase()
    );


  /* =========================================================
     REGISTRATION CERTIFICATE STATUS
  ========================================================= */

  const registrationCertificate =
    currentDocs.find(
      (document) => {

        const documentType =
          document.type?.toLowerCase() || "";

        return (
          documentType.includes(
            "registration certificate"
          ) ||
          documentType === "rc" ||
          documentType.includes(
            "registration"
          )
        );

      }
    );


  let registrationStatus =
    "Inactive";


  if (registrationCertificate) {

    const expiryStatus =
      getExpiryStatus(
        registrationCertificate.expiry,
        settings.reminderDays
      );


    registrationStatus =
      expiryStatus === "Active"
        ? "Active"
        : "Inactive";

  }


  /* =========================================================
     DOCUMENT STATISTICS
  ========================================================= */

  const activeDocs =
    currentDocs.filter(
      (document) =>
        getExpiryStatus(
          document.expiry,
          settings.reminderDays
        ) === "Active"
    ).length;


  const expiringDocs =
    currentDocs.filter(
      (document) =>
        getExpiryStatus(
          document.expiry,
          settings.reminderDays
        ) === "Expiring Soon"
    ).length;


  const expiredDocs =
    currentDocs.filter(
      (document) =>
        getExpiryStatus(
          document.expiry,
          settings.reminderDays
        ) === "Expired"
    ).length;


  /* =========================================================
     EDIT VEHICLE HANDLER
  ========================================================= */

  const handleEditVehicle = () => {

    if (!canEditVehicles) {
      return;
    }

    navigate(
      `/vehicles/${vehicle.id}/edit`
    );

  };


  /* =========================================================
     ADD DOCUMENT HANDLER
  ========================================================= */

  const handleAddDocument = () => {

    if (!canAddVehicles) {
      return;
    }

    navigate("/documents/add");

  };


  /* =========================================================
     ADD EMI HANDLER
  ========================================================= */

  const handleAddEMI = () => {

    if (!canAddVehicles) {
      return;
    }

    navigate("/emi");

  };


  /* =========================================================
     ADD CHALLAN HANDLER
  ========================================================= */

  const handleAddChallan = () => {

    if (!canAddVehicles) {
      return;
    }

    navigate("/challans/add");

  };


  /* =========================================================
     TABS
  ========================================================= */

  const tabs = [

    {
      name: "Overview",
      icon: VehicleIcon,
    },

    {
      name: "Documents",
      icon: FileText,
    },

    {
      name: "EMI",
      icon: CreditCard,
    },

    {
      name: "Challans",
      icon: ReceiptText,
    },

    {
      name: "History",
      icon: History,
    },

  ];


  /* =========================================================
     RETURN
  ========================================================= */

  return (

    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pb-8"
    >

      {/* =====================================================
          BACK BUTTON
      ===================================================== */}

      <motion.button
        variants={itemVariants}
        whileHover={{
          x: -3,
        }}
        onClick={() =>
          navigate("/vehicles")
        }
        className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
      >

        <ArrowLeft size={17} />

        Back to Vehicles

      </motion.button>


      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <motion.div
        variants={itemVariants}
      >

        <PageHeader

          title={

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200">

                <VehicleIcon size={22} />

              </div>


              <div>

                <span>
                  {vehicle.number}
                </span>

              </div>

            </div>

          }


          subtitle={`${vehicle.type} • ${vehicle.brand} ${vehicle.model} • ${vehicle.year}`}


          action={

            <div className="flex items-center gap-3">

              {/* STATUS */}

              <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-sm">

                <StatusBadge
                  status={registrationStatus}
                />

              </div>


              {/* EDIT BUTTON */}

              {canEditVehicles && (

                <motion.button
                  whileHover={{
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={handleEditVehicle}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:shadow-xl"
                >

                  <Pencil size={16} />

                  Edit Vehicle

                </motion.button>

              )}

            </div>

          }

        />

      </motion.div>


      {/* =====================================================
          VEHICLE HERO CARD
      ===================================================== */}

      <motion.div
        variants={itemVariants}
        whileHover={{
          y: -2,
        }}
        className="relative mt-6 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-6 shadow-sm"
      >

        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-blue-200/30 blur-2xl" />

        <div className="absolute -bottom-16 right-1/3 h-40 w-40 rounded-full bg-indigo-200/30 blur-2xl" />


        <div className="relative grid gap-6 lg:grid-cols-2">


          {/* VEHICLE INFORMATION */}

          <div className="flex items-center gap-5">

            <motion.div
              animate={{
                y: [0, -4, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-200"
            >

              <VehicleIcon size={38} />

            </motion.div>


            <div>

              <p className="text-sm font-medium text-slate-500">
                Vehicle Number
              </p>


              <h2 className="mt-1 text-2xl font-bold text-slate-800 md:text-3xl">
                {vehicle.number}
              </h2>


              <p className="mt-2 text-sm text-slate-600">
                {vehicle.brand} {vehicle.model}
              </p>


              <div className="mt-3 flex flex-wrap gap-2">

                <span className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {vehicle.type}
                </span>


                <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {vehicle.year}
                </span>


                <span
                  className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                    registrationStatus === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  RC: {registrationStatus}
                </span>

              </div>

            </div>

          </div>


          {/* VEHICLE BASIC INFORMATION */}

          <div className="grid gap-3 sm:grid-cols-2">

            <InfoBox
              icon={User}
              label="Owner Name"
              value={
                vehicle.owner ||
                "Not Available"
              }
            />


            <InfoBox
              icon={Calendar}
              label="Registration Date"
              value={
                vehicle.registrationDate ||
                "Not Available"
              }
            />


            <InfoBox
              icon={VehicleIcon}
              label="Vehicle Type"
              value={
                vehicle.type ||
                "Not Available"
              }
            />


            <InfoBox
              icon={Building2}
              label="Brand"
              value={
                vehicle.brand ||
                "Not Available"
              }
            />

          </div>

        </div>

      </motion.div>


      {/* =====================================================
          VEHICLE IDENTIFICATION & OWNER DETAILS
      ===================================================== */}

      <motion.div
        variants={itemVariants}
        className="mt-6 grid gap-6 lg:grid-cols-2"
      >

        {/* VEHICLE IDENTIFICATION */}

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Truck size={21} />
            </div>

            <div>

              <h3 className="font-bold text-slate-800">
                Vehicle Identification
              </h3>

              <p className="text-xs text-slate-500">
                Vehicle technical identification details
              </p>

            </div>

          </div>


          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            <DetailCard
              icon={Hash}
              label="Chassis Number"
              value={
                vehicle.chassis ||
                "Not Available"
              }
            />


            <DetailCard
              icon={Settings}
              label="Engine Number"
              value={
                vehicle.engine ||
                "Not Available"
              }
            />

          </div>

        </div>


        {/* OWNER DETAILS */}

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <User size={21} />
            </div>

            <div>

              <h3 className="font-bold text-slate-800">
                Owner Details
              </h3>

              <p className="text-xs text-slate-500">
                Vehicle owner contact information
              </p>

            </div>

          </div>


          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            <DetailCard
              icon={User}
              label="Owner Name"
              value={
                vehicle.owner ||
                "Not Available"
              }
            />


            <DetailCard
              icon={Phone}
              label="Mobile Number"
              value={
                vehicle.mobile ||
                "Not Available"
              }
            />


            <DetailCard
              icon={Mail}
              label="Email Address"
              value={
                vehicle.email ||
                vehicle.ownerEmail ||
                "Not Available"
              }
            />


            <DetailCard
              icon={MapPin}
              label="Owner Address"
              value={
                vehicle.address ||
                vehicle.ownerAddress ||
                "Not Available"
              }
            />

          </div>

        </div>

      </motion.div>


      {/* =====================================================
          STATISTICS CARDS
      ===================================================== */}

      <motion.div
        variants={containerVariants}
        className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >

        <StatCard
          title="Total Documents"
          value={currentDocs.length}
          note="Current documents"
          icon={FileText}
          bg="bg-blue-50"
          color="text-blue-600"
        />


        <StatCard
          title="Active Documents"
          value={activeDocs}
          note="Currently valid"
          icon={FileText}
          bg="bg-emerald-50"
          color="text-emerald-600"
        />


        <StatCard
          title="Expiring Soon"
          value={expiringDocs}
          note={`${settings.reminderDays} day reminder`}
          icon={AlertTriangle}
          bg="bg-amber-50"
          color="text-amber-600"
        />


        <StatCard
          title="Expired"
          value={expiredDocs}
          note="Requires attention"
          icon={CircleX}
          bg="bg-red-50"
          color="text-red-600"
        />

      </motion.div>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="mt-6 grid gap-6 xl:grid-cols-4">


        {/* LEFT CONTENT */}

        <motion.div
          variants={itemVariants}
          className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm xl:col-span-3"
        >

          {/* TAB NAVIGATION */}

          <div className="border-b border-slate-100">

            <div className="flex gap-2 overflow-x-auto px-5 pt-4">

              {tabs.map((item) => {

                const TabIcon =
                  item.icon;


                return (

                  <button
                    key={item.name}
                    onClick={() =>
                      setTab(item.name)
                    }
                    className={`relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                      tab === item.name
                        ? "text-blue-600"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >

                    <TabIcon size={16} />

                    {item.name}


                    {tab === item.name && (

                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600"
                      />

                    )}

                  </button>

                );

              })}

            </div>

          </div>


          {/* TAB CONTENT */}

          <div className="p-5 md:p-6">

            <AnimatePresence mode="wait">


              {/* OVERVIEW */}

              {tab === "Overview" && (

                <motion.div
                  key="overview"
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

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="text-lg font-bold text-slate-800">
                        Document Overview
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        All current documents associated with this vehicle.
                      </p>

                    </div>


                    <button
                      onClick={() =>
                        setTab("Documents")
                      }
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                      View All
                    </button>

                  </div>


                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    {currentDocs.length > 0 ? (

                      currentDocs
                        .slice(0, 6)
                        .map(
                          (document, index) => {

                            const status =
                              getDocumentStatus(
                                document,
                                settings.reminderDays
                              );


                            return (

                              <motion.div
                                key={document.id}
                                initial={{
                                  opacity: 0,
                                  y: 15,
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                }}
                                transition={{
                                  delay: index * 0.05,
                                }}
                                whileHover={{
                                  y: -4,
                                }}
                                className="group rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4 transition hover:border-blue-100 hover:shadow-lg"
                              >

                                <div className="flex items-start justify-between">

                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:scale-110">

                                    <FileText size={19} />

                                  </div>


                                  <StatusBadge
                                    status={status}
                                  />

                                </div>


                                <p className="mt-4 text-sm text-slate-500">
                                  {document.type}
                                </p>


                                <p className="mt-1 font-semibold text-slate-800">
                                  {formatDate(document.expiry)}
                                </p>


                                <p className="mt-1 text-xs text-slate-400">
                                  Expiry Date
                                </p>

                              </motion.div>

                            );

                          }

                        )

                    ) : (

                      <div className="col-span-full py-12 text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                          <FileText size={30} />

                        </div>

                        <h3 className="mt-4 font-semibold text-slate-600">
                          No Documents Added
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          Add your first vehicle document.
                        </p>

                      </div>

                    )}

                  </div>

                </motion.div>

              )}


              {/* DOCUMENTS */}

              {tab === "Documents" && (

                <TabDocuments
                  docs={currentDocs}
                  settings={settings}
                  onEdit={handleEditVehicle}
                  canEdit={canEditVehicles}
                />

              )}


              {/* EMI */}

              {tab === "EMI" && (

                <TabEMI
                  records={vehicleEmi}
                />

              )}


              {/* CHALLANS */}

              {tab === "Challans" && (

                <TabChallans
                  records={vehicleChallans}
                />

              )}


              {/* HISTORY */}

              {tab === "History" && (

                <TabHistory
                  records={documentHistory}
                />

              )}

            </AnimatePresence>

          </div>

        </motion.div>


        {/* QUICK ACTIONS */}

        <motion.div
          variants={itemVariants}
          className="h-fit rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
        >

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">

              <Gauge size={19} />

            </div>

            <div>

              <h3 className="font-bold text-slate-800">
                Quick Actions
              </h3>

              <p className="text-xs text-slate-400">
                Manage this vehicle
              </p>

            </div>

          </div>


          <div className="mt-6 space-y-3">

            {/* EDIT VEHICLE */}

            {canEditVehicles && (

              <QuickAction
                icon={Pencil}
                label="Edit Vehicle"
                primary
                onClick={handleEditVehicle}
              />

            )}


            {/* ADD DOCUMENT */}

            {canAddVehicles && (

              <QuickAction
                icon={FilePlus}
                label="Add Document"
                onClick={handleAddDocument}
              />

            )}


            {/* ADD EMI */}

            {canAddVehicles && (

              <QuickAction
                icon={CreditCard}
                label="Add EMI Details"
                onClick={handleAddEMI}
              />

            )}


            {/* ADD CHALLAN */}

            {canAddVehicles && (

              <QuickAction
                icon={ReceiptText}
                label="Add Challan"
                onClick={handleAddChallan}
              />

            )}


            {/* VIEW ALL DOCUMENTS */}

            <QuickAction
              icon={Eye}
              label="View All Documents"
              onClick={() =>
                setTab("Documents")
              }
            />

          </div>

        </motion.div>

      </div>

    </motion.div>

  );

}


/* =========================================================
   INFORMATION BOX
========================================================= */

function InfoBox({
  icon: Icon,
  label,
  value,
}) {

  return (

    <div className="rounded-xl border border-white/70 bg-white/70 p-3 backdrop-blur-sm">

      <div className="flex items-center gap-2">

        <Icon
          size={15}
          className="text-blue-600"
        />

        <span className="text-xs text-slate-500">
          {label}
        </span>

      </div>


      <p className="mt-2 truncate text-sm font-semibold text-slate-700">
        {value}
      </p>

    </div>

  );

}


/* =========================================================
   DETAIL CARD
========================================================= */

function DetailCard({
  icon: Icon,
  label,
  value,
}) {

  return (

    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-blue-100 hover:bg-blue-50/40">

      <div className="flex items-center gap-2">

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">

          <Icon size={16} />

        </div>

        <p className="text-xs font-medium text-slate-500">
          {label}
        </p>

      </div>


      <p className="mt-3 break-words text-sm font-semibold text-slate-700">
        {value}
      </p>

    </div>

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
      variants={itemVariants}
      whileHover={{
        y: -5,
        scale: 1.01,
      }}
      className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-xl"
    >

      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${bg} opacity-70 transition duration-500 group-hover:scale-150`}
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
            className={`mt-2 text-xs font-semibold ${color}`}
          >
            {note}
          </p>

        </div>


        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${bg} ${color} shadow-sm transition duration-300 group-hover:scale-110 group-hover:rotate-3`}
        >
          <Icon size={25} />
        </div>

      </div>


      <div
        className={`absolute bottom-0 left-0 h-1 w-0 ${color.replace(
          "text-",
          "bg-"
        )} transition-all duration-300 group-hover:w-full`}
      />

    </motion.div>

  );

}


/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon: Icon,
  label,
  onClick,
  primary = false,
}) {

  return (

    <motion.button
      whileHover={{
        x: 4,
      }}
      whileTap={{
        scale: 0.97,
      }}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
        primary
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-100"
          : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >

      <Icon size={18} />

      {label}

    </motion.button>

  );

}


/* =========================================================
   DOCUMENTS TAB
========================================================= */

function TabDocuments({
  docs,
  settings,
  onEdit,
  canEdit,
}) {

  return (

    <motion.div
      key="documents"
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
    >

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

        <div>

          <h3 className="text-lg font-bold text-slate-800">
            Vehicle Documents
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Documents associated with this vehicle.
          </p>

        </div>


        {/* EDIT DOCUMENTS */}

        {canEdit && (

          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
          >

            <Pencil size={15} />

            Edit Documents

          </button>

        )}

      </div>


      <div className="mt-5 space-y-3">

        {docs.length > 0 ? (

          docs.map((document) => {

            const status =
              getDocumentStatus(
                document,
                settings.reminderDays
              );


            return (

              <div
                key={document.id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 p-4 transition hover:bg-slate-50 md:flex-row md:items-center"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                    <FileText size={20} />

                  </div>


                  <div>

                    <p className="font-semibold text-slate-700">
                      {document.type}
                    </p>


                    <p className="text-xs text-slate-500">
                      Document No: {document.number || "-"}
                    </p>

                  </div>

                </div>


                <div className="flex items-center gap-5">

                  <div>

                    <p className="text-xs text-slate-400">
                      Expiry Date
                    </p>


                    <p className="font-medium text-slate-700">
                      {document.expiry || "-"}
                    </p>

                  </div>


                  <StatusBadge
                    status={status}
                  />

                </div>

              </div>

            );

          })

        ) : (

          <EmptyState
            icon={FileText}
            title="No Documents Available"
            subtitle="No documents have been added."
          />

        )}

      </div>

    </motion.div>

  );

}


/* =========================================================
   HISTORY TAB
========================================================= */

function TabHistory({
  records,
}) {

  return (

    <motion.div
      key="history"
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
    >

      <div className="flex items-center justify-between">

        <div>

          <h3 className="text-lg font-bold text-slate-800">
            Vehicle History
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Previous vehicle documents and renewed records.
          </p>

        </div>

      </div>


      <div className="mt-5 space-y-3">

        {records.length > 0 ? (

          records.map((document) => (

            <div
              key={document.id}
              className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 p-4 transition hover:bg-slate-50 md:flex-row md:items-center"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">

                  <History size={20} />

                </div>


                <div>

                  <p className="font-semibold text-slate-700">
                    {document.type}
                  </p>


                  <p className="text-xs text-slate-500">
                    Document No: {document.number || "-"}
                  </p>

                </div>

              </div>


              <div className="flex items-center gap-5">

                <div>

                  <p className="text-xs text-slate-400">
                    Expiry Date
                  </p>


                  <p className="font-medium text-slate-700">
                    {document.expiry || "-"}
                  </p>

                </div>


                <StatusBadge
                  status="Renewed"
                />

              </div>

            </div>

          ))

        ) : (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="py-16 text-center"
          >

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

              <History size={30} />

            </div>

            <h3 className="mt-4 font-bold text-slate-700">
              Vehicle History
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              No renewed document history available.
            </p>

          </motion.div>

        )}

      </div>

    </motion.div>

  );

}


/* =========================================================
   EMI TAB
========================================================= */

function TabEMI({
  records,
}) {

  return (

    <motion.div
      key="emi"
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
    >

      <h3 className="text-lg font-bold text-slate-800">
        EMI Details
      </h3>


      <div className="mt-5 space-y-3">

        {records && records.length > 0 ? (

          records.map((emi) => {

            const bank =
              emi.bank ||
              emi.financerBank ||
              emi.financierBank ||
              "—";


            const loanNumber =
              emi.loanNumber ||
              emi.loanNo ||
              "—";


            const emiNumber =
              emi.emiNumber ||
              emi.installmentNumber ||
              "—";


            const amount =
              emi.amount ??
              emi.emiAmount ??
              emi.monthlyEMI ??
              0;


            const dueDate =
              emi.dueDate ||
              emi.paymentDate ||
              "";


            const status =
              emi.status ||
              (
                emi.paid === true
                  ? "Paid"
                  : "Pending"
              );


            return (

              <div
                key={emi.id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 p-4 transition hover:bg-slate-50 md:flex-row md:items-center"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

                    <CreditCard size={20} />

                  </div>


                  <div>

                    <p className="font-semibold text-slate-700">
                      {bank}
                    </p>


                    <p className="text-xs text-slate-500">
                      {loanNumber !== "—"
                        ? `Loan No: ${loanNumber}`
                        : `EMI No: ${emiNumber}`}
                    </p>


                    {dueDate && (

                      <p className="text-xs text-slate-400">
                        EMI No: {emiNumber} • Due: {formatDate(dueDate)}
                      </p>

                    )}

                  </div>

                </div>


                <div className="flex items-center gap-5">

                  <p className="font-bold text-indigo-600">
                    ₹ {Number(
                      amount || 0
                    ).toLocaleString("en-IN")}
                  </p>


                  <StatusBadge
                    status={status}
                  />

                </div>

              </div>

            );

          })

        ) : (

          <EmptyState
            icon={CreditCard}
            title="No EMI Records"
            subtitle="No EMI details available for this vehicle."
          />

        )}

      </div>

    </motion.div>

  );

}


/* =========================================================
   CHALLAN TAB
========================================================= */

function TabChallans({
  records,
}) {

  return (

    <motion.div
      key="challans"
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
    >

      <h3 className="text-lg font-bold text-slate-800">
        Challan Details
      </h3>


      <div className="mt-5 space-y-3">

        {records.length > 0 ? (

          records.map((challan) => (

            <div
              key={challan.id}
              className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 p-4 transition hover:bg-slate-50 md:flex-row md:items-center"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-pink-600">

                  <ReceiptText size={20} />

                </div>


                <div>

                  <p className="font-semibold text-slate-700">
                    {challan.number}
                  </p>

                  <p className="text-xs text-slate-500">
                    {challan.type}
                  </p>

                </div>

              </div>


              <div className="flex items-center gap-5">

                <p className="font-bold text-pink-600">
                  ₹ {Number(
                    challan.amount || 0
                  ).toLocaleString("en-IN")}
                </p>


                <StatusBadge
                  status={challan.status}
                />

              </div>

            </div>

          ))

        ) : (

          <EmptyState
            icon={ReceiptText}
            title="No Challans"
            subtitle="No challan records found for this vehicle."
          />

        )}

      </div>

    </motion.div>

  );

}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon: Icon,
  title,
  subtitle,
}) {

  return (

    <div className="py-16 text-center">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

        <Icon size={30} />

      </div>


      <h3 className="mt-4 font-semibold text-slate-600">
        {title}
      </h3>


      <p className="mt-2 text-sm text-slate-400">
        {subtitle}
      </p>

    </div>

  );

}