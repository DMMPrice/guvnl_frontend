import React, {useState, useEffect} from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import "./App.css";
import {refreshAccessToken} from "@/lib/api";

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
import DtrConsumerDashboard from "./Component/Dashboards/DTR Consumer Dashboard/Page.jsx";
import PowerTheftDashboard from "./Component/Dashboards/Power Theft Dashboard/Page.jsx"
import ConsumerDashboard from "./Component/Dashboards/Consumer Analytics Dashboard/Page.jsx"

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
import DemandDataAddPage from "@/Component/AddData/Demand Data/Page.jsx"
import IexDataInputPanel from "@/Component/AddData/IEX Data/Page.jsx";
import FeederDtrConsumerTable from "@/Component/AddData/Consumer Data/page.jsx"
import DtrDirectory from "@/Component/AddData/DTR Data/page.jsx";
import FeederDirectory from "@/Component/AddData/Feeder Data/page.jsx";
import PlantConsumptionInputPanel from "@/Component/AddData/Plant Data/Page.jsx";
import ProcurementViewer from "@/Component/AddData/Procurement Data/Page.jsx";

// Profile Components
import FullProfilePage from "@/Component/Profile/Full_Profile/Page.jsx";


// ✅ Updated Private Route wrapper to accept Component (not element)
function PrivateRoute({Component, isAuthenticated}) {
    return isAuthenticated ? <Component/> : <Navigate to="/signin" replace/>;
}

function App() {
    // Persistent auth state
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const storedAuth = localStorage.getItem("isAuthenticated");
        return storedAuth ? JSON.parse(storedAuth) : false;
    });

    // Save auth state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("isAuthenticated", JSON.stringify(isAuthenticated));
    }, [isAuthenticated]);

    // Auto-refresh token every 14 mins & also on tab focus
    useEffect(() => {
        if (!isAuthenticated) return;

        // Interval refresh
        const id = setInterval(() => {
            refreshAccessToken().catch(() => {
                console.warn("Token refresh failed — forcing logout.");
                setIsAuthenticated(false);
            });
        }, 14 * 60 * 1000); // 14 min

        // Refresh on tab focus/visibility change
        const onFocus = () => {
            refreshAccessToken().catch(() => {
                console.warn("Token refresh failed — forcing logout.");
                setIsAuthenticated(false);
            });
        };
        window.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") onFocus();
        });
        window.addEventListener("focus", onFocus);

        return () => {
            clearInterval(id);
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("visibilitychange", onFocus);
        };
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

                <Route path="/dtr-consumer-dashboard"
                       element={
                           <PrivateRoute Component={DtrConsumerDashboard} isAuthenticated={isAuthenticated}/>
                       }
                />

                <Route path="/power-theft-dashboard"
                       element={
                           <PrivateRoute Component={PowerTheftDashboard} isAuthenticated={isAuthenticated}/>
                       }
                />
                <Route path="/consumer-analytics-dashboard"
                       element={
                           <PrivateRoute Component={ConsumerDashboard} isAuthenticated={isAuthenticated}/>
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
                <Route
                    path="/iex/add"
                    element={
                        <PrivateRoute
                            Component={IexDataInputPanel}
                            isAuthenticated={isAuthenticated}
                        />
                    }
                />
                <Route
                    path="/plant/add"
                    element={
                        <PrivateRoute
                            Component={PlantConsumptionInputPanel}
                            isAuthenticated={isAuthenticated}
                        />
                    }
                />
                <Route path="/feeder-dtr-consumer-table"
                       element={
                           <PrivateRoute
                               Component={FeederDtrConsumerTable}
                               isAuthenticated={isAuthenticated}
                           />
                       }

                />
                <Route path="/feeder-dtr-table"
                       element={
                           <PrivateRoute
                               Component={DtrDirectory}
                               isAuthenticated={isAuthenticated}
                           />
                       }
                />
                <Route path="/feeder-directory"
                       element={
                           <PrivateRoute
                               Component={FeederDirectory}
                               isAuthenticated={isAuthenticated}
                           />
                       }
                />
                <Route path="/procurement-viewer"
                       element={
                           <PrivateRoute
                               Component={ProcurementViewer}
                               isAuthenticated={isAuthenticated}
                           />
                       }
                />
                {/* Settings */}
                <Route
                    path="/theme"
                    element={<PrivateRoute Component={Settings} isAuthenticated={isAuthenticated}/>}
                />

                {/* Profile */}

                <Route path="/profile/full"
                       element={<PrivateRoute Component={FullProfilePage} isAuthenticated={isAuthenticated}/>}
                />

                {/* Catch-all route */}
                <Route path="/dev" element={<ComingSoon/>}/>
                <Route path="*" element={<Error404/>}/>
            </Routes>
            {/* ToastContainer at app root */
            }
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnHover
            />
            {/* Chatbot Overlay */
            }
            {
                isAuthenticated && <ChatbotOverlay/>
            }
        </Router>
    )
        ;
}

export default App;