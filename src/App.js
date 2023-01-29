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
import queryString from "query-string";

import {
  CorrectResponse,
  IncorrectResponse,
  AccentResponse,
} from "./Responses";
import StartPage from "./StartPage";

const personPrompts = [
  "Yo",
  "Tú",
  "Él/ella/usted",
  "Nosotros",
  "Vosotros",
  "Ellos/ellas/ustedes",
];

// Spanish names for extracted tense names, which are in English.
const tenseNames = {
  Present: "Presente",
  Imperfect: "Imperfecto",
  Preterite: "Pretérito",
  Future: "Futuro",
  Conditional: "Condicional",
};

// Add the trim method
if (!String.prototype.trim) {
  // eslint-disable-next-line
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
  };
}

const theme = createTheme();

function App() {
  // Allowed verbs, set once
  const [verbs, setVerbs] = useState([]);
  // Game configuration, set once.
  const [config, setConfig] = useState({});
  // Game options, set for each game
  const [options, setOptions] = useState({ tenses: [] });
  // Whether or not to only use irregular forms!
  const [onlyIrregular, setOnlyIrregular] = useState(false);
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
  // The state of the current game
  const [gameState, setGameState] = useState("initializing"); // starting, running, ended.

  // Load our verbs on startup.
  useEffect(() => {
    fetch("verbs.json")
      .then((resp) => resp.json())
      .then((data) => {
        setVerbs(data);
        // Do we just want irregular verbs?
        const queries = queryString.parse(window.location.search);
        setOnlyIrregular(queries.irregular === "true");
        //setTenses(allowedTenses);
      });
    fetch("games.json")
      .then((resp) => resp.json())
      .then((data) => {
        setConfig(data);
        setGameState("starting");
      });
  }, []);

  // Create a random set for a game.
  const gameLength = 20;
  const makeGameData = (options) => {
    // Generate a lot of data, then filter down to just the irregular forms if
    // that is what people want.  10x is probably enough to have gameLength
    // entries pass through the filter.
    const verbMap = {};
    verbs.forEach((verb) => (verbMap[verb.verb] = verb));
    const selVerbs = options.verbs
      .map((verb) => verbMap[verb])
      .filter((x) => x);
    let data = [...Array(gameLength * 10)].map(() => {
      const idx = Math.floor(Math.random() * selVerbs.length) % selVerbs.length;
      if (!selVerbs[idx]) {
        console.log("PROBLEM");
        console.log(idx);
        console.log(selVerbs.length);
        console.log(selVerbs[idx]);
        console.log(selVerbs);
        console.log(options.verbs);
      }
      return {
        verb: selVerbs[idx],
        person: Math.floor(Math.random() * 6),
        tense: Math.floor(Math.random() * options.tenses.length),
      };
    });
    // Filter down to forms that are irregular if necessary
    if (onlyIrregular) {
      const filtered = data.filter((step) => {
        const tense = options.tenses[step.tense];
        const verb = selVerbs[step.index];
        const irreg = verb.tenses[tense].words[step.person].irregular;
        return irreg;
      });
      data = filtered;
    }
    // And grab at most gameLength
    data = data.slice(0, gameLength);
    setGameData(data);
    setGamePos(0);
    setOptions(options);
  };

  // When the verbs or tenses change, make a new set of game data.
  // This essentially happens only after the verbs are loaded.
  useEffect(() => {
    /*
    // If we have some debug parameters, use that to make the game data
    const queries = queryString.parse(window.location.search);
    if (queries.verb) {
      // Find the verb in the index
      const index = verbs.findIndex((x) => x.verb === queries.verb);
      // Find the tense in the list
      const tindex = tenses.findIndex((x) => x.toLowerCase() === queries.tense);
      const data =
        index === -1
          ? []
          : [
              {
                index: index,
                person: queries.person,
                tense: tindex,
              },
            ];
      setGameData(data);
      setGamePos(0);
    } else {
      makeGameData();
    }
      */
    // eslint-disable-next-line
  }, [verbs]);

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
    // Strip whitespace.
    const stripped = str.trim();
    const ans = verb.tenses[tense].words[step.person].word;
    const correct = ans === stripped;
    const dcorrect = deaccent(ans) === stripped;
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
    if (gamePos + 1 >= gameData.length) {
      setGameState("ended");
    }
  };

  const restart = () => {
    setGameState("starting");
  };

  const start = (opts) => {
    //setTenses(opts.tenses);
    makeGameData(opts);
    setGameState("running");
    setAnswering(true);
    setResponse(null);
    setNumCorrect(0);
  };

  // Helper function that will look for text like 'e and replace with
  // an accented version é
  // It will also standardize to lower case.
  const handleAccents = (str) => {
    if (str.length < 2) return str;
    const lstr = str.toLowerCase();
    const end = lstr.slice(str.length - 2);
    const graves = {
      a: "á",
      e: "é",
      i: "í",
      o: "ó",
      u: "ú",
    };
    // The iPhone sends left and right single quotes rather than the simple
    // single quote.
    const accents = {
      "‘": graves,
      "'": graves,
      "`": graves,
      "’": graves,
      "~": {
        n: "ñ",
      },
      ":": {
        u: "ü",
      },
    };
    if (end[1] in accents && end[0] in accents[end[1]])
      return lstr.slice(0, str.length - 2) + accents[end[1]][end[0]];
    return lstr;
  };

  let game = "";
  if (gameState === "ended") {
    const perc = Math.floor((100 * numCorrect) / gameData.length);
    game = (
      <div className="App">
        <Typography variant="h6">Fin del juego.</Typography>
        <Typography variant="body">
          Respuestas correctas: {numCorrect}/{gameData.length} ({perc}%)
        </Typography>

        <Typography component="p" variant="p" sx={{ pt: 2 }}>
          <Button onClick={restart} variant="contained">
            Jugar de nuevo
          </Button>
        </Typography>
      </div>
    );
  } else if (gameState === "starting") {
    game = (
      <div className="App">
        <StartPage config={config} onStart={start} />
      </div>
    );
  } else if (gameState === "running" && gamePos < gameData.length) {
    const step = gameData[gamePos];
    const verb = step.verb;
    const tense = options.tenses[step.tense];

    let respMsg = "";
    if (response) {
      if (response.accents) respMsg = <AccentResponse response={response} />;
      else if (response.correct) respMsg = <CorrectResponse />;
      else respMsg = <IncorrectResponse response={response} />;
    }

    let image = verb.image ? (
      <img title={verb.verb} alt={verb.verb} src={`images/${verb.image}`} />
    ) : (
      <div style={{ display: "flex", alignItems: "center", height: "144px" }}>
        <span style={{ display: "block", textAlign: "center", width: "100%" }}>
          {verb.verb}
        </span>
      </div>
    );
    game = (
      <Card sx={{ maxWidth: 500 }}>
        <Typography variant="h5">
          {gamePos + 1}/{gameData.length}
        </Typography>
        <Typography variant="h5">{image}</Typography>
        <Typography sx={{ verticalAlign: "bottom" }} variant="h5">
          {personPrompts[step.person]}{" "}
          <TextField
            autoComplete="off"
            variant="filled"
            size="small"
            hiddenLabel
            helperText={tenseNames[tense]}
            inputProps={{ autoCorrect: "off", spellCheck: "off" }}
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
        <div className="help">
          Nota: para escribir los acentos, a’ = á, e’ = é, n~ = ñ, u: = ü. Por
          ejemplo, escribe "a’" para obtener "á".
        </div>
      </Card>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          bgcolor: "background.paper",
          pt: 1,
          pb: 1,
        }}
      >
        <Container maxWidth="sm">
          <Typography
            component="h4"
            variant="h4"
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
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
