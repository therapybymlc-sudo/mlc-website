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

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = (formData.get('userId') || '').trim();
    const therapistId = (formData.get('therapistId') || '').trim();
    const email = (formData.get('email') || '').trim();
    let imageUrl = (formData.get('imageUrl') || '').trim() || null;

    if (!file && !imageUrl) {
      return NextResponse.json({ error: 'No image file or URL provided' }, { status: 400 });
    }

    // 1. If a file is uploaded, push it to Clerk CDN via Backend API for persistent cloud hosting
    const secret = process.env.CLERK_SECRET_KEY;
    if (file && secret && userId) {
      try {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
        const fileName = file.name || 'avatar.jpg';
        const fileType = file.type || 'image/jpeg';

        let header = `--${boundary}\r\n`;
        header += `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`;
        header += `Content-Type: ${fileType}\r\n\r\n`;
        const footer = `\r\n--${boundary}--\r\n`;

        const payload = Buffer.concat([
          Buffer.from(header, 'utf-8'),
          fileBuffer,
          Buffer.from(footer, 'utf-8'),
        ]);

        const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}/profile_image`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${secret}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
          },
          body: payload,
        });

        if (clerkRes.ok) {
          const clerkData = await clerkRes.json();
          imageUrl = clerkData.profile_image_url || clerkData.image_url || imageUrl;
        } else {
          console.warn('Clerk backend avatar upload status:', clerkRes.status, await clerkRes.text());
        }
      } catch (clerkErr) {
        console.warn('Clerk backend avatar upload error:', clerkErr);
      }
    }

    // 2. Fallback: Base64 data URL if Clerk upload did not return a public URL
    if (file && !imageUrl) {
      try {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileType = file.type || 'image/jpeg';
        imageUrl = `data:${fileType};base64,${fileBuffer.toString('base64')}`;
      } catch (b64Err) {
        console.warn('Base64 encoding fallback error:', b64Err);
      }
    }

    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to process and store profile photo.' }, { status: 500 });
    }

    // 3. Immediately persist directly to PostgreSQL database so photo is never lost on refresh
    try {
      const client = await getPool().connect();
      try {
        if (therapistId) {
          await client.query(
            `UPDATE therapy_therapistprofile SET profile_image = $1, profile_image_url = $1 WHERE id = $2`,
            [imageUrl, therapistId]
          );
        }
        if (email) {
          await client.query(
            `UPDATE therapy_therapistprofile SET profile_image = $1, profile_image_url = $1 WHERE email ILIKE $2`,
            [imageUrl, email]
          );
        }
      } finally {
        client.release();
      }
    } catch (dbErr) {
      console.error('Direct PostgreSQL avatar update error:', dbErr);
    }

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error('Upload profile photo route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while uploading photo.' },
      { status: 500 }
    );
  }
}
