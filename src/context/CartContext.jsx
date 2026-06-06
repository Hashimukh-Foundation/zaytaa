import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
	// 1. Initialize cart from localStorage so it survives page refreshes
	const [cart, setCart] = useState(() => {
		const savedCart = localStorage.getItem("axiolab_cart");
		return savedCart ? JSON.parse(savedCart) : [];
	});

	// 2. Auto-save to localStorage whenever the cart changes
	useEffect(() => {
		localStorage.setItem("axiolab_cart", JSON.stringify(cart));
	}, [cart]);

	// 3. Add to Cart Logic
	const addToCart = (product, variant, quantity) => {
		setCart((prevCart) => {
			// Create a unique ID combining product and variant (so large and small sizes don't merge)
			const cartItemId = variant ? `${product.id}-${variant.id}` : product.id;
			const existingItem = prevCart.find(
				(item) => item.cartItemId === cartItemId,
			);

			if (existingItem) {
				// If it's already in the cart, just increase the quantity
				return prevCart.map((item) =>
					item.cartItemId === cartItemId
						? { ...item, quantity: item.quantity + quantity }
						: item,
				);
			} else {
				// If it's new, figure out the correct price and add it
				const price = variant
					? variant.sale_price || variant.price
					: product.sale_price || product.price;

				return [
					...prevCart,
					{
						cartItemId,
						product_id: product.id,
						variant_id: variant ? variant.id : null,
						name: product.name,
						variant_name: variant ? variant.name : null,
						price: price,
						image: product.product_images?.[0]?.url || "/placeholder.jpg",
						quantity: quantity,
						maxStock: variant ? variant.stock_quantity : product.stock_quantity,
					},
				];
			}
		});
	};

	// 4. Cart Modifiers
	const removeFromCart = (cartItemId) => {
		setCart((prevCart) =>
			prevCart.filter((item) => item.cartItemId !== cartItemId),
		);
	};

	const updateQuantity = (cartItemId, newQuantity) => {
		if (newQuantity < 1) return; // Prevent negative quantities
		setCart((prevCart) =>
			prevCart.map((item) =>
				item.cartItemId === cartItemId
					? { ...item, quantity: newQuantity }
					: item,
			),
		);
	};

	const clearCart = () => setCart([]);

	// 5. Automatic Calculations
	const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
	const cartTotal = cart.reduce(
		(total, item) => total + item.price * item.quantity,
		0,
	);

	return (
		<CartContext.Provider
			value={{
				cart,
				addToCart,
				removeFromCart,
				updateQuantity,
				clearCart,
				cartCount,
				cartTotal,
			}}
		>
			{children}
		</CartContext.Provider>
	);
}

// Custom hook to make importing it easier in other files
export const useCart = () => useContext(CartContext);
