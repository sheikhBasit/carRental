import React from "react";

const Profile = () => {
  return (
    <div className="container mx-auto mt-10">
      <h2 className="text-3xl font-bold text-[#003366]">My Profile</h2>
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md w-96">
        <p><strong>Name:</strong> John Doe</p>
        <p><strong>Email:</strong> johndoe@example.com</p>
        <button className="mt-4 bg-[#003366] text-white p-2 rounded">Edit Profile</button>
      </div>
    </div>
  );
};

export default Profile;
