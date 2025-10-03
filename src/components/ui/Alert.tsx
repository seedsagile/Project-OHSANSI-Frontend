import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

type AlertType = 'error' | 'success' | 'warning' | 'info';

const alertConfig = {
    error: {
        icon: <XCircle className="h-5 w-5 text-acento-700" />,
        containerClasses: 'bg-acento-100 border-acento-200 text-acento-800',
    },
    success: {
        icon: <CheckCircle className="h-5 w-5 text-exito-700" />,
        containerClasses: 'bg-green-100 border-green-200 text-green-800',
    },
    warning: {
        icon: <AlertTriangle className="h-5 w-5 text-yellow-700" />,
        containerClasses: 'bg-yellow-100 border-yellow-200 text-yellow-800',
    },
    info: {
        icon: <Info className="h-5 w-5 text-principal-700" />,
        containerClasses: 'bg-principal-100 border-principal-200 text-principal-800',
    },
};

type AlertProps = {
    type: AlertType;
    message: ReactNode;
};

export function Alert({ type, message }: AlertProps) {
    const { icon, containerClasses } = alertConfig[type];

    return (
        <div className={`my-4 p-3 border rounded-lg flex items-start gap-3 ${containerClasses}`}>
            <div className="flex-shrink-0 mt-0.5">
                {icon}
            </div>
            <div className="text-sm">
                {typeof message === 'string' ? <p>{message}</p> : message}
            </div>
        </div>
    );
}