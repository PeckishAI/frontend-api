import { pgTable, text, serial, integer, boolean, timestamp, uniqueIndex, primaryKey, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from 'drizzle-orm';

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userRestaurants = pgTable("user_restaurants", {
  userId: integer("user_id").notNull().references(() => users.id),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  role: text("role").notNull().default("member"), // owner, admin, member
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.restaurantId] }),
  }
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  notes: text("notes"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const procurements = pgTable("procurements", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  price: doublePrecision("price"),
  currency: text("currency"),
  status: text("status").notNull(),
  note: text("note"),
  date: text("date"),
  deliveryDate: text("delivery_date"),
  expectedDate: text("expected_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  restaurants: many(userRestaurants),
}));

export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  users: many(userRestaurants),
  orders: many(orders),
  procurements: many(procurements),
}));

export const userRestaurantsRelations = relations(userRestaurants, ({ one }) => ({
  user: one(users, {
    fields: [userRestaurants.userId],
    references: [users.id],
  }),
  restaurant: one(restaurants, {
    fields: [userRestaurants.restaurantId],
    references: [restaurants.id],
  }),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  orders: many(orders),
  procurements: many(procurements),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id],
  }),
  supplier: one(suppliers, {
    fields: [orders.supplierId],
    references: [suppliers.id],
  }),
}));

export const procurementsRelations = relations(procurements, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [procurements.restaurantId],
    references: [restaurants.id],
  }),
  supplier: one(suppliers, {
    fields: [procurements.supplierId],
    references: [suppliers.id],
  }),
}));

// Schemas
export const insertRestaurantSchema = createInsertSchema(restaurants);
export const selectRestaurantSchema = createSelectSchema(restaurants);
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertUserRestaurantSchema = createInsertSchema(userRestaurants);
export const selectUserRestaurantSchema = createSelectSchema(userRestaurants);
export const insertSupplierSchema = createInsertSchema(suppliers);
export const selectSupplierSchema = createSelectSchema(suppliers);
export const insertIngredientSchema = createInsertSchema(ingredients);
export const selectIngredientSchema = createSelectSchema(ingredients);
export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);
export const insertProcurementSchema = createInsertSchema(procurements);
export const selectProcurementSchema = createSelectSchema(procurements);

// Types
export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = typeof restaurants.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserRestaurant = typeof userRestaurants.$inferSelect;
export type InsertUserRestaurant = typeof userRestaurants.$inferInsert;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;
export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = typeof ingredients.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type Procurement = typeof procurements.$inferSelect;
export type InsertProcurement = typeof procurements.$inferInsert;
