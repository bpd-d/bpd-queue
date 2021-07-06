/**
 * Generates random string with length of 6
 * @returns string
 */
function generateRandomString(): string {
	return Math.random().toString().substr(2, 8);
}

/**
 * Create an random string generator
 */
export function* generator(): Iterator<string> {
	let count = 0;
	while (count < Number.MAX_SAFE_INTEGER) {
		if (count > 1000000) {
			count = 0;
		}
		count += 1;
		yield generateRandomString() + count;
	}
}
