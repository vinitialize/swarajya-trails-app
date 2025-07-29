import React, { useState } from 'react';
import { MiniMap } from './MiniMap';

const popularForts = [
  { name: 'Rajgad', coordinates: { lat: 18.2998, lng: 73.7644 } },
  { name: 'Lohagad', coordinates: { lat: 18.6970, lng: 73.4153 } },
  { name: 'Sinhagad', coordinates: { lat: 18.3664, lng: 73.7553 } },
  { name: 'Torna', coordinates: { lat: 18.1690, lng: 73.7101 } }
];

export const SmartItinerary: React.FC = () => {
  const [selectedFort, setSelectedFort] = useState(popularForts[0]);
  const [isMapVisible, setIsMapVisible] = useState(false);

  const openMapForFort = (fort: { name: string; coordinates: { lat: number; lng: number } }) => {
    setSelectedFort(fort);
    setIsMapVisible(true);
  };

  return (
    <div>
      <h2>Popular Forts</h2>
      <ul>
        {popularForts.map((fort) => (
          <li key={fort.name}>
            <button onClick={() => openMapForFort(fort)}>
              {fort.name}
            </button>
          </li>
        ))}
      </ul>

      {isMapVisible && (
        <MiniMap
          coordinates={selectedFort.coordinates}
          fortName={selectedFort.name}
          onClose={() => setIsMapVisible(false)}
          isVisible={isMapVisible}
          onDestinationChange={(_newCoords, newName) => {
            // handle destination update if needed
          }}
        />
      )}
    </div>
  );
};

export default SmartItinerary;
