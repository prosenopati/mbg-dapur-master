import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { staffAttendance, dapurs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const dapurId = searchParams.get('dapurId');
    const date = searchParams.get('date');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Get single record by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(staffAttendance)
        .where(eq(staffAttendance.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Staff attendance record not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with filtering
    let query = db.select().from(staffAttendance);
    const conditions = [];

    if (dapurId) {
      if (isNaN(parseInt(dapurId))) {
        return NextResponse.json(
          { error: 'Valid dapur ID is required', code: 'INVALID_DAPUR_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(staffAttendance.dapurId, parseInt(dapurId)));
    }

    if (date) {
      conditions.push(eq(staffAttendance.date, date));
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
    const { dapurId, date, totalStaff, present, onLeave, sick } = body;

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

    if (totalStaff === undefined || totalStaff === null) {
      return NextResponse.json(
        { error: 'Total staff is required', code: 'MISSING_TOTAL_STAFF' },
        { status: 400 }
      );
    }

    if (present === undefined || present === null) {
      return NextResponse.json(
        { error: 'Present count is required', code: 'MISSING_PRESENT' },
        { status: 400 }
      );
    }

    if (onLeave === undefined || onLeave === null) {
      return NextResponse.json(
        { error: 'On leave count is required', code: 'MISSING_ON_LEAVE' },
        { status: 400 }
      );
    }

    if (sick === undefined || sick === null) {
      return NextResponse.json(
        { error: 'Sick count is required', code: 'MISSING_SICK' },
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

    // Validate all counts are non-negative integers
    if (totalStaff < 0 || !Number.isInteger(totalStaff)) {
      return NextResponse.json(
        { error: 'Total staff must be a non-negative integer', code: 'INVALID_TOTAL_STAFF' },
        { status: 400 }
      );
    }

    if (present < 0 || !Number.isInteger(present)) {
      return NextResponse.json(
        { error: 'Present count must be a non-negative integer', code: 'INVALID_PRESENT' },
        { status: 400 }
      );
    }

    if (onLeave < 0 || !Number.isInteger(onLeave)) {
      return NextResponse.json(
        { error: 'On leave count must be a non-negative integer', code: 'INVALID_ON_LEAVE' },
        { status: 400 }
      );
    }

    if (sick < 0 || !Number.isInteger(sick)) {
      return NextResponse.json(
        { error: 'Sick count must be a non-negative integer', code: 'INVALID_SICK' },
        { status: 400 }
      );
    }

    // Validate staff counts don't exceed total
    const totalAccounted = present + onLeave + sick;
    if (totalAccounted > totalStaff) {
      return NextResponse.json(
        { 
          error: `Total staff counts (${totalAccounted}) cannot exceed total staff (${totalStaff})`, 
          code: 'STAFF_COUNT_EXCEEDED' 
        },
        { status: 400 }
      );
    }

    // Verify dapur exists
    const dapurExists = await db
      .select()
      .from(dapurs)
      .where(eq(dapurs.id, parseInt(dapurId)))
      .limit(1);

    if (dapurExists.length === 0) {
      return NextResponse.json(
        { error: 'Dapur not found', code: 'DAPUR_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Create new record
    const newRecord = await db
      .insert(staffAttendance)
      .values({
        dapurId: parseInt(dapurId),
        date: date.trim(),
        totalStaff,
        present,
        onLeave,
        sick,
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
      .from(staffAttendance)
      .where(eq(staffAttendance.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Staff attendance record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { totalStaff, present, onLeave, sick } = body;

    // Validate if any counts are provided, they must be valid
    if (totalStaff !== undefined && totalStaff !== null) {
      if (totalStaff < 0 || !Number.isInteger(totalStaff)) {
        return NextResponse.json(
          { error: 'Total staff must be a non-negative integer', code: 'INVALID_TOTAL_STAFF' },
          { status: 400 }
        );
      }
    }

    if (present !== undefined && present !== null) {
      if (present < 0 || !Number.isInteger(present)) {
        return NextResponse.json(
          { error: 'Present count must be a non-negative integer', code: 'INVALID_PRESENT' },
          { status: 400 }
        );
      }
    }

    if (onLeave !== undefined && onLeave !== null) {
      if (onLeave < 0 || !Number.isInteger(onLeave)) {
        return NextResponse.json(
          { error: 'On leave count must be a non-negative integer', code: 'INVALID_ON_LEAVE' },
          { status: 400 }
        );
      }
    }

    if (sick !== undefined && sick !== null) {
      if (sick < 0 || !Number.isInteger(sick)) {
        return NextResponse.json(
          { error: 'Sick count must be a non-negative integer', code: 'INVALID_SICK' },
          { status: 400 }
        );
      }
    }

    // Calculate totals with updated values
    const updatedTotalStaff = totalStaff ?? existingRecord[0].totalStaff;
    const updatedPresent = present ?? existingRecord[0].present;
    const updatedOnLeave = onLeave ?? existingRecord[0].onLeave;
    const updatedSick = sick ?? existingRecord[0].sick;

    const totalAccounted = updatedPresent + updatedOnLeave + updatedSick;
    if (totalAccounted > updatedTotalStaff) {
      return NextResponse.json(
        { 
          error: `Total staff counts (${totalAccounted}) cannot exceed total staff (${updatedTotalStaff})`, 
          code: 'STAFF_COUNT_EXCEEDED' 
        },
        { status: 400 }
      );
    }

    // Prepare update object with only provided fields
    const updates: Record<string, number> = {};
    if (totalStaff !== undefined) updates.totalStaff = totalStaff;
    if (present !== undefined) updates.present = present;
    if (onLeave !== undefined) updates.onLeave = onLeave;
    if (sick !== undefined) updates.sick = sick;

    // Update record
    const updated = await db
      .update(staffAttendance)
      .set(updates)
      .where(eq(staffAttendance.id, parseInt(id)))
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
      .from(staffAttendance)
      .where(eq(staffAttendance.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Staff attendance record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete record
    const deleted = await db
      .delete(staffAttendance)
      .where(eq(staffAttendance.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      { 
        message: 'Staff attendance record deleted successfully',
        record: deleted[0] 
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