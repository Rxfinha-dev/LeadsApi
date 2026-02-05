import { error } from "node:console";
import { prismaClient } from "../../../shared/clients/prismaClient.js";
import { BadRequestError } from "../../../shared/errors/httpErrors.js";
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
            console.error('Erro ao criar registro', error)
        }
    }

    async updateLeadId({ intention_id, lead_id }: IUpdateLeadId) {
        try {
            return await prismaClient.intention.update({
                data: {
                    lead_id
                },
                where: {
                    id: intention_id
                }
            })
        }
        catch (e) {
          console.error("erro ao atualizar registro")
        }
    }
}

export { IntentionsRepository };