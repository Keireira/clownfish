import { useTranslation } from 'react-i18next';

import Reveal from '../components/reveal';
import { AppleIcon, WindowsIcon } from '../components/icons';

import type { ReactNode } from 'react';
import type { Platform } from '../lib/types';

type Props = {
	dlPlatform: Platform;
	setDlOverride: (p: Platform) => void;
};

const BASE_URL = 'https://github.com/Keireira/clownfish/releases/latest/download';

type DownloadLink = {
	href: string;
	icon: ReactNode;
	title: string;
	desc: string;
};

const IntelChipIcon = () => (
	<svg
		className="text-text-muted transition group-hover:text-accent"
		width="32"
		height="32"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.5"
	>
		<rect x="6" y="6" width="12" height="12" rx="2" />
		<path d="M6 9h-2M6 12h-2M6 15h-2M18 9h2M18 12h2M18 15h2M9 6v-2M12 6v-2M15 6v-2M9 18v2M12 18v2M15 18v2" />
	</svg>
);

const AppleSiliconIcon = () => (
	<svg
		className="text-text-muted transition group-hover:text-accent"
		width="32"
		height="32"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.5"
	>
		<rect x="4" y="4" width="16" height="16" rx="4" />
		<circle cx="12" cy="12" r="3" />
		<path d="M12 4v2m0 12v2M4 12h2m12 0h2" />
	</svg>
);

const DownloadCard = ({ href, icon, title, desc }: DownloadLink) => (
	<a
		href={href}
		className="card-hover group flex flex-col items-center gap-3 rounded-2xl border border-border bg-bg-card p-6"
	>
		{icon}
		<span className="text-sm font-semibold">{title}</span>
		<span className="text-xs text-text-muted">{desc}</span>
	</a>
);

const Download = ({ dlPlatform, setDlOverride }: Props) => {
	const { t } = useTranslation();

	const macosLinks: DownloadLink[] = [
		{
			href: `${BASE_URL}/Hot-Symbols-intel.dmg`,
			icon: <IntelChipIcon />,
			title: t('dl_intel'),
			desc: t('dl_intel_desc')
		},
		{
			href: `${BASE_URL}/Hot-Symbols-apple-silicon.dmg`,
			icon: <AppleSiliconIcon />,
			title: t('dl_arm'),
			desc: t('dl_arm_desc')
		},
		{
			href: `${BASE_URL}/Hot-Symbols-universal.dmg`,
			icon: <AppleIcon className="text-text-muted transition group-hover:text-accent" />,
			title: t('dl_universal'),
			desc: t('dl_universal_desc')
		}
	];

	const windowsLinks: DownloadLink[] = [
		{
			href: `${BASE_URL}/Hot-Symbols-x64.exe`,
			icon: <WindowsIcon className="text-text-muted transition group-hover:text-accent" />,
			title: 'x86_64',
			desc: t('dl_win_x64_desc')
		},
		{
			href: `${BASE_URL}/Hot-Symbols-arm64.exe`,
			icon: <WindowsIcon className="text-text-muted transition group-hover:text-accent" />,
			title: 'ARM64',
			desc: t('dl_win_arm_desc')
		}
	];

	const links = dlPlatform === 'macos' ? macosLinks : windowsLinks;

	return (
		<section id="download" className="mx-auto max-w-3xl px-6 py-20 md:py-28">
			<Reveal>
				<h2 className="mb-4 text-center text-3xl font-bold tracking-tight md:text-4xl">{t('download_heading')}</h2>
			</Reveal>
			<Reveal delay="delay-1">
				<p className="mx-auto mb-8 max-w-md text-center text-sm text-text-secondary">{t('download_desc')}</p>
			</Reveal>

			{/* Platform tabs */}
			<Reveal delay="delay-2">
				<div className="mx-auto mb-8 flex w-fit rounded-lg border border-border bg-bg-card p-1">
					{(['macos', 'windows'] as const).map((p) => (
						<button
							key={p}
							onClick={() => setDlOverride(p)}
							className={`inline-flex items-center gap-2 rounded-md px-5 py-2 text-sm font-medium transition ${
								dlPlatform === p ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'
							}`}
						>
							{p === 'macos' ? <AppleIcon className="h-4 w-4" /> : <WindowsIcon className="h-4 w-4" />}
							{p === 'macos' ? 'macOS' : 'Windows'}
						</button>
					))}
				</div>
			</Reveal>

			{/* Download cards */}
			<Reveal animation="anim-fade-scale">
				<p className="mb-4 text-center text-xs text-text-muted">
					{dlPlatform === 'macos' ? t('download_macos_req') : t('download_windows_req')}
				</p>
				<div className={`grid gap-4 ${dlPlatform === 'macos' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
					{links.map((link) => (
						<DownloadCard key={link.href} {...link} />
					))}
				</div>
			</Reveal>
		</section>
	);
};

export default Download;
