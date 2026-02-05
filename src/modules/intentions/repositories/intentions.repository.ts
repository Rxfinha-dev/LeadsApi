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
            if (e instanceof Error) {
                throw new Error(e.message);
            }
        }
    }

    async updateLeadId({ intentionId, lead_id }: IUpdateLeadId) {
        try {
            return await prismaClient.intention.update({
                data: {
                    lead_id
                },
                where: {
                    id: intentionId
                }
            })
        }
        catch (e) {
            if (e instanceof Error) {
                throw new Error(e.message);
            }
        }
    }
}

export { IntentionsRepository };