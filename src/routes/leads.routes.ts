import type { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import { ok } from "node:assert";
import { LeadsController } from "../modules/leads/controller/leads.controller.js";


export async function leadsRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.get("/teste", async (request: FastifyRequest, reply: FastifyReply) => {
        return ("splash");
    });

    fastify.post("/teste", async (request: FastifyRequest, reply: FastifyReply) => {
        return new LeadsController().post(request, reply);
    });

}