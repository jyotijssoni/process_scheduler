const form = document.getElementById('process-form');
const output = document.getElementById('output');
const runBtn = document.getElementById('run-btn');

let processes = [];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const pid = document.getElementById('pid').value.trim();
  const burst = parseInt(document.getElementById('burst').value);
  const arrival = parseInt(document.getElementById('arrival').value || 0);

  if (!pid || isNaN(burst) || burst <= 0) {
    alert("Please enter valid PID and Burst Time.");
    return;
  }

  processes.push({ pid, burst, arrival });
  form.reset();
  displayProcesses();
});

runBtn.addEventListener('click', () => {
  const algo = document.getElementById('algo').value;
  const quantum = parseInt(document.getElementById('quantum').value || 0);

  if (algo === 'rr' && (!quantum || quantum <= 0)) {
    output.innerHTML = "<p style='color:red;'>Please enter a valid quantum for Round Robin.</p>";
    return;
  }

  let timeline = [];
  if (algo === 'fifo') {
    timeline = fifoScheduling([...processes]);
  } else if (algo === 'rr') {
    timeline = roundRobinScheduling([...processes], quantum);
  }

  const chart = renderGanttChart(timeline);
  displayProcesses(); 
  output.innerHTML += `<h3>Schedule Output (Gantt Chart):</h3>${chart}`;
});

function displayProcesses() {
  if (processes.length === 0) {
    output.innerHTML = "<p>No processes added.</p>";
    return;
  }

  let list = "<h3></br>Processes:</h3><ul>";
  processes.forEach(p => {
    list += `<li> ${p.pid} =>  Burst : ${p.burst} ,  Arrival : ${p.arrival}</li>`;
  });
  list += "</ul>";
  output.innerHTML = list;
}

// FIFO Scheduling
function fifoScheduling(proc) {
  proc.sort((a, b) => a.arrival - b.arrival);
  let time = 0;
  let timeline = [];

  proc.forEach(p => {
    if (time < p.arrival) time = p.arrival;
    timeline.push({ pid: p.pid, start: time, end: time + p.burst });
    time += p.burst;
  });

  return timeline;
}

// Round Robin Scheduling
function roundRobinScheduling(proc, quantum) {
  let queue = [], time = 0;
  let timeline = [];

  proc.sort((a, b) => a.arrival - b.arrival);
  let remaining = proc.map(p => ({ ...p }));
  let arrived = [];

  while (remaining.length > 0 || queue.length > 0) {
    arrived = remaining.filter(p => p.arrival <= time);
    queue.push(...arrived);
    remaining = remaining.filter(p => p.arrival > time);

    if (queue.length === 0) {
      time++;
      continue;
    }

    let current = queue.shift();
    const execTime = Math.min(current.burst, quantum);
    timeline.push({ pid: current.pid, start: time, end: time + execTime });
    current.burst -= execTime;
    time += execTime;

    if (current.burst > 0) {
      current.arrival = time;
      queue.push(current);
    }
  }

  return timeline;
}

// Gantt Chart Renderer
function renderGanttChart(timeline) {
  let chartHTML = `<div class="gantt-chart">`;

  timeline.forEach(block => {
    chartHTML += `
      <div class="gantt-block" style="width:${(block.end - block.start) * 40}px;">
        ${block.pid}
        <span class="left">${block.start}</span>
        <span class="right">${block.end}</span>
      </div>
    `;
  });

  chartHTML += `</div>`;
  return chartHTML;
}