"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-Context';

export type ConsentCategories = {
    cookies: {
        essential: boolean;
        functional: boolean;
        analytics: boolean;
    };
    localStorage: boolean;
    aiDataUsage: boolean;
    firstSignIn: boolean;
};

type ConsentKeys = keyof ConsentCategories['cookies'] | keyof Omit<ConsentCategories, 'cookies'>;

type ConsentContextType = {
    consent: ConsentCategories;
    updateConsent: (newConsent: ConsentCategories, saveToDB?: boolean, userId?: string) => void;
    hasConsent: (key: ConsentKeys) => boolean;
};

// Export defaultConsent for reuse
export const defaultConsent: ConsentCategories = {
    cookies: {
        essential: true,
        functional: false,
        analytics: false,
    },
    localStorage: true, // Enforce localStorage usage
    aiDataUsage: false,
    firstSignIn: true,
};

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export const ConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [consent, setConsent] = useState<ConsentCategories>(defaultConsent);
    const [isInitialized, setIsInitialized] = useState(false); // To prevent flicker

    useEffect(() => {
        if (!hasConsent('localStorage')) {
            alert("Local Storage is required for this app to function correctly. Please enable it in your browser settings.");
            return;
        }

        const storedConsent = localStorage.getItem('userConsent');
        if (storedConsent) {
            try {
                const parsedConsent: ConsentCategories = JSON.parse(storedConsent);
                setConsent(parsedConsent);
            } catch (error) {
                console.error("Failed to parse consent from localStorage:", error);
                setConsent(defaultConsent);
            }
        } else {
            // If no consent is stored, initialize with defaultConsent
            setConsent(defaultConsent);
            localStorage.setItem('userConsent', JSON.stringify(defaultConsent));
        }
        setIsInitialized(true);
    }, []);

    // Function to transfer consent from localStorage to backend upon sign-in
    useEffect(() => {
        const transferConsentToBackend = async () => {
            const storedConsent = localStorage.getItem('userConsent');
            if (!storedConsent) return
            const parsedConsent: ConsentCategories = JSON.parse(storedConsent);
            if (user?.id && parsedConsent.firstSignIn) {
                try {
                    const parsedConsent: ConsentCategories = JSON.parse(storedConsent);
                    parsedConsent.firstSignIn = false
                    // Post to backend
                    const response = await fetch('/api/consent', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            consent: parsedConsent,
                            privacyPolicyVersion: 'v1.0', // Update as needed
                        }),
                    });

                    if (response.ok) {
                        const consentObj = await response.json()
                        updateConsent(consentObj.consent)
                        if (!hasConsent("localStorage")) {
                            localStorage.removeItem('userConsent'); // Clear localStorage after successful transfer
                            // localStorage.removeItem('appState')
                        }
                    } else {
                        console.error("Failed to transfer consent preferences to backend.");
                    }
                } catch (error) {
                    console.error("Error transferring consent to backend:", error);
                }

            }
        };

        transferConsentToBackend();
    }, [user]);

    const updateConsent = async (newConsent: ConsentCategories, saveToDB?: boolean, userId?: string) => {
        setConsent(newConsent);
        localStorage.setItem('userConsent', JSON.stringify(newConsent));
        if (saveToDB && userId) {
            try {

                // Post to backend
                const response = await fetch('/api/consent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        consent: newConsent,
                        privacyPolicyVersion: 'v1.0', // Update as needed
                    }),
                });

                if (response.ok) {
                    if (!hasConsent("localStorage")) {
                        localStorage.removeItem('userConsent'); // Clear localStorage after successful transfer
                        // localStorage.removeItem('appState')
                    }
                } else {
                    console.error("Failed to transfer consent preferences to backend.");
                }
            } catch (error) {
                console.error("Error transferring consent to backend:", error);
            }
        }
    };

    const hasConsent = (key: ConsentKeys): boolean => {
        if (key in consent.cookies) {
            return consent.cookies[key as keyof ConsentCategories['cookies']];
        }
        return consent[key as keyof Omit<ConsentCategories, 'cookies'>];
    };

    // Ensure essential cookies are always enabled
    useEffect(() => {
        if (!consent.cookies.essential) {
            setConsent((prev) => ({
                ...prev,
                cookies: { ...prev.cookies, essential: true, },
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
