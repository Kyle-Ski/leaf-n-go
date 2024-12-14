import serviceContainer from "@/di/containers/serviceContainer";
import { DatabaseService } from "@/di/services/databaseService";
import anthropic from "@/lib/anthropicClient";
import { validateAccessTokenDI } from "@/utils/auth/validateAccessToken";
import { NextRequest, NextResponse } from "next/server";

const databaseService = serviceContainer.resolve<DatabaseService>("supabaseService");

export async function GET(req: NextRequest) {
    console.log("GET /api/assistant", req)
    const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

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

