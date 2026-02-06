import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { LeadsController } from "../modules/leads/controllers/leads.controller.js";


export async function leadsRoutes(fastify: FastifyInstance) {
    fastify.post("", {
        schema: {
            tags: ["Leads"],
            summary: "Cadastra um lead",
            body: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    email: { type: "string" }
                },
                required: ["name", "email"],

            },
            response: {
                201: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        email: { type: "string" },
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
                        name: "teste",
                        email: "teste@teste.com",
                        created_at: "2026-02-05T10:12:23.768Z",
                        updated_at: "2026-02-05T10:12:23.768Z",
                        deleated_at: null
                    },
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
        return new LeadsController().post(request, reply);
    });

}