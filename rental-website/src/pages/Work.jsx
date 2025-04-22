import React from "react";
import { CheckCircle, X, Plane, User, Shield, ChevronLeft, ChevronRight, ChevronDown, Handshake, Lock, Smartphone } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function DriveFleetHomepage() {
    const navigate = useNavigate();
    
    // Updated with popular Pakistani car brands
    const carMakes = [
        { name: 'Toyota', image: './assets/toyota.jpg' },
        { name: 'Honda', image: './assets/honda.jpg' },
        { name: 'Suzuki', image: './assets/suzuki.jpg' },
        { name: 'Hyundai', image: './assets/hyundai.jpg' },
        { name: 'Kia', image: './assets/kia.jpg' }
    ];

    const handleMakeClick = (make) => {
        navigate(`/car-rental/${make.name.toLowerCase()}`, { 
            state: { brandName: make.name } 
        });
    };

    return (
        <div className="max-w-6xl mx-auto px-4 font-sans">
            {/* Hero Section with Pakistan-specific imagery */}
            <div className="flex text-black flex-col md:flex-row items-center justify-between py-12 gap-8">
                <div className="w-full md:w-1/2">
                    <img 
                        src="./assets/pakistan-car-rental.jpg" 
                        alt="Car rental in Pakistan" 
                        className="rounded-lg w-full"
                    />
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                    <h1 className="text-4xl font-bold text-gray-900">Drive Fleet Pakistan - Rent Cars Across the Country</h1>
                    <p className="text-lg text-gray-700">Skip the rental car counter and rent quality vehicles from local hosts in Karachi, Lahore, Islamabad, and beyond</p>
                    <button className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors">
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
                        { name: "Karachi", image: "./assets/karachi-city.jpg" },
                        { name: "Lahore", image: "./assets/lahore-city.jpg" },
                        { name: "Islamabad", image: "./assets/islamabad-city.jpg" },
                        { name: "Peshawar", image: "./assets/peshawar-city.jpg" }
                    ].map((city, index) => (
                        <div key={index} className="relative rounded-lg overflow-hidden h-40">
                            <img 
                                src={city.image} 
                                alt={city.name} 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
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
                        <ChevronLeft size={24} className="text-gray-400" />
                        <ChevronRight size={24} className="text-gray-400" />
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

            {/* Pakistan-specific FAQ */}
            <div className="my-12">
                <h2 className="text-3xl font-bold text-black text-center mb-8">
                    <span className="bg-green-100 px-4 py-1 rounded">Pakistan FAQs</span>
                </h2>
                <div className="space-y-4">
                    {[
                        "What documents do I need to rent a car in Pakistan?",
                        "Are there any age restrictions for renting cars in Pakistan?",
                        "Can I take the car from one city to another?",
                        "What payment methods are accepted in Pakistan?",
                        "How does insurance work for rentals in Pakistan?",
                        "What should I do in case of a breakdown?",
                        "Are there any restrictions on where I can drive?",
                        "How do I handle traffic fines during my rental?"
                    ].map((question, i) => (
                        <div key={i} className="border-b border-gray-200 py-4">
                            <button className="flex justify-between items-center w-full text-left">
                                <span className="text-lg font-medium">{question}</span>
                                <ChevronDown className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pakistan Contact Information */}
            <div className="bg-green-600 text-white p-8 rounded-lg my-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Need Help in Pakistan?</h2>
                <p className="mb-4">Our local support team is available 24/7</p>
                <div className="flex flex-col md:flex-row justify-center gap-4">
                    <a href="tel:+923001234567" className="bg-white text-green-600 px-6 py-2 rounded-md font-medium">
                        Call: +92 300 1234567
                    </a>
                    <a href="mailto:support@drivefleet.pk" className="bg-white text-green-600 px-6 py-2 rounded-md font-medium">
                        Email Us
                    </a>
                </div>
            </div>
        </div>
    );
}