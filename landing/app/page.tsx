'use client';

import { useState } from 'react';
import { t, LOCALES, type Locale } from './i18n';

/* ── Actual symbols from the app ── */
const SHOWCASE = [
	{ key: 'typo_cat', symbols: ['\u2014', '\u2013', '\u2018', '\u2019', '\u201C', '\u201D', '\u2026', '\u2022', '\u00A9', '\u00AE', '\u2122', '\u00B6'] },
	{ key: 'arrows_cat', symbols: ['\u2190', '\u2192', '\u2191', '\u2193', '\u21D0', '\u21D2', '\u21D1', '\u21D3', '\u21A9', '\u21AA'] },
	{ key: 'math_cat', symbols: ['\u00B1', '\u00D7', '\u00F7', '\u221A', '\u221E', '\u2248', '\u2260', '\u2211', '\u220F', '\u222B', '\u03C0'] },
	{ key: 'currency_cat', symbols: ['$', '\u20AC', '\u00A3', '\u00A5', '\u20BD', '\u20BF', '\u20B9', '\u20A9', '\u20B4', '\u20B1'] },
	{ key: 'greek_cat', symbols: ['\u03B1', '\u03B2', '\u03B3', '\u03B4', '\u03B5', '\u03B6', '\u03B7', '\u03B8', '\u03BB', '\u03BC', '\u03C3', '\u03C9'] },
	{ key: 'misc_cat', symbols: ['\u2318', '\u2325', '\u21E7', '\u238B', '\u21A9', '\u232B', '\u2326', '\u21E5'] },
];

/* ── Mockup: first 3 categories for the hero app preview ── */
const MOCKUP_CATS = [
	{ name: 'Typography', chars: ['\u2014', '\u2013', '\u2018', '\u2019', '\u201C', '\u201D', '\u2026', '\u2022', '\u00A9', '\u00AE', '\u2122', '\u00A7'] },
	{ name: 'Arrows', chars: ['\u2190', '\u2192', '\u2191', '\u2193', '\u21D0', '\u21D2', '\u21D1', '\u21D3', '\u21A9', '\u21AA', '\u27F5', '\u27F6'] },
	{ name: 'Math', chars: ['\u221E', '\u2260', '\u2248', '\u2211', '\u221A', '\u00B1', '\u00D7', '\u00F7', '\u2202', '\u222B', '\u2206', '\u03C0'] },
];

const AppleIcon = ({ className }: { className?: string }) => (
	<svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
		<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
	</svg>
);

export default function Home() {
	const [locale, setLocale] = useState<Locale>('en');
	const _ = (key: string) => t(locale, key);

	return (
		<main className="min-h-screen overflow-x-hidden">
			{/* ── Language Switcher ── */}
			<nav className="fixed top-0 right-0 z-50 p-4">
				<div className="flex gap-1 rounded-lg border border-border bg-bg/80 p-1 backdrop-blur-md">
					{LOCALES.map((l) => (
						<button
							key={l.code}
							onClick={() => setLocale(l.code)}
							className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
								locale === l.code
									? 'bg-accent text-white'
									: 'text-text-muted hover:text-text-primary'
							}`}
						>
							{l.label}
						</button>
					))}
				</div>
			</nav>

			{/* ── Hero ── */}
			<section className="relative flex flex-col items-center justify-center px-6 pt-32 pb-20 md:pt-44 md:pb-28">
				<div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-accent/[0.07] blur-[120px]" />

				{/* badge */}
				<div className="relative mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-bg-card px-4 py-1.5 text-xs text-text-secondary">
					<span className="h-1.5 w-1.5 rounded-full bg-green" />
					{_('feat_instant_title')}
				</div>

				<h1 className="relative text-center text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
					Hot Symbols
				</h1>
				<p className="relative mt-6 max-w-lg text-center text-lg text-text-secondary md:text-xl">
					{_('tagline')}
				</p>
				<p className="relative mt-2 max-w-lg text-center text-sm text-text-muted">
					{_('subtitle')}
				</p>

				<div className="relative mt-10 flex gap-4">
					<a
						href="#download"
						className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
					>
						<AppleIcon />
						{_('download_cta')}
					</a>
				</div>

				{/* ── App Mockup ── */}
				<div className="relative mt-16 w-full max-w-sm">
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
											className="flex aspect-square items-center justify-center rounded-md border border-border bg-white/[0.03] text-sm transition hover:bg-white/[0.08] hover:border-border-strong"
										>
											{s}
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── How It Works ── */}
			<section className="mx-auto max-w-4xl px-6 py-20 md:py-28">
				<h2 className="mb-14 text-center text-3xl font-bold tracking-tight md:text-4xl">
					{_('how_heading')}
				</h2>
				<div className="grid gap-8 md:grid-cols-3">
					{[
						{ num: '1', title: 'how_step1_title', desc: 'how_step1_desc', icon: (
							<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
								<rect x="2" y="3" width="20" height="2" rx="1" />
								<circle cx="12" cy="4" r="0.5" fill="currentColor" stroke="none" />
							</svg>
						)},
						{ num: '2', title: 'how_step2_title', desc: 'how_step2_desc', icon: (
							<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
								<circle cx="11" cy="11" r="7" />
								<path d="M21 21l-4.35-4.35" />
							</svg>
						)},
						{ num: '3', title: 'how_step3_title', desc: 'how_step3_desc', icon: (
							<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
								<rect x="8" y="2" width="13" height="16" rx="2" />
								<path d="M16 18v2a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h2" />
							</svg>
						)},
					].map((step) => (
						<div key={step.num} className="text-center">
							<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-bg-card text-accent">
								{step.icon}
							</div>
							<h3 className="mb-2 text-sm font-semibold">{_(step.title)}</h3>
							<p className="text-sm leading-relaxed text-text-secondary">{_(step.desc)}</p>
						</div>
					))}
				</div>
			</section>

			{/* ── Features ── */}
			<section className="mx-auto max-w-5xl px-6 py-20 md:py-28">
				<div className="grid gap-6 md:grid-cols-3">
					<div className="rounded-2xl border border-border bg-bg-card p-8 transition hover:bg-bg-card-hover">
						<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg text-accent">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
								<rect x="2" y="3" width="20" height="2" rx="1" />
								<rect x="6" y="7" width="12" height="14" rx="2" />
							</svg>
						</div>
						<h3 className="mb-2 text-lg font-semibold">{_('feat_instant_title')}</h3>
						<p className="text-sm leading-relaxed text-text-secondary">{_('feat_instant_desc')}</p>
					</div>
					<div className="rounded-2xl border border-border bg-bg-card p-8 transition hover:bg-bg-card-hover">
						<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg text-accent">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
								<rect x="3" y="3" width="7" height="7" rx="1.5" />
								<rect x="14" y="3" width="7" height="7" rx="1.5" />
								<rect x="3" y="14" width="7" height="7" rx="1.5" />
								<rect x="14" y="14" width="7" height="7" rx="1.5" />
							</svg>
						</div>
						<h3 className="mb-2 text-lg font-semibold">{_('feat_symbols_title')}</h3>
						<p className="text-sm leading-relaxed text-text-secondary">{_('feat_symbols_desc')}</p>
					</div>
					<div className="rounded-2xl border border-border bg-bg-card p-8 transition hover:bg-bg-card-hover">
						<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg text-accent">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
								<path d="M12 3v3m0 12v3M3 12h3m12 0h3" />
								<circle cx="12" cy="12" r="4" />
							</svg>
						</div>
						<h3 className="mb-2 text-lg font-semibold">{_('feat_custom_title')}</h3>
						<p className="text-sm leading-relaxed text-text-secondary">{_('feat_custom_desc')}</p>
					</div>
				</div>
			</section>

			{/* ── Showcase ── */}
			<section className="mx-auto max-w-5xl px-6 py-20 md:py-28">
				<h2 className="mb-14 text-center text-3xl font-bold tracking-tight md:text-4xl">
					{_('showcase_heading')}
				</h2>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{SHOWCASE.map((cat) => (
						<div key={cat.key} className="rounded-xl border border-border bg-bg-card p-5">
							<span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-accent">
								{_(cat.key)}
							</span>
							<div className="flex flex-wrap gap-1.5">
								{cat.symbols.map((s) => (
									<span
										key={s}
										className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white/[0.03] text-base"
									>
										{s}
									</span>
								))}
							</div>
						</div>
					))}
				</div>
			</section>

			{/* ── Who It's For ── */}
			<section className="mx-auto max-w-5xl px-6 py-20 md:py-28">
				<h2 className="mb-14 text-center text-3xl font-bold tracking-tight md:text-4xl">
					{_('who_heading')}
				</h2>
				<div className="grid gap-6 sm:grid-cols-2">
					{[
						{ title: 'who_writers_title', desc: 'who_writers_desc', symbols: '\u2014 \u201C\u201D \u2026 \u2022' },
						{ title: 'who_devs_title', desc: 'who_devs_desc', symbols: '\u2318 \u2325 \u21E7 \u2192 \u2260' },
						{ title: 'who_designers_title', desc: 'who_designers_desc', symbols: '\u00A9 \u00AE \u2122 \u2190 \u2022' },
						{ title: 'who_academics_title', desc: 'who_academics_desc', symbols: '\u03B1 \u03B2 \u222B \u2211 \u00B2' },
					].map((item) => (
						<div key={item.title} className="rounded-2xl border border-border bg-bg-card p-6 transition hover:bg-bg-card-hover">
							<div className="mb-3 flex items-center gap-3">
								<span className="text-sm font-mono text-accent tracking-wider">{item.symbols}</span>
							</div>
							<h3 className="mb-1.5 text-sm font-semibold">{_(item.title)}</h3>
							<p className="text-sm leading-relaxed text-text-secondary">{_(item.desc)}</p>
						</div>
					))}
				</div>
			</section>

			{/* ── Details ── */}
			<section className="mx-auto max-w-5xl px-6 py-20 md:py-28">
				<h2 className="mb-14 text-center text-3xl font-bold tracking-tight md:text-4xl">
					{_('also_heading')}
				</h2>
				<div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
					{[
						{ title: 'extra_theme_title', desc: 'extra_theme_desc' },
						{ title: 'extra_search_title', desc: 'extra_search_desc' },
						{ title: 'extra_lang_title', desc: 'extra_lang_desc' },
						{ title: 'extra_light_title', desc: 'extra_light_desc' },
						{ title: 'extra_private_title', desc: 'extra_private_desc' },
						{ title: 'extra_login_title', desc: 'extra_login_desc' },
					].map((f) => (
						<div key={f.title} className="border-l-2 border-border pl-4">
							<h3 className="mb-1 text-sm font-semibold">{_(f.title)}</h3>
							<p className="text-sm leading-relaxed text-text-secondary">{_(f.desc)}</p>
						</div>
					))}
				</div>
			</section>

			{/* ── Download ── */}
			<section id="download" className="mx-auto max-w-3xl px-6 py-20 md:py-28">
				<h2 className="mb-4 text-center text-3xl font-bold tracking-tight md:text-4xl">
					{_('download_heading')}
				</h2>
				<p className="mx-auto mb-10 max-w-md text-center text-sm text-text-secondary">
					{_('download_desc')}
				</p>
				<div className="grid gap-4 sm:grid-cols-3">
					<a
						href="#"
						className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-bg-card p-6 transition hover:border-accent/40 hover:bg-bg-card-hover"
					>
						<AppleIcon className="text-text-muted transition group-hover:text-accent" />
						<span className="text-sm font-semibold">{_('dl_universal')}</span>
						<span className="text-xs text-text-muted">{_('dl_universal_desc')}</span>
					</a>
					<a
						href="#"
						className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-bg-card p-6 transition hover:border-accent/40 hover:bg-bg-card-hover"
					>
						<svg className="text-text-muted transition group-hover:text-accent" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
							<rect x="4" y="4" width="16" height="16" rx="4" />
							<circle cx="12" cy="12" r="3" />
							<path d="M12 4v2m0 12v2M4 12h2m12 0h2" />
						</svg>
						<span className="text-sm font-semibold">{_('dl_arm')}</span>
						<span className="text-xs text-text-muted">{_('dl_arm_desc')}</span>
					</a>
					<a
						href="#"
						className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-bg-card p-6 transition hover:border-accent/40 hover:bg-bg-card-hover"
					>
						<svg className="text-text-muted transition group-hover:text-accent" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
							<rect x="6" y="6" width="12" height="12" rx="2" />
							<path d="M6 9h-2M6 12h-2M6 15h-2M18 9h2M18 12h2M18 15h2M9 6v-2M12 6v-2M15 6v-2M9 18v2M12 18v2M15 18v2" />
						</svg>
						<span className="text-sm font-semibold">{_('dl_intel')}</span>
						<span className="text-xs text-text-muted">{_('dl_intel_desc')}</span>
					</a>
				</div>
			</section>

			{/* ── Support ── */}
			<section className="mx-auto max-w-3xl px-6 py-20 md:py-28">
				<div className="rounded-2xl border border-border bg-bg-card p-10 text-center md:p-14">
					<h2 className="mb-3 text-2xl font-bold tracking-tight md:text-3xl">
						{_('support_heading')}
					</h2>
					<p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-text-secondary">
						{_('support_desc')}
					</p>
					<div className="flex flex-wrap items-center justify-center gap-3">
						<a
							href="#"
							className="inline-flex items-center gap-2 rounded-xl bg-[#FFDD00] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#FFE433]"
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
							className="inline-flex items-center gap-2 rounded-xl bg-[#F15F2C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E04E1B]"
						>
							Boosty
						</a>
						<a
							href="https://patreon.com"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 rounded-xl bg-[#FF424D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E63940]"
						>
							Patreon
						</a>
						<a
							href="https://opencollective.com/"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 rounded-xl bg-[#7FADF2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6B9AE0]"
						>
							Open Collective
						</a>
					</div>
				</div>
			</section>

			{/* ── Footer ── */}
			<footer className="border-t border-border px-6 py-8">
				<div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
					<span className="text-sm text-text-muted">{_('footer_built')}</span>
					<a
						href="https://github.com"
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm text-text-secondary transition hover:text-text-primary"
					>
						GitHub &rarr;
					</a>
				</div>
			</footer>
		</main>
	);
}
