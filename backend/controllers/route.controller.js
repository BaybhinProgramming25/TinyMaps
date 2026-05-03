import axios from 'axios';
import { redisClient } from '../configs/redis.config.js';

const ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions';

const PROFILES = {
  walk: 'foot-walking',
  bike: 'cycling-regular',
};

export const getRoute = async (req, res) => {
  try {
    const { source, destination, mode } = req.body;

    const profile = PROFILES[mode];

    if (!profile) {
      return res.status(400).json({ message: 'Invalid mode. Use "walk" or "bike"' });
    }

    const cacheKey = `route:${mode}:${source.lon},${source.lat}:${destination.lon},${destination.lat}`;
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      return res.status(200).json({ ...JSON.parse(cached), fromCache: true });
    }

    const response = await axios.post(
      `${ORS_BASE_URL}/${profile}/geojson`,
      {
        coordinates: [[source.lon, source.lat], [destination.lon, destination.lat]],
        radiuses: [-1, -1],
        preference: 'fastest',
        options: { avoid_features: ['ferries'] },
      },
      {
        headers: {
          Authorization: process.env.ORS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const feature = response.data.features[0];
    const geometry = feature.geometry.coordinates.map(([lon, lat]) => ({ lat, lon }));
    const { distance, duration } = feature.properties.summary;

    const steps = feature.properties.segments
      .flatMap(seg => seg.steps)
      .map(step => ({
        instruction: step.instruction,
        distance: step.distance,
        wayPoints: step.way_points,
      }));

    const result = { geometry, steps, totalDistance: distance, totalDuration: duration };

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));

    res.status(200).json(result);

  } catch (error) {
    const orsMessage = error.response?.data?.error?.message;
    console.error('Routing error:', orsMessage || error.message);
    res.status(500).json({ message: orsMessage || 'Failed to get route' });
  }
};
