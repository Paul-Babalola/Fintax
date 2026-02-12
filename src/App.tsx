import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import FinTaxDashboard from "./components/FinTaxDashboard/FinTaxDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FinTaxDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
