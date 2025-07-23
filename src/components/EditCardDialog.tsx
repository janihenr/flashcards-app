"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateCardAction } from "@/actions/card-actions"
import type { Card } from "@/db/schema"
import { toast } from "sonner"

interface EditCardDialogProps {
  card: Card
  children: React.ReactNode
}

export function EditCardDialog({ card, children }: EditCardDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [front, setFront] = useState(card.front)
  const [back, setBack] = useState(card.back)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!front.trim() || !back.trim()) {
      return
    }

    setLoading(true)

    try {
      await updateCardAction({
        id: card.id,
        front: front.trim(),
        back: back.trim(),
      })
      
      // Close dialog - form values remain updated
      setOpen(false)
      
      // Show success toast
      toast.success("Card updated successfully!")
    } catch (error) {
      console.error("Failed to update card:", error)
      toast.error("Failed to update card. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset to original values
    setFront(card.front)
    setBack(card.back)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-gray-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-100">Edit Card</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-front" className="text-gray-300">
              Front (Question)
            </Label>
            <Textarea
              id="edit-front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Enter the question or prompt..."
              className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-400 min-h-[80px] resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-back" className="text-gray-300">
              Back (Answer)
            </Label>
            <Textarea
              id="edit-back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Enter the answer or explanation..."
              className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-400 min-h-[80px] resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 border-gray-600 text-gray-100 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !front.trim() || !back.trim()}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Card"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 