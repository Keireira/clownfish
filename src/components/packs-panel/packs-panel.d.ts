import type { Plugin, PluginRegistryEntry } from '../../types';

export type PacksPanelProps = {
	plugins: Plugin[];
	registry: PluginRegistryEntry[];
	onChanged: () => Promise<void>;
};
