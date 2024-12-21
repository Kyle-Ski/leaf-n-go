import serviceContainer from "@/di/containers/serviceContainer";
import { DatabaseService } from "@/di/services/databaseService";
import { NextRequest, NextResponse } from "next/server";


const databaseService = serviceContainer.resolve<DatabaseService>('supabaseService');

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const tripId = await params.id;


    const { weatherData } = await req.json();

    if (!weatherData) {
        return NextResponse.json({ error: "Weather data is required." }, { status: 400 });
    }

    try {
        const { error } = await databaseService.postWeatherInfo(weatherData, tripId)

        if (error) {
            throw error;
        }

        return NextResponse.json({ message: "Weather data updated successfully." }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to update weather data." }, { status: 500 });
    }

}
