import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";

export default function ProductSection({
	title,
	subtitle,
	filterType,
	filterValue,
	viewAllLink,
}) {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchProducts() {
			setLoading(true);

			// 1. DYNAMIC QUERY: If we are looking for a category, we must tell Supabase
			// to look through the new "product_categories" junction table!

			let selectString = `*, product_images (url, is_primary), product_variants (price, sale_price)`;

			if (filterType === "category") {
				selectString = `
                    *, 
                    product_images (url, is_primary), 
                    product_variants (price, sale_price),
                    product_categories!inner ( categories!inner (slug) )
                `;
			}

			let query = supabase.from("products").select(selectString);

			// 2. Apply the dynamic filters
			if (filterType === "featured") {
				query = query.eq("is_featured", true);
			} else if (filterType === "bestseller") {
				query = query.eq("is_bestseller", true);
			} else if (filterType === "newarrival") {
				query = query.eq("is_new_arrival", true);
			} else if (filterType === "category") {
				query = query.eq("product_categories.categories.slug", filterValue);
			}

			// LIMIT to exactly 5 products
			const { data, error } = await query.limit(5);

			if (!error && data) {
				setProducts(data);
			} else if (error) {
				console.error("Error fetching section:", error.message);
			}

			setLoading(false);
		}

		fetchProducts();
	}, [filterType, filterValue]);

	// Don't show the section at all if there are no products
	if (loading || products.length === 0) return null;

	return (
		<section style={styles.section}>
			<div style={styles.header}>
				<div>
					{subtitle && <p style={styles.eyebrow}>{subtitle}</p>}
					<h2 style={styles.heading}>{title}</h2>
				</div>

				{/* Dynamically render the 'Show More' button if a link is provided */}
				{viewAllLink && (
					<Link to={viewAllLink} style={styles.viewAllBtn}>
						Show More &rarr;
					</Link>
				)}
			</div>

			<div style={styles.grid}>
				{products.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
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
		display: "flex",
		justifyContent: "space-between",
		alignItems: "flex-end", // Aligns the button with the bottom of the title
		marginBottom: "40px",
	},
	eyebrow: {
		fontFamily: "var(--font-sans)",
		fontSize: "11px",
		letterSpacing: "0.2em",
		color: "var(--stone)",
		marginBottom: "12px",
		textTransform: "uppercase",
	},
	heading: {
		fontFamily: "var(--font-serif)",
		fontSize: "clamp(28px, 4vw, 40px)",
		fontWeight: 700,
		color: "var(--ink)",
		margin: 0,
	},
	viewAllBtn: {
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		fontWeight: 500,
		color: "var(--ink)",
		textDecoration: "none",
		borderBottom: "1px solid var(--ink)",
		paddingBottom: "4px",
		transition: "color 0.3s ease",
	},
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
		gap: "32px",
	},
};
