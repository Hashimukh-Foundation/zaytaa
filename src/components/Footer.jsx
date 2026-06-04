import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

export default function Footer() {
	const { settings } = useSettings();

	return (
		<footer style={styles.footer}>
			<div style={styles.gridContainer}>
				{/* Brand col */}
				<div>
					<p style={styles.brandTitle}>Zaytaa</p>
					<p style={styles.brandDesc}>
						Rare botanicals. Refined by science. Luxury skincare for the modern
						ritual.
					</p>
				</div>

				{/* Links columns */}
				<div>
					<p style={styles.colHead}>SHOP</p>
					<FooterLink to="/shop?cat=serums">Serums</FooterLink>
					<FooterLink to="/shop?cat=moisturisers">Moisturisers</FooterLink>
					<FooterLink to="/shop?cat=face-oils">Face Oils</FooterLink>
					<FooterLink to="/shop?cat=toners">Toners</FooterLink>
				</div>

				<div>
					<p style={styles.colHead}>COMPANY</p>
					<FooterLink to="#">Our Story</FooterLink>
					<FooterLink to="#">Ingredients</FooterLink>
					<FooterLink to="#">Sustainability</FooterLink>
					<FooterLink to="#">Press</FooterLink>
				</div>

				<div>
					<p style={styles.colHead}>HELP</p>
					<FooterLink to="#">FAQ</FooterLink>
					<FooterLink to="#">Shipping</FooterLink>
					<FooterLink to="#">Returns</FooterLink>
					<FooterLink to="#">Contact</FooterLink>
				</div>
			</div>

			{/* Bottom bar */}
			<div style={styles.bottomBar}>
				<p style={styles.copyright}>© 2026 Lumière Beauty Inc.</p>
				<div style={styles.socialContainer}>
					{["Instagram", "Pinterest", "TikTok"].map((s) => (
						<a key={s} href="#" style={styles.socialLink}>
							{s}
						</a>
					))}
				</div>
			</div>
		</footer>
	);
}

function FooterLink({ to, children }) {
	return (
		<Link to={to} style={styles.footerLink}>
			{children}
		</Link>
	);
}

const styles = {
	footer: {
		background: "var(--white)",
		color: "var(--ink)",
		padding: "64px 40px 40px",
	},
	// Inside src/components/Footer.jsx, update this specific style object:

	gridContainer: {
		display: "grid",
		// This magic line makes the grid responsive automatically
		gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
		gap: "40px",
		maxWidth: "1200px",
		margin: "0 auto",
		paddingBottom: "60px",
		borderBottom: "1px solid var(--border)",
	},
	brandTitle: {
		fontFamily: "var(--font-serif)",
		fontSize: "24px",
		fontWeight: 700,
		letterSpacing: "0.1em",
		color: "var(--ink)",
		marginBottom: "16px",
	},
	brandDesc: {
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		fontWeight: 300,
		lineHeight: 1.6,
		color: "var(--stone)",
		maxWidth: "240px",
	},
	colHead: {
		fontFamily: "var(--font-sans)",
		fontSize: "11px",
		letterSpacing: "0.15em",
		color: "var(--ink)",
		marginBottom: "24px",
		fontWeight: 500,
	},
	footerLink: {
		display: "block",
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		fontWeight: 300,
		color: "var(--stone)",
		marginBottom: "16px",
		textDecoration: "none",
	},
	bottomBar: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		paddingTop: "32px",
		maxWidth: "1200px",
		margin: "0 auto",
	},
	copyright: {
		fontSize: "12px",
		color: "var(--stone)",
		fontFamily: "var(--font-sans)",
	},
	socialContainer: {
		display: "flex",
		gap: "24px",
	},
	socialLink: {
		fontSize: "12px",
		color: "var(--stone)",
		fontFamily: "var(--font-sans)",
		textDecoration: "none",
	},
};
