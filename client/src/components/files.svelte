<script lang="ts">
	import type {FileKeyed} from '../types.d.ts';

	import File from './file.svelte';

	const {files, onremove} = $props<{
		files: readonly FileKeyed[];
		onremove: (key: string) => void;
	}>();
</script>

{#if files.length > 0}
	<h2>Files to upload</h2>
	<div class="files-list">
		{#each files as {file, key} (key)}
			<File {key} {file} {onremove} />
		{/each}
	</div>
{/if}
