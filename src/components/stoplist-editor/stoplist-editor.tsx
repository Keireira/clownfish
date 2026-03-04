import { useLanguage } from '../../i18n';
import type { StopListEntry, CompassDirection, HintsOffset } from '../../types';
import {
	SettingRow,
	SettingLabel,
	ToggleGroup,
	ToggleTrack,
	ToggleKnob,
	DetailPanel,
	DetailSection,
	DetailLabel,
	CompassGrid,
	CompassCell,
	OffsetGrid,
	OffsetCell,
	OffsetCellLabel,
	OffsetInput
} from './stoplist-editor.styles';

const COMPASS_GRID: CompassDirection[] = ['NW', 'N', 'NE', 'W', 'auto', 'E', 'SW', 'S', 'SE'];

const COMPASS_LABELS: Record<CompassDirection, string> = {
	NW: '\u2196',
	N: '\u2191',
	NE: '\u2197',
	W: '\u2190',
	auto: '~',
	E: '\u2192',
	SW: '\u2199',
	S: '\u2193',
	SE: '\u2198'
};

const OFFSET_CELLS: { side: keyof HintsOffset; label: string }[] = [
	{ side: 'top', label: 'Top' },
	{ side: 'right', label: 'Right' },
	{ side: 'bottom', label: 'Bottom' },
	{ side: 'left', label: 'Left' }
];

type Props = {
	entry: StopListEntry;
	onChange: (entry: StopListEntry) => void;
};

const AppSettingsPanel = ({ entry, onChange }: Props) => {
	const t = useLanguage();

	const handleToggle = (field: 'expansion' | 'hints') => {
		const newVal = !entry[field];
		if (field === 'expansion' && !newVal) {
			onChange({ ...entry, expansion: false, hints: false });
		} else {
			onChange({ ...entry, [field]: newVal });
		}
	};

	const handleDirection = (direction: CompassDirection) => {
		onChange({ ...entry, direction });
	};

	const handleOffset = (side: keyof HintsOffset, value: number) => {
		onChange({ ...entry, offset: { ...entry.offset, [side]: value } });
	};

	return (
		<>
			<SettingRow>
				<SettingLabel>{t('stoplist_expansion')}</SettingLabel>
				<ToggleGroup onClick={() => handleToggle('expansion')}>
					<ToggleTrack $on={entry.expansion}>
						<ToggleKnob $on={entry.expansion} />
					</ToggleTrack>
				</ToggleGroup>
			</SettingRow>
			<SettingRow $dimmed={!entry.expansion}>
				<SettingLabel>{t('stoplist_hints')}</SettingLabel>
				<ToggleGroup $dimmed={!entry.expansion} onClick={() => entry.expansion && handleToggle('hints')}>
					<ToggleTrack $on={entry.hints}>
						<ToggleKnob $on={entry.hints} />
					</ToggleTrack>
				</ToggleGroup>
			</SettingRow>
			{entry.expansion && (
				<DetailPanel>
					<DetailSection>
						<DetailLabel>{t('stoplist_direction')}</DetailLabel>
						<CompassGrid>
							{COMPASS_GRID.map((dir) => (
								<CompassCell
									key={dir}
									$active={entry.direction === dir}
									onClick={() => handleDirection(dir)}
									title={dir}
								>
									{COMPASS_LABELS[dir]}
								</CompassCell>
							))}
						</CompassGrid>
					</DetailSection>
					<DetailSection>
						<DetailLabel>{t('stoplist_offset')}</DetailLabel>
						<OffsetGrid>
							{OFFSET_CELLS.map(({ side, label }) => (
								<OffsetCell key={side}>
									<OffsetCellLabel>{label}</OffsetCellLabel>
									<OffsetInput
										type="number"
										value={entry.offset[side]}
										onChange={(e) => handleOffset(side, parseInt(e.target.value) || 0)}
									/>
								</OffsetCell>
							))}
						</OffsetGrid>
					</DetailSection>
				</DetailPanel>
			)}
		</>
	);
};

export default AppSettingsPanel;
