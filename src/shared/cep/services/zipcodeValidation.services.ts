import { isValidZipcode } from "../../helpers/isValidZipcode.helper.js";
import type { IZipcodeValidation } from "../interfaces/zipcodeValidation.interface.js";

class ZipcodeValidationService {
    async verifyZipcode(cep: string): Promise<IZipcodeValidation> {
        const zipcodeNormalized = cep.replace(/\D/g, "");

        if (!isValidZipcode(zipcodeNormalized)) {
            throw new Error("CEP inválido");
        }
        const response = await fetch(
            `https://viacep.com.br/ws/${zipcodeNormalized}/json/`
        );

        if (!response.ok) {
            throw new Error("Erro ao consultar o ViaCEP");
        }

        const data: IZipcodeValidation = await response.json();

        if (data.erro) {
            throw new Error("CEP não encontrado");
        }

        return data;
    }
}

export { ZipcodeValidationService };