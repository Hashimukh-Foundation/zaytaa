import { useState } from "react";
import { useSettings } from "../context/SettingsContext";

export default function Newsletter() {
	const { settings } = useSettings();
	const [email, setEmail] = useState("");

	return (
		<section style={styles.section}>
			<h2 style={styles.heading}>
				Be the first to <em style={styles.accent}>glow.</em>
			</h2>

			<p style={styles.subtext}>
				Early access, rituals, and exclusive offers — straight to you.
			</p>

			<div className="newsletter-input-group" style={styles.inputContainer}>
				<input
					type="email"
					placeholder="Your email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					style={styles.input}
				/>
				<button style={styles.button}>Join</button>
			</div>
		</section>
	);
}

const styles = {
	section: {
		background: "var(--green-light)",
		padding: "64px 24px",
		textAlign: "center",
	},
	heading: {
		fontFamily: "var(--font-serif)",
		fontSize: "clamp(40px, 5vw, 64px)",
		fontWeight: 700,
		color: "var(--ink)",
		marginBottom: "16px",
	},
	accent: {
		color: "var(--green)",
		fontStyle: "italic",
	},
	subtext: {
		fontFamily: "var(--font-sans)",
		fontSize: "16px",
		fontWeight: 300,
		color: "var(--stone)",
		marginBottom: "48px",
	},
	inputContainer: {
		display: "flex",
		maxWidth: "420px",
		margin: "0 auto",
		borderRadius: "100px",
		background: "var(--white)",
		padding: "6px",
		boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
	},
	input: {
		flex: 1,
		padding: "14px 24px",
		border: "none",
		outline: "none",
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		background: "transparent",
		color: "var(--ink)",
	},
	button: {
		background: "var(--green)",
		color: "#fff",
		border: "none",
		padding: "0 32px",
		borderRadius: "100px",
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		cursor: "pointer",
	},
};
