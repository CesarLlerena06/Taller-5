document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('calendar');
    const monthYear = document.getElementById('month-year');
    const eventModal = document.getElementById('event-modal');
    const closeModal = document.querySelector('.close');
    const eventForm = document.getElementById('event-form');
    const deleteEventButton = document.getElementById('delete-event');

    let currentView = 'monthly'; // Puede ser 'annual', 'monthly', 'daily'
    let currentDate = new Date();
    let events = JSON.parse(localStorage.getItem('events')) || [];
    let currentEvent = null; // Evento actual para edición/eliminación

    function renderCalendar() {
        calendar.innerHTML = '';
        monthYear.textContent = getMonthYearString(currentDate);

        if (currentView === 'monthly') {
            renderMonthlyView();
        } else if (currentView === 'annual') {
            renderAnnualView();
        } else if (currentView === 'daily') {
            renderDailyView();
        }
    }

    function renderMonthlyView() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            calendar.appendChild(document.createElement('div'));
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day');
            dayDiv.textContent = day;
            dayDiv.addEventListener('click', () => showEventModal(year, month, day));
            calendar.appendChild(dayDiv);

            // Añadir eventos en la vista mensual
            events.forEach(event => {
                const eventDate = new Date(event.date);
                if (eventDate.getFullYear() === year && eventDate.getMonth() === month && eventDate.getDate() === day) {
                    const eventDiv = document.createElement('div');
                    eventDiv.classList.add('event');
                    eventDiv.textContent = event.description;
                    eventDiv.addEventListener('click', (e) => {
                        e.stopPropagation();
                        showEventModal(year, month, day, event);
                    });
                    dayDiv.appendChild(eventDiv);
                }
            });
        }
    }

    function renderAnnualView() {
        const year = currentDate.getFullYear();
        for (let month = 0; month < 12; month++) {
            const monthDiv = document.createElement('div');
            monthDiv.classList.add('month');
            monthDiv.textContent = new Date(year, month).toLocaleString('default', { month: 'long' });
            monthDiv.addEventListener('click', () => {
                currentDate.setMonth(month);
                currentView = 'monthly';
                renderCalendar();
            });
            calendar.appendChild(monthDiv);
        }
    }

    function renderDailyView() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const day = currentDate.getDate();

        for (let hour = 0; hour < 24; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.classList.add('time-slot');
            timeSlot.textContent = `${String(hour).padStart(2, '0')}:00`;
            calendar.appendChild(timeSlot);
        }

        // Añadir eventos en la vista diaria
        events.forEach(event => {
            const eventDate = new Date(event.date);
            if (eventDate.getFullYear() === year && eventDate.getMonth() === month && eventDate.getDate() === day) {
                const timeSlot = document.querySelector(`.time-slot:nth-child(${eventDate.getHours() + 1})`);
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event');
                eventDiv.textContent = event.description;
                timeSlot.appendChild(eventDiv);
                eventDiv.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEventModal(year, month, day, event);
                });
            }
        });
    }

    function showEventModal(year, month, day, event = null) {
        eventModal.style.display = 'block';
        currentEvent = event;
        if (event) {
            document.getElementById('event-date').value = event.date;
            document.getElementById('event-time').value = event.time;
            document.getElementById('event-description').value = event.description;
            document.getElementById('event-participants').value = event.participants;
        } else {
            document.getElementById('event-date').value = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            document.getElementById('event-time').value = '';
            document.getElementById('event-description').value = '';
            document.getElementById('event-participants').value = '';
        }
    }

    function getMonthYearString(date) {
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    document.getElementById('prev').addEventListener('click', () => {
        if (currentView === 'monthly') {
            currentDate.setMonth(currentDate.getMonth() - 1);
        } else if (currentView === 'annual') {
            currentDate.setFullYear(currentDate.getFullYear() - 1);
        } else if (currentView === 'daily') {
            currentDate.setDate(currentDate.getDate() - 1);
        }
        renderCalendar();
    });

    document.getElementById('next').addEventListener('click', () => {
        if (currentView === 'monthly') {
            currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (currentView === 'annual') {
            currentDate.setFullYear(currentDate.getFullYear() + 1);
        } else if (currentView === 'daily') {
            currentDate.setDate(currentDate.getDate() + 1);
        }
        renderCalendar();
    });

    document.getElementById('view-annual').addEventListener('click', () => {
        currentView = 'annual';
        renderCalendar();
    });

    document.getElementById('view-monthly').addEventListener('click', () => {
        currentView = 'monthly';
        renderCalendar();
    });

    document.getElementById('view-daily').addEventListener('click', () => {
        currentView = 'daily';
        renderCalendar();
    });

    closeModal.addEventListener('click', () => {
        eventModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === eventModal) {
            eventModal.style.display = 'none';
        }
    });

    eventForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const date = document.getElementById('event-date').value;
        const time = document.getElementById('event-time').value;
        const description = document.getElementById('event-description').value;
        const participants = document.getElementById('event-participants').value;
        if (currentEvent) {
            updateEvent(currentEvent, date, time, description, participants);
        } else {
            addEvent(date, time, description, participants);
        }
        eventModal.style.display = 'none';
    });

    deleteEventButton.addEventListener('click', () => {
        if (currentEvent) {
            deleteEvent(currentEvent);
            eventModal.style.display = 'none';
        }
    });

    function addEvent(date, time, description, participants) {
        events.push({ date, time, description, participants });
        localStorage.setItem('events', JSON.stringify(events));
        renderCalendar();
    }

    function updateEvent(event, date, time, description, participants) {
        event.date = date;
        event.time = time;
        event.description = description;
        event.participants = participants;
        localStorage.setItem('events', JSON.stringify(events));
        renderCalendar();
    }

    function deleteEvent(event) {
        events = events.filter(e => e !== event);
        localStorage.setItem('events', JSON.stringify(events));
        renderCalendar();
    }

    renderCalendar();
});
