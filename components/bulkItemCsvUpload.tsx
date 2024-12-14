import React, { useState } from "react";
import { toast } from "react-toastify";
import { kgToLbs } from "@/utils/convertWeight";
import { useAppContext } from "@/lib/appContext";
import { ItemDetails } from "@/types/projectTypes";

interface SanitizedRow {
    name: string;
    quantity: number;
    weight: number;
    notes: string | null;
    category_id: string | null;
}

const BulkItemCsvUpload = () => {
    const { state, dispatch } = useAppContext();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false); // New loading state

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== "text/csv") {
                toast.error("Please upload a valid CSV file.");
                return;
            }
            setFile(selectedFile);
        }
    };

    const parseCsv = (csvText: string): string[][] => {
        const rows = csvText.split("\n").map((row) => row.trim());
        return rows.map((row) => row.split(",").map((cell) => cell.trim()));
    };

    const sanitizeData = (data: string[][]): SanitizedRow[] => {
        const [headers, ...rows] = data;
        const incomingHeaders = JSON.stringify(headers);
        const expectedHeaders = ["Name", "Quantity", "Weight", "Notes", "#REF!", "name", "Item Categories", "Weight Units", "lbs"];
        if (incomingHeaders !== JSON.stringify(expectedHeaders)) {
            throw new Error("Invalid CSV structure. Please use the provided template.");
        }

        return rows
            .filter((row) => row[0]?.trim() !== "") // Ensure name is not empty
            .map((row) => {
                const name = row[0].trim();
                const quantity = parseInt(row[1], 10) || 1;
                const rawWeight = parseFloat(row[2]) || 0;
                const weightUnit = row[7]?.trim()?.toLowerCase(); // Weight Units column
                const weight = weightUnit === "kg" ? kgToLbs(rawWeight) ?? 0 : rawWeight;
                const notes = row[3]?.trim() || null;
                const categoryName = row[6]?.trim();
                const category = state.item_categories.find((cat) => cat.name === categoryName) ?? null;

                return {
                    name,
                    quantity,
                    weight,
                    notes,
                    category_id: category ? category.id : null,
                };
            });
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file to upload.");
            return;
        }

        setIsUploading(true); // Start loading state

        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                const csvData = parseCsv(text);
                const sanitizedRows = sanitizeData(csvData);

                const response = await fetch("/api/items/bulk", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(sanitizedRows),
                });

                if (response.ok) {
                    const data: { insertedItems: ItemDetails[] } = await response.json();
                    dispatch({ type: "ADD_BULK_ITEMS", payload: data.insertedItems });
                    toast.success("Items uploaded successfully!");
                } else {
                    toast.error("Failed to upload items.");
                }
            } catch (error) {
                console.error("Error processing file:", error);
                toast.error("An error occurred while processing the file.");
            } finally {
                setIsUploading(false); // End loading state
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className="p-4 max-w-xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">Upload Items via CSV</h2>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="csv-upload">
                Upload your .csv file of items here:
            </label>
            <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isUploading} // Disable input while uploading
                className="mb-4 border rounded p-2 w-full disabled:opacity-50"
            />
            <a
                href="https://docs.google.com/spreadsheets/d/1Ysknmn8vi2wlN4woF__QFiYgDMwkPh8i/copy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline mb-4 inline-block"
            >
                Click here to copy the CSV template
            </a>
            <button
                onClick={handleUpload}
                disabled={isUploading} // Disable button while uploading
                className={`px-4 py-2 rounded w-full ${isUploading ? "bg-gray-500" : "bg-blue-500 text-white"}`}
            >
                {isUploading ? "Uploading..." : "Upload File"}
            </button>
        </div>
    );
};

export default BulkItemCsvUpload;
