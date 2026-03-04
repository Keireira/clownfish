import { useTranslation } from 'react-i18next';
import { LOCALES } from '../i18n';

const Navbar = () => {
	const { t, i18n } = useTranslation();
	return (
		<nav className="nav-glass fixed top-0 left-0 right-0 z-50">
			<div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
				<a href="#" className="text-sm font-bold tracking-tight">
					<span className="text-hot">Hot</span> Symbols
				</a>
				<div className="hidden items-center gap-6 sm:flex">
					<a href="#features" className="text-xs text-text-secondary transition hover:text-text-primary">
						{t('nav_features')}
					</a>
					<a href="#download" className="text-xs text-text-secondary transition hover:text-text-primary">
						{t('nav_download')}
					</a>
					<a href="#support" className="text-xs text-text-secondary transition hover:text-text-primary">
						{t('nav_support')}
					</a>
				</div>
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
		</nav>
	);
};

export default Navbar;
