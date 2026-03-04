import Reveal from '../components/reveal';
import { useTranslation } from 'react-i18next';

const DETAIL_CARDS = [
	{ icon: '🎨', title: 'extra_theme_title', desc: 'extra_theme_desc', delay: 'delay-1' },
	{ icon: '🔍', title: 'extra_search_title', desc: 'extra_search_desc', delay: 'delay-2' },
	{ icon: '🌍', title: 'extra_lang_title', desc: 'extra_lang_desc', delay: 'delay-3' },
	{ icon: '⚡', title: 'extra_light_title', desc: 'extra_light_desc', delay: 'delay-4' },
	{ icon: '🔒', title: 'extra_private_title', desc: 'extra_private_desc', delay: 'delay-5' },
	{ icon: '🚀', title: 'extra_login_title', desc: 'extra_login_desc', delay: 'delay-6' }
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

			<div className="grid gap-4 md:grid-cols-3">
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

				{/* Symbols preview card */}
				<Reveal delay="delay-2">
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
				<Reveal delay="delay-3">
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
