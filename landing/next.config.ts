import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	output: 'export',
	basePath: '/clownfish',
	eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
