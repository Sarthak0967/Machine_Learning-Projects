
import { useState, useEffect } from "react";
import axios from "axios";

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
    if (!query) {
      setMessage("Please enter a student ID or name");
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5000/student?${isNaN(query) ? `name=${query}` : `id=${query}`}`, {
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
    <div className="flex flex-col items-center mt-10">
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Student ID or Name"
          className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button onClick={handleSearch} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Search
        </button>
      </div>
      {message && <p className="text-red-500">{message}</p>}
      {students.length > 0 && (
        <table className="table-auto border-collapse border border-gray-300 mt-4">
          <thead>
            <tr className="bg-gray-200">
              {Object.keys(students[0]).map((key) => (
                <th key={key} className="border px-4 py-2">{key.replace(/_/g, " ").toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                {Object.values(student).map((value, index) => (
                  <td key={index} className="border px-4 py-2">{value || "N/A"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GetStudents;
