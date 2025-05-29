// Create a new file: /components/test-api.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TestApi() {
  const [message, setMessage] = useState("");

  const testApi = async () => {
    try {
      const formData = new FormData();
      formData.append("name", "Test Category");
      formData.append("url", "test-category");
      formData.append("featured", "false");

      const response = await fetch("/api/categories", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      setMessage("Success: " + JSON.stringify(data));
    } catch (error: any) {
      setMessage("Error: " + error.message);
    }
  };

  return (
    <div>
      <Button onClick={testApi}>Test API</Button>
      <p>{message}</p>
    </div>
  );
}