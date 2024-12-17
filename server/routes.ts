import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { readFile } from "fs/promises";
import { join } from "path";

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

  const httpServer = createServer(app);
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

  return httpServer;
}