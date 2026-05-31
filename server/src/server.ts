import app from './app';

const PORT = process.env.PORT || 5000;

// Start listening for incoming HTTP connections
app.listen(PORT, () => {
  console.log(`[Server] Counselor Student Action Center running on http://localhost:${PORT}`);
});
