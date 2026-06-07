import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

export default function TrackOrder() {
	const [trackingId, setTrackingId] = useState("");
	const [orderData, setOrderData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	const handleTrackOrder = async (e) => {
		e.preventDefault();
		setErrorMsg("");
		setOrderData(null);

		if (!trackingId.trim()) return;

		setLoading(true);

		try {
			// 1. Fetch the order by its display_id
			const { data: order, error: orderError } = await supabase
				.from("orders")
				.select(
					`
                    *,
                    order_items (
                        quantity,
                        price_at_purchase,
                        products ( name ),
                        product_variants ( name )
                    )
                `,
				)
				.eq("display_id", trackingId.trim().toUpperCase())
				.maybeSingle();

			if (orderError) throw orderError;

			if (!order) {
				setErrorMsg(
					"We couldn't find an order with that tracking ID. Please check it and try again.",
				);
			} else {
				setOrderData(order);
			}
		} catch (err) {
			console.error("Tracking error:", err);
			setErrorMsg("An error occurred while looking up your order.");
		} finally {
			setLoading(false);
		}
	};

	// Helper to color-code the status
	const getStatusColor = (status) => {
		switch (status?.toLowerCase()) {
			case "confirmed":
				return "var(--green)";
			case "shipped":
				return "#0056b3"; // Blue
			case "cancelled":
				return "#c94040"; // Red
			default:
				return "#f59e0b"; // Pending (Orange/Yellow)
		}
	};

	return (
		<div style={styles.pageWrapper}>
			<div style={styles.header}>
				<h1 style={styles.title}>Track Your Order</h1>
				<p style={styles.bodyText}>
					Enter your tracking ID below to check the current status of your
					shipment.
				</p>
			</div>

			<div style={styles.searchBox}>
				<form onSubmit={handleTrackOrder} style={styles.form}>
					<input
						type="text"
						placeholder="e.g. AXIO-9A8B7C"
						value={trackingId}
						onChange={(e) => setTrackingId(e.target.value)}
						style={styles.input}
						required
					/>
					<button type="submit" disabled={loading} style={styles.searchBtn}>
						{loading ? "Searching..." : "Track"}
					</button>
				</form>
				{errorMsg && <div style={styles.error}>{errorMsg}</div>}
			</div>

			{orderData && (
				<div style={styles.resultCard}>
					<div style={styles.resultHeader}>
						<div>
							<span style={styles.label}>ORDER ID</span>
							<div style={styles.monoText}>{orderData.display_id}</div>
						</div>
						<div style={{ textAlign: "right" }}>
							<span style={styles.label}>STATUS</span>
							<div
								style={{
									...styles.statusBadge,
									backgroundColor: getStatusColor(orderData.status),
								}}
							>
								{orderData.status.toUpperCase()}
							</div>
						</div>
					</div>

					<div style={styles.detailsGrid}>
						<div style={styles.detailBlock}>
							<span style={styles.label}>SHIPPING TO</span>
							<div style={styles.valueText}>{orderData.customer_name}</div>
							<div style={styles.valueText}>{orderData.shipping_address}</div>
						</div>

						<div style={styles.detailBlock}>
							<span style={styles.label}>ORDER DATE</span>
							<div style={styles.valueText}>
								{new Date(orderData.created_at).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</div>
						</div>
					</div>

					<div style={styles.itemsSection}>
						<span style={styles.label}>ITEMS ORDERED</span>
						<div style={styles.itemList}>
							{orderData.order_items.map((item, idx) => (
								<div key={idx} style={styles.itemRow}>
									<div>
										<div style={styles.itemName}>
											{item.products?.name || "Unknown Product"}
										</div>
										{item.product_variants && (
											<div style={styles.itemVariant}>
												Size: {item.product_variants.name}
											</div>
										)}
									</div>
									<div style={styles.itemPriceQty}>
										{item.quantity} x ৳{item.price_at_purchase.toFixed(2)}
									</div>
								</div>
							))}
						</div>
					</div>

					<div style={styles.totalRow}>
						<span>Total Paid</span>
						<strong>৳{orderData.total_amount.toFixed(2)}</strong>
					</div>
				</div>
			)}
		</div>
	);
}

const styles = {
	pageWrapper: {
		maxWidth: "800px",
		margin: "0 auto",
		padding: "60px 24px",
		minHeight: "70vh",
	},
	header: { textAlign: "center", marginBottom: "40px" },
	title: {
		fontFamily: "var(--font-serif)",
		fontSize: "36px",
		color: "var(--ink)",
		margin: "0 0 16px 0",
	},
	bodyText: {
		fontFamily: "var(--font-sans)",
		fontSize: "16px",
		color: "var(--stone)",
	},

	searchBox: {
		background: "#fcfbf8",
		border: "1px solid var(--border)",
		borderRadius: "12px",
		padding: "24px",
		marginBottom: "40px",
	},
	form: { display: "flex", gap: "12px" },
	input: {
		flex: 1,
		padding: "16px",
		border: "1px solid var(--border)",
		borderRadius: "8px",
		fontFamily: "var(--font-mono)",
		fontSize: "16px",
		textTransform: "uppercase",
		outline: "none",
		letterSpacing: "0.05em",
	},
	searchBtn: {
		padding: "0 32px",
		background: "var(--ink)",
		color: "white",
		border: "none",
		borderRadius: "8px",
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		fontWeight: 600,
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		cursor: "pointer",
	},
	error: {
		marginTop: "16px",
		color: "#c94040",
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		fontWeight: 500,
		textAlign: "center",
	},

	resultCard: {
		border: "1px solid var(--border)",
		borderRadius: "12px",
		background: "white",
		overflow: "hidden",
		animation: "popIn 0.3s ease-out",
	},
	resultHeader: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		background: "#f4f3f0",
		padding: "24px",
		borderBottom: "1px solid var(--border)",
	},
	label: {
		display: "block",
		fontFamily: "var(--font-mono)",
		fontSize: "11px",
		color: "var(--stone)",
		fontWeight: 600,
		textTransform: "uppercase",
		letterSpacing: "0.1em",
		marginBottom: "8px",
	},
	monoText: {
		fontFamily: "var(--font-mono)",
		fontSize: "20px",
		fontWeight: 700,
		color: "var(--ink)",
		letterSpacing: "0.05em",
	},
	statusBadge: {
		color: "white",
		padding: "6px 12px",
		borderRadius: "4px",
		fontFamily: "var(--font-mono)",
		fontSize: "13px",
		fontWeight: 600,
		letterSpacing: "0.05em",
	},

	detailsGrid: {
		display: "grid",
		gridTemplateColumns: "1fr 1fr",
		gap: "24px",
		padding: "32px 24px",
		borderBottom: "1px solid var(--border)",
	},
	valueText: {
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		color: "var(--ink)",
		lineHeight: 1.6,
	},

	itemsSection: { padding: "32px 24px" },
	itemList: {
		display: "flex",
		flexDirection: "column",
		gap: "16px",
		marginTop: "16px",
	},
	itemRow: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		paddingBottom: "16px",
		borderBottom: "1px dashed var(--border)",
	},
	itemName: {
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		fontWeight: 600,
		color: "var(--ink)",
	},
	itemVariant: {
		fontFamily: "var(--font-sans)",
		fontSize: "13px",
		color: "var(--stone)",
		marginTop: "4px",
	},
	itemPriceQty: {
		fontFamily: "var(--font-mono)",
		fontSize: "14px",
		color: "var(--ink)",
	},

	totalRow: {
		display: "flex",
		justifyContent: "space-between",
		padding: "24px",
		background: "#fafafa",
		borderTop: "1px solid var(--border)",
		fontFamily: "var(--font-mono)",
		fontSize: "18px",
		color: "var(--ink)",
	},
};
