<script lang="ts">
	import {formatFileSize} from '../utilities.ts';

	import Close from './close.svelte';

	const {
		file,
		key,
		onremove,
	}: {
		file: File;
		key: string;
		onremove: (key: string) => void;
	} = $props();

	function removeFile(key: string) {
		return () => {
			onremove(key);
		};
	}
</script>

<div class="file">
	<span>{file.name} ({formatFileSize(file.size)})</span>
	<button type="button" class="btn-close" onclick={removeFile(key)}>
		<Close />
	</button>
</div>
