/*
	Adapted for Ghibli-Inspired Portfolio
	Original Design: Strata by HTML5 UP (html5up.net | @ajlkn)
	CCA 3.0 license (html5up.net/license)
*/

(function($) {
	var $window = $(window),
		$body = $('body'),
		$header = $('#header'),
		$footer = $('#footer'),
		$main = $('#main'),
		settings = {
			// Disable parallax for Ghibli theme (using GSAP animations instead)
			parallax: false
		};

	// Breakpoints (unchanged, but we'll use these for responsive behavior)
	breakpoints({
		xlarge:  [ '1281px',  '1800px' ],
		large:   [ '981px',   '1280px' ],
		medium:  [ '737px',   '980px'  ],
		small:   [ '481px',   '736px'  ],
		xsmall:  [ null,      '480px'  ],
	});

	// Play initial animations on page load
	$window.on('load', function() {
		window.setTimeout(function() {
			$body.removeClass('is-preload');
			
			// Initialize Ghibli-themed elements
			initGhibliElements();
		}, 100);
	});

	// Touch device detection (simplified)
	if (browser.mobile) {
		$body.addClass('is-touch');
		
		// Reduce animation intensity on mobile
		$body.addClass('is-mobile');
	}

	// Footer positioning (adapted for new layout)
	breakpoints.on('<=medium', function() {
		$footer.insertAfter($main);
	});

	breakpoints.on('>medium', function() {
		$footer.appendTo('body'); // Changed from header to body for new design
	});

	// Initialize Ghibli-themed elements
	function initGhibliElements() {
		// Remove original parallax behavior
		if (settings.parallax) {
			$window.off('scroll.strata_parallax');
		}

		// Form submission handler (for your contact form)
		setupForm();
		
		// Initialize typing animation
		initTypingEffect();
	}

	// Contact form handling
	function setupForm() {
		const form = $("form");
		const msg = $("#form-message");
		
		if (form.length) {
			form.on("submit", async function(e) {
				e.preventDefault();
				try {
					const res = await fetch(form.attr("action"), {
						method: "POST",
						body: new FormData(form[0]),
						headers: { 'Accept': 'application/json' }
					});
					
					if (res.ok) {
						form.trigger("reset");
						msg.css("display", "block");
						
						// Ghibli-themed success animation
						gsap.to(msg, {
							scale: 1.2,
							duration: 0.5,
							yoyo: true,
							repeat: 1,
							ease: "power1.inOut"
						});
					}
				} catch (error) {
					console.error('Form submission error:', error);
				}
			});
		}
	}

	// Typing animation for header text
	function initTypingEffect() {
		const typedElement = $(".typed");
		if (typedElement.length) {
			const text = typedElement.text();
			typedElement.text("");
			
			let i = 0;
			const typingInterval = setInterval(() => {
				if (i < text.length) {
					typedElement.text(typedElement.text() + text.charAt(i));
					i++;
				} else {
					clearInterval(typingInterval);
				}
			}, 100);
		}
	}

	// No longer using the lightbox gallery from original (#two section)
	// Removed poptrox initialization since not in your new design

})(jQuery);
