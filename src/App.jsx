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
import Dashboard from "./Component/Demand_Dashboard/Dashboard";
import IEXDashboard from "./Component/IEX/dashboard";
import Procurement from "./Component/Procurement/main";
import Plants from "./Component/Plants List/main";
import Consumers from "./Component/Consumers/main";
import SingleDemand from "./Component/Demand/main";
import Banking from "./Component/Banking/main";
import GenerationPlant from "./Component/GenerationPlant/main";
import Menu from "./Component/Menu/Menu";

// ✅ Updated Private Route wrapper to accept Component (not element)
const PrivateRoute = ({Component, isAuthenticated}) => {
    return isAuthenticated ? <Component/> : <Navigate to="/signin" replace/>;
};

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
                    element={<LandingPage setIsAuthenticated={setIsAuthenticated}/>}
                />
                <Route
                    path="/signin"
                    element={<LandingPage setIsAuthenticated={setIsAuthenticated}/>}
                />

                {/* ✅ Private Routes with Component instead of element */}
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
                    path="/dashboard"
                    element={
                        <PrivateRoute
                            Component={Dashboard}
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
                    path="/consumers"
                    element={
                        <PrivateRoute
                            Component={Consumers}
                            isAuthenticated={isAuthenticated}
                        />
                    }
                />
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
                <Route
                    path="/generation-plants"
                    element={
                        <PrivateRoute
                            Component={GenerationPlant}
                            isAuthenticated={isAuthenticated}
                        />
                    }
                />

                {/* Catch-all route */}
                <Route path="*" element={<Error404/>}/>
            </Routes>
        </Router>
    );
}

export default App;