export interface VersionInfo {
  version: string;
  buildDate: string;
}

export const getVersionInfo = async (): Promise<VersionInfo> => {
  try {
    const response = await fetch('/version.json');
    if (!response.ok) {
      throw new Error('Failed to fetch version info');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching version info:', error);
    // Fallback version info
    return {
      version: '1.0.0',
      buildDate: new Date().toISOString()
    };
  }
};

export const formatBuildDate = (buildDate: string): string => {
  try {
    const date = new Date(buildDate);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  } catch (error) {
    return buildDate;
  }
};
