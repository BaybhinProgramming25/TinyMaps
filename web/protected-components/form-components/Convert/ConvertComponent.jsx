import { useState } from 'react';
import axios from 'axios'

import './ConvertComponent.css'

const ConvertForm = () => {
  
  const [zoom, setZoom] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const handleSubmit = async (e) => {
    
    e.preventDefault();

    const data = {
      zoom: parseInt(zoom),
      lat: parseFloat(latitude),
      long: parseFloat(longitude)
    };

    try {

      const response = await axios.post('http://localhost:8000/api/convert', data);

      if (!response.status) {
        throw new error;
      }
      
      const result = { x_tile: response.data.x_tile, y_tile: response.data.y_tile }
      console.log(result);
    } catch (error) {
      console.error('Problem with fetch', error);
    }
  };


  return (
    <div className='convert-container'>
      <form id="convert" className='convert-form' onSubmit={handleSubmit}>
        <input
          className='convert-input'
          type="number"
          name="Zoom"
          value={zoom}
          onChange={(e) => setZoom(e.target.value)}
          placeholder="Zoom"
        />
        <input
          className='convert-input'
          type="number"
          step="any"
          name="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          placeholder="Latitude"
        />
        <input
          className='convert-input'
          type="number"
          step="any"
          name="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          placeholder="Longitude"
        />
        <button className='convert-button' type="submit">Convert</button>
      </form>
    </div>
  );
}

export default ConvertForm;