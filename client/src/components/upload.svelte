<script lang="ts">
	import type {FileKeyed} from '../types.d.ts';
	import {makeDirectoryInput, uniqueKey} from '../util.ts';

	import Files from './files.svelte';

	let uploading = false;
	let files: readonly FileKeyed[] = [];

	let formReference: HTMLFormElement;
	let folderReference: HTMLInputElement;
	let fileReference: HTMLInputElement;

	function handleInput() {
		const newFiles = [
			...(folderReference.files ?? []),
			...(fileReference.files ?? []),
		];

		files = [
			...files,
			...newFiles.map(file => ({
				file,
				key: uniqueKey(),
			})),
		];

		formReference.reset();
	}

	function removeFile(event: CustomEvent<string>) {
		const key = event.detail;
		files = files.filter(file => file.key !== key);
	}

	async function handleSubmit() {
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

<form
	bind:this={formReference}
	class="upload-form"
	on:submit|preventDefault={handleSubmit}
>
	<h1>File uploader</h1>

	<div>
		<button
			type="button"
			disabled={uploading}
			class="btn-secondary"
			on:click={() => {
				fileReference.click();
			}}
		>
			Upload files
		</button>
		<button
			type="button"
			disabled={uploading}
			class="btn-secondary"
			on:click={() => {
				folderReference.click();
			}}
		>
			or upload a directory
		</button>
	</div>

	<Files {files} on:remove={removeFile} />

	<input
		bind:this={folderReference}
		multiple
		hidden
		name="folder"
		type="file"
		disabled={uploading}
		on:input|preventDefault={handleInput}
		use:makeDirectoryInput
	/>

	<input
		bind:this={fileReference}
		multiple
		hidden
		type="file"
		name="file"
		disabled={uploading}
		on:input|preventDefault={handleInput}
	/>
	<button
		type="submit"
		class="btn-primary btn-upload"
		disabled={uploading || files.length === 0}
	>
		{uploading ? 'Uploading...' : 'Submit'}
	</button>
</form>
