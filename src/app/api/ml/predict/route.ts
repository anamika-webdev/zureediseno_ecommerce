// ============================================
// FILE 1: src/app/api/ml/predict/route.ts
// Next.js API Route to call your ML model
// ============================================
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('📸 ML Prediction API called');

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('📤 Sending image to ML model:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Create FormData for ML API
    const mlFormData = new FormData();
    mlFormData.append('file', file);

    // Call your ML model
    const mlResponse = await fetch('http://164.52.214.147:7000/predict', {
      method: 'POST',
      body: mlFormData,
    });

    console.log('ML API Response Status:', mlResponse.status);

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      console.error('ML API Error:', errorText);
      throw new Error(`ML API returned ${mlResponse.status}: ${errorText}`);
    }

    const result = await mlResponse.json();
    console.log('✅ ML Prediction Result:', result);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ ML Prediction Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get measurements'
      },
      { status: 500 }
    );
  }
}
