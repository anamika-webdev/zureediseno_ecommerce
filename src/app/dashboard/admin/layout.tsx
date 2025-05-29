import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Header from "@/components/dashboard/header/header";


export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Block non admins from accessing the admin dashboard
  const user = await currentUser();
  if (!user || user.privateMetadata.role !== "ADMIN") redirect("/");
  
  return (
   
      <div className="ml-[20px]">
        <Header />
        <div className="w-full mt-[75px] p-4">{children}</div>
      </div>
    
  );
}