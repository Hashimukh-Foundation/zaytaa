import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

export default function AdminSettings() {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	// Form states
	const [shopTitle, setShopTitle] = useState("");
	const [shopSubtitle, setShopSubtitle] = useState("");
	const [announcement, setAnnouncement] = useState("");
	const [homeTitle, setHomeTitle] = useState("");
	const [homeSubtitle, setHomeSubtitle] = useState("");

	useEffect(() => {
		async function fetchSettings() {
			setLoading(true);

			// Fetch all settings from your key-value table
			const { data, error } = await supabase
				.from("site_settings")
				.select("key, value");

			if (error) {
				console.error("Error fetching settings:", error);
			} else if (data) {
				// Turn the array of rows into a dictionary: { shop_title: "Shop All", ... }
				const settingsMap = data.reduce((acc, row) => {
					acc[row.key] = row.value;
					return acc;
				}, {});

				// Populate the form fields if the keys exist
				setShopTitle(settingsMap["shop_title"] || "Shop All");
				setShopSubtitle(settingsMap["shop_subtitle"] || "");
				setAnnouncement(settingsMap["announcement_bar"] || "");

				setHomeTitle(settingsMap["home_title"] || "Welcome to Axiolab");
				setHomeSubtitle(
					settingsMap["home_subtitle"] || "Discover the best skincare.",
				);
			}
			setLoading(false);
		}
		fetchSettings();
	}, []);

	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);

		// Prepare an array of objects matching your exact site_settings schema
		const updates = [
			{
				key: "shop_title",
				value: shopTitle,
				label: "Shop Title",
				group_name: "Shop Headers",
			},
			{
				key: "shop_subtitle",
				value: shopSubtitle,
				label: "Shop Subtitle",
				group_name: "Shop Headers",
			},
			{
				key: "announcement_bar",
				value: announcement,
				label: "Announcement Bar",
				group_name: "Global",
			},

			{
				key: "home_title",
				value: homeTitle,
				label: "Home Title",
				group_name: "Homepage",
			},
			{
				key: "home_subtitle",
				value: homeSubtitle,
				label: "Home Subtitle",
				group_name: "Homepage",
			},
		];

		// Upsert uses your "site_settings_key_key" unique constraint to update if it exists, or insert if it doesn't!
		const { error } = await supabase
			.from("site_settings")
			.upsert(updates, { onConflict: "key" });

		if (error) {
			alert("Error saving settings: " + error.message);
		} else {
			alert("Settings updated successfully!");
		}

		setSaving(false);
	};

	if (loading)
		return <div style={{ padding: "40px" }}>Loading settings...</div>;

	return (
		<div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
			<div style={styles.header}>
				<h2 style={styles.title}>Store Settings</h2>
				<p
					style={{
						color: "var(--stone)",
						margin: "8px 0 0 0",
						fontSize: "15px",
					}}
				>
					Update the main text displayed across your storefront.
				</p>
			</div>

			<form onSubmit={handleSave} style={styles.formCard}>
				{/* ---> NEW: Homepage Settings UI <--- */}
				<h3 style={styles.sectionTitle}>Homepage Hero</h3>
				<div style={styles.inputRow}>
					<div style={styles.inputGroup}>
						<label style={styles.label}>Main Website Header</label>
						<input
							type="text"
							value={homeTitle}
							onChange={(e) => setHomeTitle(e.target.value)}
							style={styles.input}
							required
						/>
					</div>
				</div>
				<div style={styles.inputRow}>
					<div style={styles.inputGroup}>
						<label style={styles.label}>Main Website Subtitle</label>
						<input
							type="text"
							value={homeSubtitle}
							onChange={(e) => setHomeSubtitle(e.target.value)}
							style={styles.input}
						/>
					</div>
				</div>

				<hr
					style={{
						border: "none",
						borderTop: "1px solid var(--border)",
						margin: "32px 0",
					}}
				/>
				{/* ... existing Shop Page Headers UI ... */}
				<h3 style={styles.sectionTitle}>Shop Page Headers</h3>
				<div style={styles.inputRow}>
					<div style={styles.inputGroup}>
						<label style={styles.label}>Shop Title</label>
						<input
							type="text"
							value={shopTitle}
							onChange={(e) => setShopTitle(e.target.value)}
							style={styles.input}
							placeholder="e.g. Shop All"
							required
						/>
					</div>
				</div>
				<div style={styles.inputRow}>
					<div style={styles.inputGroup}>
						<label style={styles.label}>Shop Subtitle</label>
						<input
							type="text"
							value={shopSubtitle}
							onChange={(e) => setShopSubtitle(e.target.value)}
							style={styles.input}
							placeholder="e.g. Discover your perfect routine"
						/>
					</div>
				</div>

				<hr
					style={{
						border: "none",
						borderTop: "1px solid var(--border)",
						margin: "32px 0",
					}}
				/>

				<h3 style={styles.sectionTitle}>Global Elements</h3>
				<div style={styles.inputRow}>
					<div style={styles.inputGroup}>
						<label style={styles.label}>Top Announcement Bar (Optional)</label>
						<input
							type="text"
							value={announcement}
							onChange={(e) => setAnnouncement(e.target.value)}
							style={styles.input}
							placeholder="e.g. Free shipping on all orders over $50!"
						/>
					</div>
				</div>

				<div style={{ marginTop: "32px" }}>
					<button type="submit" style={styles.btnPrimary} disabled={saving}>
						{saving ? "Saving Updates..." : "Save Settings"}
					</button>
				</div>
			</form>
		</div>
	);
}

const styles = {
	header: { marginBottom: "32px" },
	title: {
		fontFamily: "var(--font-serif)",
		fontSize: "28px",
		color: "var(--ink)",
		margin: 0,
	},
	sectionTitle: {
		fontFamily: "var(--font-sans)",
		fontSize: "16px",
		fontWeight: 600,
		color: "var(--ink)",
		marginBottom: "16px",
		textTransform: "uppercase",
		letterSpacing: "0.05em",
	},
	formCard: {
		background: "#fff",
		border: "1px solid var(--border)",
		borderRadius: "12px",
		padding: "32px",
	},
	inputRow: { display: "flex", gap: "24px", marginBottom: "24px" },
	inputGroup: { flex: 1, display: "flex", flexDirection: "column", gap: "8px" },
	label: { fontSize: "14px", fontWeight: 500, color: "var(--ink)" },
	input: {
		padding: "12px 16px",
		border: "1px solid var(--border)",
		borderRadius: "8px",
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		outline: "none",
		width: "100%",
		boxSizing: "border-box",
	},
	btnPrimary: {
		background: "var(--ink)",
		color: "#fff",
		padding: "12px 24px",
		borderRadius: "8px",
		border: "none",
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		fontWeight: 500,
		cursor: "pointer",
		transition: "opacity 0.2s",
	},
};
