import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	const { signIn } = useAuth();
	const navigate = useNavigate();

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const { error } = await signIn(email, password);

		if (error) {
			setError(error.message);
			setLoading(false);
		} else {
			// If successful, send them to the admin dashboard!
			navigate("/admin/dashboard");
		}
	};

	return (
		<div style={styles.container}>
			<div style={styles.card}>
				<h1 style={styles.heading}>Zaytaa Admin</h1>
				<p style={styles.subtext}>Sign in to manage your store.</p>

				{error && <p style={styles.error}>{error}</p>}

				<form onSubmit={handleLogin} style={styles.form}>
					<input
						type="email"
						placeholder="Email Address"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						style={styles.input}
						required
					/>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						style={styles.input}
						required
					/>
					<button type="submit" style={styles.button} disabled={loading}>
						{loading ? "Authenticating..." : "Sign In"}
					</button>
				</form>
			</div>
		</div>
	);
}

const styles = {
	container: {
		minHeight: "100vh",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		background: "var(--white)", // Using your soft alabaster white
	},
	card: {
		width: "100%",
		maxWidth: "400px",
		padding: "40px",
		background: "#fff",
		borderRadius: "16px",
		boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
		textAlign: "center",
	},
	heading: {
		fontFamily: "var(--font-serif)",
		fontSize: "28px",
		marginBottom: "8px",
		color: "var(--ink)",
	},
	subtext: {
		fontFamily: "var(--font-sans)",
		color: "var(--stone)",
		marginBottom: "32px",
	},
	form: {
		display: "flex",
		flexDirection: "column",
		gap: "16px",
	},
	input: {
		padding: "16px",
		borderRadius: "8px",
		border: "1px solid var(--border)",
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		outline: "none",
	},
	button: {
		background: "var(--ink)",
		color: "#fff",
		padding: "16px",
		borderRadius: "8px",
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		fontWeight: 500,
		border: "none",
		cursor: "pointer",
		marginTop: "8px",
	},
	error: {
		color: "red",
		fontSize: "14px",
		marginBottom: "16px",
		background: "#fff0f0",
		padding: "10px",
		borderRadius: "8px",
	},
};
