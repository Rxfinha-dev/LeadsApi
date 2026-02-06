import { BadRequestError, NotFoundError } from "../../../errors/httpErrors.js";
import { isValidZipcode } from "../../isValidZipcode.helper.js";
import { formatZipcode } from "../../zipcodeFormatter.helper.js";
import type { IZipcodeValidation } from "../interfaces/zipcodeValidation.interface.js";

class ZipcodeValidationService {
    async verifyZipcode(zipcode: string): Promise<IZipcodeValidation> {      

        if (!isValidZipcode(zipcode)) {
            throw new BadRequestError("CEP inválido");
        }
        const response = await fetch(
            `https://viacep.com.br/ws/${zipcode}/json/`
        );

        if (!response.ok) {
            throw new BadRequestError("CEP inválido");
        }

        const data: IZipcodeValidation = await response.json();

        if (data.erro) {
            throw new BadRequestError("Cep não existe!")
        }

        return data;
    }
}

export { ZipcodeValidationService };