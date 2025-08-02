import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Transaction from '@/models/Transactions';

export async function POST(req: NextRequest) {
  const { serial } = await req.json();

  if (!serial) {
    return NextResponse.json({ error: 'Serial is required' }, { status: 400 });
  }

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const record = await Transaction.findOne({ serial });

    if (!record) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      customerName: record.customerName,
      amountPaid: record.amountPaid,
      serial: record.serial,
      paidOn: record.paidOn,
    });
  } catch (err) {
    console.error('Serial verification error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
