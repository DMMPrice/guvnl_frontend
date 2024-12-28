import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import "@radix-ui/themes/styles.css";
import Procurement from "./Component/Procurement/Procurement";
import NavBar from "./Component/NavBar/NavBar";
import Footer from "./Component/Footer/Footer";
import Dashboard from "./Component/Home/Dashboard";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/purchase" element={<Procurement />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* <Route path="/procurement" element={<Purchase />} /> */}
        <Route path="*" element={<h1>404: Page Not Found</h1>} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
