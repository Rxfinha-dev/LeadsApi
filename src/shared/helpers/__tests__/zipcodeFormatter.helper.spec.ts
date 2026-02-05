import { formatZipcode } from "../zipcodeFormatter.helper.js";

describe("formatZipcode", () => {
  it("deve remover hífen do CEP", () => {
    const result = formatZipcode("18020-000");
    expect(result).toBe("18020000");
  });

  it("deve remover espaços", () => {
    const result = formatZipcode(" 18020 000 ");
    expect(result).toBe("18020000");
  });

  it("deve remover letras", () => {
    const result = formatZipcode("18a020b000");
    expect(result).toBe("18020000");
  });

  it("deve remover caracteres especiais", () => {
    const result = formatZipcode("18.020-000");
    expect(result).toBe("18020000");
  });

  it("deve retornar apenas números quando já estiver normalizado", () => {
    const result = formatZipcode("18020000");
    expect(result).toBe("18020000");
  });

  it("deve retornar string vazia se não houver números", () => {
    const result = formatZipcode("abc---");
    expect(result).toBe("");
  });
});
