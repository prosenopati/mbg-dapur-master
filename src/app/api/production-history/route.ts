import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { productionHistory, dapurs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const dapurId = searchParams.get('dapurId');
    const date = searchParams.get('date');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Single record by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(productionHistory)
        .where(eq(productionHistory.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Production history record not found', code: 'RECORD_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with optional filters
    let query = db.select().from(productionHistory);

    const conditions = [];

    if (dapurId) {
      if (isNaN(parseInt(dapurId))) {
        return NextResponse.json(
          { error: 'Valid dapurId is required', code: 'INVALID_DAPUR_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(productionHistory.dapurId, parseInt(dapurId)));
    }

    if (date) {
      conditions.push(eq(productionHistory.date, date));
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
    const { dapurId, date, dayName, target, actual } = body;

    // Validate required fields
    if (!dapurId) {
      return NextResponse.json(
        { error: 'dapurId is required', code: 'MISSING_DAPUR_ID' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: 'date is required', code: 'MISSING_DATE' },
        { status: 400 }
      );
    }

    if (!dayName) {
      return NextResponse.json(
        { error: 'dayName is required', code: 'MISSING_DAY_NAME' },
        { status: 400 }
      );
    }

    if (target === undefined || target === null) {
      return NextResponse.json(
        { error: 'target is required', code: 'MISSING_TARGET' },
        { status: 400 }
      );
    }

    if (actual === undefined || actual === null) {
      return NextResponse.json(
        { error: 'actual is required', code: 'MISSING_ACTUAL' },
        { status: 400 }
      );
    }

    // Validate dapurId is valid integer
    if (isNaN(parseInt(dapurId))) {
      return NextResponse.json(
        { error: 'dapurId must be a valid integer', code: 'INVALID_DAPUR_ID' },
        { status: 400 }
      );
    }

    // Validate target is positive integer
    if (isNaN(parseInt(target)) || parseInt(target) < 0) {
      return NextResponse.json(
        { error: 'target must be a positive integer', code: 'INVALID_TARGET' },
        { status: 400 }
      );
    }

    // Validate actual is positive integer
    if (isNaN(parseInt(actual)) || parseInt(actual) < 0) {
      return NextResponse.json(
        { error: 'actual must be a positive integer', code: 'INVALID_ACTUAL' },
        { status: 400 }
      );
    }

    // Validate dapurId exists in dapurs table
    const dapurExists = await db
      .select()
      .from(dapurs)
      .where(eq(dapurs.id, parseInt(dapurId)))
      .limit(1);

    if (dapurExists.length === 0) {
      return NextResponse.json(
        { error: 'Invalid dapurId: kitchen does not exist', code: 'DAPUR_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Create new production history record
    const newRecord = await db
      .insert(productionHistory)
      .values({
        dapurId: parseInt(dapurId),
        date: date.trim(),
        dayName: dayName.trim(),
        target: parseInt(target),
        actual: parseInt(actual),
        createdAt: new Date().toISOString(),
      })
      .returning();

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
    const existingRecord = await db
      .select()
      .from(productionHistory)
      .where(eq(productionHistory.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Production history record not found', code: 'RECORD_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { target, actual } = body;

    const updates: { target?: number; actual?: number } = {};

    // Validate and add target if provided
    if (target !== undefined && target !== null) {
      if (isNaN(parseInt(target)) || parseInt(target) < 0) {
        return NextResponse.json(
          { error: 'target must be a positive integer', code: 'INVALID_TARGET' },
          { status: 400 }
        );
      }
      updates.target = parseInt(target);
    }

    // Validate and add actual if provided
    if (actual !== undefined && actual !== null) {
      if (isNaN(parseInt(actual)) || parseInt(actual) < 0) {
        return NextResponse.json(
          { error: 'actual must be a positive integer', code: 'INVALID_ACTUAL' },
          { status: 400 }
        );
      }
      updates.actual = parseInt(actual);
    }

    // If no updatable fields provided, return error
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATE_FIELDS' },
        { status: 400 }
      );
    }

    // Update record
    const updated = await db
      .update(productionHistory)
      .set(updates)
      .where(eq(productionHistory.id, parseInt(id)))
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
    const existingRecord = await db
      .select()
      .from(productionHistory)
      .where(eq(productionHistory.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Production history record not found', code: 'RECORD_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete record
    const deleted = await db
      .delete(productionHistory)
      .where(eq(productionHistory.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Production history record deleted successfully',
        record: deleted[0],
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