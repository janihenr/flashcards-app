import { integer, pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const decksTable = pgTable("decks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 255 }).notNull(), // Clerk user ID
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const cardsTable = pgTable("cards", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  deckId: integer().notNull().references(() => decksTable.id, { onDelete: "cascade" }),
  front: text().notNull(),
  back: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// Export types for TypeScript
export type Deck = typeof decksTable.$inferSelect;
export type NewDeck = typeof decksTable.$inferInsert;
export type Card = typeof cardsTable.$inferSelect;
export type NewCard = typeof cardsTable.$inferInsert; 