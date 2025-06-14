import React, {useState, useEffect} from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import "./App.css";

// Components
import NavBar from "./Component/NavBar/NavBar";
import LandingPage from "./Component/LandingPage/LandingPage";
import Error404 from "./Component/Utils/error";

// Protected pages/components
import DemandDashboard from "./Component/Dashboards/Demand Dashboard/Page.jsx";
import ConsolidateDashboard from "./Component/Dashboards/Consolidated Dashboard/Page.jsx";
import IEXDashboard from "./Component/Dashboards/IEX Dashboard/dashboard";
import Procurement from "./Component/Procurement/BlockWise/main";
import Plants from "./Component/PlantGenerator/Plants_List/Page.jsx";
import GenerationPlant from "./Component/PlantGenerator/Generation_Plant/Page.jsx";
import PlantAvailabilityFactor from "./Component/PlantGenerator/Plant_Availibility_Factor/Page.jsx";
import SingleDemand from "./Component/Demand/main";
import MassProcurementOutput from "@/Component/Procurement/Mass_Procurement/Generate_Procurement/Page.jsx";
import Banking from "./Component/BankingData/Banking/Page.jsx";
import Menu from "./Component/Menu/Menu";
import ComingSoon from "@/Component/Utils/ComingSoon.jsx";
import {ToastContainer} from "react-toastify";
import ChatbotOverlay from "@/Component/Chatbot/Page.jsx";
import PowerTheftDashboard from "./Component/PowerThefting/PowerTheftDashboard";

// ✅ Updated Private Route wrapper to accept Component (not element)
function PrivateRoute({ Component, isAuthenticated }) {
    return isAuthenticated ? <Component /> : <Navigate to="/signin" replace />;
}

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const storedAuth = localStorage.getItem("isAuthenticated");
        return storedAuth ? JSON.parse(storedAuth) : false;
    });

    useEffect(() => {
        localStorage.setItem("isAuthenticated", JSON.stringify(isAuthenticated));
    }, [isAuthenticated]);

    return (
        <Router>
            {isAuthenticated && <NavBar setIsAuthenticated={setIsAuthenticated}/>}

            <Routes>
                {/* Public Routes */}
                <Route
                    path="/"
                    element={isAuthenticated ? <Navigate to="/menu" replace/> :
                        <LandingPage setIsAuthenticated={setIsAuthenticated}/>}
                />
                <Route
                    path="/signin"
                    element={isAuthenticated ? <Navigate to="/menu" replace/> :
                        <LandingPage setIsAuthenticated={setIsAuthenticated}/>}
                />

                {/* ✅ Private Routes with Component instead of element */}

                {/* Menu Routes */}
                <Route path="/dashboard"
                       element={
                           <PrivateRoute
                               Component={ConsolidateDashboard}
                               isAuthenticated={isAuthenticated}
                           />
                       }/>
                <Route
                    path="/menu"
                    element={
                        <PrivateRoute
                            Component={Menu}
                            isAuthenticated={isAuthenticated}
                        />
                    }
                />
                <Route
                    path="/demand-dashboard"
                    element={
                        <PrivateRoute
                            Component={DemandDashboard}
                            isAuthenticated={isAuthenticated}
                        />
                    }
                />
                <Route
                    path="/iex-dashboard"
                    element={
                        <PrivateRoute
                            Component={IEXDashboard}
                            isAuthenticated={isAuthenticated}
                        />
                    }
                />
                <Route
                    path="/purchase"
                    element={
                        <PrivateRoute
                            Component={Procurement}
                            isAuthenticated={isAuthenticated}
                        />
                    }
                />
                <Route
                    path="/block-purchase"
                    element={
                        <PrivateRoute
                            Component={SingleDemand}
                            isAuthenticated={isAuthenticated}
                        />
                    }
                />
                <Route
                    path="/plants"
                    element={
                        <PrivateRoute
                            Component={Plants}
                            isAuthenticated={isAuthenticated}
                        />
                    }
                />
                <Route
                    path="/generation-plants"
                    element={
                        <PrivateRoute
                            Component={GenerationPlant}
                            isAuthenticated={isAuthenticated}
                        />
                    }
                />
                <Route path="/plant-availability-factor"
                       element={
                           <PrivateRoute
                               Component={PlantAvailabilityFactor}
                               isAuthenticated={isAuthenticated}
                           />
                       }/>
                <Route
                    path="/demand"
                    element={
                        <PrivateRoute
                            Component={SingleDemand}
                            isAuthenticated={isAuthenticated}
                        />
                    }
                />
                <Route
                    path="/banking"
                    element={
                        <PrivateRoute
                            Component={Banking}
                            isAuthenticated={isAuthenticated}
                        />
                    }
                />
                <Route path="/mass-plant-output"
                       element={
                           <PrivateRoute
                               Component={MassProcurementOutput}
                               isAuthenticated={isAuthenticated}
                           />
                       }
                />
                <Route
                    path="/power-theft"
                    element={
                        <PrivateRoute
                            Component={PowerTheftDashboard}
                            isAuthenticated={isAuthenticated}
                        />
                    }
                />

                {/* Catch-all route */}
                <Route path="/dev" element={<ComingSoon/>}/>
                <Route path="*" element={<Error404/>}/>
            </Routes>
            {/* ToastContainer at app root */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnHover
            />
            {/* Chatbot Overlay */}
            {isAuthenticated && <ChatbotOverlay/>}
        </Router>
    );
}

export default App;