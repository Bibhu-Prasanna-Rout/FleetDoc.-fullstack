import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  Save,
  Truck,
  Car,
  Bus,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import PageHeader from "../components/PageHeader";
import { useFleet } from "../context/fleetContext";


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
   DYNAMIC VEHICLE ICON
========================================================= */

const getVehicleIcon = (type, size = 22) => {
  const vehicleType = type?.toLowerCase();

  if (vehicleType === "car") {
    return <Car size={size} />;
  }

  if (vehicleType === "bus") {
    return <Bus size={size} />;
  }

  return <Truck size={size} />;
};


/* =========================================================
   NORMALIZE VEHICLE NUMBER

   Examples treated as same:

   OD14AB1234
   od14ab1234
   OD-14-AB-1234
   OD 14 AB 1234
========================================================= */

const normalizeVehicleNumber = (number) => {
  return String(number || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .trim();
};


/* =========================================================
   ADD VEHICLE COMPONENT
========================================================= */

export default function AddVehicle() {

  /* =========================================================
     FLEET DATA
  ========================================================= */

  const {
    addVehicle,
    vehicles,
  } = useFleet();


  const navigate = useNavigate();


  /* =========================================================
     FORM STATE
  ========================================================= */

  const [form, setForm] = useState({

    number: "",
    type: "",
    brand: "",
    model: "",
    year: "",
    chassis: "",
    engine: "",
    owner: "",
    mobile: "",
    ownerEmail: "",
    ownerAddress: "",
    registrationDate: "",

  });

  const [vehicleTypeOpen, setVehicleTypeOpen] = useState(false);

  /* =========================================================
     DUPLICATE VEHICLE ERROR STATE
  ========================================================= */

  const [vehicleError, setVehicleError] =
    useState("");


  /* =========================================================
     HANDLE INPUT CHANGE
  ========================================================= */

  const handleChange = (e) => {

    const { name, value } = e.target;


    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));


    /* =============================================
       REMOVE DUPLICATE ERROR WHEN USER CHANGES
       VEHICLE NUMBER
    ============================================= */

    if (name === "number") {
      setVehicleError("");
    }

  };


  /* =========================================================
     HANDLE FORM SUBMIT
  ========================================================= */

  const submit = (e) => {

    e.preventDefault();


    /* =====================================================
       CLEAR PREVIOUS ERROR
    ===================================================== */

    setVehicleError("");


    /* =====================================================
       REQUIRED FIELD VALIDATION
    ===================================================== */

    if (!form.number || !form.owner || !form.type) {

      return;

    }


    /* =====================================================
       NORMALIZE ENTERED VEHICLE NUMBER
    ===================================================== */

    const enteredVehicleNumber =
      normalizeVehicleNumber(form.number);


    /* =====================================================
       CHECK DUPLICATE VEHICLE
    ===================================================== */

    const vehicleAlreadyExists =
      vehicles.some((vehicle) => {

        const existingVehicleNumber =
          normalizeVehicleNumber(vehicle.number);

        return (
          existingVehicleNumber ===
          enteredVehicleNumber
        );

      });


    /* =====================================================
       SHOW UI ERROR IF DUPLICATE EXISTS
    ===================================================== */

    if (vehicleAlreadyExists) {

      setVehicleError(
        `Vehicle number ${form.number.toUpperCase()} is already added. Please enter a different vehicle number.`
      );

      return;

    }


    /* =====================================================
       PREPARE VEHICLE DATA
    ===================================================== */

    const vehicleData = {
      ...form,

      number: form.number
        .toUpperCase()
        .trim(),
    };


    /* =====================================================
       ADD VEHICLE
    ===================================================== */

    addVehicle(vehicleData);


    /* =====================================================
       NAVIGATE
    ===================================================== */

    navigate("/vehicles");

  };


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
          PAGE HEADER
      ===================================================== */}

      <motion.div variants={itemVariants}>

        <PageHeader

          title={
            <div className="flex items-center gap-3">

              <motion.div
                animate={{
                  rotate: form.type ? [0, 3, -3, 0] : 0,
                }}
                transition={{
                  duration: 0.5,
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200"
              >

                {getVehicleIcon(form.type, 21)}

              </motion.div>


              <span>
                Add New Vehicle
              </span>

            </div>
          }

          subtitle="Enter vehicle details to add it to your fleet."

        />

      </motion.div>



      {/* =====================================================
          MAIN FORM CARD
      ===================================================== */}

      <motion.div

        variants={itemVariants}

        className="
          relative
          mt-6
          overflow-hidden
          rounded-3xl
          border
          border-slate-100
          bg-white
          shadow-xl
          shadow-slate-200/40
        "
      >


        {/* BACKGROUND DECORATION */}

        <div
          className="
            absolute
            -right-20
            -top-20
            h-64
            w-64
            rounded-full
            bg-blue-100/50
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -bottom-20
            -left-20
            h-64
            w-64
            rounded-full
            bg-indigo-100/40
            blur-3xl
          "
        />



        {/* =================================================
            FORM HEADER
        ================================================= */}

        <div
          className="
            relative
            border-b
            border-slate-100
            bg-gradient-to-r
            from-blue-50
            via-white
            to-indigo-50
            px-6
            py-6
            md:px-8
          "
        >

          <div
            className="
              flex
              flex-col
              gap-4
              md:flex-row
              md:items-center
              md:justify-between
            "
          >


            <div className="flex items-center gap-4">


              <motion.div

                animate={{
                  y: [0, -4, 0],
                }}

                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                }}

                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-gradient-to-br
                  from-blue-500
                  to-indigo-600
                  text-white
                  shadow-lg
                  shadow-blue-200
                "
              >

                {getVehicleIcon(form.type, 27)}

              </motion.div>


              <div>

                <h2 className="text-lg font-bold text-slate-800">

                  Vehicle Information

                </h2>


                <p className="mt-1 text-sm text-slate-500">

                  Fill in the details below to register a new vehicle.

                </p>

              </div>


            </div>



            <div
              className="
                flex
                items-center
                gap-2
                self-start
                rounded-xl
                border
                border-blue-100
                bg-white
                px-4
                py-2
                text-xs
                font-medium
                text-blue-600
                shadow-sm
              "
            >

              <CheckCircle2 size={16} />

              Fleet Registration

            </div>


          </div>

        </div>



        {/* =================================================
            FORM
        ================================================= */}

        <form

          onSubmit={submit}

          className="relative p-6 md:p-8"
        >


          {/* =================================================
              BASIC VEHICLE DETAILS
          ================================================= */}

          <motion.div variants={itemVariants}>


            <div className="mb-6 flex items-center gap-3">


              <div
                className="
                  h-8
                  w-1
                  rounded-full
                  bg-gradient-to-b
                  from-blue-500
                  to-indigo-600
                "
              />


              <div>

                <h3 className="font-bold text-slate-800">

                  Basic Vehicle Details

                </h3>


                <p className="text-xs text-slate-500">

                  Enter the basic information about your vehicle.

                </p>

              </div>


            </div>



            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">


              {/* =============================================
                  VEHICLE NUMBER
              ============================================= */}

              <div>

                <label className="label">

                  Vehicle Number

                  <span className="text-red-500">
                    {" "}*
                  </span>

                </label>


                <input

                  name="number"

                  type="text"

                  value={form.number}

                  onChange={handleChange}

                  required

                  className={`input transition-all duration-300 ${
                    vehicleError
                      ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100"
                      : ""
                  }`}

                  placeholder="Enter vehicle number"

                />


                {/* =========================================
                    DUPLICATE VEHICLE WARNING UI
                ========================================= */}

                <AnimatePresence>

                  {vehicleError && (

                    <motion.div

                      initial={{
                        opacity: 0,
                        y: -8,
                        height: 0,
                      }}

                      animate={{
                        opacity: 1,
                        y: 0,
                        height: "auto",
                      }}

                      exit={{
                        opacity: 0,
                        y: -8,
                        height: 0,
                      }}

                      transition={{
                        duration: 0.25,
                      }}

                      className="
                        mt-3
                        overflow-hidden
                        rounded-xl
                        border
                        border-red-200
                        bg-red-50
                        p-3
                      "
                    >

                      <div className="flex items-start gap-3">


                        <div
                          className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-red-100
                            text-red-600
                          "
                        >

                          <AlertTriangle size={17} />

                        </div>


                        <div>

                          <p className="text-sm font-semibold text-red-700">

                            Vehicle Already Added

                          </p>


                          <p className="mt-1 text-xs leading-relaxed text-red-600">

                            {vehicleError}

                          </p>

                        </div>


                      </div>

                    </motion.div>

                  )}

                </AnimatePresence>


              </div>



              {/* VEHICLE TYPE */}

              {/* <div>

                <label className="label">

                  Vehicle Type

                  <span className="text-red-500">
                    {" "}*
                  </span>

                </label>


                <div className="relative">

                  <select

                    name="type"

                    value={form.type}

                    onChange={handleChange}

                    required

                    className="input appearance-none pr-12"
                  >

                    <option value="">
                      Select Vehicle Type
                    </option>

                    <option value="Truck">
                      Truck
                    </option>

                    <option value="Bus">
                      Bus
                    </option>

                    <option value="Car">
                      Car
                    </option>

                    <option value="Trailer">
                      Trailer
                    </option>

                    <option value="Container">
                      Container
                    </option>

                    <option value="Tanker">
                      Tanker
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>


                  <div
                    className="
                      pointer-events-none
                      absolute
                      right-10
                      top-1/2
                      -translate-y-1/2
                      text-blue-600
                    "
                  >

                    {getVehicleIcon(form.type, 18)}

                  </div>

                </div>


              </div> */}


              {/* VEHICLE TYPE */}

              <div>
                <label className="label">
                  Vehicle Type

                  <span className="text-red-500">
                    {" "}*
                  </span>
                </label>

                <div className="relative">

                  {/* SELECT FIELD */}

                  <button
                    type="button"
                    onClick={() =>
                      setVehicleTypeOpen((previous) => !previous)
                    }
                    className="input flex w-full items-center justify-between pr-12 text-left"
                  >
                    <span
                      className={
                        form.type
                          ? "text-slate-700"
                          : "text-slate-400"
                      }
                    >
                      {form.type || "Select Vehicle Type"}
                    </span>

                    {/* Vehicle Icon */}

                    <div
                      className="
                        pointer-events-none
                        absolute
                        right-10
                        top-1/2
                        -translate-y-1/2
                      text-blue-600
                      "
                    >
                      {getVehicleIcon(form.type, 18)}
                    </div>

                  </button>


                  {/* DROPDOWN */}

                  <AnimatePresence>
                    {vehicleTypeOpen && (

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
                          duration: 0.2,
                          ease: "easeOut",
                        }}
                        className="
            absolute
            left-0
            right-0
            z-50
            mt-2
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-xl
            shadow-slate-200/70
          "
                      >

                        {[
                          "Truck",
                          "Bus",
                          "Car",
                          "Trailer",
                          "Container",
                          "Tanker",
                          "Other",
                        ].map((type) => (

                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setForm((previous) => ({
                                ...previous,
                                type,
                              }));

                              setVehicleTypeOpen(false);
                            }}
                            className="
                flex
                w-full
                items-center
                gap-4
                px-5
                py-4
                text-left
                text-slate-700
                transition-all
                hover:bg-slate-50
              "
                          >

                            {/* Vehicle Icon */}

                            <span className="flex w-5 shrink-0 items-center justify-center text-slate-600">
                              {getVehicleIcon(type, 18)}
                            </span>

                            {/* Vehicle Name */}

                            <span className="text-sm font-medium">
                              {type}
                            </span>

                          </button>

                        ))}

                      </motion.div>

                    )}
                  </AnimatePresence>

                </div>
              </div>



              {/* VEHICLE BRAND */}

              <div>

                <label className="label">
                  Vehicle Brand
                </label>


                <input

                  name="brand"

                  type="text"

                  value={form.brand}

                  onChange={handleChange}

                  className="input"

                  placeholder="Enter vehicle brand"

                />

              </div>



              {/* VEHICLE MODEL */}

              <div>

                <label className="label">
                  Vehicle Model
                </label>


                <input

                  name="model"

                  type="text"

                  value={form.model}

                  onChange={handleChange}

                  className="input"

                  placeholder="Enter vehicle model"

                />

              </div>



              {/* MANUFACTURING YEAR */}

              <div>

                <label className="label">
                  Manufacturing Year
                </label>


                <input

                  name="year"

                  type="number"

                  value={form.year}

                  onChange={handleChange}

                  className="input"

                  placeholder="Enter manufacturing year"

                />

              </div>



              {/* OWNER NAME */}

              <div>

                <label className="label">

                  Owner Name

                  <span className="text-red-500">
                    {" "}*
                  </span>

                </label>


                <input

                  name="owner"

                  type="text"

                  value={form.owner}

                  onChange={handleChange}

                  required

                  className="input"

                  placeholder="Enter owner name"

                />

              </div>


            </div>

          </motion.div>



          {/* =================================================
              VEHICLE IDENTIFICATION
          ================================================= */}

          <motion.div
            variants={itemVariants}
            className="my-8 border-t border-slate-100"
          />



          <motion.div variants={itemVariants}>


            <div className="mb-6 flex items-center gap-3">

              <div
                className="
                  h-8
                  w-1
                  rounded-full
                  bg-gradient-to-b
                  from-indigo-500
                  to-purple-600
                "
              />


              <div>

                <h3 className="font-bold text-slate-800">
                  Vehicle Identification
                </h3>

                <p className="text-xs text-slate-500">
                  Add vehicle identification and registration details.
                </p>

              </div>

            </div>



            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">


              <div>

                <label className="label">
                  Chassis Number
                </label>

                <input
                  name="chassis"
                  type="text"
                  value={form.chassis}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter chassis number"
                />

              </div>



              <div>

                <label className="label">
                  Engine Number
                </label>

                <input
                  name="engine"
                  type="text"
                  value={form.engine}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter engine number"
                />

              </div>



              <div>

                <label className="label">
                  Registration Date
                </label>

                <input
                  name="registrationDate"
                  type="date"
                  value={form.registrationDate}
                  onChange={handleChange}
                  className="input"
                />

              </div>


            </div>

          </motion.div>



          {/* =================================================
              OWNER CONTACT DETAILS
          ================================================= */}

          <motion.div
            variants={itemVariants}
            className="my-8 border-t border-slate-100"
          />



          <motion.div variants={itemVariants}>


            <div className="mb-6 flex items-center gap-3">

              <div
                className="
                  h-8
                  w-1
                  rounded-full
                  bg-gradient-to-b
                  from-emerald-500
                  to-teal-600
                "
              />


              <div>

                <h3 className="font-bold text-slate-800">
                  Owner Contact Details
                </h3>

                <p className="text-xs text-slate-500">
                  Add the contact and address details of the vehicle owner.
                </p>

              </div>

            </div>



            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">


              <div>

                <label className="label">
                  Mobile Number
                </label>

                <input
                  name="mobile"
                  type="tel"
                  value={form.mobile}
                  onChange={handleChange}
                  className="input"
                  placeholder="+91 Enter mobile number"
                />

              </div>



              <div>

                <label className="label">
                  Owner Email Address
                </label>

                <input
                  name="ownerEmail"
                  type="email"
                  value={form.ownerEmail}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter owner email address"
                />

              </div>



              <div className="md:col-span-2 lg:col-span-2">

                <label className="label">
                  Owner Address
                </label>

                <textarea
                  name="ownerAddress"
                  value={form.ownerAddress}
                  onChange={handleChange}
                  rows="4"
                  className="
                    input
                    min-h-[110px]
                    resize-none
                    py-3
                  "
                  placeholder="Enter owner full address"
                />

              </div>


            </div>

          </motion.div>



          {/* =================================================
              ACTION BUTTONS
          ================================================= */}

          <motion.div

            variants={itemVariants}

            className="
              mt-10
              flex
              flex-col-reverse
              gap-3
              border-t
              border-slate-100
              pt-6
              sm:flex-row
              sm:justify-end
            "
          >


            {/* CANCEL BUTTON */}

            <motion.button

              type="button"

              whileHover={{
                scale: 1.02,
              }}

              whileTap={{
                scale: 0.97,
              }}

              onClick={() =>
                navigate("/vehicles")
              }

              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-6
                py-3
                text-sm
                font-semibold
                text-slate-600
                transition-all
                hover:bg-slate-50
                hover:text-slate-800
              "
            >

              <ArrowLeft size={17} />

              Cancel

            </motion.button>



            {/* SAVE BUTTON */}

            <motion.button

              type="submit"

              whileHover={{
                scale: 1.03,
              }}

              whileTap={{
                scale: 0.97,
              }}

              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-blue-600
                to-indigo-600
                px-7
                py-3
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-blue-200
                transition-all
                hover:from-blue-700
                hover:to-indigo-700
                hover:shadow-xl
              "
            >

              <Save size={18} />

              Save Vehicle

            </motion.button>


          </motion.div>


        </form>

      </motion.div>

    </motion.div>

  );

}