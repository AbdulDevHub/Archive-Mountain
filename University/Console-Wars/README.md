# Console Wars Exhibition

An interactive digital exhibition exploring the history of video game console competition from 1989-2005, featuring the iconic battles between Nintendo, Sega, Sony, and Microsoft.

![Console Wars Exhibition](assets/artifacts/Intro%20Image.jpg)

## Overview

The Console Wars Exhibition is an immersive web experience that chronicles one of the most transformative periods in gaming history. Through carefully curated artifacts, advertisements, hardware, and historical analysis, this project examines how corporate rivalry shaped not just the technology of gaming, but its cultural identity.

### Key Features

- **16 Curated Artifacts**: From the NES box art to the PlayStation 2 launch commercial, each artifact tells a story about technological innovation and marketing strategy
- **Interactive Media**: High-quality images and videos bring the era to life
- **Animated Landing Page**: A stunning 3D sphere animation welcomes visitors to the exhibition
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile viewing
- **Keyboard Navigation**: Use arrow keys to navigate through the exhibition
- **Image Lightbox**: Click any artifact image to view it in full-screen detail
- **Academic Citations**: Every artifact includes properly formatted source citations

## Technologies Used

- **HTML5/CSS3**: Semantic markup and modern styling
- **Vanilla JavaScript**: No framework dependencies for core functionality
- **Anime.js**: Smooth animations for the landing page sphere
- **Plyr.js**: Enhanced video player with custom theming
- **Lucide Icons**: Clean, modern iconography
- **Custom CSS Effects**: Materialize-inspired ripple effects and animations

## Project Structure

```txt
console-wars-exhibition/
├── index.html              # Landing page with animated sphere
├── exhibit.html            # Main exhibition slideshow
├── content.json           # Exhibition content and artifact data
├── assets/
│   ├── artifacts/         # Images and videos for all 16 artifacts
│   ├── cursors/           # Custom cursor graphics
│   └── favicon/           # Favicon files
├── scripts/
│   ├── main.js           # Core slideshow functionality
│   ├── sphere.js         # Landing page animation
│   └── materialize.js    # Ripple effect library
└── styles/
    ├── main.css          # Main exhibition styles
    ├── sphere.css        # Landing page styles
    └── effects.css       # Animation and effect styles
```

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A local web server (recommended for proper file loading)

### Installation

1. Clone or download this repository
2. Ensure all files maintain their directory structure
3. Serve the project using a local web server:

   **Using Python 3:**

   ```bash
   python -m http.server 8000
   ```

   **Using Node.js (http-server):**

   ```bash
   npx http-server
   ```

4. Open your browser and navigate to `http://localhost:8000`

### Direct File Access

While the project can be opened directly in a browser by double-clicking `index.html`, using a local server is recommended to avoid potential CORS issues with loading `content.json`.

## Usage

### Navigation

- **Mouse/Touch**: Click the Previous/Next buttons or pagination numbers
- **Keyboard**: Use left/right arrow keys to navigate between slides
- **Quick Jump**: Use the first/last buttons to skip to the beginning or end
- **Image Zoom**: Click any artifact image to view it in full-screen lightbox mode
- **Video Controls**: Videos use the Plyr player with play, volume, and fullscreen controls

### Exhibition Structure

1. **Introduction**: Overview of the console wars era and its significance
2. **16 Artifacts**: Chronologically arranged from NES (1985) to GameCube (2001)
3. **Each slide includes**:
   - High-quality media (image or video)
   - Historical context and analysis
   - Academic citations and sources

## Content Editing

The exhibition content is stored in `content.json` for easy updating. The structure includes:

```json
{
  "title": "Exhibition title",
  "intro": "Introduction text",
  "introImage": "path/to/image.jpg",
  "artifacts": [
    {
      "title": "Artifact title",
      "description": "Detailed description",
      "citations": ["Source 1", "Source 2"],
      "link": "path/to/media.jpg"
    }
  ]
}
```

To add or modify artifacts, simply edit this JSON file and refresh the exhibition.

## Design Philosophy

This project emphasizes:

- **Historical Accuracy**: All claims are supported by cited sources
- **Visual Impact**: High-quality media and modern design create an engaging experience
- **Accessibility**: Clear typography, sufficient contrast, and keyboard navigation
- **Performance**: Optimized assets and efficient JavaScript for smooth interactions
- **Responsiveness**: Seamless experience across all device sizes

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Credits

### Content & Research

- Artifact descriptions and historical analysis by [Your Name]
- Citations from Wikipedia, Computer History Museum, Wired, Polygon, and various gaming history sources

### Technical Implementation

- Anime.js by Julian Garnier
- Plyr.js by Sam Potts
- Lucide Icons by the Lucide community
- Ripple effects inspired by MaterializeCSS

### Fonts

- Orbitron by Matt McInerney (Google Fonts)
- Poppins by Indian Type Foundry (Google Fonts)

## License

This project is created for educational purposes. All artifact images, videos, and promotional materials are used under fair use for historical and educational commentary. Original sources are cited throughout the exhibition.

## Acknowledgments

Special thanks to the gaming historians, archivists, and communities who have preserved these important artifacts of gaming history.

---

**Note**: This exhibition is best experienced on a desktop or tablet for optimal viewing of the detailed artifact imagery and historical context.
