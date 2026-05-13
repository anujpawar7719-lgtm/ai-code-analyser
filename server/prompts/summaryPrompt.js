export const generate = (context) => `
You are a senior full-stack engineer. Analyze this GitHub repository and provide a high-level summary.

REPO CONTEXT:
Name: \${context.repoName}
Description: \${context.repoDescription}
Languages: \${context.primaryLanguage}
Tech Stack: \${JSON.stringify(context.techStack)}
Topics: \${context.topics.join(', ')}

Return ONLY a JSON object with this exact schema:
{
  "oneLiner": "string (max 20 words — what this repo does)",
  "purpose": "string (2–3 sentences — problem it solves)",
  "audience": "string (who uses/builds this)",
  "maturityLevel": "prototype | early-stage | production | legacy",
  "keyFeatures": ["string", "string", "string"],
  "quickStart": "string (how to run locally, 2–4 steps as one paragraph)",
  "warnings": ["string"]
}

No preamble, no markdown formatting outside the JSON.
`;
