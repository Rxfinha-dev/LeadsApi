import { prismaClient } from "../../../shared/clients/prismaClient.js";
import type { ICreateLead } from "../interfaces/createLead.interface.js";

class LeadsRepository {
    async createLead({ name, email }: ICreateLead) {
        try {
            return await prismaClient.lead.create({
                data: {
                    name,
                    email
                }
            });
        } catch (e) {
            if (e instanceof Error) {
                throw new Error(e.message);
            }
        }
    }
}

export { LeadsRepository };