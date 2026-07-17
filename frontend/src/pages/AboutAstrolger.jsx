import React, { useEffect } from "react";

const AboutAstrologer = () => {
  useEffect(() => {
    const title = "About Stella Nova — Chief Astrologer | UrbanAstro";
    const desc = "Meet Stella Nova, Chief Astrologer at UrbanAstro. Blending Vedic and Western astrology for over a decade to guide you on career, love, and growth.";
    const url = "https://urbanastro.space/about-astrologer";

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
  return (
    <div className="bg-background-dark font-display text-gray-200 min-h-screen">
      {/* Astrologer Section */}
      <section
        className="relative pt-24 pb-12 px-6 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(17,17,33,0.8) 0%, rgba(17,17,33,1) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBZ4bT9nUbcRu4bQuLc0LVtxtwwR8_XXBG6MW2miPWpgziWkzTSRjbqYtUqe5-17ApmhaO2V1RIp3woJ04GoPhlDI9Ly4kjx08IrjP0yxgFPph_oB0mc4k-v5mbypCIzDDXxqAbfq13wMOkinmxIz7x1BHequKQpNfycohcHMh4FiVhu9T-coUTkp36TkUtcgUza878zaSl07Xxq8Y0fQS0ELyFjUq9A0XU_3pcdMJzFbNj-1AB8kCk76-J6z-1-6_XmgdeL69eBb2a')",
        }}
      >
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8">
          {/* Astrologer Image */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-yellow-500 shadow-lg">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCR-8AJLE7hKEGz3jJEzYC24Ilg4Iw5tKnFXtjedT13MGfl1wanrXdcRbXo41w23POF_S_kFoN79DwD8CtR-FPyj1-TAO6O9JdXnPnIWZ-2KOmqUrVDqbqlklShu9CuyP9jlH9DxYO9eQS7reV4LceWF5JBqIV1dTyxVH4gaLrTHx9PhVQIEn2stBXX3KcaA_GhARFY0VAOqH4LaU6ATi5fKx5Lx757Tkq5E6vVmxhwBYTYn7oWQZ2bCMZlECFqrfE8Obg6uu6X4uPi"
              alt="Astrologer Stella Nova"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name and Experience */}
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Stella Nova
            </h1>
            <p className="text-yellow-500 font-semibold text-lg mt-1">
              10+ Years Experience
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-background-dark py-8 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">About Stella</h2>
          <p className="text-gray-300 leading-relaxed">
            Stella Nova has been guiding people for over a decade, helping them
            navigate life through the wisdom of astrology. She blends both Vedic
            and Western techniques to provide deep, actionable insights that
            empower individuals to make informed decisions about their career,
            relationships, and personal growth.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutAstrologer;
