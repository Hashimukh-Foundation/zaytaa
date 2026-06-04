import { useEffect, useEffectEvent, useState } from "react";
import { supabase } from "../../supabaseClient";
import ImageUpload from "../../components/MultiImageUpload";

export default function AdminCategories() {
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isAdding, setIsAdding] = useState(false);

	// form
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [saving, setSaving] = useState(false);

	const fetchCategories = async () => {
		setLoading(true);
		const { data, error } = await supabase
			.from("categories")
			.select("*")
			.order("sort_order", { ascending: true });

		if (error) {
			console.error("error fetching categories: ", error.message);
		} else {
			setCategories(data);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	// add new category to supabase

	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);

		const slug = name
			.toLowerCase()
			.trim()
			.replace(/[\s\W-]+/g, "-");

		const { error } = await supabase.from("categories").insert([
			{
				name,
				slug,
				description,
				image_url: imageUrl,
			},
		]);
		setSaving(false);

		if (error) {
			alert("error saving category: " + error.message);
		} else {
			setName("");
			setDescription("");
			setImageUrl("");
			setIsAdding(false);
			fetchCategories();
		}
	};

	const handleDelete = async (id, categoryName) => {
		if (!window.confirm(`Are you sure want to delete ${categoryName} ?`)) {
			return;
		}

		const { error } = await supabase.from("categories").delete().eq("id", id);

		if (error) {
			alert("error deleting category: " + error.message);
		} else {
			fetchCategories(); //this refreshes the list
		}
	};
	// --- RENDER FORM VIEW ---
	if (isAdding) {
		return (
			<div>
				<div style={styles.header}>
					<h2 style={styles.title}>Add New Category</h2>
					<button
						onClick={() => setIsAdding(false)}
						style={styles.btnSecondary}
					>
						Cancel
					</button>
				</div>

				<form onSubmit={handleSave} style={styles.formCard}>
					<div style={styles.inputGroup}>
						<label style={styles.label}>Category Name</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							style={styles.input}
							required
							placeholder="e.g. Serums"
						/>
					</div>

					<div style={styles.inputGroup}>
						<label style={styles.label}>Description (Optional)</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							style={{ ...styles.input, minHeight: "100px" }}
							placeholder="A short description for the shop page..."
						/>
					</div>

					<div style={styles.inputGroup}>
						<label style={styles.label}>Category Image</label>
						{/* Reusing our awesome ImageUpload component! */}
						<ImageUpload onUploadComplete={(url) => setImageUrl(url)} />
					</div>

					<button type="submit" style={styles.btnPrimary} disabled={saving}>
						{saving ? "Saving..." : "Save Category"}
					</button>
				</form>
			</div>
		);
	}

	// --- RENDER TABLE VIEW ---
	return (
		<div>
			<div style={styles.header}>
				<h2 style={styles.title}>Category Management</h2>
				<button onClick={() => setIsAdding(true)} style={styles.btnPrimary}>
					+ Add Category
				</button>
			</div>

			<div style={styles.tableContainer}>
				{loading ? (
					<p style={{ padding: "24px" }}>Loading categories...</p>
				) : categories.length === 0 ? (
					<p style={{ padding: "24px", color: "var(--stone)" }}>
						No categories found.
					</p>
				) : (
					<table style={styles.table}>
						<thead>
							<tr>
								<th style={styles.th}>Image</th>
								<th style={styles.th}>Name</th>
								<th style={styles.th}>Slug</th>
								<th style={styles.th}>Actions</th>
							</tr>
						</thead>
						<tbody>
							{categories.map((cat) => (
								<tr key={cat.id} style={styles.tr}>
									<td style={styles.td}>
										{cat.image_url ? (
											<img
												src={cat.image_url}
												alt={cat.name}
												style={styles.thumbnail}
											/>
										) : (
											<div style={styles.placeholderThumb}>No Image</div>
										)}
									</td>
									<td style={{ ...styles.td, fontWeight: 500 }}>{cat.name}</td>
									<td style={{ ...styles.td, color: "var(--stone)" }}>
										/{cat.slug}
									</td>
									<td style={styles.td}>
										<button
											onClick={() => handleDelete(cat.id, cat.name)}
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
	},
	tableContainer: {
		background: "#fff",
		border: "1px solid var(--border)",
		borderRadius: "12px",
		overflow: "hidden",
	},
	table: {
		width: "100%",
		borderCollapse: "collapse",
		textAlign: "left",
	},
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
	tr: {
		borderBottom: "1px solid var(--border)",
	},
	td: {
		padding: "16px 24px",
		fontSize: "15px",
		verticalAlign: "middle",
	},
	thumbnail: {
		width: "48px",
		height: "48px",
		objectFit: "cover",
		borderRadius: "8px",
	},
	placeholderThumb: {
		width: "48px",
		height: "48px",
		background: "#f0f0f0",
		borderRadius: "8px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		fontSize: "10px",
		color: "var(--stone)",
		textAlign: "center",
	},
	deleteBtn: {
		color: "#d9534f",
		background: "transparent",
		border: "none",
		cursor: "pointer",
		fontSize: "14px",
		textDecoration: "underline",
	},
	formCard: {
		background: "#fff",
		border: "1px solid var(--border)",
		borderRadius: "12px",
		padding: "32px",
		maxWidth: "600px",
	},
	inputGroup: {
		marginBottom: "24px",
		display: "flex",
		flexDirection: "column",
		gap: "8px",
	},
	label: {
		fontSize: "14px",
		fontWeight: 500,
		color: "var(--ink)",
	},
	input: {
		padding: "12px 16px",
		border: "1px solid var(--border)",
		borderRadius: "8px",
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		outline: "none",
	},
};
