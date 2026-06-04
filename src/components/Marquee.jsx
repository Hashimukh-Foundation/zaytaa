import { useSettings } from "../context/SettingsContext";
import "./Marquee.css";

export default function Marquee() {
	const { settings } = useSettings();

	const raw =
		settings.marquee_items || "Cruelty Free ✦ Vegan Certified ✦ Clean Formulas";
	// Repeat items so the scroll looks infinite
	const items = [...raw.split(" ✦ "), ...raw.split(" ✦ ")];

	return (
		<div
			style={{
				borderTop: "0.5px solid var(--border)",
				borderBottom: "0.5px solid var(--border)",
				overflow: "hidden",
				padding: "12px 0",
				background: "var(--white)",
			}}
		>
			<div className="marquee-track">
				{items.map((item, i) => (
					<span
						key={i}
						style={{
							fontFamily: "var(--font-sans)",
							fontSize: "12px",
							fontWeight: 400,
							letterSpacing: "0.1em",
							color: "var(--stone)",
							whiteSpace: "nowrap",
							padding: "0 28px",
						}}
					>
						{item.trim()} &nbsp;✦
					</span>
				))}
			</div>
		</div>
	);
}
