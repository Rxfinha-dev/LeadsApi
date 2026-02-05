import Fastify, { fastify } from "fastify"
import routes from "./routes/index.js"
import cors from '@fastify/cors';
import { errorHandler } from "./shared/errors/errorHandler.js";

const app = Fastify({ logger: true })

const start = async () => {

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