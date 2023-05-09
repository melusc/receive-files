<script lang="ts">
	import type {FileKeyed} from '../types.d.ts';
	import {uniqueKey} from '../util.ts';

	import Files from './files.svelte';

	let uploading = false;
	let files: readonly FileKeyed[] = [];

	let formRef: HTMLFormElement;
	let folderRef: HTMLInputElement;
	let fileRef: HTMLInputElement;

	function handleInput() {
		const newFiles = [...(folderRef.files ?? []), ...(fileRef.files ?? [])];

		files = [
			...files,
			...newFiles.map(file => ({
				file,
				key: uniqueKey(),
			})),
		];

		formRef.reset();
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
	bind:this={formRef}
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
				fileRef.click();
			}}
		>
			Upload files
		</button>
		<button
			type="button"
			disabled={uploading}
			class="btn-secondary"
			on:click={() => {
				folderRef.click();
			}}
		>
			or upload a directory
		</button>
	</div>

	<Files {files} on:remove={removeFile} />

	<input
		bind:this={folderRef}
		multiple
		hidden
		directory="directory"
		name="folder"
		type="file"
		webkitdirectory="webkitdirectory"
		disabled={uploading}
		on:input|preventDefault={handleInput}
	/>

	<input
		bind:this={fileRef}
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
