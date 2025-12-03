import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { materialUsage } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const VALID_STATUSES = ['normal', 'warning', 'alert'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const dapurId = searchParams.get('dapurId');
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Get single record by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(materialUsage)
        .where(eq(materialUsage.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Material usage record not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // Build query with filters
    let query = db.select().from(materialUsage);
    const conditions = [];

    if (dapurId) {
      if (isNaN(parseInt(dapurId))) {
        return NextResponse.json(
          { error: 'Valid dapurId is required', code: 'INVALID_DAPUR_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(materialUsage.dapurId, parseInt(dapurId)));
    }

    if (date) {
      conditions.push(eq(materialUsage.date, date));
    }

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { 
            error: `Status must be one of: ${VALID_STATUSES.join(', ')}`, 
            code: 'INVALID_STATUS' 
          },
          { status: 400 }
        );
      }
      conditions.push(eq(materialUsage.status, status));
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
      materialName,
      unit,
      standardAmount,
      actualAmount,
      variance,
      status
    } = body;

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

    if (!materialName || typeof materialName !== 'string' || materialName.trim() === '') {
      return NextResponse.json(
        { error: 'materialName is required', code: 'MISSING_MATERIAL_NAME' },
        { status: 400 }
      );
    }

    if (!unit || typeof unit !== 'string' || unit.trim() === '') {
      return NextResponse.json(
        { error: 'unit is required', code: 'MISSING_UNIT' },
        { status: 400 }
      );
    }

    if (standardAmount === undefined || standardAmount === null) {
      return NextResponse.json(
        { error: 'standardAmount is required', code: 'MISSING_STANDARD_AMOUNT' },
        { status: 400 }
      );
    }

    if (actualAmount === undefined || actualAmount === null) {
      return NextResponse.json(
        { error: 'actualAmount is required', code: 'MISSING_ACTUAL_AMOUNT' },
        { status: 400 }
      );
    }

    if (variance === undefined || variance === null) {
      return NextResponse.json(
        { error: 'variance is required', code: 'MISSING_VARIANCE' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'status is required', code: 'MISSING_STATUS' },
        { status: 400 }
      );
    }

    // Validate data types
    if (isNaN(parseInt(dapurId))) {
      return NextResponse.json(
        { error: 'dapurId must be a valid integer', code: 'INVALID_DAPUR_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseFloat(standardAmount))) {
      return NextResponse.json(
        { error: 'standardAmount must be a valid number', code: 'INVALID_STANDARD_AMOUNT' },
        { status: 400 }
      );
    }

    if (isNaN(parseFloat(actualAmount))) {
      return NextResponse.json(
        { error: 'actualAmount must be a valid number', code: 'INVALID_ACTUAL_AMOUNT' },
        { status: 400 }
      );
    }

    if (isNaN(parseFloat(variance))) {
      return NextResponse.json(
        { error: 'variance must be a valid number', code: 'INVALID_VARIANCE' },
        { status: 400 }
      );
    }

    // Validate status enum
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { 
          error: `status must be one of: ${VALID_STATUSES.join(', ')}`, 
          code: 'INVALID_STATUS' 
        },
        { status: 400 }
      );
    }

    // Insert new record
    const newRecord = await db
      .insert(materialUsage)
      .values({
        dapurId: parseInt(dapurId),
        date: date.trim(),
        materialName: materialName.trim(),
        unit: unit.trim(),
        standardAmount: parseFloat(standardAmount),
        actualAmount: parseFloat(actualAmount),
        variance: parseFloat(variance),
        status,
        createdAt: new Date().toISOString()
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

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(materialUsage)
      .where(eq(materialUsage.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Material usage record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { actualAmount, variance, status } = body;

    // Build update object with only provided fields
    const updates: any = {};

    if (actualAmount !== undefined) {
      if (isNaN(parseFloat(actualAmount))) {
        return NextResponse.json(
          { error: 'actualAmount must be a valid number', code: 'INVALID_ACTUAL_AMOUNT' },
          { status: 400 }
        );
      }
      updates.actualAmount = parseFloat(actualAmount);
    }

    if (variance !== undefined) {
      if (isNaN(parseFloat(variance))) {
        return NextResponse.json(
          { error: 'variance must be a valid number', code: 'INVALID_VARIANCE' },
          { status: 400 }
        );
      }
      updates.variance = parseFloat(variance);
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { 
            error: `status must be one of: ${VALID_STATUSES.join(', ')}`, 
            code: 'INVALID_STATUS' 
          },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    // If no fields to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATE_FIELDS' },
        { status: 400 }
      );
    }

    // Update record
    const updated = await db
      .update(materialUsage)
      .set(updates)
      .where(eq(materialUsage.id, parseInt(id)))
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
    const existingRecord = await db
      .select()
      .from(materialUsage)
      .where(eq(materialUsage.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Material usage record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete record
    const deleted = await db
      .delete(materialUsage)
      .where(eq(materialUsage.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      { 
        message: 'Material usage record deleted successfully',
        deletedRecord: deleted[0]
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