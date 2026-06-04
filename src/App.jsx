import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";

//normal pages
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Footer from "./components/Footer";
import ProductPage from "./pages/ProductPage";
//admin pages
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerLogin from "./pages/CustomerLogin";

function App() {
	return (
		<AuthProvider>
			<Router>
				<ScrollToTop />

				<Routes>
					<Route
						path="/*"
						element={
							<>
								<Navbar />
								<Routes>
									<Route path="/" element={<Home />} />
									<Route path="/shop" element={<Shop />} />
								</Routes>
								<Footer />
							</>
						}
					/>
					<Route path="/product/:slug" element={<ProductPage />} />
					<Route path="/login" element={<CustomerLogin />} />
					<Route path="/admin" element={<AdminLogin />} />

					<Route
						path="/admin/dashboard"
						element={
							<ProtectedRoute>
								<AdminDashboard />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
