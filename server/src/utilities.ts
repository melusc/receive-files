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

import {networkInterfaces as getNetworkInterfaces} from 'node:os';

export const getNetworkAddress = (): string | undefined => {
	const networkInterfaces = getNetworkInterfaces();
	for (const interfaceDetails of Object.values(networkInterfaces)) {
		if (!interfaceDetails) {
			continue;
		}

		for (const details of interfaceDetails) {
			const {address, family, internal} = details;

			if (family === 'IPv4' && !internal) {
				return address;
			}
		}
	}

	return undefined;
};
