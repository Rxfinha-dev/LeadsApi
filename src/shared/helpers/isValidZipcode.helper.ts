export function isValidZipcode(zipcode: string): boolean {
    return /^[0-9]{8}$/.test(zipcode);
}