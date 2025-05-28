const svg = createSvgBackground();

function createSvgBackground() {
    const svgElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    );

    svgElement.setAttribute("width", "100%");
    svgElement.setAttribute("height", "100%");
    svgElement.setAttribute("class", "nxt-svg-timeline");

    const htmlMarginTop = parseFloat(window.getComputedStyle(document.documentElement).marginTop);

    Object.assign(svgElement.style, {
        top: `-${htmlMarginTop}px`,
        left: "0",
        bottom: "0",
        right: "0",
        "pointer-events": "none",
        "user-select": "none",
        "z-index": 1,
        position: "absolute"
    });

    document.body.appendChild(svgElement);

    return svgElement;
}

const svgTargets = document.querySelectorAll(".svg-target");
const offsetX = nxtTimelineOptions.offset_x ? parseInt(nxtTimelineOptions.offset_x) : 40;

// Function to calculate offsetY based on viewport width
function getOffsetY() {
	const adminOffsetY = nxtTimelineOptions.offset_y ? parseInt(nxtTimelineOptions.offset_y) : 20;
	return adminOffsetY;
	// return window.innerWidth > 980 ? (adminOffsetY + 45) : adminOffsetY;
}

// Initial offsetY
let offsetY = getOffsetY();

// Function to update SVG path
function updateSvgPath() {
    svg.innerHTML = ""; // Clear previous SVG content
    createSvgPath();
    createSvgPathStop();
}

// Handle window resize
let resizeTimeout;
const bodyResizeObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        offsetY = getOffsetY();
		updateSvgPath();
    }, 250); // 250ms debounce delay
});

bodyResizeObserver.observe(document.body);

// Initial setup
window.onload = function () {
    setTimeout(function () {
        updateSvgPath();
    }, 500);
};

document.addEventListener("click", (event) => {
    if (event.target.classList.contains("toc-toggle-icon")) {
        setTimeout(function () {
            svg.innerHTML = ""; // Clear previous SVG content
            createSvgPath();
            createSvgPathStop();
        }, 350);
    }
});

function createSvgPath() {
    let d = "";
    let prevX = 0;
    let prevY = 0;

    const roundness = parseInt(nxtTimelineOptions.path_curve_roundness) || 80;
    const verticalOffset = parseInt(nxtTimelineOptions.path_curve_vertical_offset) || 85;
    const horizontalOffset = parseInt(nxtTimelineOptions.path_curve_horizontal_offset) || 100;
	const correctLastY = parseInt(nxtTimelineOptions.path_curve_correct_last_y) || 0;

    svgTargets.forEach((target, index) => {
        const {x, y, height} = target.getBoundingClientRect();
        let xPos = x + window.scrollX - offsetX;
        let yPos = y + window.scrollY + offsetY;

        if (index === 0) {
            d += `M ${xPos} ${yPos}`;
        } else {
            if (prevX !== xPos) {
                const midY = yPos - verticalOffset;
                if (xPos < prevX) {
                    d += `L ${prevX} ${midY - roundness}`;
                    d += `Q ${prevX} ${midY}, ${prevX - roundness} ${midY}`;
                    d += `L ${xPos + horizontalOffset} ${midY}`;
					if (index === svgTargets.length - 1) {
						d += `Q ${xPos} ${midY}, ${xPos} ${midY + roundness + correctLastY}`;
					} else {
						d += `Q ${xPos} ${midY}, ${xPos} ${midY + roundness}`;
					}
                    
                } else {
                    d += `L ${prevX} ${midY - roundness}`;
                    d += `Q ${prevX} ${midY}, ${prevX + roundness} ${midY}`;
                    d += `L ${xPos - horizontalOffset} ${midY}`;
					if (index === svgTargets.length - 1) {
						d += `Q ${xPos} ${midY}, ${xPos} ${midY + roundness + correctLastY}`;
					} else {
                    	d += `Q ${xPos} ${midY}, ${xPos} ${midY + roundness}`;
					}
                }
            } else {
                d += ` L ${xPos} ${yPos}`;
            }
        }

        prevX = xPos;
        prevY = yPos;
    });

    createPath(d, false); // Dotted path
    const animatedPath = createPath(d, true); // Animated path
    animatePath(animatedPath);
}

function animatePath(path) {
    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;

    const firstTarget = svgTargets[0].getBoundingClientRect();
    const lastTarget = svgTargets[svgTargets.length - 1].getBoundingClientRect();

    const firstTargetY = firstTarget.top + window.scrollY;
    const lastTargetY = lastTarget.top + window.scrollY;

    window.addEventListener('scroll', function () {
        const scrollPosition = window.scrollY;
        const viewportHeight = window.innerHeight;
        const startAnimationY = firstTargetY - viewportHeight / 2;
        const endAnimationY = lastTargetY - viewportHeight / 2;

        if (scrollPosition >= startAnimationY && scrollPosition <= endAnimationY) {
            const scrollPercentage = (scrollPosition - startAnimationY) / (endAnimationY - startAnimationY);
            let newOffset = pathLength * (1 - scrollPercentage);
            newOffset = Math.max(0, Math.min(pathLength, newOffset));

            path.style.strokeDashoffset = newOffset;
        } else if (scrollPosition > endAnimationY) {
            // Ensure it reaches the end
            path.style.strokeDashoffset = 0;
        }
    });
}

function createPath(d, animated) {
    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    
    const pathColor = getColorValue(animated ? 'animated_path_color' : 'path_color');
    path.setAttribute("stroke", pathColor);
    
    const pathWidth = animated ? (nxtTimelineOptions.animated_path_width || "3") : (nxtTimelineOptions.path_width || "3");
    path.setAttribute("stroke-width", pathWidth);
    
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-linecap", "round");
    
    if (!animated && nxtTimelineOptions.path_style === 'dashed') {
        const dashLength = nxtTimelineOptions.path_dash_length || 4;
        const dashGap = nxtTimelineOptions.path_dash_gap || 4;
        path.setAttribute("stroke-dasharray", `${dashLength},${dashGap}`);
    }
    
    // Add border-radius
    const borderRadius = nxtTimelineOptions.path_border_radius || 0;
    if (borderRadius > 0) {
        path.style.borderRadius = `${borderRadius}px`;
    }
    
    svg.appendChild(path);
    return path;
}

function createSvgPathStop() {
    if (nxtTimelineOptions.element_type === 'none') return;

    const svgTargetsArray = Array.from(svgTargets);

    const promises = svgTargetsArray.map((target, index) => {
        return new Promise((resolve) => {
            const {x, y, height} = target.getBoundingClientRect();
            const xPos = x - offsetX;
            const yPos = y + window.scrollY + offsetY;

            let element;
            if (nxtTimelineOptions.element_type === 'custom' && nxtTimelineOptions.custom_svg_url) {
                element = document.createElementNS("http://www.w3.org/2000/svg", "g");
                element.setAttribute("transform", `translate(${xPos}, ${yPos})`);
                
                fetch(nxtTimelineOptions.custom_svg_url)
                    .then(response => response.text())
                    .then(svgContent => {
                        const parser = new DOMParser();
                        const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
                        const svgElement = svgDoc.documentElement;
                        
                        // Get the original viewBox
                        const viewBox = svgElement.getAttribute('viewBox');
                        const [, , vbWidth, vbHeight] = viewBox ? viewBox.split(' ').map(Number) : [0, 0, 100, 100];
                        
                        // Calculate the aspect ratio
                        const aspectRatio = vbWidth / vbHeight;
                        
                        // Set the width and calculate the height
                        const width = parseInt(nxtTimelineOptions.custom_svg_width) || 20;
                        const height = width / aspectRatio;
                        
                        // Set the new size
                        svgElement.setAttribute('width', width);
                        svgElement.setAttribute('height', height);
                        
                        // Adjust the position to center the SVG
                        element.setAttribute("transform", `translate(${xPos - width/2}, ${yPos - height/2})`);
                        
                        element.appendChild(svgElement);
                        resolve(element);
                    })
                    .catch(error => {
                        console.error('Error loading custom SVG:', error);
                        resolve(null);
                    });
            } else if (nxtTimelineOptions.element_type === 'square') {
                element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                element.setAttribute("x", xPos - 5);
                element.setAttribute("y", yPos - 5);
                element.setAttribute("width", "10");
                element.setAttribute("height", "10");
                resolve(element);
            } else {
                element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                element.setAttribute("cx", xPos);
                element.setAttribute("cy", yPos);
                element.setAttribute("r", 5);
                resolve(element);
            }

            if (element && nxtTimelineOptions.element_type !== 'custom') {
                element.setAttribute("fill", getColorValue('element_fill_color') || "#ffffff");
                element.setAttribute("stroke", getColorValue('element_stroke_color') || "#6c1300");
                element.setAttribute("stroke-width", nxtTimelineOptions.element_stroke_width || "4");
            }

            if (element) {
                // Add a data attribute to track the element's position
                element.setAttribute("data-timeline-y", yPos);
            }
        });
    });

    Promise.all(promises).then(elements => {
        elements.forEach(element => {
            if (element) {
                const transitionDuration = nxtTimelineOptions.scroll_effect_transition || 300;
                if (element.tagName.toLowerCase() === 'g') {
                    const firstChild = element.firstElementChild;
                    if (firstChild) {
                        firstChild.style.transition = `all ${transitionDuration}ms ease-in-out`;
                    }
                } else {
                    element.style.transition = `all ${transitionDuration}ms ease-in-out`;
                }
                svg.appendChild(element);
                
                // Initially apply the effect if inverted behavior is enabled
                if (nxtTimelineOptions.invert_scroll_effect) {
                    applyScrollEffect(element);
                }
            }
        });

        // If scroll effect is enabled, add scroll listener
        if (nxtTimelineOptions.enable_scroll_effect) {
            window.addEventListener('scroll', handleScroll);
            handleScroll(); // Initial check
        }
    });
}

let ticking = false;

function handleScroll() {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateElements();
            ticking = false;
        });
        ticking = true;
    }
}

function updateElements() {
    const scrollPosition = window.scrollY + window.innerHeight / 2; // Middle of the viewport
    const timelineElements = svg.querySelectorAll('[data-timeline-y]');

    timelineElements.forEach(element => {
        const elementPosition = parseFloat(element.getAttribute('data-timeline-y'));
        if (nxtTimelineOptions.invert_scroll_effect) {
            if (scrollPosition > elementPosition) {
                removeScrollEffect(element);
            } else {
                applyScrollEffect(element);
            }
        } else {
            if (scrollPosition > elementPosition) {
                applyScrollEffect(element);
            } else {
                removeScrollEffect(element);
            }
        }
    });
}

function applyScrollEffect(element) {
    const effectType = nxtTimelineOptions.scroll_effect_type || 'opacity';
    
    switch (effectType) {
        case 'opacity':
            setElementStyle(element, 'opacity', '0.5');
            break;
        case 'invert':
            if (element.tagName.toLowerCase() !== 'g') {
                setElementStyle(element, 'filter', 'invert(100%)');
            }
            break;
        case 'grayscale':
            setElementStyle(element, 'filter', 'grayscale(100%)');
            break;
        case 'custom':
            const customFilter = nxtTimelineOptions.scroll_effect_custom_filter || '';
            setElementStyle(element, 'filter', customFilter);
            break;
    }
}

function removeScrollEffect(element) {
    setElementStyle(element, 'opacity', '1');
    setElementStyle(element, 'filter', 'none');
}

function setElementStyle(element, property, value) {
    const transitionDuration = nxtTimelineOptions.scroll_effect_transition || 300;
    const transition = `${property} ${transitionDuration}ms ease-in-out`;

    if (element.tagName.toLowerCase() === 'g') {
        // For custom SVGs, apply the style to the first child (usually the SVG itself)
        const firstChild = element.firstElementChild;
        if (firstChild) {
            firstChild.style.transition = transition;
            firstChild.style[property] = value;
        }
    } else {
        // For circles and rectangles
        element.style.transition = transition;
        element.style[property] = value;
    }
}

function getColorValue(fieldName) {
    const type = nxtTimelineOptions[fieldName + '_type'] || 'color';
    if (type === 'css_var') {
        return nxtTimelineOptions[fieldName + '_css_var'] || '';
    } else {
        return nxtTimelineOptions[fieldName] || '';
    }
}