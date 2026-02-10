declare namespace Express {
    interface Request {
        user?: {
            id: string;
            email?: string;
            role?: string;
            isAdmin?: boolean;
            profile?: any; // Optional profile data
        };
    }
}
