import styled from 'styled-components';

export const PanelRoot = styled.div`
	display: flex;
	flex-direction: column;
	gap: 24px;
`;

export const Section = styled.div`
	background: var(--card-bg);
	border: 1px solid var(--border);
	border-radius: var(--radius-l);
	padding: 14px 18px;
`;

export const SectionTitle = styled.h3`
	font-size: 12px;
	font-weight: 600;
	color: var(--text-label);
	text-transform: uppercase;
	letter-spacing: 0.5px;
	margin-bottom: 12px;
`;

export const BarRow = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 4px 0;

	& + & {
		border-top: 1px solid var(--border);
	}
`;

export const BarLabel = styled.span`
	font-size: 14px;
	min-width: 28px;
	text-align: center;
	flex-shrink: 0;
`;

export const BarTrack = styled.div`
	flex: 1;
	height: 18px;
	background: var(--fill);
	border-radius: 4px;
	overflow: hidden;
`;

export const BarFill = styled.div<{ $pct: number }>`
	height: 100%;
	width: ${(p) => p.$pct}%;
	background: var(--accent);
	border-radius: 4px;
	transition: width 0.3s ease;
	min-width: ${(p) => (p.$pct > 0 ? '2px' : '0')};
`;

export const BarCount = styled.span`
	font-size: 11px;
	color: var(--text-tertiary);
	min-width: 40px;
	text-align: right;
	flex-shrink: 0;
`;

export const SummaryGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 12px;
`;

export const SummaryCard = styled.div`
	background: var(--fill);
	border-radius: var(--radius-l);
	padding: 14px;
	text-align: center;
`;

export const SummaryValue = styled.div`
	font-size: 22px;
	font-weight: 700;
	color: var(--text-primary);
`;

export const SummaryLabel = styled.div`
	font-size: 11px;
	color: var(--text-tertiary);
	margin-top: 4px;
`;

export const ResetBtn = styled.button`
	padding: 7px 16px;
	border: none;
	border-radius: 8px;
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	background: var(--fill);
	color: var(--text-tertiary);
	transition: background 0.15s;
	align-self: flex-start;

	&:hover {
		background: var(--fill-hover);
	}
`;

export const NoData = styled.div`
	color: var(--text-disabled);
	text-align: center;
	padding: 40px 0;
	font-size: 13px;
`;
