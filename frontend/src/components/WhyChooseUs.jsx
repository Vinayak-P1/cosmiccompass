// src/components/sections/WhyChooseUs.js

import React from 'react';
import { MdOutlineSchedule } from "react-icons/md";
import { MdPayments } from "react-icons/md";
import { MdHandshake } from "react-icons/md";

const ChooseReason = ({ icon, title, description }) => (
    // CARD STYLE: Dark background, light border, good padding
    <div className="bg-background-dark border border-gray-800 p-6 rounded-lg flex flex-col items-start gap-4 transition duration-300 hover:shadow-[0_0_25px_rgba(0,123,255,0.8)] ">
        <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

const WhyChooseUs = () => {
    return (
        // Section background bhi dark/near-dark rakha hai
        <section className="py-16 px-6 bg-background-dark/95">
            <div className="max-w-6xl mx-auto flex flex-col gap-12">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Why Choose UrbanAstro?</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ChooseReason 
                        icon={<MdOutlineSchedule className='text-sky-600' />
}
                        title="Timely Guidance" 
                        description="Receive your personalized reading within 24 hours of your request."
                    />
                    <ChooseReason 
                        icon={<MdPayments className='text-sky-600'  />}
                        title="Affordable Pricing" 
                        description="Access high-quality astrology services at prices accessible to students and young professionals."
                    />
                    <ChooseReason 
                        icon={<MdHandshake className='text-sky-600'  />} 
                        title="Empowering Community" 
                        description="Connect with others on a similar journey of self-discovery and cosmic exploration."
                    />
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;