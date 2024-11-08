// app/dashboard/page.tsx
"use client";

// import Navbar from "@/components/Navbar";
import {Card, CardDescription} from "@/components/ui/Card";
import {Button} from "@/components/ui/button";

const Dashboard = () => (
  <div>
    {/* <Navbar /> */}
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <Card title="Recent Trip" >
        <CardDescription>
            Get ready for your next trip!
        </CardDescription>
        <Button variant={"default"}>View Details</Button>
      </Card>
    </div>
  </div>
);

export default Dashboard;
