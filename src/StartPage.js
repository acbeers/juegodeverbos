// A page to start a new game
// Allows you to choose a set of verbs, tenses, and other options
//

import { useState } from "react";

import {
  Button,
  Container,
  FormGroup,
  FormControlLabel,
  FormControl,
  Checkbox,
  MenuItem,
  Select,
  Typography,
  Box,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import { allTenses, tenseNames } from "./common";

const theme = createTheme();

export default function StartPage({ config, onStart }) {
  const allVerbs = Object.keys(config);
  const [verbs, setVerbs] = useState(allVerbs[0]);
  const [checks, setChecks] = useState(
    allTenses.map((tense) => config[allVerbs[0]].tenses.includes(tense))
  );
  const [onlyIrregular, setOnlyIrregular] = useState(false);

  // Handlers for interaction

  const handleCheck = (index) => {
    const newCheck = [...checks];
    newCheck[index] = !newCheck[index];
    setChecks(newCheck);
  };

  const handleSelect = (evt) => {
    setVerbs(evt.target.value);
    const conf = config[evt.target.value];
    const newChecks = allTenses.map((tense) => conf.tenses.includes(tense));
    setChecks(newChecks);
  };

  const handleClick = () => {
    const tenses = checks
      .map((x, idx) => (x ? allTenses[idx] : null))
      .filter((x) => x);
    const opts = {
      tenses: tenses,
      verbs: config[verbs].verbs,
      onlyIrregular: onlyIrregular,
    };
    onStart(opts);
  };

  // Render

  const tenses = allTenses.map((tense, index) => {
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={checks[index]}
            onChange={() => handleCheck(index)}
          />
        }
        label={tenseNames[tense]}
      />
    );
  });

  const options = allVerbs.map((verb) => (
    <MenuItem value={verb}>{verb}</MenuItem>
  ));

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
          <Typography align="left" variant="h6">
            Groupo de verbos
          </Typography>
          <FormControl variant="standard">
            <Select onChange={handleSelect} value={verbs}>
              {options}
            </Select>
          </FormControl>
        </Container>
        <Container maxWidth="sm">
          <Typography align="left" variant="h6">
            Tiempos verbales
          </Typography>
          <FormGroup>{tenses}</FormGroup>
        </Container>
        <Container maxWidth="sm">
          <Typography align="left" variant="h6">
            Opciones
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={onlyIrregular}
                onClick={() => setOnlyIrregular(!onlyIrregular)}
              />
            }
            label="Sólo formas irregulares"
          />
        </Container>
        <Container maxWidth="sm">
          <Button variant="outlined" onClick={() => handleClick()}>
            Empieza
          </Button>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
