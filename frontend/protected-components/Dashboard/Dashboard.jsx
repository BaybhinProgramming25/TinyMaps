import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import ConvertForm from '../form-components/Convert/ConvertComponent'
import SearchForm from '../form-components/Search/SearchComponent';
import RouteForm from '../form-components/Route/RouteComponent';

import './Dashboard.css'


const Dashboard = () => {

    return (
      <div className='dashboard-grid'>
          <MapContainer 
          center={[51.505, -0.09]} 
          zoom={3} 
          style={{ height: '90vh', width: '100vw'}}>
          <TileLayer
            url="http://localhost:8000/tile/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <Marker position={[51.505, -0.09]}>
            <Popup>
              Center!
            </Popup>
          </Marker>

            <RouteForm />
            <SearchForm />
            <ConvertForm />
      
        </MapContainer>
      </div>
  );
}

export default Dashboard;