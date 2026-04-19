// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightThemeGalaxy from 'starlight-theme-galaxy';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    output: 'static',
    integrations: [starlight({
        plugins: [starlightThemeGalaxy()],
        title: 'JSONQL',
        description: 'A JSON-native query language and multi-SDK ecosystem for modern APIs and databases.',
        components: {
            Head: './src/components/Head.astro',
        },
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
                    { label: 'Integration Testing', slug: 'guides/integration-testing' },
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
                items: [
                    { label: 'Spec Overview', slug: 'spec/overview' },
                    { label: 'Compliance Testing', slug: 'spec/compliance' },
                ],
            },
            {
                label: 'Project',
                items: [
                    { label: 'Contributing', slug: 'contributing' },
                    { label: 'Roadmap', slug: 'roadmap' },
                ],
            },
        ],
		}), react()],
});