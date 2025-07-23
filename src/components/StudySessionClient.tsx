"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Deck, type Card as FlashCard } from "@/db/schema";
import Link from "next/link";

interface StudySessionClientProps {
  deck: Deck;
  cards: FlashCard[];
}

interface StudyStats {
  correct: number;
  incorrect: number;
  total: number;
}

export function StudySessionClient({ deck, cards }: StudySessionClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [stats, setStats] = useState<StudyStats>({ correct: 0, incorrect: 0, total: 0 });
  const [shuffledCards, setShuffledCards] = useState<FlashCard[]>([]);
  const [knownCardIds, setKnownCardIds] = useState<Set<number>>(new Set());

  // Initialize shuffled cards on component mount
  useEffect(() => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
  }, [cards]);

  // Get remaining cards (not marked as correct)
  const remainingCards = shuffledCards.filter(card => !knownCardIds.has(card.id));
  const currentCard = remainingCards[currentIndex];
  const totalCards = cards.length;
  // Progress shows how many cards have been learned (marked correct) out of total
  const progress = totalCards > 0 ? (knownCardIds.size / totalCards) * 100 : 0;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = (isCorrect: boolean) => {
    setStats(prev => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      total: prev.total + 1
    }));

    // If correct, mark card as known
    if (isCorrect && currentCard) {
      setKnownCardIds(prev => new Set(prev).add(currentCard.id));
    }

    // Check if there are more remaining cards after this update
    const newKnownIds = isCorrect && currentCard ? new Set(knownCardIds).add(currentCard.id) : knownCardIds;
    const newRemainingCards = shuffledCards.filter(card => !newKnownIds.has(card.id));
    
    // Move to next card or complete session
    if (currentIndex < newRemainingCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else if (newRemainingCards.length > 1) {
      // Reset to first card if we're at the end but there are still cards
      setCurrentIndex(0);
      setIsFlipped(false);
    } else {
      // Complete session if no more cards or only current card left
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < remainingCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    setStats({ correct: 0, incorrect: 0, total: 0 });
    setKnownCardIds(new Set());
    // Shuffle all cards again
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
  };

  const handleShuffle = () => {
    // Shuffle only remaining unknown cards without resetting progress
    const unknownCards = shuffledCards.filter(card => !knownCardIds.has(card.id));
    const shuffled = [...unknownCards].sort(() => Math.random() - 0.5);
    // Add back the known cards at the end (they won't be shown anyway)
    const knownCards = shuffledCards.filter(card => knownCardIds.has(card.id));
    setShuffledCards([...shuffled, ...knownCards]);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Keyboard shortcuts - placed after all function declarations
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Don't trigger shortcuts if session is completed
      if (isCompleted) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (currentIndex > 0) {
            handlePrevious();
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (currentIndex < remainingCards.length - 1) {
            handleNext();
          }
          break;
        case ' ': // Spacebar
          event.preventDefault();
          handleFlip();
          break;
        case 'r':
        case 'R':
          event.preventDefault();
          handleReset();
          break;
        case 's':
        case 'S':
          event.preventDefault();
          if (remainingCards.length > 1) {
            handleShuffle();
          }
          break;
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyPress);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentIndex, remainingCards.length, isCompleted]);

  // If cards are still loading
  if (shuffledCards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Loading cards...</div>
      </div>
    );
  }

  // If no more cards to study
  if (remainingCards.length === 0) {
    setIsCompleted(true);
  }

  // Completion screen
  if (isCompleted) {
    const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white mb-4">🎉 Study Session Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{stats.correct}</div>
                <div className="text-sm text-gray-300">Correct</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-400">{stats.incorrect}</div>
                <div className="text-sm text-gray-300">Incorrect</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{percentage}%</div>
                <div className="text-sm text-gray-300">Score</div>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            <div className="text-center">
              <p className="text-gray-300 mb-6">
                You studied {stats.total} card{stats.total === 1 ? '' : 's'} from "{deck.title}"
              </p>
              
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={handleReset}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Study Again
                </Button>
                <Button 
                  variant="outline"
                  asChild
                  className="border-gray-600 text-gray-100 hover:bg-gray-800"
                >
                  <Link href={`/decks/${deck.id}`}>
                    Back to Deck
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Study session interface
  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto">
      {/* Progress and Stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-300">
            Card {currentIndex + 1} of {remainingCards.length} remaining ({totalCards} total)
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleShuffle}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 text-xs px-3 py-1"
                disabled={remainingCards.length <= 1}
              >
                🔀 Shuffle
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Press S to shuffle</p>
            </TooltipContent>
          </Tooltip>
          <div className="text-sm text-gray-300">
            Score: {stats.correct}/{totalCards} ({totalCards > 0 ? Math.round((stats.correct / totalCards) * 100) : 0}%)
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="mb-8">
        <Card 
          className="bg-gray-900 border-gray-700 min-h-[400px] cursor-pointer hover:bg-gray-800 transition-colors"
          onClick={handleFlip}
        >
          <CardContent className="flex flex-col items-center justify-center h-full p-8">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-4">
                {isFlipped ? "Back" : "Front"} - Click to flip
              </div>
              <div className="text-xl text-white leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </div>
            </div>
            
            {!isFlipped && (
              <div className="absolute bottom-4 right-4 text-xs text-gray-500">
                🔄 Click to reveal answer
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Answer Buttons (only show when flipped) */}
        {isFlipped && (
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => handleAnswer(false)}
              variant="outline"
              size="lg"
              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              ❌ Incorrect
            </Button>
            <Button 
              onClick={() => handleAnswer(true)}
              size="lg"
              className="bg-green-600 text-white hover:bg-green-700"
            >
              ✅ Correct
            </Button>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex gap-4 justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handlePrevious}
                variant="outline"
                disabled={currentIndex === 0}
                className="border-gray-600 text-gray-100 hover:bg-gray-700 disabled:opacity-50"
              >
                ← Previous
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Press ← Left Arrow</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleFlip}
                variant="secondary"
                className="bg-gray-700 text-gray-100 hover:bg-gray-600"
              >
                {isFlipped ? "Show Front" : "Show Back"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Press Spacebar to flip</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleNext}
                variant="outline"
                disabled={currentIndex === remainingCards.length - 1}
                className="border-gray-600 text-gray-100 hover:bg-gray-700 disabled:opacity-50"
              >
                Next →
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Press → Right Arrow</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Reset Button */}
        <div className="text-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                🔄 Reset Session
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Press R to reset</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="text-center">
          <div className="text-xs text-gray-500 mt-4">
            <p className="mb-1">⌨️ Keyboard Shortcuts:</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <span>← → Navigate</span>
              <span>Space Flip</span>
              <span>R Reset</span>
              <span>S Shuffle</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
} 