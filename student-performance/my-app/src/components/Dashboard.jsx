import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="space-y-4">
        <Link to="/add-student" className="block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">Add Student</Link>
        <Link to="/get-student" className="block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">Get Student</Link>
        <Link to="/predictions" className="block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">Get Predictions</Link>
      </div>
    </div>
  );
};

export default Dashboard;