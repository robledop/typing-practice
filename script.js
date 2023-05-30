"use strict";

const mainElement = document.querySelector("#main");
const inputElement = document.querySelector("#input");

async function getFile(fileURL) {
    let fileContent = await fetch(fileURL);
    fileContent = await fileContent.text();
    return fileContent
        .trim()
        .split("\n")
        .sort(() => 0.5 - Math.random());
}

const allWords = await getFile("words.txt");
console.log(allWords);

const words = allWords.slice(0, 20);

words.forEach((word) => {
    const wordElement = document.createElement("span");
    wordElement.classList.add("word");
    wordElement.innerText = ` ${word} `;
    mainElement.appendChild(wordElement);
});

inputElement.focus();

const wordElements = document.querySelectorAll("span");

let currentWordIndex = 0;
inputElement.addEventListener("input", (e) => {
    if (e.data === " ") {
        inputElement.value = "";
        currentWordIndex++;
        wordElements[currentWordIndex - 1].classList.remove("current");
        wordElements[currentWordIndex].classList.add("current");
    }

    const correctWord = words[currentWordIndex] === inputElement.value;
    if (correctWord) {
        wordElements[currentWordIndex].classList.add("correct");
        wordElements[currentWordIndex].classList.remove("wrong");
    }
    else {
        wordElements[currentWordIndex].classList.remove("correct");
        wordElements[currentWordIndex].classList.add("wrong");
    }
});

