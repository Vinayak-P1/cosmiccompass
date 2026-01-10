import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const lifeAreas = [
  { icon: "favorite", label: "Love" },
  { icon: "school", label: "Education" },
  { icon: "work", label: "Job" },
  { icon: "trending_up", label: "Career" },
  { icon: "group", label: "Relationship" },
  { icon: "payments", label: "Money" },
  { icon: "favorite_border", label: "Marriage" },
  { icon: "savings", label: "Wealth" },
];

const SelectLifeArea = () => {
 const [selected,setSelected]=useState([]);
const navigate=useNavigate();
const maxSelections=2;
const toggleSelection=(label)=>{
if(selected.includes(label)){
    setSelected(selected.filter(item=>item!==label))
}else if(selected.length<maxSelections){
  setSelected([...selected, label]);
}else{
    alert(`You can only select up to ${maxSelections} areas.`);
}
}
const handleProceed=()=>{
    if (selected.length === maxSelections) {
      // Get existing consultation data
      const consultationData = JSON.parse(localStorage.getItem('consultationData') || '{}');
      
      // Add selected areas to it
      consultationData.selectedLifeAreas = selected;
      
      // Save back to localStorage
      localStorage.setItem('consultationData', JSON.stringify(consultationData));
      
      navigate("/ask-question");
    }
}

  return (
    <div className="relative flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background-dark to-purple-900/30 opacity-40 dark:opacity-60 pointer-events-none"></div>

<div className="relative z-10 flex flex-col flex-grow items-center justify-start pt-20 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg mx-auto">
          {/* Step progress bar */}
          <div className="text-center mb-4">
            <p className="text-sm text-gray-400 dark:text-gray-500">Step 2 of 4</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "50%" }}></div>
            </div>
          </div>

          {/* Title */}
          <header className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Choose Any 2 Life Areas
            </h1>
            <p className="text-gray-300 mt-1">
              Select the areas you want guidance on.
            </p>
          </header>

          {/* Options grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {lifeAreas.map((area) => {
              const isSelected = selected.includes(area.label);
              return (
                <div
                  key={area.label}
                  onClick={() => toggleSelection(area.label)}
                  className={`option-card flex flex-col items-center justify-center gap-3 p-4 bg-gray-800/50 dark:bg-background-dark/50 border-2 rounded-lg cursor-pointer transition-all duration-300 backdrop-blur-sm hover:border-blue-500/50 ${
                    isSelected
                      ? "border-blue-500 shadow-[0_0_15px_rgba(25,25,230,0.5)]"
                      : "border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-center h-16 w-16 bg-blue-500/10 dark:bg-blue-500/20 rounded-full text-primary">
                    <span className="material-symbols-outlined text-4xl">
                      {area.icon}
                    </span>
                  </div>
                  <p className="font-medium text-center text-white">
                    {area.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Proceed button */}
          <div className="mt-8">
            <button
              disabled={selected.length !== maxSelections}
             onClick={handleProceed}
              className={`w-full h-14 font-bold rounded-lg relative overflow-hidden group transition-all duration-300 ${
                selected.length === maxSelections
                  ? "bg-blue-500 text-white hover:shadow-2xl hover:shadow-blue-500/50"
                  : "bg-blue-500/50 text-white cursor-not-allowed"
              }`}
            >
              <span  className="relative z-10">Proceed</span>
              <div   className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <div className="absolute inset-0 bg-black opacity-20"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectLifeArea;
