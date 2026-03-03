'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { t, LOCALES, type Locale } from './i18n';

/* ── Intersection Observer hook ── */
function useInView(threshold = 0.15) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const obs = new IntersectionObserver(
			([e]) => {
				if (e.isIntersecting) {
					setVisible(true);
					obs.disconnect();
				}
			},
			{ threshold }
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, [threshold]);
	return { ref, visible };
}

/* ── Animated wrapper ── */
function Reveal({
	children,
	className = '',
	animation = 'anim-fade-up',
	delay = ''
}: {
	children: ReactNode;
	className?: string;
	animation?: string;
	delay?: string;
}) {
	const { ref, visible } = useInView();
	return (
		<div ref={ref} className={`${animation} ${delay} ${visible ? 'visible' : ''} ${className}`}>
			{children}
		</div>
	);
}

/* ── Actual symbols from the app ── */
const SHOWCASE = [
	{
		key: 'typo_cat',
		symbols: [
			'\u2014',
			'\u2013',
			'\u2018',
			'\u2019',
			'\u201C',
			'\u201D',
			'\u2026',
			'\u2022',
			'\u00A9',
			'\u00AE',
			'\u2122',
			'\u00B6'
		]
	},
	{
		key: 'arrows_cat',
		symbols: ['\u2190', '\u2192', '\u2191', '\u2193', '\u21D0', '\u21D2', '\u21D1', '\u21D3', '\u21A9', '\u21AA']
	},
	{
		key: 'math_cat',
		symbols: [
			'\u00B1',
			'\u00D7',
			'\u00F7',
			'\u221A',
			'\u221E',
			'\u2248',
			'\u2260',
			'\u2211',
			'\u220F',
			'\u222B',
			'\u03C0'
		]
	},
	{
		key: 'currency_cat',
		symbols: ['$', '\u20AC', '\u00A3', '\u00A5', '\u20BD', '\u20BF', '\u20B9', '\u20A9', '\u20B4', '\u20B1']
	},
	{
		key: 'greek_cat',
		symbols: [
			'\u03B1',
			'\u03B2',
			'\u03B3',
			'\u03B4',
			'\u03B5',
			'\u03B6',
			'\u03B7',
			'\u03B8',
			'\u03BB',
			'\u03BC',
			'\u03C3',
			'\u03C9'
		]
	},
	{ key: 'misc_cat', symbols: ['\u2318', '\u2325', '\u21E7', '\u238B', '\u21A9', '\u232B', '\u2326', '\u21E5'] }
];

/* ── Mockup: first 3 categories for the hero app preview ── */
const MOCKUP_CATS = [
	{
		name: 'Typography',
		chars: [
			'\u2014',
			'\u2013',
			'\u2018',
			'\u2019',
			'\u201C',
			'\u201D',
			'\u2026',
			'\u2022',
			'\u00A9',
			'\u00AE',
			'\u2122',
			'\u00A7'
		]
	},
	{
		name: 'Arrows',
		chars: [
			'\u2190',
			'\u2192',
			'\u2191',
			'\u2193',
			'\u21D0',
			'\u21D2',
			'\u21D1',
			'\u21D3',
			'\u21A9',
			'\u21AA',
			'\u27F5',
			'\u27F6'
		]
	},
	{
		name: 'Math',
		chars: [
			'\u221E',
			'\u2260',
			'\u2248',
			'\u2211',
			'\u221A',
			'\u00B1',
			'\u00D7',
			'\u00F7',
			'\u2202',
			'\u222B',
			'\u2206',
			'\u03C0'
		]
	}
];

const AppleIcon = ({ className }: { className?: string }) => (
	<svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
		<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
	</svg>
);

const WindowsIcon = ({ className }: { className?: string }) => (
	<svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
		<path d="M3 5.548l7.206-0.987v6.952H3V5.548zM3 18.452l7.206 0.987v-6.952H3V18.452zM11.206 4.453L22 3v8.513H11.206V4.453zM11.206 19.547L22 21v-8.513H11.206V19.547z" />
	</svg>
);

export default function Home() {
	const [locale, setLocale] = useState<Locale>('en');
	const [dlPlatform, setDlPlatform] = useState<'macos' | 'windows'>('macos');
	const _ = (key: string) => t(locale, key);

	return (
		<main className="relative min-h-screen overflow-x-hidden">
			{/* ── Background blobs ── */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="blob blob-1 top-[10%] left-[15%] h-[500px] w-[500px] bg-accent/[0.05]" />
				<div className="blob blob-2 top-[40%] right-[10%] h-[400px] w-[400px] bg-hot/[0.04]" />
				<div className="blob blob-3 top-[70%] left-[50%] h-[600px] w-[600px] bg-[#a87cff]/[0.04]" />
			</div>

			{/* ── Navbar ── */}
			<nav className="nav-glass fixed top-0 left-0 right-0 z-50">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
					<a href="#" className="text-sm font-bold tracking-tight">
						<span className="text-hot">Hot</span> Symbols
					</a>
					<div className="hidden items-center gap-6 sm:flex">
						<a href="#features" className="text-xs text-text-secondary transition hover:text-text-primary">
							{_('nav_features')}
						</a>
						<a href="#showcase" className="text-xs text-text-secondary transition hover:text-text-primary">
							{_('nav_symbols')}
						</a>
						<a href="#download" className="text-xs text-text-secondary transition hover:text-text-primary">
							{_('nav_download')}
						</a>
						<a href="#support" className="text-xs text-text-secondary transition hover:text-text-primary">
							{_('nav_support')}
						</a>
					</div>
					<div className="flex gap-1 rounded-lg border border-border bg-bg/60 p-1">
						{LOCALES.map((l) => (
							<button
								key={l.code}
								onClick={() => setLocale(l.code)}
								className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
									locale === l.code ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'
								}`}
							>
								{l.label}
							</button>
						))}
					</div>
				</div>
			</nav>

			{/* ── Hero ── */}
			<section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-28 pb-16 md:pt-36 md:pb-20">
				<div className="hero-blob pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-accent/[0.07] blur-[120px]" />

				{/* badge */}
				<Reveal animation="anim-fade-scale">
					<div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-bg-card px-4 py-1.5 text-xs text-text-secondary">
						<span className="h-1.5 w-1.5 rounded-full bg-green" />
						{_('feat_instant_title')}
					</div>
				</Reveal>

				<Reveal animation="anim-fade-up" delay="delay-1">
					<h1 className="text-center text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
						<span className="text-hot">Hot</span> Symbols
					</h1>
				</Reveal>
				<Reveal animation="anim-fade-up" delay="delay-2">
					<p className="mt-6 max-w-lg text-center text-lg text-text-secondary md:text-xl">{_('tagline')}</p>
				</Reveal>
				<Reveal animation="anim-fade-up" delay="delay-3">
					<p className="mt-2 max-w-lg text-center text-sm text-text-muted">{_('subtitle')}</p>
				</Reveal>

				<Reveal animation="anim-fade-up" delay="delay-4">
					<div className="mt-10 flex flex-wrap justify-center gap-3">
						<a
							href="#download"
							className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(52,120,246,0.3)]"
						>
							<AppleIcon />
							{_('download_cta')}
						</a>
						<a
							href="#download"
							onClick={() => setDlPlatform('windows')}
							className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card px-7 py-3.5 text-sm font-semibold text-text-primary transition hover:bg-bg-card-hover hover:border-border-strong"
						>
							<WindowsIcon />
							Windows
						</a>
					</div>
				</Reveal>

				{/* ── App Mockup ── */}
				<Reveal animation="anim-fade-scale" delay="delay-5" className="relative mt-10 w-full max-w-sm">
					<div className="glass glow rounded-2xl p-4">
						{/* title bar dots */}
						<div className="mb-3 flex gap-1.5">
							<span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/60" />
							<span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/60" />
							<span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/60" />
						</div>
						{/* search bar */}
						<div className="mb-3 rounded-lg border border-border bg-white/[0.03] px-3 py-2 text-xs text-text-muted">
							{'\uD83D\uDD0D'} {_('search_placeholder')}
						</div>
						{/* symbol grid */}
						{MOCKUP_CATS.map((cat) => (
							<div key={cat.name} className="mb-3 last:mb-0">
								<span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">
									{cat.name}
								</span>
								<div className="grid grid-cols-12 gap-1">
									{cat.chars.map((s) => (
										<div
											key={s}
											className="symbol-hover flex aspect-square items-center justify-center rounded-md border border-border bg-white/[0.03] text-sm"
										>
											{s}
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</Reveal>
			</section>

			{/* ── How It Works ── */}
			<section className="mx-auto max-w-4xl px-6 py-20 md:py-28">
				<Reveal>
					<h2 className="mb-14 text-center text-3xl font-bold tracking-tight md:text-4xl">{_('how_heading')}</h2>
				</Reveal>
				<div className="grid gap-8 md:grid-cols-3">
					{[
						{
							num: '1',
							title: 'how_step1_title',
							desc: 'how_step1_desc',
							delay: 'delay-1',
							icon: (
								<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
									<rect x="2" y="3" width="20" height="2" rx="1" />
									<circle cx="12" cy="4" r="0.5" fill="currentColor" stroke="none" />
								</svg>
							)
						},
						{
							num: '2',
							title: 'how_step2_title',
							desc: 'how_step2_desc',
							delay: 'delay-2',
							icon: (
								<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
									<circle cx="11" cy="11" r="7" />
									<path d="M21 21l-4.35-4.35" />
								</svg>
							)
						},
						{
							num: '3',
							title: 'how_step3_title',
							desc: 'how_step3_desc',
							delay: 'delay-3',
							icon: (
								<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
									<rect x="8" y="2" width="13" height="16" rx="2" />
									<path d="M16 18v2a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h2" />
								</svg>
							)
						}
					].map((step) => (
						<Reveal key={step.num} delay={step.delay}>
							<div className="text-center">
								<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-bg-card text-accent">
									{step.icon}
								</div>
								<h3 className="mb-2 text-sm font-semibold">{_(step.title)}</h3>
								<p className="text-sm leading-relaxed text-text-secondary">
									{_(step.desc)
										.split('. ')
										.map((s, i, arr) => (
											<span key={i}>
												{s}
												{i < arr.length - 1 ? '.' : ''}
												{i < arr.length - 1 && <br />}
											</span>
										))}
								</p>
							</div>
						</Reveal>
					))}
				</div>
			</section>

			{/* ── Features ── */}
			<section id="features" className="mx-auto max-w-5xl px-6 py-20 md:py-28">
				<div className="grid gap-6 md:grid-cols-3">
					{[
						{
							delay: 'delay-1',
							icon: (
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
									<rect x="2" y="3" width="20" height="2" rx="1" />
									<rect x="6" y="7" width="12" height="14" rx="2" />
								</svg>
							),
							title: 'feat_instant_title',
							desc: 'feat_instant_desc'
						},
						{
							delay: 'delay-2',
							icon: (
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
									<rect x="3" y="3" width="7" height="7" rx="1.5" />
									<rect x="14" y="3" width="7" height="7" rx="1.5" />
									<rect x="3" y="14" width="7" height="7" rx="1.5" />
									<rect x="14" y="14" width="7" height="7" rx="1.5" />
								</svg>
							),
							title: 'feat_symbols_title',
							desc: 'feat_symbols_desc'
						},
						{
							delay: 'delay-3',
							icon: (
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
									<path d="M12 3v3m0 12v3M3 12h3m12 0h3" />
									<circle cx="12" cy="12" r="4" />
								</svg>
							),
							title: 'feat_custom_title',
							desc: 'feat_custom_desc'
						}
					].map((f) => (
						<Reveal key={f.title} delay={f.delay}>
							<div className="card-hover rounded-2xl border border-border bg-bg-card p-8">
								<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg text-accent">
									{f.icon}
								</div>
								<h3 className="mb-2 text-lg font-semibold">{_(f.title)}</h3>
								{f.title === 'feat_symbols_title' ? (
									<div className="flex flex-wrap gap-1.5">
										{_(f.desc)
											.split(' \u2022 ')
											.map((cat) => (
												<span
													key={cat}
													className="rounded-md border border-border bg-white/[0.03] px-2 py-0.5 text-xs text-text-secondary"
												>
													{cat}
												</span>
											))}
									</div>
								) : (
									<p className="text-sm leading-relaxed text-text-secondary">{_(f.desc)}</p>
								)}
							</div>
						</Reveal>
					))}
				</div>
			</section>

			{/* ── Showcase ── */}
			<section id="showcase" className="mx-auto max-w-5xl px-6 py-20 md:py-28">
				<Reveal>
					<h2 className="mb-14 text-center text-3xl font-bold tracking-tight md:text-4xl">{_('showcase_heading')}</h2>
				</Reveal>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{SHOWCASE.map((cat, i) => (
						<Reveal key={cat.key} delay={`delay-${Math.min(i + 1, 6)}`}>
							<div className="card-hover rounded-xl border border-border bg-bg-card p-5">
								<span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-accent">
									{_(cat.key)}
								</span>
								<div className="flex flex-wrap gap-1.5">
									{cat.symbols.map((s) => (
										<span
											key={s}
											className="symbol-hover flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white/[0.03] text-base"
										>
											{s}
										</span>
									))}
								</div>
							</div>
						</Reveal>
					))}
				</div>
			</section>

			{/* ── Who It's For ── */}
			<section className="mx-auto max-w-5xl px-6 py-20 md:py-28">
				<Reveal>
					<h2 className="mb-14 text-center text-3xl font-bold tracking-tight md:text-4xl">{_('who_heading')}</h2>
				</Reveal>
				<div className="grid gap-6 sm:grid-cols-2">
					{[
						{
							title: 'who_writers_title',
							desc: 'who_writers_desc',
							symbols: '\u2014 \u201C\u201D \u2026 \u2022',
							delay: 'delay-1'
						},
						{
							title: 'who_devs_title',
							desc: 'who_devs_desc',
							symbols: '\u2318 \u2325 \u21E7 \u2192 \u2260',
							delay: 'delay-2'
						},
						{
							title: 'who_designers_title',
							desc: 'who_designers_desc',
							symbols: '\u00A9 \u00AE \u2122 \u2190 \u2022',
							delay: 'delay-3'
						},
						{
							title: 'who_academics_title',
							desc: 'who_academics_desc',
							symbols: '\u03B1 \u03B2 \u222B \u2211 \u00B2',
							delay: 'delay-4'
						}
					].map((item) => (
						<Reveal key={item.title} delay={item.delay}>
							<div className="card-hover rounded-2xl border border-border bg-bg-card p-6">
								<div className="mb-3 flex items-center gap-3">
									<span className="text-sm font-mono text-accent tracking-wider">{item.symbols}</span>
								</div>
								<h3 className="mb-1.5 text-sm font-semibold">{_(item.title)}</h3>
								<p className="text-sm leading-relaxed text-text-secondary">{_(item.desc)}</p>
							</div>
						</Reveal>
					))}
				</div>
			</section>

			{/* ── Details ── */}
			<section className="mx-auto max-w-5xl px-6 py-20 md:py-28">
				<Reveal>
					<h2 className="mb-14 text-center text-3xl font-bold tracking-tight md:text-4xl">{_('also_heading')}</h2>
				</Reveal>
				<div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
					{[
						{ title: 'extra_theme_title', desc: 'extra_theme_desc', delay: 'delay-1' },
						{ title: 'extra_search_title', desc: 'extra_search_desc', delay: 'delay-2' },
						{ title: 'extra_lang_title', desc: 'extra_lang_desc', delay: 'delay-3' },
						{ title: 'extra_light_title', desc: 'extra_light_desc', delay: 'delay-4' },
						{ title: 'extra_private_title', desc: 'extra_private_desc', delay: 'delay-5' },
						{ title: 'extra_login_title', desc: 'extra_login_desc', delay: 'delay-6' }
					].map((f) => (
						<Reveal key={f.title} animation="anim-slide-in" delay={f.delay}>
							<div className="border-l-2 border-accent/30 pl-4 transition hover:border-accent">
								<h3 className="mb-1 text-sm font-semibold">{_(f.title)}</h3>
								<p className="text-sm leading-relaxed text-text-secondary">{_(f.desc)}</p>
							</div>
						</Reveal>
					))}
				</div>
			</section>

			{/* ── Download ── */}
			<section id="download" className="mx-auto max-w-3xl px-6 py-20 md:py-28">
				<Reveal>
					<h2 className="mb-4 text-center text-3xl font-bold tracking-tight md:text-4xl">{_('download_heading')}</h2>
				</Reveal>
				<Reveal delay="delay-1">
					<p className="mx-auto mb-8 max-w-md text-center text-sm text-text-secondary">{_('download_desc')}</p>
				</Reveal>

				{/* Platform tabs */}
				<Reveal delay="delay-2">
					<div className="mx-auto mb-8 flex w-fit rounded-lg border border-border bg-bg-card p-1">
						<button
							onClick={() => setDlPlatform('macos')}
							className={`inline-flex items-center gap-2 rounded-md px-5 py-2 text-sm font-medium transition ${
								dlPlatform === 'macos' ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'
							}`}
						>
							<AppleIcon className="h-4 w-4" />
							macOS
						</button>
						<button
							onClick={() => setDlPlatform('windows')}
							className={`inline-flex items-center gap-2 rounded-md px-5 py-2 text-sm font-medium transition ${
								dlPlatform === 'windows' ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'
							}`}
						>
							<WindowsIcon className="h-4 w-4" />
							Windows
						</button>
					</div>
				</Reveal>

				{/* macOS downloads */}
				{dlPlatform === 'macos' && (
					<Reveal animation="anim-fade-scale">
						<p className="mb-4 text-center text-xs text-text-muted">{_('download_macos_req')}</p>
						<div className="grid gap-4 sm:grid-cols-3">
							<a
								href="https://github.com/Keireira/clownfish/releases/latest/download/Hot-Symbols-intel.dmg"
								className="card-hover group flex flex-col items-center gap-3 rounded-2xl border border-border bg-bg-card p-6"
							>
								<svg
									className="text-text-muted transition group-hover:text-accent"
									width="32"
									height="32"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
								>
									<rect x="6" y="6" width="12" height="12" rx="2" />
									<path d="M6 9h-2M6 12h-2M6 15h-2M18 9h2M18 12h2M18 15h2M9 6v-2M12 6v-2M15 6v-2M9 18v2M12 18v2M15 18v2" />
								</svg>
								<span className="text-sm font-semibold">{_('dl_intel')}</span>
								<span className="text-xs text-text-muted">{_('dl_intel_desc')}</span>
							</a>
							<a
								href="https://github.com/Keireira/clownfish/releases/latest/download/Hot-Symbols-apple-silicon.dmg"
								className="card-hover group flex flex-col items-center gap-3 rounded-2xl border border-border bg-bg-card p-6"
							>
								<svg
									className="text-text-muted transition group-hover:text-accent"
									width="32"
									height="32"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
								>
									<rect x="4" y="4" width="16" height="16" rx="4" />
									<circle cx="12" cy="12" r="3" />
									<path d="M12 4v2m0 12v2M4 12h2m12 0h2" />
								</svg>
								<span className="text-sm font-semibold">{_('dl_arm')}</span>
								<span className="text-xs text-text-muted">{_('dl_arm_desc')}</span>
							</a>
							<a
								href="https://github.com/Keireira/clownfish/releases/latest/download/Hot-Symbols-universal.dmg"
								className="card-hover group flex flex-col items-center gap-3 rounded-2xl border border-border bg-bg-card p-6"
							>
								<AppleIcon className="text-text-muted transition group-hover:text-accent" />
								<span className="text-sm font-semibold">{_('dl_universal')}</span>
								<span className="text-xs text-text-muted">{_('dl_universal_desc')}</span>
							</a>
						</div>
					</Reveal>
				)}

				{/* Windows downloads */}
				{dlPlatform === 'windows' && (
					<Reveal animation="anim-fade-scale">
						<p className="mb-4 text-center text-xs text-text-muted">{_('download_windows_req')}</p>
						<div className="grid gap-4 sm:grid-cols-2">
							{/* x64 */}
							<div className="rounded-2xl border border-border bg-bg-card p-6">
								<h3 className="mb-1 text-center text-sm font-semibold">x86_64</h3>
								<p className="mb-4 text-center text-xs text-text-muted">{_('dl_win_x64_desc')}</p>
								<div className="flex flex-col gap-2">
									<a
										href="https://github.com/Keireira/clownfish/releases/latest/download/Hot-Symbols-x64.msi"
										className="card-hover group flex items-center justify-center gap-2 rounded-xl border border-border bg-bg p-3 text-sm font-medium transition"
									>
										<WindowsIcon className="text-text-muted transition group-hover:text-accent" />
										{_('dl_win_msi')}
									</a>
									<a
										href="https://github.com/Keireira/clownfish/releases/latest/download/Hot-Symbols-x64.exe"
										className="card-hover group flex items-center justify-center gap-2 rounded-xl border border-border bg-bg p-3 text-sm font-medium transition"
									>
										<WindowsIcon className="text-text-muted transition group-hover:text-accent" />
										{_('dl_win_exe')}
									</a>
								</div>
							</div>
							{/* ARM */}
							<div className="rounded-2xl border border-border bg-bg-card p-6">
								<h3 className="mb-1 text-center text-sm font-semibold">ARM64</h3>
								<p className="mb-4 text-center text-xs text-text-muted">{_('dl_win_arm_desc')}</p>
								<div className="flex flex-col gap-2">
									<a
										href="https://github.com/Keireira/clownfish/releases/latest/download/Hot-Symbols-arm64.msi"
										className="card-hover group flex items-center justify-center gap-2 rounded-xl border border-border bg-bg p-3 text-sm font-medium transition"
									>
										<WindowsIcon className="text-text-muted transition group-hover:text-accent" />
										{_('dl_win_msi')}
									</a>
									<a
										href="https://github.com/Keireira/clownfish/releases/latest/download/Hot-Symbols-arm64.exe"
										className="card-hover group flex items-center justify-center gap-2 rounded-xl border border-border bg-bg p-3 text-sm font-medium transition"
									>
										<WindowsIcon className="text-text-muted transition group-hover:text-accent" />
										{_('dl_win_exe')}
									</a>
								</div>
							</div>
						</div>
					</Reveal>
				)}
			</section>

			{/* ── Support ── */}
			<section id="support" className="mx-auto max-w-3xl px-6 py-20 md:py-28">
				<Reveal animation="anim-fade-scale">
					<div className="rounded-2xl border border-border bg-bg-card p-10 text-center md:p-14">
						<h2 className="mb-3 text-2xl font-bold tracking-tight md:text-3xl">{_('support_heading')}</h2>
						<p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-text-secondary">{_('support_desc')}</p>
						<div className="flex flex-wrap items-center justify-center gap-3">
							<a
								href="#"
								className="inline-flex items-center gap-2 rounded-xl bg-[#FFDD00] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#FFE433] hover:shadow-[0_0_20px_rgba(255,221,0,0.3)]"
							>
								{_('buy_coffee')}
							</a>
							<a
								href="#"
								className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg px-5 py-3 text-sm font-semibold text-text-primary transition hover:bg-bg-card-hover"
							>
								{_('sponsor_gh')}
							</a>
							<a
								href="https://boosty.to"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 rounded-xl bg-[#F15F2C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E04E1B] hover:shadow-[0_0_20px_rgba(241,95,44,0.3)]"
							>
								Boosty
							</a>
							<a
								href="https://patreon.com"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 rounded-xl bg-[#FF424D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E63940] hover:shadow-[0_0_20px_rgba(255,66,77,0.3)]"
							>
								Patreon
							</a>
							<a
								href="https://opencollective.com/"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 rounded-xl bg-[#7FADF2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6B9AE0] hover:shadow-[0_0_20px_rgba(127,173,242,0.3)]"
							>
								Open Collective
							</a>
						</div>
					</div>
				</Reveal>
			</section>

			{/* ── Footer ── */}
			<footer className="border-t border-border px-6 py-8">
				<div className="mx-auto max-w-5xl text-center">
					<span className="text-sm text-text-muted">{_('footer_built')}</span>
				</div>
			</footer>
		</main>
	);
}
