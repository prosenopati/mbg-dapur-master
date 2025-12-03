import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dapurs } from '@/db/schema';
import { eq, like, or, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(dapurs)
        .where(eq(dapurs.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Kitchen not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    let query = db.select().from(dapurs);

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(dapurs.name, `%${search}%`),
          like(dapurs.location, `%${search}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(dapurs.status, status));
    }

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
    const { name, location, capacity, managerName, contact, status } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string', code: 'INVALID_NAME' },
        { status: 400 }
      );
    }

    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      return NextResponse.json(
        { error: 'Location is required and must be a non-empty string', code: 'INVALID_LOCATION' },
        { status: 400 }
      );
    }

    if (!capacity || typeof capacity !== 'number' || capacity <= 0 || !Number.isInteger(capacity)) {
      return NextResponse.json(
        { error: 'Capacity is required and must be a positive integer', code: 'INVALID_CAPACITY' },
        { status: 400 }
      );
    }

    if (!managerName || typeof managerName !== 'string' || managerName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Manager name is required and must be a non-empty string', code: 'INVALID_MANAGER_NAME' },
        { status: 400 }
      );
    }

    if (!contact || typeof contact !== 'string' || contact.trim().length === 0) {
      return NextResponse.json(
        { error: 'Contact is required and must be a non-empty string', code: 'INVALID_CONTACT' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const now = new Date().toISOString();
    const insertData = {
      name: name.trim(),
      location: location.trim(),
      capacity,
      managerName: managerName.trim(),
      contact: contact.trim(),
      status: status && typeof status === 'string' ? status.trim() : 'active',
      createdAt: now,
      updatedAt: now,
    };

    const newRecord = await db.insert(dapurs).values(insertData).returning();

    return NextResponse.json(newRecord[0], { status: 201 });
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
      .from(dapurs)
      .where(eq(dapurs.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Kitchen not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, location, capacity, managerName, contact, status } = body;

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name must be a non-empty string', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (location !== undefined) {
      if (typeof location !== 'string' || location.trim().length === 0) {
        return NextResponse.json(
          { error: 'Location must be a non-empty string', code: 'INVALID_LOCATION' },
          { status: 400 }
        );
      }
      updates.location = location.trim();
    }

    if (capacity !== undefined) {
      if (typeof capacity !== 'number' || capacity <= 0 || !Number.isInteger(capacity)) {
        return NextResponse.json(
          { error: 'Capacity must be a positive integer', code: 'INVALID_CAPACITY' },
          { status: 400 }
        );
      }
      updates.capacity = capacity;
    }

    if (managerName !== undefined) {
      if (typeof managerName !== 'string' || managerName.trim().length === 0) {
        return NextResponse.json(
          { error: 'Manager name must be a non-empty string', code: 'INVALID_MANAGER_NAME' },
          { status: 400 }
        );
      }
      updates.managerName = managerName.trim();
    }

    if (contact !== undefined) {
      if (typeof contact !== 'string' || contact.trim().length === 0) {
        return NextResponse.json(
          { error: 'Contact must be a non-empty string', code: 'INVALID_CONTACT' },
          { status: 400 }
        );
      }
      updates.contact = contact.trim();
    }

    if (status !== undefined) {
      if (typeof status !== 'string' || status.trim().length === 0) {
        return NextResponse.json(
          { error: 'Status must be a non-empty string', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      updates.status = status.trim();
    }

    const updated = await db
      .update(dapurs)
      .set(updates)
      .where(eq(dapurs.id, parseInt(id)))
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
      .from(dapurs)
      .where(eq(dapurs.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Kitchen not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(dapurs)
      .where(eq(dapurs.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Kitchen deleted successfully',
        data: deleted[0],
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