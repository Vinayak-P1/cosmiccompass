// src/components/sections/OurVision.js

import React from 'react';

const OurVision = () => {
    return (
        <section className="py-16 px-6 bg-background-dark">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Our Guiding Vision</h2>
                {/* ORBIT LINES: Custom CSS class yahan lagao */}
                <div className="orbit-lines p-8 relative border border-white/10 rounded-lg"> 
             
                    {/* MUTED GOLD COLOR for the main line */}
                    <h3 className="text-xl md:text-2xl font-semibold text-yellow-400 mb-4">Empowering the Next Generation with Clarity.</h3> 
                    <p className="text-gray-300 max-w-2xl mx-auto">We are committed to making personalized astrological wisdom accessible to every young individual. Our vision extends beyond predictions: we aim to be the most trusted, affordable digital platform that transforms ancient knowledge into actionable, clear guidance for your modern life challenges—be it career anxiety, relationship stress, or personal growth.</p>
                </div>
            </div>
        </section>
    );
};

export default OurVision;