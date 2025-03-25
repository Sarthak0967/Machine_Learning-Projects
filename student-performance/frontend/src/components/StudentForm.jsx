import React, { useState } from "react";
import axios from "axios";

const StudentPerformanceForm = () => {
    const [formData, setFormData] = useState({
        Hours_Studied: "",
        Attendance: "",
        Sleep_Hours: "",
        Previous_Scores: "",
        Tutoring_Sessions: "",
        Physical_Activity: "",
        Parental_Involvement: "",
        Access_to_Resources: "",
        Extracurricular_Activities: "",
        Motivation_Level: "",
        Internet_Access: "",
        Family_Income: "",
        Teacher_Quality: "",
        School_Type: "",
        Peer_Influence: "",
        Parental_Education_Level: "",
        Distance_from_Home: "",
        Gender: ""
    });

    const [prediction, setPrediction] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://127.0.0.1:5000/predict", formData);
            setPrediction(response.data.predicted_score);
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Student Performance Prediction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {Object.keys(formData).map((key) => (
                    <div key={key}>
                        <label className="block font-medium">{key.replace(/_/g, " ")}:</label>
                        <input
                            type="text"
                            name={key}
                            value={formData[key]}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                ))}
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                    Predict
                </button>
            </form>
            {prediction !== null && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                    <strong>Predicted Score:</strong> {prediction}
                </div>
            )}
        </div>
    );
};

export default StudentPerformanceForm;
