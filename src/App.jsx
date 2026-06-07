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
import { CartProvider } from "./context/CartContext";
import Checkout from "./pages/Checkout";
import TrackOrder from "./pages/TrackOrder";

function App() {
	return (
		<AuthProvider>
			<CartProvider>
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
										<Route path="/checkout" element={<Checkout />} />
										<Route path="/track-order" element={<TrackOrder />} />
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
			</CartProvider>
		</AuthProvider>
	);
}

export default App;
