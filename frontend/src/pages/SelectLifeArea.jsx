import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const lifeAreas = [
  { icon: "favorite", label: "Love", color: "from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/20 glow-rose-500/30" },
  { icon: "school", label: "Education", color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/20 glow-blue-500/30" },
  { icon: "work", label: "Job", color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/20 glow-amber-500/30" },
  { icon: "trending_up", label: "Career", color: "from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/20 glow-teal-500/30" },
  { icon: "group", label: "Relationship", color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/20 glow-purple-500/30" },
  { icon: "payments", label: "Money", color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/20 glow-emerald-500/30" },
  { icon: "favorite_border", label: "Marriage", color: "from-red-500/20 to-rose-500/20 text-red-400 border-red-500/20 glow-red-500/30" },
  { icon: "savings", label: "Wealth", color: "from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/20 glow-yellow-500/30" },
];

const SelectLifeArea = () => {
  const [selected, setSelected] = useState([]);
  const [maxSelections, setMaxSelections] = useState(2);
  const navigate = useNavigate();

  const consultationData = JSON.parse(localStorage.getItem("consultationData") || "{}");

  // Dynamically calculate maxSelections based on the plan allowed questions count
  useEffect(() => {
    if (!consultationData?.plan) {
      alert("Please select a plan first.");
      navigate("/select-plan");
      return;
    }

    const qCount = Number(consultationData.planQuestionCount || 2);
    // Formula: 2 questions -> 2 areas; 4 questions -> 3 areas; 5 questions -> 4 areas, etc.
    const maxSel = qCount <= 2 ? 2 : qCount - 1;
    setMaxSelections(maxSel);

    // If there were already selected areas in storage, load them
    if (consultationData.selectedLifeAreas) {
      setSelected(consultationData.selectedLifeAreas.slice(0, maxSel));
    }
  }, []);

  const toggleSelection = (label) => {
    if (selected.includes(label)) {
      setSelected(selected.filter((item) => item !== label));
    } else if (selected.length < maxSelections) {
      setSelected([...selected, label]);
    } else {
      alert(`Based on your chosen plan, you can select up to ${maxSelections} life areas.`);
    }
  };

  const handleProceed = () => {
    if (selected.length === 0) {
      alert("Please select at least 1 life area to continue.");
      return;
    }

    // Save selected areas to localStorage
    consultationData.selectedLifeAreas = selected;
    localStorage.setItem("consultationData", JSON.stringify(consultationData));
    navigate("/ask-question");
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-[#030014] font-display text-gray-200">
      {/* Background Starfield effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-transparent to-transparent pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col flex-grow items-center justify-start pt-20 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl mx-auto">
          {/* Step progress bar */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-400">Step 3 of 5</p>
            <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style={{ width: "60%" }}></div>
            </div>
          </div>

          {/* Title */}
          <header className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Choose Your Life Areas
            </h1>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">
              Select up to <strong className="text-blue-400">{maxSelections}</strong> areas you want astrological guidance on.
            </p>
          </header>

          {/* Options grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {lifeAreas.map((area) => {
              const isSelected = selected.includes(area.label);
              return (
                <div
                  key={area.label}
                  onClick={() => toggleSelection(area.label)}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl cursor-pointer border-2 transition-all duration-300 backdrop-blur-md select-none ${
                    isSelected
                      ? `border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-[1.03]`
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br ${
                      isSelected ? "from-blue-500 to-indigo-600 text-white" : "bg-white/5 text-gray-400"
                    } mb-3 shadow-lg`}
                  >
                    <span className="material-symbols-outlined text-3xl">
                      {area.icon}
                    </span>
                  </div>
                  <p className="font-bold text-center text-sm sm:text-base text-white">
                    {area.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Prompt Selection Info */}
          <div className="text-center text-xs text-gray-500 mt-5">
            Selected: {selected.length} of {maxSelections} allowed areas
          </div>

          {/* Proceed button */}
          <div className="mt-8">
            <button
              onClick={handleProceed}
              disabled={selected.length === 0}
              className={`w-full h-14 font-extrabold rounded-xl relative overflow-hidden group transition-all duration-300 text-lg ${
                selected.length >= 1
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.01]"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}
            >
              <span className="relative z-10">Proceed to Ask Questions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectLifeArea;
