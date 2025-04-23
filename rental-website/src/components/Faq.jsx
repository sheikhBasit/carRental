import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b text-black border-gray-200 py-4">
      <p 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex justify-between items-center w-full text-left"
      >
        <span className="text-lg font-medium">{question}</span>
        <ChevronDown 
          className={`w-6 h-6 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </p>
      {isOpen && (
        <div className="mt-4 text-gray-600">
          {answer}
        </div>
      )}
    </div>
  );
};
const FAQSection = () => {
  const faqs = [
    {
      question: "What do I need to book a car on Rental Fleet?",
      answer: "To book a car on Rental Fleet, you must create a Rental Fleet account, be 18 years old or older in the US, 21 years old or older in the UK and Australia, 23 years old or older in Canada, have a valid driver's license, and get approved to drive on Rental Fleet. When you're booking your first trip, you'll go through a quick approval process by entering your driver's license and some other information. In most cases, you'll get approved immediately, and you'll be set for every future road trip, business trip, and family vacation!"
    },
    {
      question: "What payment methods does Rental Fleet accept?",
      answer: "Rental Fleet accepts most credit cards issued by major financial institutions, including American Express and Discover cards, as well as debit cards with a Visa or Mastercard logo that are linked to a checking account. Apple Pay and Google Pay on mobile devices are also accepted, but Rental Fleet does not accept cash or checks as valid payment methods."
    },
    {
      question: "Do I need my own insurance?",
      answer: "No, you don't need personal insurance coverage to book a car on Rental Fleet."
    },
    {
      question: "What is the cancellation policy for guests on Rental Fleet?",
      answer: "You can cancel and get a full refund up to 24 hours before your trip starts, unless you opt to receive a non-refundable trip discount when you book. If you book a trip with less than 24 hours notice, you have one hour after booking to cancel. If you cancel after the free cancellation period ends, you will be charged a cancellation fee. In the rare event a host cancels, you'll be notified immediately so you can book another car, or we'll help you find one. Your refund can be temporarily held to expedite rebooking, or the funds can be returned to your bank account — your choice."
    },
    {
      question: "What protection plan options are available on Rental Fleet?",
      answer: "When booking a car on Rental Fleet, you'll choose between three protection plans — Premier, Standard, or Minimum — to get the level of protection that's right for you."
    },
    {
      question: "Is third-party auto liability insurance provided for trips on Rental Fleet?",
      answer: "Yes, Rental Fleet provides third-party auto liability insurance through a licensed insurance provider. This coverage protects you in case of bodily injury or property damage to others during your trip. The specific coverage limits vary depending on the protection plan you choose, so it's important to review the details when booking your vehicle."
    },
    {
      question: "Are there discounts on weekly or monthly trips?",
      answer: "Absolutely! Rental Fleet offers attractive discounts for longer trips. Typically, you can save 10-20% on weekly bookings and up to 30% on monthly rentals. These discounts vary by host and vehicle, so be sure to check the specific pricing for each car when planning an extended trip."
    },
    {
      question: "How can I drive unlimited miles during my trip on Rental Fleet?",
      answer: "Many hosts on Rental Fleet offer unlimited mileage for their vehicles. When browsing cars, look for listings that explicitly state 'Unlimited Miles' in the description. If a car doesn't offer unlimited miles, you'll typically see a per-mile rate that will be charged after you exceed the included mileage for your booking."
    },
    {
      question: "What are the cleaning and safety policies on Rental Fleet?",
      answer: "Rental Fleet takes cleaning and safety seriously. Hosts are required to thoroughly clean and sanitize their vehicles between trips. As a guest, you're expected to return the car in the same condition you received it. During the COVID-19 pandemic, Rental Fleet implemented enhanced cleaning guidelines to ensure vehicle safety, and many hosts continue to follow these rigorous standards."
    },
    {
      question: "Is Rental Fleet a rental car company?",
      answer: "Rental Fleet is not a traditional rental car company, but a peer-to-peer car sharing platform. Unlike traditional rental agencies, Rental Fleet allows private car owners to rent out their personal vehicles to travelers. This means you can often find unique, interesting, and more affordable vehicles compared to standard rental car options."
    },
    {
      question: "Is there a fee to add additional drivers to my trip?",
      answer: "Fees for additional drivers vary by host and protection plan. Some hosts allow one additional driver at no extra cost, while others may charge a small daily fee. When booking, you'll see the option to add drivers and any associated costs during the reservation process. Always check the specific terms for each vehicle before finalizing your booking."
    },
    {
      question: "Are there VWs available near the airport?",
      answer: "Volkswagen availability depends on your specific location and the local Rental Fleet community. Many airports have a good selection of VW models, including popular options like the Jetta, Passat, and Tiguan. To find VWs near your airport, simply set your pickup location and filter the search results by Volkswagen brand when making your reservation."
    }
  ];
  return (
    <div className="max-w-4xl  mx-auto px-4 py-12">
      <h1 className="text-4xl text-black font-bold text-center mb-12">Frequently asked questions</h1>
      <div>
        {faqs.map((faq, index) => (
          <FAQItem 
            key={index} 
            question={faq.question} 
            answer={faq.answer} 
          />
        ))}
      </div>
    </div>
  );
};
export default FAQSection;