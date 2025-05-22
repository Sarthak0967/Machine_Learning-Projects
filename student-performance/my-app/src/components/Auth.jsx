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
      setMessage(error.response?.data?.error || "Request failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-90 backdrop-blur-md rounded-xl shadow-lg max-w-md w-full p-8"
      >
        <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-800">
          {isRegistering ? "Create Account" : "Welcome Back"}
        </h2>

        <div className="mb-5">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition"
        >
          {isRegistering ? "Register" : "Login"}
        </button>

        {message && (
          <p
            className={`mt-5 text-center ${
              message.toLowerCase().includes("success")
                ? "text-green-600"
                : "text-red-600"
            } font-medium`}
          >
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-gray-700">
          {isRegistering ? "Already have an account? " : "Don't have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setMessage("");
            }}
            className="text-indigo-600 font-semibold hover:underline focus:outline-none"
          >
            {isRegistering ? "Login" : "Register"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Auth;
