import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

export default function ShopByCategory() {
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchCategories() {
			const { data, error } = await supabase
				.from("categories")
				.select("id, name, slug, description")
				.neq("slug", "best-sellers")
				.neq("slug", "new-arrivals")
				.order("sort_order", { ascending: true });

			if (!error && data) {
				setCategories(data);
			}
			setLoading(false);
		}
		fetchCategories();
	}, []);

	if (loading || categories.length === 0) return null;

	// LUMIÈRE's premium pastel palette
	const bgColors = ["#e8ede6", "#f0e6d6", "#e6eaf0", "#f2ebe9"];

	return (
		<section style={styles.section}>
			<div style={styles.header}>
				<p style={styles.eyebrow}>Curated for you</p>
				<h2 style={styles.heading}>Shop by Category</h2>
			</div>

			<div style={styles.grid}>
				{categories.map((category, index) => {
					// Cycles through the colors based on the card's position
					const bg = bgColors[index % bgColors.length];

					return (
						<Link
							key={category.id}
							to={`/shop?cat=${category.slug}`}
							style={styles.cardLink}
						>
							<div
								style={{ ...styles.cardContainer, background: bg }}
								onMouseEnter={(e) => {
									e.currentTarget.style.borderColor = "var(--green)";
									e.currentTarget.style.transform = "translateY(-4px)";
									e.currentTarget.style.boxShadow =
										"0 12px 30px rgba(0,0,0,0.06)";
									const btn = e.currentTarget.querySelector(".explore-btn");
									btn.style.background = "var(--ink)";
									btn.style.color = "var(--white)";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.borderColor = "transparent";
									e.currentTarget.style.transform = "translateY(0)";
									e.currentTarget.style.boxShadow = "none";
									const btn = e.currentTarget.querySelector(".explore-btn");
									btn.style.background = "transparent";
									btn.style.color = "var(--ink)";
								}}
							>
								{/* Top Section: Text */}
								<div>
									<h3 style={styles.categoryName}>{category.name}</h3>
									{category.description && (
										<p style={styles.categoryDescription}>
											{category.description}
										</p>
									)}
								</div>

								{/* Bottom Section: Button */}
								<div className="explore-btn" style={styles.exploreButton}>
									Explore Collection
								</div>
							</div>
						</Link>
					);
				})}
			</div>
		</section>
	);
}

const styles = {
	section: {
		padding: "64px 40px",
		background: "var(--white)",
		maxWidth: "1400px",
		margin: "0 auto",
	},
	header: {
		textAlign: "center",
		marginBottom: "64px",
	},
	eyebrow: {
		fontFamily: "var(--font-sans)",
		fontSize: "11px",
		letterSpacing: "0.2em",
		color: "var(--stone)",
		marginBottom: "10px",
		textTransform: "uppercase",
	},
	heading: {
		fontFamily: "var(--font-serif)",
		fontSize: "clamp(36px, 5vw, 56px)",
		fontWeight: 700,
		color: "var(--ink)",
	},
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
		gap: "32px",
	},
	cardLink: {
		textDecoration: "none",
		display: "block",
		height: "100%",
	},
	cardContainer: {
		border: "1px solid transparent", // Changed to transparent so the background color pops cleanly
		borderRadius: "16px",
		padding: "32px 24px",
		height: "100%",
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		minHeight: "200px",
		transition: "all 0.3s ease",
		cursor: "pointer",
	},
	categoryName: {
		fontFamily: "var(--font-serif)",
		fontSize: "24px",
		fontWeight: 700,
		color: "var(--ink)",
		marginBottom: "12px",
	},
	categoryDescription: {
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		fontWeight: 300,
		color: "var(--stone)",
		lineHeight: 1.6,
		marginBottom: "24px",
	},
	exploreButton: {
		fontFamily: "var(--font-sans)",
		fontSize: "13px",
		fontWeight: 500,
		letterSpacing: "0.05em",
		textTransform: "uppercase",
		color: "var(--ink)",
		border: "1px solid var(--ink)",
		borderRadius: "100px",
		padding: "12px 24px",
		textAlign: "center",
		transition: "all 0.3s ease",
	},
};
