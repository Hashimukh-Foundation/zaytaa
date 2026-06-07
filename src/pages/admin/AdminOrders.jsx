import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { Link } from "react-router-dom";

export default function AdminOrders() {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [expandedOrderId, setExpandedOrderId] = useState(null);

	// Fetch all orders on load
	useEffect(() => {
		fetchOrders();
	}, []);

	async function fetchOrders() {
		setLoading(true);
		const { data, error } = await supabase
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
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching orders:", error);
		} else {
			setOrders(data);
		}
		setLoading(false);
	}

	// Instantly update the status in the database and local state
	const handleStatusChange = async (orderId, newStatus) => {
		const { error } = await supabase
			.from("orders")
			.update({ status: newStatus })
			.eq("id", orderId);

		if (error) {
			alert("Failed to update status.");
			console.error(error);
		} else {
			setOrders((prevOrders) =>
				prevOrders.map((order) =>
					order.id === orderId ? { ...order, status: newStatus } : order,
				),
			);
		}
	};

	const toggleExpand = (orderId) => {
		setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
	};

	const getStatusColor = (status) => {
		switch (status?.toLowerCase()) {
			case "confirmed":
				return "#0056b3"; // Blue
			case "shipped":
				return "var(--green)"; // Green
			case "cancelled":
				return "#c94040"; // Red
			default:
				return "#f59e0b"; // Pending (Orange)
		}
	};

	return (
		<div style={styles.pageWrapper}>
			<div style={styles.header}>
				<h1 style={styles.title}>Order Management</h1>
				<p style={styles.subtitle}>
					Review transactions and update shipping statuses.
				</p>
			</div>

			{loading ? (
				<div style={styles.emptyState}>[ LOADING ORDERS... ]</div>
			) : orders.length === 0 ? (
				<div style={styles.emptyState}>No orders have been placed yet.</div>
			) : (
				<div style={styles.tableContainer}>
					<table style={styles.table}>
						<thead>
							<tr>
								<th style={styles.th}>Tracking ID</th>
								<th style={styles.th}>Date</th>
								<th style={styles.th}>Customer</th>
								<th style={styles.th}>Total</th>
								<th style={styles.th}>Status</th>
								<th style={styles.th}>Actions</th>
							</tr>
						</thead>
						<tbody>
							{orders.map((order) => (
								<React.Fragment key={order.id}>
									{/* MAIN ROW */}
									<tr style={styles.tr}>
										<td style={styles.td}>
											<span style={styles.monoText}>{order.display_id}</span>
										</td>
										<td style={styles.td}>
											{new Date(order.created_at).toLocaleDateString()}
										</td>
										<td style={styles.td}>
											<strong>{order.customer_name}</strong>
											<br />
											<span style={{ fontSize: "12px", color: "var(--stone)" }}>
												{order.customer_phone}
											</span>
										</td>
										<td style={styles.td}>
											<span style={styles.monoText}>
												৳{order.total_amount.toFixed(2)}
											</span>
										</td>
										<td style={styles.td}>
											<select
												value={order.status}
												onChange={(e) =>
													handleStatusChange(order.id, e.target.value)
												}
												style={{
													...styles.statusSelect,
													borderColor: getStatusColor(order.status),
													color: getStatusColor(order.status),
												}}
											>
												<option value="Pending">Pending</option>
												<option value="Confirmed">Confirmed</option>
												<option value="Shipped">Shipped</option>
												<option value="Cancelled">Cancelled</option>
											</select>
										</td>
										<td style={styles.td}>
											<button
												onClick={() => toggleExpand(order.id)}
												style={styles.expandBtn}
											>
												{expandedOrderId === order.id
													? "Close Details"
													: "View Details"}
											</button>
										</td>
									</tr>

									{/* EXPANDED DETAILS ROW */}
									{expandedOrderId === order.id && (
										<tr>
											<td colSpan="6" style={styles.expandedCell}>
												<div style={styles.expandedContent}>
													{/* Payment & Shipping Info */}
													<div style={styles.infoGrid}>
														<div style={styles.infoBlock}>
															<span style={styles.label}>
																TRANSACTION ID (bKash/Nagad)
															</span>
															<div style={styles.highlightBox}>
																{order.transaction_id ? (
																	<span
																		style={{
																			fontFamily: "var(--font-mono)",
																			fontSize: "16px",
																			color: "var(--ink)",
																			fontWeight: 700,
																		}}
																	>
																		{order.transaction_id}
																	</span>
																) : (
																	<span style={{ color: "#c94040" }}>
																		Cash on Delivery / No ID provided
																	</span>
																)}
															</div>
														</div>
														<div style={styles.infoBlock}>
															<span style={styles.label}>SHIPPING ADDRESS</span>
															<div
																style={{ color: "var(--ink)", lineHeight: 1.5 }}
															>
																{order.shipping_address}
																<br />
																<strong>Email:</strong> {order.customer_email}
															</div>
														</div>
													</div>

													{/* Items List */}
													<div style={{ marginTop: "24px" }}>
														<span style={styles.label}>ITEMS TO FULFILL</span>
														<div style={styles.itemsList}>
															{order.order_items.map((item, idx) => (
																<div key={idx} style={styles.itemRow}>
																	<div>
																		<strong>
																			{item.products?.name || "Unknown Product"}
																		</strong>
																		{item.product_variants && (
																			<span
																				style={{
																					color: "var(--stone)",
																					marginLeft: "8px",
																					fontSize: "13px",
																				}}
																			>
																				(Size: {item.product_variants.name})
																			</span>
																		)}
																	</div>
																	<div style={styles.monoText}>
																		{item.quantity} x ৳
																		{item.price_at_purchase.toFixed(2)}
																	</div>
																</div>
															))}
														</div>
													</div>
												</div>
											</td>
										</tr>
									)}
								</React.Fragment>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

// Ensure you import React at the top if you aren't already to use React.Fragment
import React from "react";

const styles = {
	pageWrapper: {
		padding: "40px 24px",
		maxWidth: "1200px",
		margin: "0 auto",
		minHeight: "80vh",
	},
	header: { marginBottom: "32px" },
	title: {
		fontFamily: "var(--font-serif)",
		fontSize: "32px",
		color: "var(--ink)",
		margin: "0 0 8px 0",
	},
	subtitle: {
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		color: "var(--stone)",
		margin: 0,
	},

	tableContainer: {
		background: "var(--white)",
		border: "1px solid var(--border)",
		borderRadius: "12px",
		overflow: "hidden",
	},
	table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
	th: {
		padding: "16px",
		background: "#fcfbf8",
		borderBottom: "1px solid var(--border)",
		fontFamily: "var(--font-sans)",
		fontSize: "12px",
		fontWeight: 600,
		color: "var(--stone)",
		textTransform: "uppercase",
		letterSpacing: "0.05em",
	},
	tr: {
		borderBottom: "1px solid var(--border)",
		transition: "background 0.2s",
	},
	td: {
		padding: "16px",
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		color: "var(--ink)",
		verticalAlign: "middle",
	},

	monoText: {
		fontFamily: "var(--font-mono)",
		fontSize: "14px",
		fontWeight: 600,
	},

	statusSelect: {
		padding: "6px 12px",
		borderRadius: "6px",
		fontFamily: "var(--font-sans)",
		fontSize: "13px",
		fontWeight: 600,
		border: "1px solid",
		outline: "none",
		cursor: "pointer",
		background: "transparent",
	},
	expandBtn: {
		background: "transparent",
		border: "1px solid var(--border)",
		padding: "8px 12px",
		borderRadius: "6px",
		fontFamily: "var(--font-sans)",
		fontSize: "12px",
		fontWeight: 600,
		color: "var(--ink)",
		cursor: "pointer",
		transition: "all 0.2s",
	},

	expandedCell: {
		padding: 0,
		background: "#fafafa",
		borderBottom: "2px solid var(--border)",
	},
	expandedContent: { padding: "32px", borderLeft: "4px solid var(--ink)" },

	infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" },
	infoBlock: { display: "flex", flexDirection: "column", gap: "8px" },
	label: {
		fontFamily: "var(--font-mono)",
		fontSize: "11px",
		color: "var(--stone)",
		fontWeight: 600,
		textTransform: "uppercase",
		letterSpacing: "0.1em",
	},

	highlightBox: {
		background: "#fff",
		border: "1px dashed var(--border)",
		padding: "16px",
		borderRadius: "8px",
		display: "inline-block",
	},

	itemsList: {
		display: "flex",
		flexDirection: "column",
		gap: "12px",
		marginTop: "12px",
		background: "white",
		border: "1px solid var(--border)",
		borderRadius: "8px",
		padding: "16px",
	},
	itemRow: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		paddingBottom: "12px",
		borderBottom: "1px solid #f4f3f0",
	},

	emptyState: {
		padding: "60px",
		textAlign: "center",
		fontFamily: "var(--font-mono)",
		color: "var(--stone)",
		background: "#fcfbf8",
		borderRadius: "12px",
		border: "1px solid var(--border)",
	},
};
