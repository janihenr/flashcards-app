"use server"
import { db } from "@/db"
import { cardsTable, decksTable, type Card, type NewCard } from "@/db/schema"
import { eq, and, asc, desc } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { verifyDeckOwnership } from "./deck-queries"

// ============================================================================
// CARD QUERIES - All card-related database operations
// ============================================================================

/**
 * Get all cards for a specific deck (with deck ownership verification)
 */
export async function getCardsByDeckId(deckId: number): Promise<Card[]> {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized - user must be authenticated")
  }
  
  // Verify user owns the deck
  const ownsDeck = await verifyDeckOwnership(deckId)
  if (!ownsDeck) {
    throw new Error("Deck not found or access denied")
  }
  
  return await db.select().from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(asc(cardsTable.createdAt))
}

/**
 * Get a single card by ID (with deck ownership verification)
 */
export async function getCardById(cardId: number): Promise<Card | null> {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized - user must be authenticated")
  }
  
  // Get card with deck info to verify ownership
  const result = await db.select({
    card: cardsTable,
    deck: decksTable
  }).from(cardsTable)
    .leftJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(
      eq(cardsTable.id, cardId),
      eq(decksTable.userId, userId)
    ))
    .limit(1)
  
  return result[0]?.card || null
}

/**
 * Create a new card
 */
export async function createCard(cardData: Omit<NewCard, "id" | "createdAt" | "updatedAt">): Promise<Card> {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized - user must be authenticated")
  }
  
  // Verify user owns the deck
  const ownsDeck = await verifyDeckOwnership(cardData.deckId)
  if (!ownsDeck) {
    throw new Error("Deck not found or access denied")
  }
  
  const [createdCard] = await db.insert(cardsTable).values(cardData).returning()
  return createdCard
}

/**
 * Update a card
 */
export async function updateCard(cardId: number, updates: Partial<Pick<Card, "front" | "back">>): Promise<Card> {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized - user must be authenticated")
  }
  
  // Verify user owns the card (through deck ownership)
  const existingCard = await getCardById(cardId)
  if (!existingCard) {
    throw new Error("Card not found or access denied")
  }
  
  const [updatedCard] = await db.update(cardsTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(cardsTable.id, cardId))
    .returning()
  
  return updatedCard
}

/**
 * Delete a card
 */
export async function deleteCard(cardId: number): Promise<void> {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized - user must be authenticated")
  }
  
  // Verify user owns the card (through deck ownership)
  const existingCard = await getCardById(cardId)
  if (!existingCard) {
    throw new Error("Card not found or access denied")
  }
  
  await db.delete(cardsTable).where(eq(cardsTable.id, cardId))
}

/**
 * Get cards count for a deck
 */
export async function getCardsCountByDeckId(deckId: number): Promise<number> {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized - user must be authenticated")
  }
  
  // Verify user owns the deck
  const ownsDeck = await verifyDeckOwnership(deckId)
  if (!ownsDeck) {
    throw new Error("Deck not found or access denied")
  }
  
  const result = await db.$count(cardsTable, eq(cardsTable.deckId, deckId))
  return result
}

/**
 * Bulk create cards for a deck
 */
export async function createBulkCards(deckId: number, cardsData: Omit<NewCard, "id" | "deckId" | "createdAt" | "updatedAt">[]): Promise<Card[]> {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized - user must be authenticated")
  }
  
  // Verify user owns the deck
  const ownsDeck = await verifyDeckOwnership(deckId)
  if (!ownsDeck) {
    throw new Error("Deck not found or access denied")
  }
  
  const cardsToInsert: NewCard[] = cardsData.map(card => ({
    ...card,
    deckId,
  }))
  
  return await db.insert(cardsTable).values(cardsToInsert).returning()
}

/**
 * Get random cards from a deck (for study sessions)
 */
export async function getRandomCardsByDeckId(deckId: number, limit: number = 10): Promise<Card[]> {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized - user must be authenticated")
  }
  
  // Verify user owns the deck
  const ownsDeck = await verifyDeckOwnership(deckId)
  if (!ownsDeck) {
    throw new Error("Deck not found or access denied")
  }
  
  // Note: For a more sophisticated random selection, you might want to use SQL's RANDOM()
  // This is a simple approach that gets all cards and shuffles client-side
  const allCards = await db.select().from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
  
  // Shuffle and limit
  const shuffled = allCards.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, limit)
} 