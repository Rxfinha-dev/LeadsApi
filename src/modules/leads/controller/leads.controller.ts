import type { FastifyReply, FastifyRequest } from "fastify";
import type { ICreateLead } from "../interfaces/createLead.interface.js";
import { LeadsServices } from "../service/leads.services.js";

class LeadsController {
    async post(request: FastifyRequest, reply: FastifyReply) {
        const { name, email } = request.body as ICreateLead;

        const leadService = new LeadsServices()
        const lead = await leadService.createLead({ name, email })

        reply.code(201).send(lead);
    }
}

export { LeadsController };