import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { suppliers, ingredients, restaurants, users, orders, procurements } from "@db/schema";
import { eq } from "drizzle-orm";

// Type-safe request handlers
async function getSuppliers(_req: Request, res: Response) {
  try {
    const allSuppliers = await db.query.suppliers.findMany();
    res.json(allSuppliers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching suppliers" });
  }
}

async function createSupplier(req: Request, res: Response) {
  try {
    const supplier = req.body;
    const newSupplier = await db.insert(suppliers).values(supplier).returning();
    res.status(201).json(newSupplier[0]);
  } catch (error) {
    res.status(500).json({ message: "Error creating supplier" });
  }
}

export function registerRoutes(app: Express): Server {
  // Suppliers routes
  app.get("/api/suppliers", getSuppliers);
  app.post("/api/suppliers", createSupplier);
  
  // Ingredients routes
  app.get("/api/ingredients", async (req, res) => {
    try {
      const allIngredients = await db.query.ingredients.findMany();
      res.json(allIngredients);
    } catch (error) {
      res.status(500).json({ message: "Error fetching ingredients" });
    }
  });

  // Orders routes
  app.get("/api/orders", async (req, res) => {
    try {
      const allOrders = await db.query.orders.findMany();
      res.json(allOrders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders" });
    }
  });

  // Procurements routes
  app.get("/api/procurements", async (req, res) => {
    try {
      const allProcurements = await db.query.procurements.findMany();
      res.json(allProcurements);
    } catch (error) {
      res.status(500).json({ message: "Error fetching procurements" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
