const request = require('supertest');
const app = require('./index');

describe('API Endpoints', () => {
    test('GET /health should return status OK', async () => {
        const response = await request(app).get('/health');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ status: 'OK' });
    });

    test('GET /api/greeting should return default greeting', async () => {
        const response = await request(app).get('/api/greeting');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Hello, World!');
        expect(response.body).toHaveProperty('timestamp');
    });

    test('GET /api/greeting with name parameter should return personalized greeting', async () => {
        const response = await request(app).get('/api/greeting?name=John');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Hello, John!');
        expect(response.body).toHaveProperty('timestamp');
    });
});
