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
  app.get("/api/orders", async (_req, res) => {
    try {
      const allOrders = await db.query.orders.findMany({
        with: {
          supplier: true,
          restaurant: true,
          items: true,
        },
      });
      
      // Transform the data to match our frontend interface
      const transformedOrders = allOrders.map(order => ({
        id: order.id.toString(),
        supplierName: order.supplier.name,
        orderDate: order.createdAt,
        status: order.status,
        items: order.items.map(item => ({
          id: item.id.toString(),
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
        })),
        total: order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0),
      }));
      
      res.json(transformedOrders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const order = req.body;
      const newOrder = await db.insert(orders).values(order).returning();
      res.status(201).json(newOrder[0]);
    } catch (error) {
      res.status(500).json({ message: "Error creating order" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, parseInt(req.params.id)),
        with: {
          supplier: true,
          restaurant: true,
        },
      });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Error fetching order" });
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
