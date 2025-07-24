"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { deleteDeckAction } from "@/actions/deck-actions"
import { toast } from "sonner"

interface DeleteDeckButtonProps {
  deckId: number
  deckTitle: string
}

export function DeleteDeckButton({ deckId, deckTitle }: DeleteDeckButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      await deleteDeckAction({ id: deckId })
      
      // Show success toast
      toast.success("Deck deleted successfully!")
      setOpen(false)
    } catch (error) {
      console.error("Failed to delete deck:", error)
      toast.error("Failed to delete deck. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          size="sm"
          className="border-red-600 text-red-400 hover:bg-red-900"
        >
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-gray-100">Delete Deck</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete <strong>&quot;{deckTitle}&quot;</strong>? 
            This will permanently delete the deck and all its cards. This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-600 text-gray-100 hover:bg-gray-800"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete Deck"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 