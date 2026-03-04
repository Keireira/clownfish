import type { ReactNode } from 'react';
import { useInView } from '../lib/hooks';

type Props = {
	children: ReactNode;
	className?: string;
	animation?: string;
	delay?: string;
};

const Reveal = ({ children, className = '', animation = 'anim-fade-up', delay = '' }: Props) => {
	const { ref, visible } = useInView();

	return (
		<div ref={ref} className={`${animation} ${delay} ${visible ? 'visible' : ''} ${className}`}>
			{children}
		</div>
	);
};

export default Reveal;
