import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";

export function usePromotions() {
	const [promotion, setPromotion] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchPromotion() {
			const { data, error } = await supabase
				.from("promotions")
				.select("*")
				.eq("is_active", true)
				.single();

			if (!error && data) {
				setPromotion(data);
			}

			setLoading(false);
		}
		fetchPromotion();
	}, []);

	return { promotion, loading };
}
