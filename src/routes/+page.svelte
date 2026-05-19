<script lang="ts">
	import { browser } from '$app/environment';
	import { consumers, objects, results } from '$lib/stores';
	import { getAllConsumers, getAllObjects, getAllResults } from '$lib/db';

	if (browser) {
		getAllConsumers().then(data => consumers.set(data));
		getAllObjects().then(data => objects.set(data));
		getAllResults().then(data => results.set(data));
	}

	$: totalBet = $results.reduce((sum, r) => sum + r.bet, 0);
	$: totalPoints = $results.reduce((sum, r) => sum + r.point, 0);
</script>

<svelte:head>
	<title>SwappingScout - Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>

	<!-- Metric Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<!-- Total Participants -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
			<div class="bg-purple-600 h-2"></div>
			<div class="p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
						<svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
						</svg>
					</div>
				</div>
				<p class="text-sm text-gray-500">Total Participants</p>
				<p class="text-3xl font-bold text-gray-900">{$consumers.length}</p>
				<p class="text-xs text-gray-400 mt-1">Currently Registered</p>
			</div>
		</div>

		<!-- Total Items -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
			<div class="bg-emerald-500 h-2"></div>
			<div class="p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
						<svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
						</svg>
					</div>
				</div>
				<p class="text-sm text-gray-500">Total Items</p>
				<p class="text-3xl font-bold text-gray-900">{$objects.length}</p>
				<p class="text-xs text-gray-400 mt-1">Available in Warehouse</p>
			</div>
		</div>

		<!-- Successful Swaps -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
			<div class="bg-purple-600 h-2"></div>
			<div class="p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
						<svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
						</svg>
					</div>
				</div>
				<p class="text-sm text-gray-500">Successful Swaps</p>
				<p class="text-3xl font-bold text-gray-900">{$results.length}</p>
				<p class="text-xs text-gray-400 mt-1">Completed Transactions</p>
			</div>
		</div>

		<!-- Total Points -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
			<div class="bg-emerald-500 h-2"></div>
			<div class="p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
						<svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
					</div>
				</div>
				<p class="text-sm text-gray-500">Total Points</p>
				<p class="text-3xl font-bold text-gray-900">{totalPoints.toFixed(2)}</p>
				<p class="text-xs text-gray-400 mt-1">Allocated</p>
			</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
		<h2 class="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			<a href="/consumatori" class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group">
				<div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 640 640">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M240 192C240 147.8 275.8 112 320 112C364.2 112 400 147.8 400 192C400 236.2 364.2 272 320 272C275.8 272 240 236.2 240 192zM448 192C448 121.3 390.7 64 320 64C249.3 64 192 121.3 192 192C192 262.7 249.3 320 320 320C390.7 320 448 262.7 448 192zM144 544C144 473.3 201.3 416 272 416L368 416C438.7 416 496 473.3 496 544L496 552C496 565.3 506.7 576 520 576C533.3 576 544 565.3 544 552L544 544C544 446.8 465.2 368 368 368L272 368C174.8 368 96 446.8 96 544L96 552C96 565.3 106.7 576 120 576C133.3 576 144 565.3 144 552L144 544z"/>
					</svg>
				</div>
				<div>
					<p class="font-semibold text-gray-900">Gestione Partecipanti</p>
					<p class="text-sm text-gray-500">Aggiungi e gestisci i partecipanti</p>
				</div>
			</a>

			<a href="/magazzino" class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors group">
				<div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
					<svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
					</svg>
				</div>
				<div>
					<p class="font-semibold text-gray-900">Gestione Magazzino</p>
					<p class="text-sm text-gray-500">Gestisci gli oggetti disponibili</p>
				</div>
			</a>

			<a href="/scambio" class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group">
				<div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
					<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
					</svg>
				</div>
				<div>
					<p class="font-semibold text-gray-900">Avvia Scambio</p>
					<p class="text-sm text-gray-500">Esegui l'algoritmo di matching</p>
				</div>
			</a>
		</div>
	</div>
</div>
