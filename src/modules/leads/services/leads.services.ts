import { error } from "node:console";
import { prismaClient } from "../../../shared/clients/prismaClient.js";
import { emailService } from "../../../shared/email/services/email.service.js";
import { BadRequestError } from "../../../shared/errors/httpErrors.js";
import type { ICreateLead } from "../interfaces/createLead.interface.js";
import { LeadsRepository } from "../repositories/leads.repository.js";

class LeadsServices {
    private readonly leadsRepository: LeadsRepository;
    constructor() {
        this.leadsRepository = new LeadsRepository();
    }
    async createLead({ name, email }: ICreateLead) {
        try {

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

                await emailService.send({
                to: email,
                subject: "Bem-vindo!",
                html: `
                    <h2>Olá ${name ?? "!"}</h2>
                    <p>Muito obrigado por consultar conosco!.</p>
                `,
            },);
            
            return lead;

        } catch (e) {
           console.error("Erro ao criar lead", error)
        }
    }
}

export { LeadsServices };