import anthropic from "@/lib/anthropicClient";
import { supabaseServer } from "@/lib/supabaseServer";
import { validateAccessToken } from "@/utils/auth/validateAccessToken";
import { trackAiUsage } from "@/utils/trackAiUsage";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    console.log("API /assistant/recommendations")
    try {
        // Parse request body
        const body = await req.json();
        const { error: validateError, user } = await validateAccessToken(req, supabaseServer);

        if (validateError) {
            return NextResponse.json({ validateError }, { status: 401 });
        }

        if (!user) {
            return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
        }

        const userId = user.id
        const { location, startDate, endDate, existingItems, tripId } = body;

        // Validate user input
        if (!location || !startDate || !endDate || !userId || !tripId) {
            return NextResponse.json({ error: "Missing required fields: location, startDate, or endDate" }, { status: 400 });
        }

        // Track AI usage
        trackAiUsage(userId)

        // Format existing items as a comma-separated string for inclusion in the prompt
        const existingItemsList = existingItems?.map((item: { id: string, name: string }) => item.name).join(", ") || "None";

        // Generate the message
        const msg = await anthropic.messages.create({
            model: "claude-3-5-haiku-20241022",
            max_tokens: 1000,
            temperature: 0,
            stream: true,
            system: `You are an expert in hiking, backpacking, climbing, and trail running. 
        Your role is to help users pack and prepare for outdoor adventures. Provide thoughtful, practical suggestions 
        and share best practices tailored to each trip's unique details. Offer guidance in a friendly, supportive tone 
        without being overly prescriptive or pushy.

        Please structure your packing recommendations using the following categories exactly (Example: "Pro Tips:"):
        - Shelter & Sleep System
        - Clothing & Layers
        - Food & Cooking Gear
        - Navigation & Safety
        - Health & Hygiene
        - Backpack & Carrying System
        - Lighting & Power
        - Entertainment & Personal Items
        - Fix-it Kit
        - Water Management
        - Pro Tips
        - Weather Forecast Insights
        - (if applicable) Specific Location Considerations
        - (if applicable) Additional Recommendations
        Format your output clearly and concisely, matching the categories listed above.
        If you have anything other headings to add, or other insights, do not make another heading. Instead please add them to "Additional Recommendations"
        Important Note: The user already has the following items: ${existingItemsList}. Please do not include these items in your response unless absolutely necessary.
`,
            tools: [
                {
                    name: "get_weather",
                    description: "Retrieves the current weather for a specified location.",
                    input_schema: {
                        type: "object",
                        properties: {
                            location: {
                                type: "string",
                                description: "The name of the city or region to get the weather for."
                            }
                        },
                        required: ["location"]
                    }
                }
            ],
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `I'm going to ${location} from ${startDate} to ${endDate} and I need help packing.`
                        }
                    ]
                },
                {
                    role: "assistant",
                    content: [
                        {
                            type: "text",
                            text: `I'll help you pack for your trip to ${location}! Let me first check the current weather conditions there to give you a baseline idea of the climate.`
                        },
                        {
                            type: "tool_use",
                            name: "get_weather",
                            id: "toolu_016LQP3Gt9et16mhZRAfMLk9",
                            input: {
                                location: location
                            }
                        }
                    ]
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "tool_result",
                            tool_use_id: "toolu_016LQP3Gt9et16mhZRAfMLk9",
                            content: JSON.stringify({
                                output: {
                                    location: location,
                                    forecast: [
                                        {
                                            date: "2024-12-22",
                                            conditions: "Partly cloudy",
                                            high_temp: "30°F",
                                            low_temp: "12°F",
                                            precipitation_chance: "10%"
                                        },
                                        {
                                            date: "2024-12-23",
                                            conditions: "Sunny",
                                            high_temp: "20°F",
                                            low_temp: "10°F",
                                            precipitation_chance: "0%"
                                        },
                                        {
                                            date: "2024-12-24",
                                            conditions: "Light snow",
                                            high_temp: "30°F",
                                            low_temp: "10°F",
                                            precipitation_chance: "70%"
                                        }
                                    ],
                                    recommendations: {
                                        clothing: [
                                            "Layered clothing for temperature changes",
                                            "Waterproof jacket for snow on December 15"
                                        ],
                                        gear: [
                                            "Waterproof and insulated hiking boots",
                                            "Gloves of varying insulation for activity",
                                            "Hand and feet warmers"
                                        ]
                                    }
                                }
                            })
                        }
                    ]
                }
            ]
        });

        const encoder = new TextEncoder();
        const readableStream = new ReadableStream({
            async start(controller) {
                for await (const event of msg) {
                    if (event.type === 'content_block_delta') {
                        const { delta } = event;
                        if ('text' in delta) {
                            const text = delta.text;
                            controller.enqueue(encoder.encode(text));
                        }
                    }
                }
                controller.close();
            },
        });

        return new Response(readableStream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
    } catch (error) {
        console.error("Error generating message:", error);
        return NextResponse.json({ error: "An error occurred while processing your request." }, { status: 500 });
    }
}
