"use client"

import React from 'react';
import { Progress } from '@/components/ui/progress';
import {
    Calendar,
    AlertTriangle,
    ArrowUpRight
} from 'lucide-react';
import { useAiUsage } from '@/hooks/aiUsageHook';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function AiUsagePage() {
    const { usage, isLoading, error } = useAiUsage();

    // Loading State
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                    <div className="h-[400px] bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load AI usage data. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    const {
        tokens_used = 0,
        monthly_token_limit = 1000000,
        usage_count = 0,
        last_used = null,
        reset_date = null,
        plan_type = "free"
    } = usage || {};

    const usagePercentage = (tokens_used / monthly_token_limit) * 100;
    const daysUntilReset = reset_date ?
        Math.ceil((new Date(reset_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;

    // Format Dates
    const formattedLastUsed = last_used ? new Date(last_used).toLocaleString() : "N/A";
    const formattedResetDate = reset_date ? new Date(reset_date).toLocaleDateString() : "N/A";

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">AI Usage Dashboard</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Resets in {daysUntilReset} days</span>
                </div>
            </div>

            {/* Usage Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Current Period Usage */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Current Period Usage
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="text-2xl font-bold">
                                {Math.round(usagePercentage)}%
                            </div>
                            <Progress value={usagePercentage} className="h-2" />
                            <div className="text-sm text-gray-600">
                                {Math.floor(tokens_used).toLocaleString()} / {monthly_token_limit.toLocaleString()} tokens
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Requests */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="text-2xl font-bold">
                                {usage_count.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                                <ArrowUpRight className="w-4 h-4 text-green-500" />
                                <span>Since last reset</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Average Tokens per Request */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Average Tokens per Request
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="text-2xl font-bold">
                                {usage_count ? Math.round(tokens_used / usage_count).toLocaleString() : 0}
                            </div>
                            <div className="text-sm text-gray-600">
                                tokens per request
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Last Used */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Last Used
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">
                            {formattedLastUsed}
                        </div>
                    </CardContent>
                </Card>

                {/* Plan Type */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Plan Type
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold capitalize">
                            {plan_type}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Warning Alert if Approaching Limit */}
            {usagePercentage > 80 && (
                <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                        You've used {Math.round(usagePercentage)}% of your monthly token limit.
                        Consider upgrading your plan or managing usage to avoid hitting the limit.
                    </AlertDescription>
                </Alert>
            )}

            {/* Reset Information */}
            <div className="mt-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Reset Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">
                            {formattedResetDate}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
