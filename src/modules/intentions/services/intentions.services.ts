import { prismaClient } from "../../../shared/clients/prismaClient.js";
import { BadRequestError, NotFoundError } from "../../../shared/errors/httpErrors.js";
import { formatZipcode } from "../../../shared/helpers/zipcodeFormatter.js";
import { ZipcodeValidationService } from "../../../shared/zipcode/services/zipcodeValidation.services.js";
import type { ICreateIntention } from "../interfaces/createIntention.interface.js";
import type { IUpdateLeadId } from "../interfaces/updateIntention.interface.js";
import { IntentionsRepository } from "../repositories/intentions.repository.js";

class IntentionsServices {
    private readonly intentionsRepository: IntentionsRepository;
    constructor() {
        this.intentionsRepository = new IntentionsRepository();
    }

    async createIntention({ zipcode_start, zipcode_end }: ICreateIntention) {
        try {
            if (!zipcode_start || !zipcode_end) {
                throw new BadRequestError("Preencha as informações")
            }

            zipcode_start = formatZipcode(zipcode_start);
            zipcode_end = formatZipcode(zipcode_end)

            const zipcodeService = new ZipcodeValidationService();
            await zipcodeService.verifyZipcode(zipcode_start);
            await zipcodeService.verifyZipcode(zipcode_end);

            const intention = await this.intentionsRepository.createIntention({ zipcode_start, zipcode_end });

            return intention;

        } catch (e) {
            throw e;
        }
    };

    async updateLeadId({ intentionId, lead_id }: IUpdateLeadId) {
        try {
            if (!intentionId) {
                throw new BadRequestError("Informe o id!")
            }
            const intentionExists = await prismaClient.intention.findFirst({
                where: {
                    id: intentionId
                }
            });

            if (!intentionExists) {
                throw new NotFoundError("Intention não existe!")
            }
            if (intentionExists.lead_id) {
                throw new BadRequestError("Intenção já possui um lead vinculado");
            }
            if (!lead_id) {
                throw new BadRequestError("O id do lead é necessário")
            }
            const leadExists = await prismaClient.lead.findFirst({
                where: {
                    id: lead_id
                },
            });

            if (!leadExists) {
                throw new NotFoundError("Lead não existe!");
            }
            if (leadExists.deleted_at) {
                throw new BadRequestError("Lead está inativo");
            }

            const intention = await this.intentionsRepository.updateLeadId({ intentionId, lead_id })

            return intention;
        } catch (e) {
            throw e;
        }

    }

}

export { IntentionsServices };