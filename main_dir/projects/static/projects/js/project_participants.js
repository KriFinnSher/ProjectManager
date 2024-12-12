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

            const addFileButton = document.getElementById('add-file-button');

            if (data.leader) {
                statusEditContainer.style.display = 'block';
                statusDropdown.value = data.status;
                statusText.style.display = 'none';
            } else {
                statusEditContainer.style.display = 'none';
                statusText.style.display = 'block';
                addFileButton.style.display = 'none';
            }

            const participantsList = document.getElementById('modal-project-participants');
            participantsList.innerHTML = '';
            data.participants.forEach(([name, role]) => {
                const li = document.createElement('li');
                li.textContent = `${name} (${role})`;
                if (role === 'leader') {
                    li.style.fontWeight = 'bold';
                    li.style.backgroundColor = '#2a1591';
                }
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

function closeTableModal() {
    document.getElementById("table-modal").style.display = "none";
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.tables_main')) {
        updateTables();
    } else if (document.querySelector('.project_main')) {
        updateProjects();
    }
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

    console.log('Params:', params.toString());


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
                projectStatus.textContent = `<< ${project.status} >>`;

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

let files = [];

function updateFileList() {
    const fileInput = document.getElementById('project_files');
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';

    Array.from(fileInput.files).forEach(file => {
        if (!files.some(f => f.name === file.name)) {
            files.push(file);
        }
    });

    files.forEach((file, index) => {
        const fileDiv = document.createElement('div');
        fileDiv.classList.add('file-item');
        fileDiv.innerHTML = `
            <span>${file.name}</span>
            <button class="remove_button" type="button" onclick="removeFile(${index})">Удалить</button>
        `;

        fileList.appendChild(fileDiv);
    });

    addHiddenInputsToFormF();

}

function removeFile(index) {
    files.splice(index, 1);

    updateFileInput()
    updateFileList();
    addHiddenInputsToFormF();
}

function addHiddenInputsToFormF() {
    const fileListDiv = document.getElementById('file-list');

    const previousInputs = document.querySelectorAll('.file-input');
    previousInputs.forEach(input => input.remove());

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
    const dataTransfer = new DataTransfer();

    files.forEach(file => dataTransfer.items.add(file));

    fileInput.files = dataTransfer.files;
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.project_main')) {
        const fileList = document.getElementById('modal-project-files');
        const fileInput = document.getElementById('file-input');
        const addFileButton = document.getElementById('add-file-button');

        addFileButton.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (event) => {
            const files = event.target.files;
            const projectId = document.getElementById('project-modal').dataset.projectId;
            const isLeader = (document.getElementById('project-modal').dataset.isLeader === 'true');

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

        window.deleteFile = function(name, button) {
            fetch('/projects/delete_project_file/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ file_name: name }),
            }).then(() => button.parentElement.remove());
        };
    }
});


function updateTables() {
    const group = document.getElementById('group').value;
    const subject = document.getElementById('subject').value;
    const sort = document.getElementById('sorts').value;
    const tableList = document.getElementById('table-list');

    if (!tableList) {
        console.error('Элемент table-list не найден');
        return;
    }

    const params = new URLSearchParams();
    if (group !== 'all_groups') params.append('group', group);
    if (subject !== 'all_subjects') params.append('subject', subject);
    params.append('sort', sort);

    console.log(params)

    fetch(`/tables/filter_tables?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            tableList.innerHTML = '';

            data.tables.forEach(table => {
                const tableCard = document.createElement('div');
                tableCard.className = 'table-card';
                tableCard.setAttribute('onclick', `openModalTable('${table.id}')`);

                const tableContent = document.createElement('div');
                tableContent.className = 'table-content';

                const tableHeader = document.createElement('div');
                tableHeader.className = 'table-header';
                tableHeader.textContent = `Тема проекта: ${table.theme}`;

                const subjectName = document.createElement('div');
                subjectName.className = 'team-name';
                subjectName.textContent = `Команда: ${table.team}`;

                const projectStatus = document.createElement('div');
                projectStatus.className = 'project-status';
                projectStatus.textContent = `Статус: ${table.status}`;

                const tableGroup = document.createElement('div');
                tableGroup.className = 'table-group';
                tableGroup.textContent = table.group;

                tableContent.appendChild(tableHeader);
                tableContent.appendChild(subjectName);
                tableContent.appendChild(projectStatus);

                tableCard.appendChild(tableContent);
                tableCard.appendChild(tableGroup);



                tableList.appendChild(tableCard);
            });
        })
        .catch(error => {
            console.error('Error fetching tables:', error);
        });
}


function openModalTable(projectId) {
    const modal = document.getElementById('table-modal');
    modal.dataset.projectId = projectId;
    fetch(`/projects/project_data/${projectId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('modal-project-theme').textContent = data.theme;
            document.getElementById('modal-project-name').textContent = `[${data.subject}]`;

            const statusText = document.getElementById('modal-project-status');

            statusText.textContent = `< ${data.status} >`;

            const participantsList = document.getElementById('modal-project-participants');
            participantsList.innerHTML = '';
            data.participants.forEach(([name, role]) => {
                const li = document.createElement('li');
                li.textContent = `${name} (${role})`;
                if (role === 'leader') {
                    li.style.fontWeight = 'bold';
                    li.style.backgroundColor = '#e39802';
                }
                participantsList.appendChild(li);
            });

            document.getElementById('file-count').textContent = `${data.project_files.length}`;

            modal.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching project data:', error);
        });
}


function fileExport() {
    const group = document.getElementById('group').value;
    const subject = document.getElementById('subject').value;
    const sort = document.getElementById('sorts').value;

    const params = new URLSearchParams();
    if (group !== 'all_groups') params.append('group', group);
    if (subject !== 'all_subjects') params.append('subject', subject);
    params.append('sort', sort);

    const downloadLink = document.createElement('a');
    downloadLink.href = `/tables/export_file?${params.toString()}`;
    downloadLink.target = '_blank';
    downloadLink.download = `${group}_${subject}.csv`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}
