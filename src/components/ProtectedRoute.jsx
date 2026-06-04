import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
	const { user } = useAuth();

	// If there is no user logged in, redirect them to the login page
	if (!user) {
		return <Navigate to="/admin" replace />;
	}

	// If they are logged in, let them see the page!
	return children;
}
