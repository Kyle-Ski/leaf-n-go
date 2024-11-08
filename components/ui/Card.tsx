// components/ui/Card.tsx
"use client";

import React from "react";

interface CardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, description, children }) => (
  <div className="border border-gray-300 rounded-lg p-4 shadow-md">
    <h2 className="text-xl font-semibold">{title}</h2>
    <p className="text-gray-600 mb-4">{description}</p>
    {children}
  </div>
);

export default Card;
