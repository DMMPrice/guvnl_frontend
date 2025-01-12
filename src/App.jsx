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
import Plants from "./Component/Plants/main";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/purchase" element={<Procurement />} />
        <Route path="/plants" element={<Plants />} />
        <Route path="*" element={<h1>404: Page Not Found</h1>} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
