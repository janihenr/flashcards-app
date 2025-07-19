import { getUserDecks } from "@/db/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

/**
 * Decks page - Server component using query functions
 * 
 * This demonstrates the NEW data handling pattern:
 * 1. Server component calls query functions directly
 * 2. Query functions handle all auth, ownership, and DB operations
 * 3. No API routes needed for data fetching
 */
export default async function DecksPage() {
  // ✅ CORRECT: Direct query function call in server component
  // The query function handles:
  // - Authentication check
  // - User ownership filtering
  // - Database operations
  // - Error handling
  const decks = await getUserDecks()
  
  if (decks.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-100">My Flashcard Decks</h1>
          <p className="text-gray-400">You don't have any decks yet.</p>
          <Button asChild>
            <Link href="/decks/create">Create Your First Deck</Link>
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">My Flashcard Decks</h1>
        <Button asChild>
          <Link href="/decks/create">New Deck</Link>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {decks.map((deck) => (
          <Card key={deck.id} className="bg-gray-900 border-gray-700 hover:bg-gray-800 transition-colors">
            <CardHeader>
              <CardTitle className="text-gray-100">{deck.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {deck.description && (
                <p className="text-gray-300 text-sm mb-4">{deck.description}</p>
              )}
              <div className="flex gap-2">
                <Button asChild size="sm">
                  <Link href={`/decks/${deck.id}`}>View</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/decks/${deck.id}/study`}>Study</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 