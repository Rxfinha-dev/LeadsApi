import { prismaClient } from "../../../clients/prismaClient.js";
import type { ICreateLead } from "../interfaces/createLead.interface.js";
import { LeadsRepository } from "../repository/leads.repository.js";

class LeadsServices {
    async createLead({name, email} : ICreateLead) {
        try {
            if (!name || !email) {
                throw new Error("Preencha todos os campos")
            }

            if (!this.isEmailValid(email)) {
                throw new Error("Email inválido");
            }

            const emailExists = await prismaClient.lead.findFirst({
                where: {
                    email: email,
                    deletedAt: null
                }
            });

            if (emailExists) {
                throw new Error('Email já cadastrado');
            }

            const leadsRepository = new LeadsRepository();
            const lead = leadsRepository.createLead({name, email});

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

export {LeadsServices}