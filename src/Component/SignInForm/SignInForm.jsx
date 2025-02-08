import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import InputField from "../Utils/InputField";

const SignInForm = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple demo check
    if (email === "guest" && password === "guest") {
      setError("");
      setIsAuthenticated(true);
      navigate("/menu");
    } else {
      setError("Invalid email or password");
      setIsAuthenticated(false);
    }
  };

  return (
    <div className="bg-[#DED1BE] flex items-center justify-center p-6 rounded-lg shadow-md">
      <form
        onSubmit={handleSubmit}
        className="
          max-w-sm mx-auto p-6 pb-16
          bg-[#DED1BE]
          rounded-lg 
          flex 
          flex-col 
          gap-4
        ">
        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500">{error}</p>}
        <Button
          type="submit"
          className="
            bg-blue-600 hover:bg-blue-700
            text-white font-semibold
            py-2 px-4 rounded
          ">
          Sign In
        </Button>
      </form>
    </div>
  );
};

export default SignInForm;
