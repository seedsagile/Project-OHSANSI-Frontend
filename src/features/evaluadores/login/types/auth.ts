export interface User {
    id: string;
    email: string;
    name: string;
    role: 'evaluator' | 'admin' | 'responsible';
    area?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthContextType {
    user: User | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    loading: boolean;
    isAuthenticated: boolean;
}