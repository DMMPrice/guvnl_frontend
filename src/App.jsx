import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Procurement from "./Component/Home/Procurement";
import Purchase from "./Component/Procurement/Purchase";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Procurement />} />
        <Route path="/procurement" element={<Purchase />} />
      </Routes>
    </Router>
  );
}

export default App;
