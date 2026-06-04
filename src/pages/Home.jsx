import Hero from "../components/Hero";
import Marquee from "../components/Marquee";
import ProductSection from "../components/ProductSection";
import Newsletter from "../components/Newsletter";
import ShopByCategories from "../components/ShopByCategories";
import SkinType from "../components/SkinType";
import ShopByBrands from "../components/ShopByBrands";

export default function Home() {
	return (
		<>
			<Hero />
			<Marquee />

			{/* 1. Looks for is_featured = true */}
			<ProductSection
				title="Featured Collection"
				subtitle="Curated for you"
				filterType="featured"
				viewAllLink="/shop?featured=true"
			/>

			{/* 2. Looks for is_bestseller = true */}
			<ProductSection
				title="Best Sellers"
				filterType="bestseller"
				viewAllLink="/shop?bestseller=true"
			/>

			<ShopByCategories />

			{/* 3. Looks for is_new_arrival = true */}
			<ProductSection
				title="New Arrivals"
				filterType="newarrival"
				viewAllLink="/shop?newarrival=true"
			/>

			<SkinType />
			<ShopByBrands />
			<Newsletter />
		</>
	);
}
