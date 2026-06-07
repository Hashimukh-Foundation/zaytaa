import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient";
import AdminCategories from "./AdminCategories";
import AdminProducts from "./AdminProducts";
import AdminBrands from "./AdminBrands";
import AdminSettings from "./AdminSettings";
import AdminOrders from "./AdminOrders";

export default function AdminDashboard() {
	const { user, signOut } = useAuth();
	const [activeTab, setActiveTab] = useState("overview");

	// --- STATS STATE ---
	const [stats, setStats] = useState({ products: 0, categories: 0 });
	const [loading, setLoading] = useState(true);

	// Fetch some basic stats for the Overview tab
	useEffect(() => {
		async function fetchStats() {
			setLoading(true);

			// Get product count
			const { count: productCount } = await supabase
				.from("products")
				.select("*", { count: "exact", head: true });

			// Get category count
			const { count: categoryCount } = await supabase
				.from("categories")
				.select("*", { count: "exact", head: true });

			setStats({
				products: productCount || 0,
				categories: categoryCount || 0,
			});

			setLoading(false);
		}

		fetchStats();
	}, []);

	// --- CONTENT RENDERER ---
	// This switch statement decides what to show in the main area based on the clicked tab
	const renderContent = () => {
		switch (activeTab) {
			case "overview":
				return (
					<div>
						<h2 style={styles.pageTitle}>Overview</h2>
						<div style={styles.statsGrid}>
							<div style={styles.statCard}>
								<p style={styles.statLabel}>Total Products</p>
								<h3 style={styles.statNumber}>
									{loading ? "-" : stats.products}
								</h3>
							</div>
							<div style={styles.statCard}>
								<p style={styles.statLabel}>Categories</p>
								<h3 style={styles.statNumber}>
									{loading ? "-" : stats.categories}
								</h3>
							</div>
							<div style={styles.statCard}>
								<p style={styles.statLabel}>Total Orders</p>
								<h3 style={styles.statNumber}>0</h3>{" "}
								{/* Placeholder for later! */}
							</div>
						</div>
					</div>
				);
			case "products":
				return <AdminProducts />;
			case "categories":
				return <AdminCategories />;
			case "brands":
				return <AdminBrands />;
			case "settings":
				return <AdminSettings />;
			case "orders":
				return <AdminOrders />;
			default:
				return <div>Select a tab</div>;
		}
	};

	return (
		<div style={styles.container}>
			{/* --- SIDEBAR --- */}
			<aside style={styles.sidebar}>
				<div style={styles.sidebarHeader}>
					<h1 style={styles.logo}>Zaytaa</h1>
					<p style={styles.adminBadge}>ADMIN</p>
				</div>

				<nav style={styles.nav}>
					<button
						style={{
							...styles.navButton,
							...(activeTab === "overview" ? styles.activeTab : {}),
						}}
						onClick={() => setActiveTab("overview")}
					>
						Overview
					</button>
					<button
						style={{
							...styles.navButton,
							...(activeTab === "products" ? styles.activeTab : {}),
						}}
						onClick={() => setActiveTab("products")}
					>
						Products
					</button>
					<button
						style={{
							...styles.navButton,
							...(activeTab === "orders" ? styles.activeTab : {}),
						}}
						onClick={() => setActiveTab("orders")}
					>
						Orders
					</button>
					<button
						style={{
							...styles.navButton,
							...(activeTab === "categories" ? styles.activeTab : {}),
						}}
						onClick={() => setActiveTab("categories")}
					>
						Categories
					</button>
					<button
						style={{
							...styles.navButton,
							...(activeTab === "brands" ? styles.activeTab : {}),
						}}
						onClick={() => setActiveTab("brands")}
					>
						Brands
					</button>
					<button
						style={{
							...styles.navButton,
							...(activeTab === "settings" ? styles.activeTab : {}),
						}}
						onClick={() => setActiveTab("settings")}
					>
						Settings
					</button>
				</nav>

				<div style={styles.sidebarFooter}>
					<p style={styles.userEmail}>{user?.email}</p>
					<button onClick={signOut} style={styles.logoutButton}>
						Log Out
					</button>
				</div>
			</aside>

			{/* --- MAIN CONTENT AREA --- */}
			<main style={styles.main}>
				<header style={styles.topBar}>
					<p style={styles.welcomeMessage}>Welcome back, Admin.</p>
				</header>

				<div style={styles.content}>{renderContent()}</div>
			</main>
		</div>
	);
}

// --- STYLES ---
const styles = {
	container: {
		display: "flex",
		minHeight: "100vh",
		background: "var(--white)",
		fontFamily: "var(--font-sans)",
	},
	sidebar: {
		width: "280px",
		background: "#f4f3f0", // A slightly darker, warm tone for the sidebar
		borderRight: "1px solid var(--border)",
		display: "flex",
		flexDirection: "column",
		padding: "32px 0",
	},
	sidebarHeader: {
		padding: "0 32px",
		marginBottom: "48px",
	},
	logo: {
		fontFamily: "var(--font-serif)",
		fontSize: "24px",
		letterSpacing: "0.1em",
		color: "var(--ink)",
		margin: 0,
	},
	adminBadge: {
		fontSize: "11px",
		letterSpacing: "0.2em",
		color: "var(--stone)",
		marginTop: "4px",
	},
	nav: {
		display: "flex",
		flexDirection: "column",
		gap: "8px",
		padding: "0 16px",
		flex: 1, // Pushes the footer down
	},
	navButton: {
		background: "transparent",
		border: "none",
		textAlign: "left",
		padding: "12px 16px",
		borderRadius: "8px",
		fontSize: "15px",
		color: "var(--stone)",
		cursor: "pointer",
		transition: "all 0.2s ease",
	},
	activeTab: {
		background: "var(--ink)",
		color: "#fff",
		fontWeight: 500,
	},
	sidebarFooter: {
		padding: "0 32px",
		borderTop: "1px solid var(--border)",
		paddingTop: "24px",
		marginTop: "auto",
	},
	userEmail: {
		fontSize: "13px",
		color: "var(--stone)",
		marginBottom: "12px",
		wordBreak: "break-all",
	},
	logoutButton: {
		background: "none",
		border: "none",
		color: "var(--ink)",
		textDecoration: "underline",
		cursor: "pointer",
		padding: 0,
		fontSize: "14px",
	},
	main: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
	},
	topBar: {
		height: "80px",
		borderBottom: "1px solid var(--border)",
		display: "flex",
		alignItems: "center",
		padding: "0 48px",
		background: "#fff",
	},
	welcomeMessage: {
		fontSize: "15px",
		color: "var(--stone)",
	},
	content: {
		padding: "48px",
		flex: 1,
		background: "var(--white)",
	},
	pageTitle: {
		fontFamily: "var(--font-serif)",
		fontSize: "32px",
		color: "var(--ink)",
		marginBottom: "32px",
	},
	statsGrid: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
		gap: "24px",
	},
	statCard: {
		background: "#fff",
		border: "1px solid var(--border)",
		borderRadius: "12px",
		padding: "24px",
		boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
	},
	statLabel: {
		fontSize: "14px",
		color: "var(--stone)",
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		marginBottom: "8px",
	},
	statNumber: {
		fontFamily: "var(--font-serif)",
		fontSize: "40px",
		color: "var(--ink)",
		margin: 0,
	},
	placeholderText: {
		color: "var(--stone)",
		fontSize: "15px",
	},
};
