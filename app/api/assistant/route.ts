import anthropic from "@/lib/anthropicClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    console.log("GET /api/assistant", req)

    const defaultmessage = await anthropic.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: "Hello, Claude" }],
    });
    console.log(defaultmessage);
    return NextResponse.json({ message: defaultmessage })
}

