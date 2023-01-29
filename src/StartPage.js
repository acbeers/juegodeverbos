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
  InputLabel,
  MenuItem,
  Select,
  Box,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme();

const allTenses = [
  "Present",
  "Preterite",
  "Future",
  "Conditional",
  "Imperfect",
];

// Spanish names for extracted tense names, which are in English.
const tenseNames = {
  Present: "Presente",
  Imperfect: "Imperfecto",
  Preterite: "Pretérito",
  Future: "Futuro",
  Conditional: "Condicional",
};

export default function StartPage({ config, onStart }) {
  const allVerbs = Object.keys(config);
  const [verbs, setVerbs] = useState(allVerbs[0]);
  const [checks, setChecks] = useState(
    allTenses.map((tense) => config[allVerbs[0]].tenses.includes(tense))
  );

  const handleCheck = (index) => {
    const newCheck = [...checks];
    newCheck[index] = !newCheck[index];
    setChecks(newCheck);
  };
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
    const opts = { tenses: tenses, verbs: config[verbs].verbs };
    onStart(opts);
  };
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          bgcolor: "background.paper",
          pt: 1,
          pb: 1,
        }}
      >
        <FormControl variant="standard">
          <InputLabel id="select">Groupo de verbos</InputLabel>
          <Select labelId="select" onChange={handleSelect} value={verbs}>
            {options}
          </Select>
        </FormControl>
        <Container maxWidth="sm">
          <FormGroup>{tenses}</FormGroup>
          <Button variant="outlined" onClick={() => handleClick()}>
            Empieza
          </Button>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
