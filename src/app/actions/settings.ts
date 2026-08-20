'use strict';
'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

export async function updateProfileSettingsAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized session.' };
  }

  const name = formData.get('name') as string;
  const companyName = formData.get('companyName') as string || null;

  if (!name) {
    return { error: 'Name is required.' };
  }

  try {
    const user = await db.user.update({
      where: { id: session.userId },
      data: {
        name,
        companyName,
      },
    });

    revalidatePath('/', 'layout');
    return { success: true, user };
  } catch (error) {
    console.error('Failed to update profile settings:', error);
    return { error: 'Failed to update profile settings.' };
  }
}

export async function uploadLogoAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized session.' };
  }

  const logoFile = formData.get('logo') as File | null;
  if (!logoFile || logoFile.size === 0) {
    return { error: 'No logo file provided.' };
  }

  // 1. Validate File Size (< 2 MB)
  if (logoFile.size > 2 * 1024 * 1024) {
    return { error: 'Logo must be smaller than 2 MB.' };
  }

  // 2. Validate Extension
  const extension = logoFile.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  if (!extension || !allowedExtensions.includes(extension)) {
    return { error: 'Invalid file format. Only JPG, JPEG, PNG, and WebP are allowed.' };
  }

  // 3. Validate MIME type
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimes.includes(logoFile.type)) {
    return { error: 'Invalid image type. Only JPG, JPEG, PNG, and WebP are allowed.' };
  }

  try {
    const buffer = Buffer.from(await logoFile.arrayBuffer());

    // 4. Validate magic bytes to verify file signature
    let isValidSignature = false;
    if (buffer.length >= 4) {
      const hex = buffer.toString('hex', 0, 4).toUpperCase();
      if (hex.startsWith('FFD8FF')) { // JPEG
        isValidSignature = true;
      } else if (hex === '89504E47') { // PNG
        isValidSignature = true;
      } else if (hex === '52494646' && buffer.length >= 12) { // RIFF (WebP)
        const webpType = buffer.toString('utf8', 8, 12);
        if (webpType === 'WEBP') {
          isValidSignature = true;
        }
      }
    }

    if (!isValidSignature) {
      return { error: 'Invalid file contents. The uploaded file is not a valid image.' };
    }

    // 5. Check Supabase Credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjzcjqmwmgaglgwdpbvi.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseServiceKey) {
      return { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured in .env file.' };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 6. Ensure user-logos bucket exists
    await supabase.storage.createBucket('user-logos', { public: true });

    // 7. Remove previous logo from storage if it exists to avoid leakage
    const currentUser = await db.user.findUnique({
      where: { id: session.userId },
      select: { logoUrl: true },
    });

    if (currentUser?.logoUrl) {
      const parts = currentUser.logoUrl.split('/public/user-logos/');
      if (parts.length === 2) {
        const oldPath = parts[1];
        await supabase.storage.from('user-logos').remove([oldPath]);
      }
    }

    // 8. Upload the logo
    const fileName = `logo-${Date.now()}.${extension}`;
    const filePath = `${session.userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('user-logos')
      .upload(filePath, buffer, {
        contentType: logoFile.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      return { error: 'Failed to upload logo to storage.' };
    }

    // 9. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-logos')
      .getPublicUrl(filePath);

    // 10. Save URL in the user record
    const user = await db.user.update({
      where: { id: session.userId },
      data: { logoUrl: publicUrl },
    });

    revalidatePath('/', 'layout');
    return { success: true, logoUrl: publicUrl, user };
  } catch (error) {
    console.error('Failed to upload logo:', error);
    return { error: 'Something went wrong while uploading the logo.' };
  }
}

export async function removeLogoAction() {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized session.' };
  }

  try {
    const currentUser = await db.user.findUnique({
      where: { id: session.userId },
      select: { logoUrl: true },
    });

    if (currentUser?.logoUrl) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjzcjqmwmgaglgwdpbvi.supabase.co';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const parts = currentUser.logoUrl.split('/public/user-logos/');
        if (parts.length === 2) {
          const oldPath = parts[1];
          await supabase.storage.from('user-logos').remove([oldPath]);
        }
      }
    }

    const user = await db.user.update({
      where: { id: session.userId },
      data: { logoUrl: null },
    });

    revalidatePath('/', 'layout');
    return { success: true, user };
  } catch (error) {
    console.error('Failed to remove logo:', error);
    return { error: 'Failed to remove logo.' };
  }
}

export async function updatePreferencesAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized session.' };
  }

  const currency = formData.get('currency') as string;
  const timeZone = formData.get('timeZone') as string;
  const dateFormat = formData.get('dateFormat') as string;

  if (!currency || !timeZone || !dateFormat) {
    return { error: 'All preferences fields are required.' };
  }

  try {
    const user = await db.user.update({
      where: { id: session.userId },
      data: {
        currency,
        timeZone,
        dateFormat,
      },
    });

    revalidatePath('/', 'layout');
    return { success: true, user };
  } catch (error) {
    console.error('Failed to update preferences:', error);
    return { error: 'Failed to update preferences.' };
  }
}
