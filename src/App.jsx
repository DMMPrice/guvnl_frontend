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
import {ToastContainer} from "react-toastify";

// Protected pages/components
import Menu from "./Component/Menu/Menu";
import ComingSoon from "@/Component/Utils/ComingSoon.jsx";
import ChatbotOverlay from "@/Component/Chatbot/Page.jsx";
import Settings from "./Component/Settings/Settings.jsx";

// Dashboards Components
import DemandDashboard from "./Component/Dashboards/Demand Dashboard/Page.jsx";
import ConsolidateDashboard from "./Component/Dashboards/Consolidated Dashboard/Page.jsx";
import IEXDashboard from "./Component/Dashboards/IEX Dashboard/dashboard";
import Procurement from "./Component/Dashboards/Plant Wise Procurement Dashboard/main";
import FeederSubstationDashboard from "./Component/Dashboards/Substation Feeder Dashboard/Page.jsx";
import FeederDtrDashboard from "./Component/Dashboards/Feeder DTR Dashboard/Page.jsx";

// Procurement Components
import MassProcurementOutput from "@/Component/Procurement/Generate_BlockWise_Output/Generate_Procurement/Page.jsx";

// Plant Generator Components
import Plants from "./Component/PlantGenerator/Plants_List/Page.jsx";
import GenerationPlant from "./Component/PlantGenerator/Generation_Plant/Page.jsx";
import PlantAvailabilityFactor from "./Component/PlantGenerator/Plant_Availibility_Factor/Page.jsx";
import BackdownPage from "./Component/PlantGenerator/Backdown_Table/Page.jsx";

// Banking Components
import Banking from "./Component/BankingData/Banking/Page.jsx";

// Add Data Components
import DemandDataAddPage from "@/Component/AddData/Demand_Data/Page.jsx"

// ✅ Updated Private Route wrapper to accept Component (not element)
function PrivateRoute({Component, isAuthenticated}) {
    return isAuthenticated ? <Component/> : <Navigate to="/signin" replace/>;
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
                <Route
                    path="/menu"
                    element={
                        <PrivateRoute
                            Component={Menu}
                            isAuthenticated={isAuthenticated}
                        />
                    }
                />
                {/* Dashboards Routes */}
                <Route path="/dashboard"
                       element={
                           <PrivateRoute
                               Component={ConsolidateDashboard}
                               isAuthenticated={isAuthenticated}
                           />
                       }/>
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
                    path="/substation-feeder-dashboard"
                    element={
                        <PrivateRoute
                            Component={FeederSubstationDashboard}
                            isAuthenticated={isAuthenticated}
                        />
                    }
                />
                <Route
                    path="/feeder-dtr-dashboard"
                    element={
                        <PrivateRoute
                            Component={FeederDtrDashboard}
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
                <Route path="/backdown-table"
                       element={
                           <PrivateRoute
                               Component={BackdownPage}
                               isAuthenticated={isAuthenticated}
                           />
                       }/>
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
                {/* Add Data */}

                <Route
                    path="/demand/add"
                    element={
                        <PrivateRoute
                            Component={DemandDataAddPage}
                            isAuthenticated={isAuthenticated}
                        />
                    }
                />

                {/* Settings */}
                <Route
                    path="/theme"
                    element={<PrivateRoute element={<Settings/>} isAuthenticated={isAuthenticated}/>}
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