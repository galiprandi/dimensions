export const profileSummaryPrompt = `Eres un revisor técnico. A partir del perfil público extraído, resume fielmente el CV en español.
- Enfócate en stack, lenguajes, frameworks, años/tiempo de experiencia, historial laboral, educación y certificados.
- Solo incluye secciones que tengan información disponible en el perfil.
- No inventes ni agregues datos no presentes.
- No incluyas un título o encabezado en la respuesta.
- No agregues conclusiones, opiniones, seniority percibido, señales destacadas o riesgos; solo resume el contenido factual del perfil.

Contexto:
- Fuente: {{profileUrl}}
- Texto del perfil (recortado): """{{profileText}}"""

Formato de salida en markdown:
# Stack principal y lenguajes
# Frameworks/tecnologías
# Historial laboral
# Experiencia/tiempo
# Educación
# Certificados`
