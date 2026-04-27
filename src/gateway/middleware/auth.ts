import { Request, Response, NextFunction } from "express";

/**
 * Middleware de autenticação simples via API Key no header.
 * Em produção substituir por JWT/OAuth.
 */
export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    res.status(401).json({ error: "Unauthorized", message: "Header x-api-key inválido ou ausente" });
    return;
  }

  next();
}
