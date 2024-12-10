"use client";

import React from "react";
import { useParams } from "next/navigation";
import DetailedItemView from "@/components/itemDetails";
import { withAuth } from "@/lib/withAuth";

const ItemDetailsPage = () => {
    const params = useParams();
    let itemId = params?.id;
    if (itemId && Array.isArray(itemId)) {
        itemId = itemId[0]
    }

    if (!itemId) {
        return <p className="text-gray-600">No item ID provided.</p>;
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <DetailedItemView itemId={itemId} />
        </div>
    );
};

export default withAuth(ItemDetailsPage);
