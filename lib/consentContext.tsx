// contexts/ConsentContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ConsentCategories = {
    cookies: {
        essential: boolean;
        functional: boolean;
        analytics: boolean;
    };
    localStorage: boolean;
    aiDataUsage: boolean;
};

type ConsentContextType = {
    consent: ConsentCategories;
    updateConsent: (newConsent: ConsentCategories) => void;
    hasConsent: (key: keyof ConsentCategories | keyof ConsentCategories['cookies']) => boolean;
};

const defaultConsent: ConsentCategories = {
    cookies: {
        essential: true,
        functional: false,
        analytics: false,
    },
    localStorage: false,
    aiDataUsage: false,
};

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export const ConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [consent, setConsent] = useState<ConsentCategories>(defaultConsent);
    const [isInitialized, setIsInitialized] = useState(false); // To prevent flicker

    useEffect(() => {
        // Only run on client
        const storedConsent = localStorage.getItem('userConsent');
        if (storedConsent) {
            setConsent(JSON.parse(storedConsent));
        }
        setIsInitialized(true);
    }, []);

    const updateConsent = (newConsent: ConsentCategories) => {
        setConsent(newConsent);
        localStorage.setItem('userConsent', JSON.stringify(newConsent));
        // Optionally, send consent to your backend here
    };

    const isCookieKey = (key: string): key is keyof ConsentCategories['cookies'] => {
        return ['essential', 'functional', 'analytics'].includes(key);
    };

    const hasConsent = (key: keyof ConsentCategories | keyof ConsentCategories['cookies']): boolean => {
        if (isCookieKey(key)) {
            return !!consent.cookies[key];
        }
        return !!consent[key as keyof ConsentCategories];
    };

    // Ensure essential cookies are always enabled
    useEffect(() => {
        if (!consent.cookies.essential) {
            setConsent((prev) => ({
                ...prev,
                cookies: { ...prev.cookies, essential: true },
            }));
        }
    }, [consent]);

    return (
        <ConsentContext.Provider value={{ consent, updateConsent, hasConsent }}>
            {isInitialized ? children : null} {/* Prevent rendering until initialized */}
        </ConsentContext.Provider>
    );
};

export const useConsent = (): ConsentContextType => {
    const context = useContext(ConsentContext);
    if (!context) {
        throw new Error("useConsent must be used within a ConsentProvider");
    }
    return context;
};
