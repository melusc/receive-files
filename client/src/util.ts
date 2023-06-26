export function formatFileSize(bytes: number) {
	const thresh = 1024;

	if (Math.abs(bytes) < thresh) {
		return `${bytes} B`;
	}

	const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	let u = -1;

	do {
		bytes /= thresh;
		++u;
	} while (
		Math.round(Math.abs(bytes) * 10) / 10 >= thresh
		&& u < units.length - 1
	);

	return `${bytes.toFixed(1)} ${units[u]!}`;
}

let counter = 0;
export function uniqueKey(): string {
	return `${counter++}`;
}

// The types don't allow directory and webkitdirectory
// I haven't figured out a way to suppress those errors
export function makeDirectoryInput(node: HTMLInputElement) {
	node.setAttribute('directory', 'directory');
	node.setAttribute('webkitdirectory', 'webkitdirectory');
}
