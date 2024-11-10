"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-xl text-gray-700 mb-6">Oops! The page you're looking for doesn't exist.</p>
      
      {/* Links to navigate back */}
      <div className="space-x-4">
        <Link href="/dashboard">
          <Button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Go to Dashboard
          </Button>
        </Link>
      </div>
      
      <p className="mt-8 text-sm text-gray-500">
        If you believe this is an error, please contact support.
      </p>
    </div>
  );
}
