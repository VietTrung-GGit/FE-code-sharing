import React from "react";
import LayoutSignin from "./components/layoutSignin";
import Footer from "./components/footer";
import Header from "./components/header";
import LayoutSignup from "./components/layoutSignup";
import Hero from "./components/hero";

function App() {
  return (
    <div className="bg-Background/Middle relative min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Body */}
      <main className="flex-grow relative">
        {/* Negative Margin to Overlap with Header */}
        <div className="mt-[-4rem] pt-0 p-10 flex justify-center">
          <Hero />
        </div>
      </main>

      {/*Footer */}
      <Footer />
    </div>
  );
}

export default App;
