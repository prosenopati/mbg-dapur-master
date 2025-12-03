import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { menuItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const VALID_SESSIONS = ['pagi', 'siang', 'malam'] as const;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const dapurId = searchParams.get('dapurId');
    const date = searchParams.get('date');
    const session = searchParams.get('session');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Single record by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Menu item not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with filters
    const conditions = [];
    
    if (dapurId) {
      if (isNaN(parseInt(dapurId))) {
        return NextResponse.json(
          { error: 'Valid dapur ID is required', code: 'INVALID_DAPUR_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(menuItems.dapurId, parseInt(dapurId)));
    }

    if (date) {
      conditions.push(eq(menuItems.date, date));
    }

    if (session) {
      if (!VALID_SESSIONS.includes(session as any)) {
        return NextResponse.json(
          { 
            error: 'Session must be one of: pagi, siang, malam', 
            code: 'INVALID_SESSION' 
          },
          { status: 400 }
        );
      }
      conditions.push(eq(menuItems.session, session));
    }

    let query = db.select().from(menuItems);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dapurId, date, session, dishes } = body;

    // Validate required fields
    if (!dapurId) {
      return NextResponse.json(
        { error: 'Dapur ID is required', code: 'MISSING_DAPUR_ID' },
        { status: 400 }
      );
    }

    if (typeof dapurId !== 'number' || isNaN(dapurId)) {
      return NextResponse.json(
        { error: 'Dapur ID must be a valid integer', code: 'INVALID_DAPUR_ID' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required', code: 'MISSING_DATE' },
        { status: 400 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Session is required', code: 'MISSING_SESSION' },
        { status: 400 }
      );
    }

    if (!VALID_SESSIONS.includes(session)) {
      return NextResponse.json(
        { 
          error: 'Session must be one of: pagi, siang, malam', 
          code: 'INVALID_SESSION' 
        },
        { status: 400 }
      );
    }

    if (!dishes) {
      return NextResponse.json(
        { error: 'Dishes are required', code: 'MISSING_DISHES' },
        { status: 400 }
      );
    }

    if (!Array.isArray(dishes)) {
      return NextResponse.json(
        { error: 'Dishes must be a valid array', code: 'INVALID_DISHES_FORMAT' },
        { status: 400 }
      );
    }

    const newMenuItem = await db
      .insert(menuItems)
      .values({
        dapurId,
        date: date.trim(),
        session: session.trim(),
        dishes,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newMenuItem[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Menu item not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { session, dishes } = body;

    // Validate session if provided
    if (session && !VALID_SESSIONS.includes(session)) {
      return NextResponse.json(
        { 
          error: 'Session must be one of: pagi, siang, malam', 
          code: 'INVALID_SESSION' 
        },
        { status: 400 }
      );
    }

    // Validate dishes if provided
    if (dishes && !Array.isArray(dishes)) {
      return NextResponse.json(
        { error: 'Dishes must be a valid array', code: 'INVALID_DISHES_FORMAT' },
        { status: 400 }
      );
    }

    const updates: { session?: string; dishes?: any } = {};

    if (session) {
      updates.session = session.trim();
    }

    if (dishes) {
      updates.dishes = dishes;
    }

    const updated = await db
      .update(menuItems)
      .set(updates)
      .where(eq(menuItems.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Menu item not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(menuItems)
      .where(eq(menuItems.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      { 
        message: 'Menu item deleted successfully',
        data: deleted[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}