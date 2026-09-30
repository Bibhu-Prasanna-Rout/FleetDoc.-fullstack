
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Save,
  Upload,
  Car,
  Truck,
  Landmark,
  FileText,
  IndianRupee,
  Percent,
  Calendar,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  FileCheck2,
  ArrowRight,
  AlertCircle,
  CreditCard,
  X,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useFleet } from "../context/fleetContext";

/* =========================================================
   ANIMATION VARIANTS
========================================================= */

const pageVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const containerVariants = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 18,
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
   ANIMATED FORM FIELD WRAPPER
========================================================= */

function FormField({
  children,
  className = "",
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        y: -2,
      }}
      transition={{
        duration: 0.2,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* =========================================================
   ADD LOAN
========================================================= */

export default function AddLoan() {
  const navigate = useNavigate();

  /*
    IMPORTANT:
    Settings se EMI duration read kiya ja raha hai.
  */

  const {
    vehicles = [],
    addLoan,
    settings = {},
  } = useFleet();

  /*
    Settings ke possible values ko normalize karte hain.
  */

  const configuredLoanDuration = String(
    settings?.loanDuration ??
      settings?.defaultLoanDuration ??
      "60"
  );

  const initialDuration =
    configuredLoanDuration === "dateRange" ||
    settings?.loanDurationMode === "dateRange"
      ? "dateRange"
      : ["36", "48", "60", "72"].includes(
          configuredLoanDuration
        )
      ? configuredLoanDuration
      : "60";

  /* =========================================================
     FORM STATE
  ========================================================= */

  const [form, setForm] = useState({
    vehicleNumber: "",
    financerBank: "",
    loanNumber: "",
    loanAmount: "",
    emiAmount: "",
    interestRate: "",

    durationType: initialDuration,

    tenureMonths:
      initialDuration === "dateRange"
        ? ""
        : initialDuration,

    emiStartDate: "",
    emiClosingDate: "",
    remarks: "",

    /*
      DOCUMENT INFORMATION

      fileName  = original file name
      fileData  = actual Data URL
      fileType  = MIME type
      fileSize  = file size in bytes
    */
    fileName: "",
    fileData: "",
    fileType: "",
    fileSize: "",
  });

  const [fileError, setFileError] = useState("");
  const [fileVerified, setFileVerified] = useState(false);

  /* =========================================================
     VEHICLE SEARCH DROPDOWN STATE
  ========================================================= */

  const [vehicleSearch, setVehicleSearch] = useState("");

  const [showVehicleDropdown, setShowVehicleDropdown] =
    useState(false);

  const vehicleDropdownRef = useRef(null);

  /* =========================================================
     ALERT STATE
  ========================================================= */

  const [alertData, setAlertData] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  /* =========================================================
     VEHICLE NORMALIZATION
  ========================================================= */

  const normalizeVehicleNumber = (value) => {
    return String(value || "")
      .replace(/\s+/g, "")
      .trim()
      .toUpperCase();
  };

  /* =========================================================
     FILTER VEHICLES
  ========================================================= */

  const filteredVehicles = vehicles.filter(
    (vehicle) => {
      const vehicleNumber = normalizeVehicleNumber(
        vehicle?.number
      );

      const searchValue =
        normalizeVehicleNumber(vehicleSearch);

      if (!searchValue) {
        return true;
      }

      return vehicleNumber.includes(searchValue);
    }
  );

  /* =========================================================
     CLOSE VEHICLE DROPDOWN WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        vehicleDropdownRef.current &&
        !vehicleDropdownRef.current.contains(
          event.target
        )
      ) {
        setShowVehicleDropdown(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* =========================================================
     SHOW ALERT
  ========================================================= */

  const showAlert = (
    type,
    title,
    message
  ) => {
    setAlertData({
      show: true,
      type,
      title,
      message,
    });

    setTimeout(() => {
      setAlertData((prev) => ({
        ...prev,
        show: false,
      }));
    }, 4000);
  };

  /* =========================================================
     HANDLE NORMAL INPUT CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     HANDLE VEHICLE SEARCH
  ========================================================= */

  const handleVehicleSearch = (e) => {
    const value = e.target.value;

    setVehicleSearch(value);

    /*
      When the user starts typing again,
      clear the selected vehicle until a valid
      vehicle is selected.
    */

    setForm((prev) => ({
      ...prev,
      vehicleNumber: "",
    }));

    /*
      When typing starts, keep/open the dropdown.
    */

    setShowVehicleDropdown(true);
  };

  /* =========================================================
     TOGGLE VEHICLE DROPDOWN
     
     IMPORTANT:
     Clicking the vehicle field or ChevronDown
     will open/close the dropdown.
  ========================================================= */

  const toggleVehicleDropdown = () => {
    setShowVehicleDropdown((prev) => !prev);
  };

  /* =========================================================
     SELECT VEHICLE
  ========================================================= */

  const handleVehicleSelect = (vehicle) => {
    const vehicleNumber =
      vehicle?.number || "";

    setForm((prev) => ({
      ...prev,
      vehicleNumber,
    }));

    setVehicleSearch(vehicleNumber);

    /*
      Close dropdown after selecting vehicle.
    */

    setShowVehicleDropdown(false);
  };

  /* =========================================================
     VEHICLE INPUT FOCUS
  ========================================================= */

  const handleVehicleFocus = () => {
    /*
      Keep the currently selected vehicle/search
      text visible when the field receives focus.
      
      We intentionally DO NOT open the dropdown here.
      Opening/closing is controlled by click.
    */

    setVehicleSearch(
      form.vehicleNumber || vehicleSearch
    );
  };

  /* =========================================================
     HANDLE EMI DURATION TYPE
  ========================================================= */

  const handleDurationTypeChange = (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,

      durationType: value,

      tenureMonths:
        value === "dateRange"
          ? ""
          : value,
    }));
  };

  /* =========================================================
     FILE UPLOAD
  ========================================================= */

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    /* =======================================================
       FILE TYPE VALIDATION
    ======================================================= */

    if (!allowedTypes.includes(file.type)) {
      setFileError(
        "Please upload a valid PDF, JPG, JPEG or PNG file."
      );

      setForm((prev) => ({
        ...prev,
        fileName: "",
        fileData: "",
        fileType: "",
        fileSize: "",
      }));

      setFileVerified(false);

      showAlert(
        "error",
        "Invalid Document",
        "Please upload a valid PDF, JPG, JPEG or PNG file."
      );

      return;
    }

    /* =======================================================
       FILE SIZE VALIDATION
    ======================================================= */

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setFileError(
        "File size must be less than 10MB."
      );

      setForm((prev) => ({
        ...prev,
        fileName: "",
        fileData: "",
        fileType: "",
        fileSize: "",
      }));

      setFileVerified(false);

      showAlert(
        "error",
        "File Too Large",
        "The uploaded document must be less than 10MB."
      );

      return;
    }

    setFileError("");
    setFileVerified(false);

    /* =======================================================
       READ ACTUAL FILE DATA

       IMPORTANT:
       Previously only fileName was saved.

       Now the complete document is converted into
       a Data URL so EMI.jsx can open it later.
    ======================================================= */

    const reader = new FileReader();

    reader.onload = () => {
      const fileData =
        typeof reader.result === "string"
          ? reader.result
          : "";

      setForm((prev) => ({
        ...prev,

        fileName: file.name,

        fileData,

        fileType:
          file.type ||
          "application/octet-stream",

        fileSize: file.size,
      }));

      showAlert(
        "info",
        "Document Uploaded",
        "Your loan document has been uploaded. Please verify it before saving."
      );
    };

    reader.onerror = () => {
      setFileError(
        "Unable to read the selected document."
      );

      setForm((prev) => ({
        ...prev,
        fileName: "",
        fileData: "",
        fileType: "",
        fileSize: "",
      }));

      setFileVerified(false);

      showAlert(
        "error",
        "Upload Failed",
        "Unable to read the selected document."
      );
    };

    reader.readAsDataURL(file);
  };

  /* =========================================================
     VERIFY DOCUMENT
  ========================================================= */

  const handleVerifyDocument = () => {
    if (
      !form.fileName ||
      !form.fileData
    ) {
      showAlert(
        "error",
        "Document Required",
        "Please upload a valid document before verification."
      );

      return;
    }

    if (fileError) {
      showAlert(
        "error",
        "Invalid Document",
        "Please upload a valid document before verification."
      );

      return;
    }

    setFileVerified(true);

    showAlert(
      "success",
      "Document Verified",
      "Your loan document has been verified successfully."
    );
  };

  /* =========================================================
     VALIDATE EMI DATE RANGE
  ========================================================= */

  const validateEMIDates = () => {
    if (
      !form.emiStartDate ||
      !form.emiClosingDate
    ) {
      return false;
    }

    const startDate = new Date(
      `${form.emiStartDate}T00:00:00`
    );

    const closingDate = new Date(
      `${form.emiClosingDate}T00:00:00`
    );

    return closingDate > startDate;
  };

  /* =========================================================
     SAVE LOAN
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* =======================================================
       REQUIRED FIELDS
    ======================================================= */

    if (
      !form.vehicleNumber ||
      !form.financerBank ||
      !form.loanNumber ||
      !form.loanAmount ||
      !form.emiAmount ||
      !form.emiStartDate ||
      !form.emiClosingDate
    ) {
      showAlert(
        "error",
        "Required Fields Missing",
        "Please fill all required fields."
      );

      return;
    }

    /* =======================================================
       DATE RANGE VALIDATION
    ======================================================= */

    if (!validateEMIDates()) {
      showAlert(
        "error",
        "Invalid EMI Dates",
        "EMI Closing Date must be greater than EMI Start Date."
      );

      return;
    }

    /* =======================================================
       FIXED TENURE VALIDATION
    ======================================================= */

    if (
      form.durationType !== "dateRange" &&
      !form.tenureMonths
    ) {
      showAlert(
        "error",
        "EMI Duration Required",
        "Please select an EMI duration."
      );

      return;
    }

    /* =======================================================
       NORMALIZE EMI DURATION
    ======================================================= */

    const isDateRange =
      form.durationType ===
      "dateRange";

    const normalizedTenureMonths =
      isDateRange
        ? null
        : Number(form.tenureMonths);

    /* =======================================================
       SAVE LOAN DATA
    ======================================================= */

    const result = await addLoan({

      vehicleNumber:
        form.vehicleNumber,

      financerBank:
        form.financerBank,

      loanNumber:
        form.loanNumber,

      loanAmount:
        Number(form.loanAmount),

      emiAmount:
        Number(form.emiAmount),

      interestRate:
        Number(
          form.interestRate || 0
        ),

      durationType:
        isDateRange
          ? "dateRange"
          : "months",

      loanDuration:
        isDateRange
          ? "dateRange"
          : String(
              form.tenureMonths
            ),

      tenureMonths:
        normalizedTenureMonths,

      emiStartDate:
        form.emiStartDate,

      emiClosingDate:
        form.emiClosingDate,

      emiEndDate:
        form.emiClosingDate,

      remarks:
        form.remarks,

      /* =====================================================
         DOCUMENT DATA

         IMPORTANT:
         Actual file data is now saved.
      ===================================================== */

      fileName:
        form.fileName,

      fileData:
        form.fileData,

      fileType:
        form.fileType,

      fileSize:
        form.fileSize,

      verified:
        fileVerified,

      createdAt:
        new Date().toISOString(),
    });

    /* =======================================================
       SUCCESS
    ======================================================= */

    if (
      result?.success !== false
    ) {
      showAlert(
        "success",
        "Loan Saved",
        "Your loan has been added successfully."
      );

      setTimeout(() => {
        navigate("/emi");
      }, 1200);
    }
  };

  return (
    <>
      {/* =====================================================
          CUSTOM ALERT
      ===================================================== */}

      <AnimatePresence>
        {alertData.show && (
          <motion.div
            initial={{
              opacity: 0,
              x: 100,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              x: 100,
              scale: 0.95,
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            className="
              fixed
              right-5
              top-5
              z-50
              w-[90%]
              max-w-md
            "
          >
            <div
              className={`
                flex
                items-start
                gap-4
                rounded-2xl
                border
                p-4
                shadow-2xl
                backdrop-blur-xl
                transition
                ${
                  alertData.type === "success"
                    ? "border-emerald-200 bg-emerald-50"
                    : alertData.type === "error"
                    ? "border-red-200 bg-red-50"
                    : "border-blue-200 bg-blue-50"
                }
              `}
            >
              <motion.div
                initial={{
                  scale: 0.7,
                  rotate: -10,
                }}
                animate={{
                  scale: 1,
                  rotate: 0,
                }}
                transition={{
                  delay: 0.1,
                }}
                className={`
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  ${
                    alertData.type ===
                    "success"
                      ? "bg-emerald-100 text-emerald-600"
                      : alertData.type ===
                        "error"
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600"
                  }
                `}
              >
                {alertData.type ===
                  "success" && (
                  <CheckCircle2
                    size={21}
                  />
                )}

                {alertData.type ===
                  "error" && (
                  <AlertCircle
                    size={21}
                  />
                )}

                {alertData.type ===
                  "info" && (
                  <FileText
                    size={21}
                  />
                )}
              </motion.div>

              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">
                  {alertData.title}
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {alertData.message}
                </p>
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
                onClick={() =>
                  setAlertData(
                    (prev) => ({
                      ...prev,
                      show: false,
                    })
                  )
                }
                className="
                  text-slate-400
                  transition
                  hover:text-slate-700
                "
              >
                <X size={18} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: -15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
        }}
      >
        <PageHeader
          title={
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 transition duration-300 hover:scale-110 hover:rotate-3">
                <CreditCard
                  size={23}
                  strokeWidth={2.3}
                />
              </div>

              <div>
                <span className="block text-2xl font-bold text-slate-800">
                  Add New Loan
                </span>
              </div>
            </div>
          }
          subtitle="Enter vehicle loan and EMI details."
        />
      </motion.div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="pb-8"
      >
        <motion.form
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-slate-100
            bg-white
            p-6
            shadow-sm
            transition-shadow
            duration-500
            hover:shadow-xl
          "
          onSubmit={handleSubmit}
          whileHover={{
            y: -2,
          }}
          transition={{
            duration: 0.25,
          }}
        >
          {/* TOP DECORATIVE LINE */}

          <motion.div
            initial={{
              width: 0,
            }}
            animate={{
              width: "100%",
            }}
            transition={{
              duration: 0.8,
              delay: 0.2,
            }}
            className="
              absolute
              left-0
              top-0
              h-1
              bg-gradient-to-r
              from-blue-500
              via-indigo-500
              to-cyan-400
            "
          />

          {/* FORM INTRO */}

          <motion.div
            variants={itemVariants}
            className="
              mb-7
              flex
              flex-col
              gap-4
              rounded-2xl
              border
              border-blue-100
              bg-gradient-to-r
              from-blue-50
              via-indigo-50
              to-white
              p-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{
                  scale: 1.08,
                  rotate: 4,
                }}
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-blue-600
                  text-white
                  shadow-lg
                  shadow-blue-200
                "
              >
                <Landmark
                  size={27}
                />
              </motion.div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-800">
                    Loan Information
                  </h2>

                  <motion.span
                    animate={{
                      rotate: [
                        0,
                        8,
                        -8,
                        0,
                      ],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                    className="text-blue-500"
                  >
                    <Sparkles
                      size={17}
                    />
                  </motion.span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Add financing and EMI details for your vehicle.
                </p>
              </div>
            </div>

            <div
              className="
                flex
                items-center
                gap-2
                self-start
                rounded-full
                border
                border-emerald-100
                bg-emerald-50
                px-3
                py-2
                text-xs
                font-semibold
                text-emerald-700
                sm:self-center
              "
            >
              <ShieldCheck
                size={15}
              />
              Secure Record
            </div>
          </motion.div>

          {/* FORM GRID */}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-5 md:grid-cols-2"
          >
            {/* =================================================
                VEHICLE NUMBER - SEARCHABLE DROPDOWN
            ================================================= */}

            <FormField
              className={
                showVehicleDropdown
                  ? "relative z-[60]"
                  : "relative z-10"
              }
            >
              <label className="label">
                Vehicle Number

                <motion.span
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  className="ml-1 text-red-500"
                >
                  *
                </motion.span>
              </label>

              <div
                ref={vehicleDropdownRef}
                className="group relative"
              >
                {/* VEHICLE ICON */}

                <motion.div
                  whileHover={{
                    scale: 1.12,
                  }}
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    z-20
                    -translate-y-1/2
                    text-slate-500
                    transition-colors
                    group-focus-within:text-blue-600
                  "
                >
                  <Truck
                    size={18}
                    strokeWidth={2.1}
                  />
                </motion.div>

                {/* SEARCH INPUT */}

                <input
                  required
                  type="text"
                  name="vehicleNumber"
                  value={vehicleSearch}
                  onFocus={
                    handleVehicleFocus
                  }
                  onClick={
                    toggleVehicleDropdown
                  }
                  onChange={
                    handleVehicleSearch
                  }
                  placeholder="Select Vehicle Number"
                  autoComplete="off"
                  className="
                    input
                    pl-10
                    pr-10
                    transition-all
                    duration-300
                    hover:border-blue-300
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />

                {/* DROPDOWN ARROW */}

                <ChevronDown
                  size={18}
                  onClick={
                    toggleVehicleDropdown
                  }
                  className={`
                    absolute
                    right-3
                    top-1/2
                    z-20
                    -translate-y-1/2
                    cursor-pointer
                    text-slate-400
                    transition
                    duration-300
                    ${
                      showVehicleDropdown
                        ? "rotate-180 text-blue-600"
                        : ""
                    }
                  `}
                />

                {/* =================================================
                    VEHICLE DROPDOWN
                ================================================= */}

                <AnimatePresence>
                  {showVehicleDropdown && (
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
                      transition={{
                        duration: 0.18,
                        ease: "easeOut",
                      }}
                      className="
                        absolute
                        left-0
                        right-0
                        top-full
                        z-50
                        mt-2
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-xl
                      "
                    >
                      <div className="max-h-64 overflow-y-auto p-1.5">
                        {filteredVehicles.length >
                        0 ? (
                          filteredVehicles.map(
                            (vehicle) => {
                              const number =
                                vehicle?.number ||
                                "";

                              const isSelected =
                                normalizeVehicleNumber(
                                  form.vehicleNumber
                                ) ===
                                normalizeVehicleNumber(
                                  number
                                );

                              return (
                                <button
                                  key={
                                    vehicle.id ||
                                    number
                                  }
                                  type="button"
                                  onMouseDown={(
                                    event
                                  ) => {
                                    event.preventDefault();

                                    handleVehicleSelect(
                                      vehicle
                                    );
                                  }}
                                  className={`
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    rounded-xl
                                    px-3
                                    py-3
                                    text-left
                                    transition-all
                                    duration-200
                                    ${
                                      isSelected
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
                                    }
                                  `}
                                >
                                  <span
                                    className={`
                                      flex
                                      h-8
                                      w-8
                                      shrink-0
                                      items-center
                                      justify-center
                                      rounded-lg
                                      ${
                                        isSelected
                                          ? "bg-blue-100 text-blue-600"
                                          : "bg-slate-100 text-slate-500"
                                      }
                                    `}
                                  >
                                    <Truck
                                      size={17}
                                      strokeWidth={
                                        2.1
                                      }
                                    />
                                  </span>

                                  <span className="font-medium">
                                    {number}
                                  </span>

                                  {isSelected && (
                                    <CheckCircle2
                                      size={16}
                                      className="ml-auto text-blue-600"
                                    />
                                  )}
                                </button>
                              );
                            }
                          )
                        ) : (
                          <div
                            className="
                              flex
                              items-center
                              gap-3
                              px-4
                              py-4
                              text-sm
                              text-slate-400
                            "
                          >
                            <Truck
                              size={18}
                              className="text-slate-300"
                            />

                            <span>
                              No vehicle found
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FormField>

            {/* =================================================
                FINANCER BANK
            ================================================= */}

            <FormField>
              <label className="label">
                Financer Bank
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="group relative">
                <Landmark
                  size={18}
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-indigo-500
                    transition-colors
                    group-focus-within:text-indigo-600
                  "
                />

                <input
                  required
                  type="text"
                  name="financerBank"
                  value={
                    form.financerBank
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter financer bank name"
                  className="
                    input
                    pl-10
                    transition-all
                    duration-300
                    hover:border-blue-300
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />
              </div>
            </FormField>

            {/* =================================================
                LOAN NUMBER
            ================================================= */}

            <FormField>
              <label className="label">
                Loan Number
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="group relative">
                <FileText
                  size={18}
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-violet-500
                    transition-colors
                    group-focus-within:text-violet-600
                  "
                />

                <input
                  required
                  type="text"
                  name="loanNumber"
                  value={
                    form.loanNumber
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter loan account number"
                  className="
                    input
                    pl-10
                    transition-all
                    duration-300
                    hover:border-blue-300
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />
              </div>
            </FormField>

            {/* =================================================
                LOAN AMOUNT
            ================================================= */}

            <FormField>
              <label className="label">
                Loan Amount
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="group relative">
                <IndianRupee
                  size={18}
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-emerald-500
                    transition-colors
                    group-focus-within:text-emerald-600
                  "
                />

                <input
                  required
                  type="number"
                  name="loanAmount"
                  value={
                    form.loanAmount
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter loan amount"
                  className="
                    input
                    pl-10
                    transition-all
                    duration-300
                    hover:border-blue-300
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                  min="0"
                />
              </div>
            </FormField>

            {/* =================================================
                EMI AMOUNT
            ================================================= */}

            <FormField>
              <label className="label">
                EMI Amount
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="group relative">
                <motion.div
                  whileHover={{
                    scale: 1.1,
                  }}
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    z-10
                    -translate-y-1/2
                    text-blue-500
                    transition-colors
                    group-focus-within:text-blue-600
                  "
                >
                  <IndianRupee
                    size={18}
                  />
                </motion.div>

                <input
                  required
                  type="number"
                  name="emiAmount"
                  value={
                    form.emiAmount
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter EMI amount"
                  className="
                    input
                    pl-10
                    transition-all
                    duration-300
                    hover:border-blue-300
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                  min="0"
                />
              </div>
            </FormField>

            {/* =================================================
                INTEREST RATE
            ================================================= */}

            <FormField>
              <label className="label">
                Interest Rate (%)
              </label>

              <div className="group relative">
                <Percent
                  size={18}
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-amber-500
                    transition-colors
                    group-focus-within:text-amber-600
                  "
                />

                <input
                  type="number"
                  name="interestRate"
                  value={
                    form.interestRate
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Example: 8.5"
                  className="
                    input
                    pl-10
                    transition-all
                    duration-300
                    hover:border-blue-300
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                  min="0"
                  step="0.01"
                />
              </div>
            </FormField>

            {/* =================================================
                EMI DURATION TYPE
            ================================================= */}

            <FormField>
              <label className="label">
                EMI Duration
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="group relative">
                <Calendar
                  size={18}
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-cyan-500
                    transition-colors
                    group-focus-within:text-cyan-600
                  "
                />

                <select
                  required
                  name="durationType"
                  value={
                    form.durationType
                  }
                  onChange={
                    handleDurationTypeChange
                  }
                  className="
                    input
                    appearance-none
                    pl-10
                    pr-10
                    transition-all
                    duration-300
                    hover:border-blue-300
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                >
                  <option value="dateRange">
                    EMI Start to EMI End
                  </option>

                  <option value="36">
                    36 Months
                  </option>

                  <option value="48">
                    48 Months
                  </option>

                  <option value="60">
                    60 Months
                  </option>

                  <option value="72">
                    72 Months
                  </option>
                </select>

                <ChevronDown
                  size={18}
                  className="
                    pointer-events-none
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    transition
                    group-focus-within:rotate-180
                    group-focus-within:text-blue-600
                  "
                />
              </div>
            </FormField>

            {/* =================================================
                FIXED TENURE INFORMATION
            ================================================= */}

            {form.durationType !==
              "dateRange" && (
              <FormField>
                <label className="label">
                  Loan Duration
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <div className="group relative">
                  <Calendar
                    size={18}
                    className="
                      pointer-events-none
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-500
                      transition-colors
                      group-focus-within:text-blue-600
                    "
                  />

                  <input
                    type="text"
                    value={`${form.durationType} Months`}
                    readOnly
                    className="
                      input
                      pl-10
                      transition-all
                      duration-300
                      hover:border-blue-300
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-100
                    "
                  />
                </div>
              </FormField>
            )}

            {/* =================================================
                EMI START DATE
            ================================================= */}

            <FormField>
              <label className="label">
                EMI Start Date
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="group relative">
                <Calendar
                  size={18}
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-blue-500
                    transition-colors
                    group-focus-within:text-blue-600
                  "
                />

                <input
                  required
                  type="date"
                  name="emiStartDate"
                  value={
                    form.emiStartDate
                  }
                  onChange={
                    handleChange
                  }
                  className="
                    input
                    pl-10
                    transition-all
                    duration-300
                    hover:border-blue-300
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />
              </div>
            </FormField>

            {/* =================================================
                EMI CLOSING DATE
            ================================================= */}

            <FormField>
              <label className="label">
                EMI Closing Date
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="group relative">
                <Calendar
                  size={18}
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-rose-500
                    transition-colors
                    group-focus-within:text-rose-600
                  "
                />

                <input
                  required
                  type="date"
                  name="emiClosingDate"
                  value={
                    form.emiClosingDate
                  }
                  onChange={
                    handleChange
                  }
                  min={
                    form.emiStartDate ||
                    undefined
                  }
                  className="
                    input
                    pl-10
                    transition-all
                    duration-300
                    hover:border-blue-300
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />
              </div>
            </FormField>

            {/* =================================================
                UPLOAD DOCUMENT
            ================================================= */}

            <motion.div
              variants={itemVariants}
              className="md:col-span-2"
            >
              <label className="label">
                Upload Loan Document
              </label>

              <motion.label
                whileHover={{
                  scale: 1.005,
                  y: -2,
                }}
                whileTap={{
                  scale: 0.995,
                }}
                className="
                  group
                  relative
                  flex
                  cursor-pointer
                  flex-col
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-2xl
                  border-2
                  border-dashed
                  border-slate-200
                  bg-slate-50/50
                  p-8
                  text-center
                  transition-all
                  duration-300
                  hover:border-blue-400
                  hover:bg-blue-50/40
                  hover:shadow-lg
                "
              >
                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-10
                    -top-10
                    h-32
                    w-32
                    rounded-full
                    bg-blue-100
                    opacity-0
                    blur-2xl
                    transition
                    duration-500
                    group-hover:opacity-70
                  "
                />

                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="
                    relative
                    mb-3
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-blue-100
                    text-blue-600
                    shadow-sm
                    transition
                    duration-300
                    group-hover:scale-110
                    group-hover:bg-blue-600
                    group-hover:text-white
                  "
                >
                  <Upload
                    size={30}
                  />
                </motion.div>

                <span className="relative font-semibold text-slate-700 transition-colors group-hover:text-blue-700">
                  {form.fileName ||
                    "Choose file or drag and drop"}
                </span>

                <span className="relative mt-1 text-xs text-slate-400">
                  PDF, JPG, JPEG, PNG up to 10MB
                </span>

                <div className="relative mt-4 flex items-center gap-2 text-xs font-medium text-blue-600 opacity-80">
                  <FileText
                    size={14}
                  />
                  Loan agreement / finance document
                </div>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={
                    handleFileChange
                  }
                  className="hidden"
                />
              </motion.label>

              {/* FILE ERROR */}

              <AnimatePresence>
                {fileError && (
                  <motion.p
                    initial={{
                      opacity: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    className="
                      mt-3
                      rounded-lg
                      border
                      border-red-100
                      bg-red-50
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                      text-red-500
                    "
                  >
                    {fileError}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* VERIFY DOCUMENT */}

              <AnimatePresence>
                {form.fileName &&
                  form.fileData &&
                  !fileError && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        height: 0,
                        y: -10,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        y: -10,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                      className="
                        mt-4
                        flex
                        flex-col
                        gap-3
                        rounded-xl
                        border
                        border-slate-100
                        bg-white
                        p-4
                        shadow-sm
                        sm:flex-row
                        sm:items-center
                      "
                    >
                      <button
                        type="button"
                        onClick={
                          handleVerifyDocument
                        }
                        className={`
                          group/verify
                          flex
                          items-center
                          justify-center
                          gap-2
                          rounded-lg
                          px-4
                          py-2.5
                          text-sm
                          font-medium
                          transition-all
                          duration-300
                          hover:-translate-y-0.5
                          hover:shadow-md
                          ${
                            fileVerified
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }
                        `}
                      >
                        <motion.span
                          whileHover={{
                            rotate: 10,
                            scale: 1.1,
                          }}
                        >
                          <CheckCircle2
                            size={18}
                          />
                        </motion.span>

                        {fileVerified
                          ? "Document Verified"
                          : "Verify Document"}

                        {!fileVerified && (
                          <ArrowRight
                            size={16}
                            className="
                              transition
                              duration-300
                              group-hover/verify:translate-x-1
                            "
                          />
                        )}
                      </button>

                      <AnimatePresence mode="wait">
                        {fileVerified && (
                          <motion.span
                            initial={{
                              opacity: 0,
                              x: -10,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            exit={{
                              opacity: 0,
                              x: -10,
                            }}
                            className="
                              flex
                              items-center
                              gap-2
                              text-sm
                              font-medium
                              text-emerald-600
                            "
                          >
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
                              <FileCheck2
                                size={17}
                              />
                            </motion.span>

                            Loan document successfully verified
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
              </AnimatePresence>
            </motion.div>

            {/* =================================================
                REMARKS
            ================================================= */}

            <FormField className="md:col-span-2">
              <label className="label">
                Remarks
              </label>

              <div className="group relative">
                <textarea
                  name="remarks"
                  value={
                    form.remarks
                  }
                  onChange={
                    handleChange
                  }
                  className="
                    input
                    min-h-28
                    resize-none
                    transition-all
                    duration-300
                    hover:border-blue-300
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                  placeholder="Additional remarks..."
                />

                <span
                  className="
                    pointer-events-none
                    absolute
                    bottom-3
                    right-3
                    text-xs
                    text-slate-300
                    transition
                    group-focus-within:text-blue-400
                  "
                >
                  Optional
                </span>
              </div>
            </FormField>
          </motion.div>

          {/* =================================================
              FORM BUTTONS
          ================================================= */}

          <motion.div
            variants={itemVariants}
            className="
              mt-7
              flex
              flex-col
              justify-end
              gap-3
              border-t
              border-slate-100
              pt-6
              sm:flex-row
            "
          >
            {/* CANCEL */}

            <motion.button
              type="button"
              onClick={() =>
                navigate("/emi")
              }
              whileHover={{
                y: -2,
                scale: 1.01,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="
                btn-secondary
                transition-all
                duration-300
                hover:shadow-md
              "
            >
              Cancel
            </motion.button>

            {/* SAVE */}

            <motion.button
              type="submit"
              whileHover={{
                y: -2,
                scale: 1.015,
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="
                btn-primary
                group
                relative
                overflow-hidden
                transition-all
                duration-300
                hover:shadow-lg
                hover:shadow-blue-200
              "
            >
              <motion.span
                initial={{
                  x: "-120%",
                }}
                animate={{
                  x: "120%",
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 4,
                }}
                className="
                  pointer-events-none
                  absolute
                  inset-y-0
                  w-1/3
                  -skew-x-12
                  bg-white/20
                "
              />

              <motion.span
                whileHover={{
                  rotate: -5,
                }}
                className="relative"
              >
                <Save
                  size={17}
                />
              </motion.span>

              <span className="relative">
                Save Loan
              </span>
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </>
  );
}