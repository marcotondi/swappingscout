<script lang="ts">
	import { browser } from '$app/environment';
	import { consumers, objects } from '$lib/stores';
	import { getAllConsumers, addConsumer, updateConsumer, deleteConsumer, clearConsumers, getAllObjects } from '$lib/db';
	import { exportConsumers, importConsumers, downloadCSV, normalizeCode } from '$lib/csv';
	import type { Consumer } from '$lib/types';

	let editingId: number | null = null;
	let name = '';
	let firstChoice = '';
	let secondChoice = '';
	let thirdChoice = '';
	let searchTerm = '';
	let error = '';
	let csvFile: FileList | null = null;
	let showModal = false;

	let sortField: 'name' | 'firstChoice' | 'secondChoice' | 'thirdChoice' = 'name';
	let sortDir: 'asc' | 'desc' = 'asc';

	$: objectOptions = $objects
		.slice()
		.sort((a, b) => a.code.localeCompare(b.code));

	$: filteredConsumers = $consumers
		.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
		.sort((a, b) => {
			let valA: string, valB: string;
			switch (sortField) {
				case 'firstChoice':
					valA = a.obj[0]?.label || '';
					valB = b.obj[0]?.label || '';
					break;
				case 'secondChoice':
					valA = a.obj[1]?.label || '';
					valB = b.obj[1]?.label || '';
					break;
				case 'thirdChoice':
					valA = a.obj[2]?.label || '';
					valB = b.obj[2]?.label || '';
					break;
				default:
					valA = a.name;
					valB = b.name;
				}
			const cmp = valA.localeCompare(valB);
			return sortDir === 'asc' ? cmp : -cmp;
		});

	function toggleSort(field: typeof sortField) {
		if (sortField === field) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortDir = 'asc';
		}
	}

	if (browser) {
		getAllConsumers().then(data => consumers.set(data));
		getAllObjects().then(data => objects.set(data));
	}

	function openModal(consumer?: Consumer) {
		if (consumer) {
			editingId = consumer.id || null;
			name = consumer.name;
			firstChoice = consumer.obj[0]?.label || '';
			secondChoice = consumer.obj[1]?.label || '';
			thirdChoice = consumer.obj[2]?.label || '';
		} else {
			resetForm();
		}
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		resetForm();
	}

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
		closeModal();
	}

	function editConsumerClick(consumer: Consumer) {
		openModal(consumer);
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

		const objectCodes = new Set($objects.map(o => o.code));
		const errors: string[] = [];

		for (const consumer of imported) {
			const badChoices = consumer.obj
				.map(o => o.label)
				.filter(code => !objectCodes.has(normalizeCode(code)));

			if (badChoices.length > 0) {
				errors.push(`${consumer.name}: codici inesistenti — ${badChoices.join(', ')}`);
				continue;
			}
			await addConsumer(consumer);
		}

		$consumers = await getAllConsumers();
		csvFile = null;

		if (errors.length > 0) {
			alert(`Importazione completata con ${errors.length} errore/i:\n${errors.join('\n')}`);
		}
	}

	async function handleResetConsumers() {
		if (!confirm('Sei sicuro di voler eliminare TUTTI i partecipanti? Questa azione non è reversibile.')) return;
		await clearConsumers();
		$consumers = [];
	}
</script>

<svelte:head>
	<title>Gestione Partecipanti - SwappingScout</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900">Gestione Partecipanti</h1>
	</div>

	<!-- Toolbar -->
	<div class="flex flex-wrap items-center gap-3">
		<div class="relative flex-1 min-w-[200px] max-w-sm">
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

		<button
			on:click={() => openModal()}
			class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
			</svg>
			Aggiungi Partecipante
		</button>

		<button
			on:click={handleExport}
			class="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
			</svg>
			Esporta CSV
		</button>

		<button
			on:click={handleResetConsumers}
			class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
			</svg>
			Svuota
		</button>
	</div>

	<!-- Import CSV -->
	<div class="flex items-center gap-3">
		<input
			type="file"
			accept=".csv"
			bind:files={csvFile}
			class="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
		/>
		<button
			on:click={handleImport}
			disabled={!csvFile}
			class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
		>
			Importa CSV
		</button>
	</div>

	<!-- Table -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
		<table class="min-w-full">
			<thead>
				<tr class="border-b border-gray-100">
					<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700" on:click={() => toggleSort('name')}>
						<div class="flex items-center gap-1">
							Nome
							{#if sortField === 'name'}
								<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={sortDir === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}/></svg>
							{/if}
						</div>
					</th>
					<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700" on:click={() => toggleSort('firstChoice')}>
						<div class="flex items-center gap-1">
							Scelta 1
							{#if sortField === 'firstChoice'}
								<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={sortDir === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}/></svg>
							{/if}
						</div>
					</th>
					<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700" on:click={() => toggleSort('secondChoice')}>
						<div class="flex items-center gap-1">
							Scelta 2
							{#if sortField === 'secondChoice'}
								<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={sortDir === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}/></svg>
							{/if}
						</div>
					</th>
					<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700" on:click={() => toggleSort('thirdChoice')}>
						<div class="flex items-center gap-1">
							Scelta 3
							{#if sortField === 'thirdChoice'}
								<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={sortDir === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}/></svg>
							{/if}
						</div>
					</th>
					<th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Azioni</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each filteredConsumers as consumer}
					<tr class="hover:bg-gray-50 transition-colors">
						<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{consumer.name}</td>
						<td class="px-6 py-4 whitespace-nowrap">
							{#if consumer.obj[0]}
								<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">{consumer.obj[0].label}</span>
							{:else}
								<span class="text-gray-400 text-sm">-</span>
							{/if}
						</td>
						<td class="px-6 py-4 whitespace-nowrap">
							{#if consumer.obj[1]}
								<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{consumer.obj[1].label}</span>
							{:else}
								<span class="text-gray-400 text-sm">-</span>
							{/if}
						</td>
						<td class="px-6 py-4 whitespace-nowrap">
							{#if consumer.obj[2]}
								<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">{consumer.obj[2].label}</span>
							{:else}
								<span class="text-gray-400 text-sm">-</span>
							{/if}
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-right">
							<div class="flex items-center justify-end gap-2">
								<button
									on:click={() => editConsumerClick(consumer)}
									class="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center hover:bg-purple-200 transition-colors"
									title="Modifica"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
									</svg>
								</button>
								<button
									on:click={() => removeConsumer(consumer.id!)}
									class="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
									title="Elimina"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
									</svg>
								</button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if filteredConsumers.length === 0}
			<div class="px-6 py-12 text-center text-gray-400 text-sm">Nessun partecipante trovato</div>
		{/if}
	</div>

	<!-- Modal -->
	{#if showModal}
		<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={closeModal}>
			<div class="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" on:click|stopPropagation>
				<div class="p-6">
					<h2 class="text-xl font-bold text-gray-900 mb-6">
						{editingId !== null ? 'Modifica' : 'Nuovo'} Partecipante
					</h2>

					{#if error}
						<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
							{error}
						</div>
					{/if}

					<div class="space-y-4">
						<div>
							<label for="modal-name" class="block text-sm font-medium text-gray-700 mb-1">Nome e Cognome</label>
							<input
								id="modal-name"
								type="text"
								bind:value={name}
								class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								placeholder="Mario Rossi"
							/>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="modal-first" class="block text-sm font-medium text-gray-700 mb-1">Scelta 1</label>
								<select id="modal-first" bind:value={firstChoice} class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white">
									<option value="">Seleziona...</option>
									{#each objectOptions as obj}
										<option value={obj.code}>{obj.code} - {obj.description}</option>
									{/each}
								</select>
							</div>
							<div>
								<label for="modal-second" class="block text-sm font-medium text-gray-700 mb-1">Scelta 2</label>
								<select id="modal-second" bind:value={secondChoice} class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white">
									<option value="">Seleziona...</option>
									{#each objectOptions as obj}
										<option value={obj.code}>{obj.code} - {obj.description}</option>
									{/each}
								</select>
							</div>
						</div>

						<div>
							<label for="modal-third" class="block text-sm font-medium text-gray-700 mb-1">Scelta 3</label>
							<select id="modal-third" bind:value={thirdChoice} class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white">
								<option value="">Seleziona...</option>
								{#each objectOptions as obj}
									<option value={obj.code}>{obj.code} - {obj.description}</option>
								{/each}
							</select>
						</div>
					</div>

					<div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
						<button
							on:click={closeModal}
							class="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
						>
							Annulla
						</button>
						<button
							on:click={handleSubmit}
							class="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
						>
							Salva Partecipante
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
