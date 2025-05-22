import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
          Dashboard
        </h2>
        <div className="space-y-5">
          <Link
            to="/add-student"
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition duration-300"
          >
            Add Student
          </Link>
          <Link
            to="/get-student"
            className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition duration-300"
          >
            Get Student
          </Link>
          <Link
            to="/predictions"
            className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl transition duration-300"
          >
            Get Predictions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
