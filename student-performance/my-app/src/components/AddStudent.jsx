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

const numericalFields = [
  "Hours_Studied",
  "Attendance",
  "Sleep_Hours",
  "Previous_Scores",
  "Tutoring_Sessions",
  "Physical_Activity",
];

const initialStudentData = {
  name: "",
  Hours_Studied: "",
  Attendance: "",
  Sleep_Hours: "",
  Previous_Scores: "",
  Tutoring_Sessions: "",
  Physical_Activity: "",
  Parental_Involvement: "",
  Access_to_Resources: "",
  Motivation_Level: "",
  Family_Income: "",
  Teacher_Quality: "",
  Peer_Influence: "",
  Parental_Education_Level: "",
  Distance_from_Home: "",
};

const AddStudent = () => {
  const [studentData, setStudentData] = useState(initialStudentData);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (numericalFields.includes(name)) {
      setStudentData({
        ...studentData,
        [name]: value === "" ? "" : Number(value),
      });
    } else {
      setStudentData({
        ...studentData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    for (const key in studentData) {
      if (
        studentData[key] === "" ||
        studentData[key] === null ||
        studentData[key] === undefined
      ) {
        setMessage(`Please fill/select ${key.replace(/_/g, " ")}`);
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Unauthorized: Please log in.");
        return;
      }

      const payload = {
        name: studentData.name,
        hours_studied: studentData.Hours_Studied,
        attendance: studentData.Attendance,
        sleep_hours: studentData.Sleep_Hours,
        previous_scores: studentData.Previous_Scores,
        tutoring_sessions: studentData.Tutoring_Sessions,
        physical_activity: studentData.Physical_Activity,
        parental_involvement: studentData.Parental_Involvement,
        access_to_resources: studentData.Access_to_Resources,
        motivation_level: studentData.Motivation_Level,
        family_income: studentData.Family_Income,
        teacher_quality: studentData.Teacher_Quality,
        peer_influence: studentData.Peer_Influence,
        parental_education_level: studentData.Parental_Education_Level,
        distance_from_home: studentData.Distance_from_Home,
      };

      const response = await axios.post("http://localhost:5000/add_student", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(response.data.message || "Student added successfully");
      setStudentData(initialStudentData);
    } catch (error) {
      console.error("Error adding student:", error.response || error.message);
      setMessage(error.response?.data?.error || "Failed to add student");
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen py-10 bg-gray-50 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl"
      >
        <h2 className="text-2xl font-semibold mb-8 text-center text-gray-800">
          Add Student
        </h2>

        {/* Name input full width */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={studentData.name}
            onChange={handleChange}
            required
            placeholder="Enter student name"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Two column grid for the rest */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {numericalFields.map((field) => (
            <div key={field}>
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor={field}
              >
                {field.replace(/_/g, " ")}
              </label>
              <input
                type="number"
                step="any"
                name={field}
                id={field}
                value={studentData[field]}
                onChange={handleChange}
                required
                placeholder={`Enter ${field.replace(/_/g, " ").toLowerCase()}`}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          {Object.entries(categoricalOptions).map(([field, options]) => (
            <div key={field}>
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor={field}
              >
                {field.replace(/_/g, " ")}
              </label>
              <select
                name={field}
                id={field}
                value={studentData[field]}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select {field.replace(/_/g, " ").toLowerCase()}</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors"
        >
          Add Student
        </button>

        {message && (
          <p
            className={`mt-4 text-center bg ${
              message.includes("successfully") ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default AddStudent;
