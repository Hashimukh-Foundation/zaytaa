import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import MultiImageUpload from "../../components/MultiImageUpload";

export default function AdminProducts() {
	const [products, setProducts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [skinTypes, setSkinTypes] = useState([]);
	const [brands, setBrands] = useState([]);
	const [selectedBrand, setSelectedBrand] = useState("");
	const [loading, setLoading] = useState(true);

	// ---> NEW: Search State
	const [searchQuery, setSearchQuery] = useState("");

	const [isAdding, setIsAdding] = useState(false);
	const [editingId, setEditingId] = useState(null);

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState("");
	const [salePrice, setSalePrice] = useState("");
	const [stock, setStock] = useState(0);

	const [isFeatured, setIsFeatured] = useState(false);
	const [isBestseller, setIsBestseller] = useState(false);
	const [isNewArrival, setIsNewArrival] = useState(false);

	const [imageUrls, setImageUrls] = useState([]);
	const [variants, setVariants] = useState([]);
	const [saving, setSaving] = useState(false);

	const [selectedCategories, setSelectedCategories] = useState([]);
	const [selectedSkinTypes, setSelectedSkinTypes] = useState([]);

	const fetchData = async () => {
		setLoading(true);

		const { data: catData } = await supabase
			.from("categories")
			.select("id, name");
		if (catData) setCategories(catData);

		const { data: skinData } = await supabase
			.from("skin_types")
			.select("id, name");
		if (skinData) setSkinTypes(skinData);

		const { data: brandData } = await supabase
			.from("brands")
			.select("id, name");
		if (brandData) setBrands(brandData);

		const { data: prodData, error } = await supabase
			.from("products")
			.select(
				`
				*,
				brands ( id, name ),
				product_images ( url, is_primary ),
				product_categories ( categories ( id, name ) ),
				product_skin_types ( skin_types ( id, name ) ),
                product_variants ( id, name, price, sale_price, stock_quantity )
			`,
			)
			.order("created_at", { ascending: false });

		if (error) console.error("Error fetching products:", error);
		else setProducts(prodData);

		setLoading(false);
	};

	useEffect(() => {
		fetchData();
	}, []);

	const handleCheckboxChange = (id, list, setList) => {
		if (list.includes(id)) setList(list.filter((item) => item !== id));
		else setList([...list, id]);
	};

	const addVariant = () => {
		setVariants([
			...variants,
			{ name: "", price: "", sale_price: "", stock_quantity: 0 },
		]);
	};

	const removeVariant = (indexToRemove) => {
		setVariants(variants.filter((_, index) => index !== indexToRemove));
	};

	const handleVariantChange = (index, field, value) => {
		const newVariants = [...variants];
		newVariants[index][field] = value;
		setVariants(newVariants);
	};

	const resetForm = () => {
		setName("");
		setDescription("");
		setPrice("");
		setSalePrice("");
		setStock(0);
		setIsFeatured(false);
		setIsBestseller(false);
		setIsNewArrival(false);
		setImageUrls([]);
		setVariants([]);
		setSelectedCategories([]);
		setSelectedSkinTypes([]);
		setEditingId(null);
		setIsAdding(false);
		setSelectedBrand("");
	};

	const handleEdit = (product) => {
		setEditingId(product.id);
		setName(product.name);
		setDescription(product.description || "");
		setPrice(product.price);
		setSalePrice(product.sale_price || "");
		setStock(product.stock_quantity || 0);
		setSelectedBrand(product.brand_id || "");
		setIsFeatured(product.is_featured);
		setIsBestseller(product.is_bestseller);
		setIsNewArrival(product.is_new_arrival);

		const catIds = product.product_categories.map((pc) => pc.categories.id);
		setSelectedCategories(catIds);

		const skinIds = product.product_skin_types.map((pst) => pst.skin_types.id);
		setSelectedSkinTypes(skinIds);

		if (product.product_images) {
			const sortedImages = [...product.product_images].sort((a, b) =>
				b.is_primary ? 1 : -1,
			);
			setImageUrls(sortedImages.map((img) => img.url));
		} else {
			setImageUrls([]);
		}

		if (product.product_variants) {
			setVariants(product.product_variants);
		} else {
			setVariants([]);
		}

		setIsAdding(true);
		window.scrollTo(0, 0);
	};

	const handleSave = async (e) => {
		e.preventDefault();
		if (selectedCategories.length === 0)
			return alert("Please select at least one category.");
		setSaving(true);

		const slug = name
			.toLowerCase()
			.trim()
			.replace(/[\s\W-]+/g, "-");

		const productData = {
			name,
			slug,
			description,
			price: parseFloat(price),
			sale_price: salePrice ? parseFloat(salePrice) : null,
			stock_quantity: parseInt(stock, 10) || 0,
			brand_id: selectedBrand || null,
			is_featured: isFeatured,
			is_bestseller: isBestseller,
			is_new_arrival: isNewArrival,
		};

		let productId = editingId;

		if (editingId) {
			const { error } = await supabase
				.from("products")
				.update(productData)
				.eq("id", editingId);
			if (error) {
				alert("Error updating product");
				setSaving(false);
				return;
			}
		} else {
			const { data: newProduct, error } = await supabase
				.from("products")
				.insert([productData])
				.select()
				.single();
			if (error) {
				alert("Error saving product");
				setSaving(false);
				return;
			}
			productId = newProduct.id;
		}

		if (productId) {
			await supabase
				.from("product_categories")
				.delete()
				.eq("product_id", productId);
			await supabase
				.from("product_skin_types")
				.delete()
				.eq("product_id", productId);

			if (selectedCategories.length > 0) {
				const catInserts = selectedCategories.map((catId) => ({
					product_id: productId,
					category_id: catId,
				}));
				await supabase.from("product_categories").insert(catInserts);
			}
			if (selectedSkinTypes.length > 0) {
				const skinInserts = selectedSkinTypes.map((skinId) => ({
					product_id: productId,
					skin_type_id: skinId,
				}));
				await supabase.from("product_skin_types").insert(skinInserts);
			}

			await supabase
				.from("product_images")
				.delete()
				.eq("product_id", productId);
			if (imageUrls.length > 0) {
				const imageInserts = imageUrls.map((url, index) => ({
					product_id: productId,
					url: url,
					is_primary: index === 0,
				}));
				await supabase.from("product_images").insert(imageInserts);
			}

			await supabase
				.from("product_variants")
				.delete()
				.eq("product_id", productId);
			if (variants.length > 0) {
				const variantInserts = variants.map((v) => ({
					product_id: productId,
					name: v.name,
					price: parseFloat(v.price),
					sale_price: v.sale_price ? parseFloat(v.sale_price) : null,
					stock_quantity: parseInt(v.stock_quantity, 10) || 0,
				}));
				await supabase.from("product_variants").insert(variantInserts);
			}
		}

		setSaving(false);
		resetForm();
		fetchData();
	};

	const handleDelete = async (id, productName) => {
		if (!window.confirm(`Delete "${productName}" forever?`)) return;
		const { error } = await supabase.from("products").delete().eq("id", id);
		if (error) alert("Error deleting product: " + error.message);
		else fetchData();
	};

	// ---> NEW: Filter Logic for Search Bar
	const filteredProducts = products.filter(
		(product) =>
			product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(product.brands &&
				product.brands.name.toLowerCase().includes(searchQuery.toLowerCase())),
	);

	if (isAdding) {
		// ... (Keep your EXACT form code here. It is perfect and requires no changes.)
		// Just for brevity in this response, imagine your entire <form> block is right here!
		return (
			<div>
				<div style={styles.header}>
					<h2 style={styles.title}>
						{editingId ? "Edit Product" : "Add New Product"}
					</h2>
					<button onClick={resetForm} style={styles.btnSecondary}>
						Cancel
					</button>
				</div>
				<form onSubmit={handleSave} style={styles.formCard}>
					{/* Your exact form code goes here */}
					<div style={styles.inputRow}>
						<div style={styles.inputGroup}>
							<label style={styles.label}>Product Name</label>
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								style={styles.input}
								required
							/>
						</div>
					</div>
					<div style={styles.inputGroup}>
						<label style={styles.label}>Brand</label>
						<select
							value={selectedBrand}
							onChange={(e) => setSelectedBrand(e.target.value)}
							style={styles.input}
						>
							<option value="">No Brand / Default</option>
							{brands.map((b) => (
								<option key={b.id} value={b.id}>
									{b.name}
								</option>
							))}
						</select>
					</div>
					<div style={styles.inputRow}>
						<div style={styles.inputGroup}>
							<label style={styles.label}>Base Price ($)</label>
							<input
								type="number"
								step="0.01"
								value={price}
								onChange={(e) => setPrice(e.target.value)}
								style={styles.input}
								required
							/>
						</div>
						<div style={styles.inputGroup}>
							<label style={styles.label}>Base Sale Price (Optional)</label>
							<input
								type="number"
								step="0.01"
								value={salePrice}
								onChange={(e) => setSalePrice(e.target.value)}
								style={styles.input}
							/>
						</div>
						<div style={styles.inputGroup}>
							<label style={styles.label}>Base Stock Qty</label>
							<input
								type="number"
								value={stock}
								onChange={(e) => setStock(e.target.value)}
								style={styles.input}
								required
							/>
						</div>
					</div>
					<div style={styles.inputGroup}>
						<label style={styles.label}>Description</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							style={{ ...styles.input, minHeight: "100px" }}
						/>
					</div>

					<div
						style={{
							...styles.inputGroup,
							background: "#fafafa",
							padding: "20px",
							borderRadius: "8px",
							border: "1px dashed var(--border)",
						}}
					>
						<label style={styles.label}>Product Variants (Optional)</label>
						{variants.map((variant, index) => (
							<div
								key={index}
								style={{
									display: "flex",
									gap: "12px",
									marginBottom: "12px",
									alignItems: "center",
								}}
							>
								<input
									type="text"
									placeholder="Variant Name"
									value={variant.name}
									onChange={(e) =>
										handleVariantChange(index, "name", e.target.value)
									}
									style={{ ...styles.input, flex: 2, margin: 0 }}
									required
								/>
								<input
									type="number"
									step="0.01"
									placeholder="Price ($)"
									value={variant.price}
									onChange={(e) =>
										handleVariantChange(index, "price", e.target.value)
									}
									style={{ ...styles.input, flex: 1, margin: 0 }}
									required
								/>
								<input
									type="number"
									step="0.01"
									placeholder="Sale ($)"
									value={variant.sale_price || ""}
									onChange={(e) =>
										handleVariantChange(index, "sale_price", e.target.value)
									}
									style={{ ...styles.input, flex: 1, margin: 0 }}
								/>
								<input
									type="number"
									placeholder="Stock"
									value={variant.stock_quantity}
									onChange={(e) =>
										handleVariantChange(index, "stock_quantity", e.target.value)
									}
									style={{ ...styles.input, flex: 1, margin: 0 }}
									required
								/>
								<button
									type="button"
									onClick={() => removeVariant(index)}
									style={styles.deleteVariantBtn}
									title="Remove Variant"
								>
									&times;
								</button>
							</div>
						))}
						<button
							type="button"
							onClick={addVariant}
							style={{
								...styles.btnSecondary,
								fontSize: "13px",
								padding: "8px 16px",
								marginTop: "8px",
								width: "fit-content",
							}}
						>
							+ Add Variant
						</button>
					</div>

					<div style={styles.inputRow}>
						<div style={styles.inputGroup}>
							<label style={styles.label}>Categories</label>
							<div style={styles.checkboxBox}>
								{categories.map((c) => (
									<label key={c.id} style={styles.checkboxLabel}>
										{" "}
										<input
											type="checkbox"
											checked={selectedCategories.includes(c.id)}
											onChange={() =>
												handleCheckboxChange(
													c.id,
													selectedCategories,
													setSelectedCategories,
												)
											}
										/>{" "}
										{c.name}{" "}
									</label>
								))}
							</div>
						</div>
						<div style={styles.inputGroup}>
							<label style={styles.label}>Skin Types</label>
							<div style={styles.checkboxBox}>
								{skinTypes.map((s) => (
									<label key={s.id} style={styles.checkboxLabel}>
										{" "}
										<input
											type="checkbox"
											checked={selectedSkinTypes.includes(s.id)}
											onChange={() =>
												handleCheckboxChange(
													s.id,
													selectedSkinTypes,
													setSelectedSkinTypes,
												)
											}
										/>{" "}
										{s.name}{" "}
									</label>
								))}
							</div>
						</div>
					</div>

					<div
						style={{
							...styles.inputGroup,
							background: "#fcfbf8",
							padding: "16px",
							borderRadius: "8px",
							border: "1px solid var(--border)",
						}}
					>
						<label style={{ ...styles.label, marginBottom: "12px" }}>
							Store Display Options
						</label>
						<div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
							<label
								style={{
									display: "flex",
									alignItems: "center",
									gap: "8px",
									cursor: "pointer",
									fontSize: "14px",
								}}
							>
								<input
									type="checkbox"
									checked={isFeatured}
									onChange={(e) => setIsFeatured(e.target.checked)}
									style={{ width: "16px", height: "16px" }}
								/>{" "}
								Featured on Homepage
							</label>
							<label
								style={{
									display: "flex",
									alignItems: "center",
									gap: "8px",
									cursor: "pointer",
									fontSize: "14px",
								}}
							>
								<input
									type="checkbox"
									checked={isBestseller}
									onChange={(e) => setIsBestseller(e.target.checked)}
									style={{ width: "16px", height: "16px" }}
								/>{" "}
								Mark as Best Seller
							</label>
							<label
								style={{
									display: "flex",
									alignItems: "center",
									gap: "8px",
									cursor: "pointer",
									fontSize: "14px",
								}}
							>
								<input
									type="checkbox"
									checked={isNewArrival}
									onChange={(e) => setIsNewArrival(e.target.checked)}
									style={{ width: "16px", height: "16px" }}
								/>{" "}
								Mark as New Arrival
							</label>
						</div>
					</div>

					<div style={styles.inputGroup}>
						<label style={styles.label}>Product Gallery</label>
						{imageUrls.length > 0 && (
							<div
								style={{
									display: "flex",
									gap: "16px",
									flexWrap: "wrap",
									marginBottom: "16px",
									padding: "16px",
									border: "1px solid var(--border)",
									borderRadius: "8px",
								}}
							>
								{imageUrls.map((url, index) => (
									<div
										key={index}
										style={{
											position: "relative",
											width: "80px",
											height: "80px",
										}}
									>
										<img
											src={url}
											alt={`Gallery ${index}`}
											style={{
												width: "100%",
												height: "100%",
												objectFit: "cover",
												borderRadius: "8px",
												border:
													index === 0
														? "2px solid var(--ink)"
														: "1px solid var(--border)",
											}}
										/>
										<button
											type="button"
											onClick={() =>
												setImageUrls(imageUrls.filter((_, i) => i !== index))
											}
											style={styles.deleteImageBtn}
										>
											&times;
										</button>
									</div>
								))}
							</div>
						)}
						<MultiImageUpload
							onUploadComplete={(urls) =>
								setImageUrls((prev) => [...prev, ...urls])
							}
						/>
					</div>

					<button type="submit" style={styles.btnPrimary} disabled={saving}>
						{saving
							? "Saving..."
							: editingId
								? "Update Product"
								: "Save Product"}
					</button>
				</form>
			</div>
		);
	}

	return (
		<div>
			{/* Header Area with Search */}
			<div style={styles.header}>
				<h2 style={styles.title}>Product Management</h2>
				<div style={{ display: "flex", gap: "16px" }}>
					<input
						type="text"
						placeholder="Search products..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						style={styles.searchInput}
					/>
					<button
						onClick={() => {
							resetForm();
							setIsAdding(true);
						}}
						style={styles.btnPrimary}
					>
						+ Add Product
					</button>
				</div>
			</div>

			{loading ? (
				<p style={{ padding: "24px" }}>Loading products...</p>
			) : filteredProducts.length === 0 ? (
				<p style={{ padding: "24px", color: "var(--stone)" }}>
					{searchQuery
						? `No products match "${searchQuery}"`
						: "No products found."}
				</p>
			) : (
				/* ---> NEW: Card Grid Layout <--- */
				<div style={styles.cardGrid}>
					{filteredProducts.map((prod) => {
						const primaryImg =
							prod.product_images?.find((img) => img.is_primary)?.url ||
							prod.product_images?.[0]?.url;
						const hasVariants =
							prod.product_variants && prod.product_variants.length > 0;
						const catNames = prod.product_categories
							.map((pc) => pc.categories.name)
							.join(", ");

						const totalStock = hasVariants
							? prod.product_variants.reduce(
									(sum, v) => sum + (v.stock_quantity || 0),
									0,
								)
							: prod.stock_quantity || 0;

						return (
							<div key={prod.id} style={styles.adminCard}>
								<div style={styles.cardImageWrapper}>
									{primaryImg ? (
										<img
											src={primaryImg}
											alt={prod.name}
											style={styles.cardImage}
										/>
									) : (
										<div style={styles.cardNoImage}>No Image</div>
									)}
									<div style={styles.cardBadges}>
										{prod.is_featured && (
											<span style={styles.badge}>Featured</span>
										)}
										{hasVariants && (
											<span
												style={{
													...styles.badge,
													background: "#e2e3e5",
													color: "#383d41",
												}}
											>
												Variants
											</span>
										)}
									</div>
								</div>

								<div style={styles.cardBody}>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "flex-start",
											marginBottom: "8px",
										}}
									>
										<div>
											<div style={styles.cardBrand}>
												{prod.brands?.name || "No Brand"}
											</div>
											<h3 style={styles.cardTitle}>{prod.name}</h3>
										</div>
									</div>

									<div style={styles.cardMeta}>
										<div style={{ color: "var(--stone)", fontSize: "12px" }}>
											{catNames || "No Category"}
										</div>

										<div
											style={{
												color: totalStock === 0 ? "#d9534f" : "var(--green)",
												fontWeight: 600,
												display: "flex",
												alignItems: "center",
												gap: "4px",
											}}
										>
											<span
												style={{
													width: "8px",
													height: "8px",
													borderRadius: "50%",
													backgroundColor:
														totalStock === 0 ? "#d9534f" : "var(--green)",
												}}
											></span>
											{totalStock} in stock
										</div>
									</div>

									<div style={styles.cardFooter}>
										<div style={styles.cardPrice}>
											{prod.sale_price ? (
												<>
													<span
														style={{
															textDecoration: "line-through",
															color: "var(--stone)",
															fontSize: "12px",
															marginRight: "6px",
														}}
													>
														${prod.price}
													</span>
													${prod.sale_price}
												</>
											) : (
												<>${prod.price}</>
											)}
										</div>
										<div style={styles.cardActions}>
											<button
												onClick={() => handleEdit(prod)}
												style={styles.editBtn}
											>
												Edit
											</button>
											<button
												onClick={() => handleDelete(prod.id, prod.name)}
												style={styles.deleteBtn}
											>
												Delete
											</button>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

const styles = {
	// Standard UI
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: "32px",
		flexWrap: "wrap",
		gap: "16px",
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
	},
	searchInput: {
		padding: "10px 16px",
		borderRadius: "8px",
		border: "1px solid var(--border)",
		fontFamily: "var(--font-sans)",
		fontSize: "14px",
		width: "250px",
		outline: "none",
	},

	// Grid System
	cardGrid: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
		gap: "24px",
	},
	adminCard: {
		background: "#fff",
		border: "1px solid var(--border)",
		borderRadius: "12px",
		overflow: "hidden",
		display: "flex",
		flexDirection: "column",
	},
	cardImageWrapper: {
		width: "100%",
		height: "180px",
		position: "relative",
		backgroundColor: "#f4f3f0",
	},
	cardImage: { width: "100%", height: "100%", objectFit: "cover" },
	cardNoImage: {
		width: "100%",
		height: "100%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: "var(--stone)",
		fontFamily: "var(--font-mono)",
		fontSize: "12px",
	},
	cardBadges: {
		position: "absolute",
		top: "8px",
		left: "8px",
		display: "flex",
		gap: "4px",
		flexWrap: "wrap",
	},
	cardBody: {
		padding: "16px",
		display: "flex",
		flexDirection: "column",
		flex: 1,
	},
	cardBrand: {
		fontFamily: "var(--font-sans)",
		fontSize: "11px",
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		color: "var(--stone)",
		marginBottom: "4px",
	},
	cardTitle: {
		fontFamily: "var(--font-serif)",
		fontSize: "18px",
		color: "var(--ink)",
		margin: 0,
		lineHeight: 1.2,
	},
	cardMeta: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: "12px",
		marginBottom: "20px",
		fontFamily: "var(--font-sans)",
		fontSize: "13px",
	},
	cardFooter: {
		marginTop: "auto",
		paddingTop: "16px",
		borderTop: "1px solid var(--border)",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
	},
	cardPrice: {
		fontFamily: "var(--font-sans)",
		fontSize: "16px",
		fontWeight: 600,
		color: "var(--ink)",
	},
	cardActions: { display: "flex", gap: "12px" },

	// Form Elements
	editBtn: {
		color: "var(--ink)",
		background: "transparent",
		border: "none",
		cursor: "pointer",
		fontSize: "13px",
		fontWeight: 600,
		padding: 0,
	},
	deleteBtn: {
		color: "#d9534f",
		background: "transparent",
		border: "none",
		cursor: "pointer",
		fontSize: "13px",
		fontWeight: 600,
		padding: 0,
	},
	formCard: {
		background: "#fff",
		border: "1px solid var(--border)",
		borderRadius: "12px",
		padding: "32px",
		maxWidth: "800px",
	},
	inputRow: { display: "flex", gap: "24px", marginBottom: "24px" },
	inputGroup: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		gap: "8px",
		marginBottom: "24px",
	},
	label: { fontSize: "14px", fontWeight: 500, color: "var(--ink)" },
	input: {
		padding: "12px 16px",
		border: "1px solid var(--border)",
		borderRadius: "8px",
		fontFamily: "var(--font-sans)",
		fontSize: "15px",
		outline: "none",
		background: "#fff",
	},
	badge: {
		background: "var(--green-light)",
		color: "var(--green)",
		fontSize: "10px",
		padding: "2px 8px",
		borderRadius: "100px",
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		display: "inline-block",
	},
	checkboxBox: {
		border: "1px solid var(--border)",
		borderRadius: "8px",
		padding: "16px",
		maxHeight: "150px",
		overflowY: "auto",
		display: "flex",
		flexDirection: "column",
		gap: "8px",
	},
	checkboxLabel: {
		display: "flex",
		alignItems: "center",
		gap: "8px",
		fontSize: "14px",
		color: "var(--stone)",
		cursor: "pointer",
	},
	deleteVariantBtn: {
		background: "#d9534f",
		color: "#fff",
		border: "none",
		borderRadius: "4px",
		width: "38px",
		height: "38px",
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		fontSize: "20px",
		flexShrink: 0,
	},
	deleteImageBtn: {
		position: "absolute",
		top: "-8px",
		right: "-8px",
		background: "#d9534f",
		color: "white",
		border: "none",
		borderRadius: "50%",
		width: "22px",
		height: "22px",
		fontSize: "14px",
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		lineHeight: 1,
		zIndex: 2,
		paddingBottom: "2px",
	},
};
