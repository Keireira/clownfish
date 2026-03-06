import { useState } from 'react';
import { useLanguage } from '../../i18n';
import type { StopListEntry, AutoCorrectRule, CompassDirection, HintsOffset, Plugin, PluginRegistryEntry } from '../../types';
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
	OffsetInput,
	AcSection,
	AcRow,
	AcPattern,
	AcArrow,
	AcReplacement,
	AcDeleteBtn,
	AcAddRow,
	AcInput,
	AcAddBtn,
	PluginSection,
	PluginRow,
	PluginName
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
	plugins: Plugin[];
	registry: PluginRegistryEntry[];
};

const AppSettingsPanel = ({ entry, onChange, plugins, registry }: Props) => {
	const t = useLanguage();
	const [newPattern, setNewPattern] = useState('');
	const [newReplacement, setNewReplacement] = useState('');

	const handleToggle = (field: 'expansion' | 'hints' | 'autocorrect') => {
		if (field === 'autocorrect') {
			onChange({ ...entry, autocorrect: entry.autocorrect === false ? true : false });
			return;
		}
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

	const rules = entry.autocorrect_rules ?? [];
	const overrides = entry.plugin_overrides ?? {};

	const isPluginActive = (pluginId: string) => {
		if (pluginId in overrides) return overrides[pluginId];
		// Fall back to global state
		return registry.some((r) => r.id === pluginId && r.enabled);
	};

	const handlePluginToggle = (pluginId: string) => {
		const currentActive = isPluginActive(pluginId);
		const globalEnabled = registry.some((r) => r.id === pluginId && r.enabled);
		const newActive = !currentActive;
		const next = { ...overrides };
		if (newActive === globalEnabled) {
			// Matches global default — remove override
			delete next[pluginId];
		} else {
			next[pluginId] = newActive;
		}
		onChange({ ...entry, plugin_overrides: next });
	};

	const handleAddRule = () => {
		const pattern = newPattern.trim();
		const replacement = newReplacement.trim();
		if (!pattern || !replacement) return;
		if (rules.some((r) => r.pattern === pattern)) return;
		onChange({ ...entry, autocorrect_rules: [...rules, { pattern, replacement }] });
		setNewPattern('');
		setNewReplacement('');
	};

	const handleDeleteRule = (idx: number) => {
		onChange({ ...entry, autocorrect_rules: rules.filter((_, i) => i !== idx) });
	};

	const handleRuleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') handleAddRule();
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
			<SettingRow>
				<SettingLabel>{t('stoplist_autocorrect')}</SettingLabel>
				<ToggleGroup onClick={() => handleToggle('autocorrect')}>
					<ToggleTrack $on={entry.autocorrect !== false}>
						<ToggleKnob $on={entry.autocorrect !== false} />
					</ToggleTrack>
				</ToggleGroup>
			</SettingRow>
			{entry.autocorrect !== false && (
				<AcSection>
					<DetailLabel>{t('stoplist_autocorrect_rules')}</DetailLabel>
					{rules.map((rule, idx) => (
						<AcRow key={`${rule.pattern}-${idx}`}>
							<AcPattern>{rule.pattern}</AcPattern>
							<AcArrow>&rarr;</AcArrow>
							<AcReplacement>{rule.replacement}</AcReplacement>
							<AcDeleteBtn onClick={() => handleDeleteRule(idx)}>&times;</AcDeleteBtn>
						</AcRow>
					))}
					<AcAddRow>
						<AcInput
							value={newPattern}
							onChange={(e) => setNewPattern(e.target.value)}
							onKeyDown={handleRuleKeyDown}
							placeholder={t('autocorrect_pattern_placeholder') as string}
						/>
						<AcInput
							value={newReplacement}
							onChange={(e) => setNewReplacement(e.target.value)}
							onKeyDown={handleRuleKeyDown}
							placeholder={t('autocorrect_replacement_placeholder') as string}
						/>
						<AcAddBtn onClick={handleAddRule} disabled={!newPattern.trim() || !newReplacement.trim()}>+</AcAddBtn>
					</AcAddRow>
				</AcSection>
			)}
			{plugins.length > 1 && (
				<PluginSection $dimmed={!entry.expansion}>
					<DetailLabel>{t('stoplist_plugins')}</DetailLabel>
					{plugins.map((plugin) => {
						const active = isPluginActive(plugin.id);
						return (
							<PluginRow key={plugin.id}>
								<PluginName>{plugin.name}</PluginName>
								<ToggleGroup $dimmed={!entry.expansion} onClick={() => entry.expansion && handlePluginToggle(plugin.id)}>
									<ToggleTrack $on={active}>
										<ToggleKnob $on={active} />
									</ToggleTrack>
								</ToggleGroup>
							</PluginRow>
						);
					})}
				</PluginSection>
			)}
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
