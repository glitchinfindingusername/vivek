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
			parallax: false // disabled; we use simple animations instead
		};

	// Breakpoints
	breakpoints({
		xlarge:  [ '1281px',  '1800px' ],
		large:   [ '981px',   '1280px' ],
		medium:  [ '737px',   '980px'  ],
		small:   [ '481px',   '736px'  ],
		xsmall:  [ null,      '480px'  ],
	});

	// On load
	$window.on('load', function() {
		window.setTimeout(function() {
			$body.removeClass('is-preload');
			initSite();
		}, 100);
	});

	// Touch/mobile flags
	if (browser.mobile) {
		$body.addClass('is-touch is-mobile');
	}

	// Footer placement
	breakpoints.on('<=medium', function() { $footer.insertAfter($main); });
	breakpoints.on('>medium',  function() { $footer.appendTo('body'); });

	/* =========================
	   Init
	========================= */
	function initSite() {
		if (settings.parallax) $window.off('scroll.strata_parallax');

		setupForm();              // main contact form
		initTypingEffect();       // optional typed heading
		initPhoneRequestModal();  // request number modal (with fun lines)
		initEarlyLifeModal();     // NEW: early life modal
	}

	/* =========================
	   Contact form (main)
	   -> Native submit to FormSubmit (no AJAX/CORS).
	========================= */
	function setupForm() {
		const form = $('form[data-form="contact"], #contact form')
			.filter(':not(#phoneRequestForm)')
			.first();
		if (!form.length) return;

		form.on('submit', function () {
			// quick visual feedback; page will navigate
			const $submit = form.find('[type="submit"]').first();
			if ($submit.length) {
				$submit.prop('disabled', true)
				       .html('<i class="fas fa-spinner fa-spin"></i> Sending...');
			}
		});
	}

	/* =========================
	   Typing effect
	========================= */
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

	/* =========================
	   Request Mobile Number modal
	   -> Fun re-click lines on invalid submit
	   -> Native submit when valid (no AJAX)
	   -> Pause GSAP while open to reduce load
	========================= */
	function initPhoneRequestModal() {
		const $btn    = $('#openPhoneRequest');
		const $modal  = $('#phoneRequestModal');
		const $close  = $('#closePhoneRequest');
		const $form   = $('#phoneRequestForm');
		const $submit = $('#phoneRequestSubmit');

		if (!$btn.length || !$modal.length) return;

		const open = () => {
			$modal.addClass('open').attr('aria-hidden', 'false');
			$body.addClass('modal-open');
			// Reduce background load
			if (window.gsap?.globalTimeline) gsap.globalTimeline.pause();
			setTimeout(() => $form.find('input[name="name"]').trigger('focus'), 50);
		};
		const close = () => {
			$modal.removeClass('open').attr('aria-hidden', 'true');
			$body.removeClass('modal-open');
			if (window.gsap?.globalTimeline) gsap.globalTimeline.resume();
		};

		$btn.on('click', open);
		if ($close.length) $close.on('click', close);
		$modal.on('click', (e) => { if (e.target === $modal[0]) close(); });
		$(document).on('keydown', (e) => { if (e.key === 'Escape' && $modal.hasClass('open')) close(); });

		// Submit (funny lines + native submit)
		if ($form.length) {
			let lastAttempt = { name: "", phone: "", reason: "" };
			let repeatClicks = 0;
			const funLines = [
				"The button works. Your fields don’t.",
				"Blank forms don’t call back. Pinky promise.",
				"Try typing. It’s wildly effective.",
				"Pro tip: text goes inside the boxes."
			];

			$form.on('submit', function (e) {
				const name   = $.trim($form.find('[name="name"]').val());
				const phone  = $.trim($form.find('[name="requester_phone"]').val());
				const reason = $.trim($form.find('[name="reason"]').val());

				// If any field is empty → block submit, show playful messages
				if (!name || !phone || !reason) {
					e.preventDefault();

					// Same empty state again? rotate lines; else reset counter
					if (lastAttempt.name === name && lastAttempt.phone === phone && lastAttempt.reason === reason) {
						repeatClicks++;
					} else {
						repeatClicks = 1; // first playful message
					}
					const msg = funLines[(repeatClicks - 1) % funLines.length];
					if ($submit.length) {
						$submit.text(msg);
						setTimeout(() => $submit.text('Submit Request'), 1600);
					}
					lastAttempt = { name, phone, reason };
					return;
				}

				// Valid → native submit (no preventDefault)
				repeatClicks = 0;
				lastAttempt = { name: "", phone: "", reason: "" };
				if ($submit.length) {
					$submit.html('<i class="fas fa-spinner fa-spin"></i> Sending...');
				}
			});
		}
	}

	/* =========================
	   Early Life & Leadership modal (NEW)
	========================= */
	function initEarlyLifeModal() {
		const $modal = $('#earlyLifeModal');
		if (!$modal.length) {
			// still make link non-breaking: if there's a trigger but no modal, do nothing special
			return;
		}

		const $openBtn = $('#openEarlyLife'); // optional dedicated trigger
		const $close   = $('#closeEarlyLife');
		const $frame   = $('#elFrame');

		// Also intercept any anchor linking to early-life.html
		$('a[href$="early-life.html"]').on('click', function(e) {
			e.preventDefault();
			open();
		});

		if ($openBtn.length) $openBtn.on('click', open);
		if ($close.length)   $close.on('click', close);

		$modal.on('click', (e) => { if (e.target === $modal[0]) close(); });
		$(document).on('keydown', (e) => { if (e.key === 'Escape' && $modal.hasClass('open')) close(); });

		let loaded = false;
		function open() {
			$modal.addClass('open').attr('aria-hidden','false');
			$body.addClass('modal-open');

			// Lazy-load iframe once
			if (!loaded && $frame.length) {
				const src = $frame.attr('data-src');
				if (src) $frame.attr('src', src);
				loaded = true;
			}
		}
		function close() {
			$modal.removeClass('open').attr('aria-hidden','true');
			$body.removeClass('modal-open');
		}
	}

	// (Gallery/lightbox removed for this design)

})(jQuery);
