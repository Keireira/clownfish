import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
	title: 'Hot Symbols — Gaslight everyone into thinking you use AI for texts',
	description: "⌘ → ± ∞ © and more from your menu bar. Click — and it's copied."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
