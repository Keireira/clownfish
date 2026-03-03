import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
	title: 'Hot Symbols — Unicode symbols at your fingertips',
	description:
		'macOS menu-bar utility for quick access to Unicode symbols, emoji, and special characters. Lightweight, customizable, and beautiful.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
