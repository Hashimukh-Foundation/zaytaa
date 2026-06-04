import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

export default function AdminBrands() {
	const [brands, setBrands] = useState([]);
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	// ---> NEW: State to track if we are editing an existing brand
	const [editingId, setEditingId] = useState(null);

	const fetchBrands = async () => {
		setLoading(true);
		const { data, error } = await supabase
			.from("brands")
			.select("*")
			.order("name", { ascending: true });
		if (error) console.error("Error fetching brands:", error);
		else setBrands(data);
		setLoading(false);
	};

	useEffect(() => {
		fetchBrands();
	}, []);

	// ---> NEW: Load the brand into the input field when clicked
	const handleEdit = (brand) => {
		setEditingId(brand.id);
		setName(brand.name);
		window.scrollTo(0, 0); // Scroll to top so they see the input
	};

	// ---> NEW: Cancel an edit and clear the form
	const cancelEdit = () => {
		setEditingId(null);
		setName("");
	};

	const handleSave = async (e) => {
		e.preventDefault();
		if (!name.trim()) return;
		setSaving(true);

		const slug = name
			.toLowerCase()
			.trim()
			.replace(/[\s\W-]+/g, "-");

		// ---> UPDATED: Check if we are updating or creating
		if (editingId) {
			const { error } = await supabase
				.from("brands")
				.update({ name, slug })
				.eq("id", editingId);
			if (error) {
				alert("Error updating brand: " + error.message);
			} else {
				cancelEdit();
				fetchBrands();
			}
		} else {
			const { error } = await supabase.from("brands").insert([{ name, slug }]);
			if (error) {
				alert("Error adding brand: " + error.message);
			} else {
				setName("");
				fetchBrands();
			}
		}

		setSaving(false);
	};

	const handleDelete = async (id, brandName) => {
		if (
			!window.confirm(
				`Delete the brand "${brandName}"? This might remove it from products that use it.`,
			)
		)
			return;

		const { error } = await supabase.from("brands").delete().eq("id", id);
		if (error) alert("Error deleting brand: " + error.message);
		else fetchBrands();
	};

	return (
		<div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
			<div style={styles.header}>
				<h2 style={styles.title}>Brand Management</h2>
			</div>

			<form onSubmit={handleSave} style={styles.formCard}>
				<div style={styles.inputGroup}>
					<label style={styles.label}>
						{editingId ? "Edit Brand" : "Add New Brand"}
					</label>
					<div style={{ display: "flex", gap: "12px" }}>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							style={{ ...styles.input, flex: 1 }}
							placeholder="Zaytaa Original"
							required
						/>
						<button type="submit" style={styles.btnPrimary} disabled={saving}>
							{saving ? "Saving..." : editingId ? "Update Brand" : "Save Brand"}
						</button>

						{/* Show a Cancel button if we are currently editing */}
						{editingId && (
							<button
								type="button"
								onClick={cancelEdit}
								style={styles.btnSecondary}
							>
								Cancel
							</button>
						)}
					</div>
				</div>
			</form>

			<div style={styles.tableContainer}>
				{loading ? (
					<p style={{ padding: "24px" }}>Loading brands...</p>
				) : brands.length === 0 ? (
					<p style={{ padding: "24px", color: "var(--stone)" }}>
						No brands found.
					</p>
				) : (
					<table style={styles.table}>
						<thead>
							<tr>
								<th style={styles.th}>Brand Name</th>
								<th style={styles.th}>Slug</th>
								<th
									style={{
										...styles.th,
										textAlign: "right",
										paddingRight: "24px",
									}}
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{brands.map((b) => (
								<tr key={b.id} style={styles.tr}>
									<td
										style={{
											...styles.td,
											fontWeight: 600,
											color: "var(--ink)",
										}}
									>
										{b.name}
									</td>
									<td
										style={{
											...styles.td,
											color: "var(--stone)",
											fontFamily: "var(--font-mono)",
											fontSize: "13px",
										}}
									>
										{b.slug}
									</td>
									<td style={{ ...styles.td, textAlign: "right" }}>
										{/* ---> NEW: Edit Button */}
										<button
											onClick={() => handleEdit(b)}
											style={styles.editBtn}
										>
											Edit
										</button>
										<button
											onClick={() => handleDelete(b.id, b.name)}
											style={styles.deleteBtn}
										>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}

const styles = {
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: "32px",
	},
	title: {
		fontFamily: "var(--font-serif)",
		fontSize: "28px",
		color: "var(--ink)",
		margin: 0,
	},
	btnPrimary: {
		background: "var(--ink)",
		color: "#fff",
		padding: "10px 20px",
		borderRadius: "8px",
		border: "none",
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		cursor: "pointer",
		whiteSpace: "nowrap",
	},
	btnSecondary: {
		background: "transparent",
		color: "var(--ink)",
		padding: "10px 20px",
		borderRadius: "8px",
		border: "1px solid var(--border)",
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		cursor: "pointer",
		whiteSpace: "nowrap",
	},
	formCard: {
		background: "#fff",
		border: "1px solid var(--border)",
		borderRadius: "12px",
		padding: "24px",
		marginBottom: "32px",
	},
	inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
	label: { fontSize: "14px", fontWeight: 500, color: "var(--ink)" },
	input: {
		padding: "12px 16px",
		border: "1px solid var(--border)",
		borderRadius: "8px",
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		outline: "none",
	},
	tableContainer: {
		background: "#fff",
		border: "1px solid var(--border)",
		borderRadius: "12px",
		overflow: "hidden",
	},
	table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
	th: {
		padding: "16px 24px",
		borderBottom: "1px solid var(--border)",
		background: "#fcfbf8",
		color: "var(--stone)",
		fontWeight: 500,
		fontSize: "13px",
		textTransform: "uppercase",
		letterSpacing: "0.05em",
	},
	tr: { borderBottom: "1px solid var(--border)" },
	td: { padding: "16px 24px", fontSize: "15px", verticalAlign: "middle" },
	editBtn: {
		color: "var(--ink)",
		background: "transparent",
		border: "none",
		cursor: "pointer",
		fontSize: "14px",
		textDecoration: "underline",
		marginRight: "16px",
	},
	deleteBtn: {
		color: "#d9534f",
		background: "transparent",
		border: "none",
		cursor: "pointer",
		fontSize: "14px",
		textDecoration: "underline",
	},
};
