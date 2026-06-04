import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CustomerLogin() {
	const [isRegistering, setIsRegistering] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	const { signIn, signUp } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		let authError;

		if (isRegistering) {
			const { error } = await signUp(email, password, name);
			authError = error;
		} else {
			const { error } = await signIn(email, password);
			authError = error;
		}

		if (authError) {
			setError(authError.message);
			setLoading(false);
		} else {
			// Redirect to the shop or account page after success
			navigate("/shop");
		}
	};

	return (
		<div style={styles.container}>
			<div style={styles.card}>
				<h1 style={styles.heading}>
					{isRegistering ? "Create Account" : "Welcome Back"}
				</h1>
				<p style={styles.subtext}>
					{isRegistering
						? "Join LUMIÈRE to unlock exclusive perks."
						: "Sign in to access your orders and saved items."}
				</p>

				{error && <p style={styles.error}>{error}</p>}

				<form onSubmit={handleSubmit} style={styles.form}>
					{isRegistering && (
						<input
							type="text"
							placeholder="Full Name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							style={styles.input}
							required
						/>
					)}
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
						{loading
							? "Please wait..."
							: isRegistering
								? "Register"
								: "Sign In"}
					</button>
				</form>

				<button
					onClick={() => {
						setIsRegistering(!isRegistering);
						setError(null);
					}}
					style={styles.toggleButton}
				>
					{isRegistering
						? "Already have an account? Sign In"
						: "New here? Create an Account"}
				</button>
			</div>
		</div>
	);
}

const styles = {
	container: {
		padding: "100px 24px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		background: "var(--white)",
		minHeight: "70vh",
	},
	card: {
		width: "100%",
		maxWidth: "440px",
		textAlign: "center",
	},
	heading: {
		fontFamily: "var(--font-serif)",
		fontSize: "40px",
		color: "var(--ink)",
		marginBottom: "12px",
	},
	subtext: {
		fontFamily: "var(--font-sans)",
		color: "var(--stone)",
		marginBottom: "40px",
		fontSize: "16px",
	},
	form: {
		display: "flex",
		flexDirection: "column",
		gap: "16px",
		marginBottom: "24px",
	},
	input: {
		padding: "16px",
		borderRadius: "0", // Sharp corners for an editorial look
		border: "1px solid var(--border)",
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		outline: "none",
		background: "transparent",
	},
	button: {
		background: "var(--ink)",
		color: "#fff",
		padding: "18px",
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		fontWeight: 500,
		letterSpacing: "0.1em",
		textTransform: "uppercase",
		border: "none",
		cursor: "pointer",
		marginTop: "16px",
	},
	toggleButton: {
		background: "none",
		border: "none",
		color: "var(--stone)",
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		cursor: "pointer",
		textDecoration: "underline",
	},
	error: {
		color: "#d9534f",
		fontSize: "14px",
		marginBottom: "24px",
	},
};
