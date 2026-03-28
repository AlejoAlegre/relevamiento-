import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'responses.json');

async function readResponses(): Promise<object[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeResponses(responses: object[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(responses, null, 2), 'utf-8');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const entry = {
      id: Date.now(),
      submittedAt: new Date().toISOString(),
      ...body,
    };

    const responses = await readResponses();
    responses.push(entry);
    await writeResponses(responses);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error saving response:', err);
    return NextResponse.json({ ok: false, error: 'Error al guardar' }, { status: 500 });
  }
}
