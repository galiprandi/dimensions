// Función helper para text-to-speech
export function speakText(text: string) {
  if (!text.trim()) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'es-ES' // Idioma español
  speechSynthesis.speak(utterance)
}
