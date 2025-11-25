const express = require('express');
const multer = require('multer');

const pool = require('../configs/postgres.config');
const { redisClient } = require('../configs/redis.config')

const router = express.Router();
const upload = multer();


router.post('/api/convert', async (req, res) => {

    const { lat, long, zoom } = req.body;

    try {

        const key_string = `convert:${lat},${long},${zoom}`;
        const check_convert = await redisClient.get(key_string);

        if (check_convert) {
            const data = JSON.parse(check_convert);
            return res.status(200).json({
                x_tile: data.x_tile,
                y_tile: data.y_tile 
            });
        } 
        
        const latitude = lat;
        const longitude = long;
        const lat_rad = latitude * Math.PI / 180;

        const n = Math.pow(2, zoom);
        const x_tile = n * ((longitude + 180) / 360);
        const y_tile = n * (1 - (Math.log(Math.tan(lat_rad) + (1 / Math.cos(lat_rad))) / Math.PI)) / 2;

        const data = {
            x_tile: x_tile,
            y_tile: y_tile
        }

        try {
            await redisClient.set(`convert:${lat},${long},${zoom}`, 3600, JSON.stringify(data));
        }
        catch (error) {
            console.error('Error putting convert data into redis: ', error)
            return res.status(500).json({ error: 'Internal Redis Error', message: error.message});
        }

        return res.status(200).json({ x_tile: x_tile, y_tile: y_tile });
    }
    catch (error) {
        console.error('Error getting convert data from redis', error);
        return res.status(500).json({ error: "Internal Redis Error", message: error.message });
    }
});


router.post('/api/search', upload.none(), async (req, res) => {

    const { bbox, onlyInBox, searchTerm } = req.body;
    const modifiedSearchTerm = searchTerm.trim();

    try {

        const search_response = await redisClient.get(`search:${modifiedSearchTerm},${onlyInBox}`);

        if (search_response) {
            const data = JSON.parse(search_response);
            return res.status(200).json({ formattedResults: data })
        }

        let housenumber = null;
        let street = null;
        let city = null;

        const location = modifiedSearchTerm.split(',');

        let parts = location[0].split(' ');
        if (/\d/.test(parts[0])) {
            housenumber = parts.shift();
            street = parts.join(' ');
        } else {
            housenumber = null;
            street = location[0].trim();
        }

        if (location[1]) {
            city = location[1].trim();
        } else {
            city = street;  // Fallback 
        }

        const searchConditions = [];
        if (modifiedSearchTerm) {
            searchConditions.push(`name ILIKE '%${modifiedSearchTerm}%'`);
        }
        if (housenumber) {
            searchConditions.push(`"addr:housenumber" ILIKE '%${housenumber}%'`);
        }
        if (street) {
            searchConditions.push(`tags->'addr:street' ILIKE '%${street}%'`);
        }
        if (city) {
            searchConditions.push(`tags->'addr:city' ILIKE '%${city}%'`);
        }

        const searchQuery = searchConditions.join(' OR ');

        try {

            let query = `
            SELECT name,
            ST_X(ST_Centroid(ST_Transform(way, 4326))) AS lon,
            ST_Y(ST_Centroid(ST_Transform(way, 4326))) AS lat,
            ST_XMin(ST_Extent(ST_Transform(way, 4326))) AS minLon,
            ST_YMin(ST_Extent(ST_Transform(way, 4326))) AS minLat,
            ST_XMax(ST_Extent(ST_Transform(way, 4326))) AS maxLon,
            ST_YMax(ST_Extent(ST_Transform(way, 4326))) AS maxLat
            FROM planet_osm_point
            WHERE `;

            if (onlyInBox == true) {

                query += `ST_Intersects(ST_MakeEnvelope(${bbox.minLon}, ${bbox.minLat}, ${bbox.maxLon}, ${bbox.maxLat}, 4326), way) AND (${searchQuery}) `;
                query += `GROUP BY
                name,
                lon,
                lat
                LIMIT 30;`
            }
            else {
                query += `${searchQuery} `;
                query += `GROUP BY
                name,
                lon,
                lat
                LIMIT 30;`
            }

            const { rows }  = await pool.query(query);
        
            let formattedResults = rows
                .filter(row => row.name !== null) 
                .map(row => ({
                name: row.name,
                coordinates: { lat: row.lat, lon: row.lon },
                bbox: {
                    minLat: row.minlat,
                    minLon: row.minlon,
                    maxLat: row.maxlat,
                    maxLon: row.maxlon
                }
            }));

            if (rows.length < 30) {
                query = `
                SELECT name,
                ST_X(ST_Centroid(ST_Transform(way, 4326))) AS lon,
                ST_Y(ST_Centroid(ST_Transform(way, 4326))) AS lat,
                ST_XMin(ST_Extent(ST_Transform(way, 4326))) AS minLon,
                ST_YMin(ST_Extent(ST_Transform(way, 4326))) AS minLat,
                ST_XMax(ST_Extent(ST_Transform(way, 4326))) AS maxLon,
                ST_YMax(ST_Extent(ST_Transform(way, 4326))) AS maxLat
                FROM planet_osm_line
                WHERE `;

                if (onlyInBox == true) {
                    query += `ST_Intersects(ST_MakeEnvelope(${bbox.minLon}, ${bbox.minLat}, ${bbox.maxLon}, ${bbox.maxLat}, 4326), way) AND (${searchQuery}) `;
                    query += `GROUP BY
                    name,
                    lon,
                    lat
                    LIMIT 30;`
                }
                else {
                    query += `${searchQuery} `;
                    query += `GROUP BY
                    name,
                    lon,
                    lat
                    LIMIT 30;`
                }

                const { rows }  = await pool.query(query);
        
                formattedResults = formattedResults.concat(rows
                    .filter(row => row.name !== null) 
                    .map(row => ({
                    name: row.name,
                    coordinates: { lat: row.lat, lon: row.lon },
                    bbox: {
                        minLat: row.minlat,
                        minLon: row.minlon,
                        maxLat: row.maxlat,
                        maxLon: row.maxlon
                        }
                    }))
                    .filter(result => result.name !== null)
                );
            }

            try {
                await redisClient.setEx(`search:${modifiedSearchTerm},${onlyInBox}`, 3600, JSON.stringify(formattedResults))
            }
            catch (error) {
                console.error('Error adding search data into redis', error);
                return res.status(500).json({ error: 'Internal Redis Error', message: error.message});
            }

            return res.status(200).json({ formattedResults: formattedResults });
        } 
        catch (error) {
            console.error(`Error performing search`, error);
            return res.status(500).json({ error: 'Internal Server Error', message: error.message});
        }
    }
    catch (error) {
        console.error(`Error getting search data from redis`, error);
        return res.status(500).json({ error: 'Internal Redis Error', message: error.message});
    }
});

module.exports = router;
