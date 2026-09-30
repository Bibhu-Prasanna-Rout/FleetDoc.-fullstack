import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <h1 className="text-7xl font-bold text-blue-600">
        404
      </h1>

      <p className="mt-4 text-slate-500">
        Page not found
      </p>

      <Link
        to="/"
        className="btn-primary mt-6"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}