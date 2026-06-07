import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import ShopProductCard from "../components/ShopProductCard";

export default function Shop() {
	const [searchParams, setSearchParams] = useSearchParams();

	// --- Store Settings State ---
	const [storeSettings, setStoreSettings] = useState({
		shop_title: "Shop All",
		shop_subtitle: "Discover your perfect routine",
	});

	// --- Data States ---
	const [allProducts, setAllProducts] = useState([]);
	const [filteredProducts, setFilteredProducts] = useState([]);
	const [loading, setLoading] = useState(true);

	// --- Filter Option Lists ---
	const [brandsList, setBrandsList] = useState([]);
	const [categoriesList, setCategoriesList] = useState([]);
	const [skinTypesList, setSkinTypesList] = useState([]);
	const [absoluteMaxPrice, setAbsoluteMaxPrice] = useState(100);

	// --- Active User Filters ---
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedBrands, setSelectedBrands] = useState([]);
	const [selectedCategories, setSelectedCategories] = useState([]);
	const [selectedSkinTypes, setSelectedSkinTypes] = useState([]);
	const [maxPrice, setMaxPrice] = useState(100);
	const [sortRule, setSortRule] = useState("newest");

	// --- Mobile UI State ---
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	// Helper: Find actual lowest price (including variants & sales)
	const getActivePrice = (product) => {
		let lowest = product.sale_price || product.price;
		if (product.product_variants && product.product_variants.length > 0) {
			product.product_variants.forEach((v) => {
				const vActive = v.sale_price || v.price;
				if (vActive < lowest) lowest = vActive;
			});
		}
		return lowest;
	};

	// 1. SYNC URL TO STATE: Watch the URL for clicks from the homepage
	useEffect(() => {
		const cat = searchParams.get("cat");
		const brand = searchParams.get("brand");
		const skin = searchParams.get("skin");
		const search = searchParams.get("search");

		if (cat) setSelectedCategories([cat]);
		if (brand) setSelectedBrands([brand]);
		if (skin) setSelectedSkinTypes([skin]);
		if (search) setSearchQuery(search);
	}, [searchParams]);

	// 2. FETCH ALL DATA ON LOAD
	useEffect(() => {
		async function fetchEverything() {
			setLoading(true);

			// Fetch Site Settings
			const { data: settings } = await supabase
				.from("site_settings")
				.select("key, value");
			if (settings) {
				const settingsMap = settings.reduce((acc, row) => {
					acc[row.key] = row.value;
					return acc;
				}, {});

				setStoreSettings({
					shop_title: settingsMap["shop_title"] || "Shop All",
					shop_subtitle:
						settingsMap["shop_subtitle"] || "Discover your perfect routine",
				});
			}

			// Fetch Filter Data
			const { data: brands } = await supabase
				.from("brands")
				.select("slug, name");
			const { data: cats } = await supabase
				.from("categories")
				.select("slug, name");
			const { data: skins } = await supabase
				.from("skin_types")
				.select("slug, name");
			if (brands) setBrandsList(brands);
			if (cats) setCategoriesList(cats);
			if (skins) setSkinTypesList(skins);

			// Fetch Products
			const { data: products, error } = await supabase.from("products").select(`
				id, name, slug, price, sale_price, stock_quantity, created_at, is_bestseller, is_new_arrival, is_featured,
				brands ( slug, name ),
				product_images ( url, is_primary ),
				product_categories ( categories ( slug, name ) ),
				product_skin_types ( skin_types ( slug, name ) ),
				product_variants ( id, name, price, sale_price, stock_quantity )
			`);

			if (error) {
				console.error("Error fetching products:", error);
			} else if (products) {
				setAllProducts(products);

				let highest = 0;
				products.forEach((p) => {
					const price = getActivePrice(p);
					if (price > highest) highest = price;
				});
				const roundedMax = Math.ceil(highest / 10) * 10;
				setAbsoluteMaxPrice(roundedMax);
				setMaxPrice(roundedMax);
			}

			setLoading(false);
		}

		fetchEverything();
		window.scrollTo(0, 0);
	}, []);

	// 3. APPLY FILTERS WHENEVER STATE CHANGES
	useEffect(() => {
		let result = [...allProducts];

		// Apply URL Flags
		if (searchParams.get("featured") === "true")
			result = result.filter((p) => p.is_featured);
		if (searchParams.get("bestseller") === "true")
			result = result.filter((p) => p.is_bestseller);
		if (searchParams.get("newarrival") === "true")
			result = result.filter((p) => p.is_new_arrival);

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter((p) => p.name.toLowerCase().includes(query));
		}

		result = result.filter((p) => getActivePrice(p) <= maxPrice);

		if (selectedBrands.length > 0) {
			result = result.filter(
				(p) => p.brands && selectedBrands.includes(p.brands.slug),
			);
		}

		if (selectedCategories.length > 0) {
			result = result.filter((p) => {
				const pCats = p.product_categories.map((pc) => pc.categories.slug);
				return selectedCategories.some((sc) => pCats.includes(sc));
			});
		}

		if (selectedSkinTypes.length > 0) {
			result = result.filter((p) => {
				const pSkins = p.product_skin_types.map((pst) => pst.skin_types.slug);
				return selectedSkinTypes.some((sst) => pSkins.includes(sst));
			});
		}

		if (sortRule === "newest") {
			result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
		} else if (sortRule === "price-low") {
			result.sort((a, b) => getActivePrice(a) - getActivePrice(b));
		} else if (sortRule === "price-high") {
			result.sort((a, b) => getActivePrice(b) - getActivePrice(a));
		}

		setFilteredProducts(result);
	}, [
		allProducts,
		searchQuery,
		selectedBrands,
		selectedCategories,
		selectedSkinTypes,
		maxPrice,
		sortRule,
		searchParams,
	]);

	const handleCheckbox = (slug, list, setList) => {
		if (list.includes(slug)) {
			setList(list.filter((item) => item !== slug));
		} else {
			setList([...list, slug]);
		}
	};

	const clearFilters = () => {
		setSearchQuery("");
		setSelectedBrands([]);
		setSelectedCategories([]);
		setSelectedSkinTypes([]);
		setMaxPrice(absoluteMaxPrice);
		setSortRule("newest");
		setSearchParams({}); // Wipes URL clean
	};

	return (
		<main style={styles.pageWrapper}>
			<style>{`
                .shop-layout { display: flex; flex-direction: column; gap: 32px; }
                .sidebar-wrapper { width: 100%; }
                .shop-sidebar { display: ${isFilterOpen ? "flex" : "none"}; flex-direction: column; gap: 32px; width: 100%; position: relative; height: auto; top: 0; }
                .mobile-filter-btn { display: block; width: 100%; padding: 14px; background: var(--ink); color: white; border: none; border-radius: 8px; font-family: var(--font-sans); font-size: 14px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; cursor: pointer; margin-bottom: 24px; transition: 0.2s; }
                .top-bar-controls { display: flex; flex-direction: column; gap: 16px; align-items: stretch; margin-bottom: 32px; }
                .search-wrapper { width: 100%; }
                .shop-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }

                /* Desktop View Setup */
                @media (min-width: 900px) {
                    .shop-layout { flex-direction: row; gap: 48px; }
                    .sidebar-wrapper { width: 260px; flex-shrink: 0; }
                    .shop-sidebar { display: flex !important; width: 100%; position: sticky; top: 40px; height: calc(100vh - 80px); overflow-y: auto; padding-right: 16px; }
                    .mobile-filter-btn { display: none; }
                    .top-bar-controls { flex-direction: row; justify-content: space-between; align-items: center; }
                    .search-wrapper { width: 400px; }
                    .shop-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 32px; }
                }

                /* Custom Scrollbar for the Sidebar */
                .shop-sidebar::-webkit-scrollbar { width: 6px; }
                .shop-sidebar::-webkit-scrollbar-track { background: transparent; }
                .shop-sidebar::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }
                .shop-sidebar::-webkit-scrollbar-thumb:hover { background: #c0c0c0; }
            `}</style>

			<div style={styles.header}>
				<h1 style={styles.title}>{storeSettings.shop_title}</h1>
				<p style={styles.subtitle}>{storeSettings.shop_subtitle}</p>
			</div>

			<div className="shop-layout">
				<div className="sidebar-wrapper">
					<button
						className="mobile-filter-btn"
						onClick={() => setIsFilterOpen(!isFilterOpen)}
					>
						{isFilterOpen ? "Close Filters" : "Filter & Sort"}
					</button>

					<aside className="shop-sidebar">
						<div style={styles.filterSection}>
							<h3 style={styles.filterTitle}>Max Price: ৳{maxPrice}</h3>
							<input
								type="range"
								min="0"
								max={absoluteMaxPrice}
								value={maxPrice}
								onChange={(e) => setMaxPrice(Number(e.target.value))}
								style={styles.slider}
							/>
							<div style={styles.sliderLabels}>
								<span>৳0</span>
								<span>৳{absoluteMaxPrice}</span>
							</div>
						</div>

						{brandsList.length > 0 && (
							<div style={styles.filterSection}>
								<h3 style={styles.filterTitle}>Brands</h3>
								<div style={styles.checkboxGroup}>
									{brandsList.map((brand) => (
										<label key={brand.slug} style={styles.checkboxLabel}>
											<input
												type="checkbox"
												checked={selectedBrands.includes(brand.slug)}
												onChange={() =>
													handleCheckbox(
														brand.slug,
														selectedBrands,
														setSelectedBrands,
													)
												}
												style={styles.checkbox}
											/>
											{brand.name}
										</label>
									))}
								</div>
							</div>
						)}

						{categoriesList.length > 0 && (
							<div style={styles.filterSection}>
								<h3 style={styles.filterTitle}>Categories</h3>
								<div style={styles.checkboxGroup}>
									{categoriesList.map((cat) => (
										<label key={cat.slug} style={styles.checkboxLabel}>
											<input
												type="checkbox"
												checked={selectedCategories.includes(cat.slug)}
												onChange={() =>
													handleCheckbox(
														cat.slug,
														selectedCategories,
														setSelectedCategories,
													)
												}
												style={styles.checkbox}
											/>
											{cat.name}
										</label>
									))}
								</div>
							</div>
						)}

						{skinTypesList.length > 0 && (
							<div style={styles.filterSection}>
								<h3 style={styles.filterTitle}>Skin Concern</h3>
								<div style={styles.checkboxGroup}>
									{skinTypesList.map((skin) => (
										<label key={skin.slug} style={styles.checkboxLabel}>
											<input
												type="checkbox"
												checked={selectedSkinTypes.includes(skin.slug)}
												onChange={() =>
													handleCheckbox(
														skin.slug,
														selectedSkinTypes,
														setSelectedSkinTypes,
													)
												}
												style={styles.checkbox}
											/>
											{skin.name}
										</label>
									))}
								</div>
							</div>
						)}

						<button onClick={clearFilters} style={styles.clearBtn}>
							Clear All Filters
						</button>
					</aside>
				</div>

				<div style={{ flex: 1, minWidth: 0 }}>
					<div className="top-bar-controls">
						<div className="search-wrapper">
							<input
								type="text"
								placeholder="Search products..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								style={styles.searchInput}
							/>
						</div>

						<div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
							<span style={styles.resultsCount}>
								{filteredProducts.length}{" "}
								{filteredProducts.length === 1 ? "result" : "results"}
							</span>
							<select
								value={sortRule}
								onChange={(e) => setSortRule(e.target.value)}
								style={styles.sortSelect}
							>
								<option value="newest">Sort by: Newest</option>
								<option value="price-low">Price: Low to High</option>
								<option value="price-high">Price: High to Low</option>
							</select>
						</div>
					</div>

					{loading ? (
						<div style={styles.emptyState}>[ LOADING CATALOG... ]</div>
					) : filteredProducts.length === 0 ? (
						<div style={styles.emptyState}>
							<h3>No products match your filters.</h3>
							<p>Try expanding your search or clearing some filters.</p>
							<button
								onClick={clearFilters}
								style={{ ...styles.clearBtn, width: "auto", marginTop: "16px" }}
							>
								Clear Filters
							</button>
						</div>
					) : (
						<div className="shop-grid">
							{filteredProducts.map((product) => (
								<ShopProductCard key={product.id} product={product} />
							))}
						</div>
					)}
				</div>
			</div>
		</main>
	);
}

const styles = {
	pageWrapper: {
		maxWidth: "1400px",
		margin: "0 auto",
		padding: "40px 24px",
		minHeight: "80vh",
	},
	header: {
		textAlign: "center",
		marginBottom: "32px",
		paddingBottom: "32px",
		borderBottom: "1px solid var(--border)",
	},
	title: {
		fontFamily: "var(--font-serif)",
		fontSize: "40px",
		color: "var(--ink)",
		margin: "0 0 12px 0",
	},
	subtitle: {
		fontFamily: "var(--font-sans)",
		fontSize: "16px",
		color: "var(--stone)",
		margin: 0,
	},

	filterSection: { display: "flex", flexDirection: "column", gap: "16px" },
	filterTitle: {
		fontFamily: "var(--font-serif)",
		fontSize: "18px",
		color: "var(--ink)",
		margin: 0,
	},

	searchInput: {
		width: "100%",
		padding: "12px 16px",
		borderRadius: "8px",
		border: "1px solid var(--border)",
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		outline: "none",
		boxSizing: "border-box",
		background: "#fafafa",
	},

	slider: { width: "100%", cursor: "pointer", accentColor: "var(--ink)" },
	sliderLabels: {
		display: "flex",
		justifyContent: "space-between",
		fontFamily: "var(--font-mono)",
		fontSize: "12px",
		color: "var(--stone)",
	},

	checkboxGroup: {
		display: "flex",
		flexDirection: "column",
		gap: "12px",
		maxHeight: "200px",
		overflowY: "auto",
		paddingRight: "8px",
	},
	checkboxLabel: {
		display: "flex",
		alignItems: "center",
		gap: "10px",
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		color: "var(--stone)",
		cursor: "pointer",
		transition: "color 0.2s",
	},
	checkbox: {
		width: "16px",
		height: "16px",
		accentColor: "var(--ink)",
		cursor: "pointer",
	},

	clearBtn: {
		width: "100%",
		padding: "12px",
		background: "transparent",
		border: "1px solid var(--ink)",
		color: "var(--ink)",
		fontFamily: "var(--font-sans)",
		fontSize: "13px",
		fontWeight: 500,
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		borderRadius: "8px",
		cursor: "pointer",
		transition: "all 0.2s",
	},

	resultsCount: {
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		color: "var(--stone)",
	},
	sortSelect: {
		padding: "12px 16px",
		borderRadius: "8px",
		border: "1px solid var(--border)",
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		color: "var(--ink)",
		outline: "none",
		cursor: "pointer",
		background: "#fafafa",
	},

	emptyState: {
		textAlign: "center",
		padding: "80px 20px",
		color: "var(--stone)",
		fontFamily: "var(--font-sans)",
	},
};
