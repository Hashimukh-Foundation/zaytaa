import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient"; // Make sure your path is correct!

export default function Hero() {
	// 1. Set up the state using the keys we created in the admin panel
	const [heroSettings, setHeroSettings] = useState({
		home_title: "Skin that remembers itself.",
		home_subtitle:
			"Dear Sweetheart, can you inspire me to commit such a suicide?",
	});

	// 2. Fetch the data from Supabase on load
	useEffect(() => {
		async function fetchSettings() {
			const { data } = await supabase
				.from("site_settings")
				.select("key, value");

			if (data) {
				const settingsMap = data.reduce((acc, row) => {
					acc[row.key] = row.value;
					return acc;
				}, {});

				setHeroSettings({
					home_title:
						settingsMap["home_title"] || "Skin that remembers itself.",
					home_subtitle:
						settingsMap["home_subtitle"] ||
						"Dear Sweetheart, can you inspire me to commit such a suicide?",
				});
			}
		}
		fetchSettings();
	}, []);

	// 3. Render the fetched data directly into the HTML
	return (
		<section style={{ ...styles.section, backgroundColor: "var(--white)" }}>
			<p style={styles.eyebrow}>INTRODUCING — THE PURITY COLLECTION</p>

			<h1 style={styles.heading}>{heroSettings.home_title}</h1>

			<p style={styles.subtext}>{heroSettings.home_subtitle}</p>

			<div style={styles.buttonContainer}>
				<Link to="/shop" style={styles.btnPrimary}>
					Shop Now
				</Link>
				<Link to="/about" style={styles.btnSecondary}>
					Learn More
				</Link>
			</div>
		</section>
	);
}

const styles = {
	section: {
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
		marginBottom: "16px",
		textTransform: "uppercase",
	},
	heading: {
		fontFamily: "var(--font-serif)",
		fontSize: "clamp(48px, 8vw, 100px)",
		fontWeight: 800,
		lineHeight: 1.05,
		color: "var(--ink)",
		maxWidth: "900px",
		marginBottom: "20px",
	},
	subtext: {
		fontFamily: "var(--font-sans)",
		fontSize: "clamp(15px, 3vw, 18px)",
		fontWeight: 300,
		color: "var(--stone)",
		maxWidth: "540px",
		lineHeight: 1.6,
		marginBottom: "32px",
	},
	buttonContainer: {
		display: "flex",
		gap: "12px",
		justifyContent: "center",
		flexWrap: "wrap",
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
