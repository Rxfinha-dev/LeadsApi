import { prismaClient } from "../../../shared/clients/prismaClient.js";
import type { ICreateIntention } from "../interfaces/createIntention.interface.js";


class IntentionsRepository {
    async createIntention({ zipcode_start, zipcode_end }: ICreateIntention) {
        try {
            return prismaClient.intention.create({
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
}

export { IntentionsRepository };