'use client';

import { useTranslation } from 'react-i18next';
import { LOCALES, useLocaleDetection } from '../i18n';

const SECTIONS = [
	'privacy_no_data',
	'privacy_no_analytics',
	'privacy_no_network',
	'privacy_no_accounts',
	'privacy_local',
	'privacy_third'
] as const;

const PrivacyPage = () => {
	useLocaleDetection();
	const { t, i18n } = useTranslation();

	return (
		<main className="min-h-screen px-6 py-24 max-w-2xl mx-auto">
			<div className="flex items-center justify-between mb-12">
				<a href="/" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
					{t('privacy_back')}
				</a>
				<div className="flex gap-1 rounded-lg border border-border bg-bg/60 p-1">
					{LOCALES.map((l) => (
						<button
							key={l.code}
							onClick={() => i18n.changeLanguage(l.code)}
							className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
								i18n.language === l.code ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'
							}`}
						>
							{l.label}
						</button>
					))}
				</div>
			</div>

			<h1 className="text-3xl font-bold mb-8">{t('privacy_title')}</h1>

			<div className="space-y-6 text-text-secondary leading-relaxed">
				<p>
					<strong className="text-text-primary">{t('privacy_short_label')}</strong> {t('privacy_short')}
				</p>

				{SECTIONS.map((key) => (
					<div key={key}>
						<h2 className="text-xl font-semibold text-text-primary pt-4">{t(`${key}_title`)}</h2>
						<p>{t(`${key}_desc`)}</p>
					</div>
				))}

				<p className="text-text-muted pt-8 text-sm">{t('privacy_updated')}</p>
			</div>
		</main>
	);
};

export default PrivacyPage;
