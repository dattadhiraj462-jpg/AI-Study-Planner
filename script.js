let subjects = [];
const BREAK_MIN = 10;
const BLOCK_MIN = 50;

let currentSchedule = [];
let sessionIndex = 0;
let timerInterval = null;
let remainingSec = 0;

const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return `${h}h ${m}m`;
};

const formatClockTime = (date) => {
    const h = date.getHours();
    const m = date.getMinutes();
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

function setDayType(type) {
    document.getElementById('day-type').value = type;
    const normalBtn = document.getElementById('normal-day-btn');
    const examBtn = document.getElementById('exam-day-btn');

    [normalBtn, examBtn].forEach(btn => {
        btn.classList.remove('bg-primary', 'hover:bg-primary-dark', 'text-white');
        btn.classList.add('bg-gray-200', 'hover:bg-gray-300', 'text-gray-700');
    });

    const targetBtn = type === 'normal' ? normalBtn : examBtn;
    targetBtn.classList.remove('bg-gray-200', 'hover:bg-gray-300', 'text-gray-700');
    targetBtn.classList.add('bg-primary', 'hover:bg-primary-dark', 'text-white');
}

function renderSubjects() {
    const listEl = document.getElementById('subject-list');
    listEl.innerHTML = '';
    let totalWeight = 0;

    if (subjects.length === 0) {
        listEl.innerHTML = '<p class="text-gray-400 p-4 border rounded-lg text-center">No subjects added yet.</p>';
        document.getElementById('generate-plan-btn').disabled = true;
        document.getElementById('total-weight').textContent = 'Total Weight: 0';
        return;
    }

    subjects.forEach((subj, index) => {
        totalWeight += subj.priority;
        listEl.innerHTML += `
            <div class="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm">
                <span class="font-medium text-gray-800">${subj.name}</span>
                <div class="flex items-center space-x-3">
                    <span class="text-sm font-semibold text-primary">Priority: ${subj.priority}/10</span>
                    <button onclick="removeSubject(${index})" class="text-red-500 hover:text-red-700 p-1 rounded-full bg-red-50">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
        `;
    });

    document.getElementById('total-weight').textContent = `Total Weight: ${totalWeight}`;
    document.getElementById('generate-plan-btn').disabled = subjects.length === 0;
}

document.getElementById('subject-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const nameEl = document.getElementById('subject-name');
    const priorityEl = document.getElementById('priority');

    const name = nameEl.value.trim();
    const priority = parseInt(priorityEl.value, 10);

    if (name && priority >= 1 && priority <= 10) {
        subjects.push({ name, priority });
        nameEl.value = '';
        priorityEl.value = '5';
        renderSubjects();
    }
});

function removeSubject(index) {
    subjects.splice(index, 1);
    renderSubjects();
}

window.onload = () => {
    setDayType('normal');
    renderSubjects();
};

function tick() {
    remainingSec--;

    if (remainingSec <= 0) {
        endSession(true);
    } else {
        renderSessionTracker();
    }
}

function startSession() {
    if (timerInterval) return;
    
    if (sessionIndex >= currentSchedule.length) return;

    const currentItem = currentSchedule[sessionIndex];
    remainingSec = currentItem.duration * 60;

    timerInterval = setInterval(tick, 1000);

    renderSessionTracker();
    
    renderSchedule(currentSchedule);
}

function endSession(autoAdvance = false) {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    if (sessionIndex < currentSchedule.length) {
        sessionIndex++;
    }

    renderSessionTracker();
    renderSchedule(currentSchedule);

    if (autoAdvance) {
        if (sessionIndex < currentSchedule.length) {
            setTimeout(startSession, 500);
        }
    }
}

function renderSessionTracker() {
    const trackerEl = document.getElementById('active-session-tracker');
    const nameEl = document.getElementById('session-name');
    const timerEl = document.getElementById('session-timer');
    const startBtn = document.getElementById('start-session-btn');
    const endBtn = document.getElementById('end-session-btn');
    const iconEl = document.getElementById('session-icon');
    const dashboardEl = document.getElementById('performance-dashboard');

    if (currentSchedule.length === 0) {
        trackerEl.classList.add('hidden');
        dashboardEl.classList.add('hidden');
        return;
    }

    trackerEl.classList.remove('hidden');
    endBtn.classList.add('hidden');
    startBtn.classList.add('hidden');
    trackerEl.classList.remove('border-primary', 'bg-primary/10', 'border-secondary', 'bg-secondary/10', 'border-gray-400', 'bg-gray-100');
    dashboardEl.classList.add('hidden');


    if (sessionIndex >= currentSchedule.length) {
        nameEl.textContent = '🥳 Day Complete! Check Your Performance Summary Below!';
        timerEl.textContent = '00:00';
        iconEl.textContent = '✅';
        trackerEl.classList.add('border-secondary', 'bg-secondary/10');
        dashboardEl.classList.remove('hidden'); 
        return;
    }

    const currentItem = currentSchedule[sessionIndex];
    const durationMin = Math.ceil(currentItem.duration);

    iconEl.textContent = currentItem.type === 'break' ? '☕' : (currentItem.type === 'test' ? '📝' : '📚');
    nameEl.textContent = `${currentItem.name} (${formatTime(currentItem.duration)})`;

    if (timerInterval) {
        const min = Math.floor(remainingSec / 60);
        const sec = remainingSec % 60;
        timerEl.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        endBtn.classList.remove('hidden');
        trackerEl.classList.add('border-primary', 'bg-primary/10');
    } else {
        timerEl.textContent = `${durationMin.toString().padStart(2, '0')}:00`;
        startBtn.classList.remove('hidden');
        trackerEl.classList.add('border-secondary', 'bg-secondary/10');
    }
}

function generatePlan() {
    document.getElementById('schedule-error').classList.add('hidden');
    if (subjects.length === 0) {
        document.getElementById('schedule-error').textContent = 'Please add at least one subject to generate a plan.';
        document.getElementById('schedule-error').classList.remove('hidden');
        return;
    }

    const dayType = document.getElementById('day-type').value;
    let totalAvailableMin = dayType === 'normal' ? 360 : 480;

    const includeTest = document.getElementById('include-test').checked;
    const TEST_TIME_MIN = 90;
    let allocatedTestTime = 0;
    let effectiveStudyTime = totalAvailableMin;

    if (includeTest) {
        allocatedTestTime = TEST_TIME_MIN;
        effectiveStudyTime -= TEST_TIME_MIN;
    }

    if (effectiveStudyTime <= 0) {
        document.getElementById('schedule-error').textContent = 'Error: The planned time for the test paper exceeds or equals the total available study time.';
        document.getElementById('schedule-error').classList.remove('hidden');
        return;
    }

    const totalWeight = subjects.reduce((sum, subj) => sum + subj.priority, 0);

    const subjectTimeAllocations = subjects.map(subj => {
        const calculatedDuration = Math.round((subj.priority / totalWeight) * effectiveStudyTime);
        return {
            name: subj.name,
            duration: Math.max(0, calculatedDuration),
        };
    }).filter(subj => subj.duration > 0);

    const schedule = [];
    let currentTime = new Date();
    currentTime.setSeconds(0, 0);

    const minutesToNearestFive = 5 - (currentTime.getMinutes() % 5);
    if (minutesToNearestFive !== 5) {
        currentTime.setMinutes(currentTime.getMinutes() + minutesToNearestFive);
    }

    if (includeTest) {
        const startTime = new Date(currentTime);
        currentTime.setMinutes(currentTime.getMinutes() + allocatedTestTime);

        schedule.push({
            type: 'test',
            name: 'MOCK EXAM / TEST PAPER',
            startTime: startTime,
            endTime: new Date(currentTime),
            duration: allocatedTestTime
        });
        schedule.push({
            type: 'break',
            name: 'BREAK',
            startTime: new Date(currentTime),
            duration: BREAK_MIN
        });
        currentTime.setMinutes(currentTime.getMinutes() + BREAK_MIN);
    }

    let subjectIndex = 0;
    while (subjectIndex < subjectTimeAllocations.length) {
        const subj = subjectTimeAllocations[subjectIndex];
        let remainingTime = subj.duration;

        while (remainingTime > 0) {
            const blockDuration = Math.min(BLOCK_MIN, remainingTime);

            const startTime = new Date(currentTime);
            currentTime.setMinutes(currentTime.getMinutes() + blockDuration);

            schedule.push({
                type: 'study',
                name: subj.name,
                startTime: startTime,
                endTime: new Date(currentTime),
                duration: blockDuration
            });

            remainingTime -= blockDuration;

            const isLastBlockInPlan = (remainingTime === 0 && subjectIndex === subjectTimeAllocations.length - 1);

            if (!isLastBlockInPlan) {
                const breakStartTime = new Date(currentTime);
                currentTime.setMinutes(currentTime.getMinutes() + BREAK_MIN);

                schedule.push({
                    type: 'break',
                    name: 'SHORT BREAK',
                    startTime: breakStartTime,
                    endTime: new Date(currentTime),
                    duration: BREAK_MIN
                });
            }
        }
        subjectIndex++;
    }

    currentSchedule = schedule;
    sessionIndex = 0;
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    remainingSec = 0;
    
    renderSchedule(currentSchedule, totalAvailableMin); 
    renderSessionTracker();
}

function renderSchedule(schedule, totalAvailableMin = 0) {
    const listEl = document.getElementById('schedule-list');
    const summaryEl = document.getElementById('schedule-summary');
    const dashboardEl = document.getElementById('performance-dashboard');
    const dashboardSummaryEl = document.getElementById('dashboard-summary');
    const subjectBreakdownEl = document.getElementById('subject-breakdown');

    listEl.innerHTML = '';
    
    const studyTime = schedule
        .filter(item => item.type === 'study' || item.type === 'test')
        .reduce((sum, item) => sum + item.duration, 0);

    const breakTime = schedule
        .filter(item => item.type === 'break')
        .reduce((sum, item) => sum + item.duration, 0);

    const totalTime = studyTime + breakTime;

    if (schedule.length === 0) {
        listEl.innerHTML = '<li class="p-4 bg-gray-50 rounded-lg text-center text-gray-500">Could not generate a plan with the current inputs. Try adjusting priorities.</li>';
        summaryEl.classList.add('hidden');
        dashboardEl.classList.add('hidden');
        return;
    }

    if (schedule.length > 0) {
        const subjectDurationMap = {};
        schedule.forEach(item => {
            if (item.type === 'study' || item.type === 'test') {
                const name = item.name;
                subjectDurationMap[name] = (subjectDurationMap[name] || 0) + item.duration;
            }
        });

        const subjectsInPlan = Object.entries(subjectDurationMap).map(([name, duration]) => ({ name, duration }));
        const maxSubjectDuration = Math.max(...subjectsInPlan.map(s => s.duration), 0);

        dashboardSummaryEl.innerHTML = `
            <div class="p-3 bg-white rounded-lg border">
                <p class="text-2xl font-bold text-primary">${formatTime(studyTime)}</p>
                <p class="text-sm text-gray-500">Total Study Time</p>
            </div>
            <div class="p-3 bg-white rounded-lg border">
                <p class="text-2xl font-bold text-secondary">${formatTime(breakTime)}</p>
                <p class="text-sm text-gray-500">Total Break Time</p>
            </div>
        `;

        subjectBreakdownEl.innerHTML = subjectsInPlan.map(subj => {
            const percentage = maxSubjectDuration > 0 ? ((subj.duration / maxSubjectDuration) * 100) : 0;
            const durationFormatted = formatTime(subj.duration);
            const color = subj.name === 'MOCK EXAM / TEST PAPER' ? 'bg-red-500' : 'bg-primary';
            
            return `
                <div>
                    <div class="flex justify-between text-sm font-medium text-gray-700 mb-1">
                        <span>${subj.name}</span>
                        <span>${durationFormatted}</span>
                    </div>
                    <div class="w-full bg-gray-300 rounded-full h-2.5">
                        <div class="${color} h-2.5 rounded-full" style="width: ${percentage.toFixed(0)}%"></div>
                    </div>
                </div>
            `;
        }).join('');
        
        if (totalAvailableMin > 0) {
            const endOfDay = schedule[schedule.length - 1].endTime;
            summaryEl.innerHTML = `
                <p class="text-lg font-bold">Plan Generated! Your focused study time ends at ${formatClockTime(endOfDay)}</p>
                <p class="text-sm">Total Planned Time: ${formatTime(totalTime)} / ${formatTime(totalAvailableMin)}</p>
            `;
            summaryEl.classList.remove('hidden');
        }
    }
    
    schedule.forEach((item, index) => {
        let colorClass, icon, durationText, description, itemBorder;

        const isCompleted = index < sessionIndex;
        const isActive = index === sessionIndex && timerInterval;
        const isNext = index === sessionIndex && !timerInterval && index < schedule.length;
        
        if (item.type === 'study' || item.type === 'test') {
            colorClass = item.type === 'test' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200';
            icon = item.type === 'test' ? '📝' : '📚';
            description = item.type === 'test' ? 'Dedicated time for a full practice test or mock exam.' : 'Focused study session based on priority allocation (Pomodoro style).';
        } else {
            colorClass = 'bg-green-50 border-green-200';
            icon = '☕';
            description = 'Scheduled rest to maximize concentration for the next block.';
        }
        
        durationText = `Duration: ${formatTime(item.duration)}`;
        itemBorder = 'border-l-4';

        if (isCompleted) {
            colorClass = 'bg-gray-100 border-gray-400 opacity-60';
            icon = '✅';
            itemBorder = 'border-l-8 border-gray-400';
        } else if (isActive) {
            colorClass = 'bg-yellow-100 border-yellow-500 shadow-lg';
            icon = '▶️';
            itemBorder = 'border-l-8 border-yellow-500';
        } else if (isNext) {
            colorClass = 'bg-white border-primary-dark shadow-md';
            itemBorder = 'border-l-8 border-primary-dark';
        }

        listEl.innerHTML += `
            <li id="session-${index}" class="schedule-item flex p-4 ${colorClass} rounded-xl ${itemBorder} shadow-sm">
                <div class="flex-shrink-0 text-xl mr-4">${icon}</div>
                <div class="flex-grow">
                    <div class="flex justify-between items-start">
                        <h3 class="text-lg font-semibold text-gray-800">${item.name}</h3>
                        <div class="text-sm font-medium text-gray-600">
                            ${formatClockTime(item.startTime)} - ${formatClockTime(item.endTime)}
                        </div>
                    </div>
                    <p class="text-xs mt-1 text-gray-500">${description}</p>
                    <p class="text-sm font-medium mt-1">${durationText}</p>
                </div>
            </li>
        `;
    });
}