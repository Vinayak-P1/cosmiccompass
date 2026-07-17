import React, { useEffect } from 'react';

const Blogs = () => {
  useEffect(() => {
    const title = "Ask AI — AI Astrology Assistant | UrbanAstro";
    const desc = "Get instant, personalized answers to your burning astrology questions with our advanced Ask AI astrology assistant at UrbanAstro.";
    const url = "https://urbanastro.space/askai";

    document.title = title;

    const setMeta = (propertyOrName, content, attr = "property") => {
      const el = document.querySelector(`meta[${attr}="${propertyOrName}"]`);
      if (el) el.setAttribute("content", content);
    };

    setMeta("description", desc, "name");
    setMeta("og:title", title);
    setMeta("og:description", desc);
    setMeta("og:url", url);
    setMeta("twitter:title", title);
    setMeta("twitter:description", desc);
    setMeta("twitter:url", url);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", url);
  }, []);
  const dummyQuestions = [
    {
      id: 1,
      question: "What does my birth chart reveal about my career path?",
      icon: "work"
    },
    {
      id: 2,
      question: "How can I improve my relationships based on my zodiac compatibility?",
      icon: "favorite"
    },
    {
      id: 3,
      question: "What are the upcoming planetary transits and their impact on me?",
      icon: "star"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#030014] font-display text-white bg-[radial-gradient(white,rgba(255,255,255,0.15)_1px,transparent_40px),radial-gradient(white,rgba(255,255,255,0.1)_1px,transparent_30px),radial-gradient(white,rgba(255,255,255,0.05)_2px,transparent_40px),radial-gradient(rgba(255,255,255,0.25),rgba(255,255,255,0.05)_2px,transparent_30px)] bg-[size:550px_550px,350px_350px,250px_250px,150px_150px] bg-[position:0_0,40px_60px,130px_270px,70px_100px]" style={{background: "linear-gradient(to bottom right, rgba(11,11,32,0.9), rgba(11,11,32,0.8), rgba(27,0,51,0.7)), radial-gradient(white,rgba(255,255,255,0.15)_1px,transparent 40px), radial-gradient(white,rgba(255,255,255,0.1)_1px,transparent 30px), radial-gradient(white,rgba(255,255,255,0.05)_2px,transparent 40px), radial-gradient(rgba(255,255,255,0.25),rgba(255,255,255,0.05)_2px,transparent 30px)", backgroundSize: "550px 550px, 350px 350px, 250px 250px, 150px 150px", backgroundPosition: "0 0, 40px 60px, 130px 270px, 70px 100px"}}>
      
      {/* Main Content */}
      <main className="flex flex-col min-h-screen pt-32 pb-20 px-6">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg leading-tight">
            Ask AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto font-light">
            Ask AI is coming soon — personalized astrology answers powered by AI
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full mb-8"></div>
          <p className="text-gray-400 text-lg">
            Get instant, AI-powered insights tailored to your astrological profile
          </p>
        </div>

        {/* Dummy Questions Section */}
        <div className="max-w-4xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Sample Questions You Can Ask</h2>
          
          <div className="grid md:grid-cols-1 gap-6">
            {dummyQuestions.map((item) => (
              <div
                key={item.id}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
                    <span className="material-symbols-outlined text-white text-xl">{item.icon}</span>
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {item.question}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-blue-400 transition-colors">arrow_forward</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon CTA */}
        <div className="max-w-4xl mx-auto w-full mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-2">Coming Very Soon</h3>
            <p className="text-gray-300 mb-6">
              We're preparing the AI engine to deliver the most accurate and personalized astrology readings for you.
            </p>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/50 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300">
              Notify Me When Ready
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Blogs;