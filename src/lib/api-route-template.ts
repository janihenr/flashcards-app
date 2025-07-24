/**
 * SECURE API ROUTE TEMPLATE
 * 
 * This file serves as a REFERENCE TEMPLATE for implementing secure API routes
 * in the future, following the api-security-patterns.mdc rule.
 * 
 * ⚠️  IMPORTANT: This project currently uses SERVER ACTIONS which are MORE SECURE
 * than API routes. Only use API routes if absolutely necessary for external integrations.
 * 
 * ALL API routes MUST follow these security patterns:
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { decksTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const CreateDeckSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().optional(),
});

const UpdateDeckSchema = z.object({
  id: z.number().positive(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
});

// ============================================================================
// SECURE API ROUTE TEMPLATES
// ============================================================================

/**
 * GET Route Template - Read Data
 * MANDATORY: Always start with authentication check
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  // MANDATORY: First line of every API route
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    // CRITICAL: Only return user's data
    const userData = await db.select().from(decksTable)
      .where(eq(decksTable.userId, userId));
      
    return NextResponse.json(userData);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST Route Template - Create Data
 * MANDATORY: Always include userId when creating
 */
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = CreateDeckSchema.parse(body);
    
    // CRITICAL: Always include userId when creating (never trust client)
    const newData = await db.insert(decksTable).values({
      ...validatedData,
      userId, // Never trust client for userId
    }).returning();
    
    return NextResponse.json(newData[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.issues }, { status: 400 });
    }
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT Route Template - Update Data
 * MANDATORY: Verify ownership before update
 */
export async function PUT(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const validatedData = UpdateDeckSchema.parse(body);
    const { id, ...updates } = validatedData;
    
    // CRITICAL: Verify ownership before update
    const existing = await db.select().from(decksTable)
      .where(and(eq(decksTable.id, id), eq(decksTable.userId, userId)))
      .limit(1);
    
    if (!existing.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    
    const updated = await db.update(decksTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(decksTable.id, id), eq(decksTable.userId, userId)))
      .returning();
    
    return NextResponse.json(updated[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.issues }, { status: 400 });
    }
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE Route Template - Delete Data
 * MANDATORY: Verify ownership before delete
 */
export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Valid ID required" }, { status: 400 });
    }
    
    // CRITICAL: Verify ownership before delete
    const existing = await db.select().from(decksTable)
      .where(and(eq(decksTable.id, Number(id)), eq(decksTable.userId, userId)))
      .limit(1);
    
    if (!existing.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    
    await db.delete(decksTable)
      .where(and(eq(decksTable.id, Number(id)), eq(decksTable.userId, userId)));
    
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Dynamic Route Template - Single Resource (/api/decks/[id])
 */
export async function GET_DYNAMIC(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const deckId = Number(params.id);
    
    if (isNaN(deckId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    
    // CRITICAL: Include userId in query
    const deck = await db.select().from(decksTable)
      .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
      .limit(1);
    
    if (!deck.length) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }
    
    return NextResponse.json(deck[0]);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ============================================================================
// SECURITY CHECKLIST FOR API ROUTES
// ============================================================================

/**
 * ✅ MANDATORY CHECKLIST FOR EVERY API ROUTE:
 * 
 * 1. ✅ Authentication: Check `userId` first
 * 2. ✅ Authorization: Validate user owns the data  
 * 3. ✅ Input Validation: Use Zod schemas
 * 4. ✅ Error Handling: Proper try/catch with status codes
 * 5. ✅ User ID Security: Never trust client-provided user IDs
 * 6. ✅ Ownership Verification: Check before all mutations
 * 7. ✅ Logging: Log errors (exclude sensitive data)
 * 
 * ❌ NEVER DO:
 * - Skip authentication checks
 * - Trust client-provided user IDs
 * - Return data from other users
 * - Skip ownership verification
 * - Use unvalidated input
 */ 