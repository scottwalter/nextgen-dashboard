# Next Generation Bitaxe Dashboard

A modern, real-time monitoring dashboard for Bitaxe mining devices built with Vue.js 3, Express.js, and Docker.

## Features

- **Real-time Monitoring**: Live data from multiple Bitaxe devices
- **Modern UI**: Dark theme with responsive design
- **Authentication**: Optional JWT-based authentication system
- **Mining Core Integration**: Connect to mining pool software for additional statistics
- **Interactive Charts**: Real-time hashrate and temperature visualization
- **Device Configuration**: Manage Bitaxe settings through the dashboard
- **Docker Deployment**: Easy deployment with multi-architecture support (AMD64/ARM64)
- **Bootstrap Setup**: First-time configuration wizard

## Architecture

- **Frontend**: Vue.js 3 with Composition API, Pinia for state management
- **Backend**: Express.js REST API with proxy endpoints
- **Deployment**: Docker with multi-stage builds
- **Configuration**: File-based configuration with hot-reloading

## Quick Start

### Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd nextgen-dashboard
   ```

2. Build and run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Access the dashboard at `http://localhost:3000`

### Development Setup

1. Install dependencies:
   ```bash
   npm install
   cd src/frontend && npm install
   ```

2. Start development servers:
   ```bash
   npm run dev
   ```

   This runs both backend (port 3000) and frontend (port 5173) concurrently.

## Configuration

The application uses configuration files stored in the `config/` directory:

- `app-config.json`: Main application configuration
- `device-mappings.json`: Field mappings for device data
- `mining-mappings.json`: Field mappings for mining core data

### Docker Volume Mapping

Mount the config directory to persist configurations:
```bash
docker run -p 3000:3000 -v $(pwd)/config:/app/config nextgen-bitaxe-dashboard
```

## API Endpoints

### Configuration
- `GET /api/config` - Get current configuration
- `POST /api/config` - Create initial configuration (bootstrap)
- `PUT /api/config` - Update configuration

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/generate-secret` - Generate JWT secret

### Devices
- `GET /api/devices` - Get all devices status
- `GET /api/devices/:id/data` - Get device data
- `GET /api/devices/:id/chart` - Get device chart data
- `POST /api/devices/:id/restart` - Restart device
- `GET /api/devices/:id/config` - Get device configuration
- `PUT /api/devices/:id/config` - Update device configuration

### Mining Core
- `GET /api/mining-core/data` - Get mining core data

## Environment Variables

- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3000)

## Development

### Project Structure

```
├── src/
│   ├── backend/          # Express.js backend
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication middleware
│   │   ├── config/       # Configuration management
│   │   ├── services/     # Business logic services
│   │   └── server.js     # Main server file
│   └── frontend/         # Vue.js frontend
│       ├── src/
│       │   ├── components/  # Vue components
│       │   ├── views/      # Page components
│       │   ├── stores/     # Pinia stores
│       │   ├── services/   # API services
│       │   └── assets/     # Static assets
│       └── package.json
├── config/              # Configuration files (Docker volume)
├── public/              # Built frontend (production)
├── Dockerfile           # Production Docker image
├── docker-compose.yml   # Docker Compose configuration
└── package.json         # Main package configuration
```

### Building for Production

1. Build frontend:
   ```bash
   cd src/frontend
   npm run build
   ```

2. Build Docker image:
   ```bash
   docker build -t nextgen-bitaxe-dashboard .
   ```

3. Or use the npm script:
   ```bash
   npm run build
   ```

### Adding Device Support

To add support for new device types:

1. Update `device-mappings.json` with new field mappings
2. Modify the AxeOS service in `src/backend/services/axeos.js`
3. Update the device card component to display new fields

## Security

- SHA256 password hashing for transmission
- JWT token authentication with configurable expiration
- Helmet.js security headers
- CORS protection
- Non-root Docker container execution

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Author

Scott Walter

## Version

2.0.0
