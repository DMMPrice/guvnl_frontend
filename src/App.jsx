import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "@radix-ui/themes/styles.css";
import Procurement from "./Component/Procurement/Procurement";
import Purchase from "./Component/Procurement/Purchase";
import NavBar from "./Component/NavBar/NavBar";
import Footer from "./Component/Footer/Footer";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/purchase" element={<Procurement />} />
        <Route path="/procurement" element={<Purchase />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
