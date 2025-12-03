import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dailyMetrics, dapurs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const VALID_KITCHEN_STATUSES = ['Normal', 'Overload', 'Gangguan'] as const;

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
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(dailyMetrics)
        .where(eq(dailyMetrics.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Daily metric not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with filters
    let query = db.select().from(dailyMetrics);

    const conditions = [];

    if (dapurId) {
      const dapurIdInt = parseInt(dapurId);
      if (isNaN(dapurIdInt)) {
        return NextResponse.json(
          { error: 'Valid dapur ID is required', code: 'INVALID_DAPUR_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(dailyMetrics.dapurId, dapurIdInt));
    }

    if (date) {
      conditions.push(eq(dailyMetrics.date, date));
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
      portionTarget,
      portionActual,
      budgetPerPortion,
      actualCostPerPortion,
      kitchenStatus,
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

    if (portionTarget === undefined || portionTarget === null) {
      return NextResponse.json(
        { error: 'Portion target is required', code: 'MISSING_PORTION_TARGET' },
        { status: 400 }
      );
    }

    if (portionActual === undefined || portionActual === null) {
      return NextResponse.json(
        { error: 'Portion actual is required', code: 'MISSING_PORTION_ACTUAL' },
        { status: 400 }
      );
    }

    if (budgetPerPortion === undefined || budgetPerPortion === null) {
      return NextResponse.json(
        { error: 'Budget per portion is required', code: 'MISSING_BUDGET_PER_PORTION' },
        { status: 400 }
      );
    }

    if (actualCostPerPortion === undefined || actualCostPerPortion === null) {
      return NextResponse.json(
        { error: 'Actual cost per portion is required', code: 'MISSING_ACTUAL_COST_PER_PORTION' },
        { status: 400 }
      );
    }

    if (!kitchenStatus) {
      return NextResponse.json(
        { error: 'Kitchen status is required', code: 'MISSING_KITCHEN_STATUS' },
        { status: 400 }
      );
    }

    // Validate dapurId is a valid integer
    const dapurIdInt = parseInt(dapurId);
    if (isNaN(dapurIdInt)) {
      return NextResponse.json(
        { error: 'Dapur ID must be a valid integer', code: 'INVALID_DAPUR_ID' },
        { status: 400 }
      );
    }

    // Verify dapur exists
    const dapurExists = await db
      .select()
      .from(dapurs)
      .where(eq(dapurs.id, dapurIdInt))
      .limit(1);

    if (dapurExists.length === 0) {
      return NextResponse.json(
        { error: 'Dapur not found', code: 'DAPUR_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Validate positive integers for portion and budget fields
    const portionTargetInt = parseInt(portionTarget);
    const portionActualInt = parseInt(portionActual);
    const budgetPerPortionInt = parseInt(budgetPerPortion);
    const actualCostPerPortionInt = parseInt(actualCostPerPortion);

    if (isNaN(portionTargetInt) || portionTargetInt < 0) {
      return NextResponse.json(
        { error: 'Portion target must be a positive integer', code: 'INVALID_PORTION_TARGET' },
        { status: 400 }
      );
    }

    if (isNaN(portionActualInt) || portionActualInt < 0) {
      return NextResponse.json(
        { error: 'Portion actual must be a positive integer', code: 'INVALID_PORTION_ACTUAL' },
        { status: 400 }
      );
    }

    if (isNaN(budgetPerPortionInt) || budgetPerPortionInt < 0) {
      return NextResponse.json(
        { error: 'Budget per portion must be a positive integer', code: 'INVALID_BUDGET_PER_PORTION' },
        { status: 400 }
      );
    }

    if (isNaN(actualCostPerPortionInt) || actualCostPerPortionInt < 0) {
      return NextResponse.json(
        { error: 'Actual cost per portion must be a positive integer', code: 'INVALID_ACTUAL_COST_PER_PORTION' },
        { status: 400 }
      );
    }

    // Validate kitchen status
    if (!VALID_KITCHEN_STATUSES.includes(kitchenStatus)) {
      return NextResponse.json(
        {
          error: `Kitchen status must be one of: ${VALID_KITCHEN_STATUSES.join(', ')}`,
          code: 'INVALID_KITCHEN_STATUS',
        },
        { status: 400 }
      );
    }

    // Create the record
    const newMetric = await db
      .insert(dailyMetrics)
      .values({
        dapurId: dapurIdInt,
        date: date.trim(),
        portionTarget: portionTargetInt,
        portionActual: portionActualInt,
        budgetPerPortion: budgetPerPortionInt,
        actualCostPerPortion: actualCostPerPortionInt,
        kitchenStatus: kitchenStatus.trim(),
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newMetric[0], { status: 201 });
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

    const idInt = parseInt(id);

    // Check if record exists
    const existing = await db
      .select()
      .from(dailyMetrics)
      .where(eq(dailyMetrics.id, idInt))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Daily metric not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      portionTarget,
      portionActual,
      budgetPerPortion,
      actualCostPerPortion,
      kitchenStatus,
    } = body;

    const updates: any = {};

    // Validate and add optional fields
    if (portionTarget !== undefined) {
      const portionTargetInt = parseInt(portionTarget);
      if (isNaN(portionTargetInt) || portionTargetInt < 0) {
        return NextResponse.json(
          { error: 'Portion target must be a positive integer', code: 'INVALID_PORTION_TARGET' },
          { status: 400 }
        );
      }
      updates.portionTarget = portionTargetInt;
    }

    if (portionActual !== undefined) {
      const portionActualInt = parseInt(portionActual);
      if (isNaN(portionActualInt) || portionActualInt < 0) {
        return NextResponse.json(
          { error: 'Portion actual must be a positive integer', code: 'INVALID_PORTION_ACTUAL' },
          { status: 400 }
        );
      }
      updates.portionActual = portionActualInt;
    }

    if (budgetPerPortion !== undefined) {
      const budgetPerPortionInt = parseInt(budgetPerPortion);
      if (isNaN(budgetPerPortionInt) || budgetPerPortionInt < 0) {
        return NextResponse.json(
          { error: 'Budget per portion must be a positive integer', code: 'INVALID_BUDGET_PER_PORTION' },
          { status: 400 }
        );
      }
      updates.budgetPerPortion = budgetPerPortionInt;
    }

    if (actualCostPerPortion !== undefined) {
      const actualCostPerPortionInt = parseInt(actualCostPerPortion);
      if (isNaN(actualCostPerPortionInt) || actualCostPerPortionInt < 0) {
        return NextResponse.json(
          { error: 'Actual cost per portion must be a positive integer', code: 'INVALID_ACTUAL_COST_PER_PORTION' },
          { status: 400 }
        );
      }
      updates.actualCostPerPortion = actualCostPerPortionInt;
    }

    if (kitchenStatus !== undefined) {
      if (!VALID_KITCHEN_STATUSES.includes(kitchenStatus)) {
        return NextResponse.json(
          {
            error: `Kitchen status must be one of: ${VALID_KITCHEN_STATUSES.join(', ')}`,
            code: 'INVALID_KITCHEN_STATUS',
          },
          { status: 400 }
        );
      }
      updates.kitchenStatus = kitchenStatus.trim();
    }

    // Update the record
    const updated = await db
      .update(dailyMetrics)
      .set(updates)
      .where(eq(dailyMetrics.id, idInt))
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

    const idInt = parseInt(id);

    // Check if record exists
    const existing = await db
      .select()
      .from(dailyMetrics)
      .where(eq(dailyMetrics.id, idInt))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Daily metric not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the record
    const deleted = await db
      .delete(dailyMetrics)
      .where(eq(dailyMetrics.id, idInt))
      .returning();

    return NextResponse.json(
      {
        message: 'Daily metric deleted successfully',
        deleted: deleted[0],
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