import { Routes, Route } from "react-router-dom";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import AddStudent from "./components/AddStudent";
import GetStudent from "./components/GetStudents";
import Predictions from "./components/Predictions";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-student" element={<AddStudent />} />
        <Route path="/get-student" element={<GetStudent />} />
        <Route path="/predictions" element={<Predictions />} />
      </Routes>
    </div>
  );
};

export default App;