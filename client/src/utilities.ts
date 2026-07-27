/*!
 * This file is part of receive-files, software to easily receive files
 * over the network.
 * Copyright (C) 2026, Luca Schnellmann <oss@lusc.ch>

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

export function formatFileSize(bytes: number) {
	if (Math.abs(bytes) < 1024) {
		return `${bytes} B`;
	}

	const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	let u = -1;

	do {
		bytes /= 1024;
		++u;
	} while (
		Math.round(Math.abs(bytes) * 10) / 10 >= 1024 &&
		u < units.length - 1
	);

	return `${bytes.toFixed(1)} ${units[u]!}`;
}

let counter = 0;
export function uniqueKey(): string {
	return String(counter++);
}

// The types don't allow directory and webkitdirectory
// I haven't figured out a way to suppress those errors
export function makeDirectoryInput(node: HTMLInputElement) {
	node.setAttribute('directory', 'directory');
	node.setAttribute('webkitdirectory', 'webkitdirectory');
}
