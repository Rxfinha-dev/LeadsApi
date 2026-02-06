import { prismaClient } from "../../../shared/clients/prismaClient.js";
import type { ICreateIntention } from "../interfaces/createIntention.interface.js";
import type { IUpdateLeadId } from "../interfaces/updateIntention.interface.js";


class IntentionsRepository {
    async createIntention({ zipcode_start, zipcode_end }: ICreateIntention) {
        try {
            return await prismaClient.intention.create({
                data: {
                    zipcode_start,
                    zipcode_end
                }
            });
        } catch (e) {
            console.error("Erro no createIntention no repository");
            throw e;
        }
    }

    async updateLeadId({ intention_id, lead_id }: IUpdateLeadId) {
        try {
            return await prismaClient.intention.update({
                data: {
                    lead_id,
                    updated_at: new Date()
                },
                where: {
                    id: intention_id
                }
            })
        }
        catch (e) {
            console.error("Erro no updateLead no repository");
            throw e;
        }
    }
}

export { IntentionsRepository };