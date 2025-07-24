import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Protect } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserDecks, getUserTotalCardsCount } from "@/db/queries";
import CreateDeckDialog from "@/components/CreateDeckDialog";

export default async function DashboardPage() {
  const { userId, has } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  // Check user's billing plan and features
  const hasUnlimitedDecks = has({ feature: 'unlimited_decks' });

  // ✅ CORRECT: Using centralized query functions
  // These functions handle all auth, ownership, and DB operations
  const userDecks = await getUserDecks();
  const totalDecks = userDecks.length;
  const totalCards = await getUserTotalCardsCount();

  // Check if user has reached deck limit
  const deckLimit = 3;
  const hasReachedLimit = !hasUnlimitedDecks && totalDecks >= deckLimit;
  const isApproachingLimit = !hasUnlimitedDecks && totalDecks >= 2;

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

          {/* Deck Limit Warning for Free Users */}
          <Protect
            plan="free_user"
            fallback={null}
          >
            {isApproachingLimit && (
              <div className="max-w-4xl mx-auto">
                <div className={`border rounded-lg p-4 ${
                  hasReachedLimit 
                    ? 'bg-red-900/20 border-red-600' 
                    : 'bg-yellow-900/20 border-yellow-600'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold ${
                        hasReachedLimit ? 'text-red-200' : 'text-yellow-200'
                      }`}>
                        {hasReachedLimit 
                          ? `Deck Limit Reached (${totalDecks}/${deckLimit})`
                          : `Approaching Deck Limit (${totalDecks}/${deckLimit})`
                        }
                      </p>
                      <p className={`text-sm ${
                        hasReachedLimit ? 'text-red-300' : 'text-yellow-300'
                      }`}>
                        {hasReachedLimit 
                          ? 'Upgrade to Pro for unlimited decks and advanced features.'
                          : 'You\'re close to your free plan limit. Upgrade to Pro for unlimited decks.'
                        }
                      </p>
                    </div>
                    <Link href="/pricing">
                      <Button 
                        size="sm"
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Upgrade to Pro
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </Protect>

          {/* Pro User Badge */}
          <Protect
            feature="unlimited_decks"
            fallback={null}
          >
            <div className="max-w-4xl mx-auto">
              <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    PRO
                  </span>
                  <p className="text-blue-200">
                    ✨ You have unlimited decks and full access to all features!
                  </p>
                </div>
              </div>
            </div>
          </Protect>

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
                
                {/* Protected Create Deck Button */}
                <Protect
                  feature="unlimited_decks"
                  fallback={
                    hasReachedLimit ? (
                      <div className="space-y-3">
                        <Button 
                          disabled 
                          className="w-full opacity-50 cursor-not-allowed"
                        >
                          Limit Reached ({totalDecks}/{deckLimit})
                        </Button>
                        <Link href="/pricing">
                          <Button 
                            variant="outline"
                            size="sm"
                            className="w-full border-blue-600 text-blue-400 hover:bg-blue-900/20"
                          >
                            Upgrade for Unlimited Decks
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <CreateDeckDialog 
                        trigger={
                          <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                            Create Deck
                          </Button>
                        }
                      />
                    )
                  }
                >
                  <CreateDeckDialog 
                    trigger={
                      <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                        Create Deck
                      </Button>
                    }
                  />
                </Protect>
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
                <Link href="/decks">
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-600 text-gray-100 hover:bg-gray-800"
                  >
                    View Decks
                  </Button>
                </Link>
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
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-white">Recent Decks</h3>
                {/* Show deck count for free users */}
                <Protect
                  plan="free_user"
                  fallback={null}
                >
                  <div className="text-sm text-gray-400">
                    {totalDecks}/{deckLimit} decks used
                  </div>
                </Protect>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userDecks.slice(0, 6).map((deck) => (
                  <Link key={deck.id} href={`/decks/${deck.id}`}>
                    <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg text-gray-100">{deck.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs text-gray-400">
                          Updated {new Date(deck.updatedAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
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
                  <div className="text-sm text-gray-400">
                    Total Decks
                    {/* Show limit for free users */}
                    <Protect
                      plan="free_user"
                      fallback={null}
                    >
                      <span className="text-xs text-gray-500 block">
                        (Max: {deckLimit})
                      </span>
                    </Protect>
                  </div>
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
              <CreateDeckDialog 
                trigger={
                  <Button 
                    size="lg" 
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Create Your First Deck
                  </Button>
                }
              />
              
              {/* Free plan info for empty state */}
              <Protect
                plan="free_user"
                fallback={null}
              >
                <p className="text-sm text-gray-400 mt-4">
                  Free plan includes up to {deckLimit} decks. 
                  <Link href="/pricing" className="text-blue-400 underline ml-1">
                    Upgrade to Pro
                  </Link> for unlimited decks and AI features.
                </p>
              </Protect>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 