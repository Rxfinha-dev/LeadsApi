import { prismaClient } from "../../../shared/clients/prismaClient.js";
import { emailService } from "../../../shared/email/services/email.service.js";
import { BadRequestError } from "../../../shared/errors/httpErrors.js";
import { isEmailValid } from "../../../shared/helpers/isEmailValid.helper.js";
import type { ICreateLead } from "../interfaces/createLead.interface.js";
import { LeadsRepository } from "../repositories/leads.repository.js";

class LeadsServices {
    private readonly leadsRepository: LeadsRepository;
    constructor() {
        this.leadsRepository = new LeadsRepository();
    }
    async createLead({ name, email }: ICreateLead) {
        try {
            if (!name || !email) {
                throw new BadRequestError("Preencha todos os campos!")
            }
        
            if(name.length < 3 || name.length > 100)
            {
                throw new BadRequestError("Nome deve ter entre 3 e 100 caracteres");
            }

              if(email.length < 20 || email.length > 100)
            {
                throw new BadRequestError("Email deve ter entre 3 e 100 caracteres");
            }


            if (!isEmailValid(email)) {
                throw new BadRequestError("Email inválido")
            }

            const emailExists = await prismaClient.lead.findFirst({
                where: {
                    email: email,
                    deleted_at: null
                }
            });

            if (emailExists) {
                throw new BadRequestError("Email já cadastrado")
            }

            const lead = await this.leadsRepository.createLead({ name, email });
            
            try{
                await emailService.send({
                to: email,
                subject: "Bem-vindo!",
                html: `
                    <h2>Olá ${name ?? "!"}</h2>
                    <p>Muito obrigado por consultar conosco!.</p>
                `,
            },);
            } catch(e) {
                throw e;
            }

            return lead;

        } catch (e) {
            throw e;
        }
    }
}

export { LeadsServices };