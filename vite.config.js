// @ts-nocheck
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'SwappingScout',
				short_name: 'SwapScout',
				description: 'Gestione baratto per mercatini scout',
				start_url: '/',
				display: 'standalone',
				background_color: '#ffffff',
				theme_color: '#4F46E5',
				icons: [
					{
						src: '/icons/icon-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/icons/icon-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					}
				]
			}
		})
	],
	test: {
		include: ['tests/**/*.{test,spec}.{js,ts}']
	}
});
