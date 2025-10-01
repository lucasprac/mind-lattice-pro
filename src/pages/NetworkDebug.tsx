import React from 'react';
import { NetworkDiagnostic } from '@/components/NetworkDiagnostic';

const NetworkDebug: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <NetworkDiagnostic />
    </div>
  );
};

export default NetworkDebug;