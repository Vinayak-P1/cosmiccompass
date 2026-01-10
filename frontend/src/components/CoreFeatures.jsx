// src/components/sections/CoreFeatures.js

import React from 'react';
import { VscWorkspaceTrusted } from "react-icons/vsc";
import { RiUserCommunityFill } from "react-icons/ri";
import { MdOutlineInsights } from "react-icons/md";
// Custom component for a single feature item
const FeatureItem = ({ icon, title, description }) => (
    <div className="flex flex-col items-center gap-3">
        {/* ICON CONTAINER: Yeh woh circle hai jo glow karta hai */}
        <div className="w-16 h-16 rounded-full bg-[#007bff]/10 dark:bg-[#007bff]/20 flex items-center justify-center border border-primary/50">
            {/* ICON: material-symbols-outlined ko icon prop se replace karein */}
            <span className="material-symbols-outlined text-primary text-4xl">{icon}</span>
        </div>
        <h3 className="text-lg font-bold text-white mt-2">{title}</h3>
        <p className="text-gray-300 text-sm max-w-[200px]">
            {description}
        </p>
    </div>
);

const CoreFeatures = () => {
    return (
        // Background ko dark/light mix rakha hai, ya poora dark kar dein
        <section className="bg-background-dark/60 md:bg-background-dark/90 py-8 px-6"> 
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                <FeatureItem 
                    icon={<VscWorkspaceTrusted className='text-sky-400'  />}
                    title="Trusted Astrologers" 
                    description="Our team of experienced astrologers provides accurate and insightful readings."
                />
                <FeatureItem 
                    icon={<RiUserCommunityFill className='text-sky-400' />}
                    title="Community Support" 
                    description="Join a community of like-minded individuals exploring their cosmic paths."
                />
                <FeatureItem 
                    icon={<MdOutlineInsights className='text-sky-400' />}
                    title="Personalized Insights" 
                    description="Receive personalized guidance based on your unique astrological profile."
                />
            </div>
        </section>
    );
};

export default CoreFeatures;