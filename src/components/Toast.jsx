import { useEffect } from "react";

export default function Toast({ message, onClose }) {
	useEffect(() => {
		const timer = setTimeout(onClose, 3000); // Fades out after 3 seconds
		return () => clearTimeout(timer);
	}, [onClose]);

	return (
		<div style={styles.toast}>
			<span style={styles.icon}>✓</span>
			<span style={styles.message}>{message}</span>
			<style>{`
                @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .axio-toast { animation: slideIn 0.3s ease-out; }
            `}</style>
		</div>
	);
}

const styles = {
	toast: {
		position: "fixed",
		bottom: "24px",
		right: "24px",
		background: "var(--ink)",
		color: "white",
		padding: "16px 24px",
		borderRadius: "8px",
		display: "flex",
		alignItems: "center",
		gap: "12px",
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		fontWeight: 600,
		boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
		zIndex: 9999,
	},
	icon: { color: "var(--green)" },
};
