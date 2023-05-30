"use strict";

let currentWordIndex = 0;
let allWords;
let words;
let practiceWords;
let wordElements;
let currentWordWrong = false;
let start;
let end;
let numberOfWords;
let numberOfLetters;
let wpm;
let testMistakes;

const inputElement = document.querySelector("#input");
const textElement = document.querySelector("#text");
const headerElement = document.querySelector("#header");
const footerElement = document.querySelector("#footer");

async function getFile(fileURL) {
    let fileContent = await fetch(fileURL);
    fileContent = await fileContent.text();
    return fileContent.split("\n");
}

async function init() {
    testMistakes = 0;
    currentWordIndex = 0;
    inputElement.value = "";
    allWords ??= await getFile("words.txt");
    practiceWords = new Map(JSON.parse(localStorage.getItem("practiceWords")));

    words = allWords
        .sort(() => 0.5 - Math.random())
        .slice(0, 30 - practiceWords.size)
        .concat(...practiceWords.keys())
        .sort(() => 0.5 - Math.random());

    numberOfLetters = words.reduce((acc, word) => acc + word.length, 0);
    numberOfWords = numberOfLetters / 5;
    textElement.innerHTML = "";

    words.forEach((word) => {
        const wordElement = document.createElement("span");
        wordElement.classList.add("word");
        wordElement.innerText = ` ${word} `;
        textElement.appendChild(wordElement);
    });

    inputElement.focus();
    wordElements = document.querySelectorAll("span");
    inputElement.attributes.placeholder.value = `Type the word '${words[currentWordIndex]}'`;

    setHeader();
}

await init();

inputElement.addEventListener("input", async (e) => {
    if (e.data === " ") {
        if (inputElement.value.trim() !== words[currentWordIndex]) {
            wordElements[currentWordIndex].classList.add("wrong");
            currentWordWrong = true;
        } else {
            checkCurrentWord();
            await jumpToNextWord();
            currentWordWrong = false;
        }
    } else {
        checkInput(e.data);
    }
    setHeader();
});

document.querySelector("body").addEventListener("keydown", (e) => {
    inputElement.focus();
});

function checkInput(key) {
    if (currentWordIndex === 0 && inputElement.value.length === 1) {
        start = performance.now();
        footerElement.innerText = "";
    }

    wordElements[currentWordIndex].classList.add("current");
    const currentWord = words[currentWordIndex];
    const currentInput = inputElement.value;
    const isCorrect = currentWord.startsWith(currentInput);
    if (isCorrect) {
        wordElements[currentWordIndex].classList.remove("wrong");
        inputElement.classList.remove("wrong");
    } else {
        wordElements[currentWordIndex].classList.remove("complete");
        wordElements[currentWordIndex].classList.add("wrong");
        inputElement.classList.add("wrong");

        currentWordWrong = true;
        if (key !== "Backspace") {
            testMistakes++;
        }
    }

    if (inputElement.value === "") {
        wordElements[currentWordIndex].classList.remove("complete");
        wordElements[currentWordIndex].classList.remove("wrong");
    }
}

async function jumpToNextWord() {
    if (currentWordIndex === words.length - 1) {
        end = performance.now();
        wpm = Math.round((numberOfWords / (end - start)) * 60000);
        let accuracy = Math.round(100 - (testMistakes / numberOfLetters) * 100);
        footerElement.innerText = `You typed ${wpm} words per minute with ${accuracy}% accuracy`;
        console.log(
            `Number of letters: ${numberOfLetters}, `,
            `Number of mistakes: ${testMistakes}`
        );
        await init();
    } else {
        if (currentWordWrong) {
            wordElements[currentWordIndex].classList.add("mistake");
        }
        wordElements[currentWordIndex].classList.add("complete");
        inputElement.value = "";
        wordElements[currentWordIndex].classList.remove("current");
        currentWordIndex++;
        wordElements[currentWordIndex].classList.add("current");
        inputElement.attributes.placeholder.value = `Type the word '${words[currentWordIndex]}'`;
    }
}

function checkCurrentWord() {
    if (currentWordWrong) {
        const currentWord = words[currentWordIndex];
        let mistakes = practiceWords.get(currentWord) ?? 0;
        practiceWords.set(currentWord, (mistakes += 2));
    } else {
        let mistakes = practiceWords.get(words[currentWordIndex]) ?? 0;
        if (mistakes > 1) {
            practiceWords.set(words[currentWordIndex], --mistakes);
        } else {
            practiceWords.delete(words[currentWordIndex]);
        }
    }

    save();
}

function save() {
    localStorage.setItem("practiceWords", JSON.stringify([...practiceWords]));
}

function setHeader() {
    if (practiceWords.size > 0) {
        headerElement.innerText = `Words that need practice: ${practiceWords.size}`;
    } else {
        headerElement.innerText = "";
    }
}
