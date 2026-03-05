import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../i18n';
import { loadStats, resetStats, type StatsData } from '../../stats-store';
import {
	PanelRoot,
	Section,
	SectionTitle,
	BarRow,
	BarLabel,
	BarTrack,
	BarFill,
	BarCount,
	SummaryGrid,
	SummaryCard,
	SummaryValue,
	SummaryLabel,
	ResetBtn,
	NoData
} from './stats-panel.styles';

const TOP_N = 10;

function topEntries(record: Record<string, number>): [string, number][] {
	return Object.entries(record)
		.sort((a, b) => b[1] - a[1])
		.slice(0, TOP_N);
}

const StatsPanel = () => {
	const t = useLanguage();
	const [stats, setStats] = useState<StatsData | null>(null);

	const reload = useCallback(() => {
		loadStats().then(setStats);
	}, []);

	useEffect(() => {
		reload();

		// Reload on window focus and on expansion-used events
		let unFocus: Promise<() => void> | undefined;
		let unExpansion: Promise<() => void> | undefined;
		import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
			unFocus = getCurrentWindow().onFocusChanged(({ payload: focused }) => {
				if (focused) reload();
			});
		});
		import('@tauri-apps/api/event').then(({ listen }) => {
			unExpansion = listen('expansion-used', reload);
		});

		return () => {
			unFocus?.then((fn) => fn());
			unExpansion?.then((fn) => fn());
		};
	}, [reload]);

	const handleReset = async () => {
		await resetStats();
		setStats({ char_usage: {}, expansion_usage: {}, drag_usage: {}, daily: {} });
	};

	if (!stats) return null;

	const hasData =
		Object.keys(stats.char_usage).length > 0 ||
		Object.keys(stats.expansion_usage).length > 0 ||
		Object.keys(stats.drag_usage).length > 0 ||
		Object.keys(stats.daily).length > 0;

	if (!hasData) {
		return (
			<PanelRoot>
				<NoData>{t('stats_no_data')}</NoData>
			</PanelRoot>
		);
	}

	const topChars = topEntries(stats.char_usage);
	const topExpansions = topEntries(stats.expansion_usage);
	const topDrags = topEntries(stats.drag_usage);

	const totalCopies = Object.values(stats.daily).reduce((s, d) => s + d.copies, 0);
	const totalExpansions = Object.values(stats.daily).reduce((s, d) => s + d.expansions, 0);
	const totalDrags = Object.values(stats.daily).reduce((s, d) => s + (d.drags || 0), 0);
	const activeDays = Object.keys(stats.daily).length;

	const charMax = topChars[0]?.[1] ?? 1;
	const expMax = topExpansions[0]?.[1] ?? 1;
	const dragMax = topDrags[0]?.[1] ?? 1;

	return (
		<PanelRoot>
			<SummaryGrid>
				<SummaryCard>
					<SummaryValue>{totalCopies}</SummaryValue>
					<SummaryLabel>{t('stats_total_copies')}</SummaryLabel>
				</SummaryCard>
				<SummaryCard>
					<SummaryValue>{totalDrags}</SummaryValue>
					<SummaryLabel>{t('stats_total_drags')}</SummaryLabel>
				</SummaryCard>
				<SummaryCard>
					<SummaryValue>{totalExpansions}</SummaryValue>
					<SummaryLabel>{t('stats_total_expansions')}</SummaryLabel>
				</SummaryCard>
				<SummaryCard>
					<SummaryValue>{activeDays}</SummaryValue>
					<SummaryLabel>{t('stats_active_days')}</SummaryLabel>
				</SummaryCard>
			</SummaryGrid>

			{topChars.length > 0 && (
				<Section>
					<SectionTitle>{t('stats_top_chars')}</SectionTitle>
					{topChars.map(([char, count]) => (
						<BarRow key={char}>
							<BarLabel>{char}</BarLabel>
							<BarTrack>
								<BarFill $pct={(count / charMax) * 100} />
							</BarTrack>
							<BarCount>
								{count} {t('stats_uses')}
							</BarCount>
						</BarRow>
					))}
				</Section>
			)}

			{topDrags.length > 0 && (
				<Section>
					<SectionTitle>{t('stats_top_drags')}</SectionTitle>
					{topDrags.map(([char, count]) => (
						<BarRow key={char}>
							<BarLabel>{char}</BarLabel>
							<BarTrack>
								<BarFill $pct={(count / dragMax) * 100} />
							</BarTrack>
							<BarCount>
								{count} {t('stats_uses')}
							</BarCount>
						</BarRow>
					))}
				</Section>
			)}

			{topExpansions.length > 0 && (
				<Section>
					<SectionTitle>{t('stats_top_expansions')}</SectionTitle>
					{topExpansions.map(([trigger, count]) => (
						<BarRow key={trigger}>
							<BarLabel style={{ fontSize: 12, minWidth: 60, textAlign: 'left' }}>{trigger}</BarLabel>
							<BarTrack>
								<BarFill $pct={(count / expMax) * 100} />
							</BarTrack>
							<BarCount>
								{count} {t('stats_uses')}
							</BarCount>
						</BarRow>
					))}
				</Section>
			)}

			<ResetBtn onClick={handleReset}>{t('stats_reset')}</ResetBtn>
		</PanelRoot>
	);
};

export default StatsPanel;
