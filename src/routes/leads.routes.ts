import type{  FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";

export async function leadsRoutes(fastify: FastifyInstance, options: FastifyPluginOptions){
    fastify.get("/splish", async (request: FastifyRequest, reply: FastifyReply) => {
        return("splash");
    })

}