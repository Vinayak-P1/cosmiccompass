import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AskQuestion = () => {
  const [question, setQuestion] = useState("");
  const navigate = useNavigate();

  const handleProceed = () => {
    // Check if user is logged in
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.id) {
      alert("Please login first!");
      navigate('/login');
      return;
    }

    if (!question.trim()) {
      alert("Please enter your question before proceeding.");
      return;
    }

    // Get existing consultation data
    const consultationData = JSON.parse(localStorage.getItem('consultationData') || '{}');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Add question and user email
    consultationData.question = question.trim();
    consultationData.email = user.email || '';
    
    // Save updated data
    localStorage.setItem('consultationData', JSON.stringify(consultationData));

    navigate("/payment");
  };

  const handleBack = () => {
    navigate("/select-life-area");
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 min-h-screen flex flex-col items-center pt-24 md:pt-32 lg:pt-40 p-4 sm:p-6">
      <div className="w-full max-w-2xl flex flex-col">
        {/* Progress Bar */}
        <div className="w-full space-y-2 mb-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">Step 3 of 4</p>
          <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: "75%" }}
            ></div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-6 text-white">
          What Would You Like to Ask Our Astrologers?
        </h2>

        {/* Question Input */}
        <div className="w-full">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            className="form-textarea w-full h-48 p-4 bg-slate-200/50 dark:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary transition duration-300 placeholder:text-slate-500 dark:placeholder:text-slate-400"
          ></textarea>
        </div>

        <p className="text-sm text-center text-gray-300 mt-4">
          Your question helps us personalize your reading.
        </p>

        {/* Footer Buttons */}
        <footer className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={handleBack}
            className="w-full py-3 px-4 rounded-lg font-bold text-white border-2 border-white/10 hover:bg-white/5 transition duration-300"
          >
            Back
          </button>

          <button
            onClick={handleProceed}
            className="w-full py-3 px-4 rounded-lg font-bold bg-blue-500 text-white hover:opacity-90 hover:shadow-[0_0_25px_rgba(0,123,255,0.8)] transition duration-300"
          >
            Proceed to Payment
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AskQuestion;
