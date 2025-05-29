import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import type { User } from '@/generated/prisma';
import { createClerkClient } from '@clerk/backend';
import { NextResponse } from 'next/server';

// Initialize Clerk client
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Debug function to check if clerk client is initialized properly
async function testClerkConnection() {
  try {
    // Try to list users as a connection test
    const users = await clerk.users.getUserList({ limit: 1 });
    console.log("✅ Clerk connection successful:", users.totalCount, "users found");
    return true;
  } catch (error) {
    console.error("❌ Clerk connection failed:", error);
    return false;
  }
}

// Function to directly update Clerk metadata
async function updateClerkUserRole(userId: string, role: string) {
  console.log(`Attempting to update Clerk user ${userId} with role ${role}`);
  
  try {
    // First verify the user exists
    const user = await clerk.users.getUser(userId);
    console.log(`Found Clerk user: ${user.id}`);
    
    // Then update the metadata
    await clerk.users.updateUserMetadata(userId, {
      privateMetadata: {
        role: role || "USER",
      },
    });
    
    console.log(`✅ Successfully updated Clerk privateMetadata for user ${userId}: role=${role}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to update Clerk privateMetadata for user ${userId}:`, error);
    return false;
  }
}

// Enhanced Prisma Middleware with more debugging
db.$use(async (params, next) => {
  // Log ALL User operations to see what's happening
  if (params.model === 'User') {
    console.log(`[PRISMA MIDDLEWARE] ${params.action} operation on User model`, {
      action: params.action,
      args: params.args
    });
    
    // For update operations, check what fields are being modified
    if (params.action === 'update' && params.args.data) {
      console.log('Update data:', params.args.data);
      
      // Check if 'role' is being explicitly updated
      if ('role' in params.args.data) {
        console.log(`[ROLE UPDATE DETECTED] Changing role to: ${params.args.data.role}`);
      }
    }
    
    try {
      // Proceed with the database operation
      const result = await next(params);
      
      // For operations that modify data and might affect role
      if (['update', 'upsert', 'create'].includes(params.action)) {
        let userId = null;
        let updatedRole = null;
        
        // Get the ID and role based on the operation type
        if (params.action === 'create') {
          userId = result.id;
          updatedRole = result.role;
        } else {
          // For updates and upserts, find the user record
          const user = await db.user.findUnique({
            where: params.args.where
          });
          
          if (user) {
            userId = user.id;
            updatedRole = user.role;
          }
        }
        
        // If we have the necessary info, update Clerk
        if (userId && updatedRole) {
          console.log(`[SYNC TO CLERK] Updating user ${userId} with role ${updatedRole}`);
          
          // Use the dedicated function to update Clerk
          const updateSuccess = await updateClerkUserRole(userId, updatedRole);
          
          if (!updateSuccess) {
            console.error(`[SYNC FAILED] Could not update Clerk for user ${userId}`);
          }
        } else {
          console.log(`[SYNC SKIPPED] Missing userId or role`, { userId, updatedRole });
        }
      }
      
      return result;
    } catch (error) {
      console.error(`[PRISMA MIDDLEWARE ERROR] ${params.action} operation failed:`, error);
      throw error; // Re-throw to maintain normal error flow
    }
  }
  
  return next(params);
});

// Test the Clerk connection when the module is loaded
testClerkConnection().then(isConnected => {
  if (isConnected) {
    console.log("Clerk client is properly configured and connected");
  } else {
    console.error("WARNING: Clerk client is not properly connected. Check your CLERK_SECRET_KEY.");
  }
});

// Main Webhook Handler
export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
  }

  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("Please add CLERK_SECRET_KEY from Clerk Dashboard to .env or .env.local");
  }

  // Process webhook as before...
  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing Svix headers:", { svix_id, svix_timestamp, svix_signature });
    return Promise.resolve(new Response("Error occurred -- no svix headers", { status: 400 }));
  }

  return req.json().then(async (payload) => {
    const body = JSON.stringify(payload);

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;

      console.log("Webhook event received:", { type: evt.type });
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occurred", { status: 400 });
    }

    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const data = evt.data;

      if (!data.id || !data.email_addresses || data.email_addresses.length === 0) {
        console.error("Missing required user data:", data);
        return new Response("Missing required user data", { status: 400 });
      }

      const firstName = data.first_name || '';
      const lastName = data.last_name || '';
      const email = data.email_addresses[0].email_address;
      const imageUrl = data.image_url || '';

      const user: Pick<User, 'id' | 'name' | 'email' | 'picture'> = {
        id: data.id,
        name: `${firstName} ${lastName}`.trim(),
        email: email,
        picture: imageUrl,
      };

      console.log("User data extracted:", user);

      if (!user.email) {
        console.error("No email found for user:", user);
        return new Response("No email found", { status: 400 });
      }

      const dbUser = await db.user.upsert({
        where: { email: user.email },
        update: {
          id: user.id,
          name: user.name,
          picture: user.picture,
        },
        create: {
          id: user.id,
          name: user.name,
          email: user.email,
          picture: user.picture,
          role: 'USER',
        },
      });

      return new Response("Webhook processed successfully", { status: 200 });
    } else {
      console.log(`Ignoring event type: ${evt.type}`);
      return new Response("Webhook event ignored", { status: 200 });
    }
  }).catch((err) => {
    console.error("Failed to parse JSON:", err);
    return new Response("Invalid JSON", { status: 400 });
  });
}

// Add a manual sync endpoint to force sync between Prisma and Clerk
export async function GET(req: Request) {
  try {
    // Get the user ID from query params
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }
    
    // Get the user from the database
    const user = await db.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Force update Clerk with the user's role
    const success = await updateClerkUserRole(userId, user.role || 'USER');
    
    if (success) {
      return NextResponse.json({ 
        message: "Successfully synced user role to Clerk", 
        user: { id: user.id, role: user.role } 
      });
    } else {
      return NextResponse.json({ 
        error: "Failed to sync role with Clerk", 
        user: { id: user.id, role: user.role } 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Error in manual sync endpoint:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}