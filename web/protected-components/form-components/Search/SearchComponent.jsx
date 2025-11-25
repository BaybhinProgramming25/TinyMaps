import { useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios'

import './SearchComponent.css'

const SearchForm = () => {

  const map = useMap();

  const [searchTerm, setSearchTerm] = useState('');
  const [onlyInBox, setOnlyInBox] = useState(false);
  const [markers, setMarkers] = useState([]);

  const handleSubmit = async (e) => {

    e.preventDefault();

    // Remove markers beforehand 
    markers.forEach(marker => {
      map.removeLayer(marker)
    });

    const minLat = map.getBounds().getSouthWest().lat;
    const minLon = map.getBounds().getSouthWest().lng;
    const maxLat = map.getBounds().getNorthEast().lat;
    const maxLon = map.getBounds().getNorthEast().lng;

    const bbox = { minLat, minLon, maxLat, maxLon };
    const data = { bbox, onlyInBox, searchTerm };

    try {

      const response = await axios.post('http://localhost:8000/api/search', data);
      console.log(response);

      if (!response.status) {
        throw new Error('Network response was not ok');
      }
      
      const results = response.data.formattedResults;

      const markers_storage = []
      results.forEach(place => {
        const marker = L.marker([place.coordinates.lat, place.coordinates.lon]).addTo(map);
        marker.bindPopup(place.name);
        markers_storage.push(marker);
      });
      setMarkers(markers_storage);
    }
    catch (error) {
      console.error('Problem with fetch', error);
    }
  };

  return (
    <div className='search-container'>
      <form className='search-form' onSubmit={handleSubmit}>
        <input
          className='search-input'
          type="text"
          name="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
        />
        <label>
          <input
            type="checkbox"
            name="onlyInBox"
            checked={onlyInBox}
            onChange={(e) => setOnlyInBox(e.target.checked)}
          />
          Only in box
        </label>
        <button className='search-button' type="submit">Search</button>
      </form>
    </div>
  );
}

export default SearchForm;