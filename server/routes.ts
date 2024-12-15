import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { 
  suppliers, 
  ingredients, 
  restaurants, 
  users, 
  orders, 
  orderItems, 
  procurements 
} from "@db/schema";
import { eq, and } from "drizzle-orm";
import type { 
  Supplier, 
  Order, 
  OrderItem, 
  InsertOrder,
  InsertOrderItem,
  InsertSupplier
} from "@db/schema";

// Type-safe request handlers
async function getSuppliers(_req: Request, res: Response) {
  try {
    const allSuppliers = await db.query.suppliers.findMany({
      orderBy: (suppliers, { desc }) => [desc(suppliers.updatedAt)]
    });
    res.json(allSuppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ message: "Error fetching suppliers" });
  }
}

async function createSupplier(req: Request, res: Response) {
  try {
    const supplier = req.body as InsertSupplier;
    const [newSupplier] = await db.insert(suppliers).values({
      ...supplier,
      active: true,
    }).returning();
    res.status(201).json(newSupplier);
  } catch (error) {
    console.error("Error creating supplier:", error);
    res.status(500).json({ message: "Error creating supplier" });
  }
}

async function updateSupplier(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body as Partial<InsertSupplier>;
    
    const [updatedSupplier] = await db
      .update(suppliers)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(suppliers.id, parseInt(id)))
      .returning();

    if (!updatedSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    
    res.json(updatedSupplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    res.status(500).json({ message: "Error updating supplier" });
  }
}

async function getOrders(_req: Request, res: Response) {
  try {
    const allOrders = await db.query.orders.findMany({
      with: {
        supplier: true,
        items: true,
      },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)]
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
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
}

async function createOrder(req: Request, res: Response) {
  try {
    const { items, ...orderData } = req.body as InsertOrder & { items: InsertOrderItem[] };
    
    // Start a transaction to ensure both order and items are created atomically
    const result = await db.transaction(async (tx) => {
      const [order] = await tx.insert(orders)
        .values({
          ...orderData,
          status: orderData.status || "pending"
        })
        .returning();

      if (items && items.length > 0) {
        await tx.insert(orderItems).values(
          items.map(item => ({
            ...item,
            orderId: order.id
          }))
        );
      }

      const completeOrder = await tx.query.orders.findFirst({
        where: eq(orders.id, order.id),
        with: {
          supplier: true,
          items: true,
        }
      });

      return completeOrder;
    });

    if (!result) {
      throw new Error("Failed to create order");
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order" });
  }
}

async function getOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, parseInt(id)),
      with: {
        supplier: true,
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const transformedOrder = {
      ...order,
      items: order.items.map(item => ({
        id: item.id.toString(),
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
      })),
      total: order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0),
    };

    res.json(transformedOrder);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Error fetching order" });
  }
}

export function registerRoutes(app: Express): Server {
  // Suppliers routes
  app.get("/api/suppliers", getSuppliers);
  app.post("/api/suppliers", createSupplier);
  app.put("/api/suppliers/:id", updateSupplier);
  
  // Orders routes
  app.get("/api/orders", getOrders);
  app.post("/api/orders", createOrder);
  app.get("/api/orders/:id", getOrder);

  // Forward these routes to Go backend
  app.get("/api/inventory", async (_req, res) => {
    try {
      const response = await fetch("http://localhost:5000/api/inventory");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Error fetching inventory data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}