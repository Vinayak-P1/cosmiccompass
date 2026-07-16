import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Consultation = () => {
    const navigate=useNavigate();
    const [searchParams] = useSearchParams();
    const [name,setName]=useState("");
    const [birthDate,setBirthDate]=useState("");
    const [birthTime,setBirthTime]=useState("");
    const[birthLocation,setBirthLocation]=useState("");
    const [unknownTime, setUnknownTime] = useState(false);

    // QR tracking — capture ref parameter from URL
    useEffect(() => {
      const ref = searchParams.get('ref');
      if (ref) {
        localStorage.setItem('urbanastro_ref', ref);
      }
    }, [searchParams]);

   const handleSubmit=(e)=>{
    e.preventDefault();
    if(!name || !birthDate || (!birthTime && !unknownTime) || !birthLocation){
        alert("Please fill all required fields.");
        return;
    }

    // Save consultation data (include ref source)
    const refSource = localStorage.getItem('urbanastro_ref') || '';
    localStorage.setItem('consultationData', JSON.stringify({
        name,
        birthDate,
        birthTime: unknownTime ? '' : birthTime,
        birthLocation,
        unknownTime,
        refSource
    }));

    navigate('/select-plan');
   }
  return (
    // ⭐️ 1. OUTER CONTAINER FIX ⭐️
    // Removed fixed padding (p-4) and added vertical flex and top margin (mt-20)
    // The main goal is to push the content down below the fixed Navbar.
    <div className="font-display bg-background-light dark:bg-background-dark star-bg min-h-screen flex flex-col items-center relative overflow-x-hidden">
        
      {/* ⭐️ 2. CONTENT CARD CONTAINER FIX ⭐️ */}
      {/* Added pt-20 to the outer wrapper to make space for the fixed Navbar */}
      <div className="w-full max-w-lg mt-20 mb-8 p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-lg space-y-8 rounded-xl bg-background-light/80 dark:bg-background-dark/70 md:dark:bg-background-dark/80 backdrop-blur-sm p-6 sm:p-8 border border-white/10 mx-auto">
          
          {/* Step Progress */}
          <div className="text-center">
            <p className="text-sm font-medium text-primary">Step 1 of 5</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-blue-500/20">
              <div className="h-1.5 rounded-full bg-blue-500" style={{ width: "20%" }}></div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Start Your Consultation
            </h1>
            <p className="mt-2 text-base text-gray-300">
              Enter your birth details to begin.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6">
            {/* Full Name */}
            <div>
              <label
                htmlFor="full-name"
                className="block text-sm font-medium text-black dark:text-white/80"
              >
                Full Name
              </label>
              <div className="mt-2">
                <input
                  id="full-name"
                  name="full-name"
                  type="text"
                  value={name}
                  placeholder="e.g., Nova Stargazer"
                  onChange={(e) => setName(e.target.value)}
                  className="form-input block w-full rounded-lg border-0 bg-primary/10 dark:bg-white/5 py-3 px-4 text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:ring-2 focus:ring-inset focus:ring-primary"
                />
              </div>
            </div>

            {/* Birth Date */}
            <div>
              <label
                htmlFor="birth-date"
                className="block text-sm font-medium text-black dark:text-white/80"
              >
                Birth Date
              </label>
              <div className="relative mt-2">
                <input
                  id="birth-date"
                  name="birth-date"
                  type="date"
                  value={birthDate}
                  onChange={(e)=>setBirthDate(e.target.value)}
                  className="form-input block w-full rounded-lg border-0 bg-primary/10 dark:bg-white/5 py-3 px-4 text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:ring-2 focus:ring-inset focus:ring-primary [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Birth Time */}
            <div>
              <label
                htmlFor="birth-time"
                className="block text-sm font-medium text-black dark:text-white/80"
              >
                Birth Time
              </label>

              <div className="relative mt-2">
                <input
                  id="birth-time"
                  name="birth-time"
                  type="time"
                  placeholder="Select your birth time"
                  value={birthTime}
                  onChange={e=>setBirthTime(e.target.value)}
                  className="form-input block w-full rounded-lg border-0 bg-primary/10 dark:bg-white/5 py-3 px-4 text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:ring-2 focus:ring-inset focus:ring-primary [color-scheme:dark]"
                  disabled={unknownTime}
                />
              </div>

              {/* Checkbox for unknown time */}
              <div className="mt-2 flex items-center gap-2">
                <input
                  id="unknown-time"
                  type="checkbox"
                  checked={unknownTime}
                  onChange={(e) => setUnknownTime(e.target.checked)}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="unknown-time" className="text-sm text-gray-600 dark:text-gray-300">
                  I don’t know my birth time
                </label>
              </div>
            </div>

            {/* Birth Location */}
            <div>
              <label
                htmlFor="birth-location"
                className="block text-sm font-medium text-black dark:text-white/80"
              >
                Birth Location
              </label>
              <div className="mt-2">
                <input
                  id="birth-location"
                  name="birth-location"
                  type="text"
                  placeholder="e.g., New York, USA"
                  value={birthLocation}
                  onChange={(e=>setBirthLocation(e.target.value))}
                  className="form-input block w-full rounded-lg border-0 bg-primary/10 dark:bg-white/5 py-3 px-4 text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:ring-2 focus:ring-inset focus:ring-primary"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button onClick={handleSubmit}
                type="submit"
                className="flex w-full justify-center rounded-lg bg-blue-500 px-3 py-3.5 text-base font-bold text-background-dark shadow-glow-primary transition-shadow duration-300  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary hover:shadow-[0_0_25px_rgba(0,123,255,0.8)] "
              >
                Next Step
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Consultation;
