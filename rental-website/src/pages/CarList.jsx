import React from "react";

const cars = [
  { id: 1, name: "Tesla Model S", price: "$100/day" },
  { id: 2, name: "BMW 5 Series", price: "$120/day" },
  { id: 3, name: "Mercedes C-Class", price: "$110/day" },
];

const CarList = () => {
  return (
    <div className="container mx-auto mt-10">
      <h2 className="text-3xl font-bold text-[#003366]">Available Cars</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {cars.map((car) => (
          <div key={car.id} className="p-4 border rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">{car.name}</h3>
            <p className="text-gray-600">{car.price}</p>
            <button className="mt-2 bg-[#003366] text-white p-2 rounded">Book Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarList;
