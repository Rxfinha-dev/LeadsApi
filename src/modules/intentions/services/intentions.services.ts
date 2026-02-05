import { error } from "node:console";
import { prismaClient } from "../../../shared/clients/prismaClient.js";
import { BadRequestError, NotFoundError } from "../../../shared/errors/httpErrors.js";
import { ZipcodeValidationService } from "../../../shared/helpers/zipcode/services/zipcodeValidation.services.js";
import type { ICreateIntention } from "../interfaces/createIntention.interface.js";
import type { IUpdateLeadId } from "../interfaces/updateIntention.interface.js";
import { IntentionsRepository } from "../repositories/intentions.repository.js";

class IntentionsServices {
    private readonly intentionsRepository: IntentionsRepository;
    private readonly zipcodeService: ZipcodeValidationService;
    constructor() {
        this.intentionsRepository = new IntentionsRepository();
        this.zipcodeService = new ZipcodeValidationService
    }

    async createIntention({ zipcode_start, zipcode_end }: ICreateIntention) {
        try {

            await this.zipcodeService.verifyZipcode(zipcode_start);
            await this.zipcodeService.verifyZipcode(zipcode_end);

            const intention = await this.intentionsRepository.createIntention({ zipcode_start, zipcode_end });

            return intention;

        } catch (e) {
            console.error("Erro ao criar intention", error);
        }
    };

    async updateLeadId({ intention_id, lead_id }: IUpdateLeadId) {
        try {
            const intentionExists = await prismaClient.intention.findFirst({
                where: {
                    id: intention_id
                }
            });

            if (!intentionExists) {
                throw new NotFoundError("Intention não existe!")
            }
            if (intentionExists.lead_id) {
                throw new BadRequestError("Intenção já possui um lead vinculado");
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

            const intention = await this.intentionsRepository.updateLeadId({ intention_id, lead_id })

            return intention;
        } catch (e) {
            console.error("Erro ao atualizar intention", error);
        }

    }

}

export { IntentionsServices };