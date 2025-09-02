// app/api/draw/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomInt } from '../../../lib/mersenne';

export async function GET(req: NextRequest) {
  // Example: draw a random number between 1 and 100
  const number = randomInt(1, 100);
  return NextResponse.json({ number });
}
