"use server"
import { db } from "@/db"
import { decksTable, cardsTable, type Deck, type NewDeck } from "@/db/schema"
import { eq, and, desc, inArray } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

// ============================================================================
// DECK QUERIES - All deck-related database operations
// ============================================================================

/**
 * Get all decks for the authenticated user
 */
export async function getUserDecks(): Promise<Deck[]> {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized - user must be authenticated")
  }
  
  return await db.select().from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(desc(decksTable.updatedAt))
}

/**
 * Get a single deck by ID (with user ownership verification)
 */
export async function getDeckById(deckId: number): Promise<Deck | null> {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized - user must be authenticated")
  }
  
  const [deck] = await db.select().from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .limit(1)
  
  return deck || null
}

/**
 * Get deck with its cards count
 */
export async function getDeckWithCardCount(deckId: number) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized - user must be authenticated")
  }
  
  const result = await db.select({
    deck: decksTable,
    cardCount: db.$count(cardsTable, eq(cardsTable.deckId, deckId))
  }).from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .limit(1)
  
  return result[0] || null
}

/**
 * Create a new deck
 */
export async function createDeck(deckData: Omit<NewDeck, "userId">): Promise<Deck> {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized - user must be authenticated")
  }
  
  const newDeck: NewDeck = {
    ...deckData,
    userId, // Always use authenticated userId
  }
  
  const [createdDeck] = await db.insert(decksTable).values(newDeck).returning()
  return createdDeck
}

/**
 * Update a deck
 */
export async function updateDeck(deckId: number, updates: Partial<Pick<Deck, "title" | "description">>): Promise<Deck> {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized - user must be authenticated")
  }
  
  // Verify user owns the deck
  const existingDeck = await getDeckById(deckId)
  if (!existingDeck) {
    throw new Error("Deck not found or access denied")
  }
  
  const [updatedDeck] = await db.update(decksTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .returning()
  
  return updatedDeck
}

/**
 * Delete a deck and all its cards
 */
export async function deleteDeck(deckId: number): Promise<void> {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized - user must be authenticated")
  }
  
  // Verify user owns the deck
  const existingDeck = await getDeckById(deckId)
  if (!existingDeck) {
    throw new Error("Deck not found or access denied")
  }
  
  // Delete deck (cascade will handle cards)
  await db.delete(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
}

/**
 * Check if user owns a deck (utility function)
 */
export async function verifyDeckOwnership(deckId: number): Promise<boolean> {
  const deck = await getDeckById(deckId)
  return deck !== null
}

/**
 * Get total cards count across all user's decks
 */
export async function getUserTotalCardsCount(): Promise<number> {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized - user must be authenticated")
  }
  
  // Get all user's decks first
  const userDecks = await getUserDecks()
  
  if (userDecks.length === 0) {
    return 0
  }
  
  // Get total cards across all decks
  const deckIds = userDecks.map(deck => deck.id)
  const result = await db.$count(cardsTable, inArray(cardsTable.deckId, deckIds))
  
  return result
} 