import { prismaClient } from "../../../shared/clients/prismaClient.js";
import { emailService } from "../../../shared/email/services/email.service.js";
import type { ICreateLead } from "../interfaces/createLead.interface.js";
import { LeadsRepository } from "../repository/leads.repository.js";

class LeadsServices {
    async createLead({ name, email }: ICreateLead) {
        try {
            if (!name || !email) {
                throw new Error("Preencha todos os campos");
            }

            if (!this.isEmailValid(email)) {
                throw new Error("Email inválido");
            }

            const emailExists = await prismaClient.lead.findFirst({
                where: {
                    email: email,
                    deleted_at: null
                }
            });

            if (emailExists) {
                throw new Error('Email já cadastrado');
            }

            const leadsRepository = new LeadsRepository();
            const lead = await leadsRepository.createLead({ name, email });

            await emailService.send({
                to: email,
                subject: "Bem-vindo!",
                html: `
                    <h2>Olá ${name ?? "!"}</h2>
                    <p>Muito obrigado por consultar conosco!.</p>
                `,
            });

            return lead;

        } catch (e) {
            if (e instanceof Error) {
                throw new Error(e.message);
            }
        }
    }

    private isEmailValid(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

export { LeadsServices };