

let score = 0;
let FPS = 30;
let WEAPON_ROTATION_SPEED = 5;
let ENEMY_SPEED = 0.2;
let ENEMY_SPAWN_FREQUENCY = 0.2; // in seconds

const intervals = {
    gameEngine: null,
    enemySpawner: null
};

const MAX_POSITION = 100;
const SAFE_ZONE_LENGTH = 10;

const gameElement = document.getElementById('game');
const avatarElement = document.getElementById('avatar');
const swordElements = Array.from(document.querySelectorAll('.sword'));
const scoreboardElement = document.getElementById('scoreboard');
const startScreenElement = document.getElementById('start-screen');
const gameOverScreenElement = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const playAgainButton = document.getElementById('play-again-button');
const finalScoreSpan = document.getElementById('final-score-span');

const upArrowElement = document.querySelector('.arrow#up');
const downArrowElement = document.querySelector('.arrow#down');
const leftArrowElement = document.querySelector('.arrow#left');
const rightArrowElement = document.querySelector('.arrow#right');
const arrowElements = Array.from(document.querySelectorAll('.arrow'));

class Enemy {
    constructor() {
        this._id = crypto.randomUUID();

        const safeZoneMinX = position.x - SAFE_ZONE_LENGTH;
        const safeZoneMaxX = position.x + SAFE_ZONE_LENGTH;
        const safeZoneMinY = position.y - SAFE_ZONE_LENGTH;
        const safeZoneMaxY = position.y + SAFE_ZONE_LENGTH;
        this.position = {
            x: randomElementFromArray([randomIntBetween(5, safeZoneMinX), randomIntBetween(safeZoneMaxX, 95)]),
            y: randomElementFromArray([randomIntBetween(5, safeZoneMinY), randomIntBetween(safeZoneMaxY, 95)])
        };

        const enemyElement = document.createElement('div');
        enemyElement.classList.add('enemy');
        enemyElement.style.left = `${this.position.x}%`;
        enemyElement.style.top = `${this.position.y}%`;
        gameElement.appendChild(enemyElement);

        this.element = enemyElement;
    }

    move() {
        const velocityX = parseFloat(avatarElement.style.left) > parseFloat(this.element.style.left) ? 1 : -1;
        const velocityY = parseFloat(avatarElement.style.top) > parseFloat(this.element.style.top) ? 1 : -1;

        this.position.x += velocityX * ENEMY_SPEED;
        this.position.y += velocityY * ENEMY_SPEED;
        this.element.style.left = `${this.position.x}%`;
        this.element.style.top = `${this.position.y}%`;
    }

    remove() {
        this.element.remove();
        enemies = enemies.filter(enemy => enemy._id !== this._id);
    }
}

const velocity = {
    x: 0,
    y: 0
};

const position = {
    x: 50,
    y: 50
};

let weaponDeg = 0;

let enemies = [new Enemy];

function initControls() {
    document.addEventListener('touchstart', (e) => e.preventDefault());

    document.addEventListener('keydown', (e) => {
        e.preventDefault();
        if (e.key === 'ArrowUp') {
            velocity.y = -1;
        } else if (e.key === 'ArrowDown') {
            velocity.y = 1;
        } else if (e.key === 'ArrowLeft') {
            velocity.x = -1;
        } else if (e.key === 'ArrowRight') {
            velocity.x = 1;
        } else if (e.key === ' ') {
            if (!intervals.gameEngine) {
                startGameEngine();
                startEnemySpawner();
            } else {
                pauseGameEngine();
                pauseEnemySpawner();
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            velocity.y = 0;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            velocity.x = 0;
        }
    });

    arrowElements.forEach(arrowElement => {
        arrowElement.addEventListener('pointerdown', (e) => {
            if (arrowElement.id === 'up') {
                velocity.y = -1;
                document.addEventListener('pointerup', () => velocity.y = 0);
            } else if (arrowElement.id === 'down') {
                velocity.y = 1;
                document.addEventListener('pointerup', () => velocity.y = 0);
            } else if (arrowElement.id === 'left') {
                velocity.x = -1;
                document.addEventListener('pointerup', () => velocity.x = 0);
            } else if (arrowElement.id === 'right') {
                velocity.x = 1;
                document.addEventListener('pointerup', () => velocity.x = 0);
            }
        });
    });

    playAgainButton.addEventListener('click', () => startNewGame());
    startButton.addEventListener('click', () => startNewGame());
}

function startGameEngine() {
    intervals.gameEngine = setInterval(() => {
        const newPositionX = position.x + velocity.x;
        const newPositionY = position.y + velocity.y;
        if (newPositionX >= 0 && newPositionX <= 100) {
            position.x += velocity.x;
        }
        if (newPositionY >= 0 && newPositionY <= 100) {
            position.y += velocity.y;
        }
        avatarElement.style.left = `${position.x}%`;
        avatarElement.style.top = `${position.y}%`;

        let newWeaponDeg = weaponDeg + WEAPON_ROTATION_SPEED;
        while (newWeaponDeg > 360) {
            newWeaponDeg -= 360;
        }
        weaponDeg = newWeaponDeg;
        swordElements.forEach(swordElement => swordElement.style.transform = `rotate(${weaponDeg}deg)`);

        enemies.forEach(enemy => {
            enemy.move();
            if (elementsAreOverlapping(enemy.element, avatarElement)) {
                gameOver();
            } else {
                swordElements.forEach(swordElement => {
                    if (elementsAreOverlapping(enemy.element, swordElement)) {
                        enemy.remove();
                        incrementScore();
                    }
                });
            }
        });
    }, 1000 / FPS);
}

function startEnemySpawner() {
    intervals.enemySpawner = setInterval(() => {
        const enemy = new Enemy();
        enemies.push(enemy);
    }, ENEMY_SPAWN_FREQUENCY * 1000);
}

function pauseEnemySpawner() {
    if (!intervals.enemySpawner) return;
    clearInterval(intervals.enemySpawner);
    intervals.enemySpawner = null;
}

function applyQueryParamOptions() {
    const queryParams = new URLSearchParams(window.location.search);

    const swordLength = parseFloat(queryParams.get('sword-length'));
    if (!!swordLength) {
        swordElements.forEach(swordElement => swordElement.style.width = `${swordLength}px`);
    }

    const weaponRotationSpeed = parseFloat(queryParams.get('weapon-rotation-speed'));
    if (!!weaponRotationSpeed) {
        WEAPON_ROTATION_SPEED = weaponRotationSpeed;
    }

    const enemySpeed = parseFloat(queryParams.get('enemy-speed'));
    if (!!enemySpeed) {
        ENEMY_SPEED = enemySpeed;
    }

    const enemySpawnFrequency = parseFloat(queryParams.get('enemy-spawn-frequency'));
    if (!!enemySpawnFrequency) {
        ENEMY_SPAWN_FREQUENCY = enemySpawnFrequency;
    }

    const avatarColor = parseFloat(queryParams.get('avatar-color'));
    if (!!avatarColor) {
        avatarElement.style.background = avatarColor;
    }
}

function elementsAreOverlapping(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

function randomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElementFromArray(array = []) {
    if (array.length === 0) {
        return undefined;
    }

    // Generate a random index within the array length
    const randomIndex = Math.floor(Math.random() * array.length);

    // Return the element at the random index
    return array[randomIndex];
}

function startNewGame() {
    enemies.forEach(enemy => enemy.remove());
    enemies.length = 0;

    startScreenElement.classList.add('hidden');
    gameOverScreenElement.classList.add('hidden');
    finalScoreSpan.innerText = '';

    resetScore();

    clearInterval(intervals.gameEngine);
    intervals.gameEngine = null;

    clearInterval(intervals.enemySpawner);
    intervals.enemySpawner = null;

    startGameEngine();
    startEnemySpawner();
}

function pauseGameEngine() {
    if (!intervals.gameEngine) return;
    clearInterval(intervals.gameEngine);
    intervals.gameEngine = null;
}

function incrementScore(points = 1) {
    score = score + points;
    scoreboardElement.innerText = score;
}

function resetScore() {
    score = 0;
    scoreboardElement.innerText = score;
}

function gameOver() {
    pauseGameEngine();
    pauseEnemySpawner();

    finalScoreSpan.innerText = score;
    gameOverScreenElement.classList.remove('hidden');
}

applyQueryParamOptions();
initControls();
