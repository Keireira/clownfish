import Root from './toast.styles';

import type { Props } from './toast.d';

const Toast = ({ message }: Props) => {
	return <Root $show={Boolean(message)}>{message}</Root>;
};

export default Toast;
