import {LEVELS, images} from './constants.js';

const updateCounter = () => {
    const count = window.localStorage.getItem('wrongGuesses');
    const counter = document.getElementsByClassName('counter')[0];
    counter.innerText = count;
};

const addCounter = () => {
    const scores = document.getElementById('scores');
    scores.classList.toggle('invisible');

    const count = document.createElement('span');
    count.classList.toggle('counter');
    count.innerText = window.localStorage.getItem('wrongGuesses');
    scores.append(count);
};

const addToLocalStorage = (key) => {
    const curr = window.localStorage.getItem(key);
    const next = `${Number(curr) + 1}`;
    window.localStorage.setItem(key, next);
};

const handleOpenDifferentCards = (card, alreadyFlipped) => {
    const game = document.getElementsByClassName('game')[0];
    game.classList.toggle('paused'); // prevent the user from doing anything for a sec
    addToLocalStorage('wrongGuesses');
    updateCounter();
    const timeout = setTimeout(() => {
        game.classList.toggle('paused');
        card.classList.toggle('flipCard');
        alreadyFlipped.classList.toggle('flipCard');
        clearTimeout(timeout);
    }, 1000)
};

const onNewGameClick = (modal) => {
    const board = document.getElementsByClassName('board')[0];
    const table = document.getElementById('winners-table');
    let body = document.getElementById('winners-table-body');

    const name = document.getElementById('name')?.value;
    const winners = JSON.parse(window.localStorage.getItem('winners'));
    const scores = document.getElementById('scores');
    scores.classList.toggle('invisible');

    winners[name] = window.localStorage.getItem('wrongGuesses');
    board.classList.toggle('invisible');
    table.classList.toggle('invisible');
    table.removeChild(body);
    body = document.createElement('tbody');
    body.id = 'winners-table-body';
    table.append(body);

    init();
    window.localStorage.setItem('winners', JSON.stringify(winners));
    modal.classList.toggle('invisible');
    createWinnersTable();

};
const checkWinning = (level) => {
    if (Number(window.localStorage.getItem('matches')) === (LEVELS[level][0] * LEVELS[level][1])/2) {
        const modal = document.getElementById('win-modal');
        modal.classList.toggle('invisible');
        const newGameButton = document.getElementById('new-game');
        newGameButton.addEventListener('click', () => onNewGameClick(modal))
    }
};

const handleMatch = (card, alreadyFlipped, level) => {
    alreadyFlipped.classList.toggle('picked');
    card.classList.toggle('picked');
    alreadyFlipped.classList.toggle('flipCard');
    alreadyFlipped.addEventListener('click', () => null);
    card.addEventListener('click', () => null);
    // count matches
    addToLocalStorage('matches');
    checkWinning(level);
};


const flipCard = (card, level) => {
    const alreadyFlipped = document.getElementsByClassName('flipCard')[0];

    if (alreadyFlipped) {
        // found a match
        if (alreadyFlipped !== card && alreadyFlipped.children[0].children[0].src === card.children[0].children[0].src) {
            handleMatch(card, alreadyFlipped, level);
            return;
        } else { // different cards opened
            handleOpenDifferentCards(card, alreadyFlipped);
        }
    }

    card.classList.toggle('flipCard');
};

const getRandomImages = (level) => {
    const selected = images.slice(0,LEVELS[level][0] * LEVELS[level][1]/2);
    return [...selected, ...selected].sort(() => 0.5 - Math.random());
};

const addCard = (cell, randomImages, row, col, level) => {
    const shapes = document.getElementById('shapes');
    const shape = shapes.options[shapes.selectedIndex].value;

    let container = document.createElement('div');
    container.className = `flip-card ${shape}`;

    let inner = document.createElement('div');
    inner.className = "flip-card-inner";
    inner.addEventListener('click', () => flipCard(inner, level));

    let front = document.createElement('div');
    front.className = "flip-card-front";
    let back = document.createElement('div');
    back.className = "flip-card-back";

    let img = document.createElement('img');
    img.src = randomImages[row*LEVELS[level][1] + col];

    front.append(img);
    inner.append(front);
    inner.append(back);
    container.append(inner);
    cell.append(container);
};
export const createBoard = (level) => {
    const game = document.querySelector('.game');
    let table = document.querySelector('.board'); // find the table element
    let randomImages = getRandomImages(level);
    if (table) {
        table.remove();
    }
    //body.removeChild(table); // remove the existing table
    // create a new table
    table = document.createElement('table');
    table.className = 'board';
    game.append(table);

    for (let i=0; i< LEVELS[level][0]; i++) {
        let row = document.createElement('tr');
        for (let j = 0; j < LEVELS[level][1]; j++) {
            let cell = document.createElement('th');
            addCard(cell, randomImages, i, j, level);
            row.append(cell);
        }
        table.append(row);
    }
};

const createWinnersTable = () => {
    const winners = JSON.parse(window.localStorage.getItem('winners'));
    const table = document.getElementById('winners-table-body');

    Object.entries(winners)
        .sort((a,b) => a.score - b.score).slice(0, 9)
        .forEach(([name, score]) => {
            let row = document.createElement('tr');
            let first = document.createElement('td');
            first.innerText = name;
            let second = document.createElement('td');
            second.innerText = score;
            row.append(first);
            row.append(second);
            table.append(row)
        })

};

export function onStart() {
    const select = document.getElementById('levels');
    const themes = document.getElementById('themes');
    const game = document.getElementById('game');

    const table = document.getElementById('winners-table');
    const value = select.options[select.selectedIndex].value;

    const theme = themes.options[themes.selectedIndex].value;
    game.className = `game ${theme}`;

    table.classList.toggle('invisible');
    window.localStorage.setItem('wrongGuesses', '0');

    createBoard(value);
    addCounter();
};


const init = () => {
    const store = window.localStorage;
    store.setItem('wrongGuesses', '0');
    store.setItem('matches', '0');
    store.setItem('winners', JSON.stringify({}));
    createWinnersTable();
    document.getElementById('start').addEventListener('click', onStart);
};

init();
