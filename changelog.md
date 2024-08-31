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
