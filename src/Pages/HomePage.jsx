import React, { useState, useEffect } from "react";
import HomeLayout from "../Layouts/HomeLayout";
import toast, { Toaster } from "react-hot-toast";
import ListingProducts from "../components/ListingProducts.jsx";
import TolPath from "../components/TolPath.jsx";

function HomePage() {


  return (
    <HomeLayout>
      <Toaster />

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 mt-4 md:mt-8 space-y-6 md:space-y-10">
        <TolPath/>
       <ListingProducts/>
      </main>
    </HomeLayout>
  );
}

export default HomePage;