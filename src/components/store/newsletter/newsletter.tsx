"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function NewsletterProductcard() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Here you would typically send this to your backend
    toast.success("Thank you for subscribing!");
    setEmail("");
  };

  return (
    <section className="py-16 bg-zuree-beige">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <h2 className="heading-md mb-4">Subscribe to our newsletter</h2>
        <p className="text-gray-600 mb-8">
          Get the latest trends, style tips, and exclusive offers straight to your inbox
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-grow py-3 px-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-zuree-red"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="btn-primary py-3 px-6 whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}