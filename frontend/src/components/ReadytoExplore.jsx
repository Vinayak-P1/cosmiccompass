import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ReadyToExplore = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleConsultationClick = () => {
    if (!user) {
      navigate("/login", { state: { from: "/consultation" } });
    } else {
      navigate("/consultation");
    }
  };

  return (
    <section className="pt-12 pb-20 px-6 bg-background-light dark:bg-background-dark text-center">
      <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Ready to Explore Your Cosmic Path?
        </h2>
        <button
          onClick={handleConsultationClick}
          className="btn-shine inline-block bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-[0_0_15px_rgba(0,123,255,0.5)] hover:shadow-[0_0_25px_rgba(0,123,255,0.8)] transition-all duration-300"
        >
          Expert Consultation shuru kare
        </button>
      </div>
    </section>
  );
};

export default ReadyToExplore;
