import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { feedbackEntries } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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
        .from(feedbackEntries)
        .where(eq(feedbackEntries.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Feedback entry not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // List with filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const dapurId = searchParams.get('dapurId');
    const date = searchParams.get('date');
    const session = searchParams.get('session');
    const sentiment = searchParams.get('sentiment');
    const status = searchParams.get('status');

    let query = db.select().from(feedbackEntries);

    // Build filter conditions
    const conditions = [];
    if (dapurId) {
      if (isNaN(parseInt(dapurId))) {
        return NextResponse.json(
          { error: 'Valid dapurId is required', code: 'INVALID_DAPUR_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(feedbackEntries.dapurId, parseInt(dapurId)));
    }
    if (date) {
      conditions.push(eq(feedbackEntries.date, date));
    }
    if (session) {
      if (!['pagi', 'siang', 'malam'].includes(session)) {
        return NextResponse.json(
          { error: 'Session must be one of: pagi, siang, malam', code: 'INVALID_SESSION' },
          { status: 400 }
        );
      }
      conditions.push(eq(feedbackEntries.session, session));
    }
    if (sentiment) {
      if (!['positive', 'neutral', 'negative'].includes(sentiment)) {
        return NextResponse.json(
          { error: 'Sentiment must be one of: positive, neutral, negative', code: 'INVALID_SENTIMENT' },
          { status: 400 }
        );
      }
      conditions.push(eq(feedbackEntries.sentiment, sentiment));
    }
    if (status) {
      if (!['noted', 'in-progress', 'resolved'].includes(status)) {
        return NextResponse.json(
          { error: 'Status must be one of: noted, in-progress, resolved', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      conditions.push(eq(feedbackEntries.status, status));
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
    const { dapurId, date, session, feedbackText, sentiment, status } = body;

    // Validate required fields
    if (!dapurId) {
      return NextResponse.json(
        { error: 'dapurId is required', code: 'MISSING_DAPUR_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(dapurId))) {
      return NextResponse.json(
        { error: 'dapurId must be a valid integer', code: 'INVALID_DAPUR_ID' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: 'date is required', code: 'MISSING_DATE' },
        { status: 400 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: 'session is required', code: 'MISSING_SESSION' },
        { status: 400 }
      );
    }

    if (!['pagi', 'siang', 'malam'].includes(session)) {
      return NextResponse.json(
        { error: 'Session must be one of: pagi, siang, malam', code: 'INVALID_SESSION' },
        { status: 400 }
      );
    }

    if (!feedbackText) {
      return NextResponse.json(
        { error: 'feedbackText is required', code: 'MISSING_FEEDBACK_TEXT' },
        { status: 400 }
      );
    }

    if (!sentiment) {
      return NextResponse.json(
        { error: 'sentiment is required', code: 'MISSING_SENTIMENT' },
        { status: 400 }
      );
    }

    if (!['positive', 'neutral', 'negative'].includes(sentiment)) {
      return NextResponse.json(
        { error: 'Sentiment must be one of: positive, neutral, negative', code: 'INVALID_SENTIMENT' },
        { status: 400 }
      );
    }

    // Validate status if provided
    const finalStatus = status || 'noted';
    if (!['noted', 'in-progress', 'resolved'].includes(finalStatus)) {
      return NextResponse.json(
        { error: 'Status must be one of: noted, in-progress, resolved', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Create new feedback entry
    const newFeedback = await db
      .insert(feedbackEntries)
      .values({
        dapurId: parseInt(dapurId),
        date: date.trim(),
        session: session.trim(),
        feedbackText: feedbackText.trim(),
        sentiment: sentiment.trim(),
        status: finalStatus,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newFeedback[0], { status: 201 });
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
      .from(feedbackEntries)
      .where(eq(feedbackEntries.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Feedback entry not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { feedbackText, sentiment, status } = body;

    // Build update object with only provided fields
    const updates: any = {};

    if (feedbackText !== undefined) {
      if (!feedbackText || feedbackText.trim() === '') {
        return NextResponse.json(
          { error: 'feedbackText cannot be empty', code: 'INVALID_FEEDBACK_TEXT' },
          { status: 400 }
        );
      }
      updates.feedbackText = feedbackText.trim();
    }

    if (sentiment !== undefined) {
      if (!['positive', 'neutral', 'negative'].includes(sentiment)) {
        return NextResponse.json(
          { error: 'Sentiment must be one of: positive, neutral, negative', code: 'INVALID_SENTIMENT' },
          { status: 400 }
        );
      }
      updates.sentiment = sentiment.trim();
    }

    if (status !== undefined) {
      if (!['noted', 'in-progress', 'resolved'].includes(status)) {
        return NextResponse.json(
          { error: 'Status must be one of: noted, in-progress, resolved', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      updates.status = status.trim();
    }

    // If no valid updates, return error
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    // Perform update
    const updated = await db
      .update(feedbackEntries)
      .set(updates)
      .where(eq(feedbackEntries.id, parseInt(id)))
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
      .from(feedbackEntries)
      .where(eq(feedbackEntries.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Feedback entry not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the record
    const deleted = await db
      .delete(feedbackEntries)
      .where(eq(feedbackEntries.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Feedback entry deleted successfully',
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