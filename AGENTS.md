# Agents

## Definiciones

### Dimención

Una **dimención** es una **sección de evaluación** para un candidato.

- Se usa como unidad para organizar información de entrevistas de posiciones **Frontend** y **Full Stack**.
- Cada dimención representa un aspecto evaluado (por ejemplo, una dimensión técnica o de comportamiento), y se expresa como un bloque con:
  - Un **título**
  - Notas / evidencia
  - Una **conclusión redactada**

## Flujo de trabajo

## Objetivo

Luego de tomar **notas rápidas** durante la entrevista, el objetivo es **construir (y usar) un system prompt** junto a esas observaciones para obtener **conclusiones redactadas profesionalmente**.

### 1. Notas por candidato

Durante la entrevista, se registran **notas rápidas** (observaciones) por dimención. Estas notas son el insumo inicial y pueden incluir:

- Observaciones
- Ejemplos mencionados
- Señales de seniority
- Fortalezas y riesgos
- Contexto de decisiones técnicas

### 2. Conclusiones por dimención

Al finalizar la entrevista, con las notas como base, se usa un **system prompt** para redactar una **conclusión por cada dimención**.

Objetivo:

- Transformar notas sueltas en un texto claro y accionable
- Mantener trazabilidad hacia la evidencia (sin inventar)
- Unificar estilo y tono entre candidatos

### Flujo operativo (post-entrevista)

1. Durante la entrevista tomo notas rápidas a modo de observaciones durante la charla con el candidato.
2. Al finalizar la entrevista:
   - Pego mis observaciones junto a un **system prompt** en un modelo.
   - Obtengo conclusiones profesionales por cada dimención y una conclusión final.
   - Reviso el resultado y lo copio/pego nuevamente en el perfíl del candidato.

### 3. Conclusión final

Luego de redactar las conclusiones por dimención, se redacta una **conclusión final** que resume el desempeño general del candidato considerando todas las dimenciones.

La conclusión final debe:

- Sintetizar patrones (fortalezas, debilidades, tradeoffs)
- Indicar nivel de adecuación al rol (Frontend/Full Stack) según la evidencia
- Ser consistente con las conclusiones por dimención
