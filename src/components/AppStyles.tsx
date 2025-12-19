export function AppStyles() {
  return (
    <style>{`
      :global(body) {
        margin: 0;
        display: block;
        min-height: 100vh;
      }

      :global(#root) {
        width: 100%;
        max-width: none;
        margin: 0;
        padding: 0;
        text-align: left;
      }

      .container {
        max-width: 1220px;
        margin: 0 auto;
        padding: 2rem;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }

      .header {
        display: flex;
        gap: 0.75rem;
        flex-wrap: nowrap;
        align-items: flex-end;
        margin-bottom: 1rem;
      }

      label {
        display: block;
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
        white-space: nowrap;
      }

      input {
        width: 100%;
        padding: 0.5rem;
        box-sizing: border-box;
        font-family: monospace;
      }

      .field {
        flex: 1 1 420px;
        min-width: 260px;
      }

      .fieldSmall {
        flex: 0 0 320px;
        min-width: 240px;
      }

      button {
        background: #007aff;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        height: 40px;
        white-space: nowrap;
      }

      button:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .secondary {
        background: #e9e9ed;
        color: #111;
      }

      .copyStatus {
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 0.9rem;
        color: #333;
        min-width: 90px;
        text-align: right;
      }

      #output {
        margin-top: 0;
        background: #f7f7fa;
        padding: 1rem;
        border-radius: 10px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
          monospace;
        color: #111;
        border: 1px solid #e3e3e8;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        overflow-wrap: anywhere;
      }

      .outputText {
        white-space: normal;
      }

      .outputText :is(h1, h2, h3) {
        margin: 0.75rem 0 0.5rem;
      }

      .outputText h1 {
        font-size: 1.25rem;
      }

      .outputText h2 {
        font-size: 1.1rem;
      }

      .outputText p {
        margin: 0.5rem 0;
      }

      .notesLine {
        margin: 0.75rem 0;
        padding: 0.6rem 0.75rem;
        border-radius: 10px;
        background: #fff7d6;
        border: 1px solid #f0dc9a;
        color: #111;
      }

      .outputText ul {
        margin: 0.5rem 0;
        padding-left: 1.25rem;
      }

      .outputText blockquote {
        margin: 0.75rem 0;
        padding-left: 0.75rem;
        border-left: 3px solid #d7d7e0;
        color: #333;
      }

      .outputText code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
          monospace;
        background: #ececf2;
        padding: 0.1rem 0.25rem;
        border-radius: 6px;
      }

      .icon {
        width: 16px;
        height: 16px;
        display: inline-block;
      }

      @media (max-width: 900px) {
        .header {
          flex-wrap: wrap;
        }

        .copyStatus {
          text-align: left;
        }
      }
    `}</style>
  )
}
