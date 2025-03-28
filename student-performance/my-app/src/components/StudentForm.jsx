import { useState } from "react";
import axios from "../services/Api";

export default function StudentForm() {
  const [studentData, setStudentData] = useState({});
  const [prediction, setPrediction] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/predict", studentData);
      setPrediction(res.data.prediction);
    } catch (error) {
      alert("Error predicting performance");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Enter Student Data</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <input type="text" placeholder="Feature 1" onChange={(e) => setStudentData({...studentData, feature1: e.target.value})} className="border p-2 w-full mb-2" />
        <button type="submit" className="bg-green-500 text-white p-2 w-full rounded">Get Prediction</button>
      </form>
      {prediction && <p className="text-lg">Predicted Performance: {prediction}</p>}
    </div>
  );
}