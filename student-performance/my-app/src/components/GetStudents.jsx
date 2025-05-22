import { useState, useEffect } from "react";
import axios from "axios";

const capitalizeWords = (str) =>
  str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

// Define your preferred column order here:
const columnOrder = [
  "id",
  "name",
  "hours_studied",
  "attendance",
  "sleep_hours",
  "previous_scores",
  "tutoring_sessions",
  "physical_activity",
  "parental_involvement",
  "access_to_resources",
  "motivation_level",
  "family_income",
  "teacher_quality",
  "peer_influence",
  "parental_education_level",
  "distance_from_home",
  "predicted_score",
];

const GetStudents = () => {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/students", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setStudents(response.data);
      } catch (error) {
        setMessage("Failed to fetch students");
      }
    };
    fetchStudents();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) {
      setMessage("Please enter a student ID or name");
      return;
    }
    try {
      const endpoint = isNaN(query) ? `name=${query}` : `id=${query}`;
      const response = await axios.get(`http://localhost:5000/student?${endpoint}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStudents([response.data]);
      setMessage("");
    } catch (error) {
      setMessage("Student not found");
      setStudents([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 flex flex-col items-center bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600">
      <div className="w-full max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-6 rounded-lg shadow-lg">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Student ID or Name"
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Search
        </button>
      </div>

      {message && <p className="text-red-600 font-semibold mb-4">{message}</p>}

      {students.length > 0 && (
        <div className="w-full max-w-6xl overflow-x-auto rounded-lg shadow-md bg-white">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-blue-100 text-gray-800 text-sm">
                {columnOrder.map((key) => (
                  <th key={key} className="px-4 py-3 border font-semibold text-left">
                    {capitalizeWords(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="even:bg-gray-50 hover:bg-gray-100">
                  {columnOrder.map((key) => (
                    <td key={key} className="px-4 py-2 border text-sm">
                      {student[key] !== undefined && student[key] !== null && student[key] !== ""
                        ? student[key]
                        : "N/A"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GetStudents;
