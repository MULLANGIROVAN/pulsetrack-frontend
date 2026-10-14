# 🚀 PulseTrack — Web Analytics Dashboard

PulseTrack is a lightweight web analytics platform designed to help website owners understand how visitors interact with their websites.

The platform collects user interaction events, associates them with unique session IDs, and presents the collected data through an analytics dashboard.

The frontend provides an interface for exploring analytics summaries, user sessions, session timelines, and click coordinate data.

## 🌐 Live Demo

**Live Dashboard:** https://pulsetrack-nine.vercel.app/

## 📸 Features

- 📊 **Analytics Dashboard:** View a summary of collected website activity.
- 👥 **Session Analytics:** Explore tracked user sessions.
- 🕒 **Session Timeline:** Examine events associated with a particular session.
- 🖱️ **Click Analytics:** Retrieve click coordinate data for analysis.
- 🔗 **REST API Integration:** Communicate with the PulseTrack backend.
- 📱 **Responsive UI:** Access the dashboard on different screen sizes.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Development server and build tooling |
| JavaScript | Application logic |
| Fetch API | Backend communication |
| Vercel | Frontend deployment |

## 🏗️ Architecture

```text
             Website Visitors
                    |
                    v
            Tracked User Events
                    |
                    v
             PulseTrack API
                    |
                    v
                 MongoDB
                    |
                    v
           Analytics REST APIs
                    |
                    v
             React Dashboard
```

The dashboard retrieves analytics data from the backend. Event collection happens through the tracking script integrated into a website.

## 🚀 Getting Started

### Prerequisites

Install the following:

- Node.js
- npm
- Git

You will also need access to a running PulseTrack backend.

### 1. Clone the Repository

```bash
git clone https://github.com/MULLANGIROVAN/pulsetrack-frontend.git
```

### 2. Navigate to the Project Directory

```bash
cd pulsetrack-frontend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root.

For the deployed backend:

```env
VITE_API_URL=https://pulsetrack-backend-vbg6.onrender.com
```

For a locally running backend:

```env
VITE_API_URL=http://localhost:5000
```

The backend URL must match the address where your backend is running.

**Important:** Restart the Vite development server after changing environment variables.

### 5. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal. Vite commonly uses:

```text
http://localhost:5173
```

### 6. Build for Production

```bash
npm run build
```

The production files will be generated in the `dist` directory.

To preview the production build locally:

```bash
npm run preview
```

## 🔌 Backend API Integration

The frontend communicates with the backend using the following endpoints.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/analytics/summary` | Retrieve analytics summary |
| GET | `/api/analytics/sessions` | Retrieve tracked sessions |
| GET | `/api/analytics/sessions/:sessionId` | Retrieve a session's event timeline |
| GET | `/api/analytics/heatmap?pageUrl=...` | Retrieve click coordinate data |

The backend base URL is configured through the `VITE_API_URL` environment variable.

## ⚙️ Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Base URL of the PulseTrack backend |

Example:

```env
VITE_API_URL=https://pulsetrack-backend-vbg6.onrender.com
```

Do not place database passwords, private API keys, or other secrets in frontend environment variables. Variables prefixed with `VITE_` can be exposed to browser users.

## 🌍 Deployment

The frontend can be deployed to Vercel.

General deployment steps:

1. Push the frontend code to GitHub.
2. Import the repository into Vercel.
3. Select Vite as the framework if it is not detected automatically.
4. Set the build command to `npm run build`.
5. Set the output directory to `dist`.
6. Configure `VITE_API_URL` with the deployed backend URL.
7. Deploy the application.

After deployment, verify that the dashboard can reach the backend and that the backend's CORS configuration allows requests from the deployed frontend origin.

## 🔍 Troubleshooting

### Dashboard cannot retrieve analytics

- Check whether the backend is running.
- Verify that `VITE_API_URL` points to the correct backend.
- Check the browser console for network errors.
- Check the backend logs.
- Confirm that the backend's CORS configuration allows the frontend origin.

### Dashboard displays no data

- Verify that event data exists in MongoDB.
- Open the analytics endpoints and inspect their responses.
- Confirm that the tracking script is integrated into the demo website.
- Check whether events are successfully reaching the backend.

### Environment changes do not take effect

Restart the Vite development server after modifying `.env`.

## 🔮 Future Improvements

- Interactive click heatmap visualizations
- Date-based analytics filters
- More detailed event charts
- Real-time analytics updates
- Improved session exploration
- Enhanced error and loading states

## 👨‍💻 Author

**Rovan**

GitHub: https://github.com/MULLANGIROVAN

## 📄 License

No specific open-source license is declared by this README. Add a `LICENSE` file if you intend to distribute the project under a particular license.
