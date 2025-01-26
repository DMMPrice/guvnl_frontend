import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import "@radix-ui/themes/styles.css";
import Procurement from "./Component/Procurement/main";
import NavBar from "./Component/NavBar/NavBar";
import Footer from "./Component/Footer/Footer";
import Dashboard from "./Component/Home/Dashboard";
import Plants from "./Component/Plants List/main";
import Consumers from "./Component/Consumers/main";
import SingleDemand from "./Component/Demand/main";
import Banking from "./Component/Banking/main";
import GenerationPlant from "./Component/GenerationPlant/main";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/purchase" element={<Procurement />} />
        <Route path="/plants" element={<Plants />} />
        <Route path="/consumers" element={<Consumers />} />
        <Route path="/demand" element={<SingleDemand />} />
        <Route path="/banking" element={<Banking />} />
        <Route path="/generation-plants" element={<GenerationPlant />} />
        <Route path="*" element={<h1>404: Page Not Found</h1>} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
