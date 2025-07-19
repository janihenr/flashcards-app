"use server"
import { createCard, updateCard, deleteCard, createBulkCards } from "@/db/queries"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

const CreateCardSchema = z.object({
  deckId: z.number().positive("Invalid deck ID"),
  front: z.string().min(1, "Front content is required"),
  back: z.string().min(1, "Back content is required"),
})

const UpdateCardSchema = z.object({
  id: z.number().positive("Invalid card ID"),
  front: z.string().min(1, "Front content is required").optional(),
  back: z.string().min(1, "Back content is required").optional(),
})

const DeleteCardSchema = z.object({
  id: z.number().positive("Invalid card ID"),
  deckId: z.number().positive("Invalid deck ID"), // For revalidation
})

const BulkCreateCardsSchema = z.object({
  deckId: z.number().positive("Invalid deck ID"),
  cards: z.array(z.object({
    front: z.string().min(1, "Front content is required"),
    back: z.string().min(1, "Back content is required"),
  })).min(1, "At least one card is required"),
})

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type CreateCardInput = z.infer<typeof CreateCardSchema>
type UpdateCardInput = z.infer<typeof UpdateCardSchema>
type DeleteCardInput = z.infer<typeof DeleteCardSchema>
type BulkCreateCardsInput = z.infer<typeof BulkCreateCardsSchema>

// ============================================================================
// SERVER ACTIONS - Using Query Functions
// ============================================================================

/**
 * Create a new card
 */
export async function createCardAction(input: CreateCardInput) {
  try {
    // 1. Validate input with Zod
    const validatedData = CreateCardSchema.parse(input)
    
    // 2. Call query function (handles auth & ownership verification)
    const newCard = await createCard(validatedData)
    
    // 3. Revalidate relevant paths
    revalidatePath(`/decks/${validatedData.deckId}`)
    revalidatePath("/decks")
    
    return { success: true, card: newCard }
  } catch (error) {
    console.error("Failed to create card:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to create card")
  }
}

/**
 * Update an existing card
 */
export async function updateCardAction(input: UpdateCardInput) {
  try {
    // 1. Validate input with Zod
    const validatedData = UpdateCardSchema.parse(input)
    const { id, ...updates } = validatedData
    
    // 2. Call query function (handles auth & ownership verification)
    const updatedCard = await updateCard(id, updates)
    
    // 3. Revalidate relevant paths
    revalidatePath(`/decks/${updatedCard.deckId}`)
    revalidatePath("/decks")
    
    return { success: true, card: updatedCard }
  } catch (error) {
    console.error("Failed to update card:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to update card")
  }
}

/**
 * Delete a card
 */
export async function deleteCardAction(input: DeleteCardInput) {
  try {
    // 1. Validate input with Zod
    const validatedData = DeleteCardSchema.parse(input)
    
    // 2. Call query function (handles auth & ownership verification)
    await deleteCard(validatedData.id)
    
    // 3. Revalidate relevant paths
    revalidatePath(`/decks/${validatedData.deckId}`)
    revalidatePath("/decks")
    
    return { success: true }
  } catch (error) {
    console.error("Failed to delete card:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to delete card")
  }
}

/**
 * Create multiple cards at once
 */
export async function createBulkCardsAction(input: BulkCreateCardsInput) {
  try {
    // 1. Validate input with Zod
    const validatedData = BulkCreateCardsSchema.parse(input)
    
    // 2. Call query function (handles auth & ownership verification)
    const newCards = await createBulkCards(validatedData.deckId, validatedData.cards)
    
    // 3. Revalidate relevant paths
    revalidatePath(`/decks/${validatedData.deckId}`)
    revalidatePath("/decks")
    
    return { success: true, cards: newCards, count: newCards.length }
  } catch (error) {
    console.error("Failed to create cards:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to create cards")
  }
}

/**
 * Import cards from CSV-like data
 */
export async function importCardsAction(deckId: number, csvData: string) {
  try {
    // Parse CSV data (simple implementation)
    const lines = csvData.split('\n').filter(line => line.trim())
    const cards = lines.map(line => {
      const [front, back] = line.split(',').map(s => s.trim())
      return { front, back }
    }).filter(card => card.front && card.back)
    
    if (cards.length === 0) {
      throw new Error("No valid cards found in the data")
    }
    
    // Use bulk create action
    return await createBulkCardsAction({ deckId, cards })
  } catch (error) {
    console.error("Failed to import cards:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to import cards")
  }
} 