import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { menuItems } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate that body is an array
    if (!Array.isArray(body)) {
      return NextResponse.json({
        error: "Request body must be an array of menu items",
        code: "INVALID_INPUT_TYPE"
      }, { status: 400 });
    }

    // Validate that array is not empty
    if (body.length === 0) {
      return NextResponse.json({
        error: "Array cannot be empty",
        code: "EMPTY_ARRAY"
      }, { status: 400 });
    }

    // Validate each item in the array
    const validatedItems = [];
    for (let i = 0; i < body.length; i++) {
      const item = body[i];

      // Check required fields
      if (!item.dapurId) {
        return NextResponse.json({
          error: `Item at index ${i}: dapurId is required`,
          code: "MISSING_DAPUR_ID"
        }, { status: 400 });
      }

      if (!item.date) {
        return NextResponse.json({
          error: `Item at index ${i}: date is required`,
          code: "MISSING_DATE"
        }, { status: 400 });
      }

      if (!item.session) {
        return NextResponse.json({
          error: `Item at index ${i}: session is required`,
          code: "MISSING_SESSION"
        }, { status: 400 });
      }

      if (!item.dishes) {
        return NextResponse.json({
          error: `Item at index ${i}: dishes is required`,
          code: "MISSING_DISHES"
        }, { status: 400 });
      }

      // Validate dapurId is a valid integer
      const dapurId = parseInt(item.dapurId);
      if (isNaN(dapurId)) {
        return NextResponse.json({
          error: `Item at index ${i}: dapurId must be a valid integer`,
          code: "INVALID_DAPUR_ID"
        }, { status: 400 });
      }

      // Validate dishes is an array
      if (!Array.isArray(item.dishes)) {
        return NextResponse.json({
          error: `Item at index ${i}: dishes must be an array`,
          code: "INVALID_DISHES_TYPE"
        }, { status: 400 });
      }

      // Build validated item with auto-generated timestamp
      validatedItems.push({
        dapurId: dapurId,
        date: item.date.trim(),
        session: item.session.trim(),
        dishes: item.dishes,
        createdAt: new Date().toISOString()
      });
    }

    // Insert all items at once
    const createdItems = await db.insert(menuItems)
      .values(validatedItems)
      .returning();

    return NextResponse.json(createdItems, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}