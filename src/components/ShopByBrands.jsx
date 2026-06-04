import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

export default function ShopByBrands() {
	const [brands, setBrands] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchBrands() {
			const { data, error } = await supabase
				.from("brands")
				.select("id, name, slug");

			if (!error && data) {
				setBrands(data);
			}
			setLoading(false);
		}
		fetchBrands();
	}, []);

	if (loading || brands.length === 0) return null;

	return (
		<section style={styles.section}>
			<div style={styles.header}>
				<p style={styles.eyebrow}>Curated for you</p>
				<h2 style={styles.heading}>Our Brands</h2>
			</div>

			<div style={styles.grid}>
				{brands.map((brand) => {
					return (
						<Link
							key={brand.id}
							to={`/shop?brand=${brand.slug}`} // Fixed to use ?brand= instead of ?skin=
							style={styles.cardLink}
						>
							<div
								style={styles.cardContainer}
								onMouseEnter={(e) => {
									e.currentTarget.style.borderColor = "var(--ink)";
									e.currentTarget.style.transform = "translateY(-4px)";
									e.currentTarget.style.boxShadow =
										"0 12px 30px rgba(0,0,0,0.06)";
									e.currentTarget.style.background = "var(--ink)";

									const name = e.currentTarget.querySelector(".brand-name");
									name.style.color = "var(--white)";

									const btn = e.currentTarget.querySelector(".explore-btn");
									btn.style.color = "var(--white)";
									btn.style.opacity = "1";
									btn.style.transform = "translateY(0)";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.borderColor = "var(--border)";
									e.currentTarget.style.transform = "translateY(0)";
									e.currentTarget.style.boxShadow = "none";
									e.currentTarget.style.background = "#faf9f7"; // Soft, elegant unified color

									const name = e.currentTarget.querySelector(".brand-name");
									name.style.color = "var(--ink)";

									const btn = e.currentTarget.querySelector(".explore-btn");
									btn.style.color = "var(--stone)";
									btn.style.opacity = "0";
									btn.style.transform = "translateY(10px)";
								}}
							>
								<div style={styles.contentWrapper}>
									<h3 className="brand-name" style={styles.brandName}>
										{brand.name}
									</h3>

									<div className="explore-btn" style={styles.exploreText}>
										Explore Collection &rarr;
									</div>
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
		padding: "80px 40px",
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
		marginBottom: "16px",
		textTransform: "uppercase",
	},
	heading: {
		fontFamily: "var(--font-serif)",
		fontSize: "clamp(36px, 5vw, 56px)",
		fontWeight: 700,
		color: "var(--ink)",
		margin: 0,
	},
	grid: {
		display: "grid",
		// Uses a slightly smaller min-width since they are square, allowing nice rows of 4 or 5
		gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
		gap: "24px",
	},
	cardLink: {
		textDecoration: "none",
		display: "block",
	},
	cardContainer: {
		aspectRatio: "1 / 1", // Forces the perfect square
		background: "#e6eaf0", // A single, unified elegant alabaster color
		border: "1px solid var(--border)",
		borderRadius: "8px", // Slightly sharper corners for squares look modern
		padding: "24px",
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		textAlign: "center",
		transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
		cursor: "pointer",
		position: "relative",
		overflow: "hidden",
	},
	contentWrapper: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: "16px",
	},
	brandName: {
		fontFamily: "var(--font-serif)",
		fontSize: "28px",
		fontWeight: 400,
		color: "var(--ink)",
		margin: 0,
		transition: "color 0.3s ease",
	},
	exploreText: {
		fontFamily: "var(--font-sans)",
		fontSize: "12px",
		fontWeight: 500,
		letterSpacing: "0.1em",
		textTransform: "uppercase",
		color: "var(--stone)",
		opacity: 0,
		transform: "translateY(10px)",
		transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
	},
};
