import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Typography,
  TextField,
  Container,
  Box,
} from "@mui/material";
import "./App.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import {
  CorrectResponse,
  IncorrectResponse,
  AccentResponse,
} from "./Responses";

const personPrompts = [
  "Yo",
  "Tú",
  "Él/ella/usted",
  "Nosotros",
  "Vosotros",
  "Ellos/ellas/ustedes",
];

const allowedTenses = [
  "Present",
  "Imperfect",
  "Preterite",
  "Future",
  "Conditional",
];

// Spanish names for extracted tense names, which are in English.
const tenseNames = {
  Present: "Presente",
  Imperfect: "Pretérito imperfecto",
  Preterite: "Pretérito perfecto",
  Future: "Futuro",
  Conditional: "Condicional",
};

const theme = createTheme();

function App() {
  // Allowed verbs and tenses, set once
  const [verbs, setVerbs] = useState([]);
  const [tenses, setTenses] = useState([]);
  // Generated random game data, set for each game.
  const [gameData, setGameData] = useState([]);
  // The current position within the game.
  const [gamePos, setGamePos] = useState(0);
  // The answer that the user typed
  const [answer, setAnswer] = useState("");
  // Whether we are answering (true) or displaying a repsonse (false)
  const [answering, setAnswering] = useState(true);
  // The response to the user's answer, as an object
  const [response, setResponse] = useState(null);
  // The number of correct responses in the current game.
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

  // When the verbs or tenses change, make a new set of game data.
  // This essentially happens only after the verbs are loaded.
  useEffect(() => {
    makeGameData();
    // eslint-disable-next-line
  }, [verbs, tenses]);

  if (gameData.length === 0 || verbs.length === 0) {
    return <div>nothing</div>;
  }

  // Replace accented letters with unaccented equivalents
  const deaccent = (str) => {
    return str
      .replace("á", "a")
      .replace("í", "i")
      .replace("é", "e")
      .replace("ó", "o")
      .replace("ú", "u")
      .replace("ñ", "n");
  };

  const handleInput = (str, verb, tense, step) => {
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

  // Helper function that will look for text like 'e and replace with
  // an accented version é
  const handleAccents = (str) => {
    if (str.length < 2) return str;
    const end = str.slice(str.length - 2);
    const accents = {
      "'": {
        a: "á",
        e: "é",
        i: "í",
        o: "ó",
        u: "ú",
      },
      "`": {
        a: "á",
        e: "é",
        i: "í",
        o: "ó",
        u: "ú",
      },
      "~": {
        n: "ñ",
      },
      ":": {
        u: "ü",
      },
    };
    if (end[0] in accents && end[1] in accents[end[0]])
      return str.slice(0, str.length - 2) + accents[end[0]][end[1]];
    return str;
  };

  let game = "";
  if (gamePos >= gameLength) {
    game = (
      <div className="App">
        <div>Game finished. You got {numCorrect} correct.</div>
        <div>
          <Button onClick={restart} variant="contained">
            Start again
          </Button>
        </div>
      </div>
    );
  } else {
    const step = gameData[gamePos];
    const verb = verbs[step.index];
    const tense = tenses[step.tense];

    let respMsg = "";
    if (response) {
      if (response.correct) respMsg = <CorrectResponse />;
      else if (response.accents)
        respMsg = <AccentResponse response={response} />;
      else respMsg = <IncorrectResponse response={response} />;
    }

    game = (
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
            helperText={tenseNames[tense]}
            value={answer}
            onChange={(evt) => setAnswer(handleAccents(evt.target.value))}
            onKeyPress={(ev) => {
              if (ev.key === "Enter") {
                if (answering) handleInput(ev.target.value, verb, tense, step);
                else handleNext();
                ev.preventDefault();
              }
            }}
          />
        </Typography>
        <div>{respMsg}</div>
      </Card>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          bgcolor: "background.paper",
          pt: 8,
          pb: 6,
        }}
      >
        <Container maxWidth="sm">
          <Typography
            component="h1"
            variant="h3"
            align="center"
            color="text.primary"
            gutterBottom
          >
            Juego de los verbos
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            paragraph
          ></Typography>
          <div className="App">{game}</div>
          <div className="help">
            Nota: para usar los accentos, apunta "'", "~", o ":" antes de una
            letra para incluir un accento. Por ejemplo, escribe "'a" para
            obtener "á".{" "}
          </div>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
