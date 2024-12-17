import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";

export function registerRoutes(app: Express): Server {
  // Add restaurant API routes
  app.get('/api/restaurants/v2', async (req: Request, res: Response) => {
    try {
      const response = await fetch('http://172.31.196.92:8080/restaurants/v2');
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Backend error response:', data);
        throw new Error(data.message || `Backend responded with status: ${response.status}`);
      }

      res.json(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      res.status(500).json({ 
        message: 'Failed to fetch restaurants from backend',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}