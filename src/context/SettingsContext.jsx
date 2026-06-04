import { createContext, useContext } from "react";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { usePromotions } from "../hooks/useProducts";

const SettingsContext = createContext({});

export function SettingsProvider({ children }) {
	const { settings, loading: settingsLoading } = useSiteSettings();
	const { promotion, loading: promoLoading } = usePromotions();
	return (
		<SettingsContext.Provider value={{ settings, promotion }}>
			{settingsLoading || promoLoading ? null : children}
		</SettingsContext.Provider>
	);
}

export function useSettings() {
	return useContext(SettingsContext);
}
