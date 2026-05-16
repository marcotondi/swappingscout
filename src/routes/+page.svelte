<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<div class="text-center py-12">
	<h1 class="text-4xl font-bold text-gray-900 mb-4">Benvenuto in SwappingScout</h1>
	<p class="text-lg text-gray-600 mb-8">Gestione baratto per mercatini scout</p>
	
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
		<button
			on:click={() => goto('/consumatori')}
			class="bg-indigo-600 text-white p-6 rounded-lg shadow hover:bg-indigo-700 transition"
		>
			<h2 class="text-xl font-semibold mb-2">Partecipanti</h2>
			<p class="text-sm">Gestisci i consumatori e le loro preferenze</p>
		</button>
		
		<button
			on:click={() => goto('/magazzino')}
			class="bg-green-600 text-white p-6 rounded-lg shadow hover:bg-green-700 transition"
		>
			<h2 class="text-xl font-semibold mb-2">Magazzino</h2>
			<p class="text-sm">Gestisci gli oggetti disponibili</p>
		</button>
		
		<button
			on:click={() => goto('/scambio')}
			class="bg-purple-600 text-white p-6 rounded-lg shadow hover:bg-purple-700 transition"
		>
			<h2 class="text-xl font-semibold mb-2">Scambio</h2>
			<p class="text-sm">Avvia l'algoritmo di matching</p>
		</button>
	</div>
</div>
