import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import welcomeVideo from "../assets/FleetDoc_3D_Welcome_10sec.mp4";

export default function Welcome() {
  const navigate = useNavigate();


  // ==========================================================
  // GO TO LOGIN
  // ==========================================================

  const goToLogin = () => {

    // Remember that the welcome video has been completed
    sessionStorage.setItem(
      "fleetdoc_welcome_seen",
      "true"
    );

    // Open Login page
    navigate("/login", {
      replace: true,
    });
  };


  // ==========================================================
  // 10 SECOND BACKUP TIMER
  // ==========================================================

  useEffect(() => {

    const timer = setTimeout(() => {
      goToLogin();
    }, 10000);


    return () => {
      clearTimeout(timer);
    };

  }, []);


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        h-screen
        w-screen
        overflow-hidden
        bg-black
      "
    >

      <motion.video
        src={welcomeVideo}

        autoPlay
        muted
        playsInline
        preload="auto"

        // When actual video finishes
        onEnded={goToLogin}

        // Opening animation
        initial={{
          opacity: 0,
          scale: 1.05,
        }}

        animate={{
          opacity: 1,
          scale: 1,
        }}

        transition={{
          duration: 0.8,
          ease: "easeOut",
        }}

        className="
          h-full
          w-full
          object-cover
        "
      />

    </div>
  );
}