"use client";

import React, { useState } from "react";
import { useAppContext } from "@/lib/appContext";
import { withAuth } from "@/lib/withAuth";
import { ItemCategory, AppState } from "@/types/projectTypes";
import { kgToLbs } from "@/utils/convertWeight";

interface BulkUploadRow {
  name: string;
  quantity: number;
  weight: number;
  notes: string;
  category_id: string; // Using the category ID instead of the name for backend compatibility
}

const BulkUpload = () => {
  const { state } = useAppContext();
  const [rows, setRows] = useState<BulkUploadRow[]>([
    { name: "", quantity: 1, weight: 0, notes: "", category_id: "" },
  ]);
  const [weightUnit, setWeightUnit] = useState<AppState["user_settings"]["weight_unit"]>("kg");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const addRow = () => {
    setRows([
      ...rows,
      { name: "", quantity: 1, weight: 0, notes: "", category_id: "" },
    ]);
  };

  const handleInputChange = <T extends keyof BulkUploadRow>(
    index: number,
    field: T,
    value: BulkUploadRow[T]
  ) => {
    setRows((prevRows) => {
      const newRows = [...prevRows];
      newRows[index][field] = value;
      return newRows;
    });
  };

  const handleWeightUnitToggle = (unit: AppState["user_settings"]["weight_unit"]) => {
    setWeightUnit(unit);
  };

  const handleSelectRow = (index: number) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(index)
        ? prevSelected.filter((i) => i !== index)
        : [...prevSelected, index]
    );
  };

  const handleSelectAll = () => {
    setSelectAll((prev) => !prev);
    setSelectedRows((prev) => (selectAll ? [] : rows.map((_, index) => index)));
  };

  const handleRemoveSelectedRows = () => {
    setRows((prevRows) => prevRows.filter((_, index) => !selectedRows.includes(index)));
    setSelectedRows([]);
    setSelectAll(false);
  };

  const handleSubmit = async () => {
    try {
      // Convert weights to lbs before submitting
      const sanitizedRows = rows.map((row) => {
        const weightInLbs =
          weightUnit === "kg" ? kgToLbs(row.weight) ?? 0 : row.weight;
        return {
          ...row,
          category_id: row.category_id && row.category_id !== "" ? row.category_id : null,
          weight: weightInLbs,
        };
      });

      const response = await fetch("/api/items/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": "12345" }, // Replace with actual user ID
        body: JSON.stringify(sanitizedRows),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("bulk data:", data);
        alert("Items uploaded successfully!");
      } else {
        alert("Failed to upload items.");
      }
    } catch (error) {
      console.error("Error uploading items:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Bulk Upload Items</h2>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded ${weightUnit === "kg" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            onClick={() => handleWeightUnitToggle("kg")}
          >
            kg
          </button>
          <button
            className={`px-3 py-1 rounded ${weightUnit === "lbs" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            onClick={() => handleWeightUnitToggle("lbs")}
          >
            lbs
          </button>
        </div>
      </div>
      <table className="table-auto w-full border-collapse border border-gray-400">
        <thead>
          <tr>
            <th className="border border-gray-300 px-2 py-2 bg-gray-100">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="appearance-none h-5 w-5 border border-gray-300 rounded bg-white checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              />
            </th>
            <th className="border border-gray-300 px-2 py-2 bg-gray-100">Item Name</th>
            <th className="border border-gray-300 px-2 py-2 bg-gray-100">Quantity</th>
            <th className="border border-gray-300 px-2 py-2 bg-gray-100">Weight ({weightUnit})</th>
            <th className="border border-gray-300 px-2 py-2 bg-gray-100">Notes</th>
            <th className="border border-gray-300 px-2 py-2 bg-gray-100">Item Categories</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-2 py-1 text-center">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(index)}
                  onChange={() => handleSelectRow(index)}
                  className="appearance-none h-5 w-5 border border-gray-300 rounded bg-white checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  />
              </td>
              <td className="border border-gray-300 px-2 py-1">
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) =>
                    handleInputChange(index, "name", e.target.value)
                  }
                  className="w-full px-2 py-1 border rounded bg-white text-black"
                />
              </td>
              <td className="border border-gray-300 px-2 py-1">
                <input
                  type="number"
                  value={row.quantity}
                  onChange={(e) =>
                    handleInputChange(index, "quantity", Number(e.target.value))
                  }
                  className="w-full px-2 py-1 border rounded bg-white text-black"
                />
              </td>
              <td className="border border-gray-300 px-2 py-1">
                <input
                  type="number"
                  value={row.weight}
                  onChange={(e) =>
                    handleInputChange(index, "weight", Number(e.target.value))
                  }
                  className="w-full px-2 py-1 border rounded bg-white text-black"
                />
              </td>
              <td className="border border-gray-300 px-2 py-1">
                <input
                  type="text"
                  value={row.notes}
                  onChange={(e) =>
                    handleInputChange(index, "notes", e.target.value)
                  }
                  className="w-full px-2 py-1 border rounded bg-white text-black"
                />
              </td>
              <td className="border border-gray-300 px-2 py-1">
                <select
                  value={row.category_id}
                  onChange={(e) =>
                    handleInputChange(index, "category_id", e.target.value)
                  }
                  className="w-full px-2 py-1 border rounded bg-white text-black"
                >
                  <option value="">Select Category</option>
                  {state.item_categories.map((cat: ItemCategory) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between mt-4">
        <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={addRow}>
          + Add Row
        </button>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded"
          onClick={handleRemoveSelectedRows}
        >
          Remove Item(s)
        </button>
        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default withAuth(BulkUpload);
