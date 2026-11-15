// Everything the /creator page says about Pranshu. Edit freely: LinkedIn couldn't be read
// automatically (it needs a login), so the bio below is drafted from the HotTake project itself.
export const creator = {
  name: "Pranshu Basak",
  role: "Software developer · creator of HotTake",
  photo: null as string | null, // e.g. "/creator/pranshu.jpg" once you add a photo to public/creator/
  bio: [
    "I'm a software developer who likes building things people use together in the same room. HotTake started as a simple question: why does every party game need everyone to buy a controller, install an app or make an account?",
    "So I built a console out of the laptop you already own. The host is written in Rust and runs entirely on your machine: it serves the phone controller, handles rooms and seats, and moves input over WebRTC so a dropped packet never stalls the next one. The games run in a sandbox and talk to the platform through a tiny SDK, which means anyone can make one.",
    "Most of the 32 games are my own designs. The rest are open-source games I ported and credited, because good party games deserve a bigger sofa.",
  ],
  stack: ["Rust", "Tauri", "WebRTC", "TypeScript", "Canvas & WebGL", "three.js", "Next.js", "Supabase"],
  timeline: [
    { date: "Nov 2026", title: "Research and design", body: "Studied how phone-as-controller platforms work, then wrote the spec: no game server, nothing in the cloud." },
    { date: "Nov 2026", title: "Wave 1 · the console", body: "Rust host, WebRTC input, the Spotlight lobby, online play through a Cloudflare Tunnel, and the first five games." },
    { date: "Nov 2026", title: "Wave 2 · developer tools", body: "Zip import, dev folders, the debug dock and the starter template, plus fourteen new games." },
    { date: "Nov 2026", title: "Wave 3 · co-op and tournaments", body: "Two big co-op ports on one shared screen and Tournament mode with live standings." },
    { date: "Nov 2026", title: "Wave 4 · 32 games", body: "Ten more games, a full games redo, and the first public release." },
  ],
};
