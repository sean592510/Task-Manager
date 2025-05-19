document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const dueDateInput = document.getElementById('due-date');
    const taskList = document.getElementById('task-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const taskCounter = document.getElementById('task-counter');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const shareGmailBtn = document.getElementById('share-gmail');
    const shareWhatsAppBtn = document.getElementById('share-whatsapp');
    const shareXBtn = document.getElementById('share-x');
    const shareLinkBtn = document.getElementById('share-link');
    const timelineContent = document.getElementById('timeline-content');
    const workingPerson = document.getElementById('working-person');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let filter = 'all';
    const pageUrl = window.location.href; // Replace with deployed URL after hosting


    function renderTasks() {
        taskList.innerHTML = '';
        const filteredTasks = tasks.filter(task => {
            if (filter === 'all') return true;
            if (filter === 'active') return !task.completed;
            if (filter === 'completed') return task.completed;
        });

        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : 'new';
            li.draggable = true;
            li.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''} class="mr-2">
                <input type="text" value="${task.text}" class="flex-1 p-1 ${task.completed ? 'line-through bg-gray-200' : ''}" readonly>
                <span class="text-gray-500 text-sm">${task.dueDate ? `Due: ${task.dueDate}` : ''}</span>
                <button class="text-red-500 hover:text-red-700 delete-btn">Delete</button>
            `;
            taskList.appendChild(li);
            setTimeout(() => li.className = task.completed ? 'completed' : '', 0);
        });

        taskCounter.textContent = `${tasks.filter(t => !t.completed).length} active task(s)`;
        saveTasks();
        renderTimeline();
        toggleAnimation();
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

  function renderTimeline() {
        timelineContent.innerHTML = '';
        tasks.forEach(task => {
            const event = document.createElement('div');
            event.className = 'timeline-event';
            event.innerHTML = `
                <p class="text-gray-800">${task.text}</p>
                <p class="text-gray-500 text-sm">Created: ${task.createdAt}</p>
                ${task.completedAt ? `<p class="text-gray-500 text-sm">Completed: ${task.completedAt}</p>` : ''}
            `;
            timelineContent.appendChild(event);
        });
    }

    function toggleAnimation() {
        if (tasks.length > 0) {
            workingPerson.classList.add('active');
        } else {
            workingPerson.classList.remove('active');
        }
    }

    taskForm.addEventListener('submit', e => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (text) {
            tasks.push({
                text,
                completed: false,
                dueDate: dueDateInput.value,
                createdAt: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
                completedAt: null
            });
            taskInput.value = '';
            dueDateInput.value = '';
            renderTasks();
        }
    });


    taskList.addEventListener('click', e => {
        if (e.target.type === 'checkbox') {
            const index = Array.from(taskList.children).indexOf(e.target.parentElement);
            tasks[index].completed = e.target.checked;
            tasks[index].completedAt = e.target.checked ? new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) : null;
            renderTasks();
        }
    });


    taskList.addEventListener('click', e => {
        if (e.target.classList.contains('delete-btn')) {
            const index = Array.from(taskList.children).indexOf(e.target.parentElement);
            tasks.splice(index, 1);
            renderTasks();
        }
    });

  taskList.addEventListener('dblclick', e => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'text') {
            e.target.readOnly = false;
            e.target.focus();
        }
    });

    taskList.addEventListener('blur', e => {
        if (e.target.type === 'text') {
            const index = Array.from(taskList.children).indexOf(e.target.parentElement);
            tasks[index].text = e.target.value.trim() || tasks[index].text;
            e.target.readOnly = true;
            renderTasks();
        }
    }, true);

    taskList.addEventListener('keydown', e => {
        if (e.target.type === 'text' && e.key === 'Enter') {
            e.target.blur();
        }
    });


    taskList.addEventListener('dragstart', e => {
        if (e.target.tagName === 'LI') {
            e.dataTransfer.setData('text', Array.from(taskList.children).indexOf(e.target));
        }
    });

    taskList.addEventListener('dragover', e => e.preventDefault());

    taskList.addEventListener('drop', e => {
        e.preventDefault();
        const fromIndex = e.dataTransfer.getData('text');
        const toIndex = Array.from(taskList.children).indexOf(e.target.closest('li'));
        const [movedTask] = tasks.splice(fromIndex, 1);
        tasks.splice(toIndex, 0, movedTask);
        renderTasks();
    });


    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('bg-blue-600', 'text-white'));
            btn.classList.add('bg-blue-600', 'text-white');
            filter = btn.dataset.filter;
            renderTasks();
        });
    });


    clearCompletedBtn.addEventListener('click', () => {
        tasks = tasks.filter(task => !task.completed);
        renderTasks();
    });


    function generateShareText() {
        const taskList = tasks.map(t => `${t.text}${t.dueDate ? ` (Due: ${t.dueDate})` : ''}`).join('\n');
        return `My Task List:\n${taskList}\nCheck out my Task Manager: ${pageUrl}`;
    }

    shareGmailBtn.addEventListener('click', () => {
        const shareText = generateShareText();
        const subject = 'My Task Manager List';
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText)}`;
        window.open(gmailUrl, '_blank');
    });

    shareWhatsAppBtn.addEventListener('click', () => {
        const shareText = generateShareText();
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
    });

    shareXBtn.addEventListener('click', () => {
        const shareText = generateShareText();
        const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(xUrl, '_blank');
    });

    shareLinkBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(pageUrl).then(() => {
            alert('Page link copied to clipboard!');
        });
    });

    
    renderTasks();
});
