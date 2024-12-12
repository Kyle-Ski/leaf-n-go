import anthropic from "@/lib/anthropicClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

    const msg = await anthropic.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: "Hello, Claude" }],
      });
      console.log(msg);
      return NextResponse.json({ message: msg})
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { content } = body
    const msg = await anthropic.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content }],
      });
      console.log(msg);
      return NextResponse.json({ message: msg})
}