<script lang="ts">
	import { swapSettings } from '$lib/stores';
</script>

<svelte:head>
	<title>Impostazioni - SwappingScout</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900">Impostazioni</h1>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		<!-- Impostazioni Baratto -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
			<h2 class="text-lg font-semibold text-gray-900">Impostazioni Baratto</h2>

			<!-- Oggetto Unico -->
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-900">Oggetto Unico</p>
					<p class="text-xs text-gray-500">Un solo oggetto per partecipante</p>
				</div>
				<label class="relative inline-flex items-center cursor-pointer">
					<input type="checkbox" bind:checked={$swapSettings.oneObj} class="sr-only peer">
					<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
				</label>
			</div>

			<!-- Ordinamento -->
			<div>
				<p class="text-sm font-medium text-gray-900 mb-1.5">Ordinamento Oggetti</p>
				<select bind:value={$swapSettings.order} class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white">
					<option value="decreasing">Decrescente (più richiesti prima)</option>
					<option value="increasing">Crescente (meno richiesti prima)</option>
				</select>
				<p class="text-xs text-gray-400 mt-1">Definisce l'ordine in cui l'algoritmo processa gli oggetti</p>
			</div>
		</div>

		<!-- Info Card -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
			<h2 class="text-lg font-semibold text-gray-900">Informazioni</h2>

			<div class="space-y-3 text-sm text-gray-600">
				<p>
					<strong class="text-gray-900">Oggetto Unico:</strong> quando attivo, ogni partecipante può ricevere al massimo un oggetto. Le scelte a bet più alto vengono processate per prime.
				</p>
				<p>
					<strong class="text-gray-900">Ordinamento:</strong> "Decrescente" processa prima gli oggetti più richiesti (maggior competizione). "Crescente" processa prima quelli meno richiesti.
				</p>
				<p>
					<strong class="text-gray-900">Sistema Punti:</strong> 1° scelta = 15 punti, 2° scelta = 10 punti, 3° scelta = 5 punti. Il punto effettivo viene calcolato dividendo il bet per il numero totale di scelte del partecipante.
				</p>
			</div>
		</div>
	</div>
</div>
