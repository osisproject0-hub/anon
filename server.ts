import express from "express";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Firebase Admin SDK
try {
  const serviceAccount = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "serviceAccountKey.json"), "utf8")
  );
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://anonymous-d9b02-default-rtdb.firebaseio.com"
    });
    console.log("Firebase Admin initialized successfully");
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", adminInitialized: !!admin.apps.length });
  });

  // Example Admin Route: Get user stats (requires admin check in real app)
  app.get("/api/admin/stats", async (req, res) => {
    if (!admin.apps.length) {
      return res.status(503).json({ error: "Admin SDK not initialized" });
    }

    try {
      // In a real app, verify the ID token from the Authorization header first!
      // const idToken = req.headers.authorization?.split('Bearer ')[1];
      // const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // For now, just return some dummy stats or real counts if possible
      const usersCount = (await admin.firestore().collection('users').count().get()).data().count;
      const roomsCount = (await admin.firestore().collection('chat_rooms').count().get()).data().count;
      
      res.json({
        users: usersCount,
        rooms: roomsCount,
        online: 0 // Would need real-time tracking
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving would go here
    // app.use(express.static('dist'));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
