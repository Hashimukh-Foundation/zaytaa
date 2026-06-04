import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setUser(session?.user ?? null);
			setLoading(false);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});

		return () => subscription.unsubscribe();
	}, []);

	const signIn = async (email, password) => {
		return await supabase.auth.signInWithPassword({ email, password });
	};

	const signUp = async (email, password, fullName) => {
		return await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { full_name: fullName }, // Saves their name in Supabase!
			},
		});
	};

	const signOut = async () => {
		return await supabase.auth.signOut();
	};

	return (
		<AuthContext.Provider value={{ user, signIn, signUp, signOut, loading }}>
			{!loading && children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => {
	return useContext(AuthContext);
};
