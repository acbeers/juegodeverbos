import React, { useEffect, useState } from "react";
import { Button, Card, Typography, TextField } from "@mui/material";
import "./App.css";

const personPrompts = [
  "Yo",
  "Tú",
  "El/ella/usted",
  "Nosotros",
  "Vosotros",
  "Ellos,ellas/ustedes",
];

const allowedTenses = [
  "Present",
  "Imperfect",
  "Preterite",
  "Future",
  "Conditional",
];

function App() {
  const [verbs, setVerbs] = useState([]);
  const [tenses, setTenses] = useState([]);
  const [gameData, setGameData] = useState([]);
  const [gamePos, setGamePos] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answering, setAnswering] = useState(true);
  const [response, setResponse] = useState(null);
  const [numCorrect, setNumCorrect] = useState(0);

  // Load our verbs on startup.
  useEffect(() => {
    fetch("verbs.json")
      .then((resp) => resp.json())
      .then((data) => {
        setVerbs(data);
        setTenses(allowedTenses);
      });
  }, []);

  // Create a random set for a game.
  const gameLength = 20;
  const makeGameData = () => {
    const data = [...Array(gameLength)].map(() => {
      return {
        index: Math.floor(Math.random() * verbs.length),
        person: Math.floor(Math.random() * 6),
        tense: Math.floor(Math.random() * tenses.length),
      };
    });
    setGameData(data);
    setGamePos(0);
  };

  useEffect(() => {
    makeGameData();
  }, [verbs, tenses]);

  if (gameData.length === 0 || verbs.length === 0) {
    return <div>nothing</div>;
  }

  const deaccent = (str) => {
    return str
      .replace("á", "a")
      .replace("í", "i")
      .replace("é", "e")
      .replace("ó", "o")
      .replace("ú", "u")
      .replace("ñ", "n");
  };

  const handleInput = (str) => {
    const ans = verb.tenses[tense].words[step.person].word;
    const correct = ans === str;
    const dcorrect = deaccent(ans) === str;
    const resp = {
      correct: correct || dcorrect,
      accents: dcorrect && !correct,
      irregular: verb.tenses[tense].words[step.person].irregular,
      ans: ans,
    };
    setResponse(resp);
    if (correct || dcorrect) setNumCorrect(numCorrect + 1);
    setAnswering(false);
  };

  const handleNext = () => {
    setAnswer("");
    setGamePos(gamePos + 1);
    setAnswering(true);
    setResponse(null);
  };

  const restart = () => {
    makeGameData();
    setAnswering(true);
    setResponse(null);
    setNumCorrect(0);
  };

  if (gamePos >= gameLength)
    return (
      <div className="App">
        Game finished. You got {numCorrect} correct.
        <Button onClick={restart}>Start again</Button>
      </div>
    );

  const step = gameData[gamePos];
  const verb = verbs[step.index];
  const tense = tenses[step.tense];

  let respMsg = "";
  if (response) {
    const cls = response.correct ? "correct" : "incorrect";
    const msg = response.correct ? "Correct!" : "Incorrect!";
    const submsg = response.accents
      ? `But watch your accents: ${response.ans}`
      : response.correct
      ? ""
      : `The correct answer is ${response.ans}`;
    const irreg = response.irregular ? "This is an irregular form!" : "";
    respMsg = (
      <div>
        <div>
          <span className={cls}>{msg}</span> <span>{submsg}</span>
        </div>
        <div>{irreg}</div>
      </div>
    );
  }

  return (
    <div className="App">
      <Card sx={{ maxWidth: 500 }}>
        <Typography variant="h5">
          {gamePos + 1}/{gameLength}
        </Typography>
        <Typography variant="h5">
          <img title={verb.verb} alt={verb.verb} src={`images/${verb.image}`} />
        </Typography>
        <Typography sx={{ verticalAlign: "bottom" }} variant="h5">
          {personPrompts[step.person]}{" "}
          <TextField
            variant="filled"
            size="small"
            hiddenLabel
            helperText={tense}
            value={answer}
            onChange={(evt) => setAnswer(evt.target.value)}
            onKeyPress={(ev) => {
              if (ev.key === "Enter") {
                if (answering) handleInput(ev.target.value);
                else handleNext();
                ev.preventDefault();
              }
            }}
          />
        </Typography>
        <div>{respMsg}</div>
      </Card>
    </div>
  );
}

export default App;
