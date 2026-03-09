(function () {
	'use strict';

	const targetSelector = nxtTimelineOptions.target_selector || nxtTimelineOptions.target_class || '.svg-target';
	const offsetX = nxtTimelineOptions.offset_x ? parseInt(nxtTimelineOptions.offset_x) : 40;

	let svg = null;
	let svgTargets = [];
	let offsetY = 0;
	let initialRenderDone = false;
	let resizeTimeout;
	let ticking = false;
	let nxtInitialized = false;

	function getOffsetY() {
		return nxtTimelineOptions.offset_y ? parseInt(nxtTimelineOptions.offset_y) : 20;
	}

	function createSvgBackground() {
		const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svgElement.setAttribute('width', '100%');
		svgElement.setAttribute('height', '100%');
		svgElement.setAttribute('class', 'nxt-svg-timeline');

		const htmlMarginTop = parseFloat(window.getComputedStyle(document.documentElement).marginTop);

		Object.assign(svgElement.style, {
			top: `-${htmlMarginTop}px`,
			left: '0',
			bottom: '0',
			right: '0',
			'pointer-events': 'none',
			'user-select': 'none',
			'z-index': 1,
			position: 'absolute'
		});

		document.body.appendChild(svgElement);
		return svgElement;
	}

	function getOrCreateSvg() {
		return document.querySelector('.nxt-svg-timeline') ?? createSvgBackground();
	}

	function updateSvgPath() {
		svgTargets = document.querySelectorAll(targetSelector);
		svg = getOrCreateSvg();

		while (svg.firstChild) {
			svg.removeChild(svg.firstChild);
		}

		createSvgPath();
		createSvgPathStop();
	}

	function createSvgPath() {
		if (!svgTargets.length) return;

		let d = '';
		let prevX = 0;
		let prevY = 0;

		const roundness = parseInt(nxtTimelineOptions.path_curve_roundness) || 80;
		const verticalOffset = parseInt(nxtTimelineOptions.path_curve_vertical_offset) || 85;
		const horizontalOffset = parseInt(nxtTimelineOptions.path_curve_horizontal_offset) || 100;
		const correctLastY = parseInt(nxtTimelineOptions.path_curve_correct_last_y) || 0;

		svgTargets.forEach((target, index) => {
			const { x, y } = target.getBoundingClientRect();
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

		createPath(d, false);
		const animatedPath = createPath(d, true);
		animatePath(animatedPath);
	}

	function animatePath(path) {
		if (!svgTargets.length) return;

		const pathLength = path.getTotalLength();
		path.style.strokeDasharray = pathLength;
		path.style.strokeDashoffset = pathLength;

		const firstTargetY = svgTargets[0].getBoundingClientRect().top + window.scrollY;
		const lastTargetY = svgTargets[svgTargets.length - 1].getBoundingClientRect().top + window.scrollY;

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
				path.style.strokeDashoffset = 0;
			}
		});
	}

	function createPath(d, animated) {
		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttribute('d', d);
		path.setAttribute('fill', 'none');

		const pathColor = getColorValue(animated ? 'animated_path_color' : 'path_color');
		path.setAttribute('stroke', pathColor);

		const pathWidth = animated ? (nxtTimelineOptions.animated_path_width || '3') : (nxtTimelineOptions.path_width || '3');
		path.setAttribute('stroke-width', pathWidth);
		path.setAttribute('stroke-linejoin', 'round');
		path.setAttribute('stroke-linecap', 'round');

		if (!animated && nxtTimelineOptions.path_style === 'dashed') {
			const dashLength = nxtTimelineOptions.path_dash_length || 4;
			const dashGap = nxtTimelineOptions.path_dash_gap || 4;
			path.setAttribute('stroke-dasharray', `${dashLength},${dashGap}`);
		}

		const borderRadius = nxtTimelineOptions.path_border_radius || 0;
		if (borderRadius > 0) {
			path.style.borderRadius = `${borderRadius}px`;
		}

		svg.appendChild(path);
		return path;
	}

	function createSvgPathStop() {
		if (nxtTimelineOptions.element_type === 'none') return;

		const promises = Array.from(svgTargets).map((target) => {
			return new Promise((resolve) => {
				const { x, y } = target.getBoundingClientRect();
				const xPos = x - offsetX;
				const yPos = y + window.scrollY + offsetY;

				let element;

				if (nxtTimelineOptions.element_type === 'custom' && nxtTimelineOptions.custom_svg_url) {
					element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
					element.setAttribute('transform', `translate(${xPos}, ${yPos})`);

					fetch(nxtTimelineOptions.custom_svg_url)
						.then(response => response.text())
						.then(svgContent => {
							const parser = new DOMParser();
							const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
							const svgElement = svgDoc.documentElement;

							const viewBox = svgElement.getAttribute('viewBox');
							const [, , vbWidth, vbHeight] = viewBox ? viewBox.split(' ').map(Number) : [0, 0, 100, 100];
							const aspectRatio = vbWidth / vbHeight;
							const width = parseInt(nxtTimelineOptions.custom_svg_width) || 20;
							const height = width / aspectRatio;

							svgElement.setAttribute('width', width);
							svgElement.setAttribute('height', height);
							element.setAttribute('transform', `translate(${xPos - width / 2}, ${yPos - height / 2})`);
							element.appendChild(svgElement);
							resolve(element);
						})
						.catch(error => {
							console.error('Error loading custom SVG:', error);
							resolve(null);
						});
				} else if (nxtTimelineOptions.element_type === 'square') {
					element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
					element.setAttribute('x', xPos - 5);
					element.setAttribute('y', yPos - 5);
					element.setAttribute('width', '10');
					element.setAttribute('height', '10');
					resolve(element);
				} else {
					element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
					element.setAttribute('cx', xPos);
					element.setAttribute('cy', yPos);
					element.setAttribute('r', 5);
					resolve(element);
				}

				if (element && nxtTimelineOptions.element_type !== 'custom') {
					element.setAttribute('fill', getColorValue('element_fill_color') || '#ffffff');
					element.setAttribute('stroke', getColorValue('element_stroke_color') || '#6c1300');
					element.setAttribute('stroke-width', nxtTimelineOptions.element_stroke_width || '4');
					element.setAttribute('data-timeline-y', yPos);
				}
			});
		});

		Promise.all(promises).then(elements => {
			elements.forEach(element => {
				if (!element) return;

				const transitionDuration = nxtTimelineOptions.scroll_effect_transition || 300;
				if (element.tagName.toLowerCase() === 'g') {
					const firstChild = element.firstElementChild;
					if (firstChild) firstChild.style.transition = `all ${transitionDuration}ms ease-in-out`;
				} else {
					element.style.transition = `all ${transitionDuration}ms ease-in-out`;
				}

				svg.appendChild(element);

				if (nxtTimelineOptions.invert_scroll_effect) {
					applyScrollEffect(element);
				}
			});

			if (nxtTimelineOptions.enable_scroll_effect) {
				window.addEventListener('scroll', handleScroll);
				handleScroll();
			}
		});
	}

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
		if (!svg) return;
		const scrollPosition = window.scrollY + window.innerHeight / 2;
		const timelineElements = svg.querySelectorAll('[data-timeline-y]');

		timelineElements.forEach(element => {
			const elementPosition = parseFloat(element.getAttribute('data-timeline-y'));
			if (nxtTimelineOptions.invert_scroll_effect) {
				scrollPosition > elementPosition ? removeScrollEffect(element) : applyScrollEffect(element);
			} else {
				scrollPosition > elementPosition ? applyScrollEffect(element) : removeScrollEffect(element);
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
				if (element.tagName.toLowerCase() !== 'g') setElementStyle(element, 'filter', 'invert(100%)');
				break;
			case 'grayscale':
				setElementStyle(element, 'filter', 'grayscale(100%)');
				break;
			case 'custom':
				setElementStyle(element, 'filter', nxtTimelineOptions.scroll_effect_custom_filter || '');
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
			const firstChild = element.firstElementChild;
			if (firstChild) {
				firstChild.style.transition = transition;
				firstChild.style[property] = value;
			}
		} else {
			element.style.transition = transition;
			element.style[property] = value;
		}
	}

	function getColorValue(fieldName) {
		const type = nxtTimelineOptions[fieldName + '_type'] || 'color';
		if (type === 'css_var') {
			return nxtTimelineOptions[fieldName + '_css_var'] || '';
		}
		return nxtTimelineOptions[fieldName] || '';
	}

	function initVisibilityObserver() {
		if (!svgTargets.length) return;

		const observerOptions = {
			root: null,
			rootMargin: '0px',
			threshold: [0, 0.1, 0.5, 1]
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				entry.isIntersecting
					? entry.target.classList.add('is-visible')
					: entry.target.classList.remove('is-visible');
			});
		}, observerOptions);

		svgTargets.forEach(target => observer.observe(target));

		let scrollTicking = false;
		function handleScrollForVisibility() {
			if (!scrollTicking) {
				window.requestAnimationFrame(() => {
					updateVisibilityClasses();
					scrollTicking = false;
				});
				scrollTicking = true;
			}
		}

		window.addEventListener('scroll', handleScrollForVisibility, { passive: true });
		window.addEventListener('resize', handleScrollForVisibility, { passive: true });
		updateVisibilityClasses();
	}

	function updateVisibilityClasses() {
		const scrollPosition = window.scrollY + window.innerHeight / 2;
		svgTargets.forEach(target => {
			const elementTop = window.scrollY + target.getBoundingClientRect().top;
			scrollPosition > elementTop
				? target.classList.add('scrolled-past')
				: target.classList.remove('scrolled-past');
		});
	}

	function nxtTimelineInit() {
		offsetY = getOffsetY();
		svgTargets = document.querySelectorAll(targetSelector);

		if (svgTargets.length > 0) {
			svg = getOrCreateSvg();
			updateSvgPath();
			initialRenderDone = true;
			initVisibilityObserver();
		} else {
			const domObserver = new MutationObserver(function () {
				svgTargets = document.querySelectorAll(targetSelector);
				if (svgTargets.length > 0) {
					domObserver.disconnect();
					svg = getOrCreateSvg();
					updateSvgPath();
					initialRenderDone = true;
					initVisibilityObserver();
				}
			});
			domObserver.observe(document.body, { childList: true, subtree: true });
		}

		const bodyResizeObserver = new ResizeObserver(() => {
			if (!initialRenderDone) return;
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				offsetY = getOffsetY();
				updateSvgPath();
			}, 250);
		});
		bodyResizeObserver.observe(document.body);

		document.addEventListener('click', (event) => {
			if (event.target.classList.contains('toc-toggle-icon')) {
				setTimeout(function () {
					if (svg) {
						while (svg.firstChild) svg.removeChild(svg.firstChild);
					}
					createSvgPath();
					createSvgPathStop();
				}, 350);
			}
		});
	}

	function nxtTimelineTrigger() {
		if (nxtInitialized) return;
		nxtInitialized = true;
		try {
			nxtTimelineInit();
		} catch (e) {
			console.error('[NXT] nxtTimelineInit crashed:', e);
		}
	}

	if (document.readyState !== 'loading') {
		nxtTimelineTrigger();
	} else {
		document.addEventListener('DOMContentLoaded', nxtTimelineTrigger);
	}
})();
