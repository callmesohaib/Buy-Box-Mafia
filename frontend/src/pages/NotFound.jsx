import { Link, useNavigate } from "react-router-dom"
import { Crown } from "lucide-react"

export default function NotFound() {
  const navigate = useNavigate();
  let role = localStorage.getItem('role');
  let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  let buttonText = "Go to Home";
  let target = "/login";
  if (isLoggedIn) {
    if (role === "admin") {
      target = "/admin";
      buttonText = "Go to Admin Dashboard";
    }
    else if (role === "subadmin") {
      target = "/subadmin/buyer";
      buttonText = "Go to SubAdmin Dashboard";
    } else {
      target = "/property-search";
      buttonText = "Go to Home";
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-centerbg-gradient-to-br from-[var(--from-bg)] to-[var(--secondary-gray-bg)] font-inter text-center p-6">
      <div className="mb-8">
        <Crown size={72} className="mx-auto text-amber-400 drop-shadow-lg" />
      </div>
      <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">404</h1>
      <h2 className="text-2xl font-semibold text-gray-300 mb-3">Page Not Found</h2>
      <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <button
        onClick={() => navigate(target)}
        className="inline-block px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        {buttonText}
      </button>
    </div>
  )
} 