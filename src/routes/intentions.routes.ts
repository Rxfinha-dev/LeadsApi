import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { IntentionsController } from "../modules/intentions/controllers/intentions.controller.js";


export async function intentionsRoutes(fastify: FastifyInstance,) {
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
                        id: { type: "string" },
                        zipcode_start: { type: "string" },
                        zipcode_end: { type: "string" },
                        lead_id: { type: "string" },
                        created_at: {
                            type: "string",
                            format: "date-time"
                        },
                        updated_at: {
                            type: "string",
                            format: "date-time"
                        },
                        deleted_at: {
                            type: "string",
                            format: "date-time"
                        },
                    },
                    example: {
                        id: "6e29df17-5cb2-4623-b6ff-11c63fea2f6c",
                        zipcode_start: "01001-000",
                        zipcode_end: "01001-000",
                        lead_id: "6e29df17-5cb2-4623-b6ff-11c63fea2f6c",
                        created_at: "2026-02-05T10:12:23.768Z",
                        updated_at: "2026-02-05T10:12:23.768Z",
                        deleated_at: null
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
        return new IntentionsController().createIntention(request, reply);
    });

    fastify.put("/:intention_id", {
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
                201: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        zipcode_start: { type: "string" },
                        zipcode_end: { type: "string" },
                        lead_id: { type: "string" },
                        created_at: {
                            type: "string",
                            format: "date-time"
                        },
                        updated_at: {
                            type: "string",
                            format: "date-time"
                        },
                        deleted_at: {
                            type: "string",
                            format: "date-time"
                        },
                    },
                    example: {
                        id: "6e29df17-5cb2-4623-b6ff-11c63fea2f6c",
                        zipcode_start: "01001-000",
                        zipcode_end: "01001-000",
                        lead_id: "6e29df17-5cb2-4623-b6ff-11c63fea2f6c",
                        created_at: "2026-02-05T10:12:23.768Z",
                        updated_at: "2026-02-05T10:12:23.768Z",
                        deleated_at: null
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
        return new IntentionsController().updateLeadId(request, reply)
    });

}