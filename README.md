# Animated Timeline for WordPress
A lightweight WordPress plugin that creates an elegant animated SVG timeline that responds to scroll position.

**Showcase / Installation: German**
[![Showcase](https://img.youtube.com/vi/RRZYlECIz6w/0.jpg)](https://www.youtube.com/watch?v=RRZYlECIz6w)

# Features
- Scroll-triggered timeline progression
- Customizable
  - Colors
  - Both solid + dashed paths
  - Adjustable path curvature and positioning

# Requirements
- WordPress 5.0 or higher
- A theme with position: relative on the body element:
```css
body {
    position: relative;
}
```

# Installation
1. Upload the plugin files to /wp-content/plugins/nxt-timeline/
2. Activate the plugin through the WordPress plugins screen
3. Navigate to Settings → Animated Timeline to configure appearance
4. Add the svg-target class to elements you want to connect in your timeline

# Usage
### Basic Implementation
```html
<div class="svg-target">First timeline point</div>
<div class="svg-target">Second timeline point</div>
<div class="svg-target">Third timeline point</div>
```

### Configuration Options
- Timeline Stops
  - Offset X/Y: Adjust the position of timeline markers
  - Element Type: Choose between circle, square, or no markers
  - Element Stroke Width: Set the thickness of marker outlines

- Path Appearance
  - Path Style: Solid or dashed line
  - Path Width: Thickness of the timeline path
  - Path Colors: Separate colors for static and animated portions
  - Dash Settings: Customize length and gap for dashed style

- Path Shape
  - Curve Roundness: Control the smoothness of path bends
  - Vertical/Horizontal Offset: Adjust path positioning
  - Y-Correction: Fine-tune the ending position
 
# Color Configuration
Colors can be set using either:
- Direct color values (hex, rgb, rgba)
- CSS Variables for dynamic theming

Using CSS Variables:
```css
:root {
    --timeline-color: #25536E;
    --marker-color: #6c1300;
}
```
