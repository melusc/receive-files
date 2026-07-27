<!--!
	This file is part of receive-files, software to easily receive files
	over the network.
	Copyright (C) 2026, Luca Schnellmann <oss@lusc.ch>

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->

<script lang="ts">
	import type {FileKeyed} from '../types.d.ts';

	import File from './file.svelte';

	const {
		files,
		onremove,
	}: {
		files: readonly FileKeyed[];
		onremove: (key: string) => void;
	} = $props();
</script>

{#if files.length > 0}
	<h2>Files to upload</h2>
	<div class="files-list">
		{#each files as { file, key } (key)}
			<File {key} {file} {onremove} />
		{/each}
	</div>
{/if}
