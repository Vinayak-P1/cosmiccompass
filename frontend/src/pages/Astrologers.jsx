import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "";

const Astrologers = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
useEffect(() => {
  const title = "Verified Astrologers — Consult Online | UrbanAstro";
  const desc = "Connect with verified Vedic astrologers at UrbanAstro. Get accurate predictions, career advice, love forecasts, and Kundli starting at ₹99.";
  const url = "https://urbanastro.space/astrologers";

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

  (async () => {
    try {
      const res = await fetch(`${API}/api/astrologers`);
      const data = await res.json();
      if (data.success && data.items) {
        setList(data.items);
      } else {
        setList([]);
      }
    } catch (err) {
      console.error("Fetch astrologers error:", err);
    }
  })();
}, []);
  return (
    <div className="min-h-screen bg-background-dark text-white pt-24 md:pt-28 lg:pt-32 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-center">Our Astrologers</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {list.map(a => {
          const slug = a.slug || a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return (
            <div 
              key={a._id} 
              onClick={() => navigate(`/astrologers/${slug}`, { state: { astrologer: a } })}
              className="p-4 bg-white/10 rounded cursor-pointer hover:bg-white/15 hover:scale-[1.02] transition-all duration-300"
            >
              <img src={a.imageUrl} className="w-full h-40 object-cover rounded mb-2" />
              <div className="font-bold">{a.name}</div>
              <div className="text-sm text-gray-300">{a.expertise} · {a.experience} yrs</div>
              <div className="text-sm mt-1">{a.bio}</div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default Astrologers;
