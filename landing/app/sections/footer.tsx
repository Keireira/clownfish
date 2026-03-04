import { useTranslation } from 'react-i18next';

const Footer = () => {
	const { t } = useTranslation();

	return (
		<footer className="border-t border-border px-6 py-8">
			<div className="mx-auto flex max-w-5xl items-center justify-between">
				<span className="text-sm text-text-muted">{t('footer_built')}</span>
				<a href="/privacy" className="text-sm text-text-muted transition hover:text-text-primary">
					Privacy
				</a>
			</div>
		</footer>
	);
};

export default Footer;
