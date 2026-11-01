# Cyber CTF Clash

A real-time multiplayer capture-the-flag riddle game built with React, TypeScript, Express, and WebSockets. Compete individually or in teams to solve challenges in cryptography, cybersecurity, mathematics, and digital forensics.

[Hosted frontend](https://cyberchall.netlify.app) · [Source code](https://github.com/hemanth18gowda01-byte/MultiplayerCyberGame)

> The current Netlify configuration publishes the frontend only. Multiplayer requires the Express/WebSocket server described in [Deployment](#deployment).

## Features

- **Three match formats:** 1v1 duels, 2v2 teams, and 4v4 squads, with Red and Blue teams.
- **Three difficulty tiers:** Beginner, Intermediate, and Advanced, plus an all-tier gauntlet.
- **30 bundled challenges:** 10 per tier, with randomized decks, hints, artifacts, accepted answers, and explanations.
- **Shared rooms:** Public room browsing, private rooms, four-letter room codes, invite links, and QR codes.
- **Practice opponents:** Fill empty slots with simulated bots.
- **Live gameplay:** Server-managed countdowns, flag validation, scores, chat, emoji reactions, and sound effects.
- **Built-in Cyber Toolkit:** Base64 encoding/decoding, Caesar shifts, hexadecimal and binary conversion, hashes, URL decoding, string reversal, and XOR helpers.
- **Match results:** Player rankings, team standings, category statistics, and browser-local match history.
- **Focus monitoring:** Leaving the game tab or window clears the current input and hint state and can deduct up to 200 points.

## Technology

| Layer | Tools |
| --- | --- |
| Interface | React 19, TypeScript, Tailwind CSS 4 |
| Tooling | Vite 8, tsx |
| Server | Node.js, Express 4, ws |
| Visuals and interaction | Motion, Lucide React, canvas-confetti, qrcode |

## Local setup

### Requirements

- Node.js **22.12 or newer**; Node.js 24 LTS is recommended.
- npm.
- A modern browser with WebSocket support.

### Install and run

```bash
git clone https://github.com/hemanth18gowda01-byte/MultiplayerCyberGame.git
cd MultiplayerCyberGame
npm install
npm run dev
```

Open **http://localhost:3000**. This starts the Express server, attaches the WebSocket server, and serves Vite through middleware, so the frontend and backend share one port.

To test multiplayer, open the same address in another browser or a separate browser profile and join the host's room. For devices on the same network, use the host computer's LAN address with port 3000 and allow incoming connections through its firewall. Clipboard features may require HTTPS when accessing the app over a LAN address.

### Configuration

No API key or database is required for the implemented game. Challenges are bundled with the source.

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | Port used by the Express and WebSocket server | `3000` |
| `NODE_ENV` | Set to `production` to serve the compiled `dist/` frontend | Development behavior when unset |
| `DISABLE_HMR` | Set to `true` to disable Vite hot reload and file watching | Hot reload enabled |

Set variables through your shell or hosting platform. For example, on macOS/Linux:

```bash
PORT=3001 npm run dev
```

The `.env.example` file contains legacy AI Studio configuration names. The current game does not use those AI settings, and `server.ts` does not automatically load a `.env` file.

## How to play

1. Choose a player name and avatar, then create a room or join one using a code, invite link, QR code, or public room listing.
2. In the lobby, select a match format and difficulty. Choose a single tier or the all-tier gauntlet, arrange teams, and add bots if needed.
3. Have participants mark themselves ready, then start the match from the host's lobby controls.
4. Read the riddle and artifact. Use hints and the built-in toolkit to work out the flag.
5. Submit a raw answer or a flag wrapped in `CTF{...}`. Matching ignores case and surrounding whitespace.
6. Review the scores and rankings at the end, then play again or leave the room.

### Timing and scoring

- By default, a match contains **five challenges per selected tier**, with **120 seconds per challenge**. The all-tier gauntlet advances from Beginner through Intermediate to Advanced.
- Correct answers earn the challenge's base points. The first solver also receives a speed bonus: `round(500 × max(0.1, timeRemaining / timerDuration))`.
- After the first correct answer, a short celebration window of about 3.5 seconds precedes the next challenge.
- When time expires, the server posts the answer in chat and advances automatically.
- Team scores sum their players' points. Results rank individual players by score and compare Red and Blue totals for team matches.
- Tab changes or window focus loss can trigger a penalty of up to 200 points, without taking a player's score below zero. Use the built-in toolkit while playing.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the full application with Vite development middleware |
| `npm run lint` | Run TypeScript checking with `tsc --noEmit` |
| `npm run build` | Compile the frontend into `dist/` |
| `npm start` | Run `server.ts`; set `NODE_ENV=production` to serve `dist/` |
| `npm run preview` | Preview the compiled frontend only; does not start the game server |
| `npm run clean` | Remove `dist/` and `server.js` using a Unix shell command |

There is currently no dedicated automated test script. The `lint` command performs type checking rather than style linting.

## Project structure

```text
.
├── server.ts                       # Express routes, WebSockets, rooms, timers, bots, scoring
├── src/
│   ├── App.tsx                     # Lobby, active match, and results routing
│   ├── main.tsx                    # React entry point
│   ├── index.css                   # Global styles
│   ├── components/
│   │   ├── LobbyView.tsx           # Room creation, joining, invitations, team setup
│   │   ├── CTFPlayScreen.tsx       # Riddles, timer, flags, focus monitoring
│   │   ├── CTFVictoryScreen.tsx    # Final scores and celebration
│   │   ├── CyberToolkit.tsx        # Encoding, decoding, and analysis helpers
│   │   ├── ChatAndReactions.tsx    # Room chat and reactions
│   │   └── GlobalLeaderboard.tsx   # Browser-local rankings and history
│   ├── data/ctfChallenges.ts       # Challenge banks and randomized deck selection
│   ├── hooks/useGameSocket.ts     # WebSocket connection and game actions
│   ├── types/game.ts              # Shared game and message types
│   └── utils/sound.ts             # Browser audio cues
├── netlify.toml                   # Static deployment and SPA fallback
├── vite.config.ts                # React, Tailwind, and development configuration
└── package.json                  # Dependencies and scripts
```

## Architecture and data

The browser connects to `/ws` on its current host, using `ws://` for HTTP and `wss://` for HTTPS. JSON messages handle room actions, flags, chat, reactions, and game-state updates. Express and the WebSocket server share the same HTTP server.

Room state, players, chat, scores, and timers are held in the Node process's memory. Restarting the server removes active rooms. Multiple independent server instances do not share game state.

The browser stores profile preferences and cumulative leaderboard data in `localStorage`, and room/player identifiers for reconnection in `sessionStorage`. The component named `GlobalLeaderboard` displays this browser's saved results; it is not a shared online leaderboard. The client retries disconnected WebSocket connections after approximately 1.5 seconds, but session recovery depends on the room still existing on the server.

### HTTP routes

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/api/health` | Return server status, active-room count, and time |
| GET | `/api/rooms` | Return current room objects |
| GET | `/api/rooms/:code` | Return a room, or 404 if it does not exist |
| POST / GET | `/api/rooms/:code/start` | Force-start an existing room, or return 404 |

These routes are implemented in `server.ts`. The room routes return full room state, and the start endpoint changes game state without authentication. Room codes and focus monitoring are gameplay conveniences rather than security controls; challenge answers also ship in the source and room state. The current implementation is suited to casual educational play rather than adversarial competitions.

## Deployment

### Full multiplayer application

Use a Node.js host that supports a long-running process and WebSocket upgrades. Build the frontend, then run the server in production mode:

```bash
npm install
npm run build
NODE_ENV=production npm start
```

The last command uses macOS/Linux shell syntax. On other platforms, configure `NODE_ENV` through the host or shell before running `npm start`.

Keep the source files and dependencies needed by `tsx` available at runtime; there is no separate compiled server bundle. The host may supply `PORT`. If using a reverse proxy, forward both HTTP requests and WebSocket upgrades, including `/ws`, to the same Node server. Use HTTPS with secure WebSockets for public access.

### Current Netlify setup

The configured build command is `npm run build`, the publish directory is `dist`, and `netlify.toml` includes an SPA fallback to `index.html`.

This static deployment does **not** run `server.ts` or supply its `/ws` and `/api` endpoints. A successful frontend deployment alone therefore does not enable room creation or multiplayer. The client currently connects to its own host and has no configurable backend URL. A split deployment requires additional client connection configuration or routing to a separately hosted WebSocket backend.

The repository's Netlify configuration currently pins Node 20. Vite 8 requires at least Node 20.19 or 22.12; align the deployment runtime with a supported version when configuring hosting.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Connection indicator stays offline | Start the full server with `npm run dev`, rather than Vite alone or `npm run preview`. Ensure `/ws` reaches the server. |
| Frontend loads on Netlify but rooms do not work | The current deployment is static; see the multiplayer hosting requirements above. |
| Another device cannot connect | Use the host's LAN address, check the selected port, and allow it through the firewall. `localhost` refers to each device itself. |
| Room disappears after a restart | Rooms are stored only in server memory. Create a new room. |
| Scores differ across browsers | Cumulative history is browser-local, not synchronized between devices. |
| Toolkit clipboard or hashing features fail | Use localhost or HTTPS and check browser permissions and Web Crypto support. |
| Switching tabs clears an answer | Focus monitoring resets input and hints and may apply a score penalty. |

## Contributing

Keep changes focused and describe the behavior they address. Run `npm run lint` and manually verify relevant flows with two browser sessions against the same server before submitting changes.

To add a challenge, update the appropriate tier array in `src/data/ctfChallenges.ts` and follow the `CTFChallenge` interface in `src/types/game.ts`. Supply a unique ID, category, difficulty, prompt/story, artifact, hint, accepted answers, point value, and explanation. Verify that the intended answer is accepted during gameplay.

## License

No license file is currently included in this repository. Contact the repository owner for permission before reusing or redistributing the code.
