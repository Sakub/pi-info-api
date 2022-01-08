const app = require('express')();
const { exec } = require('child_process');
const fs = require('fs');

const cpuUsageCommand = `awk '{u=$2+$4; t=$2+$4+$5; if (NR==1){u1=u; t1=t;} else print ($2+$4-u1) * 100 / (t-t1) "%"; }' \
<(grep 'cpu ' /proc/stat) <(sleep 1;grep 'cpu ' /proc/stat)`;

const memoryAvailableCommand = 'free -m | grep "Mem"';

const cpuTempPath = '/sys/class/thermal/thermal_zone0/temp';

let cpuTemp = 0;
let cpuUsage = 0;
let memoryAvailable = 0;

app.listen(3000, () =>
  console.log(`Server is running on http://localhost:3000`)
);

app.get('/', (req, res) => {
  fs.readFile(cpuTempPath, (err, data) => {
    if (err) return err;
    cpuTemp = parseInt(data.toString()) / 1000;
  });

  exec(cpuUsageCommand, (err, stdout, stderr) => {
    if (err) return console.log(err);
    if (stderr) return console.log(stderr);
    cpuUsage = parseInt(stdout.substr(0, 3));
  });

  exec(memoryAvailableCommand, (err, stdout, stderr) => {
    if (err) return console.log(err);
    if (stderr) return console.log(stderr);
    const values = [];

    // Example output: Mem:               7           3           2           0           2           3

    const output = stdout.split(' '); // convert this string into array
    output.forEach(entry => {
      if (entry != '') values.push(entry); // dont push spaces
    });

    memoryAvailable = parseFloat(values.at(3) / 1000).toFixed(2); // third index is 'free' column
  });

  res.send({ cpuTemp, gpuTemp: 30, cpuUsage, memoryAvailable });
});
