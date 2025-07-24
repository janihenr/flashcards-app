"use server"
import { createCard, updateCard, deleteCard, createBulkCards } from "@/db/queries"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@clerk/nextjs/server"

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

const CreateCardSchema = z.object({
  deckId: z.number().positive("Invalid deck ID"),
  front: z.string().min(1, "Front content is required"),
  back: z.string().min(1, "Back content is required"),
})

const UpdateCardSchema = z.object({
  id: z.number().positive("Invalid card ID"),
  front: z.string().min(1, "Front content is required").optional(),
  back: z.string().min(1, "Back content is required").optional(),
})

const DeleteCardSchema = z.object({
  id: z.number().positive("Invalid card ID"),
  deckId: z.number().positive("Invalid deck ID"), // For revalidation
})

const BulkCreateCardsSchema = z.object({
  deckId: z.number().positive("Invalid deck ID"),
  cards: z.array(z.object({
    front: z.string().min(1, "Front content is required"),
    back: z.string().min(1, "Back content is required"),
  })).min(1, "At least one card is required"),
})

const AIGenerateCardsSchema = z.object({
  deckId: z.number().positive("Invalid deck ID"),
  count: z.number().min(1, "Must generate at least 1 card").max(30, "Maximum 30 cards allowed"),
  topic: z.string().min(1, "Topic is required").max(200, "Topic too long"),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
})

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type CreateCardInput = z.infer<typeof CreateCardSchema>
type UpdateCardInput = z.infer<typeof UpdateCardSchema>
type DeleteCardInput = z.infer<typeof DeleteCardSchema>
type BulkCreateCardsInput = z.infer<typeof BulkCreateCardsSchema>
type AIGenerateCardsInput = z.infer<typeof AIGenerateCardsSchema>

// ============================================================================
// SERVER ACTIONS - Using Query Functions
// ============================================================================

/**
 * Create a new card
 */
export async function createCardAction(input: CreateCardInput) {
  try {
    // 1. Validate input with Zod
    const validatedData = CreateCardSchema.parse(input)
    
    // 2. Call query function (handles auth & ownership verification)
    const newCard = await createCard(validatedData)
    
    // 3. Revalidate relevant paths
    revalidatePath(`/decks/${validatedData.deckId}`)
    revalidatePath("/decks")
    
    return { success: true, card: newCard }
  } catch (error) {
    console.error("Failed to create card:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to create card")
  }
}

/**
 * Update an existing card
 */
export async function updateCardAction(input: UpdateCardInput) {
  try {
    // 1. Validate input with Zod
    const validatedData = UpdateCardSchema.parse(input)
    const { id, ...updates } = validatedData
    
    // 2. Call query function (handles auth & ownership verification)
    const updatedCard = await updateCard(id, updates)
    
    // 3. Revalidate relevant paths
    revalidatePath(`/decks/${updatedCard.deckId}`)
    revalidatePath("/decks")
    
    return { success: true, card: updatedCard }
  } catch (error) {
    console.error("Failed to update card:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to update card")
  }
}

/**
 * Delete a card
 */
export async function deleteCardAction(input: DeleteCardInput) {
  try {
    // 1. Validate input with Zod
    const validatedData = DeleteCardSchema.parse(input)
    
    // 2. Call query function (handles auth & ownership verification)
    await deleteCard(validatedData.id)
    
    // 3. Revalidate relevant paths
    revalidatePath(`/decks/${validatedData.deckId}`)
    revalidatePath("/decks")
    
    return { success: true }
  } catch (error) {
    console.error("Failed to delete card:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to delete card")
  }
}

/**
 * Create multiple cards at once
 */
export async function createBulkCardsAction(input: BulkCreateCardsInput) {
  try {
    // 1. Validate input with Zod
    const validatedData = BulkCreateCardsSchema.parse(input)
    
    // 2. Call query function (handles auth & ownership verification)
    const newCards = await createBulkCards(validatedData.deckId, validatedData.cards)
    
    // 3. Revalidate relevant paths
    revalidatePath(`/decks/${validatedData.deckId}`)
    revalidatePath("/decks")
    
    return { success: true, cards: newCards, count: newCards.length }
  } catch (error) {
    console.error("Failed to create cards:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to create cards")
  }
}

/**
 * Generate flashcards with AI
 */
export async function generateCardsWithAI(input: AIGenerateCardsInput) {
  try {
    // 1. Validate input with Zod
    const validatedData = AIGenerateCardsSchema.parse(input)
    
    // 2. Check authentication
    const { userId, has } = await auth()
    
    if (!userId) {
      throw new Error("Unauthorized")
    }
    
    // 3. Check billing feature access
    const hasAIGeneration = has({ feature: 'ai_flashcard_generation' })
    if (!hasAIGeneration) {
      throw new Error("AI flashcard generation requires a Pro subscription")
    }
    
    // 4. Verify deck ownership and get deck details
    const { getDeckById } = await import("@/db/queries")
    const deck = await getDeckById(validatedData.deckId)
    
    if (!deck) {
      throw new Error("Deck not found")
    }
    
    // 5. AI Generation with proper implementation
    let generatedCards: Array<{ front: string; back: string }>
    
    console.log('🤖 Starting AI generation for:', validatedData.topic)
    
    try {
      // Check API key
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY not found in environment")
      }
      
      // Use OpenAI to intelligently analyze the learning context
      console.log('🔍 Analyzing learning context...')
      
      const contextAnalysisPrompt = `Analyze this flashcard deck context and determine if it's for language learning or general education.

Deck Title: "${deck.title}"
Deck Description: "${deck.description || 'No description'}"
Topic: "${validatedData.topic}"

Respond with ONLY one word: "LANGUAGE" if this is about learning a language (vocabulary, translation, grammar, etc.) or "EDUCATION" if it's about any other subject (history, science, business, etc.).

Examples:
- "Learning Spanish vocabulary" → LANGUAGE
- "Finnish competitiveness in 2000-2020" → EDUCATION  
- "Basic German phrases" → LANGUAGE
- "World War 2 history" → EDUCATION
- "Japanese business etiquette" → EDUCATION (cultural/business topic, not language learning)
- "French verb conjugations" → LANGUAGE

Answer:`

      const contextResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at analyzing educational content. Respond with only one word: LANGUAGE or EDUCATION.'
            },
            {
              role: 'user',
              content: contextAnalysisPrompt
            }
          ],
          temperature: 0.1, // Low temperature for consistent classification
          max_tokens: 10,
        }),
      })

      if (!contextResponse.ok) {
        console.warn('⚠️ Context analysis failed, defaulting to EDUCATION format')
      }

      let isLanguageLearning = false
      try {
        const contextData = await contextResponse.json()
        const analysisResult = contextData.choices?.[0]?.message?.content?.trim().toUpperCase()
        isLanguageLearning = analysisResult === 'LANGUAGE'
        console.log(`📊 Context analysis result: ${analysisResult} → ${isLanguageLearning ? 'Language Learning' : 'Educational'} format`)
      } catch {
        console.warn('⚠️ Failed to parse context analysis, defaulting to EDUCATION format')
        isLanguageLearning = false
      }
      
      // Create context-aware prompt based on AI analysis
      let prompt: string
      
      if (isLanguageLearning) {
        prompt = `Generate exactly ${validatedData.count} language learning flashcards about "${validatedData.topic}".

Context: This is for a language learning deck titled "${deck.title}"${deck.description ? ` with description: "${deck.description}"` : ''}.
${validatedData.difficulty ? `Difficulty level: ${validatedData.difficulty}` : ''}

Create SIMPLE, DIRECT translation flashcards in this EXACT JSON format:
{
  "flashcards": [
    {"front": "hello", "back": "hola"},
    {"front": "goodbye", "back": "adiós"}
  ]
}

LANGUAGE LEARNING GUIDELINES:
- Front: Source language word/phrase (simple and direct)
- Back: Target language translation ONLY (no explanations or descriptions)
- Focus on practical, commonly used words and phrases
- No need for "What is..." questions - just direct translations
- Keep it simple: word-to-word or phrase-to-phrase translations
- Vary between single words, common phrases, and useful expressions
- For ${validatedData.difficulty || 'medium'} level: ${
  validatedData.difficulty === 'easy' ? 'Use basic, everyday vocabulary' :
  validatedData.difficulty === 'hard' ? 'Include more complex vocabulary and idiomatic expressions' :
  'Mix basic and intermediate vocabulary with some common phrases'
}

Topic focus: ${validatedData.topic}

Return ONLY the JSON object, no additional text.`
      } else {
        prompt = `Generate exactly ${validatedData.count} educational flashcards about "${validatedData.topic}".

Context: This is for a deck titled "${deck.title}"${deck.description ? ` with description: "${deck.description}"` : ''}.
${validatedData.difficulty ? `Difficulty level: ${validatedData.difficulty}` : ''}

Create flashcards in this EXACT JSON format:
{
  "flashcards": [
    {"front": "Question 1", "back": "Answer 1"},
    {"front": "Question 2", "back": "Answer 2"}
  ]
}

EDUCATIONAL GUIDELINES:
- Each flashcard should have a clear, concise question/prompt on the front
- The back should contain a comprehensive but focused answer
- Vary the question types (definitions, examples, comparisons, applications)
- Ensure accuracy and educational value
- Keep front text under 100 characters when possible
- Keep back text informative but not overwhelming (under 300 characters)
- Make the cards relevant to the deck context
- For ${validatedData.difficulty || 'medium'} level content

Topic: ${validatedData.topic}

Return ONLY the JSON object, no additional text.`
      }
      
      console.log(`📝 Using ${isLanguageLearning ? 'LANGUAGE LEARNING' : 'EDUCATIONAL'} prompt template`)
      
      // Use fetch API to call OpenAI directly (more reliable than dynamic imports)
      console.log('📡 Making OpenAI API call...')
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educator creating flashcards. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('❌ OpenAI API Error:', response.status, errorData)
        throw new Error(`OpenAI API error: ${response.status} ${errorData}`)
      }

      const data = await response.json()
      console.log('✅ OpenAI API response received')
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenAI')
      }

      const content = data.choices[0].message.content
      console.log('📄 Raw AI response:', content.substring(0, 200) + '...')

      // Parse the JSON response
      let parsedResponse: { flashcards?: Array<{ front: string; back: string }> }
      try {
        parsedResponse = JSON.parse(content)
      } catch (jsonError) {
        console.error('❌ JSON parsing failed:', jsonError)
        console.log('Raw content:', content)
        throw new Error('Failed to parse AI response as JSON')
      }

      // Extract flashcards
      if (!parsedResponse.flashcards || !Array.isArray(parsedResponse.flashcards)) {
        console.error('❌ Invalid flashcards format:', parsedResponse)
        throw new Error('AI response missing flashcards array')
      }

      generatedCards = parsedResponse.flashcards
      
      // Validate each card
      generatedCards = generatedCards.filter(card => 
        card && 
        typeof card.front === 'string' && 
        typeof card.back === 'string' && 
        card.front.trim().length > 0 && 
        card.back.trim().length > 0
      )

      if (generatedCards.length === 0) {
        throw new Error('No valid flashcards found in AI response')
      }

      console.log(`🎉 Successfully generated ${generatedCards.length} AI flashcards`)
      
    } catch (aiError) {
      console.error('❌ AI generation failed:', aiError)
      
      // Create fallback cards with error info
      const difficultyLevel = validatedData.difficulty || 'medium'
      const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown error'
      
      generatedCards = Array.from({ length: Math.min(validatedData.count, 5) }, (_, i) => {
        const questionTypes = [
          'What is the main concept behind',
          'How does',
          'Why is',
          'What are the key features of',
          'How can you apply'
        ]
        
        const questionType = questionTypes[i % questionTypes.length]
        
        return {
          front: `${questionType} ${validatedData.topic}?`,
          back: `[AI Failed: ${errorMessage}] Please add your own answer about ${validatedData.topic} (${difficultyLevel} level).`
        }
      })
      
      console.log('🔄 Using fallback cards due to AI failure')
    }
    
    // 6. Create cards using existing bulk create function
    const result = await createBulkCardsAction({
      deckId: validatedData.deckId,
      cards: generatedCards
    })
    
    return {
      success: true,
      cards: result.cards,
      count: result.count,
      topic: validatedData.topic
    }
    
  } catch (error) {
    console.error('💥 Overall AI Generation Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      input: input
    })
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('API key') || error.message.includes('api key')) {
        throw new Error('AI service configuration error. Please contact support.')
      }
      
      if (error.message.includes('rate limit')) {
        throw new Error('AI service is busy. Please try again in a moment.')
      }
      
      if (error.message.includes('quota')) {
        throw new Error('AI service quota exceeded. Please try again later.')
      }
      
      if (error.message.includes('Pro subscription')) {
        throw new Error(error.message) // Pass through billing errors
      }
      
      // More detailed error for debugging
      throw new Error(`Failed to generate flashcards: ${error.message}`)
    }
    
    throw new Error('Failed to generate flashcards. Please try again.')
  }
}

/**
 * Import cards from CSV-like data
 */
export async function importCardsAction(deckId: number, csvData: string) {
  try {
    // Parse CSV data (simple implementation)
    const lines = csvData.split('\n').filter(line => line.trim())
    const cards = lines.map(line => {
      const [front, back] = line.split(',').map(s => s.trim())
      return { front, back }
    }).filter(card => card.front && card.back)
    
    if (cards.length === 0) {
      throw new Error("No valid cards found in the data")
    }
    
    // Use bulk create action
    return await createBulkCardsAction({ deckId, cards })
  } catch (error) {
    console.error("Failed to import cards:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to import cards")
  }
} 