import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

import { useAuth } from '../../contexts/AuthContext.jsx';
import './Dashboard.css';

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
};

const formatDistance = (meters) => {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
};

const geocode = async (query) => {
  const res = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: { q: query, format: 'json', limit: 1 },
    headers: { 'Accept-Language': 'en' },
  });
  if (!res.data.length) throw new Error(`Location not found: "${query}"`);
  return { lat: parseFloat(res.data[0].lat), lon: parseFloat(res.data[0].lon) };
};

const nearestStepIndex = (geometry, steps, userLat, userLon) => {
  let minDist = Infinity;
  let nearestGeomIdx = 0;
  geometry.forEach((p, i) => {
    const d = Math.hypot(p.lat - userLat, p.lon - userLon);
    if (d < minDist) { minDist = d; nearestGeomIdx = i; }
  });
  for (let i = steps.length - 1; i >= 0; i--) {
    if (nearestGeomIdx >= steps[i].wayPoints[0]) return i;
  }
  return 0;
};

const RouteLayer = ({ routeData, userPos }) => {
  const map = useMap();
  const userMarkerRef = useRef(null);

  useEffect(() => {
    if (!routeData?.geometry?.length) return;

    const coords = routeData.geometry.map(p => [p.lat, p.lon]);
    const polyline = L.polyline(coords, { color: '#1d4ed8', weight: 4, opacity: 0.8 }).addTo(map);
    const startMarker = L.circleMarker(coords[0], { radius: 8, fillColor: '#22c55e', color: '#fff', weight: 2, fillOpacity: 1 }).addTo(map);
    const endMarker = L.circleMarker(coords[coords.length - 1], { radius: 8, fillColor: '#ef4444', color: '#fff', weight: 2, fillOpacity: 1 }).addTo(map);

    map.fitBounds(coords);

    return () => {
      polyline.remove();
      startMarker.remove();
      endMarker.remove();
    };
  }, [routeData, map]);

  useEffect(() => {
    if (!userPos) {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      return;
    }
    if (!userMarkerRef.current) {
      userMarkerRef.current = L.circleMarker([userPos.lat, userPos.lon], {
        radius: 10, fillColor: '#f59e0b', color: '#fff', weight: 2, fillOpacity: 1,
      }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng([userPos.lat, userPos.lon]);
    }
    map.panTo([userPos.lat, userPos.lon]);
  }, [userPos, map]);

  return null;
};

const Dashboard = () => {
  const { user, accessToken, logout } = useAuth();

  const [mode, setMode] = useState('walk');
  const [start, setStart] = useState('');
  const [destination, setDestination] = useState('');
  const [routeData, setRouteData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [navigating, setNavigating] = useState(false);
  const [userPos, setUserPos] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const watchIdRef = useRef(null);

  const handleRoute = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    stopNavigation();

    try {
      const [source, dest] = await Promise.all([geocode(start), geocode(destination)]);
      const response = await axios.post(
        'http://localhost:8000/api/route',
        { source, destination: dest, mode },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setRouteData(response.data);
      setCurrentStep(0);
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Failed to get route');
    } finally {
      setLoading(false);
    }
  };

  const startNavigation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setNavigating(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setUserPos({ lat, lon });
        if (routeData?.steps) {
          const idx = nearestStepIndex(routeData.geometry, routeData.steps, lat, lon);
          setCurrentStep(idx);
        }
      },
      () => setError('Unable to get your location'),
      { enableHighAccuracy: true, maximumAge: 2000 }
    );
  };

  const stopNavigation = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setNavigating(false);
    setUserPos(null);
  };

  useEffect(() => () => stopNavigation(), []);

  const step = routeData?.steps?.[currentStep];
  const isLastStep = routeData && currentStep === routeData.steps.length - 1;

  return (
    <div className='dashboard'>
      <aside className='dashboard-sidebar'>
        <div className='dashboard-sidebar-top'>
          <div className='sidebar-logo'>
            <span className='sidebar-logo-icon'>TM</span>
            <span className='sidebar-logo-text'>Tiny Maps</span>
          </div>

          {navigating && step ? (
            <div className='nav-panel'>
              <p className='nav-step'>{step.instruction}</p>
              {!isLastStep && (
                <p className='nav-distance'>in {formatDistance(step.distance)}</p>
              )}
              <p className='nav-progress'>{currentStep + 1} / {routeData.steps.length}</p>
              <button className='nav-stop' onClick={stopNavigation}>Stop Navigation</button>
            </div>
          ) : (
            <>
              <div className='mode-toggle'>
                <button className={`mode-btn ${mode === 'walk' ? 'mode-btn--active' : ''}`} onClick={() => setMode('walk')}>Walk</button>
                <button className={`mode-btn ${mode === 'bike' ? 'mode-btn--active' : ''}`} onClick={() => setMode('bike')}>Bike</button>
              </div>

              <form className='route-form' onSubmit={handleRoute}>
                <p className='route-form-label'>Start</p>
                <input
                  className='route-input'
                  type='text'
                  placeholder='e.g. Central Park, NYC'
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  required
                />
                <p className='route-form-label'>Destination</p>
                <input
                  className='route-input'
                  type='text'
                  placeholder='e.g. Times Square, NYC'
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
                {error && <p className='route-error'>{error}</p>}
                <button className='route-submit' type='submit' disabled={loading}>
                  {loading ? 'Getting route...' : 'Get Route'}
                </button>
              </form>

              {routeData && (
                <>
                  <div className='route-summary'>
                    <div className='route-summary-item'>
                      <span className='route-summary-label'>Duration</span>
                      <span className='route-summary-value'>{formatDuration(routeData.totalDuration)}</span>
                    </div>
                    <div className='route-summary-item'>
                      <span className='route-summary-label'>Distance</span>
                      <span className='route-summary-value'>{formatDistance(routeData.totalDistance)}</span>
                    </div>
                  </div>
                  <button className='nav-start' onClick={startNavigation}>Start Navigation</button>
                </>
              )}
            </>
          )}
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
          {routeData && <RouteLayer routeData={routeData} userPos={userPos} />}
        </MapContainer>
      </div>
    </div>
  );
};

export default Dashboard;
