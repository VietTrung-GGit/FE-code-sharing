import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import Landing from "./pages/Landing";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
       <Route index element={<Landing />} />
       <Route path="signin" element={<Signin />} />
       <Route path="signup" element={<Signup />} />
    </Routes>
  </BrowserRouter>
);
