<script lang="ts">
	import { onMount } from 'svelte';
	import { consumers, objects } from '$lib/stores';
	import { getAllConsumers, addConsumer, updateConsumer, deleteConsumer, getAllObjects } from '$lib/db';
	import { exportConsumers, importConsumers, downloadCSV } from '$lib/csv';
	import type { Consumer } from '$lib/types';

	let editingId: number | null = null;
	let name = '';
	let firstChoice = '';
	let secondChoice = '';
	let thirdChoice = '';
	let searchTerm = '';
	let error = '';
	let csvFile: FileList | null = null;

	$: filteredConsumers = $consumers.filter(c => 
		c.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	$: objectCodes = $objects.map(o => o.code);

	onMount(async () => {
		$consumers = await getAllConsumers();
		$objects = await getAllObjects();
	});

	function resetForm() {
		editingId = null;
		name = '';
		firstChoice = '';
		secondChoice = '';
		thirdChoice = '';
		error = '';
	}

	function validateForm(): boolean {
		if (!name.trim()) {
			error = 'Il nome è obbligatorio';
			return false;
		}

		if (!firstChoice) {
			error = 'La prima scelta è obbligatoria';
			return false;
		}

		const choices = [firstChoice, secondChoice, thirdChoice].filter(Boolean);
		if (new Set(choices).size !== choices.length) {
			error = 'Le scelte devono essere diverse';
			return false;
		}

		const existing = $consumers.find(c => 
			c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== editingId
		);
		if (existing) {
			error = 'Esiste già un consumatore con questo nome';
			return false;
		}

		return true;
	}

	async function handleSubmit() {
		if (!validateForm()) return;

		const obj = [];
		if (firstChoice) obj.push({ label: firstChoice, bet: 15, assign: false });
		if (secondChoice) obj.push({ label: secondChoice, bet: 10, assign: false });
		if (thirdChoice) obj.push({ label: thirdChoice, bet: 5, assign: false });

		const consumer = { name: name.trim(), obj };

		if (editingId !== null) {
			await updateConsumer(editingId, consumer);
		} else {
			await addConsumer(consumer);
		}

		$consumers = await getAllConsumers();
		resetForm();
	}

	function editConsumer(consumer: Consumer) {
		editingId = consumer.id || null;
		name = consumer.name;
		firstChoice = consumer.obj[0]?.label || '';
		secondChoice = consumer.obj[1]?.label || '';
		thirdChoice = consumer.obj[2]?.label || '';
	}

	async function removeConsumer(id: number) {
		if (!confirm('Sei sicuro di voler eliminare questo consumatore?')) return;
		await deleteConsumer(id);
		$consumers = await getAllConsumers();
	}

	function handleExport() {
		const csv = exportConsumers($consumers);
		downloadCSV(csv, `consumers_${new Date().toISOString().split('T')[0]}.csv`);
	}

	async function handleImport() {
		if (!csvFile || csvFile.length === 0) return;
		
		const text = await csvFile[0].text();
		const imported = importConsumers(text);
		
		for (const consumer of imported) {
			await addConsumer(consumer);
		}
		
		$consumers = await getAllConsumers();
		csvFile = null;
	}
</script>

<div class="space-y-6">
	<h1 class="text-3xl font-bold text-gray-900">Gestione Partecipanti</h1>

	<!-- Form -->
	<div class="bg-white p-6 rounded-lg shadow">
		<h2 class="text-lg font-semibold mb-4">
			{editingId !== null ? 'Modifica' : 'Nuovo'} Partecipante
		</h2>
		
		{#if error}
			<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
				{error}
			</div>
		{/if}

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label for="consumer-name" class="block text-sm font-medium text-gray-700 mb-1">Nome e Cognome</label>
				<input
					id="consumer-name"
					type="text"
					bind:value={name}
					class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
					placeholder="Mario Rossi"
				/>
			</div>
			<div>
				<label for="first-choice" class="block text-sm font-medium text-gray-700 mb-1">1° Scelta (bet 15)</label>
				<select id="first-choice" bind:value={firstChoice} class="w-full border border-gray-300 rounded-md px-3 py-2">
					<option value="">Seleziona...</option>
					{#each objectCodes as code}
						<option value={code}>{code}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="second-choice" class="block text-sm font-medium text-gray-700 mb-1">2° Scelta (bet 10)</label>
				<select id="second-choice" bind:value={secondChoice} class="w-full border border-gray-300 rounded-md px-3 py-2">
					<option value="">Seleziona...</option>
					{#each objectCodes as code}
						<option value={code}>{code}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="third-choice" class="block text-sm font-medium text-gray-700 mb-1">3° Scelta (bet 5)</label>
				<select id="third-choice" bind:value={thirdChoice} class="w-full border border-gray-300 rounded-md px-3 py-2">
					<option value="">Seleziona...</option>
					{#each objectCodes as code}
						<option value={code}>{code}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="mt-4 flex space-x-2">
			<button
				on:click={handleSubmit}
				class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
			>
				{editingId !== null ? 'Aggiorna' : 'Salva'}
			</button>
			{#if editingId !== null}
				<button
					on:click={resetForm}
					class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
				>
					Annulla
				</button>
			{/if}
		</div>
	</div>

	<!-- Import/Export CSV -->
	<div class="bg-white p-6 rounded-lg shadow flex flex-wrap gap-4 items-center">
		<button
			on:click={handleExport}
			class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
		>
			Esporta CSV
		</button>
		
		<div class="flex items-center space-x-2">
			<input
				type="file"
				accept=".csv"
				bind:files={csvFile}
				class="border border-gray-300 rounded-md px-3 py-2"
			/>
			<button
				on:click={handleImport}
				disabled={!csvFile}
				class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
			>
				Importa CSV
			</button>
		</div>
	</div>

	<!-- Tabella -->
	<div class="bg-white rounded-lg shadow overflow-hidden">
		<div class="p-4 border-b">
			<input
				type="text"
				bind:value={searchTerm}
				placeholder="Cerca per nome..."
				class="w-full md:w-64 border border-gray-300 rounded-md px-3 py-2"
			/>
			<span class="ml-4 text-sm text-gray-500">{filteredConsumers.length} partecipanti</span>
		</div>
		
		<table class="min-w-full divide-y divide-gray-200">
			<thead class="bg-gray-50">
				<tr>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">1° Scelta</th>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">2° Scelta</th>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">3° Scelta</th>
					<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
				</tr>
			</thead>
			<tbody class="bg-white divide-y divide-gray-200">
				{#each filteredConsumers as consumer}
					<tr>
						<td class="px-6 py-4 whitespace-nowrap">{consumer.name}</td>
						<td class="px-6 py-4 whitespace-nowrap">{consumer.obj[0]?.label || '-'}</td>
						<td class="px-6 py-4 whitespace-nowrap">{consumer.obj[1]?.label || '-'}</td>
						<td class="px-6 py-4 whitespace-nowrap">{consumer.obj[2]?.label || '-'}</td>
						<td class="px-6 py-4 whitespace-nowrap text-right space-x-2">
							<button
								on:click={() => editConsumer(consumer)}
								class="text-indigo-600 hover:text-indigo-900"
							>
								Modifica
							</button>
							<button
								on:click={() => removeConsumer(consumer.id!)}
								class="text-red-600 hover:text-red-900"
							>
								Elimina
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
