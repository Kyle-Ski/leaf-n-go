import { NextRequest, NextResponse } from 'next/server';
import anthropic from '@/lib/anthropicClient';
import { trackAiUsage } from '@/utils/trackAiUsage';
import { validateAccessTokenDI } from '@/utils/auth/validateAccessToken';
import serviceContainer from '@/di/containers/serviceContainer';
import { DatabaseService } from '@/di/services/databaseService';

const databaseService = serviceContainer.resolve<DatabaseService>('supabaseService');

export async function POST(req: NextRequest) {
    console.log("API /assistant/trip-recommendations");
    try {
        // Parse request body
        const body = await req.json();
        const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

        if (validateError) {
            return NextResponse.json({ validateError }, { status: 401 });
        }

        if (!user) {
            return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
        }

        const userId = user.id;
        const { location, startDate, endDate, existingItems, tripId, tripType, categories } = body;

        // Validate user input
        if (!location || !startDate || !endDate || !userId || !tripId) {
            return NextResponse.json({ error: "Missing required fields: location, startDate, endDate, userId, or tripId" }, { status: 400 });
        }

        // Track AI usage
        trackAiUsage(userId);

        // Format existing items as a comma-separated string for inclusion in the prompt
        const existingItemsList = existingItems?.map((item: { id: string, name: string }) => item.name).join(", ") || "None";

        // Define categories or use default
        const defaultCategories = [
            "Shelter & Sleep System",
            "Clothing & Layers",
            "Food & Cooking Gear",
            "Navigation & Safety",
            "Health & Hygiene",
            "Backpack & Carrying System",
            "Lighting & Power",
            "Entertainment & Personal Items",
            "Fix-it Kit",
            "Water Management",
            "Pro Tips",
            "Weather Forecast Insights",
            "Specific Location Considerations",
            "Additional Recommendations"
        ];

        const selectedCategories: string[] = categories && categories.length > 0 ? categories : defaultCategories;

        // Generate dynamic system prompt based on selected categories
        const systemPrompt = `You are an expert in traveling, taking flights, road tripping, hiking, backpacking, climbing, trail running, and trip planning. 
            Your role is to help users pack and prepare for their adventures. Provide thoughtful, practical suggestions 
            and share best practices tailored to each trip's unique details. Offer guidance in a friendly, supportive tone 
            without being overly prescriptive or pushy.
            If you have any special notes or anything else you want the user to see, like special note or anything else, add them into the "Additional Recommendations" category.
            ${tripType ? `The user is taking a ${tripType} type of trip.` : ""}
            It is vitally important that you structure your recommendations in JSON format using the following categories exactly or else the user will not see what you have to say:
            {
                "recommendations": {
                    ${selectedCategories.map(category => `"${category}": []`).join(",\n    ")}
                }
            }
            Populate each category with relevant items. Do not include items the user already has unless absolutely necessary.
            Here is a list of their items they are already bringing: ${existingItemsList}. 
        `;
        // Create the message with Claude
        const msg = await anthropic.messages.create({
            model: "claude-3-5-haiku-20241022",
            max_tokens: 1000,
            temperature: 0,
            stream: true,
            system: systemPrompt,
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
                },
                // Add other tools here if integrated
            ],
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `I'm going to ${location} from ${startDate} to ${endDate} and I need help packing and preparing for the trip.
                            `
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
                                            "Nice clothes to wear out on the town",
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

        // Handle streaming response
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
