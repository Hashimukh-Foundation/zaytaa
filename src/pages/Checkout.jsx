import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { supabase } from "../supabaseClient";

export default function Checkout() {
	const { cart, cartTotal, clearCart, updateQuantity, removeFromCart } =
		useCart();
	const navigate = useNavigate();

	// --- Form States ---
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		address: "",
		transactionId: "",
	});

	const [paymentMethod, setPaymentMethod] = useState("bkash"); // "bkash" | "cod"
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	// --- Success State ---
	const [successId, setSuccessId] = useState(null);

	// --- Order Lookup State ---
	const [lookupId, setLookupId] = useState("");
	const [lookupResult, setLookupResult] = useState(null);
	const [lookupError, setLookupError] = useState("");
	const [isLooking, setIsLooking] = useState(false);
	const [txnUpdate, setTxnUpdate] = useState("");
	const [txnSaved, setTxnSaved] = useState(false);
	const [isSavingTxn, setIsSavingTxn] = useState(false);

	// Helper: Generate a secure 8-character ID
	const generateDisplayId = () => {
		const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
		let result = "ZYT-";
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

		// bKash requires a transaction ID
		if (paymentMethod === "bkash" && !formData.transactionId.trim()) {
			setErrorMsg("Please enter your bKash/Nagad transaction ID.");
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
						transaction_id: formData.transactionId.trim() || null,
						status: "Pending",
						payment_method: paymentMethod === "cod" ? "COD" : "Manual",
					},
				])
				.select()
				.single();

			if (orderError) throw orderError;

			// 2. Prepare and insert the individual Order Items
			const orderItems = cart.map((item) => ({
				order_id: orderData.id,
				product_id: item.product_id,
				variant_id: item.variant_id,
				quantity: item.quantity,
				price_at_purchase: item.price,
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

	// --- Order Lookup ---
	const handleLookup = async (e) => {
		e.preventDefault();
		const id = lookupId.trim().toUpperCase();
		if (!id) return;
		setLookupError("");
		setLookupResult(null);
		setTxnSaved(false);
		setTxnUpdate("");
		setIsLooking(true);
		try {
			const { data, error } = await supabase
				.from("orders")
				.select(
					"id, display_id, status, total_amount, payment_method, transaction_id, created_at",
				)
				.eq("display_id", id)
				.maybeSingle();

			if (error) throw error;
			if (!data) {
				setLookupError(
					"No order found with that ID. Please check and try again.",
				);
			} else {
				setLookupResult(data);
				setTxnUpdate(data.transaction_id || "");
			}
		} catch (err) {
			setLookupError("Something went wrong. Please try again.");
		} finally {
			setIsLooking(false);
		}
	};

	const handleSaveTxn = async () => {
		if (!lookupResult || !txnUpdate.trim()) return;
		setIsSavingTxn(true);
		try {
			const { error } = await supabase
				.from("orders")
				.update({ transaction_id: txnUpdate.trim() })
				.eq("id", lookupResult.id);
			if (error) throw error;
			setTxnSaved(true);
			setLookupResult({ ...lookupResult, transaction_id: txnUpdate.trim() });
		} catch (err) {
			setLookupError("Could not save transaction ID. Please try again.");
		} finally {
			setIsSavingTxn(false);
		}
	};

	// --- SUCCESS SCREEN ---
	if (successId) {
		return (
			<div style={styles.pageWrapper}>
				<div style={styles.successCard}>
					<h1 style={styles.title}>Order Received!</h1>
					<p style={styles.bodyText}>
						Thank you for shopping with us. We are reviewing your order.
					</p>

					<div style={styles.idBox}>
						<span style={styles.idLabel}>YOUR TRACKING ID</span>
						<strong style={styles.idValue}>{successId}</strong>
					</div>

					<p style={{ ...styles.bodyText, fontSize: "14px" }}>
						Please save this ID. You can use it to check your order status
						below.
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

					{/* Order Lookup */}
					<div style={styles.lookupBox}>
						<h2
							style={{
								...styles.sectionTitle,
								textAlign: "center",
								marginBottom: "8px",
							}}
						>
							Track Your Order
						</h2>
						<p
							style={{
								...styles.bodyText,
								fontSize: "13px",
								textAlign: "center",
								marginBottom: "16px",
							}}
						>
							Enter your order ID to check status or add a transaction ID.
						</p>
						<form
							onSubmit={handleLookup}
							style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
						>
							<input
								type="text"
								value={lookupId}
								onChange={(e) => setLookupId(e.target.value)}
								placeholder="e.g. ZYT-AB2CD3"
								style={{ ...styles.input, flex: 1, minWidth: "200px" }}
							/>
							<button
								type="submit"
								disabled={isLooking}
								style={styles.btnPrimary}
							>
								{isLooking ? "Searching..." : "Find Order"}
							</button>
						</form>
						{lookupError && (
							<div style={{ ...styles.errorBox, marginTop: "12px" }}>
								{lookupError}
							</div>
						)}
						{lookupResult && (
							<div style={styles.lookupResult}>
								<div style={styles.lookupRow}>
									<span style={styles.lookupLabel}>Order ID</span>
									<span style={styles.lookupValue}>
										{lookupResult.display_id}
									</span>
								</div>
								<div style={styles.lookupRow}>
									<span style={styles.lookupLabel}>Status</span>
									<span
										style={{
											...styles.lookupValue,
											color: "var(--green)",
											fontWeight: 700,
										}}
									>
										{lookupResult.status}
									</span>
								</div>
								<div style={styles.lookupRow}>
									<span style={styles.lookupLabel}>Total</span>
									<span style={styles.lookupValue}>
										৳{Number(lookupResult.total_amount).toFixed(2)}
									</span>
								</div>
								<div style={styles.lookupRow}>
									<span style={styles.lookupLabel}>Payment</span>
									<span style={styles.lookupValue}>
										{lookupResult.payment_method}
									</span>
								</div>
								{lookupResult.transaction_id && (
									<div style={styles.lookupRow}>
										<span style={styles.lookupLabel}>Transaction ID</span>
										<span style={styles.lookupValue}>
											{lookupResult.transaction_id}
										</span>
									</div>
								)}
								{/* Allow adding transaction ID if missing or updating */}
								<div style={{ marginTop: "16px" }}>
									<label style={styles.label}>
										{lookupResult.transaction_id
											? "Update Transaction ID"
											: "Add Transaction ID"}
									</label>
									<div
										style={{ display: "flex", gap: "10px", marginTop: "8px" }}
									>
										<input
											type="text"
											value={txnUpdate}
											onChange={(e) => setTxnUpdate(e.target.value)}
											placeholder="e.g. 8A7B6C5D4E"
											style={{ ...styles.input, flex: 1 }}
										/>
										<button
											onClick={handleSaveTxn}
											disabled={isSavingTxn || !txnUpdate.trim() || txnSaved}
											style={styles.btnPrimary}
										>
											{txnSaved
												? "Saved ✓"
												: isSavingTxn
													? "Saving..."
													: "Save"}
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
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
							Payment Method
						</h2>

						{/* Payment Method Toggle */}
						<div style={styles.paymentToggle}>
							<button
								type="button"
								onClick={() => setPaymentMethod("bkash")}
								style={{
									...styles.paymentOption,
									...(paymentMethod === "bkash"
										? styles.paymentOptionActive
										: {}),
								}}
							>
								<span style={styles.paymentIcon}>💳</span>
								<div>
									<div style={styles.paymentOptionTitle}>bKash / Nagad</div>
									<div style={styles.paymentOptionSub}>
										Mobile banking transfer
									</div>
								</div>
							</button>
							<button
								type="button"
								onClick={() => setPaymentMethod("cod")}
								style={{
									...styles.paymentOption,
									...(paymentMethod === "cod"
										? styles.paymentOptionActive
										: {}),
								}}
							>
								<span style={styles.paymentIcon}>🏠</span>
								<div>
									<div style={styles.paymentOptionTitle}>Cash on Delivery</div>
									<div style={styles.paymentOptionSub}>
										Pay when you receive
									</div>
								</div>
							</button>
						</div>

						{/* bKash payment box */}
						{paymentMethod === "bkash" && (
							<div style={styles.paymentBox}>
								<p
									style={{
										...styles.bodyText,
										marginBottom: "16px",
										fontSize: "14px",
									}}
								>
									Please send exactly <strong>৳{cartTotal.toFixed(2)}</strong>{" "}
									via bKash/Nagad to <strong>01XXXXXXXXX</strong>. Enter the
									transaction ID below to verify your order.
								</p>
								<div style={styles.inputGroup}>
									<label style={styles.label}>
										Transaction ID (bKash/Nagad){" "}
										<span style={styles.optionalBadge}>optional</span>
									</label>
									<input
										type="text"
										name="transactionId"
										placeholder="e.g. 8A7B6C5D4E"
										value={formData.transactionId}
										onChange={handleInputChange}
										style={styles.input}
									/>
									<span style={{ fontSize: "12px", color: "var(--stone)" }}>
										You can add this later using your order tracking ID.
									</span>
								</div>
							</div>
						)}

						{/* COD info box */}
						{paymentMethod === "cod" && (
							<div style={styles.paymentBox}>
								<p style={{ ...styles.bodyText, fontSize: "14px" }}>
									Your order will be delivered to your address. Please have{" "}
									<strong>৳{cartTotal.toFixed(2)}</strong> ready in cash when
									the delivery arrives.
								</p>
							</div>
						)}

						{errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

						<button
							type="submit"
							disabled={isSubmitting}
							style={{ ...styles.btnPrimary, width: "100%", marginTop: "24px" }}
						>
							{isSubmitting
								? "Processing..."
								: `Place Order — ৳${cartTotal.toFixed(2)}`}
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
										{/* Quantity controls */}
										<div style={styles.qtyControls}>
											<button
												type="button"
												style={styles.qtyBtn}
												onClick={() => {
													if (item.quantity <= 1)
														removeFromCart(item.cartItemId);
													else
														updateQuantity(item.cartItemId, item.quantity - 1);
												}}
											>
												−
											</button>
											<span style={styles.qtyNum}>{item.quantity}</span>
											<button
												type="button"
												style={styles.qtyBtn}
												disabled={item.quantity >= (item.maxStock || 99)}
												onClick={() =>
													updateQuantity(item.cartItemId, item.quantity + 1)
												}
											>
												+
											</button>
										</div>
									</div>
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											alignItems: "flex-end",
											gap: "8px",
										}}
									>
										<div style={styles.itemPrice}>
											৳{(item.price * item.quantity).toFixed(2)}
										</div>
										<button
											type="button"
											style={styles.removeBtn}
											onClick={() => removeFromCart(item.cartItemId)}
										>
											Remove
										</button>
									</div>
								</div>
							))}
						</div>

						<div style={styles.totalRow}>
							<span>Total</span>
							<strong>৳{cartTotal.toFixed(2)}</strong>
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
		display: "flex",
		alignItems: "center",
		gap: "8px",
	},
	optionalBadge: {
		fontWeight: 400,
		fontSize: "11px",
		background: "#f4f3f0",
		color: "var(--stone)",
		padding: "2px 6px",
		borderRadius: "4px",
		textTransform: "none",
		letterSpacing: 0,
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

	paymentToggle: {
		display: "grid",
		gridTemplateColumns: "1fr 1fr",
		gap: "12px",
	},
	paymentOption: {
		display: "flex",
		alignItems: "center",
		gap: "12px",
		padding: "16px",
		border: "2px solid var(--border)",
		borderRadius: "8px",
		background: "#fcfbf8",
		cursor: "pointer",
		textAlign: "left",
		transition: "border-color 0.2s",
		fontFamily: "var(--font-sans)",
	},
	paymentOptionActive: {
		borderColor: "var(--ink)",
		background: "white",
	},
	paymentIcon: { fontSize: "24px" },
	paymentOptionTitle: {
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		fontWeight: 700,
		color: "var(--ink)",
	},
	paymentOptionSub: {
		fontFamily: "var(--font-sans)",
		fontSize: "12px",
		color: "var(--stone)",
		marginTop: "2px",
	},

	paymentBox: {
		background: "#f4f3f0",
		border: "1px solid var(--border)",
		borderRadius: "8px",
		padding: "24px",
		display: "flex",
		flexDirection: "column",
		gap: "12px",
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
		flexShrink: 0,
	},
	itemInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "6px" },
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
	qtyControls: {
		display: "flex",
		alignItems: "center",
		gap: "8px",
		marginTop: "4px",
	},
	qtyBtn: {
		width: "28px",
		height: "28px",
		border: "1px solid var(--border)",
		borderRadius: "4px",
		background: "white",
		color: "var(--ink)",
		fontFamily: "var(--font-sans)",
		fontSize: "16px",
		fontWeight: 600,
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		lineHeight: 1,
	},
	qtyNum: {
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		fontWeight: 600,
		color: "var(--ink)",
		minWidth: "20px",
		textAlign: "center",
	},
	itemPrice: {
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		fontWeight: 600,
		color: "var(--ink)",
	},
	removeBtn: {
		background: "none",
		border: "none",
		fontFamily: "var(--font-sans)",
		fontSize: "12px",
		color: "#c94040",
		cursor: "pointer",
		padding: 0,
		textDecoration: "underline",
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
		display: "inline-block",
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

	lookupBox: {
		maxWidth: "520px",
		margin: "40px auto 0",
		padding: "32px",
		border: "1px solid var(--border)",
		borderRadius: "12px",
		background: "#fcfbf8",
		textAlign: "left",
	},
	lookupResult: {
		marginTop: "20px",
		padding: "20px",
		background: "white",
		border: "1px solid var(--border)",
		borderRadius: "8px",
		display: "flex",
		flexDirection: "column",
		gap: "12px",
	},
	lookupRow: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		paddingBottom: "8px",
		borderBottom: "1px solid var(--border)",
	},
	lookupLabel: {
		fontFamily: "var(--font-sans)",
		fontSize: "12px",
		fontWeight: 600,
		color: "var(--stone)",
		textTransform: "uppercase",
		letterSpacing: "0.05em",
	},
	lookupValue: {
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		fontWeight: 600,
		color: "var(--ink)",
	},
};
