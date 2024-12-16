/**
 * The parseRecommendations function extracts categorized recommendation data from a 
 * streamed text input. It uses regular expressions to identify and match specific 
 * sections within the text, such as "Shelter & Sleep System," "Clothing & Layers," 
 * or "Weather Forecast Insights." Each section's content is trimmed and assigned to 
 * its corresponding category in a Record<string, string> object. If a section is missing 
 * or unmatched, its value defaults to an empty string.

 * This function is designed to structure unformatted, streamed textual data into a consistent, 
 * category-based format for easy consumption by other parts of the application.
 * @param streamedText 
 * @returns Record<string, string>
 */
const parseRecommendations = (streamedText: string): Record<string, string> => ({
    "Shelter & Sleep System": streamedText.match(/Shelter & Sleep System:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
    "Clothing & Layers": streamedText.match(/Clothing & Layers:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
    "Food & Cooking Gear": streamedText.match(/Food & Cooking Gear:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
    "Navigation & Safety": streamedText.match(/Navigation & Safety:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
    "Health & Hygiene": streamedText.match(/Health & Hygiene:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
    "Backpack & Carrying System": streamedText.match(/Backpack & Carrying System:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
    "Lighting & Power": streamedText.match(/Lighting & Power:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
    "Entertainment & Personal Items": streamedText.match(/Entertainment & Personal Items:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
    "Fix-it Kit": streamedText.match(/Fix-it Kit:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
    "Water Management": streamedText.match(/Water Management:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
    "Pro Tips": streamedText.match(/Pro Tips:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
    "Specific Location Considerations": streamedText.match(/Specific Location Considerations.*?:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
    "Weather Forecast Insights": streamedText.match(/Weather Forecast Insights:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
    "Additional Recommendations": streamedText.match(/Additional Recommendations:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
});

/**
 * Parses the streamed text to extract recommendations based on provided categories.
 *
 * @param streamedText - The accumulated streamed text from the API response.
 * @param categories - An array of category names to extract recommendations for.
 * @returns A record mapping each category to an array of recommended items.
 */
export const parseRecommendations2 = (
    streamedText: string,
    categories: string[]
): Record<string, string[]> => {
    const recommendations: Record<string, string[]> = {};

    categories.forEach((category) => {
        // Escape special regex characters in category names
        const escapedCategory = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Regex to match the category and capture the array items
        const regex = new RegExp(`"${escapedCategory}":\\s*\\[(.*?)\\]`, 's');

        const match = streamedText.match(regex);

        if (match && match[1]) {
            const itemsText = match[1];

            // Match all string items within the array
            const itemMatches = itemsText.match(/"([^"]+)"/g);

            const items = itemMatches
                ? itemMatches.map((item) => item.replace(/"/g, ''))
                : [];

            recommendations[category] = items;
        } else {
            // If the category is not found, assign an empty array
            recommendations[category] = [];
        }
    });

    return recommendations;
};


export default parseRecommendations