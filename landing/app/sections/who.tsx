import Reveal from '../components/reveal';
import { useTranslation } from 'react-i18next';

const CARDS = [
	{
		title: 'who_writers_title',
		desc: 'who_writers_desc',
		triggers: [
			{ from: ':mdash:', to: '—' },
			{ from: ':laquo:', to: '«' },
			{ from: ':hellip:', to: '…' }
		],
		color: 'rgba(168,124,255,0.15)',
		borderColor: 'rgba(168,124,255,0.4)',
		delay: 'delay-1'
	},
	{
		title: 'who_devs_title',
		desc: 'who_devs_desc',
		triggers: [
			{ from: ':arrow:', to: '→' },
			{ from: ':neq:', to: '≠' },
			{ from: ':cmd:', to: '⌘' }
		],
		color: 'rgba(52,120,246,0.15)',
		borderColor: 'rgba(52,120,246,0.4)',
		delay: 'delay-2'
	},
	{
		title: 'who_designers_title',
		desc: 'who_designers_desc',
		triggers: [
			{ from: ':copy:', to: '©' },
			{ from: ':reg:', to: '®' },
			{ from: ':tm:', to: '™' }
		],
		color: 'rgba(255,69,58,0.12)',
		borderColor: 'rgba(255,69,58,0.35)',
		delay: 'delay-3'
	},
	{
		title: 'who_academics_title',
		desc: 'who_academics_desc',
		triggers: [
			{ from: ':alpha:', to: 'α' },
			{ from: ':sum:', to: '∑' },
			{ from: ':sqrt:', to: '√' }
		],
		color: 'rgba(52,199,89,0.12)',
		borderColor: 'rgba(52,199,89,0.35)',
		delay: 'delay-4'
	}
] as const;

const Who = () => {
	const { t } = useTranslation();

	return (
		<section className="mx-auto max-w-5xl px-6 py-20 md:py-28">
			<Reveal>
				<h2 className="mb-14 text-center text-3xl font-bold tracking-tight md:text-4xl">{t('who_heading')}</h2>
			</Reveal>
			<div className="grid gap-6 sm:grid-cols-2">
				{CARDS.map((item) => (
					<Reveal key={item.title} delay={item.delay}>
						<div className="who-card card-hover rounded-2xl border border-border bg-bg-card p-6 transition-all">
							<div className="mb-4 space-y-1.5">
								{item.triggers.map((tr) => (
									<div key={tr.from} className="flex items-center gap-2 text-[11px]">
										<span
											className="rounded-md border px-2 py-1 font-mono"
											style={{ borderColor: item.borderColor, background: item.color }}
										>
											{tr.from}
										</span>
										<span className="text-text-muted">→</span>
										<span className="text-sm text-text-primary">{tr.to}</span>
									</div>
								))}
							</div>
							<h3 className="mb-1.5 text-sm font-semibold">{t(item.title)}</h3>
							<p className="text-sm leading-relaxed text-text-secondary">{t(item.desc)}</p>
						</div>
					</Reveal>
				))}
			</div>
		</section>
	);
};

export default Who;
