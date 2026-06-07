import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import Toast from "../components/Toast";

export default function ProductPage() {
	const { slug } = useParams();
	const [product, setProduct] = useState(null);
	const [relatedProducts, setRelatedProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const { addToCart } = useCart();
	const [isAdded, setIsAdded] = useState(false);
	// UI States
	const [selectedImage, setSelectedImage] = useState("");
	const [quantity, setQuantity] = useState(1);
	const [selectedVariant, setSelectedVariant] = useState(null);
	const [toastMessage, setToastMessage] = useState(null);

	useEffect(() => {
		async function fetchProductData() {
			setLoading(true);

			const { data, error } = await supabase
				.from("products")
				.select(
					`
                    *,
                    brands ( name, slug ),
                    product_images ( url, is_primary ),
                    product_categories ( categories ( id, name, slug ) ), 
                    product_skin_types ( skin_types ( name, slug ) ),
                    product_variants ( id, name, price, sale_price, stock_quantity ),
                    reviews ( id, user_name, rating, comment, created_at )
                `,
				)
				.eq("slug", slug)
				.maybeSingle();

			if (error) {
				console.error("Error fetching product:", error);
			} else if (data) {
				const sortedImages = [...data.product_images].sort((a, b) =>
					b.is_primary ? 1 : -1,
				);
				data.product_images = sortedImages;

				setProduct(data);
				if (sortedImages.length > 0) setSelectedImage(sortedImages[0].url);
				if (data.product_variants && data.product_variants.length > 0)
					setSelectedVariant(data.product_variants[0]);

				const categoryIds = data.product_categories.map(
					(pc) => pc.categories.id,
				);

				let relatedQuery = supabase
					.from("products")
					.select(
						`
                        id, name, slug, price, sale_price, is_bestseller, is_new_arrival,
                        product_images ( url, is_primary ),
                        product_variants ( price, sale_price ),
                        product_categories!inner ( category_id )
                    `,
					)
					.neq("id", data.id)
					.limit(12);

				if (categoryIds.length > 0) {
					relatedQuery = relatedQuery.in(
						"product_categories.category_id",
						categoryIds,
					);
				}

				const { data: relatedData, error: relatedError } = await relatedQuery;
				if (!relatedError && relatedData) {
					setRelatedProducts(relatedData);
				}
			}

			setLoading(false);
		}

		fetchProductData();
		window.scrollTo(0, 0);
	}, [slug]);

	const renderContent = () => {
		if (loading)
			return <div style={styles.centerBox}>[ LOADING PRODUCT... ]</div>;
		if (!product)
			return (
				<div style={styles.centerBox}>
					Product not found. <Link to="/shop">Back to Shop</Link>
				</div>
			);

		// Data Calculations
		const currentPrice = selectedVariant
			? selectedVariant.price
			: product.price;
		const currentSalePrice = selectedVariant
			? selectedVariant.sale_price
			: product.sale_price;
		const activeStock = selectedVariant
			? selectedVariant.stock_quantity
			: product.stock_quantity;

		const categories = product.product_categories.map((pc) => pc.categories);
		const skinTypes = product.product_skin_types.map((pst) => pst.skin_types);
		const brand = product.brands;

		const totalReviews = product.reviews ? product.reviews.length : 0;
		const averageRating =
			totalReviews > 0
				? (
						product.reviews.reduce((sum, rev) => sum + rev.rating, 0) /
						totalReviews
					).toFixed(1)
				: 0;

		const handleAddToCart = (e) => {
			e.preventDefault();
			e.stopPropagation();

			// Simple check before adding
			if (product.stock_quantity > 0) {
				addToCart(product, selectedVariant, quantity);
				setIsAdded(true);
				// setTimeout(() => setIsAdded(false), 2000); // Revert after 2s
				setToastMessage("Added to cart.");
			} else {
				setToastMessage("Item is out of stock.");
			}
		};

		return (
			<div style={styles.container}>
				<Toast message={toastMessage} onClose={() => setToastMessage(null)} />
				<div style={styles.breadcrumbs}>
					<Link to="/" style={styles.crumb}>
						Home
					</Link>{" "}
					/
					<Link to="/shop" style={styles.crumb}>
						{" "}
						Shop
					</Link>{" "}
					/<span style={{ color: "var(--ink)" }}> {product.name}</span>
				</div>

				<div style={styles.grid}>
					{/* LEFT COLUMN: Image Gallery */}
					<div style={styles.gallery}>
						<div style={styles.mainImageContainer}>
							{selectedImage ? (
								<img
									src={selectedImage}
									alt={product.name}
									style={styles.mainImage}
								/>
							) : (
								<div style={styles.noImage}>No Image</div>
							)}
						</div>
						{product.product_images.length > 1 && (
							<div style={styles.thumbnailList}>
								{product.product_images.map((img, idx) => (
									<button
										key={idx}
										onClick={() => setSelectedImage(img.url)}
										style={{
											...styles.thumbnailBtn,
											borderColor:
												selectedImage === img.url
													? "var(--ink)"
													: "transparent",
										}}
									>
										<img
											src={img.url}
											alt={`View ${idx + 1}`}
											style={styles.thumbnailImg}
										/>
									</button>
								))}
							</div>
						)}
					</div>

					{/* RIGHT COLUMN: Product Info & Actions */}
					<div style={styles.info}>
						<div style={styles.topMetaRow}>
							{brand ? (
								<Link to={`/shop?brand=${brand.slug}`} style={styles.brandLink}>
									{brand.name}
								</Link>
							) : (
								<span style={styles.brandLink}>Axiolab Cosmetics</span>
							)}

							{totalReviews > 0 && (
								<div
									style={styles.reviewSummary}
									onClick={() => {
										document
											.getElementById("reviews-section")
											.scrollIntoView({ behavior: "smooth" });
									}}
								>
									<StarIcon />{" "}
									<span style={{ fontWeight: 600 }}>{averageRating}</span>
									<span
										style={{
											color: "var(--stone)",
											textDecoration: "underline",
										}}
									>
										({totalReviews} Reviews)
									</span>
								</div>
							)}
						</div>

						<h1 style={styles.title}>{product.name}</h1>

						<div style={styles.priceContainer}>
							{currentSalePrice ? (
								<>
									<span style={styles.salePrice}>
										৳{currentSalePrice.toFixed(2)}
									</span>
									<span style={styles.originalPrice}>
										৳{currentPrice.toFixed(2)}
									</span>
								</>
							) : (
								<span style={styles.price}>৳{currentPrice.toFixed(2)}</span>
							)}
						</div>

						{product.product_variants &&
							product.product_variants.length > 0 && (
								<div style={styles.variantsContainer}>
									<span style={styles.metaLabel}>Size / Variant:</span>
									<div style={styles.variantList}>
										{product.product_variants.map((variant) => (
											<button
												key={variant.id}
												onClick={() => setSelectedVariant(variant)}
												style={{
													...styles.variantBtn,
													borderColor:
														selectedVariant?.id === variant.id
															? "var(--ink)"
															: "var(--border)",
													backgroundColor:
														selectedVariant?.id === variant.id
															? "var(--ink)"
															: "transparent",
													color:
														selectedVariant?.id === variant.id
															? "#fff"
															: "var(--ink)",
												}}
											>
												{variant.name}
											</button>
										))}
									</div>
								</div>
							)}

						<div
							style={{
								marginBottom: "32px",
								fontFamily: "var(--font-sans)",
								fontSize: "14px",
							}}
						>
							{activeStock > 10 ? (
								<span
									style={{
										color: "var(--green)",
										display: "flex",
										alignItems: "center",
										gap: "6px",
										fontWeight: 600,
									}}
								>
									<StatusDot color="var(--green)" /> IN STOCK
								</span>
							) : activeStock > 0 ? (
								<span
									style={{
										color: "#d9534f",
										fontWeight: 700,
										display: "flex",
										alignItems: "center",
										gap: "6px",
									}}
								>
									<StatusDot color="#d9534f" /> LOW STOCK: ONLY {activeStock}{" "}
									LEFT!
								</span>
							) : (
								<span
									style={{
										color: "var(--stone)",
										display: "flex",
										alignItems: "center",
										gap: "6px",
										fontWeight: 600,
									}}
								>
									<StatusDot color="var(--stone)" /> OUT OF STOCK
								</span>
							)}
						</div>

						<div style={styles.actionRow}>
							<div style={styles.quantityBox}>
								<button
									onClick={() => setQuantity(Math.max(1, quantity - 1))}
									style={styles.qtyBtn}
								>
									-
								</button>
								<span style={styles.qtyNum}>{quantity}</span>
								<button
									onClick={() => setQuantity(quantity + 1)}
									style={styles.qtyBtn}
									disabled={quantity >= activeStock}
								>
									+
								</button>
							</div>
							<button
								onClick={handleAddToCart}
								style={{
									...styles.addToCartBtn,
									opacity: activeStock === 0 ? 0.5 : 1,
								}}
								disabled={activeStock === 0}
							>
								{activeStock === 0 ? "Out of Stock" : "Add to Cart"}
							</button>
						</div>

						<div style={styles.detailsContainer}>
							<div style={styles.detailSection}>
								<h3 style={styles.sectionTitle}>Product Description</h3>
								<p style={styles.bodyText}>{product.description}</p>

								{(categories.length > 0 || skinTypes.length > 0) && (
									<div style={styles.highlightsBox}>
										{categories.length > 0 && (
											<div style={styles.highlightRow}>
												<span style={styles.highlightLabel}>CATEGORY:</span>
												<span style={styles.highlightValue}>
													{categories.map((c) => c.name).join(", ")}
												</span>
											</div>
										)}
										{skinTypes.length > 0 && (
											<div style={styles.highlightRow}>
												<span style={styles.highlightLabel}>BEST FOR:</span>
												<span style={styles.highlightValue}>
													{skinTypes.map((s) => s.name).join(", ")}
												</span>
											</div>
										)}
									</div>
								)}
							</div>

							<div style={styles.detailSection}>
								<h3 style={styles.sectionTitle}>Shipping & Returns</h3>
								<div style={styles.bodyText}>
									<p style={{ marginBottom: "12px" }}>
										<strong style={styles.boldPop}>Standard Shipping:</strong>{" "}
										3-5 business days.
									</p>
									<div style={styles.returnCallout}>
										<strong style={styles.boldPop}>30-Day Guarantee:</strong> We
										accept returns within <strong>30 days</strong> of purchase
										for unused products in their original packaging.
									</div>
								</div>
							</div>

							<div
								id="reviews-section"
								style={{ ...styles.detailSection, borderBottom: "none" }}
							>
								<h3 style={styles.sectionTitle}>
									Customer Reviews ({totalReviews})
								</h3>
								{totalReviews === 0 ? (
									<p style={{ color: "var(--stone)" }}>
										No reviews yet. Be the first to review!
									</p>
								) : (
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											gap: "24px",
										}}
									>
										{product.reviews.map((rev) => (
											<div key={rev.id} style={styles.reviewCard}>
												<div
													style={{
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
														marginBottom: "12px",
													}}
												>
													<strong
														style={{ fontSize: "16px", color: "var(--ink)" }}
													>
														{rev.user_name}
													</strong>
													<span
														style={{
															color: "#f5c518",
															fontSize: "14px",
															letterSpacing: "2px",
														}}
													>
														{"★".repeat(rev.rating)}
														{"☆".repeat(5 - rev.rating)}
													</span>
												</div>
												<p
													style={{
														margin: 0,
														fontSize: "15px",
														color: "var(--stone)",
														lineHeight: 1.8,
													}}
												>
													"{rev.comment}"
												</p>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{relatedProducts.length > 0 && (
					<div style={styles.relatedSection}>
						<h2
							style={{
								fontFamily: "var(--font-serif)",
								fontSize: "32px",
								color: "var(--ink)",
								marginBottom: "40px",
								textAlign: "center",
							}}
						>
							You Might Also Like
						</h2>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
								gap: "32px",
							}}
						>
							{relatedProducts.map((related) => (
								<ProductCard key={related.id} product={related} />
							))}
						</div>
					</div>
				)}
			</div>
		);
	};

	return (
		<>
			<Navbar />
			<main style={{ minHeight: "80vh" }}>{renderContent()}</main>
			<Footer />
		</>
	);
}

// --- Icons ---
const StarIcon = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="#f5c518"
		stroke="#f5c518"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
	</svg>
);
const StatusDot = ({ color }) => (
	<span
		style={{
			width: "8px",
			height: "8px",
			borderRadius: "50%",
			backgroundColor: color,
			display: "inline-block",
		}}
	></span>
);

// --- Styles ---
const styles = {
	centerBox: {
		padding: "100px",
		textAlign: "center",
		fontFamily: "var(--font-mono)",
		color: "var(--stone)",
		minHeight: "60vh",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	container: {
		maxWidth: "1200px",
		margin: "0 auto",
		padding: "40px 24px 80px 24px",
	},
	breadcrumbs: {
		fontFamily: "var(--font-sans)",
		fontSize: "13px",
		color: "var(--stone)",
		marginBottom: "40px",
	},
	crumb: { color: "var(--stone)", textDecoration: "none" },
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", // Adjusted to prevent awkward gaps with smaller image
		gap: "64px",
		alignItems: "start",
	},

	gallery: {
		display: "flex",
		flexDirection: "column",
		gap: "16px",
		maxWidth: "360px", // ---> CHANGED: Much smaller image width
		width: "100%",
		margin: "0 auto",
	},
	mainImageContainer: {
		width: "100%",
		aspectRatio: "4/5",
		backgroundColor: "#f4f3f0",
		borderRadius: "8px",
		overflow: "hidden",
	},
	mainImage: { width: "100%", height: "100%", objectFit: "cover" },
	noImage: {
		width: "100%",
		height: "100%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: "var(--stone)",
		fontFamily: "var(--font-mono)",
	},
	thumbnailList: {
		display: "flex",
		gap: "12px",
		overflowX: "auto",
		paddingBottom: "8px",
	},
	thumbnailBtn: {
		padding: "2px",
		border: "2px solid",
		borderRadius: "6px",
		cursor: "pointer",
		background: "none",
	},
	thumbnailImg: {
		width: "80px",
		height: "80px",
		objectFit: "cover",
		borderRadius: "4px",
	},

	info: { display: "flex", flexDirection: "column" },
	topMetaRow: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: "16px",
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
	},
	brandLink: {
		color: "var(--stone)",
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		textDecoration: "none",
		fontWeight: 700,
	},
	reviewSummary: {
		display: "flex",
		alignItems: "center",
		gap: "6px",
		cursor: "pointer",
	},
	title: {
		fontFamily: "var(--font-serif)",
		fontSize: "36px",
		margin: "0 0 16px 0",
		color: "var(--ink)",
		lineHeight: 1.2,
	},
	priceContainer: {
		display: "flex",
		gap: "16px",
		alignItems: "baseline",
		marginBottom: "32px",
		fontFamily: "var(--font-sans)",
	},
	price: { fontSize: "24px", color: "var(--ink)", fontWeight: 500 },
	salePrice: { fontSize: "24px", color: "#c94040", fontWeight: 500 },
	originalPrice: {
		fontSize: "18px",
		color: "var(--stone)",
		textDecoration: "line-through",
	},

	variantsContainer: { marginBottom: "24px" },
	metaLabel: {
		color: "var(--stone)",
		marginRight: "8px",
		fontWeight: 600,
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
	},
	variantList: {
		display: "flex",
		gap: "12px",
		flexWrap: "wrap",
		marginTop: "12px",
	},
	variantBtn: {
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		padding: "10px 20px",
		border: "1px solid",
		borderRadius: "4px",
		cursor: "pointer",
		transition: "all 0.2s",
	},
	actionRow: { display: "flex", gap: "16px", marginBottom: "40px" },
	quantityBox: {
		display: "flex",
		alignItems: "center",
		border: "1px solid var(--border)",
		borderRadius: "4px",
		padding: "4px",
	},
	qtyBtn: {
		background: "none",
		border: "none",
		padding: "12px 16px",
		fontSize: "18px",
		cursor: "pointer",
		color: "var(--ink)",
	},
	qtyNum: {
		fontFamily: "var(--font-sans)",
		fontSize: "16px",
		width: "32px",
		textAlign: "center",
		fontWeight: 600,
	},
	addToCartBtn: {
		flex: 1,
		background: "var(--ink)",
		color: "white",
		border: "none",
		fontFamily: "var(--font-sans)",
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		fontSize: "14px",
		fontWeight: 600,
		borderRadius: "4px",
		cursor: "pointer",
		transition: "opacity 0.2s",
	},

	detailsContainer: {
		display: "flex",
		flexDirection: "column",
		gap: "48px",
		borderTop: "2px solid var(--border)",
		paddingTop: "48px",
	},
	detailSection: {
		display: "flex",
		flexDirection: "column",
		gap: "20px",
		borderBottom: "1px solid var(--border)",
		paddingBottom: "48px",
	},
	sectionTitle: {
		fontFamily: "var(--font-serif)",
		fontSize: "24px",
		color: "var(--ink)",
		margin: 0,
	},
	bodyText: {
		fontFamily: "var(--font-sans)",
		fontSize: "16px",
		color: "var(--stone)",
		lineHeight: 1.8,
		letterSpacing: "0.02em",
		margin: 0,
		whiteSpace: "pre-wrap",
	},
	boldPop: { color: "var(--ink)", fontWeight: 700 },

	highlightsBox: {
		background: "#fcfbf8",
		border: "1px solid var(--border)",
		borderRadius: "6px",
		padding: "20px",
		display: "flex",
		flexDirection: "column",
		gap: "12px",
		marginTop: "12px",
	},
	highlightRow: { display: "flex", gap: "8px", alignItems: "baseline" },
	highlightLabel: {
		fontFamily: "var(--font-mono)",
		fontSize: "11px",
		textTransform: "uppercase",
		letterSpacing: "0.1em",
		color: "var(--stone)",
		fontWeight: 600,
		width: "90px",
	},
	highlightValue: {
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		color: "var(--ink)",
		fontWeight: 500,
	},

	returnCallout: {
		marginTop: "16px",
		padding: "20px",
		background: "rgba(201, 64, 64, 0.05)",
		borderLeft: "4px solid #c94040",
		color: "var(--ink)",
		fontSize: "15px",
		lineHeight: 1.6,
		borderRadius: "0 4px 4px 0",
	},

	reviewCard: {
		background: "#fff",
		border: "1px solid var(--border)",
		padding: "24px",
		borderRadius: "8px",
	},

	relatedSection: {
		marginTop: "24px", // ---> CHANGED: Slashed the massive gap
		paddingTop: "40px", // ---> CHANGED: Reduced padding
		borderTop: "1px solid var(--border)",
	},
};
