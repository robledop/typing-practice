"use strict";

const textElement = document.querySelector("#text");
const inputElement = document.querySelector("#input");
let practiceWords = new Map(JSON.parse(localStorage.getItem("practiceWords")));
let numberOfWordsThatNeedPractice = practiceWords.size;

async function getFile(fileURL) {
    let fileContent = await fetch(fileURL);
    fileContent = await fileContent.text();
    return fileContent.split("\n").sort(() => 0.5 - Math.random());
}

const allWords = await getFile("words.txt");
const words = allWords.slice(0, 30 - numberOfWordsThatNeedPractice).concat(...practiceWords.keys());

words.forEach((word) => {
    const wordElement = document.createElement("span");
    wordElement.classList.add("word");
    wordElement.innerText = ` ${word} `;
    textElement.appendChild(wordElement);
});

inputElement.focus();

const wordElements = document.querySelectorAll("span");

let currentWordIndex = 0;
inputElement.attributes.placeholder.value = `Type the word '${words[currentWordIndex]}'`;
inputElement.addEventListener("input", (e) => {
    if (e.data === " ") {
        if (inputElement.value.trim() !== words[currentWordIndex]) {
            wordElements[currentWordIndex].classList.add("wrong");
        } else {
            wordElements[currentWordIndex].classList.add("correct");
        }

        inputElement.value = "";
        currentWordIndex++;
        wordElements[currentWordIndex - 1].classList.remove("current");
        inputElement.attributes.placeholder.value = `Type the word '${words[currentWordIndex]}'`;
    }
    wordElements[currentWordIndex].classList.add("current");

    const currentWord = words[currentWordIndex];
    const currentInput = inputElement.value;
    const isCorrect = currentWord.startsWith(currentInput);
    if (isCorrect) {
        wordElements[currentWordIndex].classList.remove("wrong");
        inputElement.classList.remove("wrong");
    } else {
        wordElements[currentWordIndex].classList.remove("correct");
        wordElements[currentWordIndex].classList.add("wrong");
        inputElement.classList.add("wrong");

        let mistakes = practiceWords.get(currentWord) ?? 0;
        practiceWords.set(currentWord, ++mistakes);

        localStorage.setItem(
            "practiceWords",
            JSON.stringify([...practiceWords])
        );
    }

    if (inputElement.value === "") {
        wordElements[currentWordIndex].classList.remove("correct");
        wordElements[currentWordIndex].classList.remove("wrong");
    }
});
