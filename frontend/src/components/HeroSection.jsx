import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const HeroSection = () => {
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
    <section
      className="relative min-h-[60vh] md:min-h-screen flex items-center justify-center text-center p-6 bg-cover bg-center"
      style={{
        backgroundImage:
          'linear-gradient(rgba(17,17,33,0.7) 0%, rgba(17,17,33,0.9) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBZ4bT9nUbcRu4bQuLc0LVtxtwwR8_XXBG6MW2miPWpgziWkzTSRjbqYtUqe5-17ApmhaO2V1RIp3woJ04GoPhlDI9Ly4kjx08IrjP0yxgFPph_oB0mc4k-v5mbypCIzDDXxqAbfq13wMOkinmxIz7x1BHequKQpNfycohcHMh4FiVhu9T-coUTkp36TkUtcgUza878zaSl07Xxq8Y0fQS0ELyFjUq9A0XU_3pcdMJzFbNj-1AB8kCk76-J6z-1-6_XmgdeL69eBb2a")',
      }}
    >
      <div className="max-w-3xl mx-auto flex flex-col items-center gap-6 pt-16 md:pt-0">
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">
          Unlock Your{" "}
          <span className="cosmic-gradient glow">Future Clarity.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-xl">
          Expert guidance on career, love, job, health, money, marriage,
          relationship and education. Starting at just <span className="text-blue-400 font-bold">₹99</span>.
        </p>
        <button
          onClick={handleConsultationClick}
          className="btn-shine inline-block bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-[0_0_15px_rgba(0,123,255,0.5)] hover:shadow-[0_0_25px_rgba(0,123,255,0.8)] transition-all duration-300"
        >
          Get Your Kundli Now — ₹99
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
