import type { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import { IntentionsController } from "../modules/intentions/controllers/intentions.controller.js";
import { request } from "node:http";

export async function intentionsRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.post("", {
        schema: {
            body: {
                type: "object",
                properties: {
                    zipcode_start: { type: "string" },
                    zipcode_end: { type: "string" }
                },
            },
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        return new IntentionsController().post(request, reply);
    });

    fastify.put("/:intentionId", {
        schema: {
            body: {
                type: "object",
                properties: {
                    lead_id: {type: "string"}
                },
            },
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        return new IntentionsController().put(request, reply)
    });

}