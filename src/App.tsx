import React from "react";
import LayoutSignin from "./components/layoutSignin";
import Footer from "./components/footer";
import Header from "./components/header";
import LayoutSignup from "./components/layoutSignup";
import Hero from "./components/hero";
import Feature from "./components/feature";

function App() {
  return (
    <div className="bg-Background/Middle relative min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Body */}
      <main className="flex-grow relative">
        {/* Negative Margin to Overlap with Header */}
        <div className="pt-0 px-5 md:px-10 mt-[-4rem] flex justify-center">
          <Hero />
        </div>
        <Feature />
      </main>

      {/*Footer */}
      <Footer />
    </div>
  );
}

export default App;
