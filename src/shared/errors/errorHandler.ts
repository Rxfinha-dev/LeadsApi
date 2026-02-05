import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { HttpError } from "./httpErrors.js";


export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof HttpError) {
    if (error.statusCode === 204) {
      return reply.status(204).send();
    }

    return reply.status(error.statusCode ?? 400).send({
      message: error.message
    });
  }

  request.log.error(error);

  return reply.status(500).send({
    message: "Erro interno do servidor"
  });
}
