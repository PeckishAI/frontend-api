import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";

export function registerRoutes(app: Express): Server {
  // Add restaurant API routes
  app.get('/api/restaurants/v2', async (req: Request, res: Response) => {
    try {
      console.log('Attempting to fetch restaurants from backend...');
      console.log('Backend URL:', 'http://172.31.196.92:8080/restaurants/v2');
      
      const response = await fetch('http://172.31.196.92:8080/restaurants/v2');
      console.log('Backend response status:', response.status);
      console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Backend response data:', JSON.stringify(data, null, 2));
      
      if (!response.ok) {
        console.error('Backend error response:', data);
        throw new Error(data.message || `Backend responded with status: ${response.status}`);
      }

      res.json(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          cause: error.cause
        });
      }
      res.status(500).json({ 
        message: 'Failed to fetch restaurants from backend',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}