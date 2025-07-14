// src/app/api/images/route.ts - VERIFIED AND ENHANCED VERSION
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

    console.log("📁 File received:", image.name, "Size:", image.size, "Type:", image.type);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (image.size > maxSize) {
      return NextResponse.json({ 
        error: "File size too large. Maximum 5MB allowed." 
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public/uploads");
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      console.log("📂 Upload directory ensured:", uploadDir);
    } catch (error) {
      console.log("📂 Upload directory already exists or created");
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(image.name);
    const newFileName = `category-${timestamp}-${randomString}${fileExtension}`;
    const newPath = path.join(uploadDir, newFileName);

    console.log("💾 Saving to:", newPath);

    try {
      // Convert file to buffer and save
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(newPath, buffer);

      // Return the public URL
      const imageUrl = `/uploads/${newFileName}`;
      console.log("✅ Image saved successfully:", imageUrl);

      return NextResponse.json({ 
        success: true,
        imageUrl,
        filename: newFileName,
        originalName: image.name,
        size: image.size,
        type: image.type
      }, { status: 201 });

    } catch (writeError) {
      console.error("❌ Error writing file:", writeError);
      return NextResponse.json({ 
        error: "Failed to save image file" 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("❌ Error in image upload:", error);
    return NextResponse.json({ 
      error: "Failed to upload image", 
      details: error.message 
    }, { status: 500 });
  }
}

// Optional: Add DELETE endpoint to remove images
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: "No filename provided" }, { status: 400 });
    }

    // Security check: ensure filename doesn't contain path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public/uploads", filename);
    
    try {
      await fs.unlink(filePath);
      console.log("🗑️ Image deleted:", filename);
      return NextResponse.json({ success: true, message: "Image deleted successfully" });
    } catch (deleteError) {
      // File might not exist, which is fine
      console.log("🤷 File not found or already deleted:", filename);
      return NextResponse.json({ success: true, message: "Image not found or already deleted" });
    }

  } catch (error: any) {
    console.error("❌ Error deleting image:", error);
    return NextResponse.json({ 
      error: "Failed to delete image", 
      details: error.message 
    }, { status: 500 });
  }
}