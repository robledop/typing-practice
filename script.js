"use strict";

let currentWordIndex = 0;
let allWords;
let words;
let practiceWords;
let wordElements;
let currentWordWrong = false;
const inputElement = document.querySelector("#input");
const textElement = document.querySelector("#text");
const headerElement = document.querySelector("#header");
const footerElement = document.querySelector("#footer");
let start;
let end;
let numberOfWords;
let wpm;

async function getFile(fileURL) {
    let fileContent = await fetch(fileURL);
    fileContent = await fileContent.text();
    return fileContent.split("\n").sort(() => 0.5 - Math.random());
}

async function init() {
    currentWordIndex = 0;
    inputElement.value = "";
    allWords = await getFile("words.txt");
    practiceWords = new Map(JSON.parse(localStorage.getItem("practiceWords")));
    words = allWords
        .slice(0, 30 - practiceWords.size)
        .concat(...practiceWords.keys());

    let numberOfLetters = words.reduce((acc, word) => acc + word.length, 0);
    numberOfWords = numberOfLetters / 5;

    console.log(numberOfWords);
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
            if (currentWordWrong) {
                const currentWord = words[currentWordIndex];
                let mistakes = practiceWords.get(currentWord) ?? 0;
                practiceWords.set(currentWord, (mistakes += 2));

                localStorage.setItem(
                    "practiceWords",
                    JSON.stringify([...practiceWords])
                );
            } else {
                let mistakes = practiceWords.get(words[currentWordIndex]) ?? 0;
                if (mistakes > 0) {
                    practiceWords.set(words[currentWordIndex], --mistakes);
                    localStorage.setItem(
                        "practiceWords",
                        JSON.stringify([...practiceWords])
                    );
                }
                if (mistakes === 0) {
                    practiceWords.delete(words[currentWordIndex]);
                    localStorage.setItem(
                        "practiceWords",
                        JSON.stringify([...practiceWords])
                    );
                }
            }

            if (currentWordIndex === words.length - 1) {
                end = performance.now();
                wpm = Math.round((numberOfWords / (end - start)) * 60000);
                footerElement.innerText = `You typed ${wpm} words per minute`;
                await init();
            } else {
                if (currentWordWrong) {
                    wordElements[currentWordIndex].classList.add("past-wrong");
                }
                wordElements[currentWordIndex].classList.add("complete");
                inputElement.value = "";
                wordElements[currentWordIndex].classList.remove("current");
                currentWordIndex++;
                wordElements[currentWordIndex].classList.add("current");
                inputElement.attributes.placeholder.value = `Type the word '${words[currentWordIndex]}'`;
            }

            currentWordWrong = false;
        }
    } else {
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
        }

        if (inputElement.value === "") {
            wordElements[currentWordIndex].classList.remove("complete");
            wordElements[currentWordIndex].classList.remove("wrong");
        }
    }
    setHeader();
});

document.querySelector("body").addEventListener("keydown", (e) => {
    inputElement.focus();
});

function setHeader() {
    if (practiceWords.size > 0) {
        headerElement.innerText = `Words that need practice: ${practiceWords.size}`;
    } else {
        headerElement.innerText = "";
    }
}
