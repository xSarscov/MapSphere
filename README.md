# MapSphere 📌

![image](https://github.com/user-attachments/assets/e0f32e00-f936-4ffe-b45f-ef41c4c81e77)


MapSphere is an advanced, immersive 3D navigation application that integrates Google Maps, Three.js, and AI-powered assistance to deliver an interactive mapping experience. This project combines real-time character navigation, intelligent route planning, and a generative AI chat assistant for enhanced user engagement.

---

## Preview

https://github.com/user-attachments/assets/467072c5-f522-471e-bf4b-0b5783e8a792

## Features

1. **Interactive 3D Navigation**
   - Explore the map with a 3D character controlled by keyboard and mouse inputs.
   - Real-time camera adjustment for an immersive view.

2. **Dynamic Route Management**
   - Input a destination to calculate the best route using Google Maps Directions API.
   - A 3D arrow guides users along the calculated route.

3. **Minimap Integration**
   - A synchronized minimap shows real-time character movement and route details.

4. **AI Assistance**
   - Chat with a generative AI assistant for location-based guidance and recommendations.

5. **Intuitive Controls**
   - **W, A, S, D** or arrow keys for movement.
   - Mouse for camera adjustments.
   - **Control key** to lock/unlock the camera for focused navigation.

---

## Technology Stack

### Core Libraries and APIs
- [![Google maps API](https://img.shields.io/badge/Google_maps-2ea44f?logo=Google+maps)](https://www.google.com.mx/maps):
  - Places, Geometry, Directions, and Marker libraries.
- ![Threejs](https://img.shields.io/badge/threejs-black?style=for-the-badge&logo=three.js&logoColor=white):
  - For rendering 3D models and animations.
- **Google Generative AI**:
  - For natural language processing and AI-driven guidance.

### Development Tools
- **@googlemaps/js-api-loader**: To load Google Maps efficiently.
- **GLTFLoader**: For importing 3D models.
- ![Bootstrap](https://img.shields.io/badge/bootstrap-%238511FA.svg?style=for-the-badge&logo=bootstrap&logoColor=white): For responsive and clean UI design.

---

## Project Structure

```
📂 3d-google-maps-to-vr/
├── 📁 node_modules/         # Dependencies installed via npm.
├── 📁 public/               # Public assets served as-is.
│   ├── 📂 assets/           # Static assets (images, styles, scripts).
│   │   ├── 📂 css/          # CSS files for styling.
│   │   ├── 📂 img/          # Images (logos, icons, backgrounds).
│   │   ├── 📂 js/           # JavaScript files (app logic).
│   │   └── 📂 vendor/       # Third-party libraries (e.g., Bootstrap, Swiper).
│   └── 🗂 favicon.png       # Favicon for the app.
├── 📁 src/                  # Source code for app logic.
│   ├── 📂 helpers/          # Utility scripts (e.g., environment variables).
│   │   └── 🗂 getEnvVariables.js
│   ├── 📂 models/           # 3D assets for the app (GLTF/OBJ files).
│   │   ├── 🗂 arrow/        # 3D arrow model files.
│   │   ├── 🗂 astronaut/    # 3D astronaut character model files.
│   ├── 🗂 app.js            # Core application logic (maps, animations).
│   └── 🗂 index.html        # Entry point HTML file.
├── 🗂 .env                  # Environment variables (API keys).
├── 🗂 .gitignore            # Git ignore file for excluding unnecessary files.
├── 🗂 package.json          # Project dependencies and scripts.
├── 🗂 package-lock.json     # Dependency lockfile.
├── 🗂 README.md             # Documentation (you're reading this!).
├── 🗂 vite.config.js        # Vite configuration for development.
└── 🗂 main.js               # Entry script linking HTML and app logic.

```

---

## Requirements

Before running the project, ensure you have the following:

1. **Node.js** and **npm** installed.
2. A **Google Cloud API Key** with the following APIs enabled:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Maps Static API (optional for static maps).
3. **Three.js** and `@googlemaps/js-api-loader` installed as dependencies.
4. A **Gemini** API key.

---

## Setup and Installation

### 1. Clone the Repository
```bash
https://github.com/xSarscov/MapSphere.git
cd MapSphere
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory with the following keys:
```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_MAPS_MAP_ID=your_map_id
VITE_GEMINI_API_KEY=your_generative_ai_api_key
```

### 4. Start the Development Server
Run the following command to start a local development server:
```bash
npm run dev
```

### 5. Open in Browser
Visit `http://localhost:5173` in your browser to view the project.

---

## Usage

### Controls
- **W, A, S, D** or Arrow Keys: Move your character on the map.
- **Mouse Movement**: Adjust the camera view.
- **Control Key**: Lock/unlock the camera for navigation.

### Features
1. **Search for Locations**:
   - Use the search box to teleport your character to any location.
   - The AI assistant provides additional insights about the location.

2. **Plan Routes**:
   - Input a destination in the minimap controls to calculate the best route.
   - A 3D arrow dynamically guides you along the route.

3. **AI Chat Assistance**:
   - Type questions or queries in the chat box to receive location-based insights or recommendations.

---

## Troubleshooting

1. **WebGL Overlay Not Displaying**:
   - Ensure your Google Maps API key supports vector maps.
   - Confirm the `mapId` in your environment variables matches a vector map configuration.

2. **Minimap Out of Sync**:
   - Check if `updateMinimapCharacterPosition` is being called during character movement.

3. **3D Models Not Loading**:
   - Verify the path to the `.gltf` models in the `models` folder.
     
4. **API Request Quotas Exceeded**:
   - Problem: API requests fail intermittently with errors such as OVER_QUERY_LIMIT.
---

## Possible Improvements

1. **Voice Command Integration**:
   - Enable voice-based navigation and AI interaction.
2. **AR & VR Features**:
   - Incorporate augmented and virtual reality for enhanced visual engagement using webxr.

---


## Acknowledgments

- **Google Maps**: For providing robust mapping APIs.
- **Three.js**: For 3D rendering capabilities.
- **Google Generative AI**: For adding intelligence to the chat assistant.
- **Bootstrap**: For creating a responsive and user-friendly interface.
