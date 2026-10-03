import { NextResponse } from 'next/server';
import { Pool } from 'pg';

let pool;
function getPool() {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL ||
      'postgresql://mlc_postgres_7tt3_user:dNHiEYsaxbpj1Bq7Nrct55r4qtV8Y2qy@dpg-d8pqcd3sq97s738c57eg-a.singapore-postgres.render.com/mlc_postgres_7tt3';
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
    });
  }
  return pool;
}

const JSON_FIELDS = new Set([
  'business_hours',
  'specialties',
  'concerns',
  'languages',
  'modalities',
  'physical_space_images',
  'supervision_areas',
  'supervision_modalities',
  'clinical_judgment_answers',
  'supervision_application_answers',
  'age_groups',
  'identity_contexts',
  'languages_info',
  'concerns_levels',
  'secondary_modalities',
  'modalities_info',
  'session_modes',
  'faqs',
  'keywords',
  'risk_protocols',
]);

const INTEGER_FIELDS = new Set([
  'years_experience',
  'experience_post_qual',
  'supervision_years_experience',
  'structure',
  'orientation',
  'pacing',
  'action',
  'session_duration',
]);

const BOOLEAN_FIELDS = new Set([
  'is_accepting_new',
  'has_physical_space',
  'is_supervisor',
  'is_verified',
  'is_premium',
  'is_basic_subscribed',
  'is_queer_affirmative',
]);

const STRING_FIELDS = new Set([
  'name',
  'email',
  'headline',
  'title',
  'pronouns',
  'highest_qualification',
  'qualification_title',
  'university',
  'year_completed',
  'license_details',
  'professional_role',
  'complexity_comfort',
  'independence_level',
  'scope_of_practice',
  'not_treated',
  'exclusions',
  'primary_orientation',
  'primary_lens',
  'currency',
  'cancellation_policy',
  'locations',
  'physical_space_location',
  'physical_space_notes',
  'bio',
  'welcome_note',
  'internal_risk_level',
  'best_fit_notes',
  'linkedin_url',
  'resume_file',
  'highest_qualification_proof',
  'profile_status',
  'supervision_bio',
  'supervision_status',
  'hourly_rate',
  'profile_image',
  'profile_image_url',
]);

function formatTherapistRow(row) {
  if (!row) return null;
  const formatted = { ...row };
  // Frontend aliases
  formatted.experience_years = row.years_experience;
  formatted.qualification_highest = row.highest_qualification;
  return formatted;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const therapistId = searchParams.get('id') || searchParams.get('therapistId');
    const email = searchParams.get('email');

    if (!therapistId && !email) {
      return NextResponse.json({ error: 'therapistId or email is required' }, { status: 400 });
    }

    const client = await getPool().connect();
    try {
      let query;
      let params;
      if (therapistId) {
        query = 'SELECT * FROM therapy_therapistprofile WHERE id = $1';
        params = [therapistId];
      } else {
        query = 'SELECT * FROM therapy_therapistprofile WHERE email ILIKE $1 ORDER BY id DESC LIMIT 1';
        params = [email.trim()];
      }

      const res = await client.query(query, params);
      if (res.rows.length === 0) {
        return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
      }

      return NextResponse.json(formatTherapistRow(res.rows[0]));
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('GET /api/profile/therapist error:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const therapistId = body.id || body.therapistId;
    const email = body.email;

    if (!therapistId && !email) {
      return NextResponse.json({ error: 'therapist id or email required' }, { status: 400 });
    }

    // Map aliases
    const data = { ...body };
    if ('experience_years' in data && !('years_experience' in data)) {
      data.years_experience = data.experience_years;
    }
    if ('qualification_highest' in data && !('highest_qualification' in data)) {
      data.highest_qualification = data.qualification_highest;
    }

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    // Process all candidate fields
    const allAllowedFields = new Set([
      ...JSON_FIELDS,
      ...INTEGER_FIELDS,
      ...BOOLEAN_FIELDS,
      ...STRING_FIELDS,
    ]);

    for (const field of allAllowedFields) {
      if (field in data) {
        const val = data[field];
        setClauses.push(`"${field}" = $${paramIndex}`);

        if (JSON_FIELDS.has(field)) {
          if (val === null || val === undefined) {
            values.push(null);
          } else if (typeof val === 'object') {
            values.push(JSON.stringify(val));
          } else {
            values.push(val);
          }
        } else if (INTEGER_FIELDS.has(field)) {
          if (val === null || val === undefined || String(val).trim() === '') {
            values.push(null);
          } else {
            const num = parseInt(val, 10);
            values.push(isNaN(num) ? 0 : num);
          }
        } else if (BOOLEAN_FIELDS.has(field)) {
          values.push(Boolean(val));
        } else {
          // String/Text field
          values.push(val === undefined ? null : val);
        }

        paramIndex++;
      }
    }

    // Safety check for DB constraint "supervision_advanced_requires_profile_approved":
    // If profile_status is changing away from 'approved', supervision_status cannot be 'approved' or 'awaiting_contract'.
    if ('profile_status' in data && data.profile_status !== 'approved' && !('supervision_status' in data)) {
      setClauses.push(`"supervision_status" = CASE WHEN "supervision_status" IN ('approved', 'awaiting_contract') THEN 'pending' ELSE "supervision_status" END`);
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 });
    }

    let whereClause;
    if (therapistId) {
      whereClause = `WHERE id = $${paramIndex}`;
      values.push(therapistId);
    } else {
      whereClause = `WHERE email ILIKE $${paramIndex}`;
      values.push(email.trim());
    }

    const sql = `UPDATE therapy_therapistprofile SET ${setClauses.join(', ')} ${whereClause} RETURNING *`;

    const client = await getPool().connect();
    try {
      const res = await client.query(sql, values);
      if (res.rows.length === 0) {
        return NextResponse.json({ error: 'Profile not found to update' }, { status: 404 });
      }

      return NextResponse.json(formatTherapistRow(res.rows[0]));
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('PUT /api/profile/therapist error:', error);
    return NextResponse.json({ error: error.message || 'Database error during update' }, { status: 500 });
  }
}
