import { isValidZipcode } from "../isValidZipcode.helper.js";

describe("isValidZipcode", () => {
  it("deve retornar true para um CEP válido com 8 dígitos", () => {
    const result = isValidZipcode("18020000");
    expect(result).toBe(true);
  });

  it("deve retornar false para CEP com menos de 8 dígitos", () => {
    expect(isValidZipcode("1802000")).toBe(false);
  });

  it("deve retornar false para CEP com mais de 8 dígitos", () => {
    expect(isValidZipcode("180200000")).toBe(false);
  });

  it("deve retornar false para CEP com letras", () => {
    expect(isValidZipcode("18020abc")).toBe(false);
  });

  it("deve retornar false para CEP com caracteres especiais", () => {
    expect(isValidZipcode("18020-00")).toBe(false);
  });

  it("deve retornar false para string vazia", () => {
    expect(isValidZipcode("")).toBe(false);
  });
});
