<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { base } from '$app/paths';

	let { children } = $props();
	let version = '2.0.0';
	let sidebarOpen = $state(false);

	const navItems = [
		{ href: '/', label: 'Home', icon: HomeIcon },
		{ href: '/magazzino', label: 'Magazzino', icon: BoxIcon },
		{ href: '/consumatori', label: 'Partecipanti', icon: UsersIcon },
		{ href: '/scambio', label: 'Scambio', icon: SwapIcon },
		{ href: '/impostazioni', label: 'Impostazioni', icon: SettingsIcon }
	];

	const pageTitles: Record<string, string> = {
		'/': 'Dashboard',
		'/magazzino': 'Magazzino',
		'/consumatori': 'Partecipanti',
		'/scambio': 'Scambio',
		'/impostazioni': 'Impostazioni'
	};

	function closeSidebar() {
		sidebarOpen = false;
	}

	function HomeIcon(cls: string) {
		return `<svg class="${cls}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`;
	}
	function UsersIcon(cls: string) {
		return `<svg xmlns="http://www.w3.org/2000/svg" class="${cls}" viewBox="0 0 640 640" fill="currentColor"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M240 192C240 147.8 275.8 112 320 112C364.2 112 400 147.8 400 192C400 236.2 364.2 272 320 272C275.8 272 240 236.2 240 192zM448 192C448 121.3 390.7 64 320 64C249.3 64 192 121.3 192 192C192 262.7 249.3 320 320 320C390.7 320 448 262.7 448 192zM144 544C144 473.3 201.3 416 272 416L368 416C438.7 416 496 473.3 496 544L496 552C496 565.3 506.7 576 520 576C533.3 576 544 565.3 544 552L544 544C544 446.8 465.2 368 368 368L272 368C174.8 368 96 446.8 96 544L96 552C96 565.3 106.7 576 120 576C133.3 576 144 565.3 144 552L144 544z"/></svg>`;
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
	<!-- Mobile overlay backdrop -->
	{#if sidebarOpen}
		<div
			class="fixed inset-0 bg-black/50 z-40 lg:hidden"
			on:click={closeSidebar}
			aria-hidden="true"
		></div>
	{/if}

	<!-- Sidebar -->
	<aside
		class="fixed inset-y-0 left-0 z-50 w-60 bg-purple-950 text-white flex flex-col flex-shrink-0 transform -translate-x-full lg:translate-x-0 lg:static lg:z-auto transition-transform duration-200 ease-in-out"
		class:translate-x-0={sidebarOpen}
	>
		<!-- Logo -->
		<div class="p-4 flex justify-center">
			<a href="/" class="flex items-center gap-3" on:click={closeSidebar}>
				<img src="{base}/icons/hat.svg" alt="" class="h-12 w-auto" />
				<span class="text-lg font-bold text-white tracking-tight">SwappingScout</span>
			</a>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 px-3 space-y-1">
			{#each navItems as item}
				{@const isActive = $page.url.pathname === item.href || ($page.url.pathname !== '/' && item.href !== '/' && $page.url.pathname.startsWith(item.href))}
				<a
					href={item.href}
					on:click={closeSidebar}
					class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors {isActive ? 'bg-purple-700 text-white' : 'text-purple-200 hover:bg-purple-900 hover:text-white'}"
				>
					{@html item.icon('w-5 h-5 flex-shrink-0')}
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>

		<!-- Footer -->
		<div class="p-4 text-xs text-purple-400 text-center">
			v{version}
		</div>
	</aside>

	<!-- Main Area -->
	<div class="flex-1 flex flex-col overflow-hidden min-w-0">
		<!-- Header -->
		<header class="bg-white border-b border-gray-200 h-16 flex items-center px-4 lg:px-6 flex-shrink-0 gap-3">
			<!-- Hamburger (mobile only) -->
			<button
				on:click={() => sidebarOpen = true}
				class="lg:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100"
				aria-label="Apri menu"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
				</svg>
			</button>

			<!-- Page title (mobile only) -->
			<h1 class="lg:hidden text-base font-semibold text-gray-900 truncate">
				{pageTitles[$page.url.pathname] || ''}
			</h1>

			<!-- Search (desktop only) -->
			<div class="hidden lg:flex items-center gap-4 flex-1">
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
		<main class="flex-1 overflow-auto p-4 lg:p-6">
			{@render children()}
		</main>
	</div>
</div>
