export function ApiInstructions() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        La API de Prompt de Chrome no está disponible. Sigue estos pasos para habilitarla:
      </p>
      <ol className="list-decimal list-inside space-y-2 text-sm">
        <li>
          Abre Chrome y ve a <code className="bg-muted px-1 py-0.5 rounded">chrome://flags/#optimization-guide-on-device-model</code>
        </li>
        <li>
          Establece la opción en <strong>"Enabled"</strong>
        </li>
        <li>
          Ve a <code className="bg-muted px-1 py-0.5 rounded">chrome://flags/#prompt-api-for-gemini-nano-multimodal-input</code>
        </li>
        <li>
          Establece la opción en <strong>"Enabled"</strong>
        </li>
        <li>
          Haz clic en <strong>"Relaunch"</strong> para reiniciar Chrome
        </li>
      </ol>
      <div className="space-y-2">
        <p className="text-sm font-medium">Requisitos de hardware:</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Sistema operativo: macOS 13+, Windows 10/11, Linux, o ChromeOS con Chromebook Plus</li>
          <li>Almacenamiento: Al menos 22GB libres</li>
          <li>GPU: 4GB VRAM mínimo, o CPU con 16GB RAM y 4 núcleos</li>
        </ul>
      </div>
      <p className="text-xs text-muted-foreground">
        Una vez habilitado, el modelo Gemini Nano se descargará automáticamente la primera vez que uses la API.
      </p>
    </div>
  )
}
