import { useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

import { useAuth } from '../../contexts/AuthContext.jsx';
import './Dashboard.css';

const RouteLayer = ({ route }) => {
  const map = useMap();

  if (!route || route.length === 0) return null;

  const coords = route.map(step => [step.coordinates.lat, step.coordinates.lon]);

  L.polyline(coords, { color: '#1d4ed8', weight: 4, opacity: 0.8 }).addTo(map);
  L.circleMarker(coords[0], { radius: 8, fillColor: '#22c55e', color: '#fff', weight: 2, fillOpacity: 1 }).addTo(map);
  L.circleMarker(coords[coords.length - 1], { radius: 8, fillColor: '#ef4444', color: '#fff', weight: 2, fillOpacity: 1 }).addTo(map);

  map.fitBounds(coords);

  return null;
};

const Dashboard = () => {
  const { user, accessToken, logout } = useAuth();

  const [mode, setMode] = useState('walk');
  const [slat, setSlat] = useState('');
  const [slon, setSlon] = useState('');
  const [dlat, setDlat] = useState('');
  const [dlon, setDlon] = useState('');
  const [route, setRoute] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRoute = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/route',
        {
          source: { lat: parseFloat(slat), lon: parseFloat(slon) },
          destination: { lat: parseFloat(dlat), lon: parseFloat(dlon) },
          mode,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setRoute(response.data.formattedRoute);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='dashboard'>

      <aside className='dashboard-sidebar'>
        <div className='dashboard-sidebar-top'>
          <div className='sidebar-logo'>
            <span className='sidebar-logo-icon'>TM</span>
            <span className='sidebar-logo-text'>Tiny Maps</span>
          </div>

          <div className='mode-toggle'>
            <button
              className={`mode-btn ${mode === 'walk' ? 'mode-btn--active' : ''}`}
              onClick={() => setMode('walk')}
            >
              🚶 Walk
            </button>
            <button
              className={`mode-btn ${mode === 'bike' ? 'mode-btn--active' : ''}`}
              onClick={() => setMode('bike')}
            >
              🚴 Bike
            </button>
          </div>

          <form className='route-form' onSubmit={handleRoute}>
            <p className='route-form-label'>Start</p>
            <input
              className='route-input'
              type='number'
              step='any'
              placeholder='Latitude'
              value={slat}
              onChange={(e) => setSlat(e.target.value)}
              required
            />
            <input
              className='route-input'
              type='number'
              step='any'
              placeholder='Longitude'
              value={slon}
              onChange={(e) => setSlon(e.target.value)}
              required
            />
            <p className='route-form-label'>Destination</p>
            <input
              className='route-input'
              type='number'
              step='any'
              placeholder='Latitude'
              value={dlat}
              onChange={(e) => setDlat(e.target.value)}
              required
            />
            <input
              className='route-input'
              type='number'
              step='any'
              placeholder='Longitude'
              value={dlon}
              onChange={(e) => setDlon(e.target.value)}
              required
            />
            {error && <p className='route-error'>{error}</p>}
            <button className='route-submit' type='submit' disabled={loading}>
              {loading ? 'Getting route...' : 'Get Route'}
            </button>
          </form>
        </div>

        <div className='dashboard-sidebar-bottom'>
          <div className='sidebar-user'>
            <div className='sidebar-avatar'>{user?.username?.[0].toUpperCase()}</div>
            <span className='sidebar-username'>{user?.username}</span>
          </div>
          <button className='sidebar-logout' onClick={logout}>Logout</button>
        </div>
      </aside>

      <div className='dashboard-map'>
        <MapContainer center={[40.7128, -74.0060]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url='http://localhost:8080/tile/{z}/{x}/{y}.png'
            attribution='&copy; OpenStreetMap contributors'
          />
          {route && <RouteLayer route={route} />}
        </MapContainer>
      </div>

    </div>
  );
};

export default Dashboard;
