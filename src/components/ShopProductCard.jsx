import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import Toast from "./Toast";

export default function ShopProductCard({ product }) {
	// 1. Extract the best image
	const primaryImg =
		product.product_images?.find((img) => img.is_primary)?.url ||
		product.product_images?.[0]?.url ||
		"/placeholder.jpg";

	// 2. Calculate Pricing & Variant Data
	let activePrice = product.price;
	let activeSalePrice = product.sale_price;
	let variantLabel = "";

	if (product.product_variants && product.product_variants.length > 0) {
		const cheapestVariant = product.product_variants.reduce((prev, curr) => {
			const prevPrice = prev.sale_price || prev.price;
			const currPrice = curr.sale_price || curr.price;
			return currPrice < prevPrice ? curr : prev;
		});
		activePrice = cheapestVariant.price;
		activeSalePrice = cheapestVariant.sale_price;
		variantLabel = cheapestVariant.name;
	}

	const hasSale = activeSalePrice && activeSalePrice < activePrice;
	const discountPercent = hasSale
		? Math.round(((activePrice - activeSalePrice) / activePrice) * 100)
		: 0;

	// 3. Review Math
	const rating = product.average_rating || 0;
	const reviewCount = product.review_count || 0;
	const starPercentage = Math.round((rating / 5) * 100);

	// 4. Button Handlers
	const { addToCart } = useCart();

	const [isAdded, setIsAdded] = useState(false);
	const [toastMessage, setToastMessage] = useState(null);
	const handleAddToCart = (e) => {
		e.preventDefault();
		e.stopPropagation();

		// Simple check before adding
		if (product.stock_quantity > 0) {
			addToCart(product, product.product_variants?.[0] || null, 1);
			setIsAdded(true);
			setTimeout(() => setIsAdded(false), 2000); // Revert after 2s
			setToastMessage("Added to your bag.");
		} else {
			setToastMessage("Added to your bag.");
		}
	};

	const handleWishlist = (e) => {
		e.preventDefault();
		e.stopPropagation(); // Prevents the link underneath from triggering when you click the heart
		alert(`Added to wishlist!`);
	};

	return (
		<div className="axio-card">
			{/* Renders the CSS from the function at the bottom of the file */}
			<ShopCardStyles hasSale={hasSale} />

			<Toast message={toastMessage} onClose={() => setToastMessage(null)} />

			{/* Link updated to match your exact /shop/slug URL structure */}
			<Link
				to={`/product/${product.slug}`}
				style={{
					textDecoration: "none",
					display: "flex",
					flexDirection: "column",
					flexGrow: 1,
				}}
			>
				<div className="card-image-area">
					{hasSale && (
						<span className="badge-discount">{discountPercent}% OFF</span>
					)}
					<button className="wishlist-btn" onClick={handleWishlist}>
						♡
					</button>

					<img
						src={primaryImg}
						alt={product.name}
						className="card-image"
						loading="lazy"
					/>
				</div>

				<div className="card-body">
					<h3 className="card-title">{product.name}</h3>

					<div className="meta-row">
						<div className="stars-wrap">
							<div className="stars-outer">
								<div
									className="stars-inner"
									style={{ width: `${starPercentage}%` }}
								></div>
							</div>
							<span className="rating-count">({reviewCount})</span>
						</div>
						{variantLabel && <span className="size-pill">{variantLabel}</span>}
					</div>

					<div className="card-price-row">
						<span className="price-active">
							${(activeSalePrice || activePrice).toFixed(2)}
						</span>
						{hasSale && (
							<span className="price-original">${activePrice.toFixed(2)}</span>
						)}
					</div>

					<button className="add-to-cart-btn" onClick={handleAddToCart}>
						{isAdded ? "Added to Cart!" : "Add to Cart"}
					</button>
				</div>
			</Link>
		</div>
	);
}

// ==========================================
// CSS STYLES FUNCTION
// ==========================================
function ShopCardStyles({ hasSale }) {
	return (
		<style>{`
            .axio-card {
                display: flex;
                flex-direction: column;
                height: 100%;
                background: var(--white);
                border: 1px solid var(--border);
                border-radius: 12px;
                overflow: hidden;
                transition: box-shadow 0.3s ease, border-color 0.3s ease;
                text-decoration: none;
                position: relative;
            }
            .axio-card:hover {
                box-shadow: 0 12px 30px rgba(0,0,0,0.06);
                border-color: var(--ink);
            }

            .card-image-area {
                position: relative;
                aspect-ratio: 1 / 1; 
                background: #fcfbf8;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            .card-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.5s ease;
            }
            .axio-card:hover .card-image {
                transform: scale(1.05);
            }

            .badge-discount {
                position: absolute;
                top: 12px;
                left: 12px;
                background: #d9534f;
                color: white;
                font-family: var(--font-sans);
                font-size: 11px;
                font-weight: 700;
                padding: 4px 8px;
                border-radius: 4px;
                z-index: 2;
            }
            .wishlist-btn {
                position: absolute;
                top: 12px;
                right: 12px;
                background: rgba(255, 255, 255, 0.9);
                border: none;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                color: var(--stone);
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                z-index: 2;
                transition: all 0.2s;
            }
            .wishlist-btn:hover {
                color: #d9534f;
                transform: scale(1.1);
            }

            .card-body {
                padding: 16px;
                display: flex;
                flex-direction: column;
                flex-grow: 1;
                text-align: left;
            }
            .card-title {
                font-family: var(--font-sans);
                font-size: 14px;
                font-weight: 600;
                color: var(--ink);
                margin: 0 0 12px 0;
                line-height: 1.4;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                min-height: 38px;
            }

            .meta-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }
            .stars-wrap {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .stars-outer {
                display: inline-block;
                position: relative;
                font-family: Arial, sans-serif;
                font-size: 14px;
                color: #e5e7eb;
                letter-spacing: 1px;
            }
            .stars-outer::before {
                content: '★★★★★';
            }
            .stars-inner {
                position: absolute;
                top: 0;
                left: 0;
                white-space: nowrap;
                overflow: hidden;
                color: #eab308;
            }
            .stars-inner::before {
                content: '★★★★★';
            }

            .rating-count {
                color: var(--stone);
                font-family: var(--font-sans);
                font-size: 11px;
            }
            .size-pill {
                background: #fcfbf8;
                border: 1px solid var(--border);
                color: var(--stone);
                font-family: var(--font-sans);
                font-size: 10px;
                font-weight: 600;
                padding: 2px 6px;
                border-radius: 4px;
                text-transform: uppercase;
            }

            .card-price-row {
                display: flex;
                align-items: baseline;
                gap: 8px;
                margin-bottom: 16px;
            }
            .price-active {
                color: ${hasSale ? "#d9534f" : "var(--ink)"};
                font-family: var(--font-sans);
                font-size: 18px;
                font-weight: 700;
            }
            .price-original {
                color: var(--stone);
                text-decoration: line-through;
                font-family: var(--font-sans);
                font-size: 13px;
            }

            .add-to-cart-btn {
                width: 100%;
                background: var(--ink);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 12px 0;
                font-family: var(--font-sans);
                font-size: 13px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                cursor: pointer;
                transition: background 0.2s ease;
                margin-top: auto;
            }
            .add-to-cart-btn:hover {
                background: #333;
            }
        `}</style>
	);
}
