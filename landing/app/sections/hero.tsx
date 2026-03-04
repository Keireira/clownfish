import { useState, useMemo } from 'react';
import Reveal from '../components/reveal';
import { AppleIcon, WindowsIcon } from '../components/icons';
import { useTranslation } from 'react-i18next';
import { SYMBOL_CATEGORIES, DEFAULT_CATEGORIES_SHOWN } from '../data/symbols';
import type { Platform } from '../lib/types';

type Props = {
	userOS: Platform;
	setDlOverride: (p: Platform) => void;
};

const PRIMARY_BTN =
	'inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(52,120,246,0.3)]';
const SECONDARY_BTN =
	'inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card px-7 py-3.5 text-sm font-semibold text-text-primary transition hover:bg-bg-card-hover hover:border-border-strong';

const EXPANSION_DEMO = [
	{ trigger: ':shrug:', result: '¯\\_(ツ)_/¯' },
	{ trigger: ':arrow:', result: '→' },
	{ trigger: ':mdash:', result: '—' },
	{ trigger: ':check:', result: '✓' }
] as const;

const Hero = ({ userOS, setDlOverride }: Props) => {
	const { t } = useTranslation();
	const [mockupQuery, setMockupQuery] = useState('');
	const [mockupTab, setMockupTab] = useState<'expand' | 'symbols'>('expand');

	const mockupFiltered = useMemo(() => {
		const q = mockupQuery.toLowerCase().trim();
		if (!q) return SYMBOL_CATEGORIES.slice(0, DEFAULT_CATEGORIES_SHOWN);
		return SYMBOL_CATEGORIES.map((cat) => ({
			name: cat.name,
			chars: cat.chars.filter(([ch, name]) => cat.name.toLowerCase().includes(q) || ch.includes(q) || name.includes(q))
		})).filter((cat) => cat.chars.length > 0);
	}, [mockupQuery]);

	const primary: Platform = userOS === 'macos' ? 'macos' : 'windows';
	const secondary: Platform = userOS === 'macos' ? 'windows' : 'macos';

	return (
		<section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-28 pb-16 md:pt-36 md:pb-20">
			<div className="hero-blob pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-accent/[0.07] blur-[120px]" />

			<Reveal animation="anim-fade-scale">
				<div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-bg-card px-4 py-1.5 text-xs text-text-secondary">
					<span className="h-1.5 w-1.5 rounded-full bg-green" />
					{t('hero_badge')}
				</div>
			</Reveal>

			<Reveal animation="anim-fade-up" delay="delay-1">
				<h1 className="text-center text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
					<span className="text-hot">Hot</span> Symbols
				</h1>
			</Reveal>
			<Reveal animation="anim-fade-up" delay="delay-2">
				<p className="mt-6 max-w-lg text-center text-lg text-text-secondary md:text-xl">{t('tagline')}</p>
			</Reveal>
			<Reveal animation="anim-fade-up" delay="delay-3">
				<p className="mt-2 max-w-lg text-center text-sm text-text-muted">{t('subtitle')}</p>
			</Reveal>

			<Reveal animation="anim-fade-up" delay="delay-4">
				<div className="mt-10 flex flex-wrap justify-center gap-3">
					<a href="#download" onClick={() => setDlOverride(primary)} className={PRIMARY_BTN}>
						{primary === 'macos' ? <AppleIcon /> : <WindowsIcon />}
						{primary === 'macos' ? t('download_cta') : t('download_cta_win')}
					</a>
					<a href="#download" onClick={() => setDlOverride(secondary)} className={SECONDARY_BTN}>
						{secondary === 'macos' ? <AppleIcon /> : <WindowsIcon />}
						{secondary === 'macos' ? 'macOS' : 'Windows'}
					</a>
				</div>
			</Reveal>

			{/* App Mockup with tabs */}
			<Reveal animation="anim-fade-scale" delay="delay-5" className="relative mt-10 w-full max-w-sm">
				<div className="glass glow rounded-2xl p-4">
					<div className="mb-3 flex items-center justify-between">
						<div className="flex gap-1.5">
							<span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/60" />
							<span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/60" />
							<span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/60" />
						</div>
						<div className="flex gap-1 rounded-lg border border-border bg-white/[0.03] p-0.5">
							<button
								onClick={() => setMockupTab('expand')}
								className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition ${
									mockupTab === 'expand' ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-secondary'
								}`}
							>
								Expansion
							</button>
							<button
								onClick={() => setMockupTab('symbols')}
								className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition ${
									mockupTab === 'symbols' ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-secondary'
								}`}
							>
								Symbols
							</button>
						</div>
					</div>

					{mockupTab === 'expand' ? (
						<div className="space-y-2">
							{EXPANSION_DEMO.map((row) => (
								<div
									key={row.trigger}
									className="flex items-center gap-2.5 rounded-lg border border-border bg-white/[0.03] px-3 py-2"
								>
									<span className="font-mono text-xs text-text-muted">{row.trigger}</span>
									<span className="text-text-muted text-xs">→</span>
									<span className="text-sm text-text-primary">{row.result}</span>
								</div>
							))}
							<div className="mt-3 flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2">
								<span className="font-mono text-xs text-text-muted">:shrug:</span>
								<span className="flex-1 text-xs text-text-secondary italic">typing…</span>
								<span className="text-sm text-text-primary">¯\_(ツ)_/¯</span>
							</div>
						</div>
					) : (
						<>
							<div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-white/[0.03] px-3 py-2">
								<span className="text-text-muted text-xs">🔍</span>
								<input
									type="text"
									value={mockupQuery}
									onChange={(e) => setMockupQuery(e.target.value)}
									placeholder={t('search_placeholder')}
									className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none"
								/>
							</div>
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
						</>
					)}
				</div>
			</Reveal>
		</section>
	);
};

export default Hero;
