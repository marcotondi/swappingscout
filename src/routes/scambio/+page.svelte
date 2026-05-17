<script lang="ts">
	import { browser } from '$app/environment';
	import { consumers, objects, results, swapSettings } from '$lib/stores';
	import { getAllConsumers, getAllObjects, getAllResults, clearResults, addResult, deleteResult, deleteObject, resetDatabase } from '$lib/db';
	import { runSwap } from '$lib/algorithm';
	import { exportResults, downloadCSV } from '$lib/csv';
	import type { SwapParams, SwapResult } from '$lib/types';

	let showConfirm = false;
	let showReset = false;
	let resetConfirm = '';
	let searchTerm = '';
	let error = '';

	$: filteredResults = $results.filter(r =>
		r.consumer.toLowerCase().includes(searchTerm.toLowerCase()) ||
		r.label.toLowerCase().includes(searchTerm.toLowerCase())
	);

	$: totalBet = $results.reduce((sum, r) => sum + r.bet, 0);
	$: totalPoints = $results.reduce((sum, r) => sum + r.point, 0);
	$: successRate = $consumers.length > 0 && $results.length > 0
		? Math.round(($results.length / $consumers.length) * 100)
		: 0;

	if (browser) {
		getAllConsumers().then(data => consumers.set(data));
		getAllObjects().then(data => objects.set(data));
		getAllResults().then(data => results.set(data));
	}

	async function handleStartSwap() {
		if ($consumers.length === 0 || $objects.length === 0) {
			error = 'Aggiungi prima consumatori e oggetti';
			return;
		}
		showConfirm = true;
	}

	async function confirmSwap() {
		showConfirm = false;

		$consumers = await getAllConsumers();
		$objects = await getAllObjects();
		await clearResults();

		const params: SwapParams = {
			order: $swapSettings.order,
			oneObj: $swapSettings.oneObj
		};

		const swapResults = runSwap($consumers, $objects, params);

		for (const result of swapResults) {
			await addResult(result);
		}

		$results = await getAllResults();
	}

	async function handleDelivered(result: SwapResult) {
		if (!confirm('Confermi che questo oggetto è stato consegnato?')) return;

		const obj = $objects.find(o => o.code === result.label);
		if (obj?.id) {
			await deleteObject(obj.id);
		}

		if (result.id) {
			await deleteResult(result.id);
		}

		$objects = await getAllObjects();
		$results = await getAllResults();
	}

	function handleExport() {
		const csv = exportResults($results);
		downloadCSV(csv, `results_${new Date().toISOString().split('T')[0]}.csv`);
	}

	async function handleResetResults() {
		if (!confirm('Sei sicuro di voler eliminare TUTTI i risultati dello scambio?')) return;
		await clearResults();
		$results = [];
	}

	async function handleReset() {
		if (resetConfirm !== 'RESET') {
			error = 'Digita RESET per confermare';
			return;
		}

		await resetDatabase();
		$consumers = [];
		$objects = [];
		$results = [];
		showReset = false;
		resetConfirm = '';
	}
</script>

<svelte:head>
	<title>Scambio - SwappingScout</title>
</svelte:head>

<div class="space-y-6">
	<!-- Title -->
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900">Scambio</h1>
	</div>

	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
			{error}
		</div>
	{/if}

	<!-- Main Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Left Column: Results -->
		<div class="lg:col-span-2 space-y-4">
			<!-- Results Header -->
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div class="flex items-center gap-3">
					<h2 class="text-lg font-semibold text-gray-900">Risultati</h2>
					{#if $results.length > 0}
						<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
							<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
							{$results.length} assegnazioni
						</span>
					{/if}
				</div>
				{#if $results.length > 0}
					<div class="relative max-w-xs w-full">
						<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
						</svg>
						<input
							type="text"
							bind:value={searchTerm}
							placeholder="Cerca..."
							class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
						/>
					</div>
				{/if}
			</div>

			<!-- Success Banner -->
			{#if $results.length > 0}
				<div class="bg-emerald-500 rounded-xl p-4 flex items-center justify-between text-white">
					<div class="flex items-center gap-2">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
						<span class="font-medium">Success Rate: {successRate}%</span>
					</div>
					<div class="flex items-center gap-2">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
						<span class="font-medium">Total Points: {totalPoints.toFixed(0)}</span>
					</div>
				</div>
			{/if}

			<!-- Results Cards -->
			{#if $results.length > 0}
				<div class="space-y-3">
					{#each filteredResults as result}
						<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
							<div class="flex items-center gap-3">
								<div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
									<svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
									</svg>
								</div>
								<div>
									<p class="text-sm font-medium text-gray-900">
										<span class="font-semibold">{result.consumer}</span> riceve <span class="font-mono text-purple-700">{result.label}</span>
									</p>
									<p class="text-xs text-gray-500 mt-0.5">Puntata {result.bet} — Punti {result.point.toFixed(2)}</p>
								</div>
							</div>
							<button
								on:click={() => handleDelivered(result)}
								class="text-sm text-emerald-600 hover:text-emerald-700 font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
							>
								Consegnato
							</button>
						</div>
					{/each}
				</div>
			{:else}
				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
					<div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
						</svg>
					</div>
					<p class="text-gray-500 font-medium">Nessun risultato disponibile</p>
					<p class="text-sm text-gray-400 mt-1">Avvia lo scambio per generare le assegnazioni</p>
				</div>
			{/if}
		</div>

		<!-- Right Column: Control Panel -->
		<div class="space-y-4">
			<!-- Start Button -->
			<button
				on:click={handleStartSwap}
				class="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
			>
				Avvia Scambio
			</button>

			<!-- Stats Card -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
				<h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Stato</h3>

				<div>
					<p class="text-xs text-gray-500">Partecipanti</p>
					<p class="text-2xl font-bold text-gray-900">{$consumers.length}</p>
				</div>

				<div>
					<p class="text-xs text-gray-500">Oggetti in Magazzino</p>
					<p class="text-2xl font-bold text-gray-900">{$objects.length}</p>
				</div>

				<div>
					<p class="text-xs text-gray-500">Assegnazioni</p>
					<p class="text-2xl font-bold text-gray-900">{$results.length}</p>
				</div>

				{#if $results.length > 0}
					<div class="pt-3 border-t border-gray-100">
						<p class="text-xs text-gray-500">Punti Totali</p>
						<p class="text-2xl font-bold text-emerald-600">{totalPoints.toFixed(0)}</p>
					</div>
				{/if}
			</div>

			<!-- Actions -->
			{#if $results.length > 0}
				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
					<h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Azioni</h3>

					<button
						on:click={handleExport}
						class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
						</svg>
						Esporta CSV
					</button>

					<button
						on:click={handleResetResults}
						class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
						</svg>
						Svuota Risultati
					</button>
				</div>
			{/if}

			<!-- Reset Completo -->
			<button
				on:click={() => showReset = true}
				class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-500 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
				</svg>
				Reset Completo
			</button>
		</div>
	</div>

	<!-- Confirm Modal -->
	{#if showConfirm}
		<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showConfirm = false}>
			<div class="bg-white rounded-xl shadow-xl max-w-md w-full" on:click|stopPropagation>
				<div class="p-6">
					<h3 class="text-lg font-bold text-gray-900 mb-4">Conferma Scambio</h3>
					<div class="space-y-2 text-sm text-gray-600 mb-4">
						<p>Stai per avviare l'algoritmo con:</p>
						<ul class="list-disc list-inside space-y-1">
							<li><strong>{$consumers.length}</strong> partecipanti</li>
							<li><strong>{$objects.length}</strong> oggetti</li>
							<li>Ordinamento: <strong>{$swapSettings.order}</strong></li>
							<li>Oggetto unico: <strong>{$swapSettings.oneObj ? 'Sì' : 'No'}</strong></li>
						</ul>
					</div>
					<p class="text-red-600 text-sm mb-6">⚠️ Questa azione cancellerà i risultati precedenti</p>
					<div class="flex gap-3">
						<button
							on:click={() => showConfirm = false}
							class="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
						>
							Annulla
						</button>
						<button
							on:click={confirmSwap}
							class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
						>
							Avvia
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Reset Modal -->
	{#if showReset}
		<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => { showReset = false; resetConfirm = ''; }}>
			<div class="bg-white rounded-xl shadow-xl max-w-md w-full" on:click|stopPropagation>
				<div class="p-6">
					<h3 class="text-lg font-bold text-red-600 mb-4">⚠️ Reset Completo</h3>
					<p class="text-sm text-gray-600 mb-4">
						Questa azione cancellerà TUTTI i dati (consumatori, oggetti, risultati).<br>
						<strong class="text-red-600">Non è reversibile!</strong>
					</p>
					<div class="mb-4">
						<label for="reset-confirm" class="block text-sm font-medium text-gray-700 mb-1">
							Digita "RESET" per confermare
						</label>
						<input
							id="reset-confirm"
							type="text"
							bind:value={resetConfirm}
							class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
							placeholder="RESET"
						/>
					</div>
					<div class="flex gap-3">
						<button
							on:click={() => { showReset = false; resetConfirm = ''; }}
							class="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
						>
							Annulla
						</button>
						<button
							on:click={handleReset}
							class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
						>
							Reset
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
