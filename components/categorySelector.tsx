"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tag } from "./tag"
import { useAppContext } from "@/lib/appContext"

interface CategorySelectorProps {
    handleAddCategory: (string: string) => void;
    customCategory: string;
    setCustomCategory: (string: string) => void;
    handleAddCustomCategory: () => void;
    categories: string[];
    handleRemoveCategory: (string: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ handleAddCategory, customCategory, setCustomCategory, handleAddCustomCategory, categories, handleRemoveCategory }) => {
    const { state } = useAppContext();
  
    return (
        <div className="space-y-4">
            <div className="flex space-x-2">
                <Select onValueChange={handleAddCategory}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {state.item_categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex-1 flex space-x-2">
                    <Input
                        type="text"
                        placeholder="Add custom category"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                handleAddCustomCategory()
                            }
                        }}
                    />
                    <Button onClick={handleAddCustomCategory}>Add</Button>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                    <Tag
                        key={category}
                        label={category}
                        onRemove={() => handleRemoveCategory(category)}
                    />
                ))}
            </div>
        </div>
    )
}

export default CategorySelector