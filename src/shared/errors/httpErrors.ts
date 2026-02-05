export abstract class HttpError extends Error {
  public readonly statusCode: number;

  protected constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

// 400
export class BadRequestError extends HttpError {
  constructor(message = "Requisição inválida") {
    super(400, message);
  }
}

//404
export class NotFoundError extends HttpError {
  constructor(message = "Recurso não encontrado") {
    super(404, message);
  }
}

// 204 (sem body)
export class NoContentError extends HttpError {
  constructor() {
    super(204, "No content");
  }
}
