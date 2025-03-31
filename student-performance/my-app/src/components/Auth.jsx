import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(isRegistering ? "Registering..." : "Logging in...");
    try {
      const url = isRegistering ? "http://localhost:5000/register" : "http://localhost:5000/login";
      const response = await axios.post(url, { email, password });
      console.log(isRegistering ? "Register Response:" : "Login Response:", response.data);
      
      if (!isRegistering && response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        setMessage("Login successful!");
        navigate("/dashboard");
      } else if (isRegistering) {
        setMessage("Registration successful! You can now log in.");
        setIsRegistering(false);
      } else {
        setMessage("Invalid response from server.");
      }
    } catch (error) {
      console.error(isRegistering ? "Register Error:" : "Login Error:", error.response);
      setMessage("Request failed. Try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-bold mb-4 text-center">{isRegistering ? "Register" : "Login"}</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
          {isRegistering ? "Register" : "Login"}
        </button>
        {message && <p className="text-center text-red-600 mt-4">{message}</p>}
        <p className="text-center mt-4">
          {isRegistering ? "Already have an account? " : "Don't have an account? "}
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-500 hover:underline"
          >
            {isRegistering ? "Login" : "Register"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Auth;