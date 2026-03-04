import type { Metadata } from 'next';
import './globals.css';

const title = 'Hot Symbols — Special characters at your fingertips';
const description =
	"Free menu-bar app for macOS & Windows. Click any symbol — arrows, math, Greek, currency, typography — and it's instantly copied to your clipboard.";
const url = 'https://hot.keireira.com';

export const metadata: Metadata = {
	title,
	description,
	icons: {
		icon: [
			{ url: '/icon.svg', type: 'image/svg+xml' },
			{ url: '/icon.png', type: 'image/png', sizes: '512x512' }
		],
		apple: '/icon.png'
	},
	metadataBase: new URL(url),
	keywords: [
		'special characters',
		'symbols',
		'unicode',
		'menu bar app',
		'clipboard',
		'macOS',
		'Windows',
		'arrows',
		'math symbols',
		'Greek letters',
		'currency symbols',
		'typography',
		'em dash',
		'hot symbols'
	],
	authors: [{ name: 'Alena Dzhukich', url: 'https://github.com/keireira' }],
	creator: 'Alena Dzhukich',
	openGraph: {
		type: 'website',
		url,
		title,
		description,
		siteName: 'Hot Symbols',
		locale: 'en_US'
	},
	twitter: {
		card: 'summary',
		title,
		description
	},
	verification: {
		google: 'Cj30a1A0twH2qByyYvjZN3DVXIjXfauCwiwdvvRxA5A',
		yandex: '3cb3aab462433020',
		other: { 'msvalidate.01': '3A462101A39B3D8942CC0B7F469D39F0' }
	},
	alternates: {
		canonical: url
	}
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
