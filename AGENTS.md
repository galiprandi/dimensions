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
- Indicar nivel de adecuación al rol (Frontend/ Full Stack) según la evidencia
- Ser consistente con las conclusiones por dimención

## Reglas de Desarrollo

### Componentes

Siempre quiero componentes reutilizables, usando shadcn para la UI, y separados en archivos individuales para mantener la modularidad y facilidad de mantenimiento.

### Hooks

Hooks personalizados también en archivos separados.

### Notificaciones con Toast

Para mostrar notificaciones tipo toast (información, éxito, error), usa la librería sonner que está configurada en la app.

Importa en el componente donde lo necesites:

```typescript
import { toast } from "sonner"
```

Luego, usa los siguientes métodos:

- **Información**: `toast("Mensaje de información")`
- **Éxito**: `toast.success("Mensaje de éxito")`
- **Error**: `toast.error("Mensaje de error")`

El componente `Toaster` ya está agregado en `App.tsx`, por lo que las notificaciones aparecen globalmente en la aplicación.

## Documentación API GraphQL

### Estructura de Datos

Para evitar errores al consultar la API GraphQL, documentar aquí la estructura correcta de los tipos:

#### Interview Type
- `seniority` **NO** está directamente en `Interview`
- `seniority` está anidado en `professional.seniority`
- `photoURL` está anidado en `professional.photoURL`
- `fullName` está anidado en `professional.fullName`

**Query correcta para interviews list:**
```graphql
query ($take: Int!, $skip: Int!) {
  items: interviews(take: $take, skip: $skip) {
    id
    professionalName
    status
    deepProfile
    professional {
      photoURL
      seniority
    }
  }
}
```

**Query correcta para interview detail:**
```graphql
query Interview($where: InterviewWhereUniqueInput!) {
  interview(where: $where) {
    status
    professional {
      fullName
      photoURL
      seniority
    }
    # ... resto de campos
  }
}
```

**Error común:** Intentar acceder a `seniority` directamente en `Interview` en lugar de `professional.seniority`.

### Despliegue y CORS (GitHub Pages + Worker)

- Vite usa `base: '/dimensions/'` y `BrowserRouter` con `basename={import.meta.env.BASE_URL}` para rutas correctas en Pages.
- `VITE_API_URL` debe apuntar al proxy (Cloudflare Worker). El workflow de Pages fija `VITE_API_URL=https://interviews.galiprandi.workers.dev`.
- `api.ts` normaliza `VITE_API_URL` (corrige “ttps://”, fuerza `https://` y añade `/api/graphql` si falta).
- Cloudflare Worker debe:
  - Permitir orígenes `https://galiprandi.github.io` y `http://localhost:5173`.
  - Reenviar la cookie de sesión y conservar `set-cookie`.
  - Reescribir `set-cookie` a `SameSite=None; Secure` para que el navegador envíe la sesión en `github.io`.
- Si `VITE_API_URL` está mal escrita o el Worker no reenvía cookies/SameSite, las queries regresan vacías (`items: []`).
