// src/pages/HomePage.js (Aapka final Home Page)

import React, { useEffect } from 'react';

import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import CoreFeatures from '../components/CoreFeatures';
import WhyChooseUs from '../components/WhyChooseUs';
import OurVision from '../components/OurVision';
import ReadytoExplore from '../components/ReadytoExplore';

const HomePage = () => {
    useEffect(() => {
        const title = "UrbanAstro — Your Stars, Your City";
        const desc = "UrbanAstro — Expert astrology consultation starting at ₹99. Get personalized Kundli, life guidance & astrologer calls. Your Stars, Your City.";
        const url = "https://urbanastro.space/";

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

    // Note: The global CSS styles and scripts (Tailwind config, font links) 
    // must be included in your main index.html or global styles file.

    return (
        
        <div className="flex flex-col">
                <HeroSection />
                <CoreFeatures />
                <WhyChooseUs />
                <OurVision /> 
                <ReadytoExplore />
            <Footer />
        </div>
    );
};

export default HomePage;
