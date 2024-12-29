// Define the password requirements
export interface PasswordRequirement {
    id: string;
    label: string;
    test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
    {
        id: "length",
        label: "At least 8 characters",
        test: (password: string) => password.length >= 8,
    },
    {
        id: "uppercase",
        label: "Includes uppercase letter",
        test: (password: string) => /[A-Z]/.test(password),
    },
    {
        id: "lowercase",
        label: "Includes lowercase letter",
        test: (password: string) => /[a-z]/.test(password),
    },
    {
        id: "number",
        label: "Includes a number",
        test: (password: string) => /\d/.test(password),
    },
    {
        id: "symbol",
        label: "Includes a symbol",
        test: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
];

export default passwordRequirements