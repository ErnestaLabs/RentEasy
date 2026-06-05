import type { FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: unknown;
}

export function problem(status: number, title: string, detail?: string, errors?: unknown): ProblemDetails {
  return {
    type: `https://renteazy.co.uk/problems/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    title,
    status,
    detail,
    errors,
  };
}

export function sendProblem(reply: FastifyReply, details: ProblemDetails) {
  return reply
    .code(details.status)
    .type('application/problem+json')
    .send(details);
}

export function validationProblem(error: ZodError): ProblemDetails {
  return problem(400, 'Invalid request body', 'Request validation failed.', error.flatten());
}

