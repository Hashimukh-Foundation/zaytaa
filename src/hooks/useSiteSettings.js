import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";

export function useSiteSettings() {
	const [settings, setSettings] = useState({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchSettings() {
			const { data, error } = await supabase
				.from("site_settings")
				.select("key, value");

			if (!error && data) {
				const map = {};
				data.forEach((row) => {
					map[row.key] = row.value;
				});
				setSettings(map);
			}
			setLoading(false);
		}
		fetchSettings();
	}, []);

	return { settings, loading };
}
