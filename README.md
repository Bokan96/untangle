# Untangle (Planarity Game)

Untangle is an interactive graph puzzle game based on the classic **Planarity** concept, originally popularized by John Tantalo and Jason Davies. The objective of the game is simple but challenging: **untangle a complex graph of interconnected vertices so that no lines intersect.**

## 🎮 How to Play

1. **Drag and Drop:** Click and drag the glowing nodes (vertices) around the screen.
2. **Untangle the Graph:** Your goal is to position all the nodes in such a way that **no two lines (edges) cross each other**.
3. **Visual Cues:** 
   - Tangled lines and intersecting nodes will glow red.
   - Properly placed lines and nodes will glow blue.
4. **Win Condition:** The game is won when the "Crossings" counter reaches 0. A victory pulse will celebrate your success!

## ✨ Features

* **Modern UI:** Features a sleek, modern glassmorphism UI overlay.
* **Real-time Stats:** Tracks your current crossings, total moves, and time elapsed.
* **Customizable Difficulty:** Adjust the number of vertices from 4 up to 25 to increase or decrease the challenge.
* **Dynamic Visualization:** Interactive D3-powered SVG graph that smoothly updates node and edge states as you play.

## 🚀 Play on GitHub Pages

This game can be played directly in your browser without any installation using GitHub Pages.

### How to enable GitHub Pages for this repository:

1. Go to your repository on GitHub.
2. Click on the **Settings** tab.
3. In the left sidebar, click on **Pages** (under the "Code and automation" section).
4. Under the **Build and deployment** section, look for the **Source** dropdown.
5. Select **Deploy from a branch**.
6. Under the **Branch** section, select your main branch (usually `main` or `master`) and keep the folder as `/ (root)`.
7. Click **Save**.
8. Wait a minute or two for GitHub to build the site. Once done, the link to your live game will appear at the top of the Pages settings!

## 🛠️ Local Development

If you want to run or edit this game locally:

1. Clone the repository to your local machine:
   ```bash
   git clone <your-repository-url>
   ```
2. Open the directory and simply open the `index.html` file in any modern web browser. No complex build tools or local servers are required!
