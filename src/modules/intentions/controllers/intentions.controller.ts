import type { FastifyReply, FastifyRequest } from "fastify";
import type { ICreateIntention } from "../interfaces/createIntention.interface.js";
import { IntentionsServices } from "../services/intentions.services.js";
import { BadRequestError } from "../../../shared/errors/httpErrors.js";
import { formatZipcode } from "../../../shared/helpers/zipcodeFormatter.helper.js";

class IntentionsController {
    private readonly intentionsServices: IntentionsServices;
    constructor() {
        this.intentionsServices = new IntentionsServices();
    }
    async createIntention(request: FastifyRequest, reply: FastifyReply) {
        const { zipcode_start, zipcode_end } = request.body as ICreateIntention;

        if (!zipcode_start || !zipcode_end) {
            throw new BadRequestError("Preencha as informações")
        }

        const formattedZipcodeStart = formatZipcode(zipcode_start);
        const formattedZipcodeEnd = formatZipcode(zipcode_end);

        const intention = await this.intentionsServices.createIntention({ zipcode_start: formattedZipcodeStart, zipcode_end: formattedZipcodeEnd })
        reply.code(201).send(intention);

    }

    async updateLeadId(request: FastifyRequest, reply: FastifyReply) {
        const { intention_id } = request.params as { intention_id: string };
        const { lead_id } = request.body as { lead_id: string };
      

        if (!intention_id) {
            throw new BadRequestError("Informe o id!")
        }

        if (!lead_id) {
            throw new BadRequestError("O id do lead é necessário")
        }

        const intention = await this.intentionsServices.updateLeadId({ intention_id, lead_id})
        return reply.send(intention)
    }
}

export { IntentionsController };