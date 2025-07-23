import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDeckById, getCardsByDeckId, getCardsCountByDeckId } from "@/db/queries";
import { AddCardDialog } from "@/components/AddCardDialog";
import { EditCardDialog } from "@/components/EditCardDialog";
import { DeleteCardButton } from "@/components/DeleteCardButton";

interface DeckPageProps {
  params: Promise<{ id: string }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  const { id } = await params;
  const deckId = parseInt(id);
  
  // Validate that the ID is a valid number
  if (isNaN(deckId)) {
    notFound();
  }

  // Fetch deck data and cards in parallel
  const [deck, cards, cardCount] = await Promise.all([
    getDeckById(deckId),
    getCardsByDeckId(deckId),
    getCardsCountByDeckId(deckId)
  ]);

  // If deck doesn't exist or user doesn't own it, show 404
  if (!deck) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                size="sm"
                asChild
                className="text-blue-400 hover:text-blue-300 hover:bg-gray-800 mb-4 -ml-2"
              >
                <Link href="/decks">
                  ← Back to Decks
                </Link>
              </Button>
              <h1 className="text-3xl font-bold text-white mb-2">{deck.title}</h1>
              {deck.description && (
                <p className="text-gray-300 text-lg">{deck.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                <span>{cardCount} card{cardCount === 1 ? '' : 's'}</span>
                <span>•</span>
                <span>Updated {new Date(deck.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-800" />

          {/* Quick Actions */}
          <div className="flex gap-4">
            <Button 
              variant="default"
              size="default"
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={cardCount === 0}
            >
              {cardCount > 0 ? "Study Cards" : "No Cards"}
            </Button>
            <AddCardDialog deckId={deckId}>
              <Button 
                variant="secondary" 
                size="default"
                className="bg-gray-700 text-gray-100 hover:bg-gray-600"
              >
                Add Card
              </Button>
            </AddCardDialog>
          </div>

          <Separator className="bg-gray-800" />

          {/* Cards Section */}
          {cardCount > 0 ? (
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-white">
                Flashcards ({cardCount})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                  <Card key={card.id} className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors">

                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Front:</h4>
                        <p className="text-gray-100 bg-gray-800 p-3 rounded border-l-4 border-blue-500">
                          {card.front}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Back:</h4>
                        <p className="text-gray-100 bg-gray-800 p-3 rounded border-l-4 border-green-500">
                          {card.back}
                        </p>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-gray-400">
                          Updated {new Date(card.updatedAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <EditCardDialog card={card}>
                            <Button 
                              variant="outline"
                              size="sm" 
                              className="border-gray-600 text-gray-100 hover:bg-gray-700"
                            >
                              Edit
                            </Button>
                          </EditCardDialog>
                          <DeleteCardButton cardId={card.id} deckId={deckId} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2 text-white">No cards yet</h3>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">
                This deck is empty. Add your first flashcard to start building your study materials.
              </p>
              <AddCardDialog deckId={deckId}>
                <Button 
                  variant="default"
                  size="lg" 
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add Your First Card
                </Button>
              </AddCardDialog>
            </div>
          )}

          {/* Deck Statistics */}
          {cardCount > 0 && (
            <div>
              <Separator className="bg-gray-800" />
              <div className="pt-8">
                <h3 className="text-xl font-semibold mb-4 text-white">Deck Statistics</h3>
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">{cardCount}</div>
                      <div className="text-sm text-gray-400">Total Cards</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">0</div>
                      <div className="text-sm text-gray-400">Times Studied</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">0%</div>
                      <div className="text-sm text-gray-400">Success Rate</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {new Date(deck.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-400">Created</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 