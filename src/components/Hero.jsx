import { useState } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

export default function Hero() {
	const { settings } = useSettings();
	const [current, setCurrent] = useState(0);

	const slides = [
		{
			eyebrow: settings.hero_1_eyebrow || "INTRODUCING — THE PURITY COLLECTION",
			line1: settings.hero_1_heading_1 || "Skin that",
			accent: settings.hero_1_heading_2 || "remembers",
			line3: settings.hero_1_heading_3 || "itself.",
			subtext:
				// settings.hero_1_subtext ||
				"Dear Sweetheart, can you inspire me to commit such a suicide?",
			btn1: { label: "Shop Now", url: "/shop" },
			btn2: { label: "Learn More", url: "/about" },
			bg: "var(--white)",
		},
	];

	const slide = slides[current];

	return (
		<section style={{ ...styles.section, backgroundColor: slide.bg }}>
			<p style={styles.eyebrow}>{slide.eyebrow}</p>

			<h1 style={styles.heading}>
				{slide.line1} <em style={styles.accent}>{slide.accent}</em>
				<br />
				{slide.line3}
			</h1>

			<p style={styles.subtext}>{slide.subtext}</p>

			<div style={styles.buttonContainer}>
				<Link to={slide.btn1.url} style={styles.btnPrimary}>
					{slide.btn1.label}
				</Link>
				<Link to={slide.btn2.url} style={styles.btnSecondary}>
					{slide.btn2.label}
				</Link>
			</div>
		</section>
	);
}

const styles = {
	section: {
		// Removed fixed minHeight so it conforms exactly to its content
		padding: "60px 24px",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		textAlign: "center",
		position: "relative",
	},
	eyebrow: {
		fontFamily: "var(--font-sans)",
		fontSize: "11px",
		letterSpacing: "0.15em",
		color: "var(--stone)",
		marginBottom: "16px", // Reduced from 32px
		textTransform: "uppercase",
	},
	heading: {
		fontFamily: "var(--font-serif)",
		fontSize: "clamp(48px, 8vw, 100px)", // Tweaked clamp for better mobile fit
		fontWeight: 800,
		lineHeight: 1.05,
		color: "var(--ink)",
		maxWidth: "900px",
		marginBottom: "20px", // Reduced from 32px
	},
	accent: {
		color: "var(--green)",
		fontStyle: "italic",
	},
	subtext: {
		fontFamily: "var(--font-sans)",
		fontSize: "clamp(15px, 3vw, 18px)", // Responsive subtext
		fontWeight: 300,
		color: "var(--stone)",
		maxWidth: "540px",
		lineHeight: 1.6,
		marginBottom: "32px", // Reduced from 48px
	},
	buttonContainer: {
		display: "flex",
		gap: "12px",
		justifyContent: "center",
		flexWrap: "wrap", // Allows buttons to stack on very narrow phone screens
	},
	btnPrimary: {
		background: "var(--green)",
		color: "#fff",
		padding: "14px 32px",
		borderRadius: "100px",
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		textDecoration: "none",
	},
	btnSecondary: {
		background: "transparent",
		color: "var(--stone)",
		padding: "14px 32px",
		borderRadius: "100px",
		border: "1px solid #ccc",
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		textDecoration: "none",
	},
};
