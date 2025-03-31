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

const AddStudent = () => {
  const [studentData, setStudentData] = useState({
    name: "",
    hours_studied: "",
    attendance: "",
    sleep_hours: "",
    previous_scores: "",
    tutoring_sessions: "",
    physical_activity: "",
    ...Object.fromEntries(Object.keys(categoricalOptions).map((key) => [key, ""])),
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If the field is 'name', ensure it's always treated as a string.
    if (name === "name") {
      setStudentData({
        ...studentData,
        [name]: value,  // Keep the name as a string
      });
    } else {
      // For other fields, either use categorical options or treat them as numbers.
      setStudentData({
        ...studentData,
        [name]:
          categoricalOptions[name] ? value : value === "" ? null : isNaN(value) ? value : Number(value),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting student data:", studentData);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Unauthorized: Please log in.");
        return;
      }
      const response = await axios.post("http://localhost:5000/add_student", studentData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error("Error response:", error.response);
      setMessage("Failed to add student");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen py-10 overflow-auto">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Add Student</h2>
        {Object.keys(studentData).map((key) => (
          <div key={key} className="mb-4">
            <label className="block text-gray-700">{key.replace(/_/g, " ").toUpperCase()}</label>
            {categoricalOptions[key] ? (
              <select
                name={key}
                value={studentData[key]}
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
                type={key === "name" ? "text" : "number"}
                name={key}
                value={studentData[key]}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            )}
          </div>
        ))}
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
          Add Student
        </button>
        {message && <p className="text-center text-red-600 mt-4">{message}</p>}
      </form>
    </div>
  );
};

export default AddStudent;
