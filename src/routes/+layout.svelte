<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	let { children } = $props();
	let version = '2.0.0';

	const navItems = [
		{ href: '/', label: 'Home', icon: HomeIcon },
		{ href: '/consumatori', label: 'Partecipanti', icon: UsersIcon },
		{ href: '/magazzino', label: 'Magazzino', icon: BoxIcon },
		{ href: '/scambio', label: 'Scambio', icon: SwapIcon },
		{ href: '/impostazioni', label: 'Impostazioni', icon: SettingsIcon }
	];

	function HomeIcon(cls: string) {
		return `<svg class="${cls}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`;
	}
	function UsersIcon(cls: string) {
		return `<svg class="${cls}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/></svg>`;
	}
	function BoxIcon(cls: string) {
		return `<svg class="${cls}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`;
	}
	function SwapIcon(cls: string) {
		return `<svg class="${cls}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>`;
	}
	function SettingsIcon(cls: string) {
		return `<svg class="${cls}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`;
	}
</script>

<div class="flex h-screen bg-gray-50">
	<!-- Sidebar -->
	<aside class="w-60 bg-purple-950 text-white flex flex-col flex-shrink-0">
		<!-- Logo -->
		<div class="p-6">
			<a href="/" class="flex items-center gap-3">
				<svg class="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
				</svg>
				<div>
					<span class="text-lg font-bold tracking-tight">SwappingScout</span>
					<span class="text-xs text-purple-300 block">v{version}</span>
				</div>
			</a>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 px-3 space-y-1">
			{#each navItems as item}
				{@const isActive = $page.url.pathname === item.href || ($page.url.pathname !== '/' && item.href !== '/' && $page.url.pathname.startsWith(item.href))}
				<a
					href={item.href}
					class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors {isActive ? 'bg-purple-700 text-white' : 'text-purple-200 hover:bg-purple-900 hover:text-white'}"
				>
					{@html item.icon('w-5 h-5 flex-shrink-0')}
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>

		<!-- Footer -->
		<div class="p-4 text-xs text-purple-400 text-center">
			SwappingScout v{version}
		</div>
	</aside>

	<!-- Main Area -->
	<div class="flex-1 flex flex-col overflow-hidden">
		<!-- Header -->
		<header class="bg-white border-b border-gray-200 h-16 flex items-center px-6 flex-shrink-0">
			<div class="flex items-center gap-4 flex-1">
				<div class="relative max-w-md flex-1">
					<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
					</svg>
					<input
						type="text"
						placeholder="Cerca partecipante, oggetto..."
						class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
					/>
				</div>
			</div>
		</header>

		<!-- Content -->
		<main class="flex-1 overflow-auto p-6">
			{@render children()}
		</main>
	</div>
</div>
