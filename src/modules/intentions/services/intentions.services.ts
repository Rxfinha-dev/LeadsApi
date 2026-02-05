import {ZipcodeValidationService } from "../../../shared/cep/services/zipcodeValidation.services.js";
import type { ICreateIntention } from "../interfaces/createIntention.interface.js";
import type { IUpdateLeadId } from "../interfaces/updateIntention.interface.js";
import { IntentionsRepository } from "../repositories/intentions.repository.js";

class IntentionsServices {

    async createIntention({ zipcode_start, zipcode_end }: ICreateIntention) {
        try {
            if (!zipcode_start || !zipcode_end) {
                throw new Error("Preencha todos os campos!")
            }

            const zipcodeService = new ZipcodeValidationService();
            await zipcodeService.verifyZipcode(zipcode_start);
            await zipcodeService.verifyZipcode(zipcode_end);

            const intentionsRepository = new IntentionsRepository();
            const intention = await intentionsRepository.createIntention({ zipcode_start, zipcode_end });

            return intention;

        } catch (e) {
            if (e instanceof Error) {
                throw new Error(e.message);
            }
        }
    };

    async updateLeadId({ lead_id }: IUpdateLeadId) {
        //lógica para vincualr o id do lead à intention

    }

}

export { IntentionsServices };