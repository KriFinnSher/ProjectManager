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
