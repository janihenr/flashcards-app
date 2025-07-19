// ============================================================================
// CENTRALIZED QUERY EXPORTS
// ============================================================================

// Export all deck-related queries
export {
  getUserDecks,
  getDeckById,
  getDeckWithCardCount,
  createDeck,
  updateDeck,
  deleteDeck,
  verifyDeckOwnership,
  getUserTotalCardsCount,
} from "./deck-queries"

// Export all card-related queries
export {
  getCardsByDeckId,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  getCardsCountByDeckId,
  createBulkCards,
  getRandomCardsByDeckId,
} from "./card-queries"

// Re-export database types for convenience
export type { Deck, NewDeck, Card, NewCard } from "@/db/schema" 