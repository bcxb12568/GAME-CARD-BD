import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import cors from "cors";
import multer from "multer";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const DATA_FILE = path.join(process.cwd(), "data", "games.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Ensure directories exist
async function ensureDirs() {
  try {
    await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true });
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.error("Error creating directories:", err);
  }
}
ensureDirs();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 * 1024 } // 10GB
});

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

if (supabase) {
  console.log("[SUPABASE] Supabase client initialized and connected.");
}

async function readData() {
  // Try to read from Supabase first if available
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_data')
        .select('*')
        .eq('id', 'primary')
        .single();
      
      if (!error && data) {
        console.log("[SUPABASE] Data fetched from Supabase cloud.");
        return data.content;
      }
      
      if (error && error.code === 'PGRST116') {
        console.log("[SUPABASE] No data found in Supabase table 'site_data'. Attempting to sync local data...");
      } else if (error) {
        console.warn("[SUPABASE] Error reading from Supabase:", error.message);
      }
    } catch (err) {
      console.warn("[SUPABASE] Unexpected error reading from Supabase:", err);
    }
  }

  try {
    let data;
    try {
      data = await fs.readFile(DATA_FILE, "utf-8");
    } catch (e) {
      console.log("No data file found, creating default.");
      const defaultData = { 
        games: [], 
        ads: { headerAd: "", downloadPageAd: "" },
        settings: {
          backgroundImage: "",
          backgroundVideo: "",
          backgroundType: "image",
          backgroundColor: "#050505",
          backgroundAnimation: "none",
          overlayOpacity: 0.5
        }
      };
      await writeData(defaultData);
      return defaultData;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading or parsing data file:", error);
    return { 
      games: [], 
      ads: { headerAd: "", downloadPageAd: "" },
      settings: {
        backgroundImage: "",
        backgroundVideo: "",
        backgroundType: "image",
        backgroundColor: "#050505",
        backgroundAnimation: "none",
        overlayOpacity: 0.5
      }
    };
  }
}

async function writeData(data: any) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  
  if (supabase) {
    try {
      const { error } = await supabase
        .from('site_data')
        .upsert({ id: 'primary', content: data, updated_at: new Date().toISOString() });
      
      if (error) {
        console.warn("[SUPABASE] Error syncing data to Supabase:", error.message);
      } else {
        console.log("[SUPABASE] Data successfully synced to cloud.");
      }
    } catch (err) {
      console.warn("[SUPABASE] Sync error:", err);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10gb' }));
  app.use(express.urlencoded({ limit: '10gb', extended: true }));
  app.use("/uploads", express.static(UPLOADS_DIR));
  app.use("/public", express.static(path.join(process.cwd(), "public")));

  // API Routes
  app.post("/api/upload", upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  app.get("/api/games", async (req, res) => {
    const data = await readData();
    res.json(data.games);
  });

  app.get("/api/ads", async (req, res) => {
    const data = await readData();
    res.json(data.ads);
  });

  app.post("/api/games", async (req, res) => {
    try {
      const { password, game } = req.body;
      if (password !== "admin123") return res.status(401).json({ error: "Unauthorized" });
      
      console.log(`[PUBLISH] Attempting to add new game: "${game.name}"`);
      const data = await readData();
      const newGame = { ...game, id: Date.now().toString() };
      data.games.push(newGame);
      await writeData(data);
      console.log(`[PUBLISH] Game added successfully with ID: ${newGame.id}. Total games: ${data.games.length}`);
      res.json(newGame);
    } catch (err) {
      console.error('[PUBLISH] Error saving game:', err);
      res.status(500).json({ error: "Failed to save game to server" });
    }
  });

  app.post("/api/games/:id/delete", async (req, res) => {
    const gameId = req.params.id;
    console.log(`[DELETE] Request received for game ID: "${gameId}"`);
    try {
      const { password } = req.body;
      
      if (password !== "admin123") {
        console.warn(`[DELETE] Unauthorized attempt for game ${gameId}`);
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const data = await readData();
      const initialCount = data.games.length;
      console.log(`[DELETE] Current game count: ${initialCount}`);
      
      const targetId = String(gameId).trim();
      const gameToDelete = data.games.find((g: any) => String(g.id).trim() === targetId);

      if (!gameToDelete) {
        console.warn(`[DELETE] Game with ID "${targetId}" not found.`);
        return res.status(404).json({ error: "গেমটি পাওয়া যায়নি" });
      }

      // Try to delete physical files if they are in /uploads
      if (gameToDelete.downloadUrl?.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), "public", gameToDelete.downloadUrl);
        try { await fs.unlink(filePath); } catch (e) { console.warn(`Could not delete file ${filePath}`); }
      }
      if (gameToDelete.image?.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), "public", gameToDelete.image);
        try { await fs.unlink(filePath); } catch (e) { console.warn(`Could not delete file ${filePath}`); }
      }

      data.games = data.games.filter((g: any) => String(g.id).trim() !== targetId);
      await writeData(data);
      console.log(`[DELETE] Game ${targetId} deleted. New count: ${data.games.length}`);
      res.json({ success: true });
    } catch (err) {
      console.error('[DELETE] Server error:', err);
      res.status(500).json({ error: "Server error during deletion" });
    }
  });

  app.post("/api/ads", async (req, res) => {
    const { password, ads } = req.body;
    if (password !== "admin123") return res.status(401).json({ error: "Unauthorized" });
    
    const data = await readData();
    data.ads = ads;
    await writeData(data);
    res.json({ success: true });
  });

  app.get("/api/settings", async (req, res) => {
    const data = await readData();
    res.json(data.settings || {
      backgroundImage: "",
      backgroundColor: "#050505",
      backgroundAnimation: "none",
      overlayOpacity: 0.5
    });
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const { password, settings } = req.body;
      if (password !== "admin123") return res.status(401).json({ error: "Unauthorized" });
      
      console.log(`[SETTINGS] Updating site settings. Background type: ${settings.backgroundType}`);
      const data = await readData();
      data.settings = settings;
      await writeData(data);
      console.log(`[SETTINGS] Site settings updated successfully.`);
      res.json({ success: true });
    } catch (err) {
      console.error('[SETTINGS] Error saving settings:', err);
      res.status(500).json({ error: "Failed to save settings to server" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
