function roll(min, max, floatFlag) {
    let r = Math.random() * (max - min) + min
    return floatFlag ? r : Math.floor(r)
}

let weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
let firstDay = new Date("3/1/2020")

function getNextDay(day) {
    let nextDay = new Date(day)
    nextDay.setDate(day.getDate() + 1)
    return nextDay
}

function generateTasks() {
    return [...Array(roll(2, 5))].map((_, i) => {
        return {
            index: i,
            name: `Task ${roll(1, 60)}`,
            complete: roll(0, 2) ? true : false
        }
    })
}

function buildWeek(day) {
    return [...Array(7)].map((_, i) => {
        let weekday = {
            index: i,
            date: day,
            tasks: generateTasks()
        }
        day = getNextDay(day)
        return weekday
    })
}

let week = buildWeek(firstDay)

let schedule = document.getElementById("WeeklySchedule")
let scheduleHtml = week.reduce((accum, day) => {
    return accum + `<div class="day">
        <div>${weekdays[day.date.getDay()]} - ${getDayTasksComplete(day)} Complete</div>
        <div class="tasks">
            ${tasksToHtml(day.tasks)}
        </div>
    </div>`
}, '')

function tasksToHtml(tasks) {
    return tasks.reduce((accum, task) => {
        return accum + `
            <div class="circle-container ${task.complete ? 'checked' : ''}">
                <div class="circle"></div>
                <label>${task.name}</label>
            </div>
        `
    }, '')
}

function getDayTasksComplete(day) {
    return day.tasks.reduce((accumulator, task) => {
        return task.complete ? accumulator + 1 : accumulator
    }, 0)
}

function getWeekTasksComplete(week) {
    return week.reduce((accumulator, day) => {
        return accumulator + getDayTasksComplete(day)    
    }, 0)
}

schedule.innerHTML = `
    <div class="weekly-summary">
        ${getWeekTasksComplete(week)} Tasks Completed
    </div>` + scheduleHtml
