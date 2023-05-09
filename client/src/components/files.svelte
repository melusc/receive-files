<script lang="ts">
	import type {FileKeyed} from '../types.d.ts';

	import File from './file.svelte';

	export let files: readonly FileKeyed[];
</script>

{#if files.length > 0}
	<h2>Files to upload</h2>
	<div class="files-list">
		{#each files as {file, key} (key)}
			<File {key} {file} on:remove />
		{/each}
	</div>
{/if}
