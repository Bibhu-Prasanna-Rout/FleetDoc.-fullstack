import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  X,
  Bell,
  Mail,
  MessageSquareMore,
  MessageCircleMoreIcon,
  CalendarClock,
  Settings2,
  ShieldCheck,
  Sparkles,
  Save,
  ChevronDown,
  Clock,
  MessageCircleMore,
} from "lucide-react";

import PageHeader from "../components/PageHeader";
import { useFleet } from "../context/fleetContext";

export default function Reminders() {
  const { settings, updateSettings } = useFleet();

  /* =========================================================
     REMINDER DAYS
  ========================================================= */

  const [reminderDays, setReminderDays] = useState(
    Number(settings?.reminderDays ?? 10)
  );

  /* =========================================================
     NOTIFICATION SETTINGS
  ========================================================= */

  const [dashboardNotifications, setDashboardNotifications] =
    useState(settings?.dashboardNotifications ?? true);

  const [emailNotifications, setEmailNotifications] = useState(
    settings?.emailNotifications ?? true
  );

  const [smsNotifications, setSmsNotifications] = useState(
    settings?.smsNotifications ?? false
  );

  const [whatsappNotifications, setWhatsappNotifications] =
    useState(settings?.whatsappNotifications ?? false);

  /* =========================================================
     DASHBOARD WARNING MODAL
  ========================================================= */

  const [showDashboardWarning, setShowDashboardWarning] =
    useState(false);

  /* =========================================================
     SAVE FEEDBACK
  ========================================================= */

  const [saved, setSaved] = useState(false);

  /* =========================================================
     SYNC LOCAL STATE WITH FLEET CONTEXT
  ========================================================= */

  useEffect(() => {
    setReminderDays(Number(settings?.reminderDays ?? 10));

    setDashboardNotifications(
      settings?.dashboardNotifications ?? true
    );

    setEmailNotifications(
      settings?.emailNotifications ?? true
    );

    setSmsNotifications(
      settings?.smsNotifications ?? false
    );

    setWhatsappNotifications(
      settings?.whatsappNotifications ?? false
    );
  }, [settings]);

  /* =========================================================
     REMINDER DAYS CHANGE
  ========================================================= */

  const handleReminderDaysChange = (event) => {
    const value = Number(event.target.value);

    setReminderDays(value);

    updateSettings({
      reminderDays: value,
    });
  };

  /* =========================================================
     DASHBOARD NOTIFICATION TOGGLE
  ========================================================= */

  const handleDashboardToggle = () => {
    if (dashboardNotifications) {
      setShowDashboardWarning(true);
      return;
    }

    setDashboardNotifications(true);

    updateSettings({
      dashboardNotifications: true,
    });
  };

  /* =========================================================
     CONFIRM DASHBOARD NOTIFICATION OFF
  ========================================================= */

  const confirmDashboardOff = () => {
    setDashboardNotifications(false);

    updateSettings({
      dashboardNotifications: false,
    });

    setShowDashboardWarning(false);
  };

  /* =========================================================
     CANCEL DASHBOARD NOTIFICATION OFF
  ========================================================= */

  const cancelDashboardOff = () => {
    setShowDashboardWarning(false);

    setDashboardNotifications(true);
  };

  /* =========================================================
     EMAIL TOGGLE
  ========================================================= */

  const handleEmailToggle = () => {
    const newValue = !emailNotifications;

    setEmailNotifications(newValue);

    updateSettings({
      emailNotifications: newValue,
    });
  };

  /* =========================================================
     SMS TOGGLE
  ========================================================= */

  const handleSmsToggle = () => {
    const newValue = !smsNotifications;

    setSmsNotifications(newValue);

    updateSettings({
      smsNotifications: newValue,
    });
  };

  /* =========================================================
     WHATSAPP TOGGLE
  ========================================================= */

  const handleWhatsappToggle = () => {
    const newValue = !whatsappNotifications;

    setWhatsappNotifications(newValue);

    updateSettings({
      whatsappNotifications: newValue,
    });
  };

  /* =========================================================
     SAVE SETTINGS
  ========================================================= */

  const handleSaveSettings = () => {
    updateSettings({
      reminderDays,
      dashboardNotifications,
      emailNotifications,
      smsNotifications,
      whatsappNotifications,
    });

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2200);
  };

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
        duration: 0.45,
        ease: "easeOut",
      },
    },
  };

  const notificationItems = [
    {
      title: "Dashboard Notifications",
      description:
        "Receive automatic reminders through dashboard notifications.",
      icon: Bell,
      enabled: dashboardNotifications,
      toggle: handleDashboardToggle,
      iconClass: "bg-blue-100 text-blue-600",
      activeClass: "border-blue-200 bg-blue-50/70",
      glowClass: "shadow-blue-100",
    },
    {
      title: "Email Notifications",
      description:
        "Receive automatic reminders through email notifications.",
      icon: Mail,
      enabled: emailNotifications,
      toggle: handleEmailToggle,
      iconClass: "bg-violet-100 text-violet-600",
      activeClass: "border-violet-200 bg-violet-50/70",
      glowClass: "shadow-violet-100",
    },
    {
      title: "SMS Notifications",
      description:
        "Receive automatic reminders through SMS notifications.",
      icon: MessageSquareMore,
      enabled: smsNotifications,
      toggle: handleSmsToggle,
      iconClass: "bg-emerald-100 text-emerald-600",
      activeClass: "border-emerald-200 bg-emerald-50/70",
      glowClass: "shadow-emerald-100",
    },
    {
      title: "WhatsApp Notifications",
      description:
        "Receive automatic reminders through WhatsApp notifications.",
      icon: MessageCircleMore,
      enabled: whatsappNotifications,
      toggle: handleWhatsappToggle,
      iconClass: "bg-green-100 text-green-600",
      activeClass: "border-green-200 bg-green-50/70",
      glowClass: "shadow-green-100",
    },
  ];

  return (
    <>
      <PageHeader
        title={
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 transition duration-300 hover:scale-110 hover:rotate-3">
                <Clock
                  size={23}
                  strokeWidth={2.3}
                />
              </div>
              <div>
                <span className="block text-2xl font-bold text-slate-800">
                  Reminder Settings
                </span>
              </div>
            </div>
          }
          subtitle="Configure expiry and payment reminders."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-5xl pb-8"
      >
        {/* =====================================================
            HERO / INTRO CARD
        ===================================================== */}

        <motion.div
          variants={itemVariants}
          whileHover={{
            y: -3,
          }}
          className="
            relative
            mb-6
            overflow-hidden
            rounded-2xl
            border
            border-blue-100
            bg-gradient-to-br
            from-blue-600
            via-indigo-600
            to-violet-600
            p-6
            text-white
            shadow-lg
            shadow-blue-100
            transition-shadow
            duration-300
            hover:shadow-xl
          "
        >
          {/* Decorative circles */}

          <motion.div
            animate={{
              x: [0, 15, 0],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              absolute
              -right-10
              -top-10
              h-40
              w-40
              rounded-full
              bg-white/10
              blur-2xl
            "
          />

          <motion.div
            animate={{
              x: [0, -10, 0],
              y: [0, 10, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              absolute
              -bottom-16
              -left-10
              h-44
              w-44
              rounded-full
              bg-white/10
              blur-2xl
            "
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{
                  rotate: [0, -8, 8, -5, 0],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  repeatDelay: 5,
                }}
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white/15
                  shadow-lg
                  backdrop-blur-md
                  ring-1
                  ring-white/20
                "
              >
                <Clock size={27} />
              </motion.div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <h2 className="text-xl font-bold">
                    Smart Reminders
                  </h2>

                  <Sparkles
                    size={16}
                    className="text-yellow-200"
                  />
                </div>

                <p className="max-w-xl text-sm leading-6 text-blue-100">
                  Keep track of vehicle documents and never miss
                  an important expiry or payment date.
                </p>
              </div>
            </div>

            <div
              className="
                rounded-xl
                border
                border-white/20
                bg-white/10
                px-4
                py-3
                backdrop-blur-md
              "
            >
              <p className="text-xs text-blue-100">
                Current reminder
              </p>

              <p className="mt-1 text-lg font-bold">
                {reminderDays} days
              </p>
            </div>
          </div>
        </motion.div>

        {/* =====================================================
            MAIN SETTINGS CARD
        ===================================================== */}

        <motion.div
          variants={itemVariants}
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >
          {/* ===================================================
              CARD HEADER
          =================================================== */}

          <div
            className="
              border-b
              border-slate-100
              bg-gradient-to-r
              from-slate-50
              via-white
              to-blue-50/40
              px-6
              py-5
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-100
                  text-blue-600
                "
              >
                <Settings2 size={21} />
              </div>

              <div>
                <h3 className="font-bold text-slate-800">
                  Notification Preferences
                </h3>

                <p className="mt-0.5 text-sm text-slate-500">
                  Manage when and where FleetDoc. sends reminders.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* =================================================
                REMINDER DAYS
            ================================================= */}

            <motion.div
              whileHover={{
                scale: 1.005,
              }}
              className="
                rounded-2xl
                border
                border-blue-100
                bg-gradient-to-br
                from-blue-50/70
                via-white
                to-indigo-50/50
                p-5
                transition-all
                duration-300
                hover:border-blue-200
                hover:shadow-md
              "
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <motion.div
                    whileHover={{
                      scale: 1.08,
                      rotate: 5,
                    }}
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-gradient-to-br
                      from-blue-500
                      to-indigo-600
                      text-white
                      shadow-lg
                      shadow-blue-200
                    "
                  >
                    <CalendarClock size={22} />
                  </motion.div>

                  <div>
                    <h3 className="font-bold text-slate-800">
                      Reminder Days Before Expiry
                    </h3>

                    <p className="mt-1 max-w-xl text-sm leading-5 text-slate-500">
                      Choose how many days before expiry FleetDoc.
                      should mark a document as "Expiring Soon".
                    </p>
                  </div>
                </div>

                {/* SELECT */}

                <div className="relative w-full md:w-56">
                  <select
                    value={reminderDays}
                    onChange={handleReminderDaysChange}
                    className="
                      h-12
                      w-full
                      appearance-none
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      pr-10
                      text-sm
                      font-semibold
                      text-slate-700
                      shadow-sm
                      outline-none
                      transition-all
                      duration-200
                      hover:border-blue-300
                      hover:shadow-md
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-100
                    "
                  >
                    <option value={5}>
                      5 Days Before
                    </option>

                    <option value={10}>
                      10 Days Before
                    </option>

                    <option value={15}>
                      15 Days Before
                    </option>

                    <option value={30}>
                      30 Days Before
                    </option>
                  </select>

                  <ChevronDown
                    size={18}
                    className="
                      pointer-events-none
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />
                </div>
              </div>

              {/* QUICK OPTIONS */}

              <div className="mt-5 flex flex-wrap gap-2">
                {[5, 10, 15, 30].map((days) => (
                  <motion.button
                    key={days}
                    type="button"
                    whileHover={{
                      y: -2,
                    }}
                    whileTap={{
                      scale: 0.95,
                    }}
                    onClick={() => {
                      setReminderDays(days);

                      updateSettings({
                        reminderDays: days,
                      });
                    }}
                    className={`
                      rounded-lg
                      border
                      px-3
                      py-2
                      text-xs
                      font-semibold
                      transition-all
                      duration-200
                      ${
                        reminderDays === days
                          ? "border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      }
                    `}
                  >
                    {days} Days
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* =================================================
                DIVIDER
            ================================================= */}

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-100" />

              <span
                className="
                  rounded-full
                  bg-slate-100
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  text-slate-500
                "
              >
                Notification Channels
              </span>

              <div className="h-px flex-1 bg-slate-100" />
            </div>

            {/* =================================================
                NOTIFICATION CHANNELS
            ================================================= */}

            <div className="space-y-3">
              {notificationItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    initial={{
                      opacity: 0,
                      x: -15,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.08,
                      duration: 0.4,
                    }}
                    whileHover={{
                      x: 4,
                    }}
                    className={`
                      group
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      p-4
                      transition-all
                      duration-300
                      ${
                        item.enabled
                          ? `${item.activeClass} shadow-sm`
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }
                    `}
                  >
                    {/* Active glow */}

                    {item.enabled && (
                      <motion.div
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        className="
                          absolute
                          left-0
                          top-0
                          h-full
                          w-1
                          bg-gradient-to-b
                          from-blue-500
                          to-indigo-500
                        "
                      />
                    )}

                    <div className="relative flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <motion.div
                          whileHover={{
                            scale: 1.08,
                            rotate: 4,
                          }}
                          className={`
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            transition-all
                            duration-300
                            ${
                              item.enabled
                                ? item.iconClass
                                : "bg-slate-100 text-slate-400"
                            }
                          `}
                        >
                          <Icon size={21} />
                        </motion.div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-800">
                              {item.title}
                            </h3>

                            {item.enabled && (
                              <span
                                className="
                                  rounded-full
                                  bg-emerald-100
                                  px-2
                                  py-0.5
                                  text-[10px]
                                  font-bold
                                  uppercase
                                  tracking-wide
                                  text-emerald-700
                                "
                              >
                                Active
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm leading-5 text-slate-500">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* TOGGLE */}

                      <motion.button
                        type="button"
                        onClick={item.toggle}
                        whileTap={{
                          scale: 0.9,
                        }}
                        aria-label={`Toggle ${item.title}`}
                        className={`
                          relative
                          h-8
                          w-14
                          shrink-0
                          rounded-full
                          p-1
                          transition-all
                          duration-300
                          ${
                            item.enabled
                              ? "bg-blue-600 shadow-md shadow-blue-200"
                              : "bg-slate-200 hover:bg-slate-300"
                          }
                        `}
                      >
                        <motion.span
                          layout
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                          className="
                            block
                            h-6
                            w-6
                            rounded-full
                            bg-white
                            shadow-sm
                          "
                          style={{
                            marginLeft: item.enabled
                              ? "24px"
                              : "0px",
                          }}
                        />

                        {item.enabled && (
                          <motion.span
                            initial={{
                              opacity: 0,
                              scale: 0,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                            }}
                            className="
                              absolute
                              inset-0
                              rounded-full
                              ring-2
                              ring-blue-300/40
                            "
                          />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* =================================================
                INFO BOX
            ================================================= */}

            <motion.div
              variants={itemVariants}
              className="
                mt-6
                flex
                gap-3
                rounded-xl
                border
                border-emerald-100
                bg-emerald-50
                p-4
              "
            >
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Your settings are saved locally
                </p>

                <p className="mt-1 text-xs leading-5 text-emerald-700">
                  Notification preferences are connected to the
                  FleetDoc settings system and can later be connected
                  to backend Email, SMS or WhatsApp services.
                </p>
              </div>
            </motion.div>

            {/* =================================================
                SAVE BUTTON
            ================================================= */}

            <div className="mt-7 flex justify-end">
              <motion.button
                type="button"
                onClick={handleSaveSettings}
                whileHover={{
                  scale: 1.03,
                  y: -2,
                }}
                whileTap={{
                  scale: 0.96,
                }}
                className="
                  group
                  relative
                  flex
                  min-w-[170px]
                  items-center
                  justify-center
                  gap-2
                  overflow-hidden
                  rounded-xl
                  bg-gradient-to-r
                  from-blue-600
                  to-indigo-600
                  px-6
                  py-3
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-blue-200
                  transition-all
                  duration-300
                  hover:from-blue-700
                  hover:to-indigo-700
                  hover:shadow-xl
                  hover:shadow-blue-200
                "
              >
                <AnimatePresence mode="wait">
                  {saved ? (
                    <motion.span
                      key="saved"
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
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      Settings Saved
                    </motion.span>
                  ) : (
                    <motion.span
                      key="save"
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
                      className="flex items-center gap-2"
                    >
                      <Save
                        size={18}
                        className="
                          transition-transform
                          duration-300
                          group-hover:-translate-y-0.5
                        "
                      />
                      Save Settings
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* =======================================================
          DASHBOARD NOTIFICATION WARNING MODAL
      ======================================================= */}

      <AnimatePresence>
        {showDashboardWarning && (
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
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-slate-900/50
              px-4
              backdrop-blur-sm
            "
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 25,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 15,
              }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 25,
              }}
              className="
                w-full
                max-w-md
                overflow-hidden
                rounded-2xl
                bg-white
                shadow-2xl
              "
            >
              {/* Modal Top */}

              <div
                className="
                  relative
                  overflow-hidden
                  bg-gradient-to-r
                  from-amber-500
                  to-orange-500
                  px-6
                  py-5
                  text-white
                "
              >
                <div
                  className="
                    absolute
                    -right-10
                    -top-10
                    h-28
                    w-28
                    rounded-full
                    bg-white/10
                  "
                />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{
                        rotate: [0, -8, 8, 0],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-full
                        bg-white/15
                        backdrop-blur-sm
                      "
                    >
                      <AlertTriangle size={23} />
                    </motion.div>

                    <div>
                      <h2 className="text-lg font-bold">
                        Disable Notifications?
                      </h2>

                      <p className="text-xs text-amber-100">
                        Please confirm this change
                      </p>
                    </div>
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
                    onClick={cancelDashboardOff}
                    className="
                      rounded-lg
                      p-1.5
                      text-white/80
                      transition
                      hover:bg-white/15
                      hover:text-white
                    "
                    aria-label="Close warning"
                  >
                    <X size={19} />
                  </motion.button>
                </div>
              </div>

              {/* Modal Body */}

              <div className="p-6">
                <p className="text-sm leading-6 text-slate-600">
                  If you turn off Dashboard Notifications,
                  reminder and expiry information will no longer
                  be shown through the dashboard notification system.
                </p>

                <div
                  className="
                    mt-5
                    rounded-xl
                    border
                    border-amber-200
                    bg-gradient-to-r
                    from-amber-50
                    to-orange-50
                    p-4
                  "
                >
                  <div className="flex gap-3">
                    <div
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-amber-100
                      "
                    >
                      <AlertTriangle
                        size={17}
                        className="text-amber-600"
                      />
                    </div>

                    <p className="text-sm leading-5 text-amber-800">
                      Other notification methods such as Email,
                      SMS and WhatsApp will not be changed.
                    </p>
                  </div>
                </div>

                {/* Modal Buttons */}

                <div className="mt-6 flex justify-end gap-3">
                  <motion.button
                    type="button"
                    whileHover={{
                      y: -1,
                    }}
                    whileTap={{
                      scale: 0.96,
                    }}
                    onClick={cancelDashboardOff}
                    className="
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-slate-700
                      transition-all
                      hover:border-slate-300
                      hover:bg-slate-50
                      hover:shadow-sm
                    "
                  >
                    No
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
                    onClick={confirmDashboardOff}
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-gradient-to-r
                      from-red-500
                      to-red-600
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      shadow-md
                      shadow-red-100
                      transition-all
                      hover:from-red-600
                      hover:to-red-700
                      hover:shadow-lg
                    "
                  >
                    <CheckCircle2 size={16} />
                    Yes, Turn Off
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}