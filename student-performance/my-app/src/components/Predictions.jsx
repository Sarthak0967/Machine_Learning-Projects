import { useState } from "react";
import axios from "axios";

const categoricalOptions = {
  parental_involvement: ["Low", "Medium", "High"],
  access_to_resources: ["Low", "Medium", "High"],
  motivation_level: ["Low", "Medium", "High"],
  family_income: ["Low", "Medium", "High"],
  teacher_quality: ["Low", "Medium", "High"],
  peer_influence: ["Negative", "Neutral", "Positive"],
  parental_education_level: ["High School", "College", "Postgraduate"],
  distance_from_home: ["Near", "Moderate", "Far"],
};

const Predictions = () => {
  const [inputData, setInputData] = useState({
    hours_studied: "",
    attendance: "",
    sleep_hours: "",
    previous_scores: "",
    tutoring_sessions: "",
    physical_activity: "",
    ...Object.fromEntries(Object.keys(categoricalOptions).map((key) => [key, ""])) 
  });
  const [prediction, setPrediction] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Check if the input is numeric and convert accordingly
    const updatedValue = (categoricalOptions[name] || []).length ? value : value === "" ? "" : Number(value);

    setInputData({ ...inputData, [name]: updatedValue });
  };

  const handlePredict = async (e) => {
    e.preventDefault(); // Prevent form submission from refreshing the page
    try {
      const response = await axios.post("http://localhost:5000/predict", inputData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPrediction(response.data.predicted_score);
      setMessage(""); // Clear any previous error messages
    } catch (error) {
      setMessage("Prediction failed. Please check the input data or try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen py-10 overflow-auto">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Predict Student Score</h2>
        <form onSubmit={handlePredict}>
          {Object.keys(inputData).map((key) => (
            <div key={key} className="mb-4">
              <label className="block text-gray-700">{key.replace(/_/g, " ").toUpperCase()}</label>
              {categoricalOptions[key] ? (
                <select
                  name={key}
                  value={inputData[key]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Select</option>
                  {categoricalOptions[key].map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name={key}
                  value={inputData[key]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              )}
            </div>
          ))}
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
            Predict
          </button>
        </form>
        {message && <p className="text-center text-red-600 mt-4">{message}</p>}
        {prediction && <p className="text-center text-green-600 mt-4">Predicted Score: {prediction}</p>}
      </div>
    </div>
  );
};

export default Predictions;
