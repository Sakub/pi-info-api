const app = require('express')();

app.listen(3000, () =>
  console.log(`Server is running on http://localhost:3000`)
);

app.get('/', (req, res) =>
  res.send({ cpuTemp: 60, gpuTemp: 30, discUsage: 70 })
);
