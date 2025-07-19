# Updated Data Handling Patterns

This project enforces strict separation of concerns for data operations in Next.js with **centralized query functions** in the `db/queries` directory. All database operations must go through these helper functions.

## Architecture Overview

```
src/
├── db/
│   ├── queries/           # 📁 ALL database operations centralized here
│   │   ├── deck-queries.ts
│   │   ├── card-queries.ts
│   │   └── index.ts       # Exports all queries
│   ├── schema.ts          # Database schema definitions
│   └── index.ts           # Database connection
├── app/                   # Server components (data fetching)
├── components/            # Client components (UI only)
└── actions/               # Server actions (mutations only)
```

## Core Principles

1. **🎯 Single Source of Truth**: All database operations in `db/queries`
2. **🔒 Built-in Security**: Every query handles authentication & authorization
3. **📋 Type Safety**: All queries use proper TypeScript types
4. **🛡️ Input Validation**: Zod validation at the action level
5. **⚡ Reusable**: Query functions can be used anywhere

## Data Retrieval Rules

### Server Components Call Query Functions
Server components fetch data by calling query functions directly.

```typescript
// ✅ CORRECT: Server component using query functions
import { getUserDecks, getDeckById } from "@/db/queries"

export default async function DecksPage() {
  // Direct query function call in server component
  const decks = await getUserDecks()
  
  return (
    <div className="space-y-4">
      {decks.map(deck => (
        <DeckCard key={deck.id} deck={deck} />
      ))}
    </div>
  )
}

// ✅ CORRECT: Server component with parameters
export default async function DeckPage({ params }: { params: { id: string } }) {
  const deckId = Number(params.id)
  const deck = await getDeckById(deckId)
  
  if (!deck) {
    return <div>Deck not found</div>
  }
  
  return <DeckDetail deck={deck} />
}
```

```typescript
// ❌ WRONG: Never fetch data in client components
"use client"
import { useState, useEffect } from "react"

export default function DecksPage() {
  const [decks, setDecks] = useState([])
  
  useEffect(() => {
    // Never do this!
    fetch('/api/decks').then(res => res.json()).then(setDecks)
  }, [])
  
  return <div>...</div>
}
```

## Database Mutations Rules

### Server Actions Call Query Functions
Server actions handle user interactions and call query functions for database mutations.

```typescript
// ✅ CORRECT: Server action using query functions
"use server"
import { createDeck, updateDeck } from "@/db/queries"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Zod validation schema
const CreateDeckSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().optional(),
})

type CreateDeckInput = z.infer<typeof CreateDeckSchema>

export async function createDeckAction(input: CreateDeckInput) {
  // 1. Always validate with Zod first
  const validatedData = CreateDeckSchema.parse(input)
  
  // 2. Call query function (handles auth & DB operations)
  const newDeck = await createDeck(validatedData)
  
  // 3. Revalidate cache
  revalidatePath("/decks")
  
  return newDeck
}

export async function updateDeckAction(deckId: number, input: Partial<CreateDeckInput>) {
  // Query function handles all the complexity
  const updatedDeck = await updateDeck(deckId, input)
  
  revalidatePath("/decks")
  return updatedDeck
}
```

```typescript
// ❌ WRONG: Direct database operations in actions
"use server"
import { db } from "@/db"
import { decksTable } from "@/db/schema"

export async function createDeckAction(input: any) {
  // Don't do direct DB operations in actions!
  const result = await db.insert(decksTable).values(input)
  return result
}
```

## Query Function Patterns

### Deck Queries Example
```typescript
// 📁 db/queries/deck-queries.ts

// ✅ All query functions follow this pattern:
export async function getUserDecks(): Promise<Deck[]> {
  // 1. Authentication check (built into every query)
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized - user must be authenticated")
  }
  
  // 2. Database operation with user filtering
  return await db.select().from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(desc(decksTable.updatedAt))
}

// ✅ Ownership verification built-in
export async function getDeckById(deckId: number): Promise<Deck | null> {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized - user must be authenticated")
  }
  
  // Always filter by userId to ensure ownership
  const [deck] = await db.select().from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .limit(1)
  
  return deck || null
}
```

## Usage Examples

### 1. Displaying Data (Server Component)
```typescript
// 📁 app/decks/page.tsx
import { getUserDecks } from "@/db/queries"

export default async function DecksPage() {
  const decks = await getUserDecks()
  
  return (
    <div>
      <h1>My Decks</h1>
      {decks.map(deck => (
        <div key={deck.id}>{deck.title}</div>
      ))}
    </div>
  )
}
```

### 2. Creating Data (Server Action + Client Form)
```typescript
// 📁 actions/deck-actions.ts
"use server"
import { createDeck } from "@/db/queries"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const CreateDeckSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
})

export async function createDeckAction(input: z.infer<typeof CreateDeckSchema>) {
  const validatedData = CreateDeckSchema.parse(input)
  const deck = await createDeck(validatedData)
  revalidatePath("/decks")
  return deck
}
```

```typescript
// 📁 components/create-deck-form.tsx
"use client"
import { createDeckAction } from "@/actions/deck-actions"

export function CreateDeckForm() {
  const handleSubmit = async (formData: FormData) => {
    await createDeckAction({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
    })
  }
  
  return (
    <form action={handleSubmit}>
      <input name="title" placeholder="Deck title" required />
      <input name="description" placeholder="Description" />
      <button type="submit">Create Deck</button>
    </form>
  )
}
```

### 3. Complex Queries
```typescript
// 📁 app/decks/[id]/page.tsx
import { getDeckById, getCardsByDeckId } from "@/db/queries"

export default async function DeckDetailPage({ params }: { params: { id: string } }) {
  const deckId = Number(params.id)
  
  // Call multiple query functions
  const [deck, cards] = await Promise.all([
    getDeckById(deckId),
    getCardsByDeckId(deckId)
  ])
  
  if (!deck) {
    return <div>Deck not found</div>
  }
  
  return (
    <div>
      <h1>{deck.title}</h1>
      <p>{cards.length} cards</p>
    </div>
  )
}
```

## Available Query Functions

### Deck Queries
```typescript
import {
  getUserDecks,           // Get all user's decks
  getDeckById,            // Get single deck (with ownership check)
  getDeckWithCardCount,   // Get deck with card count
  createDeck,             // Create new deck
  updateDeck,             // Update existing deck
  deleteDeck,             // Delete deck and its cards
  verifyDeckOwnership,    // Check if user owns deck
} from "@/db/queries"
```

### Card Queries
```typescript
import {
  getCardsByDeckId,       // Get all cards in a deck
  getCardById,            // Get single card (with ownership check)
  createCard,             // Create new card
  updateCard,             // Update existing card
  deleteCard,             // Delete card
  getCardsCountByDeckId,  // Get card count for deck
  createBulkCards,        // Create multiple cards at once
  getRandomCardsByDeckId, // Get random cards for study
} from "@/db/queries"
```

## File Organization

```
src/
├── db/
│   ├── queries/
│   │   ├── deck-queries.ts    # All deck operations
│   │   ├── card-queries.ts    # All card operations
│   │   └── index.ts           # Export all queries
│   ├── schema.ts              # Database schema
│   └── index.ts               # DB connection
├── actions/                   # Server actions (call queries)
├── app/                       # Server components (call queries)
└── components/                # Client components (UI only)
```

## Security Features

### Built-in Authentication
Every query function includes authentication:
```typescript
const { userId } = await auth()
if (!userId) {
  throw new Error("Unauthorized - user must be authenticated")
}
```

### Automatic Ownership Verification
All queries automatically filter by user:
```typescript
.where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
```

### Input Validation
Server actions validate all inputs with Zod:
```typescript
const validatedData = CreateDeckSchema.parse(input)
```

## Key Benefits

1. **🔒 Security**: Built-in auth & ownership checks in every query
2. **🧹 Clean Architecture**: Clear separation of concerns
3. **🔄 Reusability**: Query functions usable anywhere
4. **🛡️ Type Safety**: Full TypeScript support
5. **🧪 Testability**: Easy to unit test query functions
6. **📝 Maintainability**: All DB logic centralized

## Migration Guide

### Old Pattern ❌
```typescript
// Server component with direct DB calls
import { db } from "@/db"
import { decksTable } from "@/db/schema"

export default async function DecksPage() {
  const decks = await db.select().from(decksTable)
  return <div>...</div>
}
```

### New Pattern ✅
```typescript
// Server component with query functions
import { getUserDecks } from "@/db/queries"

export default async function DecksPage() {
  const decks = await getUserDecks()
  return <div>...</div>
}
```

## Common Mistakes to Avoid

- ❌ Direct database operations outside of query functions
- ❌ Fetching data in client components
- ❌ Skipping authentication checks
- ❌ Missing input validation in server actions
- ❌ Not revalidating paths after mutations
- ❌ Using API routes for database operations

## Remember

- **All database operations** must go through `db/queries` functions
- **Server components** call query functions for data fetching
- **Server actions** call query functions for mutations
- **Query functions** handle all security, auth, and ownership verification
- **Always validate** inputs with Zod in server actions
- **Always revalidate** paths after mutations 