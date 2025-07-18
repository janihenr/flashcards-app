import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-6xl">
            Welcome to{" "}
            <span className="text-blue-600 dark:text-blue-400">Flashcards</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your personal study companion. Create, organize, and review flashcards
            to enhance your learning experience.
          </p>
        </div>

        <div className="mt-12">
          <SignedOut>
            <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Get Started
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                Sign in to access your flashcards and start learning.
              </p>
              <div className="space-y-4">
                <SignInButton mode="modal">
                  <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-md font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Create Account
                  </button>
                </SignUpButton>
              </div>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Welcome Back!
              </h2>
              <div className="text-center space-y-6">
                                 <p className="text-gray-600 dark:text-gray-300">
                   You&apos;re successfully signed in. Your flashcards app is ready to use!
                 </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Create Flashcards
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      Start building your personal study deck
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      Study Mode
                    </h3>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      Review and test your knowledge
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>User ID:</strong> {userId}
                  </p>
                </div>
              </div>
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}
