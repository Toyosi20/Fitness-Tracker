class WorkoutTracker {
    static LOCAL_STORAGE_DATA_KEY = "workout-tracker-entries";

    constructor(root) {
        this.root = root;
        this.root.insertAdjacentHTML("afterbegin", WorkoutTracker.html());
        this.entries = [];
        this.loadEntries();
        this.updateView();

        this.addButton = this.root.querySelector(".tracker__add");
        this.addButton.addEventListener("click", () => {
            if (this.entries.length < 8) {
                const date = new Date();
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, "0");
                const day = date.getDate().toString().padStart(2, "0");

                this.addEntry({
                    date: `${ year }-${ month }-${ day }`,
                    workout: "running",
                    duration: 30
                });

                if (this.entries.length >= 8) {
                    this.addButton.disabled = true;
                    this.addButton.classList.add("disabled");
                }
            }
        });

        this.timerButton = this.root.querySelector(".timer__start");
        this.timerButton.addEventListener("click", this.startTimer.bind(this));
    }

    static html() {
        return `
            <table class="tracker">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Workout</th>
                        <th>Duration</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody class="tracker__entries">
                    <tr class="tracker__row tracker__row--add">
                        <td colspan="4">
                            <span class="tracker__add">Add Entry &plus;</span>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="timer">
                <input type="number" class="timer__input" placeholder="Minutes">
                <button class="timer__start">Start Timer</button>
                <div class="timer__display">00:00</div>
            </div>
        `;
    }

    static rowHtml() {
        return `
            <tr class="tracker__row">
                <td>
                    <input type="date" class="tracker__date">
                </td>
                <td>
                    <select class="tracker__workout">
                        <option value="running">Running</option>
                        <option value="outdoor-cycling">Outdoor Cycling</option>
                        <option value="indoor-cycling">Indoor Cycling</option>
                        <option value="swimming">Swimming</option>
                        <option value="yoga">Yoga</option>
                        <option value="weightlifting">Weightlifting</option>
                        <option value="pilates">Pilates</option>
                        <option value="kickboxing">Kickboxing</option>
                    </select>
                </td>
                <td>
                    <input type="number" class="tracker__duration">
                    <span class="tracker__text">minutes</span>
                </td>
                <td>
                    <button type="button" class="tracker__button tracker__delete">&times;</button>
                </td>
            </tr>
        `;
    }

    loadEntries() {
        this.entries = JSON.parse(localStorage.getItem(WorkoutTracker.LOCAL_STORAGE_DATA_KEY) || "[]");
    }

    saveEntries() {
        localStorage.setItem(WorkoutTracker.LOCAL_STORAGE_DATA_KEY, JSON.stringify(this.entries));
    }

    updateView() {
        const tableBody = this.root.querySelector(".tracker__entries");
        const addRow = data => {
            const template = document.createElement("template");
            let row = null;

            template.innerHTML = WorkoutTracker.rowHtml().trim();
            row = template.content.firstElementChild;

            row.querySelector(".tracker__date").value = data.date;
            row.querySelector(".tracker__workout").value = data.workout;
            row.querySelector(".tracker__duration").value = data.duration;

            row.querySelector(".tracker__date").addEventListener("change", ({ target }) => {
                data.date = target.value;
                this.saveEntries();
            });

            row.querySelector(".tracker__workout").addEventListener("change", ({ target }) => {
                data.workout = target.value;
                this.saveEntries();
            });

            row.querySelector(".tracker__duration").addEventListener("change", ({ target }) => {
                data.duration = target.value;
                this.saveEntries();
            });

            row.querySelector(".tracker__delete").addEventListener("click", () => {
                this.deleteEntry(data);
                this.addButton.disabled = false;
                this.addButton.classList.remove("disabled");
            });

            tableBody.appendChild(row);
        };

        tableBody.querySelectorAll(".tracker__row").forEach(row => {
            row.remove();
        });

        this.entries.forEach(data => addRow(data));
    }

    addEntry(data) {
        this.entries.push(data);
        this.saveEntries();
        this.updateView();
    }

    deleteEntry(dataToDelete) {
        this.entries = this.entries.filter(data => data !== dataToDelete);
        this.saveEntries();
        this.updateView();
    }

    startTimer() {
        const timerInput = this.root.querySelector(".timer__input");
        const timerDisplay = this.root.querySelector(".timer__display");
        let duration = parseInt(timerInput.value) * 60;
        let minutes, seconds;

        const timer = setInterval(() => {
            minutes = parseInt(duration / 60, 10);
            seconds = parseInt(duration % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            timerDisplay.textContent = `${minutes}:${seconds}`;
            timerDisplay.style.color = "green"; 

            if (--duration < 0) {
                clearInterval(timer);
                timerDisplay.textContent = "Time's Up! Start Next Workout";
                timerDisplay.style.color = "white"; 
            }
        }, 1000);
    }
}

const app = document.getElementById("app");

const wt = new WorkoutTracker(app);

window.wt = wt;
