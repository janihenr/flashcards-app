"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from "@/components/ui/dialog"
import { Protect } from "@clerk/nextjs"
import { generateCardsWithAI } from "@/actions/card-actions"
import { toast } from "sonner"
import { Loader2, Sparkles, Crown } from "lucide-react"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AIGenerationDialogProps {
  deckId: number
  deckTitle: string
  deckDescription?: string
  children: React.ReactNode
}

function AIGenerationForm({ deckId, deckTitle, deckDescription, onClose }: {
  deckId: number
  deckTitle: string
  deckDescription?: string
  onClose: () => void
}) {
  const [topic, setTopic] = useState("")
  const [count, setCount] = useState(5)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!topic.trim()) {
      toast.error("Please enter a topic")
      return
    }

    if (count < 1 || count > 30) {
      toast.error("Number of cards must be between 1 and 30")
      return
    }

    setIsGenerating(true)

    try {
      const result = await generateCardsWithAI({
        deckId,
        topic: topic.trim(),
        count,
        difficulty,
      })

      toast.success(`Generated ${result.count} flashcards successfully!`)
      setTopic("")
      setCount(5)
      onClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate flashcards"
      toast.error(message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <form onSubmit={handleGenerate} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="topic" className="text-gray-100">
          Topic <span className="text-red-400">*</span>
        </Label>
        <Textarea
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={`e.g., Spanish vocabulary, Biology basics, JavaScript concepts...

Hint: For deck "${deckTitle}", you might want topics related to ${deckTitle.toLowerCase()}`}
          required
          disabled={isGenerating}
          className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-400 min-h-[100px]"
          maxLength={200}
        />
        <div className="text-xs text-gray-400">
          {topic.length}/200 characters
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="count" className="text-gray-100">
          Number of Cards
        </Label>
        <Input
          id="count"
          type="number"
          value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
          min={1}
          max={30}
          disabled={isGenerating}
          className="bg-gray-800 border-gray-600 text-gray-100"
        />
        <div className="text-xs text-gray-400">
          Maximum 30 cards per generation
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="difficulty" className="text-gray-100">
          Difficulty Level
        </Label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
          disabled={isGenerating}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
        >
          <option value="easy">Easy - Basic concepts and definitions</option>
          <option value="medium">Medium - Intermediate understanding</option>
          <option value="hard">Hard - Advanced analysis and application</option>
        </select>
      </div>

      {deckDescription && (
        <div className="bg-gray-800 p-3 rounded-md border-l-4 border-blue-500">
          <div className="text-sm text-gray-300">
            <strong>Deck Context:</strong> {deckDescription}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isGenerating}
          className="border-gray-600 text-gray-100 hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isGenerating || !topic.trim()}
          className="bg-blue-600 text-white hover:bg-blue-700 flex-1"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate {count} Cards
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

function UpgradePrompt() {
  return (
    <div className="text-center py-6 space-y-4">
      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
        <Crown className="h-8 w-8 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          🤖 AI Flashcard Generation
        </h3>
        <p className="text-gray-300 mb-4 max-w-sm mx-auto">
          Generate flashcards automatically with AI. Save hours of manual work and create comprehensive study materials instantly.
        </p>
        <div className="space-y-2 text-sm text-gray-400 mb-6">
          <div>✨ Smart question generation</div>
          <div>📚 Context-aware content</div>
          <div>🎯 Adjustable difficulty levels</div>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
          <Link href="/pricing">
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to Pro
          </Link>
        </Button>
      </div>
    </div>
  )
}

export function AIGenerationDialog({ deckId, deckTitle, deckDescription, children }: AIGenerationDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Protect
        feature="ai_flashcard_generation"
        fallback={
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Dialog>
                    <DialogTrigger asChild>
                      {children}
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-700 text-gray-100 max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-gray-100">Upgrade Required</DialogTitle>
                      </DialogHeader>
                      <UpgradePrompt />
                    </DialogContent>
                  </Dialog>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>AI Generation is a Pro feature</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        }
      >
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      </Protect>

      <DialogContent className="bg-gray-900 border-gray-700 text-gray-100 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            Generate Cards with AI
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Create flashcards automatically for &quot;{deckTitle}&quot; using AI. Describe what you want to study and let AI create comprehensive flashcards for you.
          </DialogDescription>
        </DialogHeader>

        <AIGenerationForm 
          deckId={deckId}
          deckTitle={deckTitle}
          deckDescription={deckDescription}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
} 