import Reveal from '../components/reveal';
import { useTranslation } from 'react-i18next';

const DETAIL_CARDS = [
	{ icon: '🎨', title: 'extra_theme_title', desc: 'extra_theme_desc', delay: 'delay-1' },
	{ icon: '🔍', title: 'extra_search_title', desc: 'extra_search_desc', delay: 'delay-2' },
	{ icon: '🌍', title: 'extra_lang_title', desc: 'extra_lang_desc', delay: 'delay-3' },
	{ icon: '⚡', title: 'extra_light_title', desc: 'extra_light_desc', delay: 'delay-4' },
	{ icon: '🔒', title: 'extra_private_title', desc: 'extra_private_desc', delay: 'delay-5' },
	{ icon: '🚀', title: 'extra_login_title', desc: 'extra_login_desc', delay: 'delay-6' },
	{ icon: '🎛️', title: 'extra_perapp_title', desc: 'extra_perapp_desc', delay: 'delay-1' },
	{ icon: '🖱️', title: 'extra_dnd_title', desc: 'extra_dnd_desc', delay: 'delay-2' },
	{ icon: '✏️', title: 'extra_autocorrect_title', desc: 'extra_autocorrect_desc', delay: 'delay-3' }
] as const;

const EXPANSION_PREVIEW = [
	{ trigger: ':shrug:', expansion: '¯\\_(ツ)_/¯' },
	{ trigger: ':arrow:', expansion: '→' },
	{ trigger: ':inf:', expansion: '∞' },
	{ trigger: ':check:', expansion: '✓' }
] as const;

const SYMBOL_PREVIEW = [
	{ label: 'Typography', chars: ['—', '–', '…', '«', '»', '•', '°'] },
	{ label: 'Math', chars: ['±', '×', '÷', '√', '∞', '≠', '≈'] },
	{ label: 'Greek', chars: ['α', 'β', 'γ', 'δ', 'θ', 'λ', 'π'] }
] as const;

const CATEGORY_LIST = [
	{ name: 'Typography', n: 14, active: false },
	{ name: 'My Symbols', n: 5, active: true },
	{ name: 'Arrows', n: 10, active: false }
] as const;

const Features = () => {
	const { t } = useTranslation();

	return (
		<section id="features" className="mx-auto max-w-5xl px-6 py-20 md:py-28">
			<Reveal>
				<h2 className="mb-14 text-center text-3xl font-bold tracking-tight md:text-4xl">{t('also_heading')}</h2>
			</Reveal>

			<div className="grid gap-4 md:grid-cols-2">
				{/* Menu bar card */}
				<Reveal delay="delay-1">
					<div className="card-hover flex h-full flex-col rounded-2xl border border-border bg-bg-card p-6">
						<div className="mb-5 flex items-center gap-2 self-start rounded-lg border border-border bg-white/[0.03] px-3 py-1.5">
							<span className="h-2 w-2 rounded-full bg-accent" />
							<span className="text-[11px] font-medium text-text-primary">Hot Symbols</span>
							<span className="text-[9px] text-text-muted">▾</span>
						</div>
						<h3 className="mb-1.5 text-base font-semibold">{t('feat_instant_title')}</h3>
						<p className="text-sm leading-relaxed text-text-secondary">{t('feat_instant_desc')}</p>
					</div>
				</Reveal>

				{/* Text expansion card */}
				<Reveal delay="delay-2">
					<div className="card-hover flex h-full flex-col rounded-2xl border border-border bg-bg-card p-6">
						<div className="mb-5 space-y-1.5">
							{EXPANSION_PREVIEW.map((row) => (
								<div key={row.trigger} className="flex items-center gap-2 text-[11px]">
									<span className="rounded-md border border-border bg-white/[0.03] px-2 py-1 font-mono text-text-muted">
										{row.trigger}
									</span>
									<span className="text-text-muted">→</span>
									<span className="text-text-primary">{row.expansion}</span>
								</div>
							))}
						</div>
						<h3 className="mb-1.5 text-base font-semibold">{t('feat_expand_title')}</h3>
						<p className="text-sm leading-relaxed text-text-secondary">{t('feat_expand_desc')}</p>
					</div>
				</Reveal>

				{/* Symbols preview card */}
				<Reveal delay="delay-3">
					<div className="card-hover flex h-full flex-col rounded-2xl border border-border bg-bg-card p-6">
						<div className="mb-5 space-y-2">
							{SYMBOL_PREVIEW.map((cat) => (
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
						<h3 className="mb-1.5 text-base font-semibold">{t('feat_symbols_title')}</h3>
						<p className="text-sm leading-relaxed text-text-secondary">
							{t('feat_symbols_desc').split(' \u2022 ').slice(0, 4).join(', ')} & more
						</p>
					</div>
				</Reveal>

				{/* Custom layout card */}
				<Reveal delay="delay-4">
					<div className="card-hover flex h-full flex-col rounded-2xl border border-border bg-bg-card p-6">
						<div className="mb-5 space-y-1">
							{CATEGORY_LIST.map((cat) => (
								<div
									key={cat.name}
									className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] ${
										cat.active
											? 'border border-accent/30 bg-accent/10 text-text-primary'
											: 'border border-transparent text-text-secondary'
									}`}
								>
									<span className="flex items-center gap-2">
										<span className="text-text-muted text-[9px]">⠿</span>
										{cat.name}
									</span>
									<span className="text-[10px] text-text-muted">{cat.n}</span>
								</div>
							))}
						</div>
						<h3 className="mb-1.5 text-base font-semibold">{t('feat_custom_title')}</h3>
						<p className="text-sm leading-relaxed text-text-secondary">{t('feat_custom_desc')}</p>
					</div>
				</Reveal>
				{/* Symbol packs card */}
				<Reveal delay="delay-5">
					<div className="card-hover flex h-full flex-col rounded-2xl border border-border bg-bg-card p-6">
						<div className="mb-5 flex flex-wrap gap-1.5">
							{[
								{ name: 'Music', icon: '♪' },
								{ name: 'Chess', icon: '♔' },
								{ name: 'Chemistry', icon: '⇌' },
								{ name: 'Kaomoji', icon: '(◕‿◕)' },
								{ name: 'Astronomy', icon: '☉' },
								{ name: 'IPA', icon: 'ə' }
							].map((pack) => (
								<span
									key={pack.name}
									className="symbol-hover flex items-center gap-1.5 rounded-lg border border-border bg-white/[0.03] px-2.5 py-1.5 text-[11px]"
								>
									<span>{pack.icon}</span>
									<span className="text-text-muted">{pack.name}</span>
								</span>
							))}
						</div>
						<h3 className="mb-1.5 text-base font-semibold">{t('feat_packs_title')}</h3>
						<p className="text-sm leading-relaxed text-text-secondary">{t('feat_packs_desc')}</p>
					</div>
				</Reveal>

				{/* Compose mode card */}
				<Reveal delay="delay-6">
					<div className="card-hover flex h-full flex-col rounded-2xl border border-border bg-bg-card p-6">
						<div className="mb-5 flex items-center gap-3">
							<span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white/[0.03] text-lg">
								a
							</span>
							<span className="text-text-muted text-xs">+</span>
							<div className="flex gap-1">
								{['\u0301', '\u0308', '\u0303'].map((mark, i) => (
									<span
										key={i}
										className="flex h-8 w-8 items-center justify-center rounded-md border border-accent/30 bg-accent/10 text-sm"
									>
										{`◌${mark}`}
									</span>
								))}
							</div>
							<span className="text-text-muted text-xs">=</span>
							<span className="flex h-10 w-10 items-center justify-center rounded-lg border border-green/30 bg-green/10 text-lg text-text-primary">
								ä
							</span>
						</div>
						<h3 className="mb-1.5 text-base font-semibold">{t('feat_compose_title')}</h3>
						<p className="text-sm leading-relaxed text-text-secondary">{t('feat_compose_desc')}</p>
					</div>
				</Reveal>
			</div>

			{/* Detail cards */}
			<div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{DETAIL_CARDS.map((f) => (
					<Reveal key={f.title} delay={f.delay}>
						<div className="card-hover flex h-full items-start gap-3 rounded-xl border border-border bg-bg-card p-4">
							<span className="mt-0.5 text-lg">{f.icon}</span>
							<div>
								<h3 className="mb-0.5 text-sm font-semibold">{t(f.title)}</h3>
								<p className="text-xs leading-relaxed text-text-secondary">{t(f.desc)}</p>
							</div>
						</div>
					</Reveal>
				))}
			</div>
		</section>
	);
};

export default Features;
