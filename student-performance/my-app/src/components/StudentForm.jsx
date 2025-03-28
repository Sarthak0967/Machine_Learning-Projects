import { useState } from "react";
import axios from "../services/API";

export default function StudentForm() {
  const [studentData, setStudentData] = useState({
    hours_studied: "",
    attendance: "",
    sleep_hours: "",
    previous_scores: "",
    tutoring_sessions: "",
    physical_activity: "",
    parental_involvement: "Low",
    access_to_resources: "Low",
    motivation_level: "Low",
    family_income: "Low",
    teacher_quality: "Low",
    peer_influence: "Positive",
    parental_education_level: "High School",
    distance_from_home: "Near",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Mapping for categorical variables to numerical values
  const categoricalMappings = {
    parental_involvement: { "Low": 0, "Medium": 1, "High": 2 },
    access_to_resources: { "Low": 0, "Medium": 1, "High": 2 },
    motivation_level: { "Low": 0, "Medium": 1, "High": 2 },
    family_income: { "Low": 0, "Medium": 1, "High": 2 },
    teacher_quality: { "Low": 0, "Medium": 1, "High": 2 },
    peer_influence: { "Positive": 0, "Neutral": 1, "Negative": 2 },
    parental_education_level: { "High School": 0, "College": 1, "Postgraduate": 2 },
    distance_from_home: { "Near": 0, "Moderate": 1, "Far": 2 }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Format data with proper type conversions
      const formattedData = {
        hours_studied: parseFloat(studentData.hours_studied),
        attendance: parseFloat(studentData.attendance),
        sleep_hours: parseFloat(studentData.sleep_hours),
        previous_scores: parseFloat(studentData.previous_scores),
        tutoring_sessions: parseInt(studentData.tutoring_sessions),
        physical_activity: parseFloat(studentData.physical_activity),
        parental_involvement: categoricalMappings.parental_involvement[studentData.parental_involvement],
        access_to_resources: categoricalMappings.access_to_resources[studentData.access_to_resources],
        motivation_level: categoricalMappings.motivation_level[studentData.motivation_level],
        family_income: categoricalMappings.family_income[studentData.family_income],
        teacher_quality: categoricalMappings.teacher_quality[studentData.teacher_quality],
        peer_influence: categoricalMappings.peer_influence[studentData.peer_influence],
        parental_education_level: categoricalMappings.parental_education_level[studentData.parental_education_level],
        distance_from_home: categoricalMappings.distance_from_home[studentData.distance_from_home]
      };

      const res = await axios.post("/predict", formattedData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      alert(`Predicted Exam Score: ${res.data.predicted_exam_score}`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Error predicting performance");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Enter Student Data</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Numerical Inputs */}
        {['hours_studied', 'attendance', 'sleep_hours', 'previous_scores', 'tutoring_sessions', 'physical_activity'].map((field) => (
          <div key={field}>
            <label className="block mb-1 capitalize">{field.replace('_', ' ')}</label>
            <input
              type="number"
              name={field}
              value={studentData[field]}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>
        ))}

        {/* Categorical Inputs */}
        {Object.entries({
          parental_involvement: ["Low", "Medium", "High"],
          access_to_resources: ["Low", "Medium", "High"],
          motivation_level: ["Low", "Medium", "High"],
          family_income: ["Low", "Medium", "High"],
          teacher_quality: ["Low", "Medium", "High"],
          peer_influence: ["Positive", "Neutral", "Negative"],
          parental_education_level: ["High School", "College", "Postgraduate"],
          distance_from_home: ["Near", "Moderate", "Far"]
        }).map(([key, options]) => (
          <div key={key}>
            <label className="block mb-1 capitalize">{key.replace('_', ' ')}</label>
            <select
              name={key}
              value={studentData[key]}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            >
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded text-white ${isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {isLoading ? "Predicting..." : "Get Prediction"}
        </button>
      </form>
    </div>
  );
}