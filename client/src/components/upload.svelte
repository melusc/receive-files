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
	import {makeDirectoryInput, uniqueKey} from '../utilities.ts';

	import Files from './files.svelte';

	let uploading = $state(false);
	let files = $state<readonly FileKeyed[]>([]);

	let formReference = $state<HTMLFormElement>();
	let folderReference = $state<HTMLInputElement>();
	let fileReference = $state<HTMLInputElement>();

	function handleInput(event: Event) {
		event.preventDefault();

		const newFiles = [
			...(folderReference!.files ?? []),
			...(fileReference!.files ?? []),
		];

		files = [
			...files,
			...newFiles.map(file => ({
				file,
				key: uniqueKey(),
			})),
		];

		formReference!.reset();
	}

	function removeFile(key: string) {
		files = files.filter(file => file.key !== key);
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const form = new FormData();

		for (const {file} of files) {
			form.append('file', file);
		}

		try {
			uploading = true;
			const request = await fetch('/upload', {
				method: 'POST',
				body: form,
			});

			await request.text();

			files = [];
		} catch {}

		uploading = false;
	}
</script>

<form bind:this={formReference} class="upload-form" onsubmit={handleSubmit}>
	<h1>File uploader</h1>

	<div>
		<button
			type="button"
			disabled={uploading}
			class="btn-secondary"
			onclick={() => {
				fileReference!.click();
			}}
		>
			Upload files
		</button>
		<button
			type="button"
			disabled={uploading}
			class="btn-secondary"
			onclick={() => {
				folderReference!.click();
			}}
		>
			or upload a directory
		</button>
	</div>

	<Files {files} onremove={removeFile} />

	<input
		bind:this={folderReference}
		multiple
		hidden
		name="folder"
		type="file"
		disabled={uploading}
		oninput={handleInput}
		use:makeDirectoryInput
	/>

	<input
		bind:this={fileReference}
		multiple
		hidden
		type="file"
		name="file"
		disabled={uploading}
		oninput={handleInput}
	/>
	<button
		type="submit"
		class="btn-primary btn-upload"
		disabled={uploading || files.length === 0}
	>
		{uploading ? 'Uploading...' : 'Submit'}
	</button>
</form>
