import Reveal from '../components/reveal';
import { useTranslation } from 'react-i18next';

const CARDS = [
	{
		title: 'who_writers_title',
		desc: 'who_writers_desc',
		symbols: ['—', '\u201c', '\u201d', '…', '•', '«', '»'],
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
