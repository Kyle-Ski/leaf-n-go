import anthropic from "@/lib/anthropicClient";
import { supabaseServer } from "@/lib/supabaseServer";
import { validateAccessToken } from "@/utils/auth/validateAccessToken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    console.log("GET /api/assistant", req)
    const { error: validateError, user } = await validateAccessToken(req, supabaseServer);

    if (validateError) {
        return NextResponse.json({ validateError }, { status: 401 });
    }

    if (!user) {
        return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
    }
    
    const defaultmessage = await anthropic.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: "Hello, Claude" }],
    });
    console.log(defaultmessage);
    return NextResponse.json({ message: defaultmessage })
}

