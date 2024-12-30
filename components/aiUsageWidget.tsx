import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock, Zap } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface AiUsageWidgetProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    usage: any | null;
    isLoading: boolean
}
const AiUsageWidget = ({ usage, isLoading = false }: AiUsageWidgetProps) => {
  const {
    tokens_used = 0,
    monthly_token_limit = 1000000,
    usage_count = 0,
    last_used = null,
    reset_date = null
  } = usage || {};
  console.log("Last used:", last_used)
  const usagePercentage = (tokens_used / monthly_token_limit) * 100;
  const daysUntilReset = reset_date ? 
    Math.ceil((new Date(reset_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;

  return (
    <Link href="/ai-usage" className="block">
      <Card className="hover:bg-gray-50 transition-colors duration-200 p-4 bg-white shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between ">
            AI Usage
            <Zap className="w-4 h-4" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{Math.round(usagePercentage)}% Used</span>
                  <span>{Math.floor(tokens_used).toLocaleString()} / {(monthly_token_limit).toLocaleString()}</span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Resets in {daysUntilReset} days</span>
                </div>
                <div className="text-right">
                  {usage_count} requests made
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default AiUsageWidget;