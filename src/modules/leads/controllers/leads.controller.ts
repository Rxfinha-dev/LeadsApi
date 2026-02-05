import type { FastifyReply, FastifyRequest } from "fastify";
import type { ICreateLead } from "../interfaces/createLead.interface.js";
import { LeadsServices } from "../services/leads.services.js";
import { BadRequestError } from "../../../shared/errors/httpErrors.js";
import { isEmailValid } from "../../../shared/helpers/isEmailValid.helper.js";

class LeadsController {
    private readonly leadsServices: LeadsServices;
    constructor() {
        this.leadsServices = new LeadsServices();
    }
    async post(request: FastifyRequest, reply: FastifyReply) {
        const { name, email } = request.body as ICreateLead;

          if (!name || !email) {
                throw new BadRequestError("Preencha todos os campos!")
            }
        
            if(name.length < 3 || name.length > 100)
            {
                throw new BadRequestError("Nome deve ter entre 3 e 100 caracteres");
            }

              if(email.length < 10 || email.length > 100)
            {
                throw new BadRequestError("Email deve ter entre 3 e 100 caracteres");
            }

            if (!isEmailValid(email)) {
                throw new BadRequestError("Email inválido")
            }

        const lead = await this.leadsServices.createLead({ name, email })

        reply.code(201).send(lead);
    }
}

export { LeadsController };