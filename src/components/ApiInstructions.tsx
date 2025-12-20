export function ApiInstructions() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        La API de IA experimental de Chrome no está disponible en este dispositivo.
      </p>
      <div className="text-sm space-y-2">
        <p>Para habilitarla, sigue estos pasos:</p>
        <ol className="list-decimal list-inside space-y-1 ml-4">
          <li>Asegúrate de usar Google Chrome versión 127 o superior.</li>
          <li>Ve a la dirección: <code className="bg-muted px-1 py-0.5 rounded text-xs">chrome://flags/#prompt-api-for-gemini-nano</code></li>
          <li>Habilita la opción "Prompt API for Gemini Nano".</li>
          <li>Reinicia el navegador.</li>
          <li>Asegúrate de que tu dispositivo tenga al menos 8GB de RAM.</li>
        </ol>
      </div>
    </div>
  )
}
