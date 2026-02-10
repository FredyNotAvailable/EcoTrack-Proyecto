declare namespace Express {
    interface Request {
        user?: {
            id: string;
            email?: string;
            role?: string;
            status?: string;
            isAdmin?: boolean;
            profile?: any; // Optional profile data
        };
    }
}
