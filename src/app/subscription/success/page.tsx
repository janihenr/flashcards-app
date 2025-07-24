"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const { isLoaded } = useUser();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isLoaded) return;

    // Redirect after 5 seconds
    const redirectTimer = setTimeout(() => {
      router.push("/dashboard");
    }, 5000);

    // Countdown timer
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(redirectTimer);
      clearInterval(countdownTimer);
    };
  }, [router, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-300 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Welcome to Pro!
            </h1>
            <p className="text-lg text-gray-300">
              Your subscription has been activated successfully.
            </p>
          </div>

          {/* Pro Benefits Card */}
          <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-600 mb-8">
            <CardHeader>
              <CardTitle className="text-blue-100 flex items-center gap-2">
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  PRO
                </span>
                You now have access to:
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-blue-400">✨</span>
                <span className="text-blue-100">Unlimited flashcard decks</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-400">🤖</span>
                <span className="text-blue-100">AI-powered flashcard generation</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-400">⚡</span>
                <span className="text-blue-100">Priority support</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-400">🔄</span>
                <span className="text-blue-100">Advanced study features</span>
              </div>
            </CardContent>
          </Card>

          {/* Auto-redirect Notice */}
          <Card className="bg-gray-900 border-gray-700 mb-6">
            <CardContent className="p-6 text-center">
              <p className="text-gray-300 mb-4">
                Redirecting you to your dashboard in{" "}
                <span className="font-bold text-blue-400">{countdown}</span> seconds...
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Go to Dashboard Now
                </Button>
                <Link href="/decks">
                  <Button 
                    variant="outline"
                    className="border-gray-600 text-gray-100 hover:bg-gray-800"
                  >
                    Create Your First Deck
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Getting Started Tips */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Getting Started with Pro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="text-center p-4 border border-gray-700 rounded-lg">
                  <div className="text-2xl mb-2">📚</div>
                  <h3 className="font-semibold text-gray-200 mb-2">Create Unlimited Decks</h3>
                  <p className="text-sm text-gray-400">
                    No more limits! Create as many decks as you need for all your subjects.
                  </p>
                </div>
                <div className="text-center p-4 border border-gray-700 rounded-lg">
                  <div className="text-2xl mb-2">🤖</div>
                  <h3 className="font-semibold text-gray-200 mb-2">Try AI Generation</h3>
                  <p className="text-sm text-gray-400">
                    Let AI create flashcards for any topic. Just describe what you want to study!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 