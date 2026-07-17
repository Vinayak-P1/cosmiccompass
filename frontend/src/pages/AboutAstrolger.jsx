import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams, useParams, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "";

// Default fallback astrologer (Stella Nova)
const defaultAstrologer = {
  name: "Stella Nova",
  experience: 10,
  expertise: "Vedic & Western",
  imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCR-8AJLE7hKEGz3jJEzYC24Ilg4Iw5tKnFXtjedT13MGfl1wanrXdcRbXo41w23POF_S_kFoN79DwD8CtR-FPyj1-TAO6O9JdXnPnIWZ-2KOmqUrVDqbqlklShu9CuyP9jlH9DxYO9eQS7reV4LceWF5JBqIV1dTyxVH4gaLrTHx9PhVQIEn2stBXX3KcaA_GhARFY0VAOqH4LaU6ATi5fKx5Lx757Tkq5E6vVmxhwBYTYn7oWQZ2bCMZlECFqrfE8Obg6uu6X4uPi",
  bio: "Stella Nova has been guiding people for over a decade, helping them navigate life through the wisdom of astrology. She blends both Vedic and Western techniques to provide deep, actionable insights that empower individuals to make informed decisions about their career, relationships, and personal growth.",
  bgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZ4bT9nUbcRu4bQuLc0LVtxtwwR8_XXBG6MW2miPWpgziWkzTSRjbqYtUqe5-17ApmhaO2V1RIp3woJ04GoPhlDI9Ly4kjx08IrjP0yxgFPph_oB0mc4k-v5mbypCIzDDXxqAbfq13wMOkinmxIz7x1BHequKQpNfycohcHMh4FiVhu9T-coUTkp36TkUtcgUza878zaSl07Xxq8Y0fQS0ELyFjUq9A0XU_3pcdMJzFbNj-1AB8kCk76-J6z-1-6_XmgdeL69eBb2a"
};

const AboutAstrologer = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { slug } = useParams();
  const navigate = useNavigate();

  const [astrologer, setAstrologer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const legacyId = searchParams.get("id");

    // 1. Permanent Redirect: handle legacy path '/about-astrologer?id=xxx'
    if (location.pathname.includes("/about-astrologer") && legacyId) {
      (async () => {
        try {
          const res = await fetch(`${API}/api/astrologers/${legacyId}`);
          const data = await res.json();
          const astroData = data.astro || data.item;
          if (data.success && astroData) {
            const resolvedSlug = astroData.slug || astroData.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");
            navigate(`/astrologers/${resolvedSlug}`, { replace: true, state: { astrologer: astroData } });
          } else {
            navigate("/astrologers", { replace: true });
          }
        } catch (err) {
          console.error("Legacy redirect fetch error:", err);
          navigate("/astrologers", { replace: true });
        }
      })();
      return;
    }

    // 2. Check if astrologer details are passed via router state
    if (location.state?.astrologer) {
      setAstrologer(location.state.astrologer);
      setLoading(false);
      return;
    }

    // 3. Fetch from API if slug is present
    if (slug) {
      (async () => {
        try {
          const res = await fetch(`${API}/api/astrologers/${slug}`);
          const data = await res.json();
          const astroData = data.astro || data.item;
          if (data.success && astroData) {
            setAstrologer(astroData);
          } else {
            setAstrologer(defaultAstrologer);
          }
        } catch (err) {
          console.error("Fetch astrologer error:", err);
          setAstrologer(defaultAstrologer);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      // 4. Default fallback
      setAstrologer(defaultAstrologer);
      setLoading(false);
    }
  }, [location.state, slug, searchParams, location.pathname, navigate]);

  // Dynamic SEO meta updates based on the loaded astrologer
  useEffect(() => {
    if (!astrologer) return;
    
    const activeSlug = astrologer.slug || astrologer.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    const title = `About ${astrologer.name} — Expert Astrologer | UrbanAstro`;
    const desc = astrologer.bio ? astrologer.bio.substring(0, 150) + "..." : `Meet ${astrologer.name}, professional astrologer at UrbanAstro. Connect for personalized consultation.`;
    const url = `https://urbanastro.space/astrologers/${activeSlug}`;

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
  }, [astrologer]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark text-white flex items-center justify-center pt-24">
        <div className="text-center">Loading astrologer profile...</div>
      </div>
    );
  }

  const currentAstrologer = astrologer || defaultAstrologer;
  const bgImage = currentAstrologer.bgUrl || defaultAstrologer.bgUrl;

  return (
    <div className="bg-background-dark font-display text-gray-200 min-h-screen">
      {/* Astrologer Section */}
      <section
        className="relative pt-24 pb-12 px-6 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(17,17,33,0.8) 0%, rgba(17,17,33,1) 100%), url('${bgImage}')`,
        }}
      >
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8">
          {/* Astrologer Image */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-yellow-500 shadow-lg shrink-0">
            <img
              src={currentAstrologer.imageUrl}
              alt={`Astrologer ${currentAstrologer.name}`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name and Experience */}
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              {currentAstrologer.name}
            </h1>
            <p className="text-yellow-500 font-semibold text-lg mt-1">
              {currentAstrologer.experience}+ Years Experience
            </p>
            {currentAstrologer.expertise && (
              <p className="text-gray-400 text-sm mt-1">
                Expertise: {currentAstrologer.expertise}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-background-dark py-8 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">About {currentAstrologer.name.split(" ")[0]}</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">
            {currentAstrologer.bio}
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutAstrologer;
