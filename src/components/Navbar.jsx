import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
	const navLinks = [
		{ label: "Skincare", url: "/shop?cat=skincare" },
		{ label: "Serums", url: "/shop?cat=serums" },
		{ label: "Collections", url: "/shop?cat=collections" },
		{ label: "Ritual", url: "/ritual" },
		{ label: "About", url: "/about" },
	];

	return (
		<nav style={styles.nav}>
			{/* Left — Logo */}
			<Link to="/" style={styles.logo}>
				Zaytaa
			</Link>

			{/* Center — Nav links (Added className here) */}
			<div className="nav-center" style={styles.linksContainer}>
				{navLinks.map((link) => (
					<NavLink key={link.url} to={link.url} style={getNavLinkStyle}>
						{link.label}
					</NavLink>
				))}
			</div>

			{/* Right — Search + Bag */}
			<div style={styles.actionsContainer}>
				<button style={styles.actionButton}>Search</button>
				<button style={styles.actionButton}>Bag</button>
			</div>
		</nav>
	);
}

function getNavLinkStyle({ isActive }) {
	return {
		...styles.navLink,
		fontWeight: isActive ? 500 : 400,
		color: isActive ? "var(--green)" : "var(--stone)",
	};
}

const styles = {
	nav: {
		position: "sticky",
		top: 0,
		zIndex: 100,
		background: "var(--white)",
		borderBottom: "1px solid var(--border)",
		display: "grid",
		gridTemplateColumns: "1fr auto 1fr",
		alignItems: "center",
		padding: "0 40px",
		height: "80px",
	},
	logo: {
		fontFamily: "var(--font-serif)",
		fontSize: "20px",
		fontWeight: 700,
		letterSpacing: "0.22em",
		color: "var(--ink)",
		textDecoration: "none",
	},
	linksContainer: {
		display: "flex",
		gap: "36px",
	},
	navLink: {
		fontFamily: "var(--font-sans)",
		fontSize: "13px",
		letterSpacing: "0.02em",
		paddingBottom: "2px",
		transition: "color 0.2s",
		textDecoration: "none",
	},
	actionsContainer: {
		display: "flex",
		gap: "24px",
		justifyContent: "flex-end",
		alignItems: "center",
	},
	actionButton: {
		background: "none",
		border: "none",
		fontFamily: "var(--font-sans)",
		fontSize: "13px",
		color: "var(--stone)",
		letterSpacing: "0.02em",
		cursor: "pointer",
	},
};
