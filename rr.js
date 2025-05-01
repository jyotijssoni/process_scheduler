// Round Robin Scheduling with Parallel CPUs
function roundRobinScheduling(proc, quantum, numCpus) {
    let time = 0;
    let timeline = Array(numCpus).fill().map(() => []);
    let readyQueue = [];
    let waiting = [...proc].sort((a, b) => a.arrival - b.arrival);
  
    let cpuStates = Array(numCpus).fill(null);
    let cpuRemaining = Array(numCpus).fill(0);
  
    while (waiting.length > 0 || readyQueue.length > 0 || cpuStates.some(p => p !== null)) {
      while (waiting.length > 0 && waiting[0].arrival <= time) {
        readyQueue.push(waiting.shift());
      }
  
      for (let i = 0; i < numCpus; i++) {
        if (cpuStates[i] === null && readyQueue.length > 0) {
          let p = readyQueue.shift();
          let execTime = Math.min(p.burst, quantum);
          timeline[i].push({ pid: p.pid, start: time, end: time + execTime });
  
          cpuStates[i] = p;
          cpuRemaining[i] = execTime;
          p.burst -= execTime;
        }
      }
  
      time++;
  
      for (let i = 0; i < numCpus; i++) {
        if (cpuStates[i]) {
          cpuRemaining[i]--;
          if (cpuRemaining[i] === 0) {
            let p = cpuStates[i];
            cpuStates[i] = null;
  
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