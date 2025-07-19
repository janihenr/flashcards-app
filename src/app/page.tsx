import { SignIn, SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { redirect } from "next/navigation";

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
          {/* Sign In Modal using shadcn/ui Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">
                Sign In
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Sign In to Your Account</DialogTitle>
              </DialogHeader>
              <SignIn 
                routing="hash"
                appearance={{
                  elements: {
                    formButtonPrimary: "hidden",
                    card: "shadow-none border-none",
                  }
                }}
                redirectUrl="/dashboard"
              />
            </DialogContent>
          </Dialog>
          
          {/* Sign Up Modal using shadcn/ui Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Create Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Your Account</DialogTitle>
              </DialogHeader>
              <SignUp 
                routing="hash"
                appearance={{
                  elements: {
                    formButtonPrimary: "hidden",
                    card: "shadow-none border-none",
                  }
                }}
                redirectUrl="/dashboard"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
