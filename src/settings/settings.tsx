import { useState, useEffect, useCallback, useRef } from 'react';
import Root, {
	SettingsGlobalStyle,
	GlassOverrides,
	Header,
	HeaderRight,
	Body,
	Main,
	Empty,
	BtnPrimary,
	BtnSecondary,
	SettingsGroup,
	SettingsRow,
	SettingsRowLabel,
	Footer,
	Copyright
} from './settings.styles';
import {
	loadCategories,
	saveCategories,
	resetCategories,
	DEFAULT_CATEGORIES,
	loadShortcuts,
	saveShortcuts,
	resetShortcuts,
	DEFAULT_SHORTCUTS,
	loadStopList,
	saveStopList
} from '../store';
import { emitEvent } from '../events';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import SettingsSidebar, { isCategorySection, categoryIdx, categorySection } from '../components/settings-sidebar';
import type { ActiveSection } from '../components/settings-sidebar';
import CategoryEditor from '../components/category-editor';
import PresetPicker from '../components/preset-picker';
import ThemePicker from '../components/theme-picker';
import LanguagePicker from '../components/language-picker';
import AutostartToggle from '../components/autostart-toggle';
import ExpansionToggle from '../components/expansion-toggle';
import HintsPositionPicker from '../components/hints-position';
import TriggerCharPicker from '../components/trigger-char-picker';
import ShortcutEditor from '../components/shortcut-editor';
import AppSettingsPanel from '../components/stoplist-editor';
import BottomBar, { openUrl } from '../components/bottom-bar';
import { useLanguage } from '../i18n';
import { DropOverlay } from '../components/stoplist-editor/stoplist-editor.styles';
import type { Category, CharEntry, Shortcut, StopListEntry } from '../types';

const Settings = () => {
	const t = useLanguage();
	const [active, setActive] = useState<ActiveSection>('settings');
	const [categories, setCategories] = useState<Category[]>([]);
	const [showPresets, setShowPresets] = useState(false);
	const [dirty, setDirty] = useState(false);
	const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
	const [shortcutsDirty, setShortcutsDirty] = useState(false);
	const [stopList, setStopList] = useState<StopListEntry[]>([]);
	const [stopListDirty, setStopListDirty] = useState(false);
	const [dragging, setDragging] = useState(false);

	const stopListRef = useRef(stopList);
	useEffect(() => {
		stopListRef.current = stopList;
	}, [stopList]);

	useEffect(() => {
		loadCategories().then(setCategories);
		loadShortcuts().then(setShortcuts);
		loadStopList().then(setStopList);

		let unlisten: (() => void) | undefined;
		import('@tauri-apps/api/event')
			.then(({ listen }) => listen('open-shortcuts-tab', () => setActive('shortcuts')))
			.then((fn) => {
				unlisten = fn;
			})
			.catch(() => {});
		return () => {
			unlisten?.();
		};
	}, []);

	// Drag-drop for adding apps
	const addExe = useCallback((exe: string) => {
		const lower = exe.toLowerCase();
		const cur = stopListRef.current;
		if (cur.some((e) => e.exe.toLowerCase() === lower)) return;
		const newList = [
			...cur,
			{
				exe: lower,
				expansion: true,
				hints: true,
				direction: 'auto' as const,
				offset: { top: 0, bottom: 0, left: 0, right: 0 }
			}
		];
		setStopList(newList);
		setStopListDirty(true);
		setActive(lower);
	}, []);

	useEffect(() => {
		let unlisten: (() => void) | undefined;
		getCurrentWebviewWindow()
			.onDragDropEvent((event) => {
				if (event.payload.type === 'over') {
					setDragging(true);
				} else if (event.payload.type === 'drop') {
					setDragging(false);
					for (const path of event.payload.paths) {
						invoke<string | null>('expansion_resolve_exe', { path })
							.then((exe) => {
								if (exe) addExe(exe);
							})
							.catch(() => {});
					}
				} else {
					setDragging(false);
				}
			})
			.then((fn) => {
				unlisten = fn;
			});
		return () => {
			unlisten?.();
		};
	}, [addExe]);

	/* ---- Derived state ---- */
	const selectedCatIdx = isCategorySection(active) ? categoryIdx(active) : -1;
	const selectedCat = categories[selectedCatIdx] ?? null;
	const selectedStopEntry = stopList.find((e) => e.exe === active) ?? null;

	const anyDirty = dirty || shortcutsDirty || stopListDirty;

	/* ---- Category handlers ---- */
	const updateCategories = (newCats: Category[]) => {
		setCategories(newCats);
		setDirty(true);
	};

	const handleAddCategory = () => {
		const newCat: Category = { name: 'New Category', chars: [] };
		const newCats = [...categories, newCat];
		updateCategories(newCats);
		setActive(categorySection(newCats.length - 1));
	};

	const handleDeleteCategory = (idx: number) => {
		const newCats = categories.filter((_, i) => i !== idx);
		updateCategories(newCats);
		// If deleted category was active, select adjacent
		if (selectedCatIdx === idx) {
			if (newCats.length === 0) {
				setActive('shortcuts');
			} else {
				setActive(categorySection(Math.min(idx, newCats.length - 1)));
			}
		} else if (selectedCatIdx > idx) {
			setActive(categorySection(selectedCatIdx - 1));
		}
	};

	const handleReorderCategory = (fromIdx: number, toIdx: number) => {
		const newCats = [...categories];
		const [moved] = newCats.splice(fromIdx, 1);
		newCats.splice(toIdx, 0, moved);
		updateCategories(newCats);
		// Follow selection
		if (selectedCatIdx === fromIdx) {
			setActive(categorySection(toIdx));
		} else if (selectedCatIdx > fromIdx && selectedCatIdx <= toIdx) {
			setActive(categorySection(selectedCatIdx - 1));
		} else if (selectedCatIdx < fromIdx && selectedCatIdx >= toIdx) {
			setActive(categorySection(selectedCatIdx + 1));
		}
	};

	const handleUpdateCategory = (idx: number, updatedCat: Category) => {
		updateCategories(categories.map((c, i) => (i === idx ? updatedCat : c)));
	};

	/* ---- Save / Reset ---- */
	const handleSave = async () => {
		if (dirty) {
			await saveCategories(categories);
			setDirty(false);
			await emitEvent('categories-changed');
		}
		if (shortcutsDirty || stopListDirty) {
			await saveShortcuts(shortcuts);
			await saveStopList(stopList);
			setShortcutsDirty(false);
			setStopListDirty(false);
			await invoke('expansion_update_shortcuts', { shortcuts });
			await invoke('expansion_update_stoplist', { entries: stopList });
			await emitEvent('shortcuts-changed');
		}
	};

	const handleReset = async () => {
		await resetCategories();
		setCategories(DEFAULT_CATEGORIES);
		setDirty(false);
		await emitEvent('categories-changed');

		await resetShortcuts();
		setShortcuts(DEFAULT_SHORTCUTS);
		setShortcutsDirty(false);
		setStopList([]);
		setStopListDirty(false);
		await saveStopList([]);
		await invoke('expansion_update_shortcuts', { shortcuts: DEFAULT_SHORTCUTS });
		await invoke('expansion_update_stoplist', { entries: [] as StopListEntry[] });
		await emitEvent('shortcuts-changed');

		setActive('shortcuts');
	};

	const handleAddFromPresets = (chars: CharEntry[]) => {
		if (!selectedCat) return;
		const existing = new Set(selectedCat.chars.map(([ch]) => ch));
		const newChars = chars.filter(([ch]) => !existing.has(ch));
		if (newChars.length === 0) return;
		handleUpdateCategory(selectedCatIdx, {
			...selectedCat,
			chars: [...selectedCat.chars, ...newChars]
		});
		setShowPresets(false);
	};

	return (
		<>
			<SettingsGlobalStyle />
			<GlassOverrides />
			<Root>
				<Header data-tauri-drag-region>
					<h1>{t('settings_title')}</h1>
					<HeaderRight>
						<BtnSecondary onClick={handleReset}>{t('reset_to_default')}</BtnSecondary>
						<BtnPrimary onClick={handleSave} disabled={!anyDirty}>
							{anyDirty ? t('save_changes') : t('saved')}
						</BtnPrimary>
					</HeaderRight>
				</Header>

				<Body style={{ position: 'relative' }}>
					<SettingsSidebar
						active={active}
						onSelect={setActive}
						categories={categories}
						onAddCategory={handleAddCategory}
						onDeleteCategory={handleDeleteCategory}
						onReorderCategory={handleReorderCategory}
						stopList={stopList}
						onStopListChange={(e) => {
							setStopList(e);
							setStopListDirty(true);
						}}
					/>
					<Main>
						{active === 'shortcuts' && (
							<ShortcutEditor
								shortcuts={shortcuts}
								onChange={(s) => {
									setShortcuts(s);
									setShortcutsDirty(true);
								}}
							/>
						)}

						{active === 'settings' && (
							<>
								<SettingsGroup>
									<SettingsRow>
										<SettingsRowLabel>{t('expansion_enabled_label')}</SettingsRowLabel>
										<ExpansionToggle />
									</SettingsRow>
									<SettingsRow>
										<SettingsRowLabel>{t('hints_position_label')}</SettingsRowLabel>
										<HintsPositionPicker />
									</SettingsRow>
									<SettingsRow>
										<SettingsRowLabel>{t('trigger_char_label')}</SettingsRowLabel>
										<TriggerCharPicker
											shortcuts={shortcuts}
											onShortcutsChange={(s) => {
												setShortcuts(s);
												setShortcutsDirty(true);
											}}
										/>
									</SettingsRow>
								</SettingsGroup>
								<SettingsGroup>
									<ThemePicker />
								</SettingsGroup>
								<SettingsGroup>
									<SettingsRow>
										<SettingsRowLabel>{t('language_label')}</SettingsRowLabel>
										<LanguagePicker />
									</SettingsRow>
									<SettingsRow>
										<SettingsRowLabel>{t('autostart_label')}</SettingsRowLabel>
										<AutostartToggle />
									</SettingsRow>
								</SettingsGroup>
							</>
						)}

						{selectedCat && (
							<CategoryEditor
								category={selectedCat}
								onChange={(cat) => handleUpdateCategory(selectedCatIdx, cat)}
								onOpenPresets={() => setShowPresets(true)}
							/>
						)}

						{selectedStopEntry && (
							<AppSettingsPanel
								entry={selectedStopEntry}
								onChange={(updated) => {
									setStopList(stopList.map((e) => (e.exe === updated.exe ? updated : e)));
									setStopListDirty(true);
								}}
							/>
						)}

						{!selectedCat && !selectedStopEntry && active !== 'shortcuts' && active !== 'settings' && (
							<Empty>{t('no_category_selected')}</Empty>
						)}
					</Main>
					{dragging && <DropOverlay>{t('stoplist_drop_hint')}</DropOverlay>}
				</Body>

				<Footer>
					<BottomBar
						right={
							<Copyright onClick={() => openUrl('https://github.com/keireira')}>
								&copy; Alena Dzhukich (2026)
								<svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
									<path d="M3.5 3a.5.5 0 0 0 0 1h3.793L2.146 9.146a.5.5 0 1 0 .708.708L8 4.707V8.5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5h-5z" />
								</svg>
							</Copyright>
						}
					/>
				</Footer>

				{showPresets && selectedCat && (
					<PresetPicker
						onAdd={handleAddFromPresets}
						onClose={() => setShowPresets(false)}
						existingChars={selectedCat.chars.map(([ch]) => ch)}
					/>
				)}
			</Root>
		</>
	);
};

export default Settings;
