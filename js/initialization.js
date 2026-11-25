$(document).ready(function() {
	initialize();
});
function initialize(a) {
	window.rush = 1;
	window.lastTime = Date.now();
	window.iframHasLoaded = false;
	// [OSS Playground 수정] 블록 색상 테마 변경: 빨강/노랑/파랑/초록 -> 핑크/보라/민트/오렌지
	// colors 배열만 바꾸면 안 되고, 아래 3개의 색상 매핑 테이블도 같은 색으로 맞춰야
	// 시작 화면의 흐린 블록(tinted)과 저장된 게임 불러오기(rgbToHex)가 정상 동작한다.
	window.colors = ["#ff6b9d", "#9b59b6", "#1abc9c", "#ff9f43"];
	window.hexColorsToTintedColors = {
		"#ff6b9d": "rgb(255,181,206)",
		"#9b59b6": "rgb(205,172,218)",
		"#1abc9c": "rgb(140,222,206)",
		"#ff9f43": "rgb(255,207,161)"
	};

	window.rgbToHex = {
		"rgb(255,107,157)": "#ff6b9d",
		"rgb(155,89,182)": "#9b59b6",
		"rgb(26,188,156)": "#1abc9c",
		"rgb(255,159,67)": "#ff9f43"
	};

	window.rgbColorsToTintedColors = {
		"rgb(255,107,157)": "rgb(255,181,206)",
		"rgb(155,89,182)": "rgb(205,172,218)",
		"rgb(26,188,156)": "rgb(140,222,206)",
		"rgb(255,159,67)": "rgb(255,207,161)"
	};

	window.hexagonBackgroundColor = 'rgb(236, 240, 241)';
	window.hexagonBackgroundColorClear = 'rgba(236, 240, 241, 0.5)';
	window.centerBlue = 'rgb(44,62,80)';
	window.angularVelocityConst = 4;
	window.scoreOpacity = 0;
	window.textOpacity = 0;
	window.prevGameState = undefined;
	window.op = 0;
	window.saveState = localStorage.getItem("saveState") || "{}";
	if (saveState !== "{}") {
		op = 1;
	}

	window.textShown = false;
	window.requestAnimFrame = (function() {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
			window.setTimeout(callback, 1000 / framerate);
		};
	})();
	$('#clickToExit').bind('click', toggleDevTools);
	window.settings;
	if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        $('.rrssb-email').remove();
		settings = {
			os: "other",
			platform: "mobile",
			startDist: 227,
			creationDt: 60,
			baseScale: 1.4,
			scale: 1,
			prevScale: 1,
			baseHexWidth: 87,
			hexWidth: 87,
			baseBlockHeight: 20,
			blockHeight: 20,
			rows: 7,
			speedModifier: 0.73,
			speedUpKeyHeld: false,
			creationSpeedModifier: 0.73,
			comboTime: 310
		};
	} else {
		settings = {
			os: "other",
			platform: "nonmobile",
			baseScale: 1,
			startDist: 340,
			creationDt: 9,
			scale: 1,
			prevScale: 1,
			hexWidth: 65,
			baseHexWidth: 87,
			baseBlockHeight: 20,
			blockHeight: 15,
			rows: 8,
			speedModifier: 0.5, // [OSS Playground 수정] 0.65 -> 0.5 : 블록 낙하 속도 감소(초보자용)
			speedUpKeyHeld: false,
			creationSpeedModifier: 0.5, // [OSS Playground 수정] 0.65 -> 0.5 : 블록 생성 간격 증가
			comboTime: 310
		};

	}
	if(/Android/i.test(navigator.userAgent)) {
		settings.os = "android";
	}

	if(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)){
		settings.os="ios";
	}

	window.canvas = document.getElementById('canvas');
	window.ctx = canvas.getContext('2d');
	window.trueCanvas = {
		width: canvas.width,
		height: canvas.height
	};
	scaleCanvas();

	window.framerate = 60;
	window.history = {};
	window.score = 0;
	window.scoreAdditionCoeff = 1;
	window.prevScore = 0;
	window.numHighScores = 3;

	highscores = [];
	if (localStorage.getItem('highscores')) {
		try {
			highscores = JSON.parse(localStorage.getItem('highscores'));
		} catch (e) {
			highscores = [];
		}
	}
	window.blocks = [];
	window.MainHex;
	window.gdx = 0;
	window.gdy = 0;
	window.devMode = 0;
	window.lastGen = undefined;
	window.prevTimeScored = undefined;
	window.nextGen = undefined;
	window.spawnLane = 0;
	window.importing = 0;
	window.importedHistory = undefined;
	window.startTime = undefined;
	window.gameState;
	setStartScreen();
	if (a != 1) {
		window.canRestart = 1;
		window.onblur = function(e) {
			if (gameState == 1) {
				pause();
			}
		};
		$('#startBtn').off();
		if (settings.platform == 'mobile') {
			$('#startBtn').on('touchstart', startBtnHandler);
		} else {
			$('#startBtn').on('mousedown', startBtnHandler);
		}

		document.addEventListener('touchmove', function(e) {
			e.preventDefault();
		}, false);
		$(window).resize(scaleCanvas);
		$(window).unload(function() {

			if (gameState == 1 || gameState == -1 || gameState === 0) localStorage.setItem("saveState", exportSaveState());
			else localStorage.setItem("saveState", "{}");
		});

		addKeyListeners();
		(function(i, s, o, g, r, a, m) {
			i['GoogleAnalyticsObject'] = r;
			i[r] = i[r] || function() {
				(i[r].q = i[r].q || []).push(arguments)
			}, i[r].l = 1 * new Date();
			a = s.createElement(o), m = s.getElementsByTagName(o)[0];
			a.async = 1;
			a.src = g;
			m.parentNode.insertBefore(a, m)
		})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
		ga('create', 'UA-51272720-1', 'teamsnowman.github.io');
		ga('send', 'pageview');

		document.addEventListener("pause", handlePause, false);
		document.addEventListener("backbutton", handlePause, false);
		document.addEventListener("menubutton", handlePause, false); //menu button on android

		setTimeout(function() {
			if (settings.platform == "mobile") {
				try {
					document.body.removeEventListener('touchstart', handleTapBefore, false);
				} catch (e) {

				}

				try {
					document.body.removeEventListener('touchstart', handleTap, false);
				} catch (e) {

				}

				document.body.addEventListener('touchstart', handleTapBefore, false);
			} else {
				try {
					document.body.removeEventListener('mousedown', handleClickBefore, false);
				} catch (e) {

				}

				try {
					document.body.removeEventListener('mousedown', handleClick, false);
				} catch (e) {

				}

				document.body.addEventListener('mousedown', handleClickBefore, false);
			}
		}, 1);
	}
}

function startBtnHandler() {
	setTimeout(function() {
		if (settings.platform == "mobile") {
			try {
				document.body.removeEventListener('touchstart', handleTapBefore, false);
			} catch (e) {

			}

			try {
				document.body.removeEventListener('touchstart', handleTap, false);
			} catch (e) {

			}

			document.body.addEventListener('touchstart', handleTap, false);
		} else {
			try {
				document.body.removeEventListener('mousedown', handleClickBefore, false);
			} catch (e) {

			}

			try {
				document.body.removeEventListener('mousedown', handleClick, false);
			} catch (e) {

			}

			document.body.addEventListener('mousedown', handleClick, false);
		}
	}, 5);

	if (!canRestart) return false;

	if ($('#openSideBar').is(':visible')) {
		$('#openSideBar').fadeOut(150, "linear");
	}

	if (importing == 1) {
		init(1);
		checkVisualElements(0);
	} else {
		resumeGame();
	}
}

function handlePause() {
	if (gameState == 1 || gameState == 2) {
		pause();
	}
}

function handleTap(e) {
	handleClickTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
}

function handleClick(e) {
	handleClickTap(e.clientX, e.clientY);
}

function handleTapBefore(e) {
	var x = e.changedTouches[0].clientX;
	var y = e.changedTouches[0].clientY;

	if (x < 120 && y < 83 && $('.helpText').is(':visible')) {
		showHelp();
		return;
	}
}

function handleClickBefore(e) {
	var x = e.clientX;
	var y = e.clientY;

	if (x < 120 && y < 83 && $('.helpText').is(':visible')) {
		showHelp();
		return;
	}
}
