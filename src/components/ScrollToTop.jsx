import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
	// 1. We now grab BOTH the path (/shop) and the search params (?cat=makeup)
	const { pathname, search } = useLocation();

	useEffect(() => {
		// 2. Tell the browser to turn off its automatic "snap back" memory
		if ("scrollRestoration" in window.history) {
			window.history.scrollRestoration = "manual";
		}

		// 3. Force the window to the very top left
		window.scrollTo(0, 0);
	}, [pathname, search]); // 4. Run this whenever the path OR the search params change

	return null;
}
