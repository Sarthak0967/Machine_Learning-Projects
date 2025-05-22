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
    const updatedValue = numericalFeatures.includes(name)
      ? (value === "" ? "" : Number(value))
      : value;
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
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 bg-gradient-to-tr from-red-500 via-orange-300 to-yellow-200">
      {/* Title */}
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-10">Student Performance Prediction</h1>

      {/* Form Card */}
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Input Student Information</h2>

        <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featureOrder.map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {key.replace(/_/g, " ")}
              </label>
              {categoricalOptions[key] ? (
                <select
                  name={key}
                  value={inputData[key]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              )}
            </div>
          ))}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-200 font-semibold"
            >
              Predict Score
            </button>
          </div>
        </form>

        {message && <p className="text-center text-red-600 mt-4">{message}</p>}
      </div>

      {/* Result Section */}
      {prediction && prediction.predicted_score && (
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-green-700 mb-2 text-center">
            Predicted Score: {prediction.predicted_score.toFixed(2)}
          </h2>
        </div>
      )}

      {/* Graph Section */}
      {prediction && prediction.prediction_graph && (
        <div className="max-w-4xl mx-auto mt-6 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Prediction Graph</h3>
          <img
            src={prediction.prediction_graph}
            alt="Prediction Graph"
            className="max-w-md mx-auto h-auto rounded border"
          />
        </div>
      )}
    </div>
  );
};

export default Predictions;
