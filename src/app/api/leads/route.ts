import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

function corsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

const ALLOWED_ORIGINS = [
  'https://yournextcourier.com',
  'http://localhost:4321',
];

function getAllowedOrigin(req: NextRequest): string | null {
  const origin = req.headers.get('origin');
  if (origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o))) {
    return origin;
  }
  return ALLOWED_ORIGINS[0];
}

export async function OPTIONS(request: NextRequest) {
  const origin = getAllowedOrigin(request);
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

// GET - List leads (with optional category filter)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (category) {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { formName: { contains: search, mode: 'insensitive' } },
        { source: { contains: search, mode: 'insensitive' } },
        { assigned: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const origin = getAllowedOrigin(request);
    const body = await request.json();
    const { formName, category, source, formData, status, assigned } = body;

    if (!formName || !category || !formData) {
      return NextResponse.json(
        { error: 'formName, category, and formData are required' },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        formName,
        category,
        source: source || '',
        formData,
        status: status || 'NEW INQUIRY',
        assigned: assigned || null,
      },
    });

    return NextResponse.json(lead, { status: 201, headers: corsHeaders(origin) });
  } catch (error) {
    console.error('Error creating lead:', error);
    const origin = getAllowedOrigin(request);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}

// PATCH - Update lead (status, assigned)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, assigned } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(assigned !== undefined && { assigned }),
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
