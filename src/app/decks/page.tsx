import { getUserDecks } from "@/db/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import CreateDeckDialog from "@/components/CreateDeckDialog"
import { DeleteDeckButton } from "@/components/DeleteDeckButton"

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
        <div className="flex justify-between items-center mb-6">
          <Button asChild variant="outline" className="border-gray-600 text-gray-100 hover:bg-gray-800">
            <Link href="/dashboard">← Back to Dashboard</Link>
          </Button>
        </div>
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-100">My Flashcard Decks</h1>
          <p className="text-gray-400">You don&apos;t have any decks yet.</p>
          <CreateDeckDialog />
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="border-gray-600 text-gray-100 hover:bg-gray-800">
            <Link href="/dashboard">← Dashboard</Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-100">My Flashcard Decks</h1>
        </div>
        <CreateDeckDialog 
          trigger={
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              New Deck
            </Button>
          }
        />
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
              <div className="flex gap-2 flex-wrap">
                <Button asChild size="sm">
                  <Link href={`/decks/${deck.id}`}>View</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="border-gray-600 text-gray-100 hover:bg-gray-800">
                  <Link href={`/decks/${deck.id}/study`}>Study</Link>
                </Button>
                <DeleteDeckButton deckId={deck.id} deckTitle={deck.title} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 