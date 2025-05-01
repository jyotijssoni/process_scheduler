const form = document.getElementById('process-form');
const output = document.getElementById('output');
const runBtn = document.getElementById('run-btn');
let processes = [];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const pid = document.getElementById('pid').value.trim();
  const burst = parseInt(document.getElementById('burst').value);
  const arrival = parseInt(document.getElementById('arrival').value || 0);
  const priority = parseInt(document.getElementById('priority').value || Infinity);

  if (!pid || isNaN(burst) || burst <= 0) {
    alert("Please enter valid PID and Burst Time.");
    return;
  }

  processes.push({ pid, burst, arrival, priority });
  form.reset();
  displayProcesses();
});

runBtn.addEventListener('click', () => {
  const algo = document.getElementById('algo').value;
  const quantum = parseInt(document.getElementById('quantum').value || 0);
  const numCpus = parseInt(document.getElementById('cpu').value || 1);

  if (algo === 'rr' && (!quantum || quantum <= 0)) {
    output.innerHTML = "<p style='color:red;'>Please enter a valid quantum for Round Robin.</p>";
    return;
  }

  let timeline = [];
  if (algo === 'fifo') {
    timeline = fifoScheduling([...processes], numCpus);
  } else if (algo === 'sjf') {
    timeline = shortestJobFirst([...processes], numCpus);
  } else if (algo === 'rr') {
    timeline = roundRobinScheduling([...processes], quantum, numCpus);
  }

  clearTimeline();
  const chart = renderGanttChart(timeline, numCpus);
  displayProcesses();
  output.innerHTML += `<h3>Schedule Output (Gantt Chart):</h3>${chart}`;
});

function displayProcesses() {
  if (processes.length === 0) {
    output.innerHTML = "<p>No processes added.</p>";
    return;
  }

  let list = "<h3><br>Processes:</h3><ul>";
  processes.forEach(p => {
    list += `<li> ${p.pid} => Burst: ${p.burst}, Arrival: ${p.arrival}, ` +
      (p.priority !== Infinity ? `Priority: ${p.priority}` : 'Priority: NA') + `</li>`;
  });
  list += "</ul>";
  output.innerHTML = list;
}

function renderGanttChart(timeline, numCpus) {
  let chartHTML = `<div class="gantt-chart">`;

  for (let cpu = 0; cpu < numCpus; cpu++) {
    chartHTML += `<div class="gantt-cpu">
      <div class="gantt-cpu-header">CPU ${cpu + 1}</div>
      <div class="gantt-row">`;

    timeline[cpu].forEach(block => {
      const width = (block.end - block.start) * 40;
      chartHTML += `<div class="gantt-block" style="width: ${width}px;">
        ${block.pid}
        <span class="left">${block.start}</span>
        <span class="right">${block.end}</span>
      </div>`;
    });

    chartHTML += `</div></div>`;
  }

  chartHTML += `</div>`;
  return chartHTML;
}

function clearTimeline() {
  output.innerHTML = '';
}