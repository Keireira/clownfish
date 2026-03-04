import Reveal from '../components/reveal';
import { useTranslation } from 'react-i18next';

const STEPS = [
	{ num: '1', title: 'how_step1_title', desc: 'how_step1_desc', delay: 'delay-1' },
	{ num: '2', title: 'how_step2_title', desc: 'how_step2_desc', delay: 'delay-2' },
	{ num: '3', title: 'how_step3_title', desc: 'how_step3_desc', delay: 'delay-3' }
] as const;

const HowItWorks = () => {
	const { t } = useTranslation();

	return (
		<section className="mx-auto max-w-4xl px-6 py-20 md:py-28">
			<Reveal>
				<h2 className="mb-16 text-center text-3xl font-bold tracking-tight md:text-4xl">{t('how_heading')}</h2>
			</Reveal>

			{/* mobile */}
			<div className="relative pl-14 md:hidden">
				<div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-accent/40 via-accent/20 to-transparent" />
				{STEPS.map((step) => (
					<Reveal key={step.num} delay={step.delay}>
						<div className="relative pb-10 last:pb-0">
							<div className="absolute -left-14 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-[#0a0a0a] text-sm font-bold text-accent">
								{step.num}
							</div>
							<h3 className="text-sm font-semibold">{t(step.title)}</h3>
							<p className="mt-1 text-sm leading-relaxed text-text-secondary">{t(step.desc)}</p>
						</div>
					</Reveal>
				))}
			</div>

			{/* desktop */}
			<div className="relative hidden md:block">
				<div className="absolute left-1/2 top-6 bottom-6 w-px -translate-x-px bg-gradient-to-b from-accent/40 via-accent/20 to-transparent" />

				{/* Step 1 — Define shortcuts */}
				<Reveal delay="delay-1">
					<div className="relative grid grid-cols-[1fr_48px_1fr] items-center py-8">
						<div className="text-right pr-10">
							<h3 className="text-base font-semibold">{t('how_step1_title')}</h3>
							<p className="mt-1 text-sm leading-relaxed text-text-secondary">{t('how_step1_desc')}</p>
						</div>
						<div className="flex justify-center">
							<div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-[#0a0a0a] text-lg font-bold text-accent">
								1
							</div>
						</div>
						<div className="pl-10">
							<div className="space-y-1.5">
								{[
									{ trigger: ':shrug:', expansion: '¯\\_(ツ)_/¯' },
									{ trigger: ':arrow:', expansion: '→' },
									{ trigger: ':tm:', expansion: '™' }
								].map((row) => (
									<div
										key={row.trigger}
										className="flex items-center gap-2 rounded-lg border border-border bg-bg-card px-3 py-1.5 text-[11px]"
									>
										<span className="font-mono text-text-muted">{row.trigger}</span>
										<span className="text-text-muted">→</span>
										<span className="text-text-primary">{row.expansion}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</Reveal>

				{/* Step 2 — Type — it expands */}
				<Reveal delay="delay-2">
					<div className="relative grid grid-cols-[1fr_48px_1fr] items-center py-8">
						<div className="flex justify-end pr-10">
							<div className="rounded-xl border border-border bg-bg-card px-4 py-3">
								<div className="flex items-center gap-2 text-xs">
									<span className="rounded-md border border-border bg-white/[0.05] px-2.5 py-1 font-mono text-text-muted">
										:shrug:
									</span>
									<span className="text-text-muted">→</span>
									<span className="text-text-primary text-sm">¯\_(ツ)_/¯</span>
								</div>
								<div className="mt-2 flex items-center gap-1.5">
									<span className="h-1 w-8 rounded-full bg-accent/40" />
									<span className="text-[9px] text-text-muted">instant</span>
								</div>
							</div>
						</div>
						<div className="flex justify-center">
							<div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-[#0a0a0a] text-lg font-bold text-accent">
								2
							</div>
						</div>
						<div className="pl-10">
							<h3 className="text-base font-semibold">{t('how_step2_title')}</h3>
							<p className="mt-1 text-sm leading-relaxed text-text-secondary">{t('how_step2_desc')}</p>
						</div>
					</div>
				</Reveal>

				{/* Step 3 — Or grab a symbol */}
				<Reveal delay="delay-3">
					<div className="relative grid grid-cols-[1fr_48px_1fr] items-center py-8">
						<div className="text-right pr-10">
							<h3 className="text-base font-semibold">{t('how_step3_title')}</h3>
							<p className="mt-1 text-sm leading-relaxed text-text-secondary">{t('how_step3_desc')}</p>
						</div>
						<div className="flex justify-center">
							<div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-[#0a0a0a] text-lg font-bold text-accent">
								3
							</div>
						</div>
						<div className="pl-10">
							<div className="inline-flex items-center gap-2.5 rounded-xl border border-border bg-bg-card px-4 py-2.5">
								{['→', '←', '↑', '↓'].map((s) => (
									<span
										key={s}
										className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-sm"
									>
										{s}
									</span>
								))}
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
	);
};

export default HowItWorks;
