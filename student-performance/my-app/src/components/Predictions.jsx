import { useState } from "react";
import axios from "axios";

const categoricalOptions = {
  Parental_Involvement: ["Low", "Medium", "High"],
  Access_to_Resources: ["Low", "Medium", "High"],
  Motivation_Level: ["Low", "Medium", "High"],
  Family_Income: ["Low", "Medium", "High"],
  Teacher_Quality: ["Low", "Medium", "High"],
  Peer_Influence: ["Negative", "Neutral", "Positive"],
  Parental_Education_Level: ["High School", "College", "Post Graduate"],
  Distance_from_Home: ["Near", "Moderate", "Far"],
};

const numericalFeatures = [
  "Hours_Studied", "Attendance", "Sleep_Hours", "Previous_Scores", 
  "Tutoring_Sessions", "Physical_Activity"
];

const featureOrder = [
  "Hours_Studied", "Attendance", "Parental_Involvement", "Access_to_Resources", 
  "Sleep_Hours", "Previous_Scores", "Motivation_Level", "Tutoring_Sessions", 
  "Family_Income", "Teacher_Quality", "Peer_Influence", "Physical_Activity", 
  "Parental_Education_Level", "Distance_from_Home"
];

const Predictions = () => {
  const [inputData, setInputData] = useState(
    Object.fromEntries(featureOrder.map((key) => [key, ""]))
  );
  
  const [prediction, setPrediction] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = numericalFeatures.includes(name) ? (value === "" ? "" : Number(value)) : value;
    setInputData({ ...inputData, [name]: updatedValue });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:5000/predict", inputData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      setPrediction(response.data);
      setMessage("");
    } catch (error) {
      setMessage("Prediction failed. Please check the input data or try again.");
      console.log(error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen py-10 overflow-auto">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Predict Student Score</h2>
        <form onSubmit={handlePredict}>
          {featureOrder.map((key) => (
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
                  type="number"
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
        {prediction && prediction.predicted_score && (
  <div className="mt-6 p-4 bg-white rounded shadow-md">
    <h2 className="text-xl font-semibold text-gray-700">Predicted Score: {prediction.predicted_score.toFixed(2)}</h2>

    {/* Graph Rendering */}
    {prediction.prediction_graph && (
      <div className="mt-4">
        <h3 className="text-lg text-gray-600 mb-2">Prediction Graph</h3>
        <img
          src={prediction.prediction_graph}
          alt="Prediction Graph"
          className="w-full h-auto rounded border"
        />
      </div>
    )}
  </div>
)}

      </div>
    </div>
  );
};

export default Predictions;
