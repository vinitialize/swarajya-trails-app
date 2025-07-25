import React from 'react';
import { XIcon } from './icons';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  origin: string;
  destination: { lat: number; lng: number } | null;
}

export const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, origin, destination }) => {
  if (!isOpen || !destination) return null;

  const destinationQuery = `${destination.lat},${destination.lng}`;
  const originQuery = origin.trim() ? encodeURIComponent(origin.trim()) : '';

  const mapSrc = originQuery
    ? `https://www.google.com/maps/dir/?api=1&origin=${originQuery}&destination=${destinationQuery}&output=embed`
    : `https://www.google.com/maps/search/?api=1&query=${destinationQuery}&output=embed`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-modal-title"
    >
      <div
        className="relative w-full max-w-4xl h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-xl m-4 flex flex-col animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        style={{ animationDuration: '300ms' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <h2 id="map-modal-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">Route Map</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close map view">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4 flex-grow h-full">
            <iframe
                src={mapSrc}
                className="w-full h-full border-0 rounded-lg"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps Route"
            ></iframe>
        </div>
      </div>
    </div>
  );
};
