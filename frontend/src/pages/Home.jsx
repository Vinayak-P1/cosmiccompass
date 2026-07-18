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
        const title = "UrbanAstro – Online Astrology Consultation, Kundli & Expert Astrologers";
        const desc = "Talk to verified astrologers online for career, love, marriage, health, business and Kundli guidance. Get instant astrology consultations and personalized insights with UrbanAstro.";
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
