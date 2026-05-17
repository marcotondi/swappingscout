<script lang="ts">
	import { browser } from '$app/environment';
	import { objects } from '$lib/stores';
	import { getAllObjects, addObject, updateObject, deleteObject, clearObjects } from '$lib/db';
	import { exportObjects, importObjects, downloadCSV, normalizeCode } from '$lib/csv';
	import type { ScoutObject } from '$lib/types';

	let editingId: number | null = null;
	let code = '';
	let description = '';
	let searchTerm = '';
	let error = '';
	let csvFile: FileList | null = null;
	let showModal = false;

	let sortField: 'code' | 'description' = 'code';
	let sortDir: 'asc' | 'desc' = 'asc';

	$: filteredObjects = $objects
		.filter(o =>
			o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
			o.description.toLowerCase().includes(searchTerm.toLowerCase())
		)
		.sort((a, b) => {
			const valA = sortField === 'code' ? a.code : a.description;
			const valB = sortField === 'code' ? b.code : b.description;
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
		getAllObjects().then(data => objects.set(data));
	}

	function openModal(object?: ScoutObject) {
		if (object) {
			editingId = object.id || null;
			code = object.code;
			description = object.description;
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
		code = '';
		description = '';
		error = '';
	}

	function validateForm(): boolean {
		const trimmed = code.trim();
		if (!trimmed) {
			error = 'Il codice è obbligatorio';
			return false;
		}

		if (!/^[a-zA-Z]\d{1,2}$/.test(trimmed)) {
			error = 'Il codice deve essere nel formato XYZ (es. A01, B10)';
			return false;
		}

		if (!description.trim()) {
			error = 'La descrizione è obbligatoria';
			return false;
		}

		const normalized = normalizeCode(trimmed);
		const existing = $objects.find(o =>
			o.code === normalized && o.id !== editingId
		);
		if (existing) {
			error = 'Esiste già un oggetto con questo codice';
			return false;
		}

		return true;
	}

	async function handleSubmit() {
		if (!validateForm()) return;

		const obj = {
			code: normalizeCode(code.trim()),
			description: description.trim()
		};

		if (editingId !== null) {
			await updateObject(editingId, obj);
		} else {
			await addObject(obj);
		}

		$objects = await getAllObjects();
		closeModal();
	}

	async function removeObject(id: number) {
		if (!confirm('Sei sicuro di voler eliminare questo oggetto?')) return;
		await deleteObject(id);
		$objects = await getAllObjects();
	}

	function handleExport() {
		const csv = exportObjects($objects);
		downloadCSV(csv, `objects_${new Date().toISOString().split('T')[0]}.csv`);
	}

	async function handleImport() {
		if (!csvFile || csvFile.length === 0) return;

		const text = await csvFile[0].text();
		const imported = importObjects(text);

		const errors: string[] = [];
		for (const obj of imported) {
			if (!/^[A-Z]\d{2}$/.test(obj.code)) {
				errors.push(`Codice non valido: ${obj.code}`);
				continue;
			}
			const exists = $objects.find(o => o.code === obj.code);
			if (exists) {
				errors.push(`Codice duplicato: ${obj.code}`);
				continue;
			}
			await addObject(obj);
		}

		$objects = await getAllObjects();
		csvFile = null;

		if (errors.length > 0) {
			alert(`Importazione completata con ${errors.length} errore/i:\n${errors.join('\n')}`);
		}
	}

	async function handleResetObjects() {
		if (!confirm('Sei sicuro di voler eliminare TUTTI gli oggetti? Questa azione non è reversibile.')) return;
		await clearObjects();
		$objects = [];
	}
</script>

<svelte:head>
	<title>Gestione Magazzino - SwappingScout</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900">Gestione Magazzino</h1>
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
			class="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
			</svg>
			Nuovo Oggetto
		</button>

		<button
			on:click={handleExport}
			class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
			</svg>
			Esporta CSV
		</button>

		<button
			on:click={handleResetObjects}
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
					<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700" on:click={() => toggleSort('code')}>
						<div class="flex items-center gap-1">
							Codice
							{#if sortField === 'code'}
								<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={sortDir === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}/></svg>
							{/if}
						</div>
					</th>
					<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700" on:click={() => toggleSort('description')}>
						<div class="flex items-center gap-1">
							Descrizione
							{#if sortField === 'description'}
								<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={sortDir === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}/></svg>
							{/if}
						</div>
					</th>
					<th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Azioni</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each filteredObjects as object}
					<tr class="hover:bg-gray-50 transition-colors">
						<td class="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">{object.code}</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{object.description}</td>
						<td class="px-6 py-4 whitespace-nowrap text-right">
							<div class="flex items-center justify-end gap-2">
								<button
									on:click={() => openModal(object)}
									class="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center hover:bg-purple-200 transition-colors"
									title="Modifica"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
									</svg>
								</button>
								<button
									on:click={() => removeObject(object.id!)}
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
		{#if filteredObjects.length === 0}
			<div class="px-6 py-12 text-center text-gray-400 text-sm">Nessun oggetto trovato</div>
		{/if}
	</div>

	<!-- Modal -->
	{#if showModal}
		<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={closeModal}>
			<div class="bg-white rounded-xl shadow-xl max-w-lg w-full" on:click|stopPropagation>
				<div class="p-6">
					<h2 class="text-xl font-bold text-gray-900 mb-6">
						{editingId !== null ? 'Modifica' : 'Nuovo'} Oggetto
					</h2>

					{#if error}
						<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
							{error}
						</div>
					{/if}

					<div class="space-y-4">
						<div>
							<label for="modal-code" class="block text-sm font-medium text-gray-700 mb-1">Codice</label>
							<input
								id="modal-code"
								type="text"
								bind:value={code}
								class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								placeholder="a1"
							/>
						</div>
						<div>
							<label for="modal-desc" class="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
							<input
								id="modal-desc"
								type="text"
								bind:value={description}
								class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								placeholder="Pantaloncino verde"
							/>
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
							class="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
						>
							Salva Oggetto
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
