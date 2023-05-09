<script lang="ts">
	import {createEventDispatcher} from 'svelte';

	import {formatFileSize} from '../util.ts';

	import Close from './close.svelte';

	export let file: File;
	export let key: string;

	const dispatch = createEventDispatcher<{
		remove: string;
	}>();

	function removeFile(key: string) {
		return () => {
			dispatch('remove', key);
		};
	}
</script>

<div class="file">
	<span>{file.name} ({formatFileSize(file.size)})</span>
	<button type="button" class="btn-close" on:click={removeFile(key)}>
		<Close />
	</button>
</div>
