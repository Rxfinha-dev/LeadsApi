import type { FastifyReply, FastifyRequest } from "fastify";
import type { ICreateIntention } from "../interfaces/createIntention.interface.js";
import { IntentionsServices } from "../services/intentions.services.js";

class IntentionsController {
    async post(request: FastifyRequest, reply: FastifyReply) {
        const { zipcode_start, zipcode_end } = request.body as ICreateIntention;

        const intentionsServices = new IntentionsServices()
        const intention = await intentionsServices.createIntention({ zipcode_start, zipcode_end })
        reply.code(201).send(intention);

    }
}

export { IntentionsController };