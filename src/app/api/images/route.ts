import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Disable Next.js body parsing to handle multipart form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    console.log("POST request received at:", new Date().toISOString());
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));

    const formData = await req.formData();
    console.log("FormData entries:", Array.from(formData.entries()));

    const image = formData.get("image") as File | null;

    if (!image || image.size === 0) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public/uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const newFileName = `${Date.now()}-${image.name}`;
    const newPath = path.join(uploadDir, newFileName);

    const arrayBuffer = await image.arrayBuffer();
    await fs.writeFile(newPath, Buffer.from(arrayBuffer));

    const filePath = `/uploads/${newFileName}`;
    console.log("Image saved to:", filePath);

    return NextResponse.json({ imageUrl: filePath }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST handler:", error.message, error.stack);
    return NextResponse.json({ error: "Failed to upload image", details: error.message }, { status: 500 });
  }
}