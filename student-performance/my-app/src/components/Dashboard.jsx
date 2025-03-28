import StudentForm from "./StudentForm";
import PerformanceGraph from "./PerformanceGraph";

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Teacher Dashboard</h1>
      <StudentForm />
      <PerformanceGraph />
    </div>
  );
}