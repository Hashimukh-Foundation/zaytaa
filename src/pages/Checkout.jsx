import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { supabase } from "../supabaseClient";

export default function Checkout() {
	const { cart, cartTotal, clearCart } = useCart();
	const navigate = useNavigate();

	// --- Form States ---
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		address: "",
		transactionId: "",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	// --- Success State ---
	const [successId, setSuccessId] = useState(null);

	// Helper: Generate a secure 8-character ID
	const generateDisplayId = () => {
		const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
		let result = "AXIO-";
		for (let i = 0; i < 6; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmitOrder = async (e) => {
		e.preventDefault();
		setErrorMsg("");
		setIsSubmitting(true);

		if (cart.length === 0) {
			setErrorMsg("Your cart is empty!");
			setIsSubmitting(false);
			return;
		}

		try {
			const displayId = generateDisplayId();

			// 1. Create the parent Order record
			const { data: orderData, error: orderError } = await supabase
				.from("orders")
				.insert([
					{
						display_id: displayId,
						customer_name: formData.name,
						customer_email: formData.email,
						customer_phone: formData.phone,
						shipping_address: formData.address,
						total_amount: cartTotal,
						transaction_id: formData.transactionId,
						status: "Pending",
						payment_method: "Manual",
					},
				])
				.select()
				.single();

			if (orderError) throw orderError;

			// 2. Prepare and insert the individual Order Items
			const orderItems = cart.map((item) => ({
				order_id: orderData.id, // Ties it to the order we just created
				product_id: item.product_id,
				variant_id: item.variant_id,
				quantity: item.quantity,
				price_at_purchase: item.price, // Locks in the exact price they paid
			}));

			const { error: itemsError } = await supabase
				.from("order_items")
				.insert(orderItems);

			if (itemsError) throw itemsError;

			// 3. Success! Clean up and show confirmation
			clearCart();
			setSuccessId(displayId);
		} catch (err) {
			console.error("Checkout Error:", err);
			setErrorMsg(
				"Something went wrong processing your order. Please try again.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	// --- SUCCESS SCREEN ---
	if (successId) {
		return (
			<div style={styles.pageWrapper}>
				<div style={styles.successCard}>
					<h1 style={styles.title}>Order Received!</h1>
					<p style={styles.bodyText}>
						Thank you for shopping with us. We are reviewing your transaction.
					</p>

					<div style={styles.idBox}>
						<span style={styles.idLabel}>YOUR TRACKING ID</span>
						<strong style={styles.idValue}>{successId}</strong>
					</div>

					<p style={{ ...styles.bodyText, fontSize: "14px" }}>
						Please save this ID. You can use it to check your order status.
					</p>

					<Link to="/shop" style={styles.btnPrimary}>
						Continue Shopping
					</Link>
				</div>
			</div>
		);
	}

	// --- CHECKOUT FORM SCREEN ---
	return (
		<div style={styles.pageWrapper}>
			<div style={styles.header}>
				<h1 style={styles.title}>Secure Checkout</h1>
			</div>

			{cart.length === 0 ? (
				<div style={{ textAlign: "center", padding: "60px 20px" }}>
					<p style={styles.bodyText}>Your bag is currently empty.</p>
					<Link
						to="/shop"
						style={{
							...styles.btnPrimary,
							display: "inline-block",
							marginTop: "20px",
						}}
					>
						Return to Shop
					</Link>
				</div>
			) : (
				<div style={styles.checkoutGrid}>
					{/* LEFT: The Form */}
					<form onSubmit={handleSubmitOrder} style={styles.formSection}>
						<h2 style={styles.sectionTitle}>Shipping Details</h2>

						<div style={styles.inputGroup}>
							<label style={styles.label}>Full Name</label>
							<input
								required
								type="text"
								name="name"
								value={formData.name}
								onChange={handleInputChange}
								style={styles.input}
							/>
						</div>

						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: "16px",
							}}
						>
							<div style={styles.inputGroup}>
								<label style={styles.label}>Email Address</label>
								<input
									required
									type="email"
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									style={styles.input}
								/>
							</div>
							<div style={styles.inputGroup}>
								<label style={styles.label}>Phone Number</label>
								<input
									required
									type="tel"
									name="phone"
									value={formData.phone}
									onChange={handleInputChange}
									style={styles.input}
								/>
							</div>
						</div>

						<div style={styles.inputGroup}>
							<label style={styles.label}>Full Delivery Address</label>
							<textarea
								required
								name="address"
								rows="3"
								value={formData.address}
								onChange={handleInputChange}
								style={styles.input}
							></textarea>
						</div>

						<h2 style={{ ...styles.sectionTitle, marginTop: "40px" }}>
							Payment Information
						</h2>
						<div style={styles.paymentBox}>
							<p
								style={{
									...styles.bodyText,
									marginBottom: "16px",
									fontSize: "14px",
								}}
							>
								Please send exactly <strong>${cartTotal.toFixed(2)}</strong> via
								bKash to <strong>01XXXXXXXXX</strong>. Enter the transaction ID
								below to verify your order.
							</p>
							<div style={styles.inputGroup}>
								<label style={styles.label}>Transaction ID (bKash/Nagad)</label>
								<input
									required
									type="text"
									name="transactionId"
									placeholder="e.g. 8A7B6C5D4E"
									value={formData.transactionId}
									onChange={handleInputChange}
									style={styles.input}
								/>
							</div>
						</div>

						{errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

						<button
							type="submit"
							disabled={isSubmitting}
							style={{ ...styles.btnPrimary, width: "100%", marginTop: "24px" }}
						>
							{isSubmitting
								? "Processing..."
								: `Place Order - $${cartTotal.toFixed(2)}`}
						</button>
					</form>

					{/* RIGHT: Order Summary */}
					<div style={styles.summarySection}>
						<h2 style={styles.sectionTitle}>Order Summary</h2>
						<div style={styles.cartList}>
							{cart.map((item) => (
								<div key={item.cartItemId} style={styles.cartItem}>
									<img
										src={item.image}
										alt={item.name}
										style={styles.itemImg}
									/>
									<div style={styles.itemInfo}>
										<div style={styles.itemName}>{item.name}</div>
										{item.variant_name && (
											<div style={styles.itemVariant}>
												Size: {item.variant_name}
											</div>
										)}
										<div style={styles.itemQty}>Qty: {item.quantity}</div>
									</div>
									<div style={styles.itemPrice}>
										${(item.price * item.quantity).toFixed(2)}
									</div>
								</div>
							))}
						</div>

						<div style={styles.totalRow}>
							<span>Total</span>
							<strong>${cartTotal.toFixed(2)}</strong>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// --- Styles ---
const styles = {
	pageWrapper: {
		maxWidth: "1200px",
		margin: "0 auto",
		padding: "40px 24px",
		minHeight: "80vh",
	},
	header: {
		marginBottom: "40px",
		borderBottom: "1px solid var(--border)",
		paddingBottom: "24px",
	},
	title: {
		fontFamily: "var(--font-serif)",
		fontSize: "32px",
		color: "var(--ink)",
		margin: 0,
	},
	sectionTitle: {
		fontFamily: "var(--font-sans)",
		fontSize: "18px",
		fontWeight: 600,
		color: "var(--ink)",
		marginBottom: "20px",
	},
	bodyText: {
		fontFamily: "var(--font-sans)",
		fontSize: "16px",
		color: "var(--stone)",
		lineHeight: 1.6,
	},

	checkoutGrid: {
		display: "grid",
		gridTemplateColumns: "1fr 400px",
		gap: "64px",
		alignItems: "start",
	},

	formSection: { display: "flex", flexDirection: "column", gap: "20px" },
	inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
	label: {
		fontFamily: "var(--font-sans)",
		fontSize: "13px",
		fontWeight: 600,
		color: "var(--ink)",
		textTransform: "uppercase",
		letterSpacing: "0.05em",
	},
	input: {
		padding: "12px 16px",
		border: "1px solid var(--border)",
		borderRadius: "6px",
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		outline: "none",
		background: "#fcfbf8",
	},

	paymentBox: {
		background: "#f4f3f0",
		border: "1px solid var(--border)",
		borderRadius: "8px",
		padding: "24px",
	},
	errorBox: {
		padding: "12px",
		background: "rgba(201, 64, 64, 0.1)",
		color: "#c94040",
		borderRadius: "6px",
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		fontWeight: 500,
		textAlign: "center",
	},

	summarySection: {
		background: "#fcfbf8",
		border: "1px solid var(--border)",
		borderRadius: "12px",
		padding: "32px",
		position: "sticky",
		top: "120px",
	},
	cartList: {
		display: "flex",
		flexDirection: "column",
		gap: "20px",
		marginBottom: "32px",
	},
	cartItem: {
		display: "flex",
		gap: "16px",
		alignItems: "center",
		paddingBottom: "20px",
		borderBottom: "1px solid var(--border)",
	},
	itemImg: {
		width: "64px",
		height: "64px",
		objectFit: "cover",
		borderRadius: "6px",
		background: "#f4f3f0",
	},
	itemInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "4px" },
	itemName: {
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		fontWeight: 600,
		color: "var(--ink)",
	},
	itemVariant: {
		fontFamily: "var(--font-sans)",
		fontSize: "12px",
		color: "var(--stone)",
	},
	itemQty: {
		fontFamily: "var(--font-sans)",
		fontSize: "12px",
		color: "var(--stone)",
	},
	itemPrice: {
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		fontWeight: 600,
		color: "var(--ink)",
	},

	totalRow: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		fontFamily: "var(--font-sans)",
		fontSize: "20px",
		color: "var(--ink)",
		borderTop: "2px solid var(--ink)",
		paddingTop: "20px",
	},

	btnPrimary: {
		background: "var(--ink)",
		color: "white",
		border: "none",
		padding: "16px 24px",
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		fontWeight: 600,
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		borderRadius: "6px",
		cursor: "pointer",
		textAlign: "center",
		textDecoration: "none",
	},

	successCard: {
		maxWidth: "500px",
		margin: "60px auto",
		textAlign: "center",
		padding: "40px",
		border: "1px solid var(--border)",
		borderRadius: "12px",
		background: "#fcfbf8",
	},
	idBox: {
		background: "var(--white)",
		border: "2px dashed var(--border)",
		padding: "24px",
		borderRadius: "8px",
		margin: "32px 0",
		display: "flex",
		flexDirection: "column",
		gap: "8px",
	},
	idLabel: {
		fontFamily: "var(--font-sans)",
		fontSize: "11px",
		color: "var(--stone)",
		fontWeight: 600,
		textTransform: "uppercase",
		letterSpacing: "0.1em",
	},
	idValue: {
		fontFamily: "var(--font-mono)",
		fontSize: "32px",
		color: "var(--ink)",
		letterSpacing: "0.05em",
	},
};
