import type { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import { IntentionsController } from "../modules/intentions/controllers/intentions.controller.js";
import { request } from "node:http";

export async function intentionsRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.post("", {
        schema: {
            tags: ["Intentions"],
            summary: "Cria uma intenção",
            body: {
                type: "object",
                properties: {
                    zipcode_start: { type: "string" },
                    zipcode_end: { type: "string" }
                },
                required: ["zipcode_start", "zipcode_end"]
            },
            response: {
                201: {
                    type: "object",
                    properties: {
                        zipcode_start: { type: "string" },
                        zipcode_end: { type: "string" }
                    },
                    example: {
                        zipcode_start: "01001-000",
                        zipcode_end: "01001-000"
                    }
                },
                400: {
                    type: "object",
                    properties: {
                        message: { type: "string" }
                    },
                    example: {
                        message: "BadRequest"
                    }
                },
                404: {
                    type: "object",
                    properties: {
                        message: { type: "string" }
                    },
                    example: {
                        message: "Intention not found"
                    }
                },
                500: {
                    type: "object",
                    properties: {
                        message: { type: "string" }
                    },
                    example: {
                        message: "Internal server error"
                    },
                },
            },
            
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        return new IntentionsController().post(request, reply);
    });

    fastify.put("/:intentionId", {
        schema: {
            tags: ["Intentions"],
            summary: "Vincula um Lead à uma Intention",
            body: {
                type: "object",
                properties: {
                    lead_id: { type: "string" }
                },
                required: ["lead_id"],
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        lead_id: { type: "string" }
                    },
                    example: {
                        id: "123",
                        lead_id: "abc-456"
                    }
                },
                400: {
                    type: "object",
                    properties: {
                        message: { type: "string" }
                    },
                    example: {
                        message: "BadRequest"
                    }
                },
                404: {
                    type: "object",
                    properties: {
                        message: { type: "string" }
                    },
                    example: {
                        message: "Intention not found"
                    }
                },
                500: {
                    type: "object",
                    properties: {
                        message: { type: "string" }
                    },
                    example: {
                        message: "Internal server error"
                    },
                },
            },
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        return new IntentionsController().put(request, reply)
    });

}