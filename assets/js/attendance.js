const employees = JSON.parse(localStorage.getItem('employees')) || [];
let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || {};

const attendanceList = document.getElementById('attendanceList');
const summaryBody = document.querySelector('#summaryTable tbody');

let currentEdit = null; // To track which attendance record is being edited (key: empId_shift)

// Save attendance data to localStorage
function saveAttendance() {
  localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
}

// Render employees with attendance controls
function renderAttendance() {
  attendanceList.innerHTML = '';

  if (employees.length === 0) {
    attendanceList.innerHTML = '<p>No employees found. Please add employees first.</p>';
    summaryBody.innerHTML = '';
    return;
  }

  employees.forEach(emp => {
    let currentShift = 'Day';

    const div = document.createElement('div');
    div.classList.add('employee');

    const info = document.createElement('span');
    info.textContent = `${emp.name} (Phone: ${emp.empId})`;
    div.appendChild(info);

    const shiftSelect = document.createElement('select');
    ['Day', 'Night'].forEach(shiftOption => {
      const option = document.createElement('option');
      option.value = shiftOption;
      option.textContent = shiftOption;
      shiftSelect.appendChild(option);
    });
    div.appendChild(shiftSelect);

    const presentBtn = document.createElement('button');
    presentBtn.textContent = 'Present';

    const absentBtn = document.createElement('button');
    absentBtn.textContent = 'Absent';

    div.appendChild(presentBtn);
    div.appendChild(absentBtn);

    const updatedTime = document.createElement('span');
    updatedTime.style.marginLeft = '15px';
    updatedTime.style.fontSize = '0.9em';
    updatedTime.style.color = '#666';
    div.appendChild(updatedTime);

    function updateUI(shift) {
      currentShift = shift;
      shiftSelect.value = currentShift;

      const key = `${emp.empId}_${currentShift}`;
      const data = attendanceData[key] || { status: 'Not Marked', datetime: null };

      presentBtn.classList.toggle('selected', data.status === 'Present');
      absentBtn.classList.toggle('selected', data.status === 'Absent');

      updatedTime.textContent = data.datetime
        ? `Last updated: ${new Date(data.datetime).toLocaleString()}`
        : '';
    }

    updateUI('Day');

    shiftSelect.addEventListener('change', () => {
      updateUI(shiftSelect.value);
      renderSummary();
    });

    presentBtn.addEventListener('click', () => {
      const key = `${emp.empId}_${currentShift}`;
      attendanceData[key] = {
        status: 'Present',
        datetime: new Date().toISOString(),
      };
      saveAttendance();
      updateUI(currentShift);
      renderSummary();
    });

    absentBtn.addEventListener('click', () => {
      const key = `${emp.empId}_${currentShift}`;
      attendanceData[key] = {
        status: 'Absent',
        datetime: new Date().toISOString(),
      };
      saveAttendance();
      updateUI(currentShift);
      renderSummary();
    });

    attendanceList.appendChild(div);
  });
}

function renderSummary() {
  summaryBody.innerHTML = '';

  const entries = Object.entries(attendanceData);

  if (entries.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.style.textAlign = 'center';
    td.textContent = 'No attendance marked yet.';
    tr.appendChild(td);
    summaryBody.appendChild(tr);
    return;
  }

  entries.forEach(([key, data]) => {
    if (data.status && data.status !== 'Not Marked') {
      const [empId, shift] = key.split('_');
      const emp = employees.find(e => e.empId === empId);
      if (!emp) return;

      const tr = document.createElement('tr');

      const nameTd = document.createElement('td');
      nameTd.textContent = emp.name;
      tr.appendChild(nameTd);

      const shiftTd = document.createElement('td');
      shiftTd.textContent = shift;
      tr.appendChild(shiftTd);

      const statusTd = document.createElement('td');
      statusTd.textContent = data.status;
      tr.appendChild(statusTd);

      const datetimeTd = document.createElement('td');
      datetimeTd.textContent = data.datetime ? new Date(data.datetime).toLocaleString() : '';
      tr.appendChild(datetimeTd);

      // Actions: Edit, Delete buttons
      const actionsTd = document.createElement('td');

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.style.marginRight = '10px';
      editBtn.addEventListener('click', () => {
        loadAttendanceForEdit(empId, shift);
      });
      actionsTd.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.style.color = 'red';
      deleteBtn.addEventListener('click', () => {
        if (confirm(`Delete attendance for ${emp.name} (${shift} shift)?`)) {
          delete attendanceData[key];
          saveAttendance();
          renderAttendance();
          renderSummary();
          currentEdit = null;
        }
      });
      actionsTd.appendChild(deleteBtn);

      tr.appendChild(actionsTd);

      summaryBody.appendChild(tr);
    }
  });
}

function loadAttendanceForEdit(empId, shift) {
  // Find the employee div in attendanceList
  const employeeDivs = attendanceList.querySelectorAll('.employee');

  for (const div of employeeDivs) {
    const infoSpan = div.querySelector('span');
    if (!infoSpan) continue;
    if (!infoSpan.textContent.includes(empId)) continue;

    // Found employee div, now update shift select and buttons accordingly
    const shiftSelect = div.querySelector('select');
    const presentBtn = div.querySelector('button:nth-of-type(1)');
    const absentBtn = div.querySelector('button:nth-of-type(2)');
    const updatedTime = div.querySelector('span:nth-of-type(2)');

    if (shiftSelect && presentBtn && absentBtn) {
      shiftSelect.value = shift;

      const key = `${empId}_${shift}`;
      const data = attendanceData[key] || { status: 'Not Marked', datetime: null };

      presentBtn.classList.toggle('selected', data.status === 'Present');
      absentBtn.classList.toggle('selected', data.status === 'Absent');

      updatedTime.textContent = data.datetime
        ? `Last updated: ${new Date(data.datetime).toLocaleString()}`
        : '';

      // Scroll to this employee div for easy editing
      div.scrollIntoView({ behavior: 'smooth', block: 'center' });

      currentEdit = key; // store editing key
    }
  }
}

// Logout button example, if needed
document.getElementById('logoutBtn').addEventListener('click', () => {
  window.location.href = "../pages/login.html";
});

// Initial render calls
renderAttendance();
renderSummary();




function renderSummary() {
  summaryBody.innerHTML = '';

  const nameFilter = document.getElementById('searchName')?.value.toLowerCase() || '';
  const shiftFilter = document.getElementById('shiftFilter')?.value || '';

  const entries = Object.entries(attendanceData);

  const filteredEntries = entries.filter(([key, data]) => {
    if (data.status && data.status !== 'Not Marked') {
      const [empId, shift] = key.split('_');
      const emp = employees.find(e => e.empId === empId);
      if (!emp) return false;

      const matchesName = emp.name.toLowerCase().includes(nameFilter);
      const matchesShift = shiftFilter === '' || shift === shiftFilter;
      return matchesName && matchesShift;
    }
    return false;
  });

  if (filteredEntries.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.style.textAlign = 'center';
    td.textContent = 'No matching records.';
    tr.appendChild(td);
    summaryBody.appendChild(tr);
    return;
  }

  filteredEntries.forEach(([key, data]) => {
    const [empId, shift] = key.split('_');
    const emp = employees.find(e => e.empId === empId);
    if (!emp) return;

    const tr = document.createElement('tr');

    const nameTd = document.createElement('td');
    nameTd.textContent = emp.name;
    tr.appendChild(nameTd);

    const shiftTd = document.createElement('td');
    shiftTd.textContent = shift;
    tr.appendChild(shiftTd);

    const statusTd = document.createElement('td');
    statusTd.textContent = data.status;
    tr.appendChild(statusTd);

    const datetimeTd = document.createElement('td');
    datetimeTd.textContent = data.datetime ? new Date(data.datetime).toLocaleString() : '';
    tr.appendChild(datetimeTd);

    const actionsTd = document.createElement('td');

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.style.marginRight = '10px';
    editBtn.addEventListener('click', () => {
      loadAttendanceForEdit(empId, shift);
    });
    actionsTd.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.color = 'red';
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete attendance for ${emp.name} (${shift} shift)?`)) {
        delete attendanceData[key];
        saveAttendance();
        renderAttendance();
        renderSummary();
        currentEdit = null;
      }
    });
    actionsTd.appendChild(deleteBtn);

    tr.appendChild(actionsTd);
    summaryBody.appendChild(tr);
  });
}
document.getElementById('searchName').addEventListener('input', renderSummary);
document.getElementById('shiftFilter').addEventListener('change', renderSummary);

document.getElementById('downloadBtn').addEventListener('click', () => {
  const wb = XLSX.utils.book_new();
  const wsData = [['Name', 'Shift', 'Status', 'Datetime']];

  Object.entries(attendanceData).forEach(([key, data]) => {
    const [empId, shift] = key.split('_');
    const emp = employees.find(e => e.empId === empId);
    if (!emp || !data.status || data.status === 'Not Marked') return;

    wsData.push([
      emp.name,
      shift,
      data.status,
      data.datetime ? new Date(data.datetime).toLocaleString() : ''
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance Summary');
  XLSX.writeFile(wb, 'Attendance_Summary.xlsx');
});

function updateDateTime() {
  const now = new Date();
  const formatted = now.toLocaleString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  document.getElementById('dateTime').textContent = formatted;
}

setInterval(updateDateTime, 1000);
updateDateTime(); // initial call
