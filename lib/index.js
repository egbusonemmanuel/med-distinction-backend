app.get("/api/leaderboard", (req, res) => {
  res.json([{ name: "Emmanuel", score: 100 }]);
});

app.get("/api/groups", (req, res) => {
  res.json([{ group: "Med Elite", members: 10 }]);
});

app.post("/api/ai/analyze", (req, res) => {
  const { prompt } = req.body;
  res.json({ reply: `Analyzed: ${prompt}` });
});

app.get("/api/library", (req, res) => {
  res.json([{ filename: "test.pdf", size: "2MB" }]);
});
