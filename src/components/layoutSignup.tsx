import React, { useState } from "react";
import axios from "axios";

function LayoutSignup() {
  // State to hold form inputs
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  // State to display feedback messages
  const [message, setMessage] = useState<string | null>(null);

  // Handler to manage input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic password validation
    if (formData.password !== formData.passwordConfirm) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      // Send data to the backend
      const response = await axios.post("/auth/signup", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // Handle successful response
      setMessage("Signup successful! Please check your email to confirm.");
      console.log(response.data);
    } catch (error: any) {
      // Handle errors
      setMessage(
        error.response?.data?.message || "An error occurred during signup.",
      );
    }
  };

  return (
    <div className="bg-Background/Bottom bg-[url('assets/particle.svg')] bg-no-repeat bg-center bg-cover text-center w-full mt-0 p-16 relative border-Primary/Dark border-solid box-border border-2 rounded-b-3xl mb-28">
      <form onSubmit={handleSubmit}>
        <h3 className="text-3xl text-white m-6 pt-10">SIGN UP</h3>
        <input
          type="text"
          placeholder="Username"
          className="bg-inputbox-Sign rounded-3xl p-3 w-4/12 text-l m-6 "
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        ></input>
        <br></br>
        <input
          type="email"
          placeholder="Email"
          className="bg-inputbox-Sign rounded-3xl p-3 w-4/12 text-l m-6"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        ></input>
        <br></br>
        <input
          type="password"
          placeholder="Password"
          className="bg-inputbox-Sign rounded-3xl p-3 w-4/12 text-l m-6"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        ></input>
        <br></br>
        <input
          type="password"
          placeholder="Password confirm"
          className="bg-inputbox-Sign rounded-3xl p-3 w-4/12 text-l m-6"
          name="passwordConfirm"
          value={formData.passwordConfirm}
          onChange={handleChange}
          required
        ></input>
        <br></br>
        {message && <p className="text-l text-red-500 m-6">{message}</p>}
        <p className="text-l text-white m-6">
          Already have an account?{" "}
          <a href="" className="font-bold">
            Sign in!
          </a>
        </p>
        <button className="w-32 h-10 rounded-xl bg-Accent/Target text-xl text-white m-6">
          Sign in
        </button>
      </form>
    </div>
  );
}
export default LayoutSignup;
