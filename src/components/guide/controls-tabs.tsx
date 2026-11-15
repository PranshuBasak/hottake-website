"use client";

import { Tabs } from "@/components/interior/tabs";

const PANELS: Record<string, { rows: [string, string][]; note: string }> = {
  phone: {
    note: "Every game sets up the phone pad it needs: a d-pad or joystick and up to four buttons. Buttons you hold (Grab, Fire…) show a ring.",
    rows: [
      ["Move", "D-pad or joystick (left thumb)"],
      ["Actions", "Up to 4 buttons, labelled per game (Jump, Dash, Fire…)"],
      ["Twin stick", "Night Siege: move left, aim right"],
      ["Pause", "Hold ⏸ on any phone"],
      ["Leader", "The first phone in also drives the lobby like a remote"],
    ],
  },
  pad: {
    note: "USB or Bluetooth pads with the standard mapping work out of the box. Mix them with phones in the same game.",
    rows: [
      ["Join", "Press Start (or A in the lobby) — you join as “Pad N”"],
      ["Leave", "Hold Select/Back for 0.8 s"],
      ["Move / aim", "Left stick or d-pad / right stick"],
      ["Buttons", "A, B, X, Y → buttons 1–4"],
      ["Pause", "Start"],
    ],
  },
  keyboard: {
    note: "Add extra keyboard players on the laptop under Options › Players. Two can share one keyboard.",
    rows: [
      ["Player A", "WASD + J (button 1) / K (button 2)"],
      ["Player B", "Arrow keys + . (button 1) / , (button 2)"],
      ["Lobby", "Arrows to choose, Enter to play"],
      ["Pause / Options", "Esc / O"],
      ["Fullscreen / Stats", "F11 / F3"],
    ],
  },
};

export function ControlsTabs() {
  return (
    <Tabs
      label="Controller type"
      defaultValue="phone"
      items={[
        { value: "phone", label: "Phone" },
        { value: "pad", label: "Gamepad" },
        { value: "keyboard", label: "Keyboard" },
      ]}
      className="w-full"
      panelClassName="p-5 sm:p-6"
      renderPanel={(v) => {
        const p = PANELS[v];
        return (
          <div>
            <p className="text-muted-foreground">{p.note}</p>
            <table className="mt-4 w-full text-sm">
              <tbody>
                {p.rows.map(([k, val]) => (
                  <tr key={k} className="border-t border-border">
                    <th scope="row" className="w-36 py-3 pr-4 text-left align-top font-semibold sm:w-40">
                      {k}
                    </th>
                    <td className="py-3 text-muted-foreground">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }}
    />
  );
}
