export function formatZipcode(zipcode: string) {
    const zipcodeNormalized = zipcode.replace(/\D/g, "");

    return zipcodeNormalized;
}