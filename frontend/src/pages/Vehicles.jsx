
import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import {
  Plus,
  Search,
  Eye,
  Trash2,
  MoreVertical,
  Filter,
  Truck,
  Car,
  Bus,
  X,
  CheckCircle2,
  ChevronDown,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

import {
  useFleet,
  getExpiryStatus,
} from "../context/fleetContext";

import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";

import { motion, AnimatePresence } from "framer-motion";

/* =========================================================
   VEHICLE TYPE ICON FUNCTION
========================================================= */

const getVehicleIcon = (type) => {

  const vehicleType = type?.toLowerCase();

  if (vehicleType === "car") {
    return Car;
  }

  if (vehicleType === "bus") {
    return Bus;
  }

  return Truck;

};


/* =========================================================
   ANIMATION VARIANTS
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
      duration: 0.4,
      ease: "easeOut",
    },
  },
};


/* =========================================================
   GET VEHICLE RC STATUS
========================================================= */

const getVehicleRCStatus = (
  vehicle,
  documents,
  reminderDays
) => {

  if (!vehicle) {
    return "Inactive";
  }


  /* FIND REGISTRATION CERTIFICATE */

  const rcDocument = documents.find((document) => {

    const documentType =
      document.type?.toLowerCase().trim() || "";


    return (

      document.vehicle === vehicle.number &&

      (

        documentType === "registration certificate" ||

        documentType === "rc" ||

        documentType.includes("registration certificate")

      )

    );

  });


  /* NO RC FOUND */

  if (!rcDocument) {

    return "Inactive";

  }


  /* GET RC EXPIRY STATUS */

  const rcStatus = getExpiryStatus(
    rcDocument.expiry,
    reminderDays
  );


  /* EXPIRED RC */

  if (rcStatus === "Expired") {

    return "Inactive";

  }


  /* ACTIVE OR EXPIRING SOON RC */

  return "Active";

};


/* =========================================================
   PAGE ANIMATION
========================================================= */

const pageVariants = {

  hidden: {
    opacity: 0,
    y: 12,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.45,
      ease: "easeOut",

      staggerChildren: 0.08,
    },

  },

};


/* =========================================================
   SECTION ANIMATION
========================================================= */

const sectionVariants = {

  hidden: {
    opacity: 0,
    y: 15,
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
   VEHICLES COMPONENT
========================================================= */

export default function Vehicles() {

  const [showFilters, setShowFilters] = useState(false);

  
  /* =========================================================
     FLEET DATA
  ========================================================= */

  const {

    vehicles,
    documents,
    settings,
    deleteVehicle,
    users = [],

  } = useFleet();


  /* =========================================================
     STATES
  ========================================================= */

  const [q, setQ] = useState("");

  const [filter, setFilter] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");


  /* =========================================================
     DELETE MODAL STATES
  ========================================================= */

  const [deleteModal, setDeleteModal] =
    useState(false);


  const [selectedVehicle, setSelectedVehicle] =
    useState(null);


  /* =========================================================
     ACTION MENU STATE
  ========================================================= */

  const [activeMenu, setActiveMenu] =
    useState(null);


  /* =========================================================
     CURRENT USER PERMISSIONS
  ========================================================= */

  /*
    Login.jsx stores the logged-in user's id/email in localStorage.
    We use that information to find the current user from FleetContext
    and then read that user's role permissions from Settings.

    Finincer is supported as an alias for the existing Settings role
    Finance, so the role continues to work even though AddUser uses
    the requested spelling "Finincer".
  */

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
    };

  const canViewVehicles =
    currentPermissions.view === true;

  const canAddVehicles =
    currentPermissions.add === true;

  const canEditVehicles =
    currentPermissions.edit === true;

  const canDeleteVehicles =
    currentPermissions.delete === true;


  const menuRef = useRef(null);


  /* =========================================================
     CLOSE MENU WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {


    const handleClickOutside = (event) => {


      if (

        menuRef.current &&

        !menuRef.current.contains(event.target)

      ) {

        setActiveMenu(null);

      }

    };


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };


  }, []);


  /* =========================================================
     ADD RC STATUS TO VEHICLES
  ========================================================= */

  const vehiclesWithRCStatus = useMemo(() => {


    return vehicles.map((vehicle) => {


      const rcStatus =
        getVehicleRCStatus(

          vehicle,

          documents || [],

          settings?.reminderDays || 10

        );


      return {

        ...vehicle,

        rcStatus,

      };


    });


  }, [

    vehicles,

    documents,

    settings,

  ]);


  /* =========================================================
     SEARCH FILTER
  ========================================================= */

  const filtered = useMemo(() => {


    return vehiclesWithRCStatus.filter((v) => {

      const matchesSearch = [

        v.number,

        v.owner,

        v.email,

        v.ownerEmail,

        v.type,

        v.brand,

        v.model,

      ]

        .join(" ")

        .toLowerCase()

        .includes(q.toLowerCase());


      // Match the filter with the exact RC Status shown in the table.
      const matchesStatus =
        statusFilter === "All" ||
        v.rcStatus === statusFilter;


      return matchesSearch && matchesStatus;

    });


  }, [

    vehiclesWithRCStatus,

    q,

    statusFilter,

  ]);


  /* =========================================================
     STATISTICS
  ========================================================= */

  const activeVehicles =
    vehiclesWithRCStatus.filter(

      (v) => v.rcStatus === "Active"

    ).length;


  const inactiveVehicles =
    vehiclesWithRCStatus.filter(

      (v) => v.rcStatus === "Inactive"

    ).length;


  /* =========================================================
     DELETE FUNCTIONS
  ========================================================= */

  const handleDeleteClick = (vehicle) => {


    setSelectedVehicle(vehicle);


    setDeleteModal(true);


    setActiveMenu(null);


  };


  const confirmDelete = () => {


    if (selectedVehicle) {

      deleteVehicle(selectedVehicle.id);

    }


    setDeleteModal(false);


    setSelectedVehicle(null);


  };


  const cancelDelete = () => {


    setDeleteModal(false);


    setSelectedVehicle(null);


  };


  /* =========================================================
     TOGGLE ACTION MENU
  ========================================================= */

  const toggleMenu = (id) => {


    if (activeMenu === id) {

      setActiveMenu(null);

    }

    else {

      setActiveMenu(id);

    }


  };


  /* =========================================================
     RETURN
  ========================================================= */

  /*
    View permission controls access to the Vehicles page.
    The rest of the page remains unchanged when access is allowed.
  */
  if (!canViewVehicles) {
    return (
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="pb-8"
      >
        <motion.div
          variants={sectionVariants}
          className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <ShieldCheck size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              Access Restricted
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You do not have permission to view Vehicles. Please contact an administrator if you need access.
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (

    <motion.div

      variants={pageVariants}

      initial="hidden"

      animate="visible"

      className="pb-8"

    >


      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <motion.div variants={sectionVariants}>


        <PageHeader


          title={

            <div className="flex items-center gap-3">


              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 transition duration-300 hover:scale-110 hover:rotate-3">


                <Truck
                  size={23}
                  strokeWidth={2.3}
                />


              </div>


              <div>


                <span className="block text-2xl font-bold text-slate-800">

                  Vehicles

                </span>


              </div>


            </div>

          }


          subtitle="Manage, monitor and organize all your vehicles in one place."


          action={

            canAddVehicles ? (
              <Link

                to="/vehicles/add"

                className="btn-primary group flex items-center gap-2 transition duration-300 hover:-translate-y-1 hover:shadow-lg"

              >


                <Plus

                  size={18}

                  className="transition duration-300 group-hover:rotate-90"

                />


                Add Vehicle


              </Link>
            ) : null

          }

        />

      </motion.div>



      {/* =====================================================
          VEHICLE STATISTICS
      ===================================================== */}

      <motion.div

        variants={sectionVariants}

        className="mb-6 grid gap-4 sm:grid-cols-2"

      >


        {/* TOTAL VEHICLES */}

        <motion.div

          variants={sectionVariants}

          whileHover={{
            y: -4,
          }}

          className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm transition duration-300 hover:shadow-lg"

        >


          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-100 opacity-60 transition duration-500 group-hover:scale-150" />


          <div className="relative flex items-center justify-between">


            <div>


              <p className="text-sm font-medium text-slate-500">

                Total Vehicles

              </p>


              <h3 className="mt-2 text-3xl font-bold text-slate-800">

                {vehicles.length}

              </h3>


              <p className="mt-1 text-xs text-blue-600">

                Fleet registered

              </p>


            </div>


            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 transition duration-300 group-hover:rotate-6 group-hover:scale-110">


              <Truck size={25} />


            </div>


          </div>


        </motion.div>



        {/* ACTIVE VEHICLES */}

        <motion.div

          variants={sectionVariants}

          whileHover={{
            y: -4,
          }}

          className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm transition duration-300 hover:shadow-lg"

        >


          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-100 opacity-60 transition duration-500 group-hover:scale-150" />


          <div className="relative flex items-center justify-between">


            <div>


              <p className="text-sm font-medium text-slate-500">

                Active Vehicles

              </p>


              <h3 className="mt-2 text-3xl font-bold text-slate-800">

                {activeVehicles}

              </h3>


              <p className="mt-1 text-xs text-emerald-600">

                RC currently valid

              </p>


            </div>


            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200 transition duration-300 group-hover:rotate-6 group-hover:scale-110">


              <CheckCircle2 size={25} />


            </div>


          </div>


        </motion.div>


      </motion.div>



      {/* =====================================================
          VEHICLE DIRECTORY
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


        {/* ===================================================
            CARD HEADER
        =================================================== */}

        <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50 p-5 md:flex-row md:items-center md:justify-between">


          {/* TITLE */}

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
                <Truck
                  size={20}
                />
              </div>


              <h2 className="text-lg font-bold text-slate-800">

                Vehicle Directory

              </h2>


            </div>


            <p className="mt-1 text-sm text-slate-500">

              Showing {filtered.length} of {vehicles.length} vehicles

            </p>


          </div>



          {/* SEARCH & FILTER */}

          <div className="flex flex-col gap-3 sm:flex-row">


            {/* SEARCH */}

            <div className="relative">


              <Search

                size={18}

                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"

              />


              <input

                value={q}

                onChange={(e) =>
                  setQ(e.target.value)
                }

                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm outline-none transition duration-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:w-72"

                placeholder="Search vehicle or owner..."

              />


              {q && (

                <button

                  onClick={() =>
                    setQ("")
                  }

                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-red-500"

                >

                  <X size={17} />

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

                    RC Status

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

                      <option value="Inactive">
                        Inactive
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



        {/* ===================================================
            FILTER PANEL
        =================================================== */}

        {filter && (

          <motion.div

            initial={{
              opacity: 0,
              height: 0,
            }}

            animate={{
              opacity: 1,
              height: "auto",
            }}

            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}

            className="border-b border-blue-100 bg-blue-50/60 px-5 py-4"

          >


            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">


              <div className="flex items-center gap-3">


                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">

                  <Filter size={17} />

                </div>


                <div>


                  <p className="text-sm font-semibold text-slate-700">

                    Search Filter Active

                  </p>


                  <p className="text-xs text-slate-500">

                    Search by vehicle number, owner, vehicle type, brand or model.

                  </p>


                </div>


              </div>


              <button

                onClick={() => {
                  setQ("");
                  setStatusFilter("All");
                }}

                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm transition hover:bg-blue-600 hover:text-white"

              >

                Clear Filter

              </button>


            </div>


          </motion.div>

        )}



        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="overflow-x-auto overflow-y-visible">


          <table className="w-full min-w-[750px] text-sm">


            {/* TABLE HEADER */}

            <thead className="border-b border-slate-200 bg-slate-50">


              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">


                <th className="px-6 py-4">

                  Vehicle

                </th>


                <th className="py-4">

                  Vehicle Type

                </th>


                <th className="py-4">

                  Owner

                </th>


                <th className="py-4">

                  RC Status

                </th>


                <th className="py-4 text-center">

                  Actions

                </th>


              </tr>


            </thead>



            {/* TABLE BODY */}

            <tbody>


              {filtered.map((v, index) => {


                const VehicleIcon =
                  getVehicleIcon(v.type);


                return (

                  <motion.tr

                    key={v.id}

                    initial={{
                      opacity: 0,
                      y: 10,
                    }}

                    animate={{
                      opacity: 1,
                      y: 0,
                    }}

                    transition={{
                      duration: 0.35,
                      delay: index * 0.04,
                      ease: "easeOut",
                    }}

                    className="group border-b border-slate-100 transition duration-300 hover:bg-blue-50/50"

                  >


                    {/* VEHICLE */}

                    <td className="px-6 py-4">


                      <div className="flex items-center gap-3">


                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">


                          <VehicleIcon size={19} />


                        </div>


                        <div>


                          <p className="font-semibold text-base text-blue-700">

                            {v.number}

                          </p>


                          <p className="text-xs text-slate-400">

                            {v.brand} {v.model}

                          </p>


                        </div>


                      </div>


                    </td>



                    {/* VEHICLE TYPE */}

                    <td className="py-4">


                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">

                        {v.type}

                      </span>


                    </td>



                    {/* OWNER */}

                    <td className="py-4">


                      <div>


                        <p className="font-medium text-slate-700">

                          {v.owner || "Not Available"}

                        </p>


                        {(v.email || v.ownerEmail) && (

                          <p className="mt-1 text-xs text-slate-400">

                            {v.email || v.ownerEmail}

                          </p>

                        )}


                      </div>


                    </td>



                    {/* RC STATUS */}

                    <td className="py-4">


                      <StatusBadge
                        status={v.rcStatus}
                      />


                    </td>



                    {/* ACTION MENU */}

                    <td className="py-4">


                      <div

                        className="relative flex justify-center"

                        ref={
                          activeMenu === v.id
                            ? menuRef
                            : null
                        }

                      >


                        {/* THREE DOT BUTTON */}

                        <button

                          onClick={() =>
                            toggleMenu(v.id)
                          }

                          className={`rounded-xl border p-2.5 transition duration-300 hover:-translate-y-0.5 hover:shadow-sm ${

                            activeMenu === v.id

                              ? "border-blue-300 bg-blue-50 text-blue-600"

                              : "border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"

                          }`}

                          title="More Options"

                        >


                          <MoreVertical size={17} />


                        </button>



                        {/* DROPDOWN MENU */}

                        {activeMenu === v.id && (

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

                            transition={{
                              duration: 0.15,
                            }}

                            className="absolute right-4 top-12 z-50 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl"

                          >


                            {/* VIEW */}

                            <Link

                              to={`/vehicles/${v.id}`}

                              onClick={() =>
                                setActiveMenu(null)
                              }

                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"

                            >


                              <Eye size={17} />


                              View Details


                            </Link>



                            {/* DIVIDER */}

                            <div className="my-1 border-t border-slate-100" />



                            {/* DELETE */}

                            {canDeleteVehicles && (
                              <button

                                onClick={() =>
                                  handleDeleteClick(v)
                                }

                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50 hover:text-red-600"

                              >


                                <Trash2 size={17} />


                                Delete Vehicle


                              </button>
                            )}


                          </motion.div>

                        )}


                      </div>


                    </td>


                  </motion.tr>

                );


              })}


            </tbody>


          </table>



          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {filtered.length === 0 && (

            <motion.div

              initial={{
                opacity: 0,
                scale: 0.96,
              }}

              animate={{
                opacity: 1,
                scale: 1,
              }}

              transition={{
                duration: 0.3,
              }}

              className="flex flex-col items-center justify-center px-6 py-16 text-center"

            >


              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">

                <Truck size={35} />

              </div>


              <h3 className="mt-5 text-lg font-semibold text-slate-700">

                No Vehicles Found

              </h3>


              <p className="mt-2 max-w-sm text-sm text-slate-500">

                {statusFilter !== "All"
                  ? `No ${statusFilter} RC status vehicles found.`
                  : "We couldn't find any vehicles matching your search."}

              </p>


              <button

                onClick={() =>
                  setQ("")
                }

                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 hover:shadow-lg"

              >

                Clear Search

              </button>


            </motion.div>

          )}


        </div>



        {/* ===================================================
            TABLE FOOTER
        =================================================== */}

        {filtered.length > 0 && (

          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">


            <span>


              Showing{" "}


              <strong className="text-slate-700">

                {filtered.length}

              </strong>


              {" "}vehicles


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


      </motion.div>



      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      {deleteModal && selectedVehicle && (

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

          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"

        >


          {/* MODAL BOX */}

          <motion.div

            initial={{
              opacity: 0,
              scale: 0.9,
              y: 15,
            }}

            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}

            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}

            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"

          >


            {/* WARNING ICON */}

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">

              <AlertTriangle size={32} />

            </div>



            {/* MODAL TITLE */}

            <h2 className="mt-5 text-center text-xl font-bold text-slate-800">

              Delete Vehicle?

            </h2>



            {/* MODAL MESSAGE */}

            <p className="mt-3 text-center text-sm leading-6 text-slate-500">


              Are you sure you want to delete vehicle


              <span className="mx-1 font-semibold text-slate-700">

                {selectedVehicle.number}

              </span>


              ?


            </p>


            <p className="mt-2 text-center text-xs text-red-500">

              This action cannot be undone.

            </p>



            {/* BUTTONS */}

            <div className="mt-7 grid grid-cols-2 gap-3">


              {/* CANCEL */}

              <button

                onClick={cancelDelete}

                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition duration-300 hover:bg-slate-100 hover:text-slate-800 active:scale-95"

              >

                No, Keep It

              </button>



              {/* DELETE */}

              <button

                onClick={confirmDelete}

                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-red-700 hover:shadow-lg active:scale-95"

              >

                Yes, Delete

              </button>


            </div>


          </motion.div>


        </motion.div>

      )}



    </motion.div>

  );

}