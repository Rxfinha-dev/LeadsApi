import type { FastifyReply, FastifyRequest } from "fastify";
import type { ICreateIntention } from "../interfaces/createIntention.interface.js";
import { IntentionsServices } from "../services/intentions.services.js";

class IntentionsController {
    private readonly intentionsServices: IntentionsServices;
    constructor() {
        this.intentionsServices = new IntentionsServices();
    }
    async post(request: FastifyRequest, reply: FastifyReply) {
        const { zipcode_start, zipcode_end } = request.body as ICreateIntention;

        const intention = await this.intentionsServices.createIntention({ zipcode_start, zipcode_end })
        reply.code(201).send(intention);

    }

    async put(request: FastifyRequest, reply: FastifyReply) {
        const { intentionId } = request.params as { intentionId: string };
        const { lead_id } = request.body as { lead_id: string };

        const intention = await this.intentionsServices.updateLeadId({ intentionId, lead_id })
        return reply.send(intention)
    }
}

export { IntentionsController };