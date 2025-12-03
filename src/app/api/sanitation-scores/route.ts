import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sanitationScores } from '@/db/schema';
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
        .from(sanitationScores)
        .where(eq(sanitationScores.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Sanitation score not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with filters
    let query = db.select().from(sanitationScores);

    const conditions = [];
    if (dapurId) {
      if (isNaN(parseInt(dapurId))) {
        return NextResponse.json(
          { error: 'Valid dapur ID is required', code: 'INVALID_DAPUR_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(sanitationScores.dapurId, parseInt(dapurId)));
    }

    if (date) {
      conditions.push(eq(sanitationScores.date, date));
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
    const {
      dapurId,
      date,
      kitchenCleanliness,
      storage,
      equipment,
      personalHygiene,
      pestControl,
      documentation,
    } = body;

    // Validate required fields
    if (!dapurId) {
      return NextResponse.json(
        { error: 'Dapur ID is required', code: 'MISSING_DAPUR_ID' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required', code: 'MISSING_DATE' },
        { status: 400 }
      );
    }

    if (kitchenCleanliness === undefined || kitchenCleanliness === null) {
      return NextResponse.json(
        { error: 'Kitchen cleanliness score is required', code: 'MISSING_KITCHEN_CLEANLINESS' },
        { status: 400 }
      );
    }

    if (storage === undefined || storage === null) {
      return NextResponse.json(
        { error: 'Storage score is required', code: 'MISSING_STORAGE' },
        { status: 400 }
      );
    }

    if (equipment === undefined || equipment === null) {
      return NextResponse.json(
        { error: 'Equipment score is required', code: 'MISSING_EQUIPMENT' },
        { status: 400 }
      );
    }

    if (personalHygiene === undefined || personalHygiene === null) {
      return NextResponse.json(
        { error: 'Personal hygiene score is required', code: 'MISSING_PERSONAL_HYGIENE' },
        { status: 400 }
      );
    }

    if (pestControl === undefined || pestControl === null) {
      return NextResponse.json(
        { error: 'Pest control score is required', code: 'MISSING_PEST_CONTROL' },
        { status: 400 }
      );
    }

    if (documentation === undefined || documentation === null) {
      return NextResponse.json(
        { error: 'Documentation score is required', code: 'MISSING_DOCUMENTATION' },
        { status: 400 }
      );
    }

    // Validate dapurId is a valid integer
    if (isNaN(parseInt(dapurId))) {
      return NextResponse.json(
        { error: 'Dapur ID must be a valid integer', code: 'INVALID_DAPUR_ID' },
        { status: 400 }
      );
    }

    // Validate score fields are integers between 0 and 100
    const scores = [
      { value: kitchenCleanliness, name: 'Kitchen cleanliness' },
      { value: storage, name: 'Storage' },
      { value: equipment, name: 'Equipment' },
      { value: personalHygiene, name: 'Personal hygiene' },
      { value: pestControl, name: 'Pest control' },
      { value: documentation, name: 'Documentation' },
    ];

    for (const score of scores) {
      if (typeof score.value !== 'number' || !Number.isInteger(score.value)) {
        return NextResponse.json(
          { error: `${score.name} must be an integer`, code: 'INVALID_SCORE_TYPE' },
          { status: 400 }
        );
      }

      if (score.value < 0 || score.value > 100) {
        return NextResponse.json(
          { error: `${score.name} must be between 0 and 100`, code: 'SCORE_OUT_OF_RANGE' },
          { status: 400 }
        );
      }
    }

    // Create new sanitation score
    const newScore = await db
      .insert(sanitationScores)
      .values({
        dapurId: parseInt(dapurId),
        date: date.trim(),
        kitchenCleanliness,
        storage,
        equipment,
        personalHygiene,
        pestControl,
        documentation,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newScore[0], { status: 201 });
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

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(sanitationScores)
      .where(eq(sanitationScores.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Sanitation score not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      kitchenCleanliness,
      storage,
      equipment,
      personalHygiene,
      pestControl,
      documentation,
    } = body;

    const updates: any = {};

    // Validate and add score fields if provided
    const scores = [
      { value: kitchenCleanliness, name: 'Kitchen cleanliness', field: 'kitchenCleanliness' },
      { value: storage, name: 'Storage', field: 'storage' },
      { value: equipment, name: 'Equipment', field: 'equipment' },
      { value: personalHygiene, name: 'Personal hygiene', field: 'personalHygiene' },
      { value: pestControl, name: 'Pest control', field: 'pestControl' },
      { value: documentation, name: 'Documentation', field: 'documentation' },
    ];

    for (const score of scores) {
      if (score.value !== undefined && score.value !== null) {
        if (typeof score.value !== 'number' || !Number.isInteger(score.value)) {
          return NextResponse.json(
            { error: `${score.name} must be an integer`, code: 'INVALID_SCORE_TYPE' },
            { status: 400 }
          );
        }

        if (score.value < 0 || score.value > 100) {
          return NextResponse.json(
            { error: `${score.name} must be between 0 and 100`, code: 'SCORE_OUT_OF_RANGE' },
            { status: 400 }
          );
        }

        updates[score.field] = score.value;
      }
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    // Update the record
    const updated = await db
      .update(sanitationScores)
      .set(updates)
      .where(eq(sanitationScores.id, parseInt(id)))
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

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(sanitationScores)
      .where(eq(sanitationScores.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Sanitation score not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the record
    const deleted = await db
      .delete(sanitationScores)
      .where(eq(sanitationScores.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Sanitation score deleted successfully',
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