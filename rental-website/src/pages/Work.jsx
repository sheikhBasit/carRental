import React, { useState } from "react";
import { CheckCircle, X, Plane, User, Shield, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Handshake, Lock, Smartphone } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function DriveFleetHomepage() {
    const navigate = useNavigate();
    
    // State to track which FAQ items are open
    const [openFAQs, setOpenFAQs] = useState({});
    
    // Toggle FAQ item open/closed
    const toggleFAQ = (index) => {
        setOpenFAQs(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };
    
    // Updated with popular Pakistani car brands
    const carMakes = [
        { name: 'Toyota', image: './assets/toyota.jpg' },
        { name: 'Honda', image: './assets/honda.jpeg' },
        { name: 'Suzuki', image: './assets/suzuki.jpeg' },
        { name: 'Hyundai', image: './assets/hyundai.jpeg' },
        { name: 'Kia', image: './assets/kia.jpeg' }
    ];

    const handleMakeClick = (make) => {
        navigate(`/car-rental/${make.name.toLowerCase()}`, { 
            state: { brandName: make.name } 
        });
    };

    // FAQ data with questions and answers
    const faqData = [
        {
            question: "What documents do I need to rent a car in Pakistan?",
            answer: "To rent a car in Pakistan, you'll need a valid national ID card (CNIC) if you're a Pakistani citizen, or a passport and valid visa if you're a foreigner. Additionally, you'll need a valid driving license (Pakistani or international) and a credit card for the security deposit."
        },
        {
            question: "Are there any age restrictions for renting cars in Pakistan?",
            answer: "Yes, most car rental companies in Pakistan require drivers to be at least 21 years old. Some luxury or premium vehicles may have a higher minimum age requirement of 25 years. Additionally, some companies may charge a young driver fee for renters under 25."
        },
        {
            question: "Can I take the car from one city to another?",
            answer: "Yes, most rental agreements allow for intercity travel within Pakistan. However, you should inform the host or rental company about your travel plans in advance. Some areas might have restrictions due to security concerns, and additional fees may apply for one-way rentals."
        },
        {
            question: "What payment methods are accepted in Pakistan?",
            answer: "We accept credit/debit cards, online bank transfers, and mobile payment services like JazzCash and EasyPaisa. Cash payments are also accepted for certain bookings when arranged in advance."
        },
        {
            question: "How does insurance work for rentals in Pakistan?",
            answer: "All our rental vehicles come with basic insurance coverage that includes third-party liability. Additional comprehensive coverage is available for an extra fee, which we highly recommend. This covers damages to the rental vehicle. Personal accident insurance for passengers might need to be purchased separately."
        },
        {
            question: "What should I do in case of a breakdown?",
            answer: "In case of a breakdown, immediately contact our 24/7 support line at +92 300 1234567. We provide roadside assistance across major cities in Pakistan. Depending on your location and the issue, we'll either send a mechanic or arrange a replacement vehicle as per the terms of your rental agreement."
        },
        {
            question: "Are there any restrictions on where I can drive?",
            answer: "While you can drive throughout most of Pakistan, certain areas may have restrictions due to security concerns. We recommend avoiding travel to border areas and checking with local authorities about any travel advisories. Additionally, some mountain passes may be closed during winter months."
        },
        {
            question: "How do I handle traffic fines during my rental?",
            answer: "If you receive a traffic fine during your rental period, you are responsible for paying it. Please inform us immediately about any fines or violations. Unpaid fines may be charged to your security deposit or billed to you later with additional administrative fees."
        }
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 font-sans">
            {/* Hero Section with Pakistan-specific imagery */}
            <div className="flex text-black flex-col md:flex-row items-center justify-between py-12 gap-8">
                <div className="w-full md:w-1/2">
                    <img 
                        src="./assets/vintage.jpeg" 
                        alt="Car rental in Pakistan" 
                        className="rounded-lg w-full"
                    />
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                    <h1 className="text-4xl font-bold text-gray-900">Drive Fleet Pakistan - Rent Cars Across the Country</h1>
                    <p className="text-lg text-gray-700">Skip the rental car counter and rent quality vehicles from local hosts in Karachi, Lahore, Islamabad, and beyond</p>
                    <button className="bg-grey-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors">
                        Find Cars in Pakistan
                    </button>
                </div>
            </div>

            {/* Pakistan-specific benefits */}
            <div className="bg-gray-50 p-8 text-black rounded-lg my-12">
                <h2 className="text-3xl font-bold text-center mb-8">Why Drive Fleet in Pakistan?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: <Shield className="w-10 h-10 text-green-600" />,
                            title: "Trusted Local Hosts",
                            description: "Rent from verified Pakistani car owners with ratings and reviews"
                        },
                        {
                            icon: <Smartphone className="w-10 h-10 text-green-600" />,
                            title: "Easy Digital Process",
                            description: "Complete booking and payments through our secure app"
                        },
                        {
                            icon: <Plane className="w-10 h-10 text-green-600" />,
                            title: "Airport Pickups",
                            description: "Available at major airports including Jinnah International and Allama Iqbal"
                        }
                    ].map((feature, index) => (
                        <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm">
                            <div className="flex justify-center mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                            <p className="text-gray-700">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popular Pakistani Cities */}
            <div className="my-12">
                <h2 className="text-3xl font-bold text-center mb-8">Available in Major Pakistani Cities</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { name: "Karachi", image: "./assets/karachi.jpeg" },
                        { name: "Lahore", image: "./assets/lahore.jpeg" },
                        { name: "Islamabad", image: "./assets/islamabad.jpg" },
                        { name: "Rawalpindi", image: "./assets/rawalpindi.jpeg" }
                    ].map((city, index) => (
                        <div key={index} className="relative rounded-lg overflow-hidden h-40">
                            <img 
                                src={city.image} 
                                alt={city.name} 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                <h3 className="text-white text-xl font-bold">{city.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Browse by Make - Pakistani Brands */}
            <div className="p-8 text-black">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Popular Pakistani Car Brands</h2>
                    <div className="flex space-x-2">
                        <button className="p-1 rounded-full hover:bg-gray-100">
                            <ChevronLeft size={24} className="text-gray-400" />
                        </button>
                        <button className="p-1 rounded-full hover:bg-gray-100">
                            <ChevronRight size={24} className="text-gray-400" />
                        </button>
                    </div>
                </div>
                <div className="flex space-x-4 overflow-x-auto pb-4">
                    {carMakes.map((make) => (
                        <div 
                            key={make.name} 
                            className="text-center flex-shrink-0 w-[250px] cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => handleMakeClick(make)}
                        >
                            <img 
                                src={make.image} 
                                alt={make.name} 
                                className="w-full h-[170px] object-cover rounded-lg mb-2 border border-gray-200" 
                            />
                            <p className="text-center font-medium">{make.name}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pakistan-specific FAQ - Now with functionality */}
            <div className="my-12">
                <h2 className="text-3xl font-bold text-black text-center mb-8">
                    <span className="bg-green-100 px-4 py-1 rounded">Pakistan FAQs</span>
                </h2>
                <div className="space-y-4">
                    {faqData.map((faq, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                            <p 
                                className="flex justify-between items-center w-full text-left p-4 bg-gray-50 hover:bg-gray-100"
                                onClick={() => toggleFAQ(i)}
                            >
                                <span className="text-lg font-medium text-gray-800">{faq.question}</span>
                                {openFAQs[i] ? (
                                    <ChevronUp className="h-5 w-5 text-green-600" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-green-600" />
                                )}
                            </p>
                            {openFAQs[i] && (
                                <div className="p-4 bg-white">
                                    <p className="text-gray-700">{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Pakistan Contact Information */}
            <div className="bg-gray-600 text-white p-8 rounded-lg my-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Need Help in Pakistan?</h2>
                <p className="mb-4">Our local support team is available 24/7</p>
                <div className="flex flex-col md:flex-row justify-center gap-4">
                    <a href="tel:+923001234567" className="bg-white text-green-600 px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
                        Call: +92 300 1234567
                    </a>
                    <a href="mailto:support@drivefleet.pk" className="bg-white text-green-600 px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
                        Email Us
                    </a>
                </div>
            </div>
        </div>
    );
}