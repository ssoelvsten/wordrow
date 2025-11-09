/** Normalizes a string by removing diacratics.
 *
 * // https://stackoverflow.com/a/37511463
 */
export const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "");