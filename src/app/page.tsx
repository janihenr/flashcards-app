import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground sm:text-6xl">
            Flashcards
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Your personal flashcard platform
          </p>
        </div>
        
        <div className="space-y-4 max-w-sm mx-auto">
          <p className="text-muted-foreground">
            Sign in or create an account using the buttons in the header to get started.
          </p>
          
          <div className="flex flex-col space-y-2">
            <p className="text-sm text-muted-foreground">
              ✨ Create and organize your flashcard decks
            </p>
            <p className="text-sm text-muted-foreground">
              🧠 Study with spaced repetition
            </p>
            <p className="text-sm text-muted-foreground">
              📊 Track your learning progress
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
