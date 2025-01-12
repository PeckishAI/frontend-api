import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { readFile } from "fs/promises";
import { join } from "path";
import { config } from "../client/src/config/config";

export function registerRoutes(app: Express): Server {
  // Add restaurant API routes
  app.get('/api/inventory/v2/restaurant/:restaurant_uuid', async (req: Request, res: Response) => {
    try {
      const filePath = join(process.cwd(), 'Pasted--data-0264bca2-c894-43b3-a0aa-dc220dc82021-ingredient-name-Taittinger-Pre-1734456558617.txt');
      const fileContent = await readFile(filePath, 'utf-8');
      const inventoryData = JSON.parse(fileContent);
      if (!inventoryData.success) {
        return res.status(404).json({ message: 'Inventory not found' });
      }
      res.json(inventoryData);
    } catch (error) {
      console.error('Error serving inventory data:', error);
      res.status(500).json({ 
        message: 'Failed to serve inventory data',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

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

  // Authentication endpoints that proxy to Flask backend
  app.post('/api/auth/v2/signin', async (req: Request, res: Response) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/auth/v2/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
        credentials: 'include'
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error('Auth error:', error);
      res.status(500).json({ 
        message: 'Authentication failed',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.post('/api/auth/v2/google/signin', async (req: Request, res: Response) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/auth/v2/google/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
        credentials: 'include'
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({ 
        message: 'Google authentication failed',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Add tags endpoint
  app.get('/api/tags/v2/restaurant/:restaurant_uuid', async (req: Request, res: Response) => {
    try {
      const filePath = join(process.cwd(), 'Pasted--data-tag-name-BEVERAGE-tag-uuid-fd97cadf-f3e2-4197-afac-b418f6a-1734471752841.txt');
      const fileContent = await readFile(filePath, 'utf-8');
      const tagsData = JSON.parse(fileContent);
      if (!tagsData.success) {
        return res.status(404).json({ message: 'Tags not found' });
      }
      res.json(tagsData);
    } catch (error) {
      console.error('Error serving tags data:', error);
      res.status(500).json({ 
        message: 'Failed to serve tags data',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}