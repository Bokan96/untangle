# Untangle (Planarity Game)

<<<<<<< Updated upstream
Untangle is a small puzzle game based on the **Planarity** concept popularized by John Tantalo and Jason Davies.  
The objective is simple: **rearrange nodes so that no edges intersect.**
=======
Untangle is a graph puzzle based on the classic **Planarity** game by John Tantalo (with the web version popularized by Jason Davies). The goal is simple: **move the dots until no two lines cross.**

Every puzzle is generated from a planar graph, so it can always be solved.
>>>>>>> Stashed changes

Play it here:  
https://bojanbozovic.com/untangle/

<<<<<<< Updated upstream
## How to Play

- **Drag nodes** to move them around the board.
- **Remove intersections** by positioning nodes so that lines do not cross.
- **Visual feedback**
  - Red lines: intersections
  - Blue lines: valid connections
- **Win condition:** the **Crossings** counter reaches **0**.
=======
1. **Drag the dots** with your mouse or finger. You don't need to hit a dot exactly, since touches grab the nearest dot.
2. **Red lines cross** another line. Blue lines are fine.
3. **Untangle everything.** When you let go with 0 crossings the board turns green and you can go to the next level, which adds one more dot.

Use **− / +** to choose between 4 and 30 dots, and **New** for a fresh puzzle of the same size. Turn off **Show crossings** for a harder game where you have to spot the tangles yourself.

## ✨ Features

* Works on phones, tablets and desktops (touch, pen and mouse, including multi-touch).
* Tracks crossings, moves and time. The timer starts on your first move.
* Remembers your puzzle size and the hint setting between visits.
* Plain HTML/CSS/JS with no dependencies or build step.

## 📁 Files

| File | Purpose |
| --- | --- |
| `index.html` | Page layout |
| `style.css` | Styles, including the small-screen layout |
| `game.js` | Graph generation, crossing detection, dragging, timer and win logic |

## 🚀 Play on GitHub Pages

1. On GitHub, open the repository's **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Pick the `main` branch and the `/ (root)` folder, then click **Save**.
4. After a minute or two, the link to your game appears at the top of the Pages settings.

## 🛠️ Local Development

Clone the repository and open `index.html` in any modern browser. No server or build tools are needed.
>>>>>>> Stashed changes
