import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import PageHeader from "../components/PageHeader";
import { useFleet } from "../context/fleetContext";

import {
  Plus,
  Trash2,
  MoreVertical,
  Pencil,
  X,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserRound,
  Save,
  UsersRound,
  UserCheck,
  UserX,
  Crown,
  BriefcaseBusiness,
  ChevronDown,
} from "lucide-react";

export default function Users() {
  const navigate = useNavigate();

  const {
    users = [],
    updateUser,
    deleteUser,
    getCurrentUserRole,
  } = useFleet();

  /* =========================================================
     CURRENT USER ROLE
  ========================================================= */

  const currentUserRole = getCurrentUserRole?.() || "User";
  const isAdmin = currentUserRole === "Admin";

  /* =========================================================
     MORE MENU
  ========================================================= */

  const [openMenuId, setOpenMenuId] = useState(null);

  /* =========================================================
     DELETE MODAL
  ========================================================= */

  const [deleteTarget, setDeleteTarget] = useState(null);

  /* =========================================================
     SUCCESS / ERROR MESSAGE
  ========================================================= */

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  /* =========================================================
     AUTO CLEAR MESSAGE
  ========================================================= */

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

  /* =========================================================
     ADD USER
  ========================================================= */

  const handleAddUser = () => {
    if (!isAdmin) return;

    navigate("/users/add");
  };

  /* =========================================================
     INDIAN NO. +91
  ========================================================= */
  const formatIndianPhone = (value) => {
    if (!value) return "—";

    const digits = String(value).replace(/\D/g, "");

    // Remove India's country code if already present
    const number = digits.startsWith("91")
      ? digits.slice(2)
      : digits;

    if (number.length === 10) {
      return `+91 ${number}`;
    }

    return value;
  };

  /* =========================================================
     EDIT USER
  ========================================================= */

  const handleEdit = (user) => {
    if (!isAdmin) return;

    setOpenMenuId(null);
    navigate(`/users/edit/${user.id}`);
  };

  /* =========================================================
     DELETE USER
  ========================================================= */

  const handleDelete = () => {
    if (!isAdmin) return;
    if (!deleteTarget) return;

    deleteUser(deleteTarget.id);

    setDeleteTarget(null);
    setOpenMenuId(null);

    setMessage({
      type: "success",
      text: "User and all stored user data have been deleted.",
    });
  };

  /* =========================================================
     TOGGLE STATUS
  ========================================================= */

  const handleToggleStatus = (user) => {
    if (!isAdmin) return;

    updateUser(user.id, {
      status: user.status === "Active" ? "Inactive" : "Active",
    });

    setOpenMenuId(null);

    setMessage({
      type: "success",
      text: `${user.name}'s account status has been updated.`,
    });
  };

  /* =========================================================
     ROLE UPDATE
  ========================================================= */

  const handleRoleChange = (userId, role) => {
    if (!isAdmin) return;

    updateUser(userId, {
      role,
    });

    setMessage({
      type: "success",
      text: "User role updated successfully.",
    });
  };

  /* =========================================================
     HELPERS
  ========================================================= */

  const getInitial = (name = "") => {
    return name.trim().charAt(0).toUpperCase() || "U";
  };

  const getRoleIcon = (role) => {
    if (role === "Admin") return Crown;
    if (role === "Manager") return BriefcaseBusiness;
    if (role === "Finance") return BriefcaseBusiness;
    return UserRound;
  };

  const getRoleStyle = (role) => {
    if (role === "Admin") {
      return {
        wrapper:
          "border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-300 hover:bg-violet-100",
        icon: "bg-violet-100 text-violet-600",
        focus: "focus:ring-violet-100",
      };
    }

    if (role === "Manager") {
      return {
        wrapper:
          "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100",
        icon: "bg-blue-100 text-blue-600",
        focus: "focus:ring-blue-100",
      };
    }

    if (role === "Finance") {
      return {
        wrapper:
          "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100",
        icon: "bg-slate-100 text-slate-500",
        focus: "focus:ring-slate-100",
      };
    }

    return {
      wrapper:
        "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100",
      icon: "bg-slate-100 text-slate-500",
      focus: "focus:ring-slate-100",
    };
  };

  /* =========================================================
     ANIMATION VARIANTS
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
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 18,
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

  const rowVariants = {
    hidden: {
      opacity: 0,
      y: 8,
    },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.045,
        duration: 0.35,
        ease: "easeOut",
      },
    }),
  };

  /* =========================================================
     ADMIN ACCESS CHECK
     
     IMPORTANT:
     This is intentionally placed AFTER all hooks.
     Therefore React hook order remains unchanged.
  ========================================================= */

  if (!isAdmin) {
    return (
      <motion.div
        className="relative"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <PageHeader
          title={
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 transition duration-300 hover:scale-110 hover:rotate-3">
                <UsersRound size={23} strokeWidth={2.3} />
              </div>

              <div>
                <span className="block text-2xl font-bold text-slate-800">
                  Users & Roles
                </span>
              </div>
            </div>
          }
          subtitle="Manage users and system permissions."
        />

        <div className="flex min-h-[55vh] items-center justify-center">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 15,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl"
          >
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500"
            >
              <ShieldCheck size={32} />
            </motion.div>

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              Access Denied
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Only Admin users can access Users & Roles.
            </p>

            <motion.button
              type="button"
              onClick={() => navigate("/")}
              whileHover={{
                scale: 1.03,
                y: -2,
              }}
              whileTap={{
                scale: 0.96,
              }}
              className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-200"
            >
              Go to Dashboard
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <motion.div
      className="relative"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 transition duration-300 hover:scale-110 hover:rotate-3">
              <UsersRound size={23} strokeWidth={2.3} />
            </div>

            <div>
              <span className="block text-2xl font-bold text-slate-800">
                Users & Roles
              </span>
            </div>
          </div>
        }
        subtitle="Manage users and system permissions."
        action={
          <motion.button
            type="button"
            onClick={handleAddUser}
            whileHover={{
              scale: 1.035,
              y: -2,
            }}
            whileTap={{
              scale: 0.96,
            }}
            className="btn-primary group flex items-center gap-2 shadow-sm transition-all duration-300 hover:shadow-lg"
          >
            <motion.span
              whileHover={{
                rotate: 90,
              }}
              transition={{
                duration: 0.25,
              }}
              className="flex"
            >
              <Plus size={17} />
            </motion.span>

            Add User
          </motion.button>
        }
      />

      {/* ===================================================
          SUCCESS / ERROR MESSAGE
      =================================================== */}

      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{
              opacity: 0,
              y: -15,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -10,
              scale: 0.98,
            }}
            transition={{
              duration: 0.3,
            }}
            className={`mb-5 flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-medium shadow-sm ${
              message.type === "success"
                ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700"
                : "border-red-200 bg-gradient-to-r from-red-50 to-rose-50 text-red-700"
            }`}
          >
            <motion.div
              initial={{
                scale: 0,
              }}
              animate={{
                scale: 1,
              }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 250,
              }}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                message.type === "success"
                  ? "bg-emerald-100"
                  : "bg-red-100"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
            </motion.div>

            <span>{message.text}</span>

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
                setMessage({
                  type: "",
                  text: "",
                })
              }
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
            >
              <X size={17} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================
          ROLE INFORMATION CARD
      =================================================== */}

      <motion.div
        variants={cardVariants}
        className="group relative mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50"
      >
        <span className="pointer-events-none absolute -bottom-10 left-1/2 h-20 w-2/3 -translate-x-1/2 rounded-full bg-blue-500/0 blur-2xl transition-all duration-700 group-hover:bg-blue-500/20" />

        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-200/20 blur-2xl transition-all duration-500 group-hover:bg-indigo-300/30" />

        <div className="pointer-events-none absolute -bottom-12 left-1/3 h-28 w-28 rounded-full bg-indigo-200/20 blur-2xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div>
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
                  <UserRound size={30} />
                </motion.div>

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Users and roles Management
                  </p>

                  <h2
                    className="
                      mt-1
                      text-2xl
                      font-bold
                      text-slate-800
                    "
                  >
                    Manage The Users and Roles
                  </h2>

                  <p
                    className="
                      mt-2
                      max-w-xl
                      text-sm
                      text-slate-500
                    "
                  >
                    Choose a role for each user. Admin has full system access,
                    Manager manages operations, Finance handles finance-related
                    access, and User has standard access.
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <motion.span
                  whileHover={{
                    y: -2,
                    scale: 1.03,
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 transition-all duration-200 hover:bg-violet-100"
                >
                  <Crown size={11} />
                  Admin
                </motion.span>

                <motion.span
                  whileHover={{
                    y: -2,
                    scale: 1.03,
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 transition-all duration-200 hover:bg-blue-100"
                >
                  <BriefcaseBusiness size={11} />
                  Manager
                </motion.span>

                <motion.span
                  whileHover={{
                    y: -2,
                    scale: 1.03,
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-100"
                >
                  <UserRound size={11} />
                  User
                </motion.span>

                <motion.span
                  whileHover={{
                    y: -2,
                    scale: 1.03,
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-100"
                >
                  <BriefcaseBusiness size={11} />
                  Finance
                </motion.span>
              </div>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={() =>
              setMessage({
                type: "success",
                text: "Role settings are saved automatically when changed.",
              })
            }
            whileHover={{
              scale: 1.03,
              y: -2,
            }}
            whileTap={{
              scale: 0.96,
            }}
            className="group/save flex shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 shadow-sm transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
          >
            <motion.span
              whileHover={{
                rotate: -10,
                scale: 1.1,
              }}
              className="flex"
            >
              <Save size={16} />
            </motion.span>

            Save Role
          </motion.button>
        </div>
      </motion.div>

      {/* ===================================================
          QUICK USER STATS
      =================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* TOTAL USERS */}

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
            delay: 0.15,
            duration: 0.4,
          }}
          whileHover={{
            y: -5,
            scale: 1.015,
          }}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-500 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/60"
        >
          <span className="absolute bottom-0 left-0 z-20 h-[3px] w-0 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 transition-all duration-700 ease-out group-hover:w-full" />

          <span className="pointer-events-none absolute -bottom-12 -right-12 h-28 w-28 rounded-full bg-blue-400/10 blur-2xl transition-all duration-500 group-hover:bg-blue-500/25" />

          <div className="relative flex items-center gap-3">
            <motion.div
              whileHover={{
                scale: 1.1,
                rotate: 4,
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm transition-all duration-300 group-hover:bg-blue-100 group-hover:text-blue-700 group-hover:shadow-md"
            >
              <UsersRound size={20} />
            </motion.div>

            <div>
              <p className="text-xs font-medium text-slate-500 transition-colors duration-300 group-hover:text-blue-600">
                Total Users
              </p>

              <p className="mt-0.5 text-xl font-bold text-slate-800">
                {users.length}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ACTIVE USERS */}

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
            delay: 0.21,
            duration: 0.4,
          }}
          whileHover={{
            y: -5,
            scale: 1.015,
          }}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-500 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/60"
        >
          <span className="absolute bottom-0 left-0 z-20 h-[3px] w-0 rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 transition-all duration-700 ease-out group-hover:w-full" />

          <span className="pointer-events-none absolute -bottom-12 -right-12 h-28 w-28 rounded-full bg-emerald-400/10 blur-2xl transition-all duration-500 group-hover:bg-emerald-500/25" />

          <div className="relative flex items-center gap-3">
            <motion.div
              whileHover={{
                scale: 1.1,
                rotate: 4,
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm transition-all duration-300 group-hover:bg-emerald-100 group-hover:text-emerald-700 group-hover:shadow-md"
            >
              <UserCheck size={20} />
            </motion.div>

            <div>
              <p className="text-xs font-medium text-slate-500 transition-colors duration-300 group-hover:text-emerald-600">
                Active Users
              </p>

              <p className="mt-0.5 text-xl font-bold text-slate-800">
                {
                  users.filter(
                    (user) => user.status === "Active"
                  ).length
                }
              </p>
            </div>
          </div>
        </motion.div>

        {/* INACTIVE USERS */}

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
            delay: 0.27,
            duration: 0.4,
          }}
          whileHover={{
            y: -5,
            scale: 1.015,
          }}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-500 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100/60"
        >
          <span className="absolute bottom-0 left-0 z-20 h-[3px] w-0 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-400 transition-all duration-700 ease-out group-hover:w-full" />

          <span className="pointer-events-none absolute -bottom-12 -right-12 h-28 w-28 rounded-full bg-amber-400/10 blur-2xl transition-all duration-500 group-hover:bg-amber-500/25" />

          <div className="relative flex items-center gap-3">
            <motion.div
              whileHover={{
                scale: 1.1,
                rotate: 4,
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shadow-sm transition-all duration-300 group-hover:bg-amber-100 group-hover:text-amber-700 group-hover:shadow-md"
            >
              <UserX size={20} />
            </motion.div>

            <div>
              <p className="text-xs font-medium text-slate-500 transition-colors duration-300 group-hover:text-amber-600">
                Inactive Users
              </p>

              <p className="mt-0.5 text-xl font-bold text-slate-800">
                {
                  users.filter(
                    (user) => user.status !== "Active"
                  ).length
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===================================================
          USERS TABLE CARD
      =================================================== */}

      <motion.div
        variants={cardVariants}
        className="card group relative overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/40"
      >
        <span className="pointer-events-none absolute -bottom-8 left-1/2 h-16 w-2/3 -translate-x-1/2 rounded-full bg-blue-500/0 blur-2xl transition-all duration-700 group-hover:bg-blue-500/20" />

        {/* TABLE HEADER */}

        <div className="relative flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
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
                  <UsersRound size={20} />
                </div>

                <h2 className="text-lg font-bold text-slate-800">
                  All Users
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                View and manage the users accounts and roles.
              </p>
            </div>
          </div>

          <motion.div
            whileHover={{
              scale: 1.04,
            }}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            {users.length}{" "}
            {users.length === 1 ? "User" : "Users"}
          </motion.div>
        </div>

        {/* TABLE */}

        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Contact No.</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center"
                  >
                    <motion.div
                      initial={{
                        opacity: 0,
                        scale: 0.95,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      className="flex flex-col items-center"
                    >
                      <motion.div
                        animate={{
                          y: [0, -5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-300"
                      >
                        <UserRound size={32} />
                      </motion.div>

                      <p className="font-semibold text-slate-600">
                        No users found
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Add your first user to get started.
                      </p>

                      <motion.button
                        type="button"
                        onClick={handleAddUser}
                        whileHover={{
                          scale: 1.04,
                          y: -2,
                        }}
                        whileTap={{
                          scale: 0.96,
                        }}
                        className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-200"
                      >
                        <Plus size={16} />
                        Add User
                      </motion.button>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => {
                  const RoleIcon = getRoleIcon(user.role);
                  const roleStyle = getRoleStyle(user.role);

                  return (
                    <motion.tr
                      key={user.id}
                      custom={index}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      className="group border-t border-slate-100 transition-all duration-300 hover:bg-blue-50/40"
                    >
                      {/* USER */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{
                              scale: 1.1,
                              rotate: 3,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                            }}
                            className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 text-sm font-bold text-white shadow-md ring-1 ring-slate-200 transition-all duration-300 group-hover:ring-blue-200 group-hover:shadow-lg"
                          >
                            {user.photo ? (
                              <img
                                src={user.photo}
                                alt={user.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              getInitial(user.name)
                            )}

                            <span
                              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white shadow-sm ${
                                user.status === "Active"
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                              }`}
                            />
                          </motion.div>

                          <div>
                            <p className="font-semibold text-slate-800 transition-colors duration-200 group-hover:text-blue-700">
                              {user.name}
                            </p>

                            {user.emailVerified && (
                              <motion.span
                                initial={{
                                  opacity: 0,
                                  x: -5,
                                }}
                                animate={{
                                  opacity: 1,
                                  x: 0,
                                }}
                                className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600"
                              >
                                <CheckCircle2 size={11} />
                                Verified account
                              </motion.span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <motion.div
                            whileHover={{
                              scale: 1.08,
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-all duration-300 group-hover:bg-blue-50 group-hover:text-blue-500"
                          >
                            <Mail size={15} />
                          </motion.div>

                          <span className="text-slate-600 transition-colors duration-200 group-hover:text-slate-800">
                            {user.email}
                          </span>
                        </div>
                      </td>

                      {/* CONTACT */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <motion.div
                            whileHover={{
                              scale: 1.08,
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-all duration-300 group-hover:bg-blue-50 group-hover:text-blue-500"
                          >
                            <Phone size={15} />
                          </motion.div>

                          <span className="text-slate-600">
                            {formatIndianPhone(user.contactNo || user.phone)}
                          </span>

                          {user.contactVerified && (
                            <motion.span
                              initial={{
                                scale: 0,
                              }}
                              animate={{
                                scale: 1,
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                              }}
                            >
                              <CheckCircle2
                                size={14}
                                className="text-emerald-500"
                              />
                            </motion.span>
                          )}
                        </div>
                      </td>

                      {/* ROLE */}

                      <td className="px-6 py-4">
                        <div className="relative inline-flex">
                          <select
                            value={user.role || "User"}
                            onChange={(e) =>
                              handleRoleChange(
                                user.id,
                                e.target.value
                              )
                            }
                            className={`appearance-none rounded-xl border py-2 pl-9 pr-9 text-sm font-semibold outline-none transition-all duration-300 focus:ring-4 ${roleStyle.wrapper} ${roleStyle.focus}`}
                          >
                            <option value="Admin">
                              Admin
                            </option>

                            <option value="Manager">
                              Manager
                            </option>

                            <option value="Finance">
                              Finance
                            </option>

                            <option value="User">
                              User
                            </option>
                          </select>

                          <span
                            className={`pointer-events-none absolute left-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md ${roleStyle.icon}`}
                          >
                            <RoleIcon size={12} />
                          </span>

                          <ChevronDown
                            size={14}
                            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-current opacity-60"
                          />
                        </div>
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">
                        <motion.button
                          type="button"
                          whileHover={{
                            scale: 1.05,
                            y: -1,
                          }}
                          whileTap={{
                            scale: 0.95,
                          }}
                          onClick={() =>
                            handleToggleStatus(user)
                          }
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-300 ${
                            user.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 hover:ring-emerald-300 hover:shadow-md hover:shadow-emerald-100"
                              : "bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200 hover:ring-slate-300"
                          }`}
                        >
                          <motion.span
                            animate={
                              user.status === "Active"
                                ? {
                                    scale: [1, 1.25, 1],
                                  }
                                : {
                                    scale: 1,
                                  }
                            }
                            transition={{
                              duration: 2,
                              repeat:
                                user.status === "Active"
                                  ? Infinity
                                  : 0,
                              ease: "easeInOut",
                            }}
                            className={`h-1.5 w-1.5 rounded-full ${
                              user.status === "Active"
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />

                          {user.status}
                        </motion.button>
                      </td>

                      {/* ACTION */}

                      <td className="relative px-6 py-4 text-center">
                        <motion.button
                          type="button"
                          whileHover={{
                            scale: 1.08,
                          }}
                          whileTap={{
                            scale: 0.9,
                          }}
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === user.id
                                ? null
                                : user.id
                            )
                          }
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-all duration-300 ${
                            openMenuId === user.id
                              ? "bg-blue-100 text-blue-600 shadow-sm"
                              : "hover:bg-slate-100 hover:text-slate-700 hover:shadow-sm"
                          }`}
                        >
                          <MoreVertical size={19} />
                        </motion.button>

                        {/* MORE MENU */}

                        <AnimatePresence>
                          {openMenuId === user.id && (
                            <motion.div
                              initial={{
                                opacity: 0,
                                y: -7,
                                scale: 0.95,
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                              }}
                              exit={{
                                opacity: 0,
                                y: -5,
                                scale: 0.95,
                              }}
                              transition={{
                                duration: 0.18,
                              }}
                              className="absolute right-6 top-14 z-30 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 text-left shadow-2xl shadow-slate-900/10"
                            >
                              <motion.button
                                type="button"
                                whileHover={{
                                  x: 3,
                                }}
                                onClick={() =>
                                  handleEdit(user)
                                }
                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-all duration-200 hover:bg-blue-100 hover:text-blue-600">
                                  <Pencil size={14} />
                                </span>

                                Edit User
                              </motion.button>

                              <motion.button
                                type="button"
                                whileHover={{
                                  x: 3,
                                }}
                                onClick={() => {
                                  if (!isAdmin) return;

                                  setDeleteTarget(user);
                                  setOpenMenuId(null);
                                }}
                                className="mt-0.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700"
                              >
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500">
                                  <Trash2 size={14} />
                                </span>

                                Delete User
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ===================================================
          DELETE CONFIRMATION MODAL
      =================================================== */}

      <AnimatePresence>
        {deleteTarget && (
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.92,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
                y: 15,
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 22,
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500" />

              <div className="p-6">
                <div className="flex items-start gap-4">
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
                      delay: 0.1,
                      type: "spring",
                      stiffness: 250,
                    }}
                    className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100"
                  >
                    <Trash2 size={23} />
                  </motion.div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Delete User?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Are you sure you want to delete{" "}
                      <span className="font-semibold text-slate-800">
                        {deleteTarget.name}
                      </span>
                      ?
                    </p>

                    <div className="mt-3 rounded-xl border border-red-100 bg-red-50/70 px-3 py-2.5">
                      <p className="text-xs font-medium leading-5 text-red-600">
                        This action will permanently remove the user's
                        stored account data.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modal buttons */}

                <div className="mt-6 flex justify-end gap-3">
                  <motion.button
                    type="button"
                    whileHover={{
                      y: -1,
                    }}
                    whileTap={{
                      scale: 0.96,
                    }}
                    onClick={() => setDeleteTarget(null)}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 hover:shadow-md"
                  >
                    No, Keep
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{
                      y: -1,
                      scale: 1.02,
                    }}
                    whileTap={{
                      scale: 0.96,
                    }}
                    onClick={handleDelete}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-red-200"
                  >
                    <Trash2 size={15} />
                    Yes, Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
