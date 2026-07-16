import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const QUESTION_TEMPLATES = {
  Love: [
    "When will I find my true soulmate?",
    "Is my current partner loyal and serious about me?",
    "How can I resolve the misunderstandings in my love life?",
    "Will I have a love marriage or an arranged marriage?"
  ],
  Education: [
    "Will I clear my competitive exams this year?",
    "Should I pursue higher studies in India or go abroad?",
    "Which study stream or course is most suitable for my future?",
    "How can I improve my focus and academic grades?"
  ],
  Job: [
    "When will I get a new job or salary hike?",
    "Is a job change favorable for me in the next 6 months?",
    "How can I resolve conflicts with my boss/colleagues?",
    "When will I get a government job or secure transfer?"
  ],
  Career: [
    "Which career line matches best with my horoscope?",
    "Should I do a business or stick to a job for success?",
    "When will my struggling business start making profits?",
    "Is partnership business favorable for me?"
  ],
  Relationship: [
    "How can I improve my relationship with my family members?",
    "When will the fights with my current partner stop?",
    "Is there any past relationship blocking my emotional peace?",
    "How can I attract positive relationships into my life?"
  ],
  Money: [
    "When will my financial crisis and debt problems end?",
    "Are there any hidden blocks in my chart stopping money flow?",
    "What is the best investment sector for me to multiply money?",
    "Will I get unexpected wealth or inherit ancestral property?"
  ],
  Marriage: [
    "When is the exact time of my marriage according to my chart?",
    "Will I face delay or divorce/separation issues in marriage?",
    "What will my future spouse be like (nature, profession)?",
    "How can I improve my husband/wife's relationship?"
  ],
  Wealth: [
    "Which gemstone or remedy will help me build long-term wealth?",
    "Will I build or buy my own house/property, and when?",
    "What does my wealth chart say about savings and luxury?",
    "Is stock market or crypto trading favorable for me?"
  ]
};

const AskQuestion = () => {
  const navigate = useNavigate();
  const [questionCount, setQuestionCount] = useState(2);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [activeFieldIdx, setActiveFieldIdx] = useState(0);
  const [templates, setTemplates] = useState([]);

  const consultationData = JSON.parse(localStorage.getItem("consultationData") || "{}");

  useEffect(() => {
    if (!consultationData?.plan) {
      alert("Please select a plan first.");
      navigate("/select-plan");
      return;
    }

    const qCount = Number(consultationData.planQuestionCount || 2);
    const chosenAreas = consultationData.selectedLifeAreas || [];

    setQuestionCount(qCount);
    setSelectedAreas(chosenAreas);
    setQuestions(new Array(qCount).fill(""));

    // Combine suggested question templates from selected areas
    const combinedTemplates = [];
    chosenAreas.forEach((area) => {
      if (QUESTION_TEMPLATES[area]) {
        combinedTemplates.push(...QUESTION_TEMPLATES[area]);
      }
    });

    // Fallback templates if none chosen
    if (combinedTemplates.length === 0) {
      combinedTemplates.push(
        "When is the most favorable time for starting a new venture?",
        "What are the major astro obstacles in my chart and how to solve them?",
        "Which gemstone should I wear for overall success in life?",
        "How will my health and longevity be in the coming years?"
      );
    }

    // Shuffle and pick 6 templates
    const shuffled = combinedTemplates.sort(() => 0.5 - Math.random());
    setTemplates(shuffled.slice(0, 6));
  }, []);

  const handleQuestionChange = (idx, val) => {
    const updated = [...questions];
    updated[idx] = val;
    setQuestions(updated);
  };

  const handleTemplateClick = (template) => {
    // Fill the currently active field, or find the first empty field
    let targetIdx = activeFieldIdx;
    if (questions[targetIdx] && questions[targetIdx].trim() !== "") {
      const firstEmpty = questions.findIndex(q => !q || q.trim() === "");
      if (firstEmpty !== -1) {
        targetIdx = firstEmpty;
      }
    }

    const updated = [...questions];
    updated[targetIdx] = template;
    setQuestions(updated);

    // Auto-focus next field index if possible
    if (targetIdx < questionCount - 1) {
      setActiveFieldIdx(targetIdx + 1);
    }
  };

  const handleProceed = () => {
    // Check if user is logged in
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userData.id) {
      alert("Please login/signup first!");
      navigate("/login", { state: { from: "/ask-question" } });
      return;
    }

    // Ensure at least one question is filled out
    const filledQuestions = questions.filter(q => q && q.trim().length > 0);
    if (filledQuestions.length === 0) {
      alert("Please fill in at least one question before proceeding.");
      return;
    }

    // Combine questions as a numbered string
    const combinedQuestionStr = questions
      .map((q, idx) => q && q.trim() ? `Q${idx + 1}: ${q.trim()}` : null)
      .filter(Boolean)
      .join("\n\n");

    // Add questions and user email to consultationData
    consultationData.question = combinedQuestionStr;
    consultationData.email = userData.email || "";

    // Save back to localStorage
    localStorage.setItem("consultationData", JSON.stringify(consultationData));
    navigate("/payment");
  };

  const handleBack = () => {
    navigate("/select-life-area");
  };

  return (
    <div className="font-display bg-[#030014] text-gray-200 min-h-screen flex flex-col items-center pt-24 pb-12 relative overflow-hidden">
      {/* Background Starfield effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-transparent to-transparent pointer-events-none z-0"></div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 flex flex-col">
        {/* Progress Bar */}
        <div className="w-full space-y-2 mb-8">
          <p className="text-sm text-gray-400">Step 4 of 5</p>
          <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "80%" }}></div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-2 text-white">
          What Would You Like to Ask?
        </h2>
        <p className="text-center text-gray-400 text-sm mb-6">
          Your plan allows up to <strong className="text-blue-400">{questionCount}</strong> questions.
        </p>

        {/* Question Fields */}
        <div className="space-y-4 mb-6">
          {questions.map((q, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-4 bg-white/5 backdrop-blur-md transition-all duration-300 ${
                activeFieldIdx === idx
                  ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] bg-white/8"
                  : "border-white/10"
              }`}
              onClick={() => setActiveFieldIdx(idx)}
            >
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Question {idx + 1}
                </label>
                {activeFieldIdx === idx && (
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-full">
                    Active Input
                  </span>
                )}
              </div>
              <textarea
                value={q || ""}
                onChange={(e) => handleQuestionChange(idx, e.target.value)}
                placeholder={`Ask question ${idx + 1} here... (e.g. When will I buy my own house?)`}
                className="w-full h-16 bg-transparent resize-none outline-none text-white text-sm sm:text-base placeholder-gray-600"
              ></textarea>
            </div>
          ))}
        </div>

        {/* Suggested Questions Section */}
        {templates.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-400 text-sm">tips_and_updates</span>
              Suggested Questions (Based on your topics)
            </h3>
            <div className="flex flex-col gap-2">
              {templates.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => handleTemplateClick(tpl)}
                  className="w-full text-left p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs sm:text-sm text-gray-300 hover:text-white transition duration-200"
                >
                  💡 {tpl}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-[11px] sm:text-xs text-center text-gray-500 mb-6 flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-xs">lock</span>
          Your questions and secrets are 100% confidential and secure with us.
        </p>

        {/* Footer Buttons */}
        <footer className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <button
            onClick={handleBack}
            className="w-full py-3 px-4 rounded-xl font-bold text-gray-400 border-2 border-white/10 hover:bg-white/5 hover:text-white transition duration-300 text-sm sm:text-base"
          >
            Back
          </button>

          <button
            onClick={handleProceed}
            className="w-full py-3 px-4 rounded-xl font-extrabold bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-2xl hover:shadow-blue-500/30 transition duration-300 text-sm sm:text-base"
          >
            Proceed to Payment
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AskQuestion;
