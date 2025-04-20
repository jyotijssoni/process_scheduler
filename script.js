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
  const numCpus = parseInt(document.getElementById('cpu').value || 1);

  if (algo === 'rr' && (!quantum || quantum <= 0)) {
    output.innerHTML = "<p style='color:red;'>Please enter a valid quantum for Round Robin.</p>";
    return;
  }

  let timeline = [];
  if (algo === 'fifo') {
    timeline = fifoScheduling([...processes], numCpus);
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
    list += `<li> ${p.pid} =>  Burst : ${p.burst} ,  Arrival : ${p.arrival}</li>`;
  });
  list += "</ul>";
  output.innerHTML = list;
}

// FIFO Scheduling with Parallel CPUs
function fifoScheduling(proc, numCpus) {
  proc.sort((a, b) => a.arrival - b.arrival);
  let timeline = Array(numCpus).fill().map(() => []);
  let time = 0;

  while (proc.length > 0) {
    let scheduled = false;

    for (let i = 0; i < numCpus && proc.length > 0; i++) {
      let cpuTimeline = timeline[i];
      let cpuTime = cpuTimeline.length > 0 ? cpuTimeline[cpuTimeline.length - 1].end : 0;
      let currentTime = Math.max(cpuTime, time);

      let idx = proc.findIndex(p => p.arrival <= currentTime);
      if (idx !== -1) {
        let p = proc.splice(idx, 1)[0];
        cpuTimeline.push({ pid: p.pid, start: currentTime, end: currentTime + p.burst });
        scheduled = true;
      }
    }

    if (!scheduled) time++; // wait if nothing was scheduled
  }

  return timeline;
}

// Round Robin Scheduling with Parallel CPUs
function roundRobinScheduling(proc, quantum, numCpus) {
  let time = 0;
  let timeline = Array(numCpus).fill().map(() => []);
  let readyQueue = [];
  let waiting = [...proc].sort((a, b) => a.arrival - b.arrival);  // Sort processes by arrival time

  let cpuStates = Array(numCpus).fill(null); // Track state of each CPU
  let cpuRemaining = Array(numCpus).fill(0); // Track remaining time for each CPU

  while (waiting.length > 0 || readyQueue.length > 0 || cpuStates.some(p => p !== null)) {
    // Move new arrivals first to readyQueue
    while (waiting.length > 0 && waiting[0].arrival <= time) {
      readyQueue.push(waiting.shift());
    }

    // Assign CPUs if idle and a process is ready
    for (let i = 0; i < numCpus; i++) {
      if (cpuStates[i] === null && readyQueue.length > 0) {
        let p = readyQueue.shift(); // Get a process from the readyQueue
        let execTime = Math.min(p.burst, quantum); // Calculate time slice
        timeline[i].push({ pid: p.pid, start: time, end: time + execTime });

        cpuStates[i] = p; // Assign the process to this CPU
        cpuRemaining[i] = execTime; // Track the remaining time
        p.burst -= execTime; // Reduce burst time by the time executed
      }
    }

    time++; // Advance global time

    // Update CPUs after time moves
    for (let i = 0; i < numCpus; i++) {
      if (cpuStates[i] !== null) {
        cpuRemaining[i]--;
        if (cpuRemaining[i] === 0) {
          let p = cpuStates[i];
          cpuStates[i] = null;

          // Re-queue if not finished
          if (p.burst > 0) {
            p.arrival = time;
            waiting.push(p);
            waiting.sort((a, b) => a.arrival - b.arrival);
          }
        }
      }
    }
  }

  return timeline;
}

// Gantt Chart Renderer
function renderGanttChart(timeline, numCpus) {
  let chartHTML = `<div class="gantt-chart">`;

  for (let cpu = 0; cpu < numCpus; cpu++) {
    chartHTML += `<div class="gantt-cpu" style="margin-bottom: 20px;">
                    <div class="gantt-cpu-header">CPU ${cpu + 1}</div>`;
    timeline[cpu].forEach(block => {
      chartHTML += `<div class="gantt-block" style="width:${(block.end - block.start) * 40}px;">
                      ${block.pid}
                      <span class="left">${block.start}</span>
                      <span class="right">${block.end}</span>
                    </div>`;
    });
    chartHTML += `</div>`;
  }

  chartHTML += `</div>`;
  return chartHTML;
}

function clearTimeline() {
  output.innerHTML = '';
}