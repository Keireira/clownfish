import Reveal from '../components/reveal';
import { useTranslation } from 'react-i18next';

type DonationLink = {
	href: string;
	label: string | null;
	text: string | null;
	className: string;
	external?: boolean;
};

const DONATION_LINKS: DonationLink[] = [
	{
		href: '#',
		label: 'buy_coffee',
		text: null,
		className: 'bg-[#FFDD00] text-black hover:bg-[#FFE433] hover:shadow-[0_0_20px_rgba(255,221,0,0.3)]'
	},
	{
		href: '#',
		label: 'sponsor_gh',
		text: null,
		className: 'border border-border bg-bg text-text-primary hover:bg-bg-card-hover'
	},
	{
		href: 'https://boosty.to',
		label: null,
		text: 'Boosty',
		className: 'bg-[#F15F2C] text-white hover:bg-[#E04E1B] hover:shadow-[0_0_20px_rgba(241,95,44,0.3)]',
		external: true
	},
	{
		href: 'https://patreon.com',
		label: null,
		text: 'Patreon',
		className: 'bg-[#FF424D] text-white hover:bg-[#E63940] hover:shadow-[0_0_20px_rgba(255,66,77,0.3)]',
		external: true
	},
	{
		href: 'https://opencollective.com/',
		label: null,
		text: 'Open Collective',
		className: 'bg-[#7FADF2] text-white hover:bg-[#6B9AE0] hover:shadow-[0_0_20px_rgba(127,173,242,0.3)]',
		external: true
	}
];

const Support = () => {
	const { t } = useTranslation();

	return (
		<section id="support" className="mx-auto max-w-3xl px-6 py-20 md:py-28">
			<Reveal animation="anim-fade-scale">
				<div className="rounded-2xl border border-border bg-bg-card p-10 text-center md:p-14">
					<h2 className="mb-3 text-2xl font-bold tracking-tight md:text-3xl">{t('support_heading')}</h2>
					<p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-text-secondary">{t('support_desc')}</p>
					<div className="flex flex-wrap items-center justify-center gap-3">
						{DONATION_LINKS.map((link) => (
							<a
								key={link.label ?? link.text}
								href={link.href}
								{...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
								className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${link.className}`}
							>
								{link.label ? t(link.label) : link.text}
							</a>
						))}
					</div>
				</div>
			</Reveal>
		</section>
	);
};

export default Support;
