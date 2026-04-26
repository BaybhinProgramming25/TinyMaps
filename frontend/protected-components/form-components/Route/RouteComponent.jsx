import { useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

import axios from 'axios'

import './RouteComponent.css'

const RouteForm = () => {

  const map = useMap();

  const [slat, setSlat] = useState('');
  const [slon, setSlon] = useState('');
  const [dlat, setDlat] = useState('');
  const [dlon, setDlon] = useState('');

  const [markers, setMarkers] = useState([]);
  const [mapLines, setMapLines] = useState([]);


  const handleSubmit = async (e) => {

    e.preventDefault();

    // Remove markers and polylines on each submit  
    markers.forEach(marker => {
      map.removeLayer(marker);
    })

    mapLines.forEach(mapLine => {
      map.removeLayer(mapLine);
    })


    const source = {
      lat: parseFloat(slat),
      lon: parseFloat(slon)
    };

    const destination = {
      lat: parseFloat(dlat),
      lon: parseFloat(dlon)
    };

    const data = { source, destination };

    try {
      
      const response = await axios.post('http://localhost:8000/api/route', data);

      if (!response.status) throw new Error('Network response was not ok');
      
      const results = response.data.formattedRoute;

      // Get descriptions and coordinates
      const descriptions = results.map(item => item.description);
      const coordinates = results.map(item => item.coordinates);

      // Get markers to display
      const markersOnly = [];
      const modDescriptions = [];

      markersOnly.push(coordinates[0]);
      setMarkers(markersOnly);
      modDescriptions.push(descriptions[0]);

      let currentDescription = descriptions[0];
      for (let i = 1; i < descriptions.length; i++) {
        if (currentDescription !== descriptions[i]) {
          markersOnly.push(coordinates[i]);
          modDescriptions.push(descriptions[i]);
          currentDescription = descriptions[i];
        }
      }

      const markers_storage = [];
      const lines_storage = [];
      let prev_coord_holder = null;

      markersOnly.forEach((coord, index) => {

        const isSource = index === 0;
        const isDestination = index === markersOnly.length - 1;

        const marker = L.circleMarker([coord.lat, coord.lon], {
            radius: 10,
            fillColor: isSource ? 'green' : isDestination ? 'red' : 'blue',
            color: 'white',
            weight: 2,
            fillOpacity: 0.9
        }).addTo(map);
        marker.bindPopup(modDescriptions[index]);

        if (prev_coord_holder) {
          var line = L.polyline([
            [prev_coord_holder.prev_lat, prev_coord_holder.prev_lon],
            [coord.lat, coord.lon]
          ], {
            color: 'blue',
            weight: 3,
            opacity: 0.7
          }).addTo(map);
          lines_storage.push(line);
        }
        prev_coord_holder = {
          prev_lat: coord.lat,
          prev_lon: coord.lon
        }
        markers_storage.push(marker);
      });

      setMarkers(markers_storage);
      setMapLines(lines_storage);

    } catch (error) {
      console.error('Problem with fetch', error);
    }
  };

  return (
    <div className='route-container'>
      <form id="route" className='route-form'onSubmit={handleSubmit}>
        <input
          className='route-input'
          type="number"
          step="any"
          name="slat"
          value={slat}
          onChange={(e) => setSlat(e.target.value)}
          placeholder="Start Latitude"
        />
        <input
          className='route-input'
          type="number"
          step="any"
          name="slon"
          value={slon}
          onChange={(e) => setSlon(e.target.value)}
          placeholder="Start Longitude"
        />
        <input
          className='route-input'
          type="number"
          step="any"
          name="dlat"
          value={dlat}
          onChange={(e) => setDlat(e.target.value)}
          placeholder="Destination Latitude"
        />
        <input
          className='route-input'
          type="number"
          step="any"
          name="dlon"
          value={dlon}
          onChange={(e) => setDlon(e.target.value)}
          placeholder="Destination Longitude"
        />
        <button className='route-button' type="submit">Route</button>
    </form>
    </div>
  );
}

export default RouteForm;