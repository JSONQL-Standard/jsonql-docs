// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import starlight from '@astrojs/starlight';
import starlightThemeGalaxy from 'starlight-theme-galaxy';

// https://astro.build/config
export default defineConfig({
	output: 'server',
	adapter: cloudflare(),
	integrations: [
		starlight({
			plugins: [starlightThemeGalaxy()],
			title: 'JSONQL',
			description: 'A JSON-native query language and multi-SDK ecosystem for modern APIs and databases.',
			logo: {
				src: './src/assets/logo.svg',
				alt: 'JSONQL',
			},
			favicon: '/favicon.svg',
			customCss: ['./src/styles/custom.css'],
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/JSONQL-Standard',
				},
			],
			sidebar: [
				{
					label: 'Start Here',
					items: [
						{ label: 'Getting Started', slug: 'getting-started' },
						{ label: 'Developer Guide', slug: 'guides/overview' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'Architecture', slug: 'guides/architecture' },
						{ label: 'Query Language', slug: 'guides/query-language' },
					],
				},
				{
					label: 'SDKs',
					items: [
						{ label: 'Go SDK', slug: 'sdk/go' },
						{ label: 'TypeScript SDK', slug: 'sdk/typescript' },
						{ label: 'Python SDK', slug: 'sdk/python' },
						{ label: 'Java SDK', slug: 'sdk/java' },
					],
				},
				{
					label: 'Specification',
					items: [{ label: 'Spec Overview', slug: 'spec/overview' }],
				},
				{
					label: 'Project',
					items: [
						{ label: 'Contributing', slug: 'contributing' },
						{ label: 'Roadmap', slug: 'roadmap' },
					],
				},
			],
		}),
	],
});
