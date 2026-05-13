export const generate = (context) => `
You are a senior systems architect. Analyze the structure and data flow of this repository.

REPO CONTEXT:
Name: \${context.repoName}
Folder Structure: \${JSON.stringify(context.structure)}
Tech Stack: \${JSON.stringify(context.techStack)}

Return ONLY a JSON object with this exact schema:
{
  "pattern": "string (MVC | Microservices | Monolith | Serverless | Library | CLI tool)",
  "layers": [
    { "name": "string", "purpose": "string", "keyFiles": ["string"] }
  ],
  "dataFlow": "string (describe how data flows from user action to output)",
  "entryPoints": [
    { "file": "string", "role": "string", "priority": 1 }
  ],
  "directories": [
    { "path": "string", "description": "string (max 8 words)" }
  ]
}

No preamble, no markdown formatting outside the JSON.
`;
