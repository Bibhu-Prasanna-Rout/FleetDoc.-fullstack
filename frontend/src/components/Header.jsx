import {
  Bell,
  Search,
  ChevronDown,
  X,
  Menu,
  Settings,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { useFleet } from "../context/fleetContext";
import fleetDocLogo from "../assets/FleetDoc-logo 1.png";

export default function Header({
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  const nav = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  /* ========================================
      SEARCH ITEMS
  ======================================== */

  const searchItems = [
    {
      name: "Vehicles",
      path: "/vehicles",
      keywords: [
        "vehicle",
        "vehicles",
        "truck",
        "car",
      ],
    },

    {
      name: "Documents",
      path: "/documents",
      keywords: [
        "document",
        "documents",
        "rc",
        "insurance",
        "fitness",
        "permit",
      ],
    },

    {
      name: "EMI Management",
      path: "/emi",
      keywords: [
        "emi",
        "loan",
        "finance",
        "payment",
      ],
    },

    {
      name: "Challans",
      path: "/challans",
      keywords: [
        "challan",
        "challans",
        "fine",
        "traffic fine",
      ],
    },

    {
      name: "Road Tax",
      path: "/road-tax",
      keywords: [
        "road tax",
        "tax",
        "vehicle tax",
      ],
    },

    {
      name: "Reports",
      path: "/reports",
      keywords: [
        "report",
        "reports",
        "analytics",
      ],
    },

    {
      name: "Notifications",
      path: "/notifications",
      keywords: [
        "notification",
        "notifications",
        "alerts",
      ],
    },

    {
      name: "Reminders",
      path: "/reminders",
      keywords: [
        "reminder",
        "reminders",
        "expiry",
        "due",
      ],
    },

    {
      name: "Users & Roles",
      path: "/users",
      keywords: [
        "user",
        "users",
        "role",
        "roles",
        "admin",
      ],
    },

    {
      name: "Settings",
      path: "/settings",
      keywords: [
        "setting",
        "settings",
        "configuration",
      ],
    },
  ];

  /* ========================================
      FILTER SEARCH RESULTS
  ======================================== */

  const filteredResults = searchItems.filter((item) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return false;

    return (
      item.name.toLowerCase().includes(search) ||
      item.keywords.some((keyword) =>
        keyword.toLowerCase().includes(search)
      )
    );
  });

  /* ========================================
      FLEET CONTEXT
  ======================================== */

  const { expiringDocuments, users = [] } = useFleet();

  /* ========================================
      CURRENT LOGGED-IN USER
  ======================================== */

  const loggedInUserId =
    localStorage.getItem("fleetdoc_user_id");

  const loggedInUserEmail =
    localStorage.getItem("fleetdoc_user_email");

  const currentUser = users.find((user) => {
    const idMatch =
      loggedInUserId &&
      String(user.id) === String(loggedInUserId);

    const emailMatch =
      loggedInUserEmail &&
      user.email?.toLowerCase() ===
        loggedInUserEmail.toLowerCase();

    return idMatch || emailMatch;
  });

  /* ========================================
      USER NAME
  ======================================== */

  const currentUserName =
    currentUser?.name?.trim() || "User";

  /* ========================================
      USER ROLE
  ======================================== */

  const currentUserRole =
    currentUser?.role || "User";

  /*
    Keep "Administrator" for Admin role
    to match your existing UI.
  */

  const displayUserRole =
    currentUserRole === "Admin"
      ? "Administrator"
      : currentUserRole;

  /* ========================================
      USER PHOTO
  ======================================== */

  const currentUserPhoto =
    currentUser?.photo || "";

  /* ========================================
      USER INITIAL
  ======================================== */

  const userInitial =
    currentUserName
      .trim()
      .charAt(0)
      .toUpperCase() || "U";

  /* ========================================
      CLOSE SEARCH
  ======================================== */

  const clearSearch = () => {
    setSearchTerm("");
    setShowResults(false);
  };

  /* ========================================
      SELECT SEARCH RESULT
  ======================================== */

  const handleSearchNavigation = (path) => {
    nav(path);
    clearSearch();
  };

  /* ========================================
      LOGOUT
  ======================================== */

  const handleLogout = () => {
    localStorage.removeItem("fleetdoc_logged_in");

    /*
      Remove current user information
      from localStorage as well.
    */

    localStorage.removeItem("fleetdoc_user_id");
    localStorage.removeItem("fleetdoc_user_email");

    setProfileOpen(false);

    nav("/login");
  };

  return (
    <header
      className="
        sticky
        top-0
        z-20
        flex
        h-20
        items-center
        justify-between
        border-b
        border-slate-200
        bg-white/90
        px-4
        backdrop-blur
        lg:px-8
      "
    >
      {/* ========================================
          LEFT SIDE
          MOBILE MENU + SEARCH
      ======================================== */}

      <div className="flex items-center gap-3">

        {/* MOBILE MENU BUTTON */}

        <button
          onClick={() =>
            setMobileMenuOpen(!mobileMenuOpen)
          }
          className="
            flex
            items-center
            justify-center
            rounded-lg
            p-2
            text-slate-600
            transition
            hover:bg-slate-100
            lg:hidden
          "
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>

        {/* ========================================
            SEARCH BAR
        ======================================== */}

        <div className="relative hidden md:block">

          {/* SEARCH ICON */}

          <Search
            className="
              absolute
              left-3
              top-3
              z-10
              text-slate-400
            "
            size={18}
          />

          {/* SEARCH INPUT */}

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => {
              if (searchTerm) {
                setShowResults(true);
              }
            }}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                filteredResults.length > 0
              ) {
                handleSearchNavigation(
                  filteredResults[0].path
                );
              }

              if (e.key === "Escape") {
                clearSearch();
              }
            }}
            className="
              w-80
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              py-2.5
              pl-10
              pr-10
              text-sm
              outline-none
              transition
              focus:border-blue-400
              focus:ring-2
              focus:ring-blue-100
            "
            placeholder="Search anything..."
          />

          {/* CLEAR SEARCH BUTTON */}

          {searchTerm && (
            <button
              onClick={clearSearch}
              className="
                absolute
                right-3
                top-2.5
                text-slate-400
                transition
                hover:text-slate-600
              "
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}

          {/* ========================================
              SEARCH RESULTS DROPDOWN
          ======================================== */}

          {showResults && searchTerm && (
            <div
              className="
                absolute
                left-0
                top-12
                z-50
                w-80
                overflow-hidden
                rounded-xl
                border
                border-slate-200
                bg-white
                shadow-xl
              "
            >
              {filteredResults.length > 0 ? (
                filteredResults.map((item) => (
                  <button
                    key={item.path}
                    onClick={() =>
                      handleSearchNavigation(
                        item.path
                      )
                    }
                    className="
                      flex
                      w-full
                      items-center
                      px-4
                      py-3
                      text-left
                      text-sm
                      transition
                      hover:bg-slate-100
                    "
                  >
                    <Search
                      size={16}
                      className="mr-3 text-slate-400"
                    />

                    <span>
                      {item.name}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-4 text-sm text-slate-500">
                  No results found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================
          CENTER LOGO
      ======================================== */}

      <div
        className="
          absolute
          left-1/2
          hidden
          -translate-x-1/2
          items-center
          gap-3
          xl:flex
        "
      >
        <img
          src={fleetDocLogo}
          alt="FleetDoc Logo"
          className="h-11 w-auto object-contain"
        />

        <div className="border-l border-slate-200 pl-3">

          <h2 className="text-lg font-bold tracking-tight text-slate-800">
            Fleet
            <span className="text-blue-600">
              Doc.
            </span>
          </h2>

          <p className="text-xs text-slate-500">
            Vehicle Document Manager
          </p>

        </div>
      </div>

      {/* ========================================
          RIGHT SIDE
      ======================================== */}

      <div className="ml-auto flex items-center gap-2 sm:gap-4">

        {/* ========================================
            NOTIFICATION BUTTON
        ======================================== */}

        <motion.button
          whileHover={{
            scale: 1.06,
            y: -1,
          }}
          whileTap={{
            scale: 0.92,
          }}
          onClick={() =>
            nav("/notifications")
          }
          className="
            relative
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            border
            border-slate-200
            bg-white
            text-slate-600
            shadow-sm
            transition-all
            duration-300
            hover:border-blue-200
            hover:bg-blue-50
            hover:text-blue-600
            hover:shadow-md
          "
          aria-label="Notifications"
        >
          {/* ANIMATED BELL */}

          <motion.div
            animate={
              expiringDocuments &&
              expiringDocuments.length > 0
                ? {
                    rotate: [
                      0,
                      -8,
                      8,
                      -5,
                      5,
                      0,
                    ],
                  }
                : {}
            }
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatDelay: 5,
            }}
          >
            <Bell size={20} />
          </motion.div>

          {/* NOTIFICATION COUNT */}

          {expiringDocuments &&
            expiringDocuments.length > 0 && (
              <motion.span
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                className="
                  absolute
                  -right-1
                  -top-1
                  flex
                  min-h-[19px]
                  min-w-[19px]
                  items-center
                  justify-center
                  rounded-full
                  border-2
                  border-white
                  bg-red-500
                  px-1
                  text-[10px]
                  font-bold
                  text-white
                  shadow-sm
                "
              >
                {expiringDocuments.length > 9
                  ? "9+"
                  : expiringDocuments.length}
              </motion.span>
            )}
        </motion.button>

        {/* DIVIDER */}

        <div
          className="
            hidden
            h-9
            w-px
            bg-gradient-to-b
            from-transparent
            via-slate-300
            to-transparent
            md:block
          "
        />

        {/* ========================================
            USER PROFILE
        ======================================== */}

        <div className="relative">

          {/* PROFILE BUTTON */}

          <motion.button
            whileHover={{
              y: -1,
            }}
            whileTap={{
              scale: 0.98,
            }}
            onClick={() =>
              setProfileOpen(!profileOpen)
            }
            className="
              group
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-transparent
              p-1.5
              pr-2
              text-left
              transition-all
              duration-300
              hover:border-slate-200
              hover:bg-slate-50
              sm:gap-3
            "
            aria-label="User profile"
          >

            {/* ==================================
                USER AVATAR
            ================================== */}

            <div
              className="
                relative
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-xl
                bg-gradient-to-br
                from-blue-500
                via-blue-600
                to-indigo-600
                font-bold
                text-white
                shadow-lg
                shadow-blue-200
                transition
                duration-300
                group-hover:scale-105
              "
            >

              {currentUserPhoto ? (
                <img
                  src={currentUserPhoto}
                  alt={currentUserName}
                  className="h-full w-full object-cover"
                />
              ) : (
                userInitial
              )}

              {/* ONLINE STATUS */}

              <span
                className="
                  absolute
                  -bottom-0.5
                  -right-0.5
                  h-3
                  w-3
                  rounded-full
                  border-2
                  border-white
                  bg-emerald-500
                "
              />

            </div>

            {/* ==================================
                USER INFORMATION
            ================================== */}

            <div className="hidden min-w-[90px] md:block">

              <p
                className="
                  truncate
                  text-sm
                  font-semibold
                  text-slate-800
                "
              >
                {currentUserName}
              </p>

              <p
                className="
                  mt-0.5
                  text-xs
                  font-medium
                  text-blue-600
                "
              >
                {displayUserRole}
              </p>

            </div>

            {/* DROPDOWN ARROW */}

            <motion.div
              animate={{
                rotate: profileOpen ? 180 : 0,
              }}
              transition={{
                duration: 0.2,
              }}
            >
              <ChevronDown
                size={16}
                className="
                  hidden
                  text-slate-400
                  transition
                  group-hover:text-blue-500
                  md:block
                "
              />
            </motion.div>

          </motion.button>

          {/* ========================================
              PROFILE DROPDOWN
          ======================================== */}

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                  scale: 0.96,
                }}
                transition={{
                  duration: 0.2,
                }}
                className="
                  absolute
                  right-0
                  top-14
                  z-50
                  w-64
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-2xl
                  shadow-slate-200/60
                "
              >

                {/* PROFILE DROPDOWN HEADER */}

                <div
                  className="
                    relative
                    overflow-hidden
                    border-b
                    border-slate-100
                    bg-gradient-to-br
                    from-blue-50
                    via-white
                    to-indigo-50
                    p-4
                  "
                >

                  {/* BACKGROUND DESIGN */}

                  <div
                    className="
                      absolute
                      -right-8
                      -top-8
                      h-24
                      w-24
                      rounded-full
                      bg-blue-200/30
                      blur-xl
                    "
                  />

                  <div className="relative flex items-center gap-3">

                    {/* DROPDOWN USER AVATAR */}

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-xl
                        bg-gradient-to-br
                        from-blue-500
                        to-indigo-600
                        font-bold
                        text-white
                        shadow-md
                      "
                    >
                      {currentUserPhoto ? (
                        <img
                          src={currentUserPhoto}
                          alt={currentUserName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        userInitial
                      )}
                    </div>

                    <div className="min-w-0">

                      <p className="truncate font-bold text-slate-800">
                        {currentUserName}
                      </p>

                      <p className="text-xs text-slate-500">
                        {displayUserRole}
                      </p>

                      <div
                        className="
                          mt-1
                          inline-flex
                          items-center
                          gap-1
                          rounded-full
                          bg-emerald-50
                          px-2
                          py-0.5
                          text-[10px]
                          font-semibold
                          text-emerald-600
                        "
                      >
                        <span
                          className="
                            h-1.5
                            w-1.5
                            rounded-full
                            bg-emerald-500
                          "
                        />

                        Online
                      </div>

                    </div>
                  </div>
                </div>

                {/* MENU OPTIONS */}

                <div className="p-2">

                  {/* SETTINGS */}

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      nav("/settings");
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-sm
                      font-medium
                      text-slate-600
                      transition
                      duration-200
                      hover:bg-blue-50
                      hover:text-blue-600
                    "
                  >
                    <div
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-slate-100
                      "
                    >
                      <Settings size={16} />
                    </div>

                    Settings
                  </button>

                </div>

                {/* LOGOUT SECTION */}

                <div
                  className="
                    border-t
                    border-slate-100
                    p-2
                  "
                >
                  <button
                    onClick={handleLogout}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-sm
                      font-semibold
                      text-red-500
                      transition
                      duration-200
                      hover:bg-red-50
                    "
                  >
                    <div
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-red-50
                      "
                    >
                      <LogOut size={16} />
                    </div>

                    Logout
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </header>
  );
}