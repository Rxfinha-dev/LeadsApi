import type { FastifyReply, FastifyRequest } from "fastify";
import type { ICreateLead } from "../interfaces/createLead.interface.js";
import { LeadsServices } from "../services/leads.services.js";

class LeadsController {
    private readonly leadsServices: LeadsServices;
    constructor() {
        this.leadsServices = new LeadsServices();
    }
    async post(request: FastifyRequest, reply: FastifyReply) {
        const { name, email } = request.body as ICreateLead;


        const lead = await this.leadsServices.createLead({ name, email })

        reply.code(201).send(lead);
    }
}

export { LeadsController };