import React, { useState, useEffect } from 'react';
import { getVersionInfo, formatBuildDate, VersionInfo } from '../services/versionService';

interface VersionDisplayProps {
  show: boolean;
}

export const VersionDisplay: React.FC<VersionDisplayProps> = ({ show }) => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (show) {
      const loadVersionInfo = async () => {
        setIsLoading(true);
        try {
          const info = await getVersionInfo();
          setVersionInfo(info);
        } catch (error) {
          console.error('Failed to load version info:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadVersionInfo();
    }
  }, [show]);

  if (!show || !versionInfo) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40 bg-gray-900 bg-opacity-90 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-mono">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        <div>
          <div className="font-semibold">v{versionInfo.version}</div>
          <div className="text-gray-300 opacity-75">
            {formatBuildDate(versionInfo.buildDate)}
          </div>
        </div>
      </div>
    </div>
  );
};
