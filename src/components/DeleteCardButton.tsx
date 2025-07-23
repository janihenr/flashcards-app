"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { deleteCardAction } from "@/actions/card-actions"
import { toast } from "sonner"

interface DeleteCardButtonProps {
  cardId: number
  deckId: number
}

export function DeleteCardButton({ cardId, deckId }: DeleteCardButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      await deleteCardAction({
        id: cardId,
        deckId: deckId,
      })
      
      // Show success toast
      toast.success("Card deleted successfully!")
    } catch (error) {
      console.error("Failed to delete card:", error)
      toast.error("Failed to delete card. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="outline"
      size="sm" 
      onClick={handleDelete}
      disabled={loading}
      className="border-red-600 text-red-400 hover:bg-red-900 disabled:opacity-50"
    >
      {loading ? "..." : "Delete"}
    </Button>
  )
} 