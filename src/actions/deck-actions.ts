"use server"
import { createDeck, updateDeck, deleteDeck } from "@/db/queries"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { redirect } from "next/navigation"

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

const CreateDeckSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().min(1, "Description is required").max(1000, "Description too long"),
})

const UpdateDeckSchema = z.object({
  id: z.number().positive("Invalid deck ID"),
  title: z.string().min(1, "Title is required").max(255, "Title too long").optional(),
  description: z.string().optional(),
})

const DeleteDeckSchema = z.object({
  id: z.number().positive("Invalid deck ID"),
})

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type CreateDeckInput = z.infer<typeof CreateDeckSchema>
type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>
type DeleteDeckInput = z.infer<typeof DeleteDeckSchema>

// ============================================================================
// SERVER ACTIONS - Using Query Functions
// ============================================================================

/**
 * Create a new deck
 */
export async function createDeckAction(input: CreateDeckInput) {
  try {
    // 1. Validate input with Zod
    const validatedData = CreateDeckSchema.parse(input)
    
    // 2. Call query function (handles auth & DB operations)
    const newDeck = await createDeck(validatedData)
    
    // 3. Revalidate relevant paths
    revalidatePath("/decks")
    revalidatePath("/dashboard")
    
    return { success: true, deck: newDeck }
  } catch (error) {
    console.error("Failed to create deck:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to create deck")
  }
}

/**
 * Update an existing deck
 */
export async function updateDeckAction(input: UpdateDeckInput) {
  try {
    // 1. Validate input with Zod
    const validatedData = UpdateDeckSchema.parse(input)
    const { id, ...updates } = validatedData
    
    // 2. Call query function (handles auth & ownership verification)
    const updatedDeck = await updateDeck(id, updates)
    
    // 3. Revalidate relevant paths
    revalidatePath("/decks")
    revalidatePath(`/decks/${id}`)
    revalidatePath("/dashboard")
    
    return { success: true, deck: updatedDeck }
  } catch (error) {
    console.error("Failed to update deck:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to update deck")
  }
}

/**
 * Delete a deck and all its cards
 */
export async function deleteDeckAction(input: DeleteDeckInput) {
  try {
    // 1. Validate input with Zod
    const validatedData = DeleteDeckSchema.parse(input)
    
    // 2. Call query function (handles auth & ownership verification)
    await deleteDeck(validatedData.id)
    
    // 3. Revalidate relevant paths
    revalidatePath("/decks")
    revalidatePath("/dashboard")
    
    return { success: true }
  } catch (error) {
    console.error("Failed to delete deck:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to delete deck")
  }
}

/**
 * Create deck and redirect to it
 */
export async function createDeckAndRedirectAction(input: CreateDeckInput) {
  const result = await createDeckAction(input)
  redirect(`/decks/${result.deck.id}`)
} 