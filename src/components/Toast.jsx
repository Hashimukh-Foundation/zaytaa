import { useEffect } from "react";

export default function Toast({ message, onClose }) {
	// Automatically close after 3 seconds
	useEffect(() => {
		const timer = setTimeout(onClose, 3000);
		return () => clearTimeout(timer);
	}, [onClose]);

	if (!message) return null;

	// ---> NEW: Smart Icon Logic <---
	// If the message contains "out of stock", it switches to an Error state
	const isError = message.toLowerCase().includes("out of stock");
	const displayIcon = isError ? "✕" : "✓";
	const iconColor = isError ? "#c94040" : "var(--green)";

	return (
		<div className="axio-toast" style={styles.toast}>
			<div style={styles.contentWrap}>
				{/* ---> UPDATED: Uses the dynamic icon and color <--- */}
				<span style={{ ...styles.icon, color: iconColor }}>{displayIcon}</span>
				<span style={styles.message}>{message}</span>
			</div>

			<button onClick={onClose} style={styles.closeBtn}>
				✕
			</button>

			<style>{`
                @keyframes slideDownCenter { 
                    from { transform: translate(-50%, -100%); opacity: 0; } 
                    to { transform: translate(-50%, 0); opacity: 1; } 
                }
                .axio-toast { 
                    animation: slideDownCenter 0.3s ease-out forwards; 
                }
                
                .axio-close-btn:hover {
                    color: white !important;
                }
            `}</style>
		</div>
	);
}

const styles = {
	toast: {
		position: "fixed",
		top: "24px",
		left: "50%",
		background: "var(--ink)",
		color: "white",
		padding: "12px 16px 12px 24px",
		borderRadius: "8px",
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		minWidth: "250px",
		boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
		zIndex: 9999,
	},
	contentWrap: {
		display: "flex",
		alignItems: "center",
		gap: "12px",
	},
	icon: {
		fontSize: "16px",
		fontWeight: "bold", // Made the icon slightly bolder so the X pops
	},
	message: {
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		fontWeight: 600,
		color: "white",
	},
	closeBtn: {
		background: "none",
		border: "none",
		color: "#a8a29e",
		fontSize: "16px",
		cursor: "pointer",
		padding: "4px 8px",
		marginLeft: "16px",
		transition: "color 0.2s ease",
	},
};
