import type{  FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";

export async function intentionsRoutes(fastify: FastifyInstance, options: FastifyPluginOptions){
    fastify.get("/ping", async (request: FastifyRequest, reply: FastifyReply) => {
        return("pong");
    })

}