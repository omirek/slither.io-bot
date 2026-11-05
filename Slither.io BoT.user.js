// ==UserScript==
// @name         Slither.io BoT
// @namespace    http://slither.io/
// @version      1.0
// @description  Slither.io BoT
// @author       Ciastuuś
// @match        http://slither.com/io
// @grant        none
// ==/UserScript==

var domyslneOpcjeBota = {};

window.log = function() {
    if (window.logDebugowanie) {
        console.log.apply(console, arguments);
    }
};

var canvasUtil = window.canvasUtil = (function() {
    return {
        canvasRatio: {
            x: window.mc.width / window.ww,
            y: window.mc.height / window.hh
        },

        setMouseCoordinates: function(point) {
            window.xm = point.x;
            window.ym = point.y;
        },

        mouseToScreen: function(point) {
            var screenX = point.x + (window.ww / 2);
            var screenY = point.y + (window.hh / 2);
            return {
                x: screenX,
                y: screenY
            };
        },

        screenToCanvas: function(point) {
            var canvasX = window.csc *
                (point.x * canvasUtil.canvasRatio.x) - parseInt(window.mc.style.left);
            var canvasY = window.csc *
                (point.y * canvasUtil.canvasRatio.y) - parseInt(window.mc.style.top);
            return {
                x: canvasX,
                y: canvasY
            };
        },

        mapToMouse: function(point) {
            var mouseX = (point.x - window.slither.xx) * window.gsc;
            var mouseY = (point.y - window.slither.yy) * window.gsc;
            return {
                x: mouseX,
                y: mouseY
            };
        },

        mapToCanvas: function(point) {
            var c = canvasUtil.mapToMouse(point);
            c = canvasUtil.mouseToScreen(c);
            c = canvasUtil.screenToCanvas(c);
            return c;
        },

        circleMapToCanvas: function(circle) {
            var newCircle = canvasUtil.mapToCanvas(circle);
            return canvasUtil.circle(
                newCircle.x,
                newCircle.y,
                circle.radius * window.gsc
            );
        },


        point: function(x, y) {
            var p = {
                x: Math.round(x),
                y: Math.round(y)
            };

            return p;
        },


        rect: function(x, y, w, h) {
            var r = {
                x: Math.round(x),
                y: Math.round(y),
                width: Math.round(w),
                height: Math.round(h)
            };

            return r;
        },


        circle: function(x, y, r) {
            var c = {
                x: Math.round(x),
                y: Math.round(y),
                radius: Math.round(r)
            };

            return c;
        },


        fastAtan2: function(y, x) {
            const QPI = Math.PI / 4;
            const TQPI = 3 * Math.PI / 4;
            var r = 0.0;
            var angle = 0.0;
            var abs_y = Math.abs(y) + 1e-10;
            if (x < 0) {
                r = (x + abs_y) / (abs_y - x);
                angle = TQPI;
            } else {
                r = (x - abs_y) / (x + abs_y);
                angle = QPI;
            }
            angle += (0.1963 * r * r - 0.9817) * r;
            if (y < 0) {
                return -angle;
            }

            return angle;
        },


        setZoom: function(e) {

            if (window.gsc) {
                window.gsc *= Math.pow(0.9, e.wheelDelta / -120 || e.detail / 2 || 0);
                window.desired_gsc = window.gsc;
            }
        },


        resetZoom: function() {
            window.gsc = 0.9;
            window.desired_gsc = 0.9;
        },


        maintainZoom: function() {
            if (window.desired_gsc !== undefined) {
                window.gsc = window.desired_gsc;
            }
        },



        setBackground: function(url) {
            url = typeof url !== 'undefined' ? url : '/s/bg45.jpg';
            window.ii.src = url;
        },


        drawRect: function(rect, color, fill, alpha) {
            if (alpha === undefined) alpha = 1;

            var context = window.mc.getContext('2d');
            var lc = canvasUtil.mapToCanvas({
                x: rect.x,
                y: rect.y
            });

            context.save();
            context.globalAlpha = alpha;
            context.strokeStyle = color;
            context.rect(lc.x, lc.y, rect.width * window.gsc, rect.height * window.gsc);
            context.stroke();
            if (fill) {
                context.fillStyle = color;
                context.fill();
            }
            context.restore();
        },


        drawCircle: function(circle, color, fill, alpha) {
            if (alpha === undefined) alpha = 1;
            if (circle.radius === undefined) circle.radius = 5;

            var context = window.mc.getContext('2d');
            var drawCircle = canvasUtil.circleMapToCanvas(circle);

            context.save();
            context.globalAlpha = alpha;
            context.beginPath();
            context.strokeStyle = color;
            context.arc(drawCircle.x, drawCircle.y, drawCircle.radius, 0, Math.PI * 2);
            context.stroke();
            if (fill) {
                context.fillStyle = color;
                context.fill();
            }
            context.restore();
        },

        drawAngle: function(start, angle, color, fill, alpha) {
            if (alpha === undefined) alpha = 0.6;

            var context = window.mc.getContext('2d');

            context.save();
            context.globalAlpha = alpha;
            context.beginPath();
            context.moveTo(window.mc.width / 2, window.mc.height / 2);
            context.arc(window.mc.width / 2, window.mc.height / 2, window.gsc * 100, start, angle);
            context.lineTo(window.mc.width / 2, window.mc.height / 2);
            context.closePath();
            context.stroke();
            if (fill) {
                context.fillStyle = color;
                context.fill();
            }
            context.restore();
        },

        drawLine: function(p1, p2, color, width) {
            if (width === undefined) width = 5;

            var context = window.mc.getContext('2d');
            var dp1 = canvasUtil.mapToCanvas(p1);
            var dp2 = canvasUtil.mapToCanvas(p2);

            context.save();
            context.beginPath();
            context.lineWidth = width * window.gsc;
            context.strokeStyle = color;
            context.moveTo(dp1.x, dp1.y);
            context.lineTo(dp2.x, dp2.y);
            context.stroke();
            context.restore();
        },

        isLeft: function(start, end, point) {
            return ((end.x - start.x) * (point.y - start.y) -
                (end.y - start.y) * (point.x - start.x)) > 0;

        },

        getDistance2: function(x1, y1, x2, y2) {
            var distance2 = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
            return distance2;
        },

        getDistance2FromSnake: function(point) {
            point.distance = canvasUtil.getDistance2(window.slither.xx, window.slither.yy,
                point.xx, point.yy);
            return point;
        },

        pointInRect: function(point, rect) {
            if (rect.x <= point.x && rect.y <= point.y &&
                rect.x + rect.width >= point.x && rect.y + rect.height >= point.y) {
                return true;
            }
            return false;
        },

        circleIntersect: function(circle1, circle2) {
            var bothRadii = circle1.radius + circle2.radius;
            var dx = circle1.x - circle2.x;
            var dy = circle1.y - circle2.y;

            if (dx + bothRadii > 0 && dy + bothRadii > 0 &&
                dx - bothRadii < 0 && dy - bothRadii < 0) {

                var distance2 = canvasUtil.getDistance2(circle1.x, circle1.y, circle2.x, circle2.y);

                if (distance2 < bothRadii * bothRadii) {
                    if (window.wizualnyPromien) {
                        var collisionPointCircle = canvasUtil.circle(
                            ((circle1.x * circle2.radius) + (circle2.x * circle1.radius)) /
                            bothRadii,
                            ((circle1.y * circle2.radius) + (circle2.y * circle1.radius)) /
                            bothRadii,
                            5
                        );
                        canvasUtil.drawCircle(circle2, 'red', true);
                        canvasUtil.drawCircle(collisionPointCircle, 'cyan', true);
                    }
                    return true;
                }
            }
            return false;
        }
    };
})();

// Historia usprawnien:
// 1. Sledzenie predkosci glow i przewidywanie najblizszego zblizenia.
// 2. Ocena 16 kierunkow ucieczki na podstawie przeszkod i ruchomych glow.
// 3. Wykrywanie zwezajacych sie tras oraz warunkowy boost awaryjny.
// Kolejne etapy:
// 4. Dodac indeks przestrzenny, aby nie skanowac liniowo list slithers i foods.
// 5. Przewidywac ruch segmentow ciala, nie tylko glow przeciwnikow.
// 6. Kalibrowac progi na powtarzalnych scenariuszach i pomiarach przezywalnosci.
var bot = window.bot = (function() {
    return {
        isBotRunning: false,
        stanBota: true,
        lookForFood: false,
        collisionPoints: [],
        collisionAngles: [],
        predictedThreats: [],
        escapeObstacles: [],
        movingHeads: [],
        motionById: {},
        slitherMotion: null,
        escapeState: null,
        trapFrames: 0,
        scores: [],
        foodTimeout: undefined,
        sectorBoxSide: 0,
        scanRadius: 0,
        defaultAccel: 0,
        sectorBox: {},
        currentFood: {},
        opt: {
            targetFps: 30,
            arcSize: Math.PI / 8,
            mnoznikPromienia: 10,
            foodAccelSize: 60,
            foodAccelAngle: Math.PI / 3,
            foodFrames: 4,
            foodRoundSize: 5,
            foodRoundAngle: Math.PI / 8,
            foodSmallSize: 10,
            predictionHorizon: 0.5,
            maxTrackedSpeed: 500,
            escapeHorizon: 0.6,
            escapeSectors: 16,
            escapeSamples: 6,
            emergencyEscapeTime: 0.25,
            rearHeadAngle: 3 * Math.PI / 4,
            rearHeadDir: Math.PI / 2,
            zmianaPromieniaPlus: 5,
            zmianaPromieniaMinus: 25
        },
        MID_X: 0,
        MID_Y: 0,
        MAP_R: 0,

        getSnakeWidth: function(sc) {
            if (sc === undefined) sc = window.slither.sc;
            return Math.round(sc * 29.0);
        },

        trackMotion: function(previous, point, now) {
            var velocityX = 0;
            var velocityY = 0;
            var samples = 0;

            if (previous) {
                var elapsed = (now - previous.time) / 1000;
                if (elapsed >= 0.01 && elapsed <= 0.5) {
                    var measuredX = (point.xx - previous.x) / elapsed;
                    var measuredY = (point.yy - previous.y) / elapsed;
                    var measuredSpeed = Math.sqrt(measuredX * measuredX + measuredY * measuredY);

                    if (measuredSpeed <= bot.opt.maxTrackedSpeed) {
                        var blend = previous.samples > 0 ? 0.55 : 1;
                        var previousSpeed = Math.sqrt(
                            previous.vx * previous.vx + previous.vy * previous.vy);
                        if (previousSpeed > 30 && measuredSpeed > 30 &&
                            (previous.vx * measuredX + previous.vy * measuredY) /
                                (previousSpeed * measuredSpeed) < Math.cos(Math.PI / 3)) {
                            blend = 1;
                        }
                        velocityX = previous.vx * (1 - blend) + measuredX * blend;
                        velocityY = previous.vy * (1 - blend) + measuredY * blend;
                        samples = previous.samples + 1;
                    }
                }
            }

            return {
                x: point.xx,
                y: point.yy,
                time: now,
                vx: velocityX,
                vy: velocityY,
                samples: samples
            };
        },

        quickRespawn: function() {
            window.dead_mtm = 0;
            window.login_fr = 0;

            bot.isBotRunning = false;
            window.forcing = true;
            window.connect();
            window.forcing = false;
        },


        angleBetween: function(a1, a2) {
            var r1 = 0.0;
            var r2 = 0.0;

            r1 = (a1 - a2) % Math.PI;
            r2 = (a2 - a1) % Math.PI;

            return r1 < r2 ? -r1 : r2;
        },


        avoidHeadPoint: function(collisionPoint) {
            var cehang = canvasUtil.fastAtan2(
                collisionPoint.yy - window.slither.yy, collisionPoint.xx - window.slither.xx);
            var diff = bot.angleBetween(window.slither.ehang, cehang);

            if (Math.abs(diff) > bot.opt.rearHeadAngle) {
                var dir = diff > 0 ? -bot.opt.rearHeadDir : bot.opt.rearHeadDir;
                bot.changeHeading(dir);
            } else {
                bot.avoidCollisionPoint(collisionPoint);
            }
        },

        changeHeading: function(angle) {
            var heading = {
                x: window.slither.xx + 500 * bot.cos,
                y: window.slither.yy + 500 * bot.sin
            };

            var cos = Math.cos(-angle);
            var sin = Math.sin(-angle);

            window.goalCoordinates = {
                x: Math.round(
                    cos * (heading.x - window.slither.xx) -
                    sin * (heading.y - window.slither.yy) + window.slither.xx),
                y: Math.round(
                    sin * (heading.x - window.slither.xx) +
                    cos * (heading.y - window.slither.yy) + window.slither.yy)
            };

            canvasUtil.setMouseCoordinates(canvasUtil.mapToMouse(window.goalCoordinates));
        },

        avoidCollisionPoint: function(collisionPoint, ang) {
            if (ang === undefined || ang > Math.PI) {
                ang = Math.PI;
            }

            var end = {
                x: window.slither.xx + 2000 * bot.cos,
                y: window.slither.yy + 2000 * bot.sin
            };

            if (window.wizualnyPromien) {
                canvasUtil.drawLine({
                    x: window.slither.xx,
                    y: window.slither.yy
                },
                    end,
                    'orange', 5);
                canvasUtil.drawLine({
                    x: window.slither.xx,
                    y: window.slither.yy
                }, {
                    x: collisionPoint.xx,
                    y: collisionPoint.yy
                },
                    'red', 5);
            }

            var cos = Math.cos(ang);
            var sin = Math.sin(ang);

            if (canvasUtil.isLeft({
                x: window.slither.xx,
                y: window.slither.yy
            }, end, {
                x: collisionPoint.xx,
                y: collisionPoint.yy
            })) {
                sin = -sin;
            }

            window.goalCoordinates = {
                x: Math.round(
                    cos * (collisionPoint.xx - window.slither.xx) -
                    sin * (collisionPoint.yy - window.slither.yy) + window.slither.xx),
                y: Math.round(
                    sin * (collisionPoint.xx - window.slither.xx) +
                    cos * (collisionPoint.yy - window.slither.yy) + window.slither.yy)
            };

            canvasUtil.setMouseCoordinates(canvasUtil.mapToMouse(window.goalCoordinates));
        },


        sortDistance: function(a, b) {
            return a.distance - b.distance;
        },


        getAngleIndex: function(angle) {
            const ARCSIZE = bot.opt.arcSize;
            var index;

            if (angle < 0) {
                angle += 2 * Math.PI;
            }

            index = Math.round(angle * (1 / ARCSIZE));

            if (index === (2 * Math.PI) / ARCSIZE) {
                return 0;
            }
            return index;
        },


        addCollisionAngle: function(sp) {
            var ang = canvasUtil.fastAtan2(
                Math.round(sp.yy - window.slither.yy),
                Math.round(sp.xx - window.slither.xx));
            var aIndex = bot.getAngleIndex(ang);

            var actualDistance = Math.round(Math.pow(
                Math.sqrt(sp.distance) - sp.radius, 2));

            if (bot.collisionAngles[aIndex] === undefined) {
                bot.collisionAngles[aIndex] = {
                    x: Math.round(sp.xx),
                    y: Math.round(sp.yy),
                    ang: ang,
                    snake: sp.snake,
                    distance: actualDistance
                };
            } else if (bot.collisionAngles[aIndex].distance > actualDistance) {
                bot.collisionAngles[aIndex].x = Math.round(sp.xx);
                bot.collisionAngles[aIndex].y = Math.round(sp.yy);
                bot.collisionAngles[aIndex].ang = ang;
                bot.collisionAngles[aIndex].snake = sp.snake;
                bot.collisionAngles[aIndex].distance = actualDistance;
            }
        },


        getCollisionPoints: function() {
            var scPoint;
            var now = Date.now();
            var nextMotionById = {};

            bot.collisionPoints = [];
            bot.collisionAngles = [];
            bot.predictedThreats = [];
            bot.escapeObstacles = [];
            bot.movingHeads = [];
            bot.slitherMotion = bot.trackMotion(bot.slitherMotion, window.slither, now);

            for (var snake = 0, ls = window.slithers.length; snake < ls; snake++) {
                scPoint = undefined;

                if (window.slithers[snake].id !== window.slither.id &&
                    window.slithers[snake].alive_amt === 1) {
                    var other = window.slithers[snake];
                    var motionId = '$' + (other.id === undefined ? snake : other.id);
                    var motion = bot.trackMotion(bot.motionById[motionId], other, now);
                    nextMotionById[motionId] = motion;

                    var headDistance2 = canvasUtil.getDistance2(
                        window.slither.xx, window.slither.yy,
                        other.xx, other.yy);
                    if (headDistance2 <= bot.scanRadius * bot.scanRadius) {
                        scPoint = {
                            xx: other.xx,
                            yy: other.yy,
                            snake: snake,
                            radius: bot.getSnakeWidth(other.sc) / 2
                        };
                        canvasUtil.getDistance2FromSnake(scPoint);
                        bot.addCollisionAngle(scPoint);
                        bot.escapeObstacles.push({
                            x: scPoint.xx,
                            y: scPoint.yy,
                            radius: scPoint.radius
                        });
                        if (window.wizualnyPromien) {
                            canvasUtil.drawCircle(canvasUtil.circle(
                                    scPoint.xx,
                                    scPoint.yy,
                                    scPoint.radius),
                                'red', false);
                        }
                    }

                    var enemySpeed = Math.sqrt(motion.vx * motion.vx + motion.vy * motion.vy);
                    var ownSpeed = Math.sqrt(
                        bot.slitherMotion.vx * bot.slitherMotion.vx +
                        bot.slitherMotion.vy * bot.slitherMotion.vy);
                    var predictionRange = bot.scanRadius +
                        (enemySpeed + ownSpeed) * bot.opt.predictionHorizon;
                    if (headDistance2 <= predictionRange * predictionRange) {
                        bot.movingHeads.push({
                            x: other.xx,
                            y: other.yy,
                            vx: motion.vx,
                            vy: motion.vy,
                            radius: bot.getSnakeWidth(other.sc) / 2
                        });
                        var relativeX = other.xx - window.slither.xx;
                        var relativeY = other.yy - window.slither.yy;
                        var relativeVelocityX = motion.vx - bot.slitherMotion.vx;
                        var relativeVelocityY = motion.vy - bot.slitherMotion.vy;
                        var relativeSpeed2 = relativeVelocityX * relativeVelocityX +
                            relativeVelocityY * relativeVelocityY;
                        var closestTime = 0;

                        if (relativeSpeed2 > 1) {
                            closestTime = -(relativeX * relativeVelocityX +
                                relativeY * relativeVelocityY) / relativeSpeed2;
                            closestTime = Math.max(0, Math.min(
                                bot.opt.predictionHorizon, closestTime));
                        }

                        var closestX = relativeX + relativeVelocityX * closestTime;
                        var closestY = relativeY + relativeVelocityY * closestTime;
                        var closestDistance = Math.sqrt(closestX * closestX + closestY * closestY);
                        var enemyRadius = bot.getSnakeWidth(other.sc) / 2;
                        var dangerRadius = bot.snakeRadius * bot.opt.mnoznikPromienia + enemyRadius;

                        if (closestDistance <= dangerRadius) {
                            bot.predictedThreats.push({
                                x: other.xx + motion.vx * closestTime,
                                y: other.yy + motion.vy * closestTime,
                                time: closestTime,
                                distance: closestDistance,
                                clearance: closestDistance - dangerRadius,
                                snake: snake
                            });
                        }
                    }

                    for (var pts = 0, lp = other.pts.length; pts < lp; pts++) {
                        if (!other.pts[pts].dying &&
                            canvasUtil.pointInRect({
                                x: other.pts[pts].xx,
                                y: other.pts[pts].yy
                            }, bot.sectorBox)
                        ) {
                            var collisionPoint = {
                                xx: other.pts[pts].xx,
                                yy: other.pts[pts].yy,
                                snake: snake,
                                radius: bot.getSnakeWidth(other.sc) / 2
                            };

                            if (window.wizualnyPromien && true === false) {
                                canvasUtil.drawCircle(canvasUtil.circle(
                                        collisionPoint.xx,
                                        collisionPoint.yy,
                                        collisionPoint.radius),
                                    '#00FF00', false);
                            }

                            canvasUtil.getDistance2FromSnake(collisionPoint);
                            bot.addCollisionAngle(collisionPoint);
                            bot.escapeObstacles.push({
                                x: collisionPoint.xx,
                                y: collisionPoint.yy,
                                radius: collisionPoint.radius
                            });

                            if (scPoint === undefined ||
                                scPoint.distance > collisionPoint.distance) {
                                scPoint = collisionPoint;
                            }
                        }
                    }
                }
                if (scPoint !== undefined) {
                    bot.collisionPoints.push(scPoint);
                    if (window.wizualnyPromien) {
                        canvasUtil.drawCircle(canvasUtil.circle(
                            scPoint.xx,
                            scPoint.yy,
                            scPoint.radius
                        ), 'red', false);
                    }
                }
            }

            bot.motionById = nextMotionById;
            bot.predictedThreats.sort(function(a, b) {
                return a.clearance - b.clearance;
            });

            if (canvasUtil.getDistance2(bot.MID_X, bot.MID_Y, window.slither.xx, window.slither.yy) >
                Math.pow(bot.MAP_R - 1000, 2)) {
                var midAng = canvasUtil.fastAtan2(
                    window.slither.yy - bot.MID_X, window.slither.xx - bot.MID_Y);
                scPoint = {
                    xx: bot.MID_X + bot.MAP_R * Math.cos(midAng),
                    yy: bot.MID_Y + bot.MAP_R * Math.sin(midAng),
                    snake: -1,
                    radius: bot.snakeWidth
                };
                canvasUtil.getDistance2FromSnake(scPoint);
                bot.collisionPoints.push(scPoint);
                bot.addCollisionAngle(scPoint);
                bot.escapeObstacles.push({
                    x: scPoint.xx,
                    y: scPoint.yy,
                    radius: scPoint.radius
                });
                if (window.wizualnyPromien) {
                    canvasUtil.drawCircle(canvasUtil.circle(
                        scPoint.xx,
                        scPoint.yy,
                        scPoint.radius
                    ), 'yellow', false);
                }
            }

            bot.collisionPoints.sort(bot.sortDistance);
            if (window.wizualnyPromien) {
                for (var i = 0; i < bot.collisionAngles.length; i++) {
                    if (bot.collisionAngles[i] !== undefined) {
                        canvasUtil.drawLine({
                            x: window.slither.xx,
                            y: window.slither.yy
                        }, {
                            x: bot.collisionAngles[i].x,
                            y: bot.collisionAngles[i].y
                        },
                            '#99ffcc', 2);
                    }
                }
            }
        },

        findEscapePlan: function() {
            var sectorCount = bot.opt.escapeSectors;
            var sampleCount = bot.opt.escapeSamples;
            var measuredSpeed = Math.sqrt(
                bot.slitherMotion.vx * bot.slitherMotion.vx +
                bot.slitherMotion.vy * bot.slitherMotion.vy);
            var fallbackSpeed = (Number(window.slither.sp) || 0) * bot.opt.targetFps;
            var ownSpeed = Math.min(bot.opt.maxTrackedSpeed,
                Math.max(80, measuredSpeed || fallbackSpeed));
            var ownRadius = bot.snakeRadius * bot.opt.mnoznikPromienia;
            var bestAngle = window.slither.ang;
            var bestScore = -Infinity;
            var bestClearance = -Infinity;
            var straightClearance = -Infinity;
            var safePaths = 0;
            var safeClearance = ownRadius * 0.25;

            for (var direction = 0; direction < sectorCount; direction++) {
                var angle = window.slither.ang + direction * 2 * Math.PI / sectorCount;
                var directionX = Math.cos(angle);
                var directionY = Math.sin(angle);
                var minimumClearance = Infinity;

                for (var step = 1; step <= sampleCount; step++) {
                    var time = bot.opt.escapeHorizon * step / sampleCount;
                    var pathX = window.slither.xx + directionX * ownSpeed * time;
                    var pathY = window.slither.yy + directionY * ownSpeed * time;

                    for (var obstacle = 0; obstacle < bot.escapeObstacles.length; obstacle++) {
                        var fixed = bot.escapeObstacles[obstacle];
                        var fixedDistance = Math.sqrt(canvasUtil.getDistance2(
                            pathX, pathY, fixed.x, fixed.y));
                        minimumClearance = Math.min(minimumClearance,
                            fixedDistance - ownRadius - fixed.radius);
                    }

                    for (var head = 0; head < bot.movingHeads.length; head++) {
                        var moving = bot.movingHeads[head];
                        var movingX = moving.x + moving.vx * time;
                        var movingY = moving.y + moving.vy * time;
                        var movingDistance = Math.sqrt(canvasUtil.getDistance2(
                            pathX, pathY, movingX, movingY));
                        minimumClearance = Math.min(minimumClearance,
                            movingDistance - ownRadius - moving.radius);
                    }
                }

                if (minimumClearance === Infinity) {
                    minimumClearance = bot.scanRadius;
                }
                if (minimumClearance > safeClearance) {
                    safePaths++;
                }
                if (direction === 0) {
                    straightClearance = minimumClearance;
                }

                var turn = Math.atan2(
                    Math.sin(angle - window.slither.ang),
                    Math.cos(angle - window.slither.ang));
                var score = minimumClearance - Math.abs(turn) * ownRadius * 0.05;
                if (score > bestScore) {
                    bestScore = score;
                    bestAngle = angle;
                    bestClearance = minimumClearance;
                }
            }

            return {
                angle: bestAngle,
                bestClearance: bestClearance,
                straightClearance: straightClearance,
                safePaths: safePaths
            };
        },

        updateTrapState: function(plan) {
            var previous = bot.escapeState;
            var narrowing = previous && plan.safePaths <= 3 &&
                (plan.safePaths < previous.safePaths ||
                    plan.bestClearance < previous.bestClearance - bot.snakeRadius * 0.1);

            if (plan.safePaths <= 1 || narrowing) {
                bot.trapFrames++;
            } else {
                bot.trapFrames = Math.max(0, bot.trapFrames - 1);
            }

            bot.escapeState = {
                safePaths: plan.safePaths,
                bestClearance: plan.bestClearance
            };

            return plan.safePaths === 0 || bot.trapFrames >= 2;
        },

        getEscapeAcceleration: function(plan, urgent) {
            if (bot.defaultAccel || !urgent || plan.bestClearance <= 0 ||
                plan.bestClearance - plan.straightClearance <= bot.snakeRadius) {
                return bot.defaultAccel;
            }

            return 1;
        },

        steerToHeading: function(angle) {
            window.goalCoordinates = {
                x: Math.round(window.slither.xx + Math.cos(angle) * 2000),
                y: Math.round(window.slither.yy + Math.sin(angle) * 2000)
            };
            canvasUtil.setMouseCoordinates(canvasUtil.mapToMouse(window.goalCoordinates));
        },


        checkCollision: function() {
            var headCircle = canvasUtil.circle(
                window.slither.xx, window.slither.yy,
                bot.speedMult * bot.opt.mnoznikPromienia / 2 * bot.snakeRadius
            );

            var fullHeadCircle = canvasUtil.circle(
                window.slither.xx, window.slither.yy,
                bot.opt.mnoznikPromienia * bot.snakeRadius
            );

            if (window.wizualnyPromien) {
                canvasUtil.drawCircle(fullHeadCircle, 'red');
                canvasUtil.drawCircle(headCircle, 'blue', false);
            }

            bot.getCollisionPoints();
            var escapePlan = bot.findEscapePlan();
            var trapped = bot.updateTrapState(escapePlan);

            for (var i = 0; i < bot.collisionPoints.length; i++) {
                var collisionCircle = canvasUtil.circle(
                    bot.collisionPoints[i].xx,
                    bot.collisionPoints[i].yy,
                    bot.collisionPoints[i].radius
                );

                if (canvasUtil.circleIntersect(headCircle, collisionCircle)) {
                    window.setAcceleration(bot.getEscapeAcceleration(escapePlan, true));
                    bot.steerToHeading(escapePlan.angle);
                    return true;
                }


                if (bot.collisionPoints[i].snake !== -1) {
                    var enemyHeadCircle = canvasUtil.circle(
                        window.slithers[bot.collisionPoints[i].snake].xx,
                        window.slithers[bot.collisionPoints[i].snake].yy,
                        bot.collisionPoints[i].radius
                    );

                    if (canvasUtil.circleIntersect(fullHeadCircle, enemyHeadCircle)) {
                        window.setAcceleration(bot.getEscapeAcceleration(escapePlan, true));
                        bot.steerToHeading(escapePlan.angle);
                        return true;
                    }
                }
            }

            if (bot.predictedThreats.length > 0) {
                var urgent = bot.predictedThreats[0].time <= bot.opt.emergencyEscapeTime;
                window.setAcceleration(bot.getEscapeAcceleration(escapePlan, urgent));
                bot.steerToHeading(escapePlan.angle);
                return true;
            }

            if (trapped) {
                window.setAcceleration(bot.defaultAccel);
                bot.steerToHeading(escapePlan.angle);
                return true;
            }

            window.setAcceleration(bot.defaultAccel);
            return false;
        },

        sortScore: function(a, b) {
            return b.score - a.score;
        },



        scoreFood: function(f) {
            f.score = Math.pow(Math.ceil(f.sz / bot.opt.foodRoundSize) * bot.opt.foodRoundSize, 2) /
                f.distance / (Math.ceil(f.da / bot.opt.foodRoundAngle) * bot.opt.foodRoundAngle);
        },

        computeFoodGoal: function() {
            var foodClusters = [];
            var foodGetIndex = [];
            var fi = 0;
            var sw = bot.snakeWidth;
            var scanRadius2 = bot.scanRadius * bot.scanRadius;

            for (var i = 0; i < window.foods.length && window.foods[i] !== null; i++) {
                var a;
                var da;
                var distance;
                var sang = window.slither.ehang;
                var f = window.foods[i];

                if (canvasUtil.getDistance2(
                    window.slither.xx, window.slither.yy, f.xx, f.yy) <= scanRadius2 &&
                    !f.eaten &&
                    !(
                        canvasUtil.circleIntersect(
                            canvasUtil.circle(f.xx, f.yy, 2),
                            bot.sidecircle_l) ||
                        canvasUtil.circleIntersect(
                            canvasUtil.circle(f.xx, f.yy, 2),
                            bot.sidecircle_r))) {

                    var cx = Math.round(Math.round(f.xx / sw) * sw);
                    var cy = Math.round(Math.round(f.yy / sw) * sw);
                    var csz = Math.round(f.sz);

                    if (foodGetIndex[cx + '|' + cy] === undefined) {
                        foodGetIndex[cx + '|' + cy] = fi;
                        a = canvasUtil.fastAtan2(cy - window.slither.yy, cx - window.slither.xx);
                        da = Math.min(
                            (2 * Math.PI) - Math.abs(a - sang), Math.abs(a - sang));
                        distance = Math.round(
                            canvasUtil.getDistance2(cx, cy, window.slither.xx, window.slither.yy));
                        foodClusters[fi] = {
                            x: cx,
                            y: cy,
                            a: a,
                            da: da,
                            sz: csz,
                            distance: distance,
                            score: 0.0
                        };
                        fi++;
                    } else {
                        foodClusters[foodGetIndex[cx + '|' + cy]].sz += csz;
                    }
                }
            }

            foodClusters.forEach(bot.scoreFood);
            foodClusters.sort(bot.sortScore);

            for (i = 0; i < foodClusters.length; i++) {
                var aIndex = bot.getAngleIndex(foodClusters[i].a);
                if (bot.collisionAngles[aIndex] === undefined ||
                    (Math.sqrt(bot.collisionAngles[aIndex].distance) -
                        bot.snakeRadius * bot.opt.mnoznikPromienia / 2 >
                        Math.sqrt(foodClusters[i].distance) &&
                        foodClusters[i].sz > bot.opt.foodSmallSize)
                ) {
                    bot.currentFood = foodClusters[i];
                    return;
                }
            }
            bot.currentFood = {
                x: bot.MID_X,
                y: bot.MID_Y
            };
        },

        foodAccel: function() {
            var aIndex = 0;

            if (bot.currentFood && bot.currentFood.sz > bot.opt.foodAccelSize) {
                aIndex = bot.getAngleIndex(bot.currentFood.a);

                if (
                    bot.collisionAngles[aIndex] &&
                    Math.sqrt(bot.collisionAngles[aIndex].distance) >
                    Math.sqrt(bot.currentFood.distance) +
                    bot.snakeWidth * bot.opt.mnoznikPromienia &&
                    bot.currentFood.da < bot.opt.foodAccelAngle) {
                    return 1;
                }

                if (bot.collisionAngles[aIndex] === undefined) {
                    return 1;
                }
            }

            return bot.defaultAccel;
        },

        every: function() {
            bot.MID_X = window.grd;
            bot.MID_Y = window.grd;
            bot.MAP_R = window.grd * 0.98;

            bot.snakeWidth = bot.getSnakeWidth();
            bot.snakeRadius = bot.snakeWidth / 2;
            bot.scanRadius = Math.sqrt(
                Math.pow(window.ww / 2, 2) + Math.pow(window.hh / 2, 2)) /
                (window.gsc || 1) + bot.snakeWidth * bot.opt.mnoznikPromienia;
            bot.sectorBoxSide = bot.scanRadius * 2;
            bot.sectorBox = canvasUtil.rect(
                window.slither.xx - (bot.sectorBoxSide / 2),
                window.slither.yy - (bot.sectorBoxSide / 2),
                bot.sectorBoxSide, bot.sectorBoxSide);


            bot.cos = Math.cos(window.slither.ang);
            bot.sin = Math.sin(window.slither.ang);

            bot.speedMult = window.slither.sp / 5.78;

            bot.sidecircle_r = canvasUtil.circle(
                window.slither.gptz.xx -
                ((window.slither.gptz.yy + bot.sin * bot.snakeWidth) -
                    window.slither.gptz.yy),
                window.slither.gptz.yy +
                ((window.slither.gptz.xx + bot.cos * bot.snakeWidth) -
                    window.slither.gptz.xx),
                bot.snakeWidth * bot.speedMult
            );

            bot.sidecircle_l = canvasUtil.circle(
                window.slither.gptz.xx +
                ((window.slither.gptz.yy + bot.sin * bot.snakeWidth) -
                    window.slither.gptz.yy),
                window.slither.gptz.yy -
                ((window.slither.gptz.xx + bot.cos * bot.snakeWidth) -
                    window.slither.gptz.xx),
                bot.snakeWidth * bot.speedMult
            );
        },


        go: function() {
            bot.every();

            if (bot.checkCollision()) {
                bot.lookForFood = false;
                if (bot.foodTimeout) {
                    window.clearTimeout(bot.foodTimeout);
                    bot.foodTimeout = window.setTimeout(
                        bot.foodTimer, 1000 / bot.opt.targetFps * bot.opt.foodFrames);
                }
            } else {
                bot.lookForFood = true;
                if (bot.foodTimeout === undefined) {
                    bot.foodTimeout = window.setTimeout(
                        bot.foodTimer, 1000 / bot.opt.targetFps * bot.opt.foodFrames);
                }
                window.setAcceleration(bot.foodAccel());
            }
        },


        foodTimer: function() {
            if (window.playing && bot.lookForFood &&
                window.slither !== null && window.slither.alive_amt === 1) {
                bot.computeFoodGoal();
                window.goalCoordinates = bot.currentFood;
                canvasUtil.setMouseCoordinates(canvasUtil.mapToMouse(window.goalCoordinates));
            }
            bot.foodTimeout = undefined;
        }
    };
})();

var userInterface = window.userInterface = (function() {

    var original_keydown = document.onkeydown;
    var original_onmouseDown = window.onmousedown;
    var original_oef = window.oef;
    var original_redraw = window.redraw;
    var original_onmousemove = window.onmousemove;

    window.oef = function() {};
    window.redraw = function() {};

    return {
        overlays: {},

        initOverlays: function() {
            var botOverlay = document.createElement('div');
            botOverlay.style.position = 'fixed';
            botOverlay.style.right = '5px';
            botOverlay.style.bottom = '112px';
            botOverlay.style.width = '150px';
            botOverlay.style.height = '85px';

            botOverlay.style.color = '#C0C0C0';
            botOverlay.style.fontFamily = 'Consolas, Verdana';
            botOverlay.style.zIndex = 999;
            botOverlay.style.fontSize = '14px';
            botOverlay.style.padding = '5px';
            botOverlay.style.borderRadius = '5px';
            botOverlay.className = 'nsi';
            document.body.appendChild(botOverlay);

            var serverOverlay = document.createElement('div');
            serverOverlay.style.position = 'fixed';
            serverOverlay.style.right = '5px';
            serverOverlay.style.bottom = '5px';
            serverOverlay.style.width = '160px';
            serverOverlay.style.height = '14px';
            serverOverlay.style.color = '#C0C0C0';
            serverOverlay.style.fontFamily = 'Consolas, Verdana';
            serverOverlay.style.zIndex = 999;
            serverOverlay.style.fontSize = '14px';
            serverOverlay.className = 'nsi';
            document.body.appendChild(serverOverlay);

            var prefOverlay = document.createElement('div');
            prefOverlay.style.position = 'fixed';
            prefOverlay.style.left = '10px';
            prefOverlay.style.top = '75px';
            prefOverlay.style.width = '260px';
            prefOverlay.style.height = '210px';

            prefOverlay.style.color = '#C0C0C0';
            prefOverlay.style.fontFamily = 'Consolas, Verdana';
            prefOverlay.style.zIndex = 999;
            prefOverlay.style.fontSize = '14px';
            prefOverlay.style.padding = '5px';
            prefOverlay.style.borderRadius = '5px';
            prefOverlay.className = 'nsi';
            document.body.appendChild(prefOverlay);

            var statsOverlay = document.createElement('div');
            statsOverlay.style.position = 'fixed';
            statsOverlay.style.left = '10px';
            statsOverlay.style.top = '340px';
            statsOverlay.style.width = '140px';
            statsOverlay.style.height = '210px';

            statsOverlay.style.color = '#C0C0C0';
            statsOverlay.style.fontFamily = 'Consolas, Verdana';
            statsOverlay.style.zIndex = 998;
            statsOverlay.style.fontSize = '14px';
            statsOverlay.style.padding = '5px';
            statsOverlay.style.borderRadius = '5px';
            statsOverlay.className = 'nsi';
            document.body.appendChild(statsOverlay);

            userInterface.overlays.botOverlay = botOverlay;
            userInterface.overlays.serverOverlay = serverOverlay;
            userInterface.overlays.prefOverlay = prefOverlay;
            userInterface.overlays.statsOverlay = statsOverlay;
        },

        toggleOverlays: function() {
            Object.keys(userInterface.overlays).forEach(function(okey) {
                var oVis = userInterface.overlays[okey].style.visibility !== 'hidden' ?
                    'hidden' : 'visible';
                userInterface.overlays[okey].style.visibility = oVis;
                window.wizualnyPromien = oVis === 'visible';
            });
        },
        toggleukrywanieNickow: function() {
            window.ukrywanieNickow = !window.ukrywanieNickow;
            window.log('ukrywanieNickow set to: ' + window.ukrywanieNickow);
            userInterface.savePreference('ukrywanieNickow', window.ukrywanieNickow);
            if (window.ukrywanieNickow) {



                window.lbn.style.display = 'block';
            } else {



                window.lbn.style.display = 'none';
            }
        },
        removeLogo: function() {
            if (typeof window.showlogo_iv !== 'undefined') {
                window.ncka = window.lgss = window.lga = 1;
                clearInterval(window.showlogo_iv);
                showLogo(true);
            }
        },

        savePreference: function(item, value) {
            window.localStorage.setItem(item, value);
            userInterface.onPrefChange();
        },


        loadPreference: function(preference, defaultVar) {
            var savedItem = window.localStorage.getItem(preference);
            if (savedItem !== null) {
                if (savedItem === 'true') {
                    window[preference] = true;
                } else if (savedItem === 'false') {
                    window[preference] = false;
                } else {
                    window[preference] = savedItem;
                }
                window.log('Setting found for ' + preference + ': ' + window[preference]);
            } else {
                window[preference] = defaultVar;
                window.log('No setting found for ' + preference +
                    '. Used default: ' + window[preference]);
            }
            userInterface.onPrefChange();
            return window[preference];
        },


        playButtonClickListener: function() {
            userInterface.saveNick();
            userInterface.loadPreference('autoRespawn', false);
            userInterface.onPrefChange();
        },


        saveNick: function() {
            var nick = document.getElementById('nick').value;
            userInterface.savePreference('zapiszNick', nick);
        },


        hideTop: function() {
            var nsidivs = document.querySelectorAll('div.nsi');
            for (var i = 0; i < nsidivs.length; i++) {
                if (nsidivs[i].style.top === '4px' && nsidivs[i].style.width === '300px') {
                    nsidivs[i].style.visibility = 'hidden';
                    bot.isTopHidden = true;
                    window.topscore = nsidivs[i];
                }
            }
        },


        framesPerSecond: {
            fps: 0,
            fpsTimer: function() {
                if (window.playing && window.fps && window.lrd_mtm) {
                    if (Date.now() - window.lrd_mtm > 970) {
                        userInterface.framesPerSecond.fps = window.fps;
                    }
                }
            }
        },

        onkeydown: function(e) {

            original_keydown(e);
            if (window.playing) {

                if (e.keyCode === 84) {
                    bot.stanBota = !bot.stanBota;
                }

                if (e.keyCode === 85) {
                    window.logDebugowanie = !window.logDebugowanie;
                    window.log('Log debugowanie ustawione na: ' + window.logDebugowanie);
                    userInterface.savePreference('logDebugowanie', window.logDebugowanie);
                }

                if (e.keyCode === 89) {
                    window.wizualnyPromien = !window.wizualnyPromien;
                    window.log('Wizualny promień ustawiony na: ' + window.wizualnyPromien);
                    userInterface.savePreference('wizualnyPromien', window.wizualnyPromien);
                }

                if (e.keyCode === 71) {
                    userInterface.toggleukrywanieNickow(!window.ukrywanieNickow);
                }

                if (e.keyCode === 73) {
                    window.autoRespawn = !window.autoRespawn;
                    window.log('Automatyczny respawn ustawiony na: ' + window.autoRespawn);
                    userInterface.savePreference('autoRespawn', window.autoRespawn);
                }

                if (e.keyCode === 72) {
                    userInterface.toggleOverlays();
                }

                if (e.keyCode === 66) {
                    var url = prompt('Podaj link do tła (jpg,jpeg,png):');
                    if (url !== null) {
                        canvasUtil.setBackground(url);
                    }
                }

                if (e.keyCode === 79) {
                    userInterface.toggleskinMobilnying(!window.skinMobilny);
                }

                if (e.keyCode === 65) {
                    bot.opt.mnoznikPromienia++;
                    window.log(
                        'Mnożnik promienia ustawiony na: ' + bot.opt.mnoznikPromienia);
                }

                if (e.keyCode === 83) {
                    if (bot.opt.mnoznikPromienia > 1) {
                        bot.opt.mnoznikPromienia--;
                        window.log(
                            'Mnożnik promienia ustawiony na: ' +
                            bot.opt.mnoznikPromienia);
                    }
                }

                if (e.keyCode === 68) {
                    if (bot.opt.mnoznikPromienia >
                        ((bot.opt.zmianaPromieniaMinus - bot.opt.zmianaPromieniaPlus) /
                            2 + bot.opt.zmianaPromieniaPlus)) {
                        bot.opt.mnoznikPromienia = bot.opt.zmianaPromieniaPlus;
                    } else {
                        bot.opt.mnoznikPromienia = bot.opt.zmianaPromieniaMinus;
                    }
                    window.log(
                        'Mnożnik promienia ustawiony na: ' + bot.opt.mnoznikPromienia);
                }

                if (e.keyCode === 90) {
                    canvasUtil.resetZoom();
                }

                if (e.keyCode === 81) {
                    window.autoRespawn = false;
                    userInterface.quit();
                }

                if (e.keyCode === 27) {
                    bot.quickRespawn();
                }

                if (e.keyCode === 13) {
                    userInterface.saveNick();
                }
                userInterface.onPrefChange();
            }
        },

        onmousedown: function(e) {
            if (window.playing) {
                switch (e.which) {

                    case 1:
                        bot.defaultAccel = 1;
                        if (!bot.stanBota) {
                            original_onmouseDown(e);
                        }
                        break;

                    case 3:
                        bot.stanBota = !bot.stanBota;
                        break;
                }
            } else {
                original_onmouseDown(e);
            }
            userInterface.onPrefChange();
        },

        onmouseup: function() {
            bot.defaultAccel = 0;
        },


        toggleskinMobilnying: function(skinMobilnying) {
            window.skinMobilny = skinMobilnying;
            window.log('Mobilny skin ustawiony na: ' + window.skinMobilny);
            userInterface.savePreference('skinMobilny', window.skinMobilny);

            if (window.skinMobilny) {
                window.render_mode = 1;
                window.want_quality = 0;
                window.high_quality = false;
            } else {
                window.render_mode = 2;
                window.want_quality = 1;
                window.high_quality = true;
            }
        },


        updateStats: function() {
            var oContent = [];
            var median;

            if (bot.scores.length === 0) return;
            median = Math.round((bot.scores[Math.floor((bot.scores.length - 1) / 2)] +
                     bot.scores[Math.ceil((bot.scores.length - 1) / 2)]) / 2);

            oContent.push('');
            oContent.push('');
            oContent.push('');
            oContent.push('Tabela wyników: ');

            for (var i = 0; i < bot.scores.length && i < 10; i++) {
                oContent.push(i + 1 + '. ' + bot.scores[i]);
            }

            userInterface.overlays.statsOverlay.innerHTML = oContent.join('<br/>');
        },

        onPrefChange: function() {

            var oContent = [];
            var ht = userInterface.handleTextColor;

            oContent.push('Autor: ' + GM_info.script.author);
            oContent.push('Wersja: ' + GM_info.script.version);
            oContent.push('');
            oContent.push('[T] Włącz/Wyłącz bota - ' + ht(bot.stanBota));
            oContent.push('[O] Skin mobilny - ' + ht(window.skinMobilny));
            oContent.push('[A/S] Mnożnik promienia - ' + bot.opt.mnoznikPromienia);
            oContent.push('[D] Zmiana promienia - ' + bot.opt.zmianaPromieniaPlus + '/' + bot.opt.zmianaPromieniaMinus);
            oContent.push('[I] Auto respawn - ' + ht(window.autoRespawn));
            oContent.push('[G] Ukryj nicki: ' + ht(window.ukrywanieNickow));
            oContent.push('[Y] Wizualny promień: ' + ht(window.wizualnyPromien));
            oContent.push('[U] Log debugowanie: ' + ht(window.logDebugowanie));
            oContent.push('[H] Włącz/Wyłącz panel');
            oContent.push('[B] Zmień tło');
            oContent.push('[SCROLL] Powiększ +/-');
            oContent.push('[Z] Domyślne powiększenie');
            oContent.push('[ESC] Szybki respawn');
            oContent.push('[Q] Wyjście do menu');

            userInterface.overlays.prefOverlay.innerHTML = oContent.join('<br/>');
        },

        onFrameUpdate: function() {

            var oContent = [];

            if (window.playing && window.slither !== null) {
                oContent.push('FPS: ' + userInterface.framesPerSecond.fps);


                oContent.push('Pozycja X: ' +
                    (Math.round(window.slither.xx) || 0) + ' Pozycja Y: ' +
                    (Math.round(window.slither.yy) || 0));

                if (window.goalCoordinates) {
                    oContent.push('Cel');
                    oContent.push('Pozycja X: ' + window.goalCoordinates.x + ' Pozycja Y: ' +
                        window.goalCoordinates.y);
                    if (window.goalCoordinates.sz) {
                        oContent.push('Gracze: ' + window.goalCoordinates.sz);
                    }
                }

                if (window.bso !== undefined && userInterface.overlays.serverOverlay.innerHTML !==
                    window.bso.ip + ':' + window.bso.po) {
                    userInterface.overlays.serverOverlay.innerHTML =
                        window.bso.ip + ':' + window.bso.po;
                }
            }

            userInterface.overlays.botOverlay.innerHTML = oContent.join('<br/>');

            if (window.playing && window.wizualnyPromien) {

                if (window.goalCoordinates && bot.stanBota) {
                    var headCoord = {
                        x: window.slither.xx,
                        y: window.slither.yy
                    };
                    canvasUtil.drawLine(
                        headCoord,
                        window.goalCoordinates,
                        'green');
                    canvasUtil.drawCircle(window.goalCoordinates, 'red', true);
                }
            }
        },

        oefTimer: function() {
            var start = Date.now();
            canvasUtil.maintainZoom();
            original_oef();
            original_redraw();

            if (window.playing && bot.stanBota && window.slither !== null) {
                window.onmousemove = function() {};
                bot.isBotRunning = true;
                bot.go();
            } else if (bot.stanBota && bot.isBotRunning) {
                bot.isBotRunning = false;
                if (window.lastscore && window.lastscore.childNodes[1]) {
                    bot.scores.push(parseInt(window.lastscore.childNodes[1].innerHTML));
                    bot.scores.sort(function(a, b) {
                        return b - a;
                    });
                    userInterface.updateStats();
                }

                if (window.autoRespawn) {
                    window.connect();
                }
            }

            if (!bot.stanBota || !bot.isBotRunning) {
                window.onmousemove = original_onmousemove;
            }

            userInterface.onFrameUpdate();
            setTimeout(userInterface.oefTimer, (1000 / bot.opt.targetFps) - (Date.now() - start));
        },


        quit: function() {
            if (window.playing && window.resetGame) {
                window.want_close_socket = true;
                window.dead_mtm = 0;
                if (window.play_btn) {
                    window.play_btn.setEnabled(true);
                }
                window.resetGame();
            }
        },


        onresize: function() {
            window.resize();

            canvasUtil.canvasRatio = {
                x: window.mc.width / window.ww,
                y: window.mc.height / window.hh
            };
        },



        handleTextColor: function(enabled) {
            return '<span style=\"color:' +
                (enabled ? 'green;\">włączony' : 'red;\">wyłączony') + '</span>';
        }
    };
})();


(function() {
    window.play_btn.btnf.addEventListener('click', userInterface.playButtonClickListener);
    document.onkeydown = userInterface.onkeydown;
    window.onmousedown = userInterface.onmousedown;
    window.addEventListener('mouseup', userInterface.onmouseup);
    window.onresize = userInterface.onresize;

    userInterface.hideTop();

    userInterface.initOverlays();

    userInterface.loadPreference('logDebugowanie', false);
    userInterface.loadPreference('wizualnyPromien', false);
    userInterface.loadPreference('autoRespawn', false);
    userInterface.loadPreference('skinMobilny', false);
    userInterface.loadPreference('ukrywanieNickow', true);
    window.nick.value = userInterface.loadPreference('zapiszNick', 'Ciastuus');

    if (typeof(domyslneOpcjeBota.useDefaults) !== 'undefined'
       && domyslneOpcjeBota.useDefaults === true) {
        window.log('Ignorowanie zapisanych / dostosowanych opcji na żądanie użytkownika');
    } else {
        var savedOptions = userInterface.loadPreference('options', null);
        if (savedOptions !== null) {
            savedOptions = JSON.parse(savedOptions);
            if (Object.keys(savedOptions).length !== 0
                && savedOptions.constructor === Object) {
                Object.keys(savedOptions).forEach(function(key) {
                    window.bot.opt[key] = savedOptions[key];
                });
            }
            window.log('Znaleziono zapisane ustawienia, nadpisując domyślne opcje bota');
        } else {
            window.log('Brak zapisanych ustawień przy użyciu domyślnych opcji bota');
        }

        if (Object.keys(domyslneOpcjeBota).length !== 0
            && domyslneOpcjeBota.constructor === Object) {
            Object.keys(domyslneOpcjeBota).forEach(function(key) {
                window.bot.opt[key] = domyslneOpcjeBota[key];
            });
            window.log('Odnaleziono ustawienia niestandardowe, zastępując bieżące opcje bota');
        }
    }


    userInterface.savePreference('options', JSON.stringify(window.bot.opt));
    window.log('Zapisywanie aktualnych opcji bota');


    document.body.addEventListener('mousewheel', canvasUtil.setZoom);
    document.body.addEventListener('DOMMouseScroll', canvasUtil.setZoom);


    if (window.skinMobilny) {
        userInterface.toggleskinMobilnying(true);
    } else {
        userInterface.toggleskinMobilnying(false);
    }

    userInterface.removeLogo();

    window.localStorage.setItem('edttsg', '1');


    window.social.remove();


    setInterval(userInterface.framesPerSecond.fpsTimer, 80);


    userInterface.oefTimer();
})();