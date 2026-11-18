# Reddit launch posts: HotTake

Six text posts, each written for its subreddit's rules (checked 18 Nov 2026). r/indiegames is skipped: it bans
generative AI entirely and does not allow website links in promotion posts.

AI disclosure (required by r/IndieGaming, and kept truthful for every sub): code and art were made with AI assistance.

---

## 1. r/localmultiplayergames

Rules that matter: same-room shared-screen play must be the focus; self-promotion at most every other week; games
overly reliant on AI may be removed at the moderators' discretion.

**Title**
I made a free couch party console: one laptop on the TV, everyone's phone is the controller (32 games, 1 to 8 players)

**Body**

HotTake is a free party-game console I built for game nights without enough controllers.

You run it on a Windows laptop hooked up to the TV, and everyone in the room scans a QR code with their phone. The
phone becomes a controller (joystick and buttons, or simple taps, depending on the game). Everything happens on the
one shared screen in front of you, so it's proper same-room local multiplayer, just without buying more pads.

What's in it:

- 32 games built in: arena brawlers, platformer races, bluffing and dice games, golf, tanks, rhythm rowing, and a few
  co-op survival games (Night Siege, Last Light, Star Convoy, Cartastrophe)
- 1 to 8 players depending on the game, plus a tournament mode across several games
- No app to install on the phones, no accounts, nothing online: the laptop hosts it all over your Wi-Fi

It's free: https://hotake.pranshubasak.site

Full disclosure: I'm a solo dev and used AI assistance for both the code and the art.

I'd love to hear which game your group ends up playing most, and what's missing for your game nights.

---

## 2. r/playmygame

Flair: [PC] (Windows). Rules that matter: free and playable now; direct link to the game first; say your role; be truthful; one post per
month. Mods recommend their "Make a Post" button; if the API post is removed, repost with it.

**Title**
HotTake: a free Windows party-game console where phones are the controllers (32 local multiplayer games)

**Body**

**Play it (free):** https://hotake.pranshubasak.site/download

**My role:** I'm the solo developer. I designed and built HotTake, with AI assistance for the code and the art.

**What it is:** HotTake turns a Windows laptop into a party-game console. Put it on a TV or a big screen, and up to
8 friends scan a QR code with their phones. Each phone becomes that player's controller in the browser, no app or
account needed. 32 games ship in the installer: brawlers, races, bluffing and dice games, golf, tanks and co-op
survival.

**What I'd love feedback on:**

- Did every phone connect on the first try? (Same Wi-Fi as the laptop is required.)
- Which games felt fun, and which felt confusing in the first minute?
- Anything about setup that made you stop.

Windows 10 or 11 for the host; any recent iPhone or Android browser for players. Thanks for playing!

---

## 3. r/IndieGaming

Rules that matter: account at least a week old with posting history; one submission every two weeks; GenAI use
must be declared; no bare download links without context.

**Title**
My solo project HotTake turns a laptop into a party console and every phone into a controller

**Body**

HotTake is a free party-game console for Windows. The laptop runs the games on your TV, and friends join by scanning
a QR code, so their phones become controllers right in the browser. No app, no accounts, no cloud server.

It ships with 32 games for 1 to 8 players: arena brawlers like Ricochet Tanks and Bombermoji, races like Lava Rise,
bluffing with Bluff Cup, mini golf in Putt Panic, and co-op survival in Night Siege.

**GenAI disclosure:** I used AI assistance to write the code and to create the art.

Site and download: https://hotake.pranshubasak.site

If you try it with friends, I'd really like to know which game you played first and whether joining was smooth.

---

## 4. r/CoOpGaming

Rules that matter: flair required (using "Game Promotion"); explain how the co-op works (player count, local or online).

**Title**
HotTake: free local co-op and party games for 1 to 8 players, using phones as controllers on one shared screen

**Body**

**How the co-op works:** local, same room, one shared screen. One Windows laptop runs the games on the TV, and each
player uses their own phone as the controller after scanning a QR code. No app, no accounts. (Online play is
possible too if you set up your own tunnel, but local is the main way to play.)

**Co-op games included:**

- **Night Siege** (1 to 6): five nights of survival, holding the fire together
- **Last Light** (1 to 8): co-op platforming survival
- **Star Convoy** (2 to 8): co-op space shooter
- **Cartastrophe** (1 to 6): one shift, one store, everyone on the floor

Plus 28 versus and party games (brawlers, races, bluffing, golf) for when the team needs a break from teamwork.

Free download: https://hotake.pranshubasak.site

I'm the solo developer, and I used AI assistance for the code and art. Feedback on the co-op games especially
welcome.

---

## 5. r/IndieDev

Flair: Informative. Rules that matter: very open; only capsule-comparison posts are restricted (to Wednesdays).

**Title**
I shipped a party-game console where the laptop hosts everything and phones join from a QR code. Here's how it works

**Body**

HotTake is my free Windows party-game console: the laptop is the console and every phone is a controller. A few
of the decisions behind it, for anyone building something similar:

- **Phones are just browsers.** The laptop serves the controller page itself, so players scan a QR code and they're
  in. No app store, no accounts, nothing in the cloud.
- **Rust host core in a Tauri 2 app.** axum and tokio handle rooms, seats and the phone WebSockets, with a WebRTC
  path (webrtc-rs) for input. The desktop window is an ordinary web page, which made the whole thing easy to debug in
  a normal browser.
- **Games are sandboxed web bundles.** Each of the 32 games runs in its own iframe on a separate origin with a
  strict CSP, and talks to the host only through a small screen SDK (`party.input(id)`, `setController`, `send`).
  That kept one broken game from taking down the console.
- **Controller layouts per game.** A game declares the controller it wants (joystick, buttons, taps) and the phone
  swaps layout when the game starts.

Full disclosure: I used AI assistance for the code and the art.

Site, docs and the free download: https://hotake.pranshubasak.site

Happy to answer questions about the networking or the SDK.

---

## 6. r/SideProject

Rules that matter: none published beyond Reddit's sitewide rules; the sub is for sharing and getting feedback.

**Title**
I built HotTake, a free party-game console for Windows where phones are the controllers

**Body**

My side project: HotTake turns a laptop into a party-game console. Put it on the TV,
friends scan a QR code, and their phones become the controllers. No app, no account, no cloud.

- 32 games built in, for 1 to 8 players
- Everything runs locally on the laptop over your own Wi-Fi
- Free, Windows 10 or 11 for the host

Built solo, with AI assistance for the code and art. It also launches on Product Hunt this Saturday, 21 November.

https://hotake.pranshubasak.site

I'd love honest feedback on the site and the first-run experience: what would stop you from trying it at your next
game night?

---

## 7. Your profile (u/Fast_Entertainer_882)

**Title**
HotTake is out: a free party-game console where your laptop runs the games and every phone is a controller

**Body**

I made HotTake, a free party-game console for Windows. Put the laptop on the TV, friends scan a QR code, and their
phones become the controllers. No app, no accounts, no cloud: everything runs on the laptop over your Wi-Fi.

32 games for 1 to 8 players: brawlers, races, bluffing and dice games, golf, tanks and co-op survival.

Made solo, with AI assistance for the code and art. Launching on Product Hunt on Saturday 21 November.

Download: https://hotake.pranshubasak.site

---

## Result (18 Nov 2026, posted together via Composio from u/Fast_Entertainer_882, 1 karma)

| Post | Status right after posting |
|---|---|
| r/localmultiplayergames `1xzogup` | Removed by the subreddit's moderators or AutoModerator (hidden) |
| r/playmygame | Not posted: the subreddit requires its own template (100+ word description) |
| r/IndieGaming `1xzoh5q` | Removed by Reddit's sitewide spam filter (hidden) |
| r/CoOpGaming `1xzohb4` | Removed by Reddit's sitewide spam filter (hidden) |
| r/IndieDev `1xzohfi` | Removed by Reddit's sitewide spam filter (hidden) |
| r/SideProject `1xzohjk` | Removed by Reddit's sitewide spam filter (hidden) |
| u/Fast_Entertainer_882 `1xzoho2` | Live |
