function ensureKeys<T extends object>(obj: T, defaultKeys: Partial<T>): T {
    for (const [key, value] of Object.entries(defaultKeys)) {
        if (!(key in obj)) {
            obj[key as keyof T] = value as T[keyof T]; // Assign default value if key doesn't exist
        }
    }
    return obj;
}

export default ensureKeys