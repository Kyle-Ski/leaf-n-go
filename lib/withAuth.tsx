'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-Context';
import { Loader } from '@/components/ui/loader';
import React from 'react';

export function withAuth<T extends object>(
    Component: React.ComponentType<T>
): React.ComponentType<T> {
    const ProtectedComponent: React.FC<T> = (props) => {
        const { user } = useAuth();
        const router = useRouter();
        const [isLoading, setIsLoading] = useState(true);

        useEffect(() => {
            if (user === null) {
                router.replace('/auth');
            } else {
                setIsLoading(false);
            }
        }, [user, router]);

        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <Loader className="h-12 w-12 mb-4 text-blue-500" />
                    <p className="text-gray-600 text-lg">Loading...</p>
                </div>
            );
        }

        return <Component {...props} />;
    };

    return ProtectedComponent;
}
