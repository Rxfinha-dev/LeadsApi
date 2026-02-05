import type { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import { ok } from "node:assert";
import { LeadsController } from "../modules/leads/controllers/leads.controller.js";


export async function leadsRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {

    fastify.post("", async (request: FastifyRequest, reply: FastifyReply) => {
        return new LeadsController().post(request, reply);
    });

}