import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-gray-300 text-lg mb-6">
          Unlock the full potential of your flashcard learning
        </p>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Start with our free plan and upgrade to Pro when you need unlimited decks and AI-powered flashcard generation.
        </p>
      </div>
      
      <div className="mb-8">
        <PricingTable />
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">
          What&apos;s Included
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-200 mb-3">Free Plan</h3>
            <ul className="text-gray-300 space-y-2">
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Up to 3 flashcard decks
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Unlimited cards per deck
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Study sessions with progress tracking
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Manual card creation
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-200 mb-3">Pro Plan</h3>
            <ul className="text-gray-300 space-y-2">
              <li className="flex items-center">
                <span className="text-blue-400 mr-2">✓</span>
                Free plan features +
              </li>
              <li className="flex items-center">
                <span className="text-blue-400 mr-2">✓</span>
                Unlimited flashcard decks
              </li>
              <li className="flex items-center">
                <span className="text-blue-400 mr-2">✓</span>
                AI-powered flashcard generation
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <p className="text-gray-400 text-sm">
          All plans include secure data storage and cross-device synchronization.
          Cancel or change your plan anytime.
        </p>
      </div>
    </div>
  );
} 