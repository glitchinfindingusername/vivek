/*
	Adapted for Ghibli-Inspired Portfolio
	Original Design: Strata by HTML5 UP (html5up.net | @ajlkn)
	CCA 3.0 license (html5up.net/license)
*/

(function($) {
	"use strict";

	var $window = $(window),
		$body   = $('body'),
		$header = $('#header'),
		$footer = $('#footer'),
		$main   = $('#main'),
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

		// Form submission handler (main contact form only; ignore phone request modal)
		setupForm();

		// Initialize typing animation
		initTypingEffect();

		// Initialize "Request Mobile Number" modal flow
		initPhoneRequestModal();
	}

	// Contact form handling (targets main contact form; excludes phone request modal)
	function setupForm() {
		// Prefer a specifically-marked contact form if present; else, take the first form that is not the phone request form.
		const form = $('form[data-form="contact"], #contact form').filter(':not(#phoneRequestForm)').first();
		const msg  = $("#form-message");

		if (!form.length) return;

		form.on("submit", async function(e) {
			e.preventDefault();

			// Submit UX: disable the submit for a moment
			const $submit = form.find('[type="submit"]').first();
			if ($submit.length) {
				$submit.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Sending...');
			}

			try {
				const res = await fetch(form.attr("action"), {
					method: "POST",
					body: new FormData(form[0]),
					headers: { 'Accept': 'application/json' }
				});

				if (res.ok) {
					form.trigger("reset");

					// Show message box if present
					if (msg.length) {
						msg.css("display", "block");
						// Ghibli-themed success animation
						if (typeof gsap !== 'undefined') {
							gsap.to(msg, {
								scale: 1.2,
								duration: 0.5,
								yoyo: true,
								repeat: 1,
								ease: "power1.inOut"
							});
						}
					}

					// Button success flash
					if ($submit.length) {
						$submit.html('<i class="fas fa-check"></i> Sent');
						setTimeout(() => $submit.prop('disabled', false).text('Send Message'), 1200);
					}
				} else {
					throw new Error('Network response not ok');
				}
			} catch (error) {
				console.error('Form submission error:', error);
				if ($submit.length) {
					$submit.html('<i class="fas fa-times"></i> Error');
					setTimeout(() => $submit.prop('disabled', false).text('Send Message'), 1500);
				}
			}
		});
	}

	// Typing animation for header text
	function initTypingEffect() {
		const typedElement = $(".typed");
		if (!typedElement.length) return;

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

	// Request Mobile Number modal (open/close + submit)
	function initPhoneRequestModal() {
		const $btn    = $('#openPhoneRequest');
		const $modal  = $('#phoneRequestModal');
		const $close  = $('#closePhoneRequest');
		const $form   = $('#phoneRequestForm');
		const $submit = $('#phoneRequestSubmit');

		// If button or modal are absent, skip
		if (!$btn.length || !$modal.length) return;

		const open = () => {
			$modal.addClass('open').attr('aria-hidden', 'false');
			$body.addClass('modal-open');
			// focus first field for accessibility
			setTimeout(() => $form.find('input[name="name"]').trigger('focus'), 50);
		};

		const close = () => {
			$modal.removeClass('open').attr('aria-hidden', 'true');
			$body.removeClass('modal-open');
		};

		// Open/close interactions
		$btn.on('click', open);
		if ($close.length) $close.on('click', close);

		// Click on overlay closes modal
		$modal.on('click', (e) => { if (e.target === $modal[0]) close(); });

		// ESC to close
		$(document).on('keydown', (e) => { if (e.key === 'Escape' && $modal.hasClass('open')) close(); });

		// Submit handler (FormSubmit via fetch; inline UX)
		if ($form.length) {
			$form.on('submit', async function(e) {
				// simple required validation
				const name   = $.trim($form.find('[name="name"]').val());
				const phone  = $.trim($form.find('[name="requester_phone"]').val());
				const reason = $.trim($form.find('[name="reason"]').val());

				if (!name || !phone || !reason) {
					e.preventDefault();
					if ($submit.length) {
						$submit.text('Please fill all fields');
						setTimeout(() => $submit.text('Submit Request'), 1600);
					}
					return;
				}

				// Nice UX while sending (prevent redirect)
				e.preventDefault();
				if ($submit.length) $submit.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Sending...');

				try {
					const res = await fetch($form.attr('action'), {
						method: 'POST',
						body: new FormData($form[0]),
						headers: { 'Accept': 'application/json' }
					});

					if (res.ok) {
						$form[0].reset();
						if ($submit.length) $submit.html('<i class="fas fa-check"></i> Sent');
						setTimeout(() => {
							close();
							if ($submit.length) $submit.prop('disabled', false).text('Submit Request');
						}, 1200);
					} else {
						throw new Error('Network response not ok');
					}
				} catch (err) {
					console.error('Phone request submit error:', err);
					if ($submit.length) {
						$submit.html('<i class="fas fa-times"></i> Error');
						setTimeout(() => { $submit.prop('disabled', false).text('Submit Request'); }, 1500);
					}
				}
			});
		}
	}

	// No longer using the lightbox gallery from original (#two section)
	// Removed poptrox initialization since not in your new design

})(jQuery);
