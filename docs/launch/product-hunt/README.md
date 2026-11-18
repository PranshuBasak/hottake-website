# Product Hunt launch kit: HotTake

Everything needed to create the launch with the Product Hunt MCP (`producthunt`, added at user scope).
Nothing has been created on Product Hunt yet.

## To continue (new session)

1. Start a new Claude Code session (the `producthunt` tools only load in a session started after it was added).
2. Connect your Product Hunt account when asked (type `/mcp`, choose `producthunt`, sign in).
3. Say: "Create the Product Hunt launch from `site/docs/launch/product-hunt/README.md`".
4. The session should: read `get_launch_context` (limits, eligibility, free launch dates, topics), `start_launch`
   for `https://hotake.pranshubasak.site`, upload the images with `prepare_launch_asset`, fill the fields with
   `update_launch`, and open the editor (`open_launch_editor`) so you can review it.
5. Submitting (`submit_launch`) makes it public on launch day. Only do that after you approve the final launch.

## Decisions for you

- **Launch day.** Product Hunt days start at 12:01 AM Pacific (1:31 PM India time). Tuesday to Thursday get the most
  traffic and the most competition; weekends are quieter and easier to rank on.
- **Tagline**: pick one below.
- **Launch-day posts**: your X, LinkedIn and Instagram are connected in treg, so launch-day posts can go out from
  there. Nothing is posted without your OK on the exact text.

## Fields

| Field | Value |
|---|---|
| Name | HotTake |
| Link | https://hotake.pranshubasak.site |
| Download link | https://hotake.pranshubasak.site/download |
| Pricing | Free |
| Platform | Windows (phones join from any browser) |
| Maker | Pranshu Basak, X [@pranshu_basak](https://x.com/pranshu_basak), [LinkedIn](https://www.linkedin.com/in/pranshubasak/) |
| Topics (check against `get_launch_context`) | Games, Windows, Indie Games |

### Tagline (max 60 characters)

1. `Your laptop is the console. Every phone is a controller.` (56, the site's own line; recommended)
2. `32 party games, played with the phones in your pocket` (53)
3. `Turn any Windows laptop into a party-game console` (49)

### Description (231 characters)

> Turn a Windows laptop into a party-game console. Friends scan a QR code and their phones become the controllers.
> No app, no account, no cloud server. 32 games for up to 8 players are built in: brawls, bluffs, races and co-op. Free.

### First comment (posted by you as the maker)

> Hey Product Hunt! I'm Pranshu, and I built HotTake for game nights where nobody has enough controllers.
>
> Install it on a Windows laptop, put it on the TV, and everyone scans a QR code. Their phone turns into the
> controller for whatever game is on screen: a joystick and buttons for arena brawlers, quick taps for board and
> dice games. There's no app to install, no accounts, and nothing goes through a cloud server: the laptop hosts
> everything on your own Wi-Fi.
>
> 32 games ship in the installer, for 1 to 8 players: bluffing, racing, golf, tanks, zombie co-op and more. A few
> are ports that keep their original licences and credits. Want to play with friends who aren't in the room? The
> docs show how to do that with your own tunnel.
>
> It's free. I'd love to hear which game your group plays first, and which one you'd want next.

## Images

Thumbnail (240×240): `thumbnail-240.png`

Gallery (2540×1520, Product Hunt's 1270×760 ratio at 2× for sharpness), in this order:

| File | Shows |
|---|---|
| `gallery-01-home.jpg` | Hero: "Your laptop is the console. Every phone is a controller." with the TV and phone controllers |
| `gallery-05-games-shelf.jpg` | "32 games, preloaded. Brawls, bluffs, races and co-op." with game covers |
| `gallery-02-games.jpg` | The full catalogue with player-count and genre filters |
| `gallery-03-game-page.jpg` | A game page (Beetle Ball): players, phone controls, cover art |
| `gallery-04-how-to-play.jpg` | "From download to first round in two minutes" setup guide |

A short gameplay video (a phone controlling a game on the TV) would help more than any screenshot, if you can record one.
