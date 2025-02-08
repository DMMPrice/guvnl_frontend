// App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./App.css";

// Components
import NavBar from "./Component/NavBar/NavBar";
import Footer from "./Component/Footer/Footer";
import LandingPage from "./Component/LandingPage/LandingPage";
import Error404 from "./Component/Utils/error";

// Protected pages/components
import Dashboard from "./Component/Demand_Dashboard/Dashboard";
import IEXDashboard from "./Component/IEX/dashboard";
import Procurement from "./Component/Procurement/main";
import Plants from "./Component/Plants List/main";
import Consumers from "./Component/Consumers/main";
import SingleDemand from "./Component/Demand/main";
import Banking from "./Component/Banking/main";
import GenerationPlant from "./Component/GenerationPlant/main";
import Menu from "./Component/Menu/Menu";

// Private Route Wrapper
const PrivateRoute = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/signin" replace />;
};

function App() {
  // 1. Initialize from localStorage, fallback to false if nothing is stored
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    return storedAuth ? JSON.parse(storedAuth) : false;
  });

  // 2. Whenever isAuthenticated changes, update localStorage
  useEffect(() => {
    localStorage.setItem("isAuthenticated", JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  return (
    <Router>
      {/* Conditionally render the NavBar if user is logged in */}
      {isAuthenticated && <NavBar setIsAuthenticated={setIsAuthenticated} />}

      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={<LandingPage setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/signin"
          element={<LandingPage setIsAuthenticated={setIsAuthenticated} />}
        />

        {/* Private Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute
              element={<Dashboard />}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/iex-dashboard"
          element={<IEXDashboard />}
          isAuthenticated={isAuthenticated}
        />
        <Route
          path="/purchase"
          element={
            <PrivateRoute
              element={<Procurement />}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/block-purchase"
          element={
            <PrivateRoute
              element={<SingleDemand />}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/menu"
          element={
            <PrivateRoute
              element={<Menu />}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/plants"
          element={
            <PrivateRoute
              element={<Plants />}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/consumers"
          element={
            <PrivateRoute
              element={<Consumers />}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/demand"
          element={
            <PrivateRoute
              element={<SingleDemand />}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/banking"
          element={
            <PrivateRoute
              element={<Banking />}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/generation-plants"
          element={
            <PrivateRoute
              element={<GenerationPlant />}
              isAuthenticated={isAuthenticated}
            />
          }
        />

        {/* Catch-all for unknown routes */}
        <Route path="*" element={<Error404 />} />
      </Routes>

      {/* The Footer is always visible */}
      <Footer />
    </Router>
  );
}

export default App;
