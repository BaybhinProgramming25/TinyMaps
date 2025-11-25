const express = require('express');
const axios = require('axios');
const router = express.Router();

const { redisClient } = require('../configs/redis.config')

router.post('/api/route', async (req, res) => {

  const { source, destination } = req.body;
  const url = `https://router.project-osrm.org/route/v1/driving/${source.lon},${source.lat};${destination.lon},${destination.lat}?steps=true`;

  const route_response = await redisClient.get(`route:${source.lon},${source.lat},${destination.lon},${destination.lat}`);
  
  if (route_response) {
    const data = JSON.parse(route_response);
    return res.status(200).json({ formattedRoute: data});
  }

  try {

    const response_second = await axios.get(url);

    const routes = response_second.data.routes[0];
    const steps = routes.legs.flatMap(leg => leg.steps);

    const formattedRoute = steps.map(step => ({
      description: step.name,
      coordinates: {
        lat: step.intersections[0].location[1],
        lon: step.intersections[0].location[0]
      },
      distance: step.distance
    }));

    await redisClient.setEx(`route:${source.lon},${source.lat},${destination.lon},${destination.lat}`, 3600, JSON.stringify(formattedRoute));
    return res.status(200).json({ formattedRoute: formattedRoute});
  }
  catch (error) {
    console.log('Error in fetching route information', error);
    res.status(500).json({ error: 'Issue with getting the route'});
  }
});

module.exports = router;