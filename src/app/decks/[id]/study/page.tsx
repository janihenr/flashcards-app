import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDeckById, getCardsByDeckId } from "@/db/queries";
import { StudySessionClient } from "@/components/StudySessionClient";

interface StudyPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
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
  const [deck, cards] = await Promise.all([
    getDeckById(deckId),
    getCardsByDeckId(deckId)
  ]);

  // If deck doesn't exist or user doesn't own it, show 404
  if (!deck) {
    notFound();
  }

  // If no cards, redirect back to deck page
  if (cards.length === 0) {
    redirect(`/decks/${deckId}`);
  }

  return (
    <div className="min-h-screen bg-black">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <Link 
                href={`/decks/${deckId}`}
                className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block"
              >
                ← Back to {deck.title}
              </Link>
              <h1 className="text-3xl font-bold text-white">Study Session</h1>
              <p className="text-gray-300 mt-2">
                {cards.length} card{cards.length === 1 ? '' : 's'} in this deck
              </p>
            </div>
          </div>

          {/* Study Session Component */}
          <StudySessionClient deck={deck} cards={cards} />
        </div>
      </main>
    </div>
  );
} 