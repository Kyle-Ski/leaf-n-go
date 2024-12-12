import anthropic from "@/lib/anthropicClient";
import { NextRequest, NextResponse } from "next/server";

type ContentBlock = { type: 'text'; text: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToolUseBlock = { type: 'tool_use'; name: string; input: any };

type MessageContent = ContentBlock | ToolUseBlock;

export async function POST(req: NextRequest) {
    console.log("API /assistant/recommendations")
    try {
        // Parse request body
        const body = await req.json();
        const { location, startDate, endDate, existingItems } = body;

        // Validate user input
        if (!location || !startDate || !endDate) {
            return NextResponse.json({ error: "Missing required fields: location, startDate, or endDate" }, { status: 400 });
        }

        // Format existing items as a comma-separated string for inclusion in the prompt
        const existingItemsList = existingItems?.map((item: {id: string, name: string}) => item.name).join(", ") || "None";

        // Generate the message
        const msg = await anthropic.messages.create({
            model: "claude-3-5-haiku-20241022",
            max_tokens: 1000,
            temperature: 0.4,
            system: `You are an expert in hiking, backpacking, climbing, and trail running. 
        Your role is to help users pack and prepare for outdoor adventures. Provide thoughtful, practical suggestions 
        and share best practices tailored to each trip's unique details. Offer guidance in a friendly, supportive tone 
        without being overly prescriptive or pushy.

        Please structure your packing recommendations using the following categories:
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
        Include a "Pro Tips" section and, if applicable, a "Specific Location Considerations" section.
        Format your output clearly and concisely, matching the categories listed above.
        Important Note: The user already has the following items: ${existingItemsList}. Please avoid recommending these items again unless absolutely necessary.
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
        console.log("---->", msg.content)
        const responseContent = msg.content.find((item: MessageContent) => item.type === "text")?.text;

        if (!responseContent) {
            console.error("Error generating message");
            return NextResponse.json({ error: "An error occurred while processing your request." }, { status: 500 });
        }

        // Parse the text for structured data and detect anomalies
        const isWeatherMismatch = responseContent.includes("unusual") || responseContent.includes("might be a system error");

        // Extract specific sections using refined patterns for all categories
        const categories = {
            "Shelter & Sleep System": responseContent.match(/Shelter & Sleep System:\s*(.*?)(\n\n|$)/s)?.[1]?.trim(),
            "Clothing & Layers": responseContent.match(/Clothing & Layers.*?:\s*(.*?)(\n\n|$)/s)?.[1]?.trim(),
            "Food & Cooking Gear": responseContent.match(/Food & Cooking Gear:\s*(.*?)(\n\n|$)/s)?.[1]?.trim(),
            "Navigation & Safety": responseContent.match(/Navigation & Safety:\s*(.*?)(\n\n|$)/s)?.[1]?.trim(),
            "Health & Hygiene": responseContent.match(/Health & Hygiene:\s*(.*?)(\n\n|$)/s)?.[1]?.trim(),
            "Backpack & Carrying System": responseContent.match(/Backpack & Carrying System:\s*(.*?)(\n\n|$)/s)?.[1]?.trim(),
            "Lighting & Power": responseContent.match(/Lighting & Power:\s*(.*?)(\n\n|$)/s)?.[1]?.trim(),
            "Entertainment & Personal Items": responseContent.match(/Entertainment & Personal Items:\s*(.*?)(\n\n|$)/s)?.[1]?.trim(),
            "Fix-it Kit": responseContent.match(/Fix-it Kit:\s*(.*?)(\n\n|$)/s)?.[1]?.trim(),
            "Water Management": responseContent.match(/Water Management:\s*(.*?)(\n\n|$)/s)?.[1]?.trim(),
            "Pro Tips": responseContent.match(/Pro Tips:\s*(.*?)(\n\n|$)/s)?.[1]?.trim(),
            "Specific Location Considerations": responseContent.match(/Specific Location Considerations:\s*(.*?)(\n\n|$)/s)?.[1]?.trim(),
        };
        
        // Fallback for unmatched sections
        const fallbackRecommendations = responseContent.split("\n\n").reduce((acc, section) => {
            const [header, ...content] = section.split("\n");
            const normalizedHeader = header?.toLowerCase();
        
            if (normalizedHeader.includes("shelter")) acc["Shelter & Sleep System"] = content.join("\n").trim();
            else if (normalizedHeader.includes("clothing")) acc["Clothing & Layers"] = content.join("\n").trim();
            else if (normalizedHeader.includes("food") || normalizedHeader.includes("cooking")) acc["Food & Cooking Gear"] = content.join("\n").trim();
            else if (normalizedHeader.includes("navigation") || normalizedHeader.includes("safety")) acc["Navigation & Safety"] = content.join("\n").trim();
            else if (normalizedHeader.includes("health") || normalizedHeader.includes("hygiene")) acc["Health & Hygiene"] = content.join("\n").trim();
            else if (normalizedHeader.includes("backpack") || normalizedHeader.includes("carrying")) acc["Backpack & Carrying System"] = content.join("\n").trim();
            else if (normalizedHeader.includes("lighting") || normalizedHeader.includes("power")) acc["Lighting & Power"] = content.join("\n").trim();
            else if (normalizedHeader.includes("entertainment") || normalizedHeader.includes("personal items")) acc["Entertainment & Personal Items"] = content.join("\n").trim();
            else if (normalizedHeader.includes("fix-it")) acc["Fix-it Kit"] = content.join("\n").trim();
            else if (normalizedHeader.includes("water")) acc["Water Management"] = content.join("\n").trim();
            else if (normalizedHeader.includes("tips")) acc["Pro Tips"] = content.join("\n").trim();
            else if (normalizedHeader.includes("considerations")) acc["Specific Location Considerations"] = content.join("\n").trim();
        
            return acc;
        }, { ...categories });
        
        // Final formatted response
        const formattedRecommendations = Object.entries(fallbackRecommendations).reduce((acc, [key, value]) => {
            acc[key] = value ? value.trim() : "No specific recommendations for this category.";
            return acc;
        }, {} as Record<string, string>);
        
        return NextResponse.json({
            message: {
                location,
                startDate,
                endDate,
                isWeatherMismatch,
                recommendations: formattedRecommendations,
            },
        });
        
    } catch (error) {
        console.error("Error generating message:", error);
        return NextResponse.json({ error: "An error occurred while processing your request." }, { status: 500 });
    }
}
