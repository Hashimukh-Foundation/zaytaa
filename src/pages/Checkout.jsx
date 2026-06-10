import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { bdDistricts, getThanasForDistrict } from "../data/bdLocations";

export default function Checkout() {
	const { cart, cartTotal, clearCart } = useCart();

	// ---> NEW: State to hold database fees <---
	const [courierSettings, setCourierSettings] = useState(null);

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		address: "",
		district: "",
		thana: "",
		postalCode: "",
		paymentMethod: "cod",
		transactionId: "",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");
	const [successId, setSuccessId] = useState(null);

	// ---> NEW: Fetch courier settings on mount <---
	useEffect(() => {
		async function fetchCourierSettings() {
			const { data, error } = await supabase
				.from("courier_fee")
				.select("*")
				.eq("id", 1)
				.single();

			if (data && !error) {
				setCourierSettings(data);
			}
		}
		fetchCourierSettings();
	}, []);

	// ---> UPDATED: Dynamically calculate shipping based on Database Settings <---
	const shippingFee =
		formData.district === "Dhaka"
			? Number(courierSettings?.inside_dhaka || 60)
			: formData.district
				? Number(courierSettings?.outside_dhaka || 120)
				: 0;

	const finalTotal = cartTotal + shippingFee;

	const availableThanas = getThanasForDistrict(formData.district);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
			...(name === "district" && { thana: "" }),
		}));
	};

	const generateDisplayId = () => {
		return "AXIO-" + Math.random().toString(36).substr(2, 6).toUpperCase();
	};

	const handleSubmitOrder = async (e) => {
		e.preventDefault();
		setErrorMsg("");
		setIsSubmitting(true);

		if (cart.length === 0) {
			setErrorMsg("Your bag is empty.");
			setIsSubmitting(false);
			return;
		}

		if (formData.paymentMethod === "bkash" && !formData.transactionId) {
			setErrorMsg("Please provide your bKash Transaction ID.");
			setIsSubmitting(false);
			return;
		}

		try {
			const displayId = generateDisplayId();
			const fullAddress = `${formData.address}, ${formData.thana}, ${formData.district} - ${formData.postalCode}`;
			const fullName = `${formData.firstName} ${formData.lastName}`.trim();

			const formattedCartItems = cart.map((item) => ({
				product_id: item.product_id,
				variant_id: item.variant_id || null,
				quantity: item.quantity,
				price: item.price,
			}));

			const { error } = await supabase.rpc("process_checkout", {
				p_display_id: displayId,
				p_name: fullName,
				p_email: formData.email,
				p_phone: formData.phone,
				p_address: fullAddress,
				p_total: finalTotal,
				p_tx_id: formData.transactionId || null,
				p_cart_items: formattedCartItems,
			});

			if (error) {
				if (error.message.includes("Out of stock")) {
					throw new Error(
						"An item in your cart sold out while you were checking out!",
					);
				}
				throw error;
			}

			clearCart();
			setSuccessId(displayId);
		} catch (err) {
			console.error("Checkout Error:", err);
			setErrorMsg(err.message || "Failed to process order. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (successId) {
		return (
			<div style={styles.successWrapper}>
				<div style={styles.successCard}>
					<div style={styles.checkCircle}>✓</div>
					<h2 style={styles.successTitle}>Order Confirmed</h2>
					<p style={styles.successText}>
						Thank you! Your order has been securely received.
					</p>

					<div style={styles.idBox}>
						<span style={styles.idLabel}>TRACKING ID</span>
						<h3 style={styles.idValue}>{successId}</h3>
					</div>

					<p style={styles.successNote}>
						Save this ID to check your shipping status.
					</p>

					<div style={styles.successActions}>
						<Link to="/track-order" style={styles.primaryBtn}>
							Track Order
						</Link>
						<Link to="/shop" style={styles.outlineBtn}>
							Continue Shopping
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div style={styles.pageWrapper}>
			<div className="checkout-layout">
				<div style={styles.formSection}>
					<h1 style={styles.pageTitle}>Checkout</h1>

					{errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

					<form onSubmit={handleSubmitOrder} id="checkout-form">
						<div style={styles.card}>
							<h3 style={styles.cardTitle}>Contact Information</h3>
							<div className="grid2">
								<div style={styles.inputGroup}>
									<label style={styles.label}>Email Address</label>
									<input
										required
										type="email"
										name="email"
										value={formData.email}
										onChange={handleInputChange}
										style={styles.input}
										placeholder="nazmus@example.com"
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
										placeholder="+880 1..."
									/>
								</div>
							</div>
						</div>

						<div style={styles.card}>
							<h3 style={styles.cardTitle}>Shipping Address</h3>
							<div className="grid2">
								<div style={styles.inputGroup}>
									<label style={styles.label}>First Name</label>
									<input
										required
										type="text"
										name="firstName"
										value={formData.firstName}
										onChange={handleInputChange}
										style={styles.input}
										placeholder="Nazmus"
									/>
								</div>
								<div style={styles.inputGroup}>
									<label style={styles.label}>Last Name</label>
									<input
										required
										type="text"
										name="lastName"
										value={formData.lastName}
										onChange={handleInputChange}
										style={styles.input}
										placeholder="Shakib"
									/>
								</div>
							</div>

							<div style={styles.inputGroup}>
								<label style={styles.label}>Street Address / Apartment</label>
								<input
									required
									type="text"
									name="address"
									value={formData.address}
									onChange={handleInputChange}
									style={styles.input}
									placeholder="House 12, Road 5..."
								/>
							</div>

							<div className="grid3">
								<div style={styles.inputGroup}>
									<label style={styles.label}>District</label>
									<select
										required
										name="district"
										value={formData.district}
										onChange={handleInputChange}
										style={styles.select}
									>
										<option value="" disabled>
											Select District
										</option>
										{bdDistricts.map((d) => (
											<option key={d} value={d}>
												{d}
											</option>
										))}
									</select>
								</div>
								<div style={styles.inputGroup}>
									<label style={styles.label}>Thana / Upazila</label>
									<select
										required
										name="thana"
										value={formData.thana}
										onChange={handleInputChange}
										style={styles.select}
										disabled={!formData.district}
									>
										<option value="" disabled>
											Select Thana
										</option>
										{availableThanas.map((t) => (
											<option key={t} value={t}>
												{t}
											</option>
										))}
									</select>
								</div>
								<div style={styles.inputGroup}>
									<label style={styles.label}>Postal Code</label>
									<input
										required
										type="text"
										name="postalCode"
										value={formData.postalCode}
										onChange={handleInputChange}
										style={styles.input}
										placeholder="1212"
									/>
								</div>
							</div>
						</div>

						<div style={styles.card}>
							<h3 style={styles.cardTitle}>Payment</h3>

							<div style={styles.radioGroup}>
								<label
									style={{
										...styles.radioLabel,
										borderColor:
											formData.paymentMethod === "cod"
												? "var(--ink)"
												: "var(--border)",
									}}
								>
									<input
										type="radio"
										name="paymentMethod"
										value="cod"
										checked={formData.paymentMethod === "cod"}
										onChange={handleInputChange}
										style={styles.radioInput}
									/>
									<span style={styles.radioText}>Cash on Delivery (COD)</span>
								</label>

								<label
									style={{
										...styles.radioLabel,
										borderColor:
											formData.paymentMethod === "bkash"
												? "var(--ink)"
												: "var(--border)",
									}}
								>
									<input
										type="radio"
										name="paymentMethod"
										value="bkash"
										checked={formData.paymentMethod === "bkash"}
										onChange={handleInputChange}
										style={styles.radioInput}
									/>
									<span style={styles.radioText}>bKash / Nagad Manual</span>
								</label>
							</div>

							{formData.paymentMethod === "bkash" && (
								<div style={styles.bkashBox}>
									{/* ---> UPDATED: Database bKash Number <--- */}
									<p style={styles.bkashText}>
										Please Send Money to{" "}
										<strong>
											{courierSettings?.bkash_number || "our number"}
										</strong>{" "}
										and enter your Transaction ID below to verify your payment.
									</p>
									<input
										type="text"
										name="transactionId"
										value={formData.transactionId}
										onChange={handleInputChange}
										style={{
											...styles.input,
											fontFamily: "var(--font-mono)",
											textTransform: "uppercase",
										}}
										placeholder="e.g. 9B2C8X9Y"
									/>
								</div>
							)}
						</div>

						<div className="mobile-submit">
							<button
								type="submit"
								disabled={isSubmitting || cart.length === 0}
								style={styles.submitBtn}
							>
								{isSubmitting
									? "Processing..."
									: `Pay ৳${finalTotal.toFixed(2)}`}
							</button>
						</div>
					</form>
				</div>

				<div style={styles.summarySection}>
					<div style={styles.summaryBox}>
						<h3 style={styles.summaryTitle}>Order Summary</h3>

						<div style={styles.cartItems}>
							{cart.map((item, idx) => (
								<div key={idx} style={styles.itemRow}>
									<div style={styles.itemDetails}>
										<div style={styles.itemName}>{item.name}</div>
										<div style={styles.itemMeta}>
											{item.variant_name && <span>{item.variant_name}</span>}
											<span>Qty: {item.quantity}</span>
										</div>
									</div>
									<div style={styles.itemPrice}>
										৳{(item.price * item.quantity).toFixed(2)}
									</div>
								</div>
							))}
							{cart.length === 0 && (
								<div style={styles.emptyCart}>Your bag is empty.</div>
							)}
						</div>

						<div style={styles.totalsBlock}>
							<div style={styles.totalRow}>
								<span style={styles.totalLabel}>Subtotal</span>
								<span style={styles.totalValue}>৳{cartTotal.toFixed(2)}</span>
							</div>
							<div style={styles.totalRow}>
								<span style={styles.totalLabel}>Shipping</span>
								<span style={styles.totalValue}>
									{formData.district === ""
										? "Select district"
										: `৳${shippingFee.toFixed(2)}`}
								</span>
							</div>
							<div style={{ ...styles.totalRow, ...styles.finalTotalRow }}>
								<span style={styles.finalTotalLabel}>Total</span>
								<span style={styles.finalTotalValue}>
									৳{finalTotal.toFixed(2)}
								</span>
							</div>
						</div>

						<div className="desktop-submit">
							<button
								form="checkout-form"
								type="submit"
								disabled={isSubmitting || cart.length === 0}
								style={styles.submitBtn}
							>
								{isSubmitting ? "Processing..." : `Complete Order`}
							</button>
						</div>
					</div>
				</div>
			</div>

			<style>{`
				.checkout-layout { display: grid; grid-template-columns: 1fr 400px; gap: 40px; align-items: start; }
				.desktop-submit { display: block; margin-top: 24px; }
				.mobile-submit { display: none; margin-top: 24px; }
				.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
				.grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 16px; }
				@media (max-width: 900px) {
					.checkout-layout { grid-template-columns: 1fr; }
					.summarySection { grid-row: 1; }
					.desktop-submit { display: none; }
					.mobile-submit { display: block; }
				}
				@media (max-width: 600px) {
					.grid2 { grid-template-columns: 1fr; }
					.grid3 { grid-template-columns: 1fr 1fr; }
				}
				@media (max-width: 400px) {
					.grid3 { grid-template-columns: 1fr; }
				}
			`}</style>
		</div>
	);
}

const styles = {
	pageWrapper: {
		maxWidth: "1200px",
		margin: "0 auto",
		padding: "clamp(16px, 4vw, 40px) clamp(12px, 4vw, 24px)",
		minHeight: "80vh",
	},
	pageTitle: {
		fontFamily: "var(--font-serif)",
		fontSize: "32px",
		color: "var(--ink)",
		margin: "0 0 32px 0",
	},
	formSection: { display: "flex", flexDirection: "column", gap: "24px" },
	card: {
		background: "white",
		padding: "clamp(16px, 4vw, 32px)",
		borderRadius: "12px",
		border: "1px solid var(--border)",
	},
	cardTitle: {
		fontFamily: "var(--font-sans)",
		fontSize: "18px",
		fontWeight: 600,
		color: "var(--ink)",
		margin: "0 0 24px 0",
		borderBottom: "1px solid var(--border)",
		paddingBottom: "12px",
	},

	inputGroup: {
		display: "flex",
		flexDirection: "column",
		gap: "8px",
		marginBottom: "16px",
	},
	label: {
		fontFamily: "var(--font-sans)",
		fontSize: "13px",
		fontWeight: 600,
		color: "var(--stone)",
	},
	input: {
		padding: "12px 16px",
		borderRadius: "8px",
		border: "1px solid var(--border)",
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		outline: "none",
		transition: "border 0.2s",
		backgroundColor: "#fff",
	},
	select: {
		padding: "12px 16px",
		borderRadius: "8px",
		border: "1px solid var(--border)",
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		outline: "none",
		backgroundColor: "#fff",
		cursor: "pointer",
		appearance: "none",
	},
	radioGroup: { display: "flex", flexDirection: "column", gap: "12px" },
	radioLabel: {
		display: "flex",
		alignItems: "center",
		padding: "16px",
		border: "1px solid",
		borderRadius: "8px",
		cursor: "pointer",
		transition: "all 0.2s",
	},
	radioInput: {
		marginRight: "12px",
		width: "18px",
		height: "18px",
		accentColor: "var(--ink)",
	},
	radioText: {
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		fontWeight: 500,
		color: "var(--ink)",
	},
	bkashBox: {
		marginTop: "16px",
		padding: "20px",
		background: "#f8fafc",
		borderRadius: "8px",
		border: "1px dashed var(--border)",
	},
	bkashText: {
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		color: "var(--stone)",
		marginBottom: "12px",
		lineHeight: 1.5,
	},
	errorBox: {
		padding: "16px",
		background: "#fef2f2",
		color: "#b91c1c",
		border: "1px solid #fca5a5",
		borderRadius: "8px",
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		fontWeight: 500,
		marginBottom: "24px",
	},
	summarySection: { position: "sticky", top: "24px" },
	summaryBox: {
		background: "#fafafa",
		padding: "clamp(16px, 4vw, 32px)",
		borderRadius: "12px",
		border: "1px solid var(--border)",
	},
	summaryTitle: {
		fontFamily: "var(--font-sans)",
		fontSize: "18px",
		fontWeight: 600,
		color: "var(--ink)",
		margin: "0 0 24px 0",
	},
	cartItems: {
		display: "flex",
		flexDirection: "column",
		gap: "16px",
		marginBottom: "24px",
		maxHeight: "400px",
		overflowY: "auto",
	},
	itemRow: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "flex-start",
		paddingBottom: "16px",
		borderBottom: "1px solid var(--border)",
	},
	itemDetails: { display: "flex", flexDirection: "column", gap: "4px" },
	itemName: {
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		fontWeight: 600,
		color: "var(--ink)",
	},
	itemMeta: {
		display: "flex",
		gap: "12px",
		fontFamily: "var(--font-sans)",
		fontSize: "13px",
		color: "var(--stone)",
	},
	itemPrice: {
		fontFamily: "var(--font-mono)",
		fontSize: "15px",
		fontWeight: 600,
		color: "var(--ink)",
	},
	emptyCart: {
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		color: "var(--stone)",
		textAlign: "center",
		padding: "24px 0",
	},
	totalsBlock: { display: "flex", flexDirection: "column", gap: "12px" },
	totalRow: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
	},
	totalLabel: {
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		color: "var(--stone)",
	},
	totalValue: {
		fontFamily: "var(--font-mono)",
		fontSize: "15px",
		color: "var(--ink)",
		fontWeight: 500,
	},
	finalTotalRow: {
		marginTop: "12px",
		paddingTop: "16px",
		borderTop: "2px solid var(--border)",
	},
	finalTotalLabel: {
		fontFamily: "var(--font-sans)",
		fontSize: "16px",
		fontWeight: 700,
		color: "var(--ink)",
	},
	finalTotalValue: {
		fontFamily: "var(--font-mono)",
		fontSize: "20px",
		fontWeight: 700,
		color: "var(--ink)",
	},
	submitBtn: {
		width: "100%",
		padding: "16px",
		background: "var(--ink)",
		color: "white",
		border: "none",
		borderRadius: "8px",
		fontFamily: "var(--font-sans)",
		fontSize: "16px",
		fontWeight: 600,
		cursor: "pointer",
		transition: "opacity 0.2s",
	},
	successWrapper: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		minHeight: "70vh",
		padding: "24px",
	},
	successCard: {
		background: "white",
		padding: "clamp(24px, 6vw, 48px)",
		borderRadius: "12px",
		border: "1px solid var(--border)",
		textAlign: "center",
		maxWidth: "500px",
		width: "100%",
		boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
	},
	checkCircle: {
		width: "64px",
		height: "64px",
		borderRadius: "50%",
		background: "var(--green)",
		color: "white",
		fontSize: "32px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		margin: "0 auto 24px auto",
	},
	successTitle: {
		fontFamily: "var(--font-serif)",
		fontSize: "28px",
		margin: "0 0 8px 0",
		color: "var(--ink)",
	},
	successText: {
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		color: "var(--stone)",
		margin: "0 0 32px 0",
	},
	idBox: {
		background: "#f8fafc",
		border: "1px dashed var(--border)",
		padding: "20px",
		borderRadius: "8px",
		marginBottom: "16px",
	},
	idLabel: {
		display: "block",
		fontFamily: "var(--font-sans)",
		fontSize: "12px",
		fontWeight: 600,
		color: "var(--stone)",
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		marginBottom: "8px",
	},
	idValue: {
		margin: 0,
		fontFamily: "var(--font-mono)",
		fontSize: "24px",
		color: "var(--ink)",
		fontWeight: 700,
	},
	successNote: {
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		color: "var(--stone)",
		marginBottom: "32px",
	},
	successActions: { display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" },
	primaryBtn: {
		padding: "12px 24px",
		background: "var(--ink)",
		color: "white",
		textDecoration: "none",
		borderRadius: "8px",
		fontFamily: "var(--font-sans)",
		fontWeight: 600,
	},
	outlineBtn: {
		padding: "12px 24px",
		background: "white",
		color: "var(--ink)",
		border: "1px solid var(--border)",
		textDecoration: "none",
		borderRadius: "8px",
		fontFamily: "var(--font-sans)",
		fontWeight: 600,
	},
};
