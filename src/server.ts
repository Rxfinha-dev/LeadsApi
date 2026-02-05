import Fastify from "fastify"
import routes from "./routes/index.js"
import cors from '@fastify/cors';
import { errorHandler } from "./shared/errors/errorHandler.js";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

const app = Fastify({ logger: true })

const start = async () => {

    await app.register(swagger, {
        swagger: {
            info: {
                title: "LeadsIntentionsApi",
                description: "API para captar e gerenciar leads, de acordo com as intenções de frete.",
                version: "1.0.0"
            },        
            tags: [
                {name: "Intentions", description: " Intenções de frete."},
                {name: "Leads", description: "Clientes em potencial."}
            ],
            host: "localhost:3333",
            schemes: ["http"],
            consumes: ["application/json"],
            produces: ["application/json"]
        }
    });

    await app.register(swaggerUI, {
        routePrefix: "/docs",
        uiConfig: {
            docExpansion: "list",
            deepLinking: false
        }
    });

    await app.register(cors);
    await app.register(routes);

    app.setErrorHandler(errorHandler);

    try {
        await app.listen({ port: 3333 })
    } catch (err) {
        process.exit(1)
    }
}

start();