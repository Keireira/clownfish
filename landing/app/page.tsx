'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { t, LOCALES, useLocale } from './i18n';

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

/* ── Symbol data for the interactive hero mockup ── */
const MOCKUP_DATA: { name: string; chars: [string, string][] }[] = [
	{
		name: 'Typography',
		chars: [
			['—', 'em dash'],
			['–', 'en dash'],
			['…', 'ellipsis'],
			['«', 'left guillemet quote'],
			['»', 'right guillemet quote'],
			['•', 'bullet'],
			['°', 'degree'],
			['©', 'copyright'],
			['®', 'registered'],
			['™', 'trademark'],
			['§', 'section'],
			['¶', 'paragraph pilcrow']
		]
	},
	{
		name: 'Arrows',
		chars: [
			['←', 'left arrow'],
			['→', 'right arrow'],
			['↑', 'up arrow'],
			['↓', 'down arrow'],
			['↔', 'left right arrow'],
			['⇐', 'double left arrow'],
			['⇒', 'double right arrow implies'],
			['⇑', 'double up arrow'],
			['⇓', 'double down arrow'],
			['➜', 'heavy right arrow']
		]
	},
	{
		name: 'Math',
		chars: [
			['±', 'plus minus'],
			['×', 'multiply times'],
			['÷', 'divide'],
			['√', 'square root'],
			['∞', 'infinity'],
			['≈', 'approximately'],
			['≠', 'not equal'],
			['∑', 'sum sigma'],
			['∏', 'product'],
			['∫', 'integral'],
			['π', 'pi']
		]
	},
	{
		name: 'Currency',
		chars: [
			['$', 'dollar'],
			['€', 'euro'],
			['£', 'pound sterling'],
			['¥', 'yen yuan'],
			['₽', 'ruble'],
			['₿', 'bitcoin'],
			['₹', 'indian rupee'],
			['₩', 'korean won'],
			['₴', 'ukrainian hryvnia'],
			['₱', 'philippine peso']
		]
	},
	{
		name: 'Greek',
		chars: [
			['α', 'alpha'],
			['β', 'beta'],
			['γ', 'gamma'],
			['δ', 'delta'],
			['ε', 'epsilon'],
			['θ', 'theta'],
			['λ', 'lambda'],
			['μ', 'mu micro'],
			['σ', 'sigma'],
			['φ', 'phi'],
			['ω', 'omega'],
			['Ω', 'omega capital ohm']
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

function detectPlatform(): 'macos' | 'windows' {
	if (typeof navigator === 'undefined') return 'macos';
	const ua = navigator.userAgent.toLowerCase();
	if (ua.includes('win')) return 'windows';
	return 'macos';
}

export default function Home() {
	const [locale, setLocale] = useLocale();
	const [userOS] = useState<'macos' | 'windows'>(detectPlatform);
	const [dlPlatform, setDlPlatform] = useState<'macos' | 'windows'>(detectPlatform);
	const [mockupQuery, setMockupQuery] = useState('');
	const _ = (key: string) => t(locale, key);

	const mockupFiltered = (() => {
		const q = mockupQuery.toLowerCase().trim();
		if (!q) return MOCKUP_DATA.slice(0, 3);
		return MOCKUP_DATA.map((cat) => ({
			name: cat.name,
			chars: cat.chars.filter(([ch, name]) => cat.name.toLowerCase().includes(q) || ch.includes(q) || name.includes(q))
		})).filter((cat) => cat.chars.length > 0);
	})();

	return (
		<main className="relative min-h-screen overflow-x-hidden">
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
						{userOS === 'macos' ? (
							<>
								<a
									href="#download"
									onClick={() => setDlPlatform('macos')}
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
							</>
						) : (
							<>
								<a
									href="#download"
									onClick={() => setDlPlatform('windows')}
									className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(52,120,246,0.3)]"
								>
									<WindowsIcon />
									{_('download_cta_win')}
								</a>
								<a
									href="#download"
									onClick={() => setDlPlatform('macos')}
									className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card px-7 py-3.5 text-sm font-semibold text-text-primary transition hover:bg-bg-card-hover hover:border-border-strong"
								>
									<AppleIcon />
									macOS
								</a>
							</>
						)}
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
						<div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-white/[0.03] px-3 py-2">
							<span className="text-text-muted text-xs">🔍</span>
							<input
								type="text"
								value={mockupQuery}
								onChange={(e) => setMockupQuery(e.target.value)}
								placeholder={_('search_placeholder')}
								className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none"
							/>
						</div>
						{/* symbol grid */}
						{mockupFiltered.length > 0 ? (
							mockupFiltered.map((cat) => (
								<div key={cat.name} className="mb-3 last:mb-0">
									<span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">
										{cat.name}
									</span>
									<div className="flex flex-wrap gap-1">
										{cat.chars.map(([ch]) => (
											<div
												key={ch}
												className="symbol-hover flex h-8 w-8 items-center justify-center rounded-md border border-border bg-white/[0.03] text-sm"
											>
												{ch}
											</div>
										))}
									</div>
								</div>
							))
						) : (
							<div className="py-6 text-center text-xs text-text-muted">No symbols found</div>
						)}
					</div>
				</Reveal>
			</section>

			{/* ── How It Works ── */}
			<section className="mx-auto max-w-4xl px-6 py-20 md:py-28">
				<Reveal>
					<h2 className="mb-16 text-center text-3xl font-bold tracking-tight md:text-4xl">{_('how_heading')}</h2>
				</Reveal>

				{/* mobile: simple list */}
				<div className="relative pl-14 md:hidden">
					<div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-accent/40 via-accent/20 to-transparent" />
					{[
						{ num: '1', title: 'how_step1_title', desc: 'how_step1_desc', delay: 'delay-1' },
						{ num: '2', title: 'how_step2_title', desc: 'how_step2_desc', delay: 'delay-2' },
						{ num: '3', title: 'how_step3_title', desc: 'how_step3_desc', delay: 'delay-3' }
					].map((step) => (
						<Reveal key={step.num} delay={step.delay}>
							<div className="relative pb-10 last:pb-0">
								<div className="absolute -left-14 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-[#0a0a0a] text-sm font-bold text-accent">
									{step.num}
								</div>
								<h3 className="text-sm font-semibold">{_(step.title)}</h3>
								<p className="mt-1 text-sm leading-relaxed text-text-secondary">{_(step.desc)}</p>
							</div>
						</Reveal>
					))}
				</div>

				{/* desktop: zigzag timeline */}
				<div className="relative hidden md:block">
					<div className="absolute left-1/2 top-6 bottom-6 w-px -translate-x-px bg-gradient-to-b from-accent/40 via-accent/20 to-transparent" />

					{/* Step 1: text left, demo right */}
					<Reveal delay="delay-1">
						<div className="relative grid grid-cols-[1fr_48px_1fr] items-center py-8">
							<div className="text-right pr-10">
								<h3 className="text-base font-semibold">{_('how_step1_title')}</h3>
								<p className="mt-1 text-sm leading-relaxed text-text-secondary">{_('how_step1_desc')}</p>
							</div>
							<div className="flex justify-center">
								<div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-[#0a0a0a] text-lg font-bold text-accent">
									1
								</div>
							</div>
							<div className="pl-10">
								<div className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card px-4 py-2.5">
									<span className="h-2.5 w-2.5 rounded-full bg-accent" />
									<span className="text-xs font-semibold text-text-primary">Hot Symbols</span>
									<span className="text-[10px] text-text-muted">▾</span>
								</div>
							</div>
						</div>
					</Reveal>

					{/* Step 2: demo left, text right */}
					<Reveal delay="delay-2">
						<div className="relative grid grid-cols-[1fr_48px_1fr] items-center py-8">
							<div className="flex justify-end pr-10">
								<div className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card px-4 py-2.5">
									<span className="rounded-md border border-border bg-white/[0.05] px-2.5 py-1 text-xs text-text-muted">
										🔍&emsp;pi
									</span>
									<span className="text-text-muted text-xs">→</span>
									{['π', '∏'].map((s) => (
										<span
											key={s}
											className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-sm"
										>
											{s}
										</span>
									))}
								</div>
							</div>
							<div className="flex justify-center">
								<div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-[#0a0a0a] text-lg font-bold text-accent">
									2
								</div>
							</div>
							<div className="pl-10">
								<h3 className="text-base font-semibold">{_('how_step2_title')}</h3>
								<p className="mt-1 text-sm leading-relaxed text-text-secondary">{_('how_step2_desc')}</p>
							</div>
						</div>
					</Reveal>

					{/* Step 3: text left, demo right */}
					<Reveal delay="delay-3">
						<div className="relative grid grid-cols-[1fr_48px_1fr] items-center py-8">
							<div className="text-right pr-10">
								<h3 className="text-base font-semibold">{_('how_step3_title')}</h3>
								<p className="mt-1 text-sm leading-relaxed text-text-secondary">{_('how_step3_desc')}</p>
							</div>
							<div className="flex justify-center">
								<div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-[#0a0a0a] text-lg font-bold text-accent">
									3
								</div>
							</div>
							<div className="pl-10">
								<div className="inline-flex items-center gap-2.5 rounded-xl border border-border bg-bg-card px-4 py-2.5">
									<span className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/40 bg-accent/15 text-base">
										∞
									</span>
									<span className="text-text-muted text-xs">→</span>
									<span className="rounded-md border border-green/30 bg-green/10 px-2.5 py-1 text-xs text-green">
										copied!
									</span>
								</div>
							</div>
						</div>
					</Reveal>
				</div>
			</section>

			{/* ── Features ── */}
			<section id="features" className="mx-auto max-w-5xl px-6 py-20 md:py-28">
				<Reveal>
					<h2 className="mb-14 text-center text-3xl font-bold tracking-tight md:text-4xl">{_('also_heading')}</h2>
				</Reveal>

				{/* Top: 3 feature cards with demos */}
				<div className="grid gap-4 md:grid-cols-3">
					<Reveal delay="delay-1">
						<div className="card-hover flex h-full flex-col rounded-2xl border border-border bg-bg-card p-6">
							<div className="mb-5 flex items-center gap-2 self-start rounded-lg border border-border bg-white/[0.03] px-3 py-1.5">
								<span className="h-2 w-2 rounded-full bg-accent" />
								<span className="text-[11px] font-medium text-text-primary">Hot Symbols</span>
								<span className="text-[9px] text-text-muted">▾</span>
							</div>
							<h3 className="mb-1.5 text-base font-semibold">{_('feat_instant_title')}</h3>
							<p className="text-sm leading-relaxed text-text-secondary">{_('feat_instant_desc')}</p>
						</div>
					</Reveal>

					<Reveal delay="delay-2">
						<div className="card-hover flex h-full flex-col rounded-2xl border border-border bg-bg-card p-6">
							<div className="mb-5 space-y-2">
								{[
									{ label: 'Typography', chars: ['—', '–', '…', '«', '»', '•', '°'] },
									{ label: 'Math', chars: ['±', '×', '÷', '√', '∞', '≠', '≈'] },
									{ label: 'Greek', chars: ['α', 'β', 'γ', 'δ', 'θ', 'λ', 'π'] }
								].map((cat) => (
									<div key={cat.label}>
										<span className="mb-0.5 block text-[8px] font-semibold uppercase tracking-wider text-text-muted">
											{cat.label}
										</span>
										<div className="grid grid-cols-7 gap-px">
											{cat.chars.map((s) => (
												<span
													key={s}
													className="symbol-hover flex aspect-square items-center justify-center rounded text-[11px] border border-border bg-white/[0.03]"
												>
													{s}
												</span>
											))}
										</div>
									</div>
								))}
							</div>
							<h3 className="mb-1.5 text-base font-semibold">{_('feat_symbols_title')}</h3>
							<p className="text-sm leading-relaxed text-text-secondary">
								{_('feat_symbols_desc').split(' \u2022 ').slice(0, 4).join(', ')} & more
							</p>
						</div>
					</Reveal>

					<Reveal delay="delay-3">
						<div className="card-hover flex h-full flex-col rounded-2xl border border-border bg-bg-card p-6">
							<div className="mb-5 space-y-1">
								{[
									{ name: 'Typography', n: 14, active: false },
									{ name: 'My Symbols', n: 5, active: true },
									{ name: 'Arrows', n: 10, active: false }
								].map((cat) => (
									<div
										key={cat.name}
										className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] ${cat.active ? 'border border-accent/30 bg-accent/10 text-text-primary' : 'border border-transparent text-text-secondary'}`}
									>
										<span className="flex items-center gap-2">
											<span className="text-text-muted text-[9px]">⠿</span>
											{cat.name}
										</span>
										<span className="text-[10px] text-text-muted">{cat.n}</span>
									</div>
								))}
							</div>
							<h3 className="mb-1.5 text-base font-semibold">{_('feat_custom_title')}</h3>
							<p className="text-sm leading-relaxed text-text-secondary">{_('feat_custom_desc')}</p>
						</div>
					</Reveal>
				</div>

				{/* Bottom: 6 detail cards */}
				<div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{[
						{ icon: '🎨', title: 'extra_theme_title', desc: 'extra_theme_desc', delay: 'delay-1' },
						{ icon: '🔍', title: 'extra_search_title', desc: 'extra_search_desc', delay: 'delay-2' },
						{ icon: '🌍', title: 'extra_lang_title', desc: 'extra_lang_desc', delay: 'delay-3' },
						{ icon: '⚡', title: 'extra_light_title', desc: 'extra_light_desc', delay: 'delay-4' },
						{ icon: '🔒', title: 'extra_private_title', desc: 'extra_private_desc', delay: 'delay-5' },
						{ icon: '🚀', title: 'extra_login_title', desc: 'extra_login_desc', delay: 'delay-6' }
					].map((f) => (
						<Reveal key={f.title} delay={f.delay}>
							<div className="card-hover flex h-full items-start gap-3 rounded-xl border border-border bg-bg-card p-4">
								<span className="mt-0.5 text-lg">{f.icon}</span>
								<div>
									<h3 className="mb-0.5 text-sm font-semibold">{_(f.title)}</h3>
									<p className="text-xs leading-relaxed text-text-secondary">{_(f.desc)}</p>
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
							symbols: ['—', '“', '”', '…', '•', '«', '»'],
							color: 'rgba(168,124,255,0.15)',
							borderColor: 'rgba(168,124,255,0.4)',
							delay: 'delay-1'
						},
						{
							title: 'who_devs_title',
							desc: 'who_devs_desc',
							symbols: ['⌘', '⌥', '⇧', '→', '≠', '│', '├'],
							color: 'rgba(52,120,246,0.15)',
							borderColor: 'rgba(52,120,246,0.4)',
							delay: 'delay-2'
						},
						{
							title: 'who_designers_title',
							desc: 'who_designers_desc',
							symbols: ['©', '®', '™', '←', '→', '•', '–'],
							color: 'rgba(255,69,58,0.12)',
							borderColor: 'rgba(255,69,58,0.35)',
							delay: 'delay-3'
						},
						{
							title: 'who_academics_title',
							desc: 'who_academics_desc',
							symbols: ['α', 'β', 'γ', '∫', '∑', '√', '²'],
							color: 'rgba(52,199,89,0.12)',
							borderColor: 'rgba(52,199,89,0.35)',
							delay: 'delay-4'
						}
					].map((item) => (
						<Reveal key={item.title} delay={item.delay}>
							<div className="who-card card-hover rounded-2xl border border-border bg-bg-card p-6 transition-all">
								<div className="mb-4 flex flex-wrap gap-1.5">
									{item.symbols.map((s) => (
										<span
											key={s}
											className="symbol-hover flex h-8 w-8 items-center justify-center rounded-lg border text-sm"
											style={{ borderColor: item.borderColor, background: item.color }}
										>
											{s}
										</span>
									))}
								</div>
								<h3 className="mb-1.5 text-sm font-semibold">{_(item.title)}</h3>
								<p className="text-sm leading-relaxed text-text-secondary">{_(item.desc)}</p>
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
							<a
								href="https://github.com/Keireira/clownfish/releases/latest/download/Hot-Symbols-x64.exe"
								className="card-hover group flex flex-col items-center gap-3 rounded-2xl border border-border bg-bg-card p-6"
							>
								<WindowsIcon className="text-text-muted transition group-hover:text-accent" />
								<span className="text-sm font-semibold">x86_64</span>
								<span className="text-xs text-text-muted">{_('dl_win_x64_desc')}</span>
							</a>
							<a
								href="https://github.com/Keireira/clownfish/releases/latest/download/Hot-Symbols-arm64.exe"
								className="card-hover group flex flex-col items-center gap-3 rounded-2xl border border-border bg-bg-card p-6"
							>
								<WindowsIcon className="text-text-muted transition group-hover:text-accent" />
								<span className="text-sm font-semibold">ARM64</span>
								<span className="text-xs text-text-muted">{_('dl_win_arm_desc')}</span>
							</a>
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
				<div className="mx-auto flex max-w-5xl items-center justify-between">
					<span className="text-sm text-text-muted">{_('footer_built')}</span>
					<a href="/privacy" className="text-sm text-text-muted transition hover:text-text-primary">
						Privacy
					</a>
				</div>
			</footer>
		</main>
	);
}
