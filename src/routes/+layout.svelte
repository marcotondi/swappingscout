<script lang="ts">
	import '../app.css';
	
	let version = '2.0.0';
</script>

<div class="min-h-screen bg-gray-50">
	<nav class="bg-indigo-600 text-white shadow-lg">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<div class="flex items-center space-x-8">
					<a href="/" class="flex items-center space-x-2">
						<span class="text-xl font-bold">SwappingScout</span>
						<span class="text-xs bg-indigo-500 px-2 py-1 rounded">v{version}</span>
					</a>
					<div class="hidden md:flex space-x-4">
						<a href="/" class="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium">Home</a>
						<a href="/consumatori" class="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium">Partecipanti</a>
						<a href="/magazzino" class="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium">Magazzino</a>
						<a href="/scambio" class="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium">Scambio</a>
					</div>
				</div>
			</div>
		</div>
	</nav>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<slot />
	</main>
</div>
