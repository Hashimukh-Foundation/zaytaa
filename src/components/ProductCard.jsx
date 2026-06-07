import { useState } from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
	const [wishlisted, setWishlisted] = useState(false);

	const primaryImg =
		product.product_images?.find((img) => img.is_primary)?.url ||
		product.product_images?.[0]?.url ||
		"";

	const handleWishlist = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setWishlisted((prev) => !prev);
	};

	const handleQuickAdd = (e) => {
		e.preventDefault();
		e.stopPropagation();
		// wire up your cart logic here
	};

	// ---> NEW: Price Calculation Logic <---
	const hasVariants =
		product.product_variants && product.product_variants.length > 0;

	let lowestActivePrice = product.sale_price || product.price;
	let lowestOriginalPrice = product.price;
	let isSale = !!product.sale_price;

	if (hasVariants) {
		product.product_variants.forEach((v) => {
			const vActive = v.sale_price || v.price;
			// If we find a variant price that is cheaper than our current lowest, update it!
			if (vActive < lowestActivePrice) {
				lowestActivePrice = vActive;
				lowestOriginalPrice = v.price;
				isSale = !!v.sale_price;
			}
		});
	}

	return (
		<Link to={`/product/${product.slug}`} style={styles.card}>
			<div style={styles.imageContainer}>
				{primaryImg ? (
					<img
						src={primaryImg}
						alt={product.name}
						style={styles.image}
						className="product-card-image"
					/>
				) : (
					<div style={styles.noImage}>No Image</div>
				)}

				<div style={styles.badges}>
					{product.is_bestseller && (
						<span style={{ ...styles.badge, ...styles.badgeBestseller }}>
							Best Seller
						</span>
					)}
					{product.is_new_arrival && (
						<span style={{ ...styles.badge, ...styles.badgeNew }}>New</span>
					)}
				</div>

				<button
					onClick={handleWishlist}
					style={styles.wishlistBtn}
					className="product-card-wishlist"
					aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
				>
					<HeartIcon filled={wishlisted} />
				</button>

				<div style={styles.quickAddOverlay} className="product-card-overlay">
					<button onClick={handleQuickAdd} style={styles.quickAdd}>
						Quick Add
					</button>
				</div>

				<div style={styles.detailsOverlay}>
					<h3 style={styles.name}>{product.name}</h3>

					{/* ---> UPDATED: Using calculated lowest prices <--- */}
					<div style={styles.priceRow}>
						{hasVariants && <span style={styles.fromText}>From </span>}
						{isSale ? (
							<>
								<span style={styles.originalPrice}>
									৳{lowestOriginalPrice.toFixed(2)}
								</span>
								<span style={styles.salePrice}>
									৳{lowestActivePrice.toFixed(2)}
								</span>
							</>
						) : (
							<span style={styles.price}>৳{lowestActivePrice.toFixed(2)}</span>
						)}
					</div>
				</div>
			</div>
		</Link>
	);
}

function HeartIcon({ filled }) {
	return (
		<svg
			viewBox="0 0 24 24"
			width="16"
			height="16"
			fill={filled ? "#c94040" : "none"}
			stroke={filled ? "#c94040" : "currentColor"}
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
		</svg>
	);
}

const styles = {
	card: {
		display: "block",
		textDecoration: "none",
		color: "inherit",
		cursor: "pointer",
		position: "relative",
	},
	imageContainer: {
		position: "relative",
		width: "100%",
		aspectRatio: "4/5",
		backgroundColor: "#f4f3f0",
		overflow: "hidden",
		borderRadius: "4px",
	},
	image: {
		width: "100%",
		height: "100%",
		objectFit: "cover",
		display: "block",
		transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
	},
	noImage: {
		width: "100%",
		height: "100%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: "var(--stone)",
		fontSize: "13px",
		fontFamily: "var(--font-mono)",
		letterSpacing: "0.03em",
	},
	badges: {
		position: "absolute",
		top: "12px",
		left: "12px",
		display: "flex",
		flexDirection: "column",
		gap: "6px",
		zIndex: 2,
	},
	badge: {
		fontSize: "10px",
		padding: "4px 8px",
		textTransform: "uppercase",
		letterSpacing: "0.08em",
		fontWeight: 600,
		fontFamily: "var(--font-mono)",
		display: "inline-block",
		borderRadius: "2px",
	},
	badgeBestseller: { background: "#fff3cd", color: "#6d5102" },
	badgeNew: { background: "#d4e9ff", color: "#003f7a" },
	wishlistBtn: {
		position: "absolute",
		top: "10px",
		right: "10px",
		width: "34px",
		height: "34px",
		background: "rgba(244,243,240,0.88)",
		border: "none",
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: "50%",
		zIndex: 2,
	},
	quickAddOverlay: {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		display: "flex",
		justifyContent: "center",
		zIndex: 2,
		opacity: 0,
		transition: "opacity 0.2s ease",
	},
	quickAdd: {
		background: "rgba(244,243,240,0.95)",
		color: "var(--ink)",
		border: "none",
		fontFamily: "var(--font-mono)",
		fontSize: "11px",
		letterSpacing: "0.08em",
		textTransform: "uppercase",
		padding: "12px 24px",
		cursor: "pointer",
		whiteSpace: "nowrap",
		borderRadius: "2px",
		boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
	},
	detailsOverlay: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		padding: "40px 16px 16px 16px",
		background:
			"linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%)",
		display: "flex",
		flexDirection: "column",
		gap: "4px",
		zIndex: 1,
	},
	name: {
		fontFamily: "var(--font-serif)",
		fontSize: "18px",
		fontWeight: 400,
		margin: 0,
		color: "#ffffff",
		lineHeight: 1.35,
		letterSpacing: "0.01em",
		textShadow: "0 1px 3px rgba(0,0,0,0.4)",
	},
	priceRow: {
		display: "flex",
		gap: "8px",
		alignItems: "baseline",
		fontFamily: "var(--font-sans)",
	},
	fromText: {
		color: "rgba(255, 255, 255, 0.7)",
		fontSize: "12px",
		textTransform: "uppercase",
		letterSpacing: "0.05em",
	},
	originalPrice: {
		textDecoration: "line-through",
		color: "rgba(255, 255, 255, 0.7)",
		fontSize: "13px",
	},
	salePrice: {
		color: "#ff8e8e",
		fontSize: "15px",
		fontWeight: 600,
		textShadow: "0 1px 2px rgba(0,0,0,0.5)",
	},
	price: {
		color: "#ffffff",
		fontSize: "15px",
		fontWeight: 500,
		textShadow: "0 1px 3px rgba(0,0,0,0.4)",
	},
};
