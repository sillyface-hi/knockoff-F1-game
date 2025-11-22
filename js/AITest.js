// Simple AI regression test harness.
// Usage in browser console (after game has loaded):
//   runAITest({ trackIndex: 0, steps: 8000, numCars: 5 })
//
// It will simulate AI-only cars around a chosen track (no rendering)
// and log how often they go outside the track bounds.

(function () {
    function createAICarOnGrid(track, gridIndex) {
        const gridPos = track.getGridPosition(gridIndex);
        const car = new Car(gridPos.x, gridPos.y, '#ff0000', false);
        car.angle = gridPos.angle;
        car.tire = 'SOFT';
        car.ai = new AI(car, track);
        return car;
    }

    function simulateStep(cars, track, weather) {
        const deltaTime = 16; // ms – approximate 60 FPS
        cars.forEach(car => {
            car.update(null, deltaTime, track, cars, weather);
        });
    }

    function isOnTrack(track, car) {
        return track.isOnTrack(car.x, car.y);
    }

    window.runAITest = function runAITest(options = {}) {
        const trackIndex = options.trackIndex ?? 0;
        const steps = options.steps ?? 8000;
        const numCars = options.numCars ?? 5;
        const allowOffTrackFrames = options.allowOffTrackFrames ?? 0;

        if (!window.TRACKS || !window.TRACKS.length) {
            console.warn('No TRACKS loaded – run the game once so tracks are initialized.');
            return;
        }

        const trackData = window.TRACKS[trackIndex];
        if (!trackData) {
            console.warn('Invalid trackIndex for runAITest:', trackIndex);
            return;
        }

        const track = new Track(trackData);
        const cars = [];

        for (let i = 0; i < numCars; i++) {
            cars.push(createAICarOnGrid(track, i));
        }

        let offFramesTotal = 0;
        let offEvents = 0;
        let maxConsecutiveOff = 0;
        let currentConsecutiveOff = 0;

        for (let step = 0; step < steps; step++) {
            simulateStep(cars, track, 'SUNNY');

            let anyOffThisStep = false;
            cars.forEach(car => {
                if (!isOnTrack(track, car)) {
                    anyOffThisStep = true;
                }
            });

            if (anyOffThisStep) {
                offFramesTotal++;
                currentConsecutiveOff++;
                if (currentConsecutiveOff === 1) {
                    offEvents++;
                }
                if (currentConsecutiveOff > maxConsecutiveOff) {
                    maxConsecutiveOff = currentConsecutiveOff;
                }
            } else {
                currentConsecutiveOff = 0;
            }
        }

        const summary = {
            track: trackData.name || trackData.id || '(unnamed)',
            steps,
            numCars,
            offFramesTotal,
            offEvents,
            maxConsecutiveOff,
            passed: offFramesTotal <= allowOffTrackFrames
        };

        console.log('AI Track Boundary Test Summary:', summary);
        if (!summary.passed) {
            console.warn('AI left the track more than allowed. See summary above.');
        } else {
            console.log('AI stayed on track within allowed tolerance.');
        }

        return summary;
    };
})();





