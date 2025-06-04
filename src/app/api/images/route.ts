// src/app/api/images/route.ts - Working file upload implementation
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    console.log("📸 Image upload API called");
    
    const formData = await req.formData();
    const image = formData.get("image") as File | null;

    if (!image || image.size === 0) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    console.log("📁 File received:", image.name, "Size:", image.size);

    // Validate file type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public/uploads");
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      console.log("📂 Upload directory ensured:", uploadDir);
    } catch (error) {
      console.log("📂 Upload directory already exists");
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(image.name);
    const newFileName = `${timestamp}-${randomString}${fileExtension}`;
    const newPath = path.join(uploadDir, newFileName);

    console.log("💾 Saving to:", newPath);

    // Convert file to buffer and save
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(newPath, buffer);

    // Return the public URL
    const imageUrl = `/uploads/${newFileName}`;
    console.log("✅ Image saved successfully:", imageUrl);

    return NextResponse.json({ imageUrl }, { status: 201 });

  } catch (error: any) {
    console.error("❌ Error in image upload:", error);
    return NextResponse.json({ 
      error: "Failed to upload image", 
      details: error.message 
    }, { status: 500 });
  }
}