// app.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors()); // in production, pass origin: 'https://your.site'
app.use(express.json());

// Helper: parse normalized floats safely
function parseNormalized(v) {
  const n = Number(v);
  if (Number.isFinite(n) && n >= 0 && n <= 1) return n;
  return null;
}

/**
 * GET /api/images
 * List available images (lightweight)
 */
app.get('/api/images', async (req, res, next) => {
  try {
    const images = await prisma.image.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        filename: true,
        createdAt: true
      },
      orderBy: { id: 'asc' }
    });
    res.json(images);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/images/:id
 * Get an image with its characters (coordinates included).
 * If you don't want to expose exact coordinates to the public client,
 * change the `characters` selection to omit x/y/radius.
 */
app.get('/api/images/:id', async (req, res, next) => {
  try {
    const imageId = Number(req.params.id);
    if (!Number.isFinite(imageId)) return res.status(400).json({ error: 'Invalid image id' });

    const image = await prisma.image.findUnique({
      where: { id: imageId },
      include: {
        characters: {
          select: {
            id: true,
            name: true,
            x: true,
            y: true,
            radius: true
          }
        }
      }
    });

    if (!image) return res.status(404).json({ error: 'Image not found' });

    res.json(image);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/games
 * Start a new game for a particular image.
 * Body: { imageId: number }
 * Returns the created game object (id, startedAt, imageId)
 */
app.post('/api/games', async (req, res, next) => {
  try {
    const { imageId } = req.body;
    const iId = Number(imageId);
    if (!Number.isFinite(iId)) return res.status(400).json({ error: 'imageId required' });

    // Optionally validate image exists
    const image = await prisma.image.findUnique({ where: { id: iId } });
    if (!image) return res.status(404).json({ error: 'Image not found' });

    const game = await prisma.game.create({
      data: { imageId: iId }
    });

    res.status(201).json(game);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/games/:gameId/check
 * Validate a click for a candidate character.
 * Body: { x: number, y: number, candidateName?: string, charId?: number }
 *
 * Behavior:
 * - Accepts either charId OR candidateName.
 * - Uses squared distance check using character.radius.
 * - Records FoundMarker regardless of correctness.
 * - If correct and not previously found in this game, increments foundCount.
 * - Returns { correct: boolean, charId, remaining: number }
 */
app.post('/api/games/:gameId/check', async (req, res, next) => {
  try {
    const gameId = Number(req.params.gameId);
    if (!Number.isFinite(gameId)) return res.status(400).json({ error: 'Invalid game id' });

    const x = parseNormalized(req.body.x);
    const y = parseNormalized(req.body.y);
    if (x === null || y === null) return res.status(400).json({ error: 'x and y must be normalized floats between 0 and 1' });

    const { charId: maybeCharId, candidateName } = req.body;

    // load game (and ensure exists)
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) return res.status(404).json({ error: 'Game not found' });

    // fetch characters for this image
    const characters = await prisma.character.findMany({ where: { imageId: game.imageId } });

    let char = null;
    if (maybeCharId !== undefined && maybeCharId !== null) {
      const cid = Number(maybeCharId);
      char = characters.find(c => c.id === cid);
    } else if (candidateName) {
      char = characters.find(c => c.name.toLowerCase() === String(candidateName).toLowerCase());
    } else {
      return res.status(400).json({ error: 'Provide charId or candidateName' });
    }

    if (!char) {
      return res.status(400).json({ error: 'Character not found for this image' });
    }

    // check whether this character was already found correctly in this game
    const alreadyFound = await prisma.foundMarker.findFirst({
      where: {
        gameId,
        charId: char.id,
        correct: true
      }
    });

    if (alreadyFound) {
      // Already found — return special response (not counting again)
      const totalChars = characters.length;
      const correctCount = await prisma.foundMarker.count({
        where: { gameId, correct: true }
      });
      const remaining = Math.max(0, totalChars - correctCount);
      return res.json({ correct: false, alreadyFound: true, charId: char.id, remaining });
    }

    // compute squared distance
    const dx = x - char.x;
    const dy = y - char.y;
    const distSq = dx * dx + dy * dy;
    const radius = (typeof char.radius === 'number' && char.radius > 0) ? char.radius : 0.03;
    const radiusSq = radius * radius;
    const correct = distSq <= radiusSq;

    // record the attempt
    await prisma.foundMarker.create({
      data: {
        gameId,
        charId: char.id,
        x,
        y,
        correct
      }
    });

    // if correct, increment game's foundCount (but ensure atomicity)
    if (correct) {
      await prisma.game.update({
        where: { id: gameId },
        data: { foundCount: { increment: 1 } }
      });
    }

    // compute remaining
    const totalChars = characters.length;
    const correctCount = await prisma.foundMarker.count({
      where: { gameId, correct: true }
    });
    const remaining = Math.max(0, totalChars - correctCount);

    res.json({ correct, charId: char.id, remaining });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/games/:gameId/finish
 * Finish the game and save player name + final time (ms).
 * Body: { playerName?: string }
 */
app.post('/api/games/:gameId/finish', async (req, res, next) => {
  try {
    const gameId = Number(req.params.gameId);
    if (!Number.isFinite(gameId)) return res.status(400).json({ error: 'Invalid game id' });

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) return res.status(404).json({ error: 'Game not found' });

    if (game.finishedAt) {
      // already finished
      return res.status(400).json({ error: 'Game already finished' });
    }

    const finishedAt = new Date();
    const timeMs = finishedAt.getTime() - game.startedAt.getTime();

    const { playerName } = req.body;

    const updated = await prisma.game.update({
      where: { id: gameId },
      data: {
        finishedAt,
        timeMs: Number(timeMs),
        playerName: playerName ? String(playerName).slice(0, 100) : null
      }
    });

    res.json({ success: true, game: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/leaderboard/:imageId
 * Return top scores for an image (fastest times).
 */
app.get('/api/leaderboard/:imageId', async (req, res, next) => {
  try {
    const imageId = Number(req.params.imageId);
    if (!Number.isFinite(imageId)) return res.status(400).json({ error: 'Invalid image id' });

    const top = await prisma.game.findMany({
      where: {
        imageId,
        finishedAt: { not: null },
        timeMs: { not: null }
      },
      orderBy: { timeMs: 'asc' },
      take: 20,
      select: {
        id: true,
        playerName: true,
        timeMs: true,
        finishedAt: true,
        createdAt: true
      }
    });

    res.json(top);
  } catch (err) {
    next(err);
  }
});

/**
 * (Optional) GET /api/games/:id
 * Return game state + found markers (for client resume)
 */
app.get('/api/games/:id', async (req, res, next) => {
  try {
    const gameId = Number(req.params.id);
    if (!Number.isFinite(gameId)) return res.status(400).json({ error: 'Invalid game id' });

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        FoundMarker: {
          include: { character: { select: { id: true, name: true } } }
        }
      }
    });

    if (!game) return res.status(404).json({ error: 'Game not found' });

    res.json(game);
  } catch (err) {
    next(err);
  }
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
