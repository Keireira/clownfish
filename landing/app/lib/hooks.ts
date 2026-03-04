import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import type { Platform } from './types';

export const useInView = (threshold = 0.15) => {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const obs = new IntersectionObserver(
			([e]) => {
				if (e.isIntersecting) {
					setVisible(true);
					obs.disconnect();
				}
			},
			{ threshold }
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, [threshold]);

	return { ref, visible };
};

const detectPlatform = (): Platform => {
	if (typeof navigator === 'undefined') return 'macos';
	return navigator.userAgent.toLowerCase().includes('win') ? 'windows' : 'macos';
};

const noopSubscribe = () => () => {};
const serverPlatform = () => 'macos' as const;

export const usePlatform = (): Platform => {
	return useSyncExternalStore(noopSubscribe, detectPlatform, serverPlatform);
};
