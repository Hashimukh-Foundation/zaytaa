import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function MultiImageUpload({ onUploadComplete }) {
	const [uploading, setUploading] = useState(false);

	async function handleImageUpload(event) {
		try {
			setUploading(true);

			// Grab ALL files selected by the user
			const files = Array.from(event.target.files);
			if (files.length === 0) return;

			const uploadedUrls = [];

			// Loop through each file and upload it to Supabase Storage
			for (const file of files) {
				const fileExt = file.name.split(".").pop();
				const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
				const filePath = `public/${fileName}`;

				const { error: uploadError } = await supabase.storage
					.from("images")
					.upload(filePath, file);

				if (uploadError) throw uploadError;

				const { data } = supabase.storage.from("images").getPublicUrl(filePath);

				uploadedUrls.push(data.publicUrl);
			}

			// Send the array of URLs back to the AdminProducts form
			if (onUploadComplete) {
				onUploadComplete(uploadedUrls);
			}

			// Clear the file input so the user can select more files if needed
			event.target.value = "";
		} catch (error) {
			console.error("Error uploading images:", error.message);
			alert("Error uploading image. Check console.");
		} finally {
			setUploading(false);
		}
	}

	return (
		<div
			style={{
				padding: "20px",
				border: "1px dashed var(--border)",
				borderRadius: "8px",
				background: "#fafafa", // Added a slight background color to separate it from the previews
			}}
		>
			<label
				style={{
					display: "block",
					marginBottom: "12px",
					fontFamily: "var(--font-sans)",
				}}
			>
				Upload Product Gallery (Select multiple)
			</label>

			<input
				type="file"
				accept="image/*"
				multiple
				onChange={handleImageUpload}
				disabled={uploading}
			/>

			{uploading && (
				<p style={{ color: "var(--stone)", marginTop: "12px" }}>
					Uploading to Supabase...
				</p>
			)}
		</div>
	);
}
