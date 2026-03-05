import { useState } from 'react';
import { useLanguage } from '../../i18n';
import { savePlugin, savePluginRegistry, deletePluginFile } from '../../plugin-store';
import { PACKS } from '../../data/packs';
import type { Plugin, PluginRegistryEntry } from '../../types';
import { Wrapper, PackCard, PackInfo, PackName, PackPreview, InstallBtn, UninstallBtn } from './packs-panel.styles';

type Props = {
	plugins: Plugin[];
	registry: PluginRegistryEntry[];
	onChanged: () => Promise<void>;
};

const PacksPanel = ({ plugins, registry, onChanged }: Props) => {
	const t = useLanguage();
	const [busy, setBusy] = useState(false);

	const installedIds = new Set(registry.map((r) => r.id));

	const handleInstall = async (pack: Plugin) => {
		if (busy) return;
		setBusy(true);
		try {
			await savePlugin(pack);
			const maxOrder = registry.reduce((max, r) => Math.max(max, r.order), -1);
			await savePluginRegistry([...registry, { id: pack.id, enabled: true, order: maxOrder + 1 }]);
			await onChanged();
		} finally {
			setBusy(false);
		}
	};

	const handleUninstall = async (pack: Plugin) => {
		if (busy) return;
		setBusy(true);
		try {
			await deletePluginFile(pack.id);
			await savePluginRegistry(registry.filter((r) => r.id !== pack.id));
			await onChanged();
		} finally {
			setBusy(false);
		}
	};

	return (
		<Wrapper>
			{PACKS.map((pack) => {
				const installed = installedIds.has(pack.id);
				const preview = pack.categories[0]?.chars.map(([ch]) => ch).join(' ') ?? '';

				return (
					<PackCard key={pack.id}>
						<PackInfo>
							<PackName>{pack.name}</PackName>
							<PackPreview>{preview}</PackPreview>
						</PackInfo>
						{installed ? (
							<UninstallBtn onClick={() => handleUninstall(pack)} disabled={busy}>
								{t('pack_uninstall')}
							</UninstallBtn>
						) : (
							<InstallBtn onClick={() => handleInstall(pack)} disabled={busy}>
								{t('pack_install')}
							</InstallBtn>
						)}
					</PackCard>
				);
			})}
		</Wrapper>
	);
};

export default PacksPanel;
