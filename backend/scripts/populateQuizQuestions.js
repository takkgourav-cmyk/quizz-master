require('dotenv').config();
const additions = require('../src/quizQuestionAdditions');

const api = (process.env.QUIZLY_API_URL || 'http://127.0.0.1:5000/api').replace(/\/$/, '');

async function request(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${api}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${method} ${path} failed (${response.status}): ${data.message || 'request failed'}`);
  return data;
}

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running this script.');
  const { token, user } = await request('/auth/login', { method: 'POST', body: { email, password } });
  if (!token || user?.role !== 'admin') throw new Error('The configured account is not an admin account.');

  const quizzes = await request('/admin/quizzes', { token });
  const counts = [];
  for (const [title, questions] of Object.entries(additions)) {
    const quiz = quizzes.find((entry) => entry.title === title);
    if (!quiz) throw new Error(`Quiz not found in admin catalogue: ${title}`);
    const existing = await request(`/admin/quizzes/${quiz._id}/questions`, { token });
    const existingTexts = new Set(existing.map((question) => question.text.trim().toLowerCase()));
    let added = 0;
    for (const [text, options, correct, explanation] of questions) {
      if (existingTexts.has(text.trim().toLowerCase())) continue;
      await request(`/admin/quizzes/${quiz._id}/questions`, {
        method: 'POST', token, body: { text, options, correct, explanation, points: 1 },
      });
      added += 1;
    }
    await request(`/admin/quizzes/${quiz._id}`, {
      method: 'PUT', token, body: { questionLimit: 10, timeLimit: Math.max(10, quiz.timeLimit || 0) },
    });
    const finalQuestions = await request(`/admin/quizzes/${quiz._id}/questions`, { token });
    counts.push(`${title}: ${finalQuestions.length} questions (+${added})`);
  }
  const tooShort = counts.filter((line) => Number(line.match(/: (\d+) questions/)[1]) < 10);
  if (tooShort.length) throw new Error(`Some quizzes remain under ten questions:\n${tooShort.join('\n')}`);
  process.stdout.write(`${counts.join('\n')}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
