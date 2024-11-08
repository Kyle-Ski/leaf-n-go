// app/settings/page.tsx
"use client";

// import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"

const Settings = () => {

  return (
    <div>
      {/* <Navbar /> */}
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open popover</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
            <p>Here you can adjust your preferences.</p>
            </PopoverContent>
          </Popover>
        
      </div>
    </div>
  );
};

export default Settings;
