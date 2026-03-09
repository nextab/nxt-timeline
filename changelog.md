# 2026-03-08 — Version 1.2

## Fixed script initialization on pages with many elements
- Rewrapped all JavaScript in an IIFE to prevent conflicts with other plugins and avoid top-level code running before `document.body` exists
- Fixed crash caused by `createSvgBackground()` and `ResizeObserver` executing during script parse when DOM was not yet ready
- Replaced `window.onload` assignment with a proper `DOMContentLoaded` listener pattern to ensure the script initializes reliably regardless of when it is loaded by the browser

## Added per-page CSS selector override
- New post meta field `_nxt_timeline_selector` allows overriding the global target selector on a per-page basis
- Override is editable directly in the Gutenberg Document Settings sidebar under "Timeline Selector"
- Global selector (configured in Settings → Animated Timeline) is used as fallback when the field is empty

## Fixed asset cache busting
- Frontend script version now uses `filemtime()` instead of the hardcoded `'1.0'` string, ensuring browsers always load the latest version after an update

# 2024-08-31
## Added a scroll handler for timeline stops
- it is now possible to apply effects when scrolling past a timeline stop (e.g. change its color to black and white)
- scroll effects can be inverted, so it's possible to first apply a custom filter and then remove it when scrolling past the respective item
- upload for custom .svg files now uses WordPress media library instead of the previous hacky solution
- renamed timeline.js to nxt-timeline.js to avoid naming conflicts with other plugins

## Added functionality to add a custom .svg as a timeline stop
- You no longer have to choose between a circle, a rectangle or no item for a timeline stop, you can now upload your own custom svg file
- Option to set the width of the uploaded .svg file to properly customize the look of the timeline
- Moved all inline JS for the WordPress admin options page to a dedicated file (/js/nxt-timeline-admin.js) to clean up the code (a little)
- Improved UI as options that are not in use (e.g. color of timeline stop when a custom .svg is in use) will now appear greyed out / disabled
