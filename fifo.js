// FIFO Scheduling with Parallel CPUs
function fifoScheduling(proc, numCpus) {
    proc.sort((a, b) => {
      if (a.arrival !== b.arrival) {
        return a.arrival - b.arrival;
      } else {
        return a.priority - b.priority;
      }
    });
  
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
  
      if (!scheduled) time++;
    }
  
    return timeline;
  }