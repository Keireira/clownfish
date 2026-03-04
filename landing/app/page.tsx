'use client';

import { useLocaleDetection } from './i18n';
import { useState } from 'react';
import { usePlatform } from './lib/hooks';
import type { Platform } from './lib/types';
import Navbar from './sections/navbar';
import Hero from './sections/hero';
import HowItWorks from './sections/how-it-works';
import Features from './sections/features';
import Who from './sections/who';
import Download from './sections/download';
import Support from './sections/support';
import Footer from './sections/footer';

const Home = () => {
	useLocaleDetection();
	const userOS = usePlatform();
	const [dlOverride, setDlOverride] = useState<Platform | null>(null);
	const dlPlatform = dlOverride ?? userOS;

	return (
		<main className="relative min-h-screen overflow-x-hidden">
			<Navbar />
			<Hero userOS={userOS} setDlOverride={setDlOverride} />
			<HowItWorks />
			<Features />
			<Who />
			<Download dlPlatform={dlPlatform} setDlOverride={setDlOverride} />
			<Support />
			<Footer />
		</main>
	);
};

export default Home;
