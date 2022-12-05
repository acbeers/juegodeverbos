import React from "react";

export function CorrectResponse() {
  return (
    <div>
      <span className="correct">¡Correcto!</span>
    </div>
  );
}

export function AccentResponse({ response }) {
  const irreg = response.irregular ? (
    <div className="irregular">Nota: esta es una forma irregular</div>
  ) : (
    ""
  );
  return (
    <div>
      <div>
        <span className="correct">¡Casi Correcto!</span>&nbsp;
        <span>Pero, cuidado con los accentos: {response.ans} </span>
      </div>
      {irreg}
    </div>
  );
}

export function IncorrectResponse({ response }) {
  const irreg = response.irregular ? (
    <div className="irregular">Nota: esta es una forma irregular</div>
  ) : (
    ""
  );
  return (
    <div>
      <div>
        <span className="incorrect">¡Incorrecto!</span>&nbsp;
        <span>La respuesta correcta está {response.ans}</span>
      </div>
      {irreg}
    </div>
  );
}
