import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { readFile } from "fs/promises";
import { join } from "path";

export function registerRoutes(app: Express): Server {
  // Add restaurant API routes
  app.get('/api/restaurants/v2', async (_req: Request, res: Response) => {
    try {
      const filePath = join(process.cwd(), 'Pasted--data-address-Elandsgracht-36-city-Amsterdam-country--1734454370941.txt');
      const fileContent = await readFile(filePath, 'utf-8');
      const restaurantData = JSON.parse(fileContent);
      res.json(restaurantData);
    } catch (error) {
      console.error('Error serving restaurant data:', error);
      res.status(500).json({ 
        message: 'Failed to serve restaurant data',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}