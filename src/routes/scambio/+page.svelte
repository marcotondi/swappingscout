<script lang="ts">
	import { onMount } from 'svelte';
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

	$: deliveredCount = filteredResults.filter(r => !r.id).length; // Hack: risultati non salvati
	$: totalBet = filteredResults.reduce((sum, r) => sum + r.bet, 0);
	$: totalPoints = filteredResults.reduce((sum, r) => sum + r.point, 0);

	onMount(async () => {
		$consumers = await getAllConsumers();
		$objects = await getAllObjects();
		$results = await getAllResults();
	});

	async function handleStartSwap() {
		if ($consumers.length === 0 || $objects.length === 0) {
			error = 'Aggiungi prima consumatori e oggetti';
			return;
		}
		showConfirm = true;
	}

	async function confirmSwap() {
		showConfirm = false;
		
		// Clear previous results
		await clearResults();
		
		const params: SwapParams = {
			order: $swapSettings.order,
			oneObj: $swapSettings.oneObj
		};

		const swapResults = runSwap($consumers, $objects, params);
		
		// Save results to DB
		for (const result of swapResults) {
			await addResult(result);
		}
		
		$results = await getAllResults();
	}

	async function handleDelivered(result: SwapResult) {
		if (!confirm('Confermi che questo oggetto è stato consegnato?')) return;
		
		// Find and delete the object
		const obj = $objects.find(o => o.code === result.label);
		if (obj?.id) {
			await deleteObject(obj.id);
		}
		
		// Delete result
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

<div class="space-y-6">
	<h1 class="text-3xl font-bold text-gray-900">Scambio</h1>

	{#if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
			{error}
		</div>
	{/if}

	<!-- Impostazioni -->
	<div class="bg-white p-6 rounded-lg shadow">
		<h2 class="text-lg font-semibold mb-4">Impostazioni</h2>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label class="flex items-center space-x-2">
					<input
						type="checkbox"
						bind:checked={$swapSettings.oneObj}
						class="w-4 h-4 text-indigo-600"
					/>
					<span>Oggetto unico per consumatore</span>
				</label>
			</div>
			<div>
				<label for="sort-order" class="block text-sm font-medium text-gray-700 mb-1">Ordinamento</label>
				<select id="sort-order" bind:value={$swapSettings.order} class="w-full border border-gray-300 rounded-md px-3 py-2">
					<option value="decreasing">Decrescente (default)</option>
					<option value="increasing">Crescente</option>
				</select>
			</div>
		</div>
	</div>

	<!-- Azioni -->
	<div class="bg-white p-6 rounded-lg shadow flex flex-wrap gap-4">
		<button
			on:click={handleStartSwap}
			class="bg-purple-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 shadow-lg"
		>
			🚀 Avvia Scambio
		</button>
		
		{#if $results.length > 0}
			<button
				on:click={handleExport}
				class="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700"
			>
				Esporta Risultati
			</button>
		{/if}
		
		<button
			on:click={() => showReset = true}
			class="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700"
		>
			Reset Completo
		</button>
	</div>

	<!-- Riepilogo -->
	{#if $results.length > 0}
		<div class="bg-white p-6 rounded-lg shadow">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
				<div>
					<p class="text-2xl font-bold text-indigo-600">{$results.length}</p>
					<p class="text-sm text-gray-500">Assegnazioni</p>
				</div>
				<div>
					<p class="text-2xl font-bold text-green-600">{totalBet}</p>
					<p class="text-sm text-gray-500">Totale Puntate</p>
				</div>
				<div>
					<p class="text-2xl font-bold text-blue-600">{totalPoints.toFixed(2)}</p>
					<p class="text-sm text-gray-500">Totale Punti</p>
				</div>
				<div>
					<p class="text-2xl font-bold text-purple-600">{$consumers.length}</p>
					<p class="text-sm text-gray-500">Partecipanti</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Tabella Risultati -->
	{#if $results.length > 0}
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<div class="p-4 border-b">
				<input
					type="text"
					bind:value={searchTerm}
					placeholder="Cerca per nome o oggetto..."
					class="w-full md:w-64 border border-gray-300 rounded-md px-3 py-2"
				/>
				<span class="ml-4 text-sm text-gray-500">{filteredResults.length} risultati</span>
			</div>
			
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oggetto</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntata</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punti</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each filteredResults as result}
						<tr>
							<td class="px-6 py-4 whitespace-nowrap">{result.consumer}</td>
							<td class="px-6 py-4 whitespace-nowrap font-mono">{result.label}</td>
							<td class="px-6 py-4 whitespace-nowrap">{result.bet}</td>
							<td class="px-6 py-4 whitespace-nowrap">{result.point.toFixed(2)}</td>
							<td class="px-6 py-4 whitespace-nowrap text-right">
								<button
									on:click={() => handleDelivered(result)}
									class="text-green-600 hover:text-green-900"
								>
									✓ Consegnato
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<!-- Modale Conferma Scambio -->
	{#if showConfirm}
		<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
				<h3 class="text-lg font-semibold mb-4">Conferma Scambio</h3>
				<p class="text-gray-600 mb-4">
					Stai per avviare l'algoritmo con:<br>
					• {$consumers.length} consumatori<br>
					• {$objects.length} oggetti<br>
					• Ordinamento: {$swapSettings.order}<br>
					• Oggetto unico: {$swapSettings.oneObj ? 'Sì' : 'No'}
				</p>
				<p class="text-red-600 text-sm mb-4">⚠️ Questa azione cancellerà i risultati precedenti</p>
				<div class="flex space-x-2">
					<button
						on:click={confirmSwap}
						class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
					>
						Avvia
					</button>
					<button
						on:click={() => showConfirm = false}
						class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
					>
						Annulla
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Modale Reset -->
	{#if showReset}
		<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
				<h3 class="text-lg font-semibold mb-4 text-red-600">⚠️ Reset Completo</h3>
				<p class="text-gray-600 mb-4">
					Questa azione cancellerà TUTTI i dati (consumatori, oggetti, risultati).<br>
					<strong>Non è reversibile!</strong>
				</p>
				<div class="mb-4">
					<label for="reset-confirm" class="block text-sm font-medium text-gray-700 mb-1">
						Digita "RESET" per confermare
					</label>
					<input
						id="reset-confirm"
						type="text"
						bind:value={resetConfirm}
						class="w-full border border-gray-300 rounded-md px-3 py-2"
						placeholder="RESET"
					/>
				</div>
				<div class="flex space-x-2">
					<button
						on:click={handleReset}
						class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
					>
						Reset
					</button>
					<button
						on:click={() => { showReset = false; resetConfirm = ''; }}
						class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
					>
						Annulla
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
