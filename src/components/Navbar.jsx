import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // Ensure path is correct
import { useCart } from "../context/CartContext";

export default function Navbar() {
	const navigate = useNavigate();

	// --- Search States ---
	const [searchQuery, setSearchQuery] = useState("");
	const [suggestions, setSuggestions] = useState([]);
	const [isFocused, setIsFocused] = useState(false);
	const searchRef = useRef(null);
	const { cartCount } = useCart();
	// --- Placeholder Animation ---
	const placeholders = [
		"Search 'Cleanser'...",
		"Search 'Moisturizer'...",
		"Find your routine...",
		"Search 'Vitamin C'...",
	];
	const [placeholderIndex, setPlaceholderIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
		}, 3000); // Changes every 3 seconds
		return () => clearInterval(interval);
	}, [placeholders.length]);

	// --- Live Search Logic (Debounced) ---
	useEffect(() => {
		const fetchSuggestions = async () => {
			if (searchQuery.trim().length < 2) {
				setSuggestions([]);
				return;
			}

			// Fetch matching products from Supabase
			const { data, error } = await supabase
				.from("products")
				.select("name, slug, product_images(url)")
				.ilike("name", `%${searchQuery}%`)
				.limit(5); // Show top 5 results max

			if (!error && data) {
				setSuggestions(data);
			}
		};

		const timer = setTimeout(fetchSuggestions, 300); // 300ms debounce
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// --- Handlers ---
	const handleSearchSubmit = (e) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			setIsFocused(false);
			setSearchQuery("");
			navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
		}
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (searchRef.current && !searchRef.current.contains(event.target)) {
				setIsFocused(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const navLinks = [
		{ label: "Shop All", url: "/shop" },
		{ label: "Bestsellers", url: "/shop?bestseller=true" },
		{ label: "New Arrivals", url: "/shop?newarrival=true" },
		{ label: "Track Order", url: "/track-order" },
		{ label: "About", url: "/product/overnight-resurfacing-peel" },
	];

	return (
		<nav className="axio-nav">
			<style>{`
                .axio-nav {
                    position: sticky;
                    top: 0;
                    z-index: 999;
                    background: var(--white);
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 24px;
                    height: 80px;
                    gap: 24px;
                }

                /* Left Side: Logo & Links */
                .nav-left {
                    display: flex;
                    align-items: center;
                    gap: 40px;
                }
                .logo {
                    font-family: var(--font-serif);
                    font-size: 22px;
                    font-weight: 700;
                    letter-spacing: 0.15em;
                    color: var(--ink);
                    text-decoration: none;
                    text-transform: uppercase;
                }
                .nav-links {
                    display: flex;
                    gap: 24px;
                }
                .nav-link {
                    font-family: var(--font-sans);
                    font-size: 13px;
                    font-weight: 500;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    color: var(--stone);
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .nav-link:hover, .nav-link.active {
                    color: var(--ink);
                }

                /* Right Side: Search & Actions */
                .nav-right {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    flex: 1;
                    justify-content: flex-end;
                }

                /* Search Bar */
                .search-container {
                    position: relative;
                    width: 100%;
                    max-width: 320px;
                }
                .search-form {
                    display: flex;
                    align-items: center;
                    background: #fcfbf8;
                    border: 1px solid var(--green);
                    border-radius: 100px;
                    padding: 6px 16px;
                    transition: border-color 0.2s;
                }
                .search-form:focus-within {
                    border-color: var(--ink);
                }
                .search-input {
                    border: none;
                    background: transparent;
                    outline: none;
                    width: 100%;
                    font-family: var(--font-sans);
                    font-size: 14px;
                    color: var(--ink);
                    padding: 4px 0;
                }
                .search-input::placeholder {
                    color: #a8a29e;
                    transition: opacity 0.3s ease;
                }
                .search-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--stone);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                }

                /* Search Dropdown */
                .search-dropdown {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 0;
                    width: 100%;
                    background: var(--white);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .suggestion-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    text-decoration: none;
                    border-bottom: 1px solid #f4f3f0;
                    transition: background 0.2s;
                }
                .suggestion-item:last-child {
                    border-bottom: none;
                }
                .suggestion-item:hover {
                    background: #fcfbf8;
                }
                .suggestion-img {
                    width: 40px;
                    height: 40px;
                    border-radius: 4px;
                    object-fit: cover;
                    background: #f4f3f0;
                }
                .suggestion-text {
                    font-family: var(--font-sans);
                    font-size: 13px;
                    color: var(--ink);
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .no-results {
                    padding: 16px;
                    font-family: var(--font-sans);
                    font-size: 13px;
                    color: var(--stone);
                    text-align: center;
                }

                /* Actions */
                .action-button {
                    background: none;
                    border: none;
                    font-family: var(--font-sans);
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--ink);
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    cursor: pointer;
                }

                /* Mobile Adjustments */
                @media (max-width: 900px) {
                    .nav-links { display: none; }
                }
                @media (max-width: 600px) {
                    .axio-nav { padding: 0 16px; gap: 12px; }
                    .logo { font-size: 18px; }
                    .search-container { position: static; } /* Drops menu full width on mobile */
                    .search-dropdown { top: 80px; border-radius: 0; border-left: none; border-right: none; }
                }
            `}</style>

			<div className="nav-left">
				<Link to="/" className="logo">
					Zaytaa
				</Link>

				<div className="nav-links">
					{navLinks.map((link) => (
						<NavLink
							key={link.url}
							to={link.url}
							className={({ isActive }) =>
								isActive ? "nav-link active" : "nav-link"
							}
						>
							{link.label}
						</NavLink>
					))}
				</div>
			</div>

			<div className="nav-right">
				<div className="search-container" ref={searchRef}>
					<form className="search-form" onSubmit={handleSearchSubmit}>
						<input
							type="text"
							className="search-input"
							placeholder={placeholders[placeholderIndex]}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onFocus={() => setIsFocused(true)}
						/>
						<button type="submit" className="search-btn">
							<SearchIcon />
						</button>
					</form>

					{/* Auto-Suggest Dropdown */}
					{isFocused && searchQuery.trim().length >= 2 && (
						<div className="search-dropdown">
							{suggestions.length > 0 ? (
								suggestions.map((prod) => (
									<Link
										key={prod.slug}
										to={`/product/${prod.slug}`}
										className="suggestion-item"
										onClick={() => {
											setIsFocused(false);
											setSearchQuery("");
										}}
									>
										<img
											src={prod.product_images?.[0]?.url || "/placeholder.jpg"}
											alt={prod.name}
											className="suggestion-img"
										/>
										<span className="suggestion-text">{prod.name}</span>
									</Link>
								))
							) : (
								<div className="no-results">No products found.</div>
							)}
						</div>
					)}
				</div>

				<button className="action-button" onClick={() => navigate("/checkout")}>
					Bag ({cartCount})
				</button>
			</div>
		</nav>
	);
}

// Simple magnifying glass icon
const SearchIcon = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<circle cx="11" cy="11" r="8"></circle>
		<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
	</svg>
);
