<script lang="ts">
	import { onMount } from 'svelte';
	import { objects } from '$lib/stores';
	import { getAllObjects, addObject, updateObject, deleteObject } from '$lib/db';
	import { exportObjects, importObjects, downloadCSV } from '$lib/csv';
	import type { ScoutObject } from '$lib/types';

	let editingId: number | null = null;
	let code = '';
	let description = '';
	let searchTerm = '';
	let error = '';
	let csvFile: FileList | null = null;

	$: filteredObjects = $objects.filter(o => 
		o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
		o.description.toLowerCase().includes(searchTerm.toLowerCase())
	);

	onMount(async () => {
		$objects = await getAllObjects();
	});

	function resetForm() {
		editingId = null;
		code = '';
		description = '';
		error = '';
	}

	function validateForm(): boolean {
		if (!code.trim()) {
			error = 'Il codice è obbligatorio';
			return false;
		}

		if (!description.trim()) {
			error = 'La descrizione è obbligatoria';
			return false;
		}

		const existing = $objects.find(o => 
			o.code.toLowerCase() === code.trim().toLowerCase() && o.id !== editingId
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
			code: code.trim().toLowerCase(), 
			description: description.trim() 
		};

		if (editingId !== null) {
			await updateObject(editingId, obj);
		} else {
			await addObject(obj);
		}

		$objects = await getAllObjects();
		resetForm();
	}

	function editObject(object: ScoutObject) {
		editingId = object.id || null;
		code = object.code;
		description = object.description;
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
		
		for (const obj of imported) {
			await addObject(obj);
		}
		
		$objects = await getAllObjects();
		csvFile = null;
	}
</script>

<div class="space-y-6">
	<h1 class="text-3xl font-bold text-gray-900">Gestione Magazzino</h1>

	<!-- Form -->
	<div class="bg-white p-6 rounded-lg shadow">
		<h2 class="text-lg font-semibold mb-4">
			{editingId !== null ? 'Modifica' : 'Nuovo'} Oggetto
		</h2>
		
		{#if error}
			<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
				{error}
			</div>
		{/if}

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label for="object-code" class="block text-sm font-medium text-gray-700 mb-1">Codice</label>
				<input
					id="object-code"
					type="text"
					bind:value={code}
					class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
					placeholder="A1"
				/>
			</div>
			<div>
				<label for="object-description" class="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
				<input
					id="object-description"
					type="text"
					bind:value={description}
					class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
					placeholder="Peluche orso"
				/>
			</div>
		</div>

		<div class="mt-4 flex space-x-2">
			<button
				on:click={handleSubmit}
				class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
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
				placeholder="Cerca per codice o descrizione..."
				class="w-full md:w-64 border border-gray-300 rounded-md px-3 py-2"
			/>
			<span class="ml-4 text-sm text-gray-500">{filteredObjects.length} oggetti</span>
		</div>
		
		<table class="min-w-full divide-y divide-gray-200">
			<thead class="bg-gray-50">
				<tr>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Codice</th>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrizione</th>
					<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
				</tr>
			</thead>
			<tbody class="bg-white divide-y divide-gray-200">
				{#each filteredObjects as object}
					<tr>
						<td class="px-6 py-4 whitespace-nowrap font-mono">{object.code}</td>
						<td class="px-6 py-4 whitespace-nowrap">{object.description}</td>
						<td class="px-6 py-4 whitespace-nowrap text-right space-x-2">
							<button
								on:click={() => editObject(object)}
								class="text-indigo-600 hover:text-indigo-900"
							>
								Modifica
							</button>
							<button
								on:click={() => removeObject(object.id!)}
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
