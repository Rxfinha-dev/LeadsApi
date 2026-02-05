import type { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import { IntentionsController } from "../modules/intentions/controllers/intentions.controller.js";
import { request } from "node:http";

export async function intentionsRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.post("", async (request: FastifyRequest, reply: FastifyReply) => {
        return new IntentionsController().post(request, reply);
    });

    fastify.put("/:intentionId", async (request: FastifyRequest, reply: FastifyReply) => {
        return new IntentionsController().put(request, reply)
    });

}