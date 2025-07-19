import { auth, currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { getUserDecks, getUserTotalCardsCount } from "@/db/queries";

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId) {
    redirect("/");
  }

  // ✅ CORRECT: Using centralized query functions
  // These functions handle all auth, ownership, and DB operations
  const userDecks = await getUserDecks();
  const totalDecks = userDecks.length;
  const totalCards = await getUserTotalCardsCount();

  // TODO: Add study session tracking to calculate these values
  const cardsStudied = 0;
  const successRate = 0;

  return (
    <div className="min-h-screen bg-black">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-white">
              Welcome to Your Dashboard
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              {totalDecks > 0 
                ? `You have ${totalDecks} deck${totalDecks === 1 ? '' : 's'} with ${totalCards} card${totalCards === 1 ? '' : 's'} ready for study.`
                : "Create your first flashcard deck to get started with your studies."
              }
            </p>
          </div>

          {/* Quick Actions using shadcn/ui Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-100">Create New Deck</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Start building a new flashcard deck for your studies.
                </p>
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                  Create Deck
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-100">Browse Decks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  View and manage all your existing flashcard decks.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-600 text-gray-100 hover:bg-gray-800"
                >
                  View Decks
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-100">Study Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Start a quick study session with your cards.
                </p>
                <Button 
                  variant="secondary" 
                  className="w-full bg-gray-700 text-gray-100 hover:bg-gray-600"
                  disabled={totalCards === 0}
                >
                  {totalCards > 0 ? "Start Studying" : "No Cards Available"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Decks Section */}
          {totalDecks > 0 && (
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-semibold mb-6 text-white">Recent Decks</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userDecks.slice(0, 6).map((deck) => (
                  <Card key={deck.id} className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-100">{deck.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {deck.description && (
                        <p className="text-sm text-gray-300 mb-3 overflow-hidden text-ellipsis">
                          {deck.description}
                        </p>
                      )}
                      <div className="text-xs text-gray-400">
                        Created {new Date(deck.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Stats Section using shadcn/ui Cards */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold mb-6 text-white">Your Statistics</h3>
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{totalDecks}</div>
                  <div className="text-sm text-gray-400">Total Decks</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{totalCards}</div>
                  <div className="text-sm text-gray-400">Total Cards</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{cardsStudied}</div>
                  <div className="text-sm text-gray-400">Cards Studied</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{successRate}%</div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Empty State */}
          {totalDecks === 0 && (
            <div className="max-w-2xl mx-auto text-center py-12">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2 text-white">No flashcard decks yet</h3>
              <p className="text-gray-300 mb-6">
                Create your first deck to start organizing your study materials and track your progress.
              </p>
              <Button 
                size="lg" 
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Create Your First Deck
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 