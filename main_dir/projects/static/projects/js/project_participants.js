let participants = [];
let isLeaderSelected = false;

function addParticipant() {
    const participantNameInput = document.getElementById('participant_name');
    const participantName = participantNameInput.value.trim();
    const isLeader = document.getElementById('leader').checked;

    if (participantName === '') {
        alert('Пожалуйста, введите ФИО участника.');
        return;
    }

    if (isLeader && isLeaderSelected) {
        alert('Лидер уже выбран.');
        return;
    }

    participants.push({
        name: participantName,
        role: isLeader ? 'leader' : 'member'
    });

    if (isLeader) {
        isLeaderSelected = true;
    }

    updateParticipantsList();

    addHiddenInputsToForm();

    participantNameInput.value = '';
    document.getElementById('leader').checked = false;
}

function updateParticipantsList() {
    const participantsList = document.getElementById('participants-list');
    participantsList.innerHTML = '';

    participants.forEach((participant, index) => {
        const participantDiv = document.createElement('div');
        participantDiv.classList.add('participant');
        participantDiv.innerHTML = `
            ${participant.name} (${participant.role === 'leader' ? 'Лидер' : 'Участник'})
            <button class="remove_button" type="button" onclick="removeParticipant(${index})">Удалить</button>
        `;
        participantsList.appendChild(participantDiv);
    });
}

function removeParticipant(index) {
    if (participants[index].role === 'leader') {
        isLeaderSelected = false;
    }

    participants.splice(index, 1);

    updateParticipantsList();

    addHiddenInputsToForm();
}

function addHiddenInputsToForm() {
    const participantsListDiv = document.getElementById('participants-list');

    const previousInputs = document.querySelectorAll('.participant-input');
    previousInputs.forEach(input => input.remove());

    participants.forEach(participant => {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'participant_name';
        hiddenInput.value = [participant.name, participant.role];

        hiddenInput.classList.add('participant-input');
        participantsListDiv.appendChild(hiddenInput);
    });

    const leaderInput = document.querySelector('.leader-input');
    if (isLeaderSelected && leaderInput) {
        leaderInput.remove();
        const leaderHiddenInput = document.createElement('input');
        leaderHiddenInput.type = 'hidden';
        leaderHiddenInput.name = 'leader';
        leaderHiddenInput.value = participants.find(p => p.role === 'leader').name;
        leaderHiddenInput.classList.add('leader-input');
        participantsListDiv.appendChild(leaderHiddenInput);
    } else if (!isLeaderSelected) {
        const leaderHiddenInput = document.querySelector('.leader-input');
        if (leaderHiddenInput) {
            leaderHiddenInput.remove();
        }
    }
}



function openModal(projectId) {
    const modal = document.getElementById('project-modal');
    modal.dataset.projectId = projectId;
    console.log(projectId)
    fetch(`/projects/project_data/${projectId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('modal-project-theme').textContent = data.theme;
            document.getElementById('modal-project-name').textContent = `[${data.subject}]`;

            const statusText = document.getElementById('modal-project-status');
            const statusEditContainer = document.getElementById('status-edit-container');
            const statusDropdown = document.getElementById('status-dropdown');

            statusText.textContent = `< ${data.status} >`;

            modal.dataset.isLeader = data.leader;

            if (data.leader) {
                statusEditContainer.style.display = 'block';
                statusDropdown.value = data.status;
                statusText.style.display = 'none';
            } else {
                statusEditContainer.style.display = 'none';
                statusText.style.display = 'block';
            }

            const participantsList = document.getElementById('modal-project-participants');
            participantsList.innerHTML = ''; // Очистка списка участников
            data.participants.forEach(([name, role]) => {
                const li = document.createElement('li');
                li.textContent = `${name} (${role})`;
                participantsList.appendChild(li);
            });

            const fileList = document.getElementById('modal-project-files');
            fileList.innerHTML = '';

            data.project_files.forEach((name, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <a href="${data.project_files_urls[index]}" download="${name}">${name}</a>
                `;

                if (data.leader) {
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Удалить';
                    deleteButton.onclick = function() {
                        deleteFile(name, this);
                    };
                    li.appendChild(deleteButton);
                }

                fileList.appendChild(li);
            });

            modal.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching project data:', error);
        });
}

function deleteFile(name, button) {
    fetch('/projects/delete_project_file/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file_name: name }),
    }).then(() => button.parentElement.remove());
}


function closeModal() {
    document.getElementById("project-modal").style.display = "none";
}

document.addEventListener('DOMContentLoaded', function() {
    // Выполняем обновление сразу при загрузке страницы, чтобы отобразить все проекты
    updateProjects();
});

function updateProjects() {
    const state = document.getElementById('active_archive').value;
    const sort = document.getElementById('sorts').value;
    const status = document.getElementById('status').value;
    const projectList = document.getElementById('project-list');

    if (!projectList) {
        console.error('Элемент project-list не найден');
        return;
    }

    const params = new URLSearchParams();
    if (state !== 'all_aa') params.append('state', state);
    if (sort !== 'all_sorts') params.append('sort', sort);
    params.append('status', status);

    fetch(`/projects/filter_projects/?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            projectList.innerHTML = '';

            data.projects.forEach(project => {
                const projectCard = document.createElement('div');
                projectCard.className = 'project-card';
                projectCard.setAttribute('onclick', `openModal('${project.id}')`);

                const projectHeader = document.createElement('div');
                projectHeader.className = 'project-header';
                projectHeader.textContent = project.theme;

                const subjectName = document.createElement('div');
                subjectName.className = 'subject-name';
                subjectName.textContent = `[${project.subject}]`;

                const projectStatus = document.createElement('div');
                projectStatus.className = 'project-status';
                projectStatus.textContent = `< ${project.status} >`;

                projectCard.appendChild(projectHeader);
                projectCard.appendChild(subjectName);
                projectCard.appendChild(projectStatus);

                projectList.appendChild(projectCard);
            });
        })
        .catch(error => {
            console.error('Error fetching projects:', error);
        });
}

function updateProjectStatus() {
    const statusDropdown = document.getElementById('status-dropdown');
    const newStatus = statusDropdown.value;
    const projectId = document.getElementById('project-modal').dataset.projectId; // Берем ID проекта из модального окна

    fetch(`/projects/update_project_status/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            project_id: projectId,
            status: newStatus
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Статус успешно обновлен!');
                closeModal();
            } else {
                alert('Не удалось обновить статус.');
            }
        })
        .catch(error => {
            console.error('Error updating project status:', error);
        });
}

let files = []; // Массив для хранения выбранных файлов

function updateFileList() {
    const fileInput = document.getElementById('project_files');
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = ''; // Очистить список перед добавлением новых элементов

    // Добавляем файлы, выбранные через input
    Array.from(fileInput.files).forEach(file => {
        // Добавляем файл в список, если его еще нет
        if (!files.some(f => f.name === file.name)) {
            files.push(file);
        }
    });

    // Отображаем все файлы в файле
    files.forEach((file, index) => {
        const fileDiv = document.createElement('div');
        fileDiv.classList.add('file-item');
        fileDiv.innerHTML = `
            <span>${file.name}</span>
            <button class="remove_button" type="button" onclick="removeFile(${index})">Удалить</button>
        `;

        fileList.appendChild(fileDiv);
    });

    // Обновляем скрытые поля формы
    addHiddenInputsToFormF();

}

function removeFile(index) {
    // Удаляем файл из массива
    files.splice(index, 1);

    updateFileInput()
    updateFileList(); // Перерисовываем список файлов после удаления
    addHiddenInputsToFormF(); // Обновляем скрытые поля формы
}

function addHiddenInputsToFormF() {
    const fileListDiv = document.getElementById('file-list');

    // Удаляем старые скрытые поля
    const previousInputs = document.querySelectorAll('.file-input');
    previousInputs.forEach(input => input.remove());

    // Добавляем скрытые поля для каждого оставшегося файла
    files.forEach(file => {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'project_files';
        hiddenInput.value = file.name;
        hiddenInput.classList.add('file-input');
        fileListDiv.appendChild(hiddenInput);
    });
}

function updateFileInput() {
    const fileInput = document.getElementById('project_files');
    const dataTransfer = new DataTransfer();  // Создаем новый объект DataTransfer

    // Добавляем оставшиеся файлы в новый объект DataTransfer
    files.forEach(file => dataTransfer.items.add(file));

    // Обновляем поле ввода, установив новые файлы
    fileInput.files = dataTransfer.files;
}

document.addEventListener('DOMContentLoaded', function() {
    const fileList = document.getElementById('modal-project-files');
    const fileInput = document.getElementById('file-input');
    const addFileButton = document.getElementById('add-file-button');

    // Открытие проводника при клике на кнопку "Добавить файлы"
    addFileButton.addEventListener('click', () => {
        fileInput.click();  // Программное открытие скрытого поля ввода
    });

    // Обработка выбранных файлов
    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        const projectId = document.getElementById('project-modal').dataset.projectId;
        const isLeader = (document.getElementById('project-modal').dataset.isLeader === 'true');

        // Добавление файлов в список на странице
        Array.from(files).forEach(file => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="${URL.createObjectURL(file)}" download="${file.name}">${file.name}</a>
            `;

            console.log(Boolean(isLeader));
            if (isLeader) {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Удалить';
                deleteButton.onclick = function() {
                    deleteFile(file.name, this);
                };
                li.appendChild(deleteButton);
            }

            fileList.appendChild(li);
        });

        // Отправка файлов на сервер
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });
        formData.append('project_id', projectId);

        fetch('/projects/upload_project_files/', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
          .then(data => {
              if (data.success) {
                  console.log('Файлы успешно добавлены');
              }
          }).catch(error => console.error('Ошибка:', error));
    });

    // Удаление файла
    window.deleteFile = function(name, button) {
        fetch('/projects/delete_project_file/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ file_name: name }),
        }).then(() => button.parentElement.remove());
    };
});