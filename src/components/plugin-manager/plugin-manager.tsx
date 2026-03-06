import { useState } from 'react';
import { useLanguage } from '../../i18n';
import { savePlugin, savePluginRegistry, deletePluginFile, getBuiltinPluginTemplate } from '../../plugin-store';
import type { Plugin, PluginId, PluginRegistryEntry } from '../../types';
import {
	Wrapper,
	PluginCard,
	PluginInfo,
	PluginName,
	PluginMeta,
	PluginActions,
	ActionBtn,
	DeleteBtn,
	LockIcon,
	ToggleSwitch,
	ToolbarRow,
	CreateInput,
	CreateBtn
} from './plugin-manager.styles';

type Props = {
	plugins: Plugin[];
	registry: PluginRegistryEntry[];
	onChanged: () => Promise<void>;
};

const PluginManager = ({ plugins, registry, onChanged }: Props) => {
	const t = useLanguage();
	const [newName, setNewName] = useState('');
	const [busy, setBusy] = useState(false);

	const sorted = [...plugins].sort((a, b) => {
		const aOrder = registry.find((r) => r.id === a.id)?.order ?? 999;
		const bOrder = registry.find((r) => r.id === b.id)?.order ?? 999;
		return aOrder - bOrder;
	});

	const handleCreate = async () => {
		const name = newName.trim();
		if (!name || busy) return;
		setBusy(true);
		try {
			const id =
				name
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, '-')
					.replace(/^-|-$/g, '') || `plugin-${Date.now()}`;
			const plugin: Plugin = {
				id,
				name,
				version: '1.0.0',
				builtin: false,
				categories: [],
				shortcuts: []
			};
			await savePlugin(plugin);
			const maxOrder = registry.reduce((max, r) => Math.max(max, r.order), -1);
			await savePluginRegistry([...registry, { id, enabled: true, order: maxOrder + 1 }]);
			setNewName('');
			await onChanged();
		} finally {
			setBusy(false);
		}
	};

	const handleDelete = async (id: PluginId) => {
		if (busy) return;
		setBusy(true);
		try {
			await deletePluginFile(id);
			await savePluginRegistry(registry.filter((r) => r.id !== id));
			await onChanged();
		} finally {
			setBusy(false);
		}
	};

	const handleToggle = async (id: PluginId, enabled: boolean) => {
		const newReg = registry.map((r) => (r.id === id ? { ...r, enabled } : r));
		await savePluginRegistry(newReg);
		await onChanged();
	};

	const handleResetBuiltin = async (id: string) => {
		if (busy) return;
		setBusy(true);
		try {
			const template = getBuiltinPluginTemplate(id);
			await savePlugin(template);
			await onChanged();
		} finally {
			setBusy(false);
		}
	};

	const handleExport = async (plugin: Plugin) => {
		try {
			const { save } = await import('@tauri-apps/plugin-dialog');
			const { writeTextFile } = await import('@tauri-apps/plugin-fs');
			const path = await save({
				defaultPath: `${plugin.id}.json`,
				filters: [{ name: 'JSON', extensions: ['json'] }]
			});
			if (path) {
				const exportData = { plugin: { ...plugin, builtin: false } };
				await writeTextFile(path, JSON.stringify(exportData, null, 2));
			}
		} catch (e) {
			console.error('Export failed:', e);
		}
	};

	const handleImport = async () => {
		if (busy) return;
		setBusy(true);
		try {
			const { open: openDialog } = await import('@tauri-apps/plugin-dialog');
			const { readTextFile } = await import('@tauri-apps/plugin-fs');
			const path = await openDialog({
				filters: [{ name: 'JSON', extensions: ['json'] }],
				multiple: false
			});
			if (!path) return;
			const content = await readTextFile(path as string);
			const data = JSON.parse(content);
			const imported: Plugin | undefined = data?.plugin;
			if (!imported || !imported.id || !imported.name) {
				console.error('Invalid plugin file');
				return;
			}
			// Ensure not builtin and avoid id collision
			imported.builtin = false;
			if (registry.some((r) => r.id === imported.id)) {
				imported.id = `${imported.id}-${Date.now()}`;
			}
			await savePlugin(imported);
			const maxOrder = registry.reduce((max, r) => Math.max(max, r.order), -1);
			await savePluginRegistry([...registry, { id: imported.id, enabled: true, order: maxOrder + 1 }]);
			await onChanged();
		} catch (e) {
			console.error('Import failed:', e);
		} finally {
			setBusy(false);
		}
	};

	return (
		<Wrapper>
			<ToolbarRow>
				<CreateInput
					placeholder={t('plugin_name_placeholder') as string}
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') handleCreate();
					}}
				/>
				<CreateBtn onClick={handleCreate} disabled={!newName.trim() || busy}>
					{t('plugin_create')}
				</CreateBtn>
				<ActionBtn onClick={handleImport} disabled={busy}>
					{t('plugin_import')}
				</ActionBtn>
			</ToolbarRow>

			{sorted.map((plugin) => {
				const regEntry = registry.find((r) => r.id === plugin.id);
				const enabled = regEntry?.enabled ?? true;

				return (
					<PluginCard key={plugin.id} $builtin={plugin.builtin}>
						<PluginInfo>
							<PluginName>
								{plugin.builtin && <LockIcon title={t('plugin_builtin') as string}>&#x1F512;</LockIcon>}
								{plugin.name}
							</PluginName>
							<PluginMeta>
								v{plugin.version} &middot; {plugin.categories.length} {t('tab_categories')} &middot;{' '}
								{plugin.shortcuts.length} {t('section_shortcuts')}
							</PluginMeta>
						</PluginInfo>
						<PluginActions>
							<ToggleSwitch
								type="checkbox"
								checked={enabled}
								onChange={(e) => handleToggle(plugin.id, e.target.checked)}
							/>
							<ActionBtn onClick={() => handleExport(plugin)}>{t('plugin_export')}</ActionBtn>
							{plugin.builtin ? (
								<ActionBtn onClick={() => handleResetBuiltin(plugin.id)}>{t('reset_to_default')}</ActionBtn>
							) : (
								<DeleteBtn onClick={() => handleDelete(plugin.id)} disabled={busy}>
									{t('plugin_delete')}
								</DeleteBtn>
							)}
						</PluginActions>
					</PluginCard>
				);
			})}
		</Wrapper>
	);
};

export default PluginManager;
