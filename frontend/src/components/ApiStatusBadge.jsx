import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { checkHealth } from '@/utils/apiClient';

const HEALTH_CHECK_INTERVAL = 300000; // 5 minutes

const ApiStatusBadge = () => {
    const [status, setStatus] = useState('Pending');

    useEffect(() => {
        const performHealthCheck = async () => {
            setStatus('Pending');
            const isHealthy = await checkHealth();
            setStatus(isHealthy ? 'Online' : 'Offline');
        };

        performHealthCheck();
        const interval = setInterval(performHealthCheck, HEALTH_CHECK_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    const getBadgeStyle = () => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Online':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Offline':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border ${getBadgeStyle()}`}>
            {status === 'Pending' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            {status}
        </span>
    );
};

export default ApiStatusBadge;
