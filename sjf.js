
function shortestJobFirst(proc, numCpus) {
    let timeline = Array(numCpus).fill().map(() => []);
    let time = 0;
    let waiting = [...proc];
  
    while (waiting.length > 0) {
      let scheduled = false;
  
      for (let i = 0; i < numCpus; i++) {
        let cpuTimeline = timeline[i];
        let cpuTime = cpuTimeline.length > 0 ? cpuTimeline[cpuTimeline.length - 1].end : 0;
        let currentTime = Math.max(cpuTime, time);
  
        let available = waiting.filter(p => p.arrival <= currentTime);
        if (available.length === 0) continue;
  
        available.sort((a, b) => a.burst - b.burst);
        let p = available[0];
  
        waiting.splice(waiting.indexOf(p), 1);
        cpuTimeline.push({ pid: p.pid, start: currentTime, end: currentTime + p.burst });
        scheduled = true;
      }
  
      if (!scheduled) time++;
    }
  
    return timeline;
  }