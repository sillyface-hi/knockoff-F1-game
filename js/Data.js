window.TEAMS = [
    {
        id: 'ferrari',
        name: 'Ferrari',
        color: '#ff2800',
        drivers: [
            { name: 'Lewis Hamilton', number: 44 },
            { name: 'Charles Leclerc', number: 16 }
        ]
    },
    {
        id: 'mercedes',
        name: 'Mercedes',
        color: '#00d2be',
        drivers: [
            { name: 'George Russell', number: 63 },
            { name: 'Kimi Antonelli', number: 12 }
        ]
    },
    {
        id: 'redbull',
        name: 'Red Bull Racing',
        color: '#0600ef',
        drivers: [
            { name: 'Max Verstappen', number: 33 },
            { name: 'Yuki Tsunoda', number: 22 }
        ]
    },
    {
        id: 'mclaren',
        name: 'McLaren',
        color: '#ff6000',
        drivers: [
            { name: 'Lando Norris', number: 4 },
            { name: 'Oscar Piastri', number: 81 }
        ]
    },
    {
        id: 'astonmartin',
        name: 'Aston Martin',
        color: '#083b35ff',
        drivers: [
            { name: 'Fernando Alonso', number: 14 },
            { name: 'Lance Stroll', number: 18 }
        ]
    },
    {
        id: 'alpine',
        name: 'Alpine',
        color: '#99108eff',
        drivers: [
            { name: 'Pierre Gasly', number: 10 },
            { name: 'Franco Colapinto', number: 43 }
        ]
    },
    {
        id: 'williams',
        name: 'Williams',
        color: '#005aff',
        drivers: [
            { name: 'Alexander Albon', number: 23 },
            { name: 'Carlos Sainz', number: 55 }
        ]
    },
    {
        id: 'rb',
        name: 'Racing Bulls',
        color: '#7485d6ff',
        drivers: [
            { name: 'Liam Lawson', number: 30 },
            { name: 'Isack Hadjar', number: 6 }
        ]
    },
    {
        id: 'sauber',
        name: 'Audi / Sauber',
        color: '#000000ff',
        drivers: [
            { name: 'Nico Hulkenberg', number: 27 },
            { name: 'Gabriel Bortoleto', number: 5 }
        ]
    },
    {
        id: 'haas',
        name: 'Haas',
        color: '#b6babd',
        drivers: [
            { name: 'Esteban Ocon', number: 31 },
            { name: 'Oliver Bearman', number: 87 }
        ]
    },
    {
        id: 'cadillac',
        name: 'Cadillac',
        color: '#a5860aff',
        drivers: [
            { name: 'Sergio Perez', number: 11 },
            { name: 'Valtteri Bottas', number: 77 }
        ]
    }
];

window.TRACKS = [
    {
        id: 'monza',
        name: 'Monza',
        laps: 5,
        waypoints: [
            // Start/Finish Straight
            { x: 0, y: 0, width: 220 },
            { x: 200, y: 0, width: 220 },
            { x: 400, y: 0, width: 220 },
            { x: 600, y: 0, width: 220 },
            { x: 800, y: 0, width: 220 },
            { x: 1000, y: 0, width: 220 },
            // Variante del Rettifilo (First Chicane)
            { x: 1150, y: 50, width: 160 },
            { x: 1200, y: 120, width: 140 },
            { x: 1220, y: 80, width: 140 },
            { x: 1250, y: 20, width: 160 },
            { x: 1300, y: 0, width: 180 },
            // Curva Grande
            { x: 1500, y: 50, width: 200 },
            { x: 1700, y: 150, width: 200 },
            { x: 1850, y: 280, width: 200 },
            { x: 1950, y: 420, width: 200 },
            { x: 2000, y: 550, width: 200 },
            // Variante della Roggia (Second Chicane)
            { x: 2050, y: 650, width: 160 },
            { x: 2020, y: 750, width: 140 },
            { x: 2060, y: 830, width: 140 },
            { x: 2100, y: 900, width: 160 },
            // Lesmo 1
            { x: 2180, y: 1000, width: 180 },
            { x: 2250, y: 1120, width: 180 },
            { x: 2300, y: 1250, width: 180 },
            { x: 2320, y: 1380, width: 180 },
            // Lesmo 2
            { x: 2330, y: 1500, width: 180 },
            { x: 2320, y: 1620, width: 180 },
            { x: 2280, y: 1730, width: 180 },
            { x: 2220, y: 1830, width: 180 },
            // Serraglio Straight
            { x: 2100, y: 1950, width: 200 },
            { x: 1900, y: 2100, width: 200 },
            { x: 1700, y: 2200, width: 200 },
            { x: 1500, y: 2300, width: 200 },
            // Variante Ascari (Third Chicane)
            { x: 1350, y: 2380, width: 160 },
            { x: 1250, y: 2450, width: 140 },
            { x: 1180, y: 2380, width: 140 },
            { x: 1120, y: 2300, width: 140 },
            { x: 1080, y: 2400, width: 140 },
            { x: 1050, y: 2500, width: 160 },
            { x: 1000, y: 2580, width: 180 },
            // Back Straight
            { x: 800, y: 2500, width: 200 },
            { x: 600, y: 2400, width: 200 },
            { x: 400, y: 2250, width: 200 },
            { x: 200, y: 2100, width: 200 },
            // Parabolica
            { x: 50, y: 1950, width: 220 },
            { x: -100, y: 1780, width: 220 },
            { x: -250, y: 1600, width: 220 },
            { x: -380, y: 1400, width: 220 },
            { x: -480, y: 1200, width: 220 },
            { x: -550, y: 1000, width: 220 },
            { x: -580, y: 800, width: 220 },
            { x: -550, y: 600, width: 220 },
            { x: -450, y: 450, width: 220 },
            { x: -300, y: 320, width: 220 },
            { x: -150, y: 200, width: 220 },
            { x: 0, y: 100, width: 220 },
            { x: 0, y: 0, width: 220 }
        ],
        racingLine: [0, -0.3, -0.5, 0, 0.3, 0.5, 0.9, -0.9, 0.9, -0.9, 0.5, 0.8, -0.8, 0.9, -0.9, 0.5, 0.9, -0.9, 0.9, -0.8, 0.9, -0.9, 0.8, -0.8, 0.9, -0.9, 0.8, -0.8, 0.5, 0, 0.3, 0.5, 0.9, -0.9, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0, 0.3, 0.5, 0.9, -0.9, 0.8, -0.9, 0.9, -0.9, 0.9, -0.8, 0.8, -0.7, 0.5, 0.3, 0, 0]
    },
    {
        id: 'silverstone',
        name: 'Silverstone',
        laps: 5,
        waypoints: [
            // Start/Finish
            { x: 0, y: 0, width: 220 },
            { x: 200, y: 0, width: 220 },
            { x: 400, y: -20, width: 220 },
            // Abbey
            { x: 550, y: -50, width: 200 },
            { x: 680, y: -100, width: 180 },
            { x: 800, y: -170, width: 180 },
            { x: 900, y: -220, width: 180 },
            { x: 1000, y: -200, width: 180 },
            { x: 1100, y: -150, width: 180 },
            // Farm Curve
            { x: 1200, y: -80, width: 200 },
            { x: 1280, y: 20, width: 200 },
            { x: 1320, y: 120, width: 200 },
            // Village
            { x: 1300, y: 230, width: 170 },
            { x: 1250, y: 330, width: 160 },
            { x: 1180, y: 420, width: 160 },
            { x: 1100, y: 490, width: 160 },
            { x: 1020, y: 540, width: 160 },
            { x: 950, y: 570, width: 160 },
            // The Loop
            { x: 900, y: 600, width: 170 },
            { x: 920, y: 650, width: 170 },
            { x: 980, y: 680, width: 170 },
            { x: 1060, y: 690, width: 170 },
            { x: 1140, y: 670, width: 170 },
            { x: 1200, y: 630, width: 180 },
            // Aintree
            { x: 1280, y: 570, width: 190 },
            { x: 1360, y: 500, width: 190 },
            { x: 1420, y: 420, width: 200 },
            // Wellington Straight
            { x: 1520, y: 350, width: 210 },
            { x: 1650, y: 280, width: 210 },
            { x: 1800, y: 220, width: 210 },
            { x: 1950, y: 180, width: 210 },
            { x: 2100, y: 150, width: 210 },
            { x: 2250, y: 120, width: 210 },
            // Brooklands
            { x: 2380, y: 80, width: 180 },
            { x: 2500, y: 20, width: 180 },
            { x: 2600, y: -60, width: 180 },
            { x: 2680, y: -150, width: 180 },
            { x: 2740, y: -250, width: 180 },
            // Luffield
            { x: 2780, y: -360, width: 180 },
            { x: 2800, y: -470, width: 180 },
            { x: 2790, y: -580, width: 180 },
            { x: 2750, y: -680, width: 180 },
            { x: 2680, y: -760, width: 180 },
            // Woodcote
            { x: 2580, y: -820, width: 200 },
            { x: 2460, y: -860, width: 200 },
            { x: 2330, y: -880, width: 200 },
            // National Pits Straight
            { x: 2180, y: -880, width: 210 },
            { x: 2020, y: -870, width: 210 },
            { x: 1860, y: -850, width: 210 },
            { x: 1700, y: -820, width: 210 },
            { x: 1540, y: -780, width: 210 },
            { x: 1380, y: -730, width: 210 },
            // Copse
            { x: 1240, y: -670, width: 200 },
            { x: 1120, y: -600, width: 200 },
            { x: 1020, y: -520, width: 200 },
            { x: 940, y: -430, width: 200 },
            { x: 880, y: -330, width: 200 },
            // Maggots
            { x: 820, y: -230, width: 200 },
            { x: 750, y: -140, width: 200 },
            { x: 670, y: -60, width: 200 },
            // Becketts
            { x: 580, y: 10, width: 190 },
            { x: 490, y: 70, width: 190 },
            { x: 410, y: 120, width: 190 },
            // Chapel
            { x: 330, y: 50, width: 190 },
            { x: 260, y: -30, width: 190 },
            { x: 200, y: -120, width: 190 },
            // Hangar Straight
            { x: 130, y: -220, width: 210 },
            { x: 50, y: -330, width: 210 },
            { x: -30, y: -440, width: 210 },
            { x: -110, y: -540, width: 210 },
            { x: -200, y: -630, width: 210 },
            // Stowe
            { x: -300, y: -700, width: 180 },
            { x: -410, y: -750, width: 180 },
            { x: -520, y: -770, width: 180 },
            { x: -620, y: -750, width: 180 },
            { x: -700, y: -700, width: 180 },
            // Vale
            { x: -750, y: -620, width: 180 },
            { x: -770, y: -530, width: 180 },
            { x: -760, y: -440, width: 180 },
            { x: -720, y: -360, width: 180 },
            { x: -660, y: -290, width: 180 },
            // Club
            { x: -580, y: -230, width: 180 },
            { x: -490, y: -180, width: 180 },
            { x: -390, y: -140, width: 180 },
            { x: -280, y: -110, width: 190 },
            { x: -170, y: -80, width: 200 },
            { x: -60, y: -40, width: 210 },
            { x: 0, y: 0, width: 220 }
        ],
        racingLine: [0, -0.3, 0, 0.8, -0.9, 0.9, -0.8, 0.5, 0.3, 0.8, -0.9, 0.8, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.9, -0.9, 0.8, 0.5, 0, 0.3, 0.5, 0.7, 0.8, 0.9, -0.9, 0.9, -0.9, 0.8, 0.9, -0.9, 0.9, -0.9, 0.8, 0.8, -0.8, 0.5, 0.3, 0, 0.3, 0.5, 0.7, 0.9, -0.9, 0.9, -0.9, 0.8, 0.9, -0.9, 0.9, -0.9, 0.8, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0, 0.3, 0.5, 0.9, -0.9, 0.9, -0.9, 0.8, 0.9, -0.9, 0.9, -0.9, 0.8, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.5, 0.3, 0]
    },
    {
        id: 'spa',
        name: 'Spa-Francorchamps',
        laps: 4,
        waypoints: [
            { x: 0, y: 0, width: 200 }, { x: 150, y: 50, width: 180 }, { x: 250, y: 150, width: 160 }, { x: 300, y: 250, width: 150 }, { x: 320, y: 350, width: 150 }, { x: 300, y: 440, width: 160 }, { x: 250, y: 500, width: 170 }, { x: 200, y: 450, width: 180 }, { x: 180, y: 350, width: 190 }, { x: 200, y: 250, width: 200 }, { x: 250, y: 180, width: 200 }, { x: 320, y: 120, width: 200 }, { x: 400, y: 50, width: 200 }, { x: 500, y: -20, width: 200 }, { x: 600, y: -100, width: 200 }, { x: 700, y: -200, width: 200 }, { x: 800, y: -320, width: 200 }, { x: 900, y: -400, width: 200 }, { x: 1050, y: -450, width: 210 }, { x: 1200, y: -480, width: 210 }, { x: 1350, y: -500, width: 210 }, { x: 1500, y: -510, width: 210 }, { x: 1650, y: -500, width: 210 }, { x: 1800, y: -480, width: 200 }, { x: 1920, y: -440, width: 190 }, { x: 2020, y: -380, width: 180 }, { x: 2100, y: -300, width: 170 }, { x: 2150, y: -210, width: 160 }, { x: 2180, y: -110, width: 160 }, { x: 2200, y: -10, width: 170 }, { x: 2220, y: 90, width: 180 }, { x: 2230, y: 190, width: 190 }, { x: 2220, y: 290, width: 190 }, { x: 2180, y: 380, width: 190 }, { x: 2120, y: 460, width: 190 }, { x: 2040, y: 530, width: 190 }, { x: 1950, y: 590, width: 190 }, { x: 1850, y: 640, width: 190 }, { x: 1740, y: 680, width: 190 }, { x: 1620, y: 710, width: 190 }, { x: 1500, y: 730, width: 190 }, { x: 1380, y: 740, width: 190 }, { x: 1260, y: 740, width: 190 }, { x: 1150, y: 720, width: 190 }, { x: 1050, y: 680, width: 190 }, { x: 970, y: 620, width: 190 }, { x: 910, y: 550, width: 190 }, { x: 870, y: 470, width: 190 }, { x: 800, y: 400, width: 200 }, { x: 700, y: 350, width: 200 }, { x: 600, y: 320, width: 200 }, { x: 500, y: 300, width: 200 }, { x: 400, y: 290, width: 200 }, { x: 300, y: 280, width: 200 }, { x: 200, y: 270, width: 200 }, { x: 100, y: 250, width: 200 }, { x: 0, y: 220, width: 210 }, { x: -100, y: 180, width: 210 }, { x: -180, y: 120, width: 200 }, { x: -240, y: 50, width: 190 }, { x: -280, y: -30, width: 180 }, { x: -300, y: -110, width: 170 }, { x: -280, y: -190, width: 160 }, { x: -230, y: -250, width: 150 }, { x: -160, y: -280, width: 150 }, { x: -80, y: -260, width: 160 }, { x: -20, y: -200, width: 170 }, { x: 10, y: -120, width: 180 }, { x: 20, y: -40, width: 190 }, { x: 10, y: 40, width: 200 }, { x: 0, y: 0, width: 200 }
        ],
        racingLine: [0, 0.9, -0.9, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.5, 0.7, 0.8, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.5, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.5, 0.7, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.5, 0.7, 0.8, 0.5, 0.3, 0, 0.3, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.5, 0]
    },
    {
        id: 'monaco',
        name: 'Monaco',
        laps: 6,
        waypoints: [
            { x: 0, y: 0, width: 150 }, { x: 80, y: -30, width: 145 }, { x: 160, y: -70, width: 140 }, { x: 230, y: -120, width: 135 }, { x: 280, y: -180, width: 130 }, { x: 320, y: -250, width: 130 }, { x: 350, y: -330, width: 130 }, { x: 370, y: -410, width: 130 }, { x: 380, y: -490, width: 130 }, { x: 370, y: -570, width: 130 }, { x: 340, y: -640, width: 130 }, { x: 300, y: -700, width: 130 }, { x: 250, y: -750, width: 130 }, { x: 190, y: -790, width: 130 }, { x: 120, y: -820, width: 130 }, { x: 50, y: -840, width: 130 }, { x: -20, y: -850, width: 130 }, { x: -90, y: -840, width: 130 }, { x: -150, y: -810, width: 130 }, { x: -200, y: -760, width: 125 }, { x: -230, y: -700, width: 120 }, { x: -250, y: -630, width: 115 }, { x: -260, y: -560, width: 110 }, { x: -250, y: -490, width: 115 }, { x: -220, y: -430, width: 120 }, { x: -180, y: -380, width: 125 }, { x: -130, y: -340, width: 130 }, { x: -70, y: -310, width: 135 }, { x: 0, y: -290, width: 140 }, { x: 80, y: -280, width: 145 }, { x: 160, y: -280, width: 145 }, { x: 240, y: -290, width: 145 }, { x: 320, y: -310, width: 145 }, { x: 400, y: -340, width: 145 }, { x: 480, y: -370, width: 145 }, { x: 560, y: -390, width: 145 }, { x: 640, y: -400, width: 145 }, { x: 720, y: -390, width: 145 }, { x: 790, y: -360, width: 145 }, { x: 850, y: -310, width: 145 }, { x: 890, y: -250, width: 145 }, { x: 910, y: -180, width: 145 }, { x: 910, y: -110, width: 145 }, { x: 890, y: -40, width: 145 }, { x: 850, y: 20, width: 145 }, { x: 790, y: 70, width: 145 }, { x: 720, y: 110, width: 145 }, { x: 640, y: 140, width: 145 }, { x: 560, y: 160, width: 145 }, { x: 480, y: 170, width: 145 }, { x: 400, y: 170, width: 145 }, { x: 320, y: 160, width: 145 }, { x: 250, y: 140, width: 145 }, { x: 190, y: 110, width: 145 }, { x: 140, y: 70, width: 145 }, { x: 100, y: 20, width: 145 }, { x: 70, y: -30, width: 145 }, { x: 50, y: -80, width: 145 }, { x: 30, y: -40, width: 147 }, { x: 10, y: 0, width: 150 }, { x: 0, y: 0, width: 150 }
        ],
        racingLine: [0, -0.9, 0.8, -0.9, 0.8, -0.9, 0.8, -0.9, 0.8, -0.9, 0.8, -0.9, 0.8, -0.9, 0.8, -0.9, 0.8, -0.9, 0.8, -0.9, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.5, 0.7, 0.8, -0.9, 0.8, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.5, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.5, 0]
    },
    {
        id: 'suzuka',
        name: 'Suzuka',
        laps: 5,
        waypoints: [
            { x: 0, y: 0, width: 200 }, { x: 150, y: 0, width: 200 }, { x: 300, y: 10, width: 200 }, { x: 450, y: 30, width: 200 }, { x: 590, y: 60, width: 190 }, { x: 720, y: 110, width: 180 }, { x: 830, y: 180, width: 170 }, { x: 920, y: 270, width: 160 }, { x: 980, y: 370, width: 160 }, { x: 1010, y: 480, width: 160 }, { x: 1000, y: 590, width: 160 }, { x: 960, y: 690, width: 160 }, { x: 890, y: 770, width: 160 }, { x: 800, y: 830, width: 160 }, { x: 700, y: 870, width: 170 }, { x: 590, y: 890, width: 180 }, { x: 480, y: 880, width: 180 }, { x: 380, y: 840, width: 180 }, { x: 300, y: 770, width: 180 }, { x: 240, y: 680, width: 180 }, { x: 210, y: 580, width: 180 }, { x: 210, y: 480, width: 180 }, { x: 240, y: 390, width: 180 }, { x: 300, y: 320, width: 180 }, { x: 380, y: 270, width: 180 }, { x: 470, y: 240, width: 180 }, { x: 560, y: 230, width: 180 }, { x: 650, y: 240, width: 180 }, { x: 730, y: 270, width: 180 }, { x: 800, y: 320, width: 180 }, { x: 850, y: 390, width: 180 }, { x: 880, y: 470, width: 180 }, { x: 890, y: 560, width: 180 }, { x: 880, y: 650, width: 180 }, { x: 850, y: 730, width: 180 }, { x: 800, y: 800, width: 180 }, { x: 730, y: 850, width: 180 }, { x: 650, y: 880, width: 180 }, { x: 560, y: 890, width: 180 }, { x: 470, y: 880, width: 180 }, { x: 390, y: 850, width: 180 }, { x: 320, y: 800, width: 180 }, { x: 270, y: 730, width: 180 }, { x: 240, y: 650, width: 180 }, { x: 230, y: 560, width: 180 }, { x: 240, y: 470, width: 180 }, { x: 270, y: 390, width: 180 }, { x: 320, y: 320, width: 180 }, { x: 390, y: 270, width: 180 }, { x: 470, y: 240, width: 180 }, { x: 560, y: 230, width: 180 }, { x: 650, y: 240, width: 180 }, { x: 730, y: 270, width: 180 }, { x: 800, y: 320, width: 180 }, { x: 850, y: 390, width: 180 }, { x: 0, y: 0, width: 200 }
        ],
        racingLine: [0, 0.3, 0.5, 0.7, 0.9, -0.9, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.5, 0.7, 0.8, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.5, 0.7, 0.8, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.5, 0.7, 0.8, 0.9, -0.9, 0.9, 0]
    },
    {
        id: 'interlagos',
        name: 'Interlagos',
        laps: 5,
        waypoints: [
            { x: 0, y: 0, width: 200 }, { x: -50, y: 100, width: 190 }, { x: -120, y: 190, width: 180 }, { x: -210, y: 260, width: 170 }, { x: -310, y: 310, width: 160 }, { x: -410, y: 340, width: 160 }, { x: -510, y: 350, width: 160 }, { x: -600, y: 330, width: 170 }, { x: -670, y: 280, width: 180 }, { x: -710, y: 210, width: 190 }, { x: -720, y: 130, width: 190 }, { x: -700, y: 50, width: 190 }, { x: -650, y: -20, width: 190 }, { x: -580, y: -80, width: 190 }, { x: -490, y: -120, width: 190 }, { x: -390, y: -140, width: 190 }, { x: -280, y: -140, width: 190 }, { x: -170, y: -120, width: 190 }, { x: -70, y: -80, width: 200 }, { x: 20, y: -20, width: 200 }, { x: 100, y: 50, width: 200 }, { x: 160, y: 130, width: 200 }, { x: 200, y: 220, width: 200 }, { x: 220, y: 310, width: 200 }, { x: 220, y: 400, width: 200 }, { x: 200, y: 490, width: 200 }, { x: 160, y: 570, width: 200 }, { x: 100, y: 640, width: 200 }, { x: 20, y: 690, width: 200 }, { x: -70, y: 720, width: 200 }, { x: -160, y: 730, width: 200 }, { x: -250, y: 720, width: 200 }, { x: -330, y: 680, width: 200 }, { x: -400, y: 620, width: 200 }, { x: -450, y: 550, width: 200 }, { x: -480, y: 470, width: 200 }, { x: -490, y: 380, width: 200 }, { x: -480, y: 290, width: 200 }, { x: -450, y: 210, width: 200 }, { x: -400, y: 140, width: 200 }, { x: -330, y: 80, width: 200 }, { x: -250, y: 40, width: 200 }, { x: -160, y: 20, width: 200 }, { x: -70, y: 10, width: 200 }, { x: 20, y: 10, width: 200 }, { x: 100, y: 20, width: 200 }, { x: 160, y: 40, width: 200 }, { x: 200, y: 80, width: 200 }, { x: 220, y: 140, width: 200 }, { x: 0, y: 0, width: 200 }
        ],
        racingLine: [0, 0.9, -0.9, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.5, 0.7, 0.8, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.5, 0.7, 0.8, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.5, 0.7, 0.8, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.5, 0]
    },
    {
        id: 'austin',
        name: 'COTA',
        laps: 5,
        waypoints: [
            { x: 0, y: 0, width: 220 }, { x: 100, y: 50, width: 210 }, { x: 200, y: 120, width: 200 }, { x: 280, y: 210, width: 190 }, { x: 340, y: 310, width: 180 }, { x: 380, y: 420, width: 170 }, { x: 400, y: 530, width: 160 }, { x: 390, y: 640, width: 160 }, { x: 350, y: 730, width: 170 }, { x: 280, y: 800, width: 180 }, { x: 190, y: 840, width: 190 }, { x: 90, y: 850, width: 200 }, { x: -10, y: 830, width: 200 }, { x: -100, y: 780, width: 200 }, { x: -170, y: 710, width: 200 }, { x: -220, y: 620, width: 200 }, { x: -240, y: 520, width: 200 }, { x: -230, y: 420, width: 200 }, { x: -190, y: 330, width: 200 }, { x: -120, y: 260, width: 200 }, { x: -30, y: 210, width: 200 }, { x: 70, y: 180, width: 200 }, { x: 170, y: 170, width: 200 }, { x: 270, y: 180, width: 200 }, { x: 360, y: 210, width: 200 }, { x: 440, y: 260, width: 200 }, { x: 500, y: 330, width: 200 }, { x: 540, y: 410, width: 200 }, { x: 560, y: 500, width: 200 }, { x: 560, y: 590, width: 200 }, { x: 540, y: 680, width: 200 }, { x: 500, y: 760, width: 200 }, { x: 440, y: 830, width: 200 }, { x: 360, y: 880, width: 200 }, { x: 270, y: 910, width: 200 }, { x: 170, y: 920, width: 200 }, { x: 70, y: 910, width: 200 }, { x: -20, y: 880, width: 200 }, { x: -100, y: 830, width: 200 }, { x: -160, y: 760, width: 200 }, { x: -200, y: 680, width: 200 }, { x: -220, y: 590, width: 200 }, { x: -220, y: 500, width: 200 }, { x: -200, y: 410, width: 200 }, { x: -160, y: 330, width: 200 }, { x: -100, y: 260, width: 200 }, { x: -20, y: 210, width: 200 }, { x: 70, y: 180, width: 200 }, { x: 0, y: 0, width: 220 }
        ],
        racingLine: [0, 0.3, 0.5, 0.7, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.5, 0.7, 0.8, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.5, 0.7, 0.8, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0.3, 0.5, 0.7, 0.8, 0.9, -0.9, 0.9, -0.9, 0.8, 0.5, 0.3, 0, 0]
    }
];

window.loadTracksFromGeoJSON = async (callback) => {
    try {
        console.log("Fetching tracks...");
        const response = await fetch('https://raw.githubusercontent.com/bacinger/f1-circuits/master/f1-circuits.geojson');
        if (!response.ok) throw new Error('Failed to load track data');

        const data = await response.json();
        const newTracks = [];

        // 2026 Calendar (Official Order & Search Terms)
        const calendar2026 = [
            { name: 'Australia', search: ['Albert Park', 'Melbourne'] },
            { name: 'China', search: ['Shanghai'] },
            { name: 'Japan', search: ['Suzuka'] },
            { name: 'Bahrain', search: ['Bahrain', 'Sakhir'] },
            { name: 'Saudi Arabia', search: ['Jeddah'] },
            { name: 'USA (Miami)', search: ['Miami'] },
            { name: 'Canada', search: ['Gilles Villeneuve', 'Montreal'] },
            { name: 'Monaco', search: ['Monaco'] },
            { name: 'Spain (Barcelona)', search: ['Catalunya', 'Barcelona'] },
            { name: 'Austria', search: ['Red Bull Ring', 'Spielberg'] },
            { name: 'Great Britain', search: ['Silverstone'] },
            { name: 'Belgium', search: ['Spa', 'Francorchamps'] },
            { name: 'Hungary', search: ['Hungaroring', 'Budapest'] },
            { name: 'Netherlands', search: ['Zandvoort'] },
            { name: 'Italy (Monza)', search: ['Monza'] },
            { name: 'Spain (Madrid)', search: ['Madrid'] }, // New track
            { name: 'Azerbaijan', search: ['Baku'] },
            { name: 'Singapore', search: ['Marina Bay', 'Singapore'] },
            { name: 'USA (Austin)', search: ['Americas', 'Austin'] },
            { name: 'Mexico', search: ['Rodriguez', 'Mexico'] },
            { name: 'Brazil', search: ['Interlagos', 'Carlos Pace'] },
            { name: 'USA (Las Vegas)', search: ['Las Vegas'] },
            { name: 'Qatar' , search: ['Lusail', 'Losail'] },
            { name: 'UAE (Abu Dhabi)', search: ['Yas Marina', 'Abu Dhabi'] }
        ];

        data.features.forEach(feature => {
            const props = feature.properties;
            const name = props.Name || props.name || '';
            const location = props.Location || props.location || '';

            if (!name && !location) return;

            // Find matching calendar entry
            const calendarEntry = calendar2026.find(entry => {
                return entry.search.some(term =>
                    name.toLowerCase().includes(term.toLowerCase()) ||
                    location.toLowerCase().includes(term.toLowerCase())
                );
            });

            if (calendarEntry) {
                const geometry = feature.geometry;

                if (geometry.type === 'LineString' || geometry.type === 'Polygon') {
                    let coords = geometry.type === 'LineString' ? geometry.coordinates : geometry.coordinates[0];

                    // Check if we already added this track (avoid duplicates if multiple GeoJSON features match)
                    if (newTracks.some(t => t.name === calendarEntry.name)) return;

                    // Convert to game waypoints
                    const waypoints = processCoordinates(coords);

                    // Generate racing line (center for now)
                    const racingLine = generateRacingLine(waypoints);

                    newTracks.push({
                        id: calendarEntry.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                        name: calendarEntry.name,
                        location: location || name,
                        laps: 5, // Default
                        waypoints: waypoints,
                        racingLine: racingLine,
                        order: calendar2026.indexOf(calendarEntry)
                    });
                }
            }
        });

        // Check for missing tracks and add placeholders
        calendar2026.forEach((entry, index) => {
            const exists = newTracks.find(t => t.name === entry.name);
            if (!exists) {
                console.warn(`Track ${entry.name} not found in GeoJSON. Generating placeholder.`);
                newTracks.push({
                    id: entry.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    name: entry.name + ' (Preview)',
                    location: 'TBD',
                    laps: 5,
                    waypoints: generatePlaceholderTrack(),
                    racingLine: new Array(100).fill(0),
                    order: index
                });
            }
        });

        // Sort by calendar order
        newTracks.sort((a, b) => a.order - b.order);

        if (newTracks.length > 0) {
            window.TRACKS = newTracks;
            console.log(`Loaded ${newTracks.length} tracks from GeoJSON matching 2026 calendar`);
            if (callback) callback();
        }

    } catch (e) {
        console.error("Error loading tracks:", e);
    }
};

function processCoordinates(coords) {
    // 1. Find Bounding Box
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    coords.forEach(p => {
        const x = p[0]; // Lon
        const y = p[1]; // Lat
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    });

    // 2. Scale to Game World (e.g. 6000px wide)
    const TARGET_SIZE = 6000;
    const width = maxX - minX;
    const height = maxY - minY;
    const scale = TARGET_SIZE / Math.max(width, height);

    // 3. Convert
    const waypoints = [];
    // Downsample if too many points (some GeoJSONs are huge)
    const step = Math.max(1, Math.ceil(coords.length / 400)); // Target ~400 points

    for (let i = 0; i < coords.length; i += step) {
        const p = coords[i];
        // Flip Y because Canvas Y is down, Lat is up
        // Center the track
        const x = (p[0] - minX) * scale - (width * scale) / 2;
        const y = -((p[1] - minY) * scale - (height * scale) / 2);

        waypoints.push({
            x: x,
            y: y,
            width: 180 + Math.random() * 40 // Varying width slightly
        });
    }

    return waypoints;
}


function generateRacingLine(waypoints) {
    // Simple heuristic: cut corners
    // In a real app, we'd simulate a lap or use more complex math
    // For now, just return 0s or slight randoms to prevent errors
    return new Array(waypoints.length).fill(0);
}

function generatePlaceholderTrack() {
    // Create a simple rounded rectangle loop
    const waypoints = [];
    const width = 2000;
    const height = 1000;
    const steps = 25;

    // Top straight
    for (let i = 0; i < steps; i++) {
        waypoints.push({ x: -width / 2 + (width * i / steps), y: -height / 2, width: 200 });
    }
    // Right turn
    for (let i = 0; i < steps / 2; i++) {
        const angle = (Math.PI / 2) * (i / (steps / 2));
        waypoints.push({
            x: width / 2 + Math.sin(angle) * 500,
            y: -height / 2 + (1 - Math.cos(angle)) * 500,
            width: 200
        });
    }
    // Bottom straight
    for (let i = 0; i < steps; i++) {
        waypoints.push({ x: width / 2 - (width * i / steps), y: height / 2, width: 200 });
    }
    // Left turn
    for (let i = 0; i < steps / 2; i++) {
        const angle = (Math.PI / 2) * (i / (steps / 2));
        waypoints.push({
            x: -width / 2 - Math.sin(angle) * 500,
            y: height / 2 - (1 - Math.cos(angle)) * 500,
            width: 200
        });
    }

    return waypoints;
}
