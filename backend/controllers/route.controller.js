import axios from 'axios';
import { redisClient } from '../configs/redis.config.js';

const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1';

const PROFILES = {
  walk: 'foot',
  bike: 'bike',
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
      return res.status(200).json({ formattedRoute: JSON.parse(cached), fromCache: true });
    }

    const url = `${OSRM_BASE_URL}/${profile}/${source.lon},${source.lat};${destination.lon},${destination.lat}?steps=true`;
    const response = await axios.get(url);

    const steps = response.data.routes[0].legs.flatMap(leg => leg.steps);

    const formattedRoute = steps.map(step => ({
      description: step.name,
      coordinates: {
        lat: step.intersections[0].location[1],
        lon: step.intersections[0].location[0],
      },
      distance: step.distance,
    }));

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(formattedRoute));

    res.status(200).json({ formattedRoute });

  } catch (error) {
    console.error('Routing error:', error.message);
    res.status(500).json({ message: 'Failed to get route' });
  }
};
