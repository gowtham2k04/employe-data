const form = document.getElementById("employeeForm");
const employeeList = document.getElementById("employeeList");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

let editIndex = -1;

// Display employees in table and show summary
function displayEmployees() {
  const employees = JSON.parse(localStorage.getItem("employees")) || [];
  employeeList.innerHTML = "";

  if (employees.length === 0) {
    employeeList.innerHTML = `
      <tr><td colspan="4" style="text-align:center; padding: 15px;">No employees added yet.</td></tr>
    `;
    updateSummary(0, 0);  // update summary as well
    return;
  }

  let maleCount = 0;
  let femaleCount = 0;

  employees.forEach((emp, index) => {
    if(emp.gender === "Male") maleCount++;
    if(emp.gender === "Female") femaleCount++;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${emp.name}</td>
      <td>${emp.empId}</td>
      <td>${emp.gender}</td>
      <td class="actions">
        <button class="edit-btn" data-index="${index}">Edit</button>
        <button class="delete-btn" data-index="${index}">Delete</button>
      </td>
    `;
    employeeList.appendChild(tr);
  });

  updateSummary(maleCount, femaleCount);
function updateSummary(male, female) {
  let summaryEl = document.getElementById("genderSummary");
  if(!summaryEl){
    summaryEl = document.createElement("div");
    summaryEl.id = "genderSummary";
    summaryEl.style.marginTop = "20px";
    summaryEl.style.fontWeight = "bold";
    form.parentNode.insertBefore(summaryEl, form.nextSibling);
  }
  const total = male + female;
  summaryEl.innerHTML = `
    Total Employees: ${total} &nbsp;&nbsp; 
    Male: ${male} &nbsp;&nbsp; 
    Female: ${female}
  `;
}

  // Attach event listeners to buttons
  document.querySelectorAll(".edit-btn").forEach(button => {
    button.addEventListener("click", e => {
      editEmployee(parseInt(e.target.dataset.index));
    });
  });

  document.querySelectorAll(".delete-btn").forEach(button => {
    button.addEventListener("click", e => {
      deleteEmployee(parseInt(e.target.dataset.index));
    });
  });
}

function updateSummary(male, female) {
  let summaryEl = document.getElementById("genderSummary");
  if(!summaryEl){
    summaryEl = document.createElement("div");
    summaryEl.id = "genderSummary";
    summaryEl.style.marginTop = "20px";
    form.parentNode.insertBefore(summaryEl, form.nextSibling);
  }
  summaryEl.innerHTML = `<strong>Male:</strong> ${male} &nbsp;&nbsp; <strong>Female:</strong> ${female}`;
}

// Add or update employee
form.addEventListener("submit", e => {
  e.preventDefault();

  const name = form.name.value.trim();
  const empId = form.empId.value.trim();
  const gender = form.gender.value;

  if (!name || !empId || !gender) {
    alert("Please fill in all fields");
    return;
  }

  let employees = JSON.parse(localStorage.getItem("employees")) || [];

  if (editIndex === -1) {
    employees.push({ name, empId, gender });
  } else {
    employees[editIndex] = { name, empId, gender };
    editIndex = -1;
    submitBtn.textContent = "Add Employee";
    cancelEditBtn.style.display = "none";
  }

  localStorage.setItem("employees", JSON.stringify(employees));
  form.reset();
  displayEmployees();
});

// Edit
function editEmployee(index) {
  const employees = JSON.parse(localStorage.getItem("employees")) || [];
  if (!employees[index]) return;

  form.name.value = employees[index].name;
  form.empId.value = employees[index].empId;
  form.gender.value = employees[index].gender;
  editIndex = index;
  submitBtn.textContent = "Update Employee";
  cancelEditBtn.style.display = "inline-block";
}

// Cancel edit
cancelEditBtn.addEventListener("click", () => {
  form.reset();
  editIndex = -1;
  submitBtn.textContent = "Add Employee";
  cancelEditBtn.style.display = "none";
});

// Delete
function deleteEmployee(index) {
  let employees = JSON.parse(localStorage.getItem("employees")) || [];
  if (!employees[index]) return;

  if (confirm(`Are you sure you want to delete employee "${employees[index].name}"?`)) {
    employees.splice(index, 1);
    localStorage.setItem("employees", JSON.stringify(employees));
    displayEmployees();
  }
};
// Initial Load
displayEmployees();

// Logout
logoutBtn.addEventListener("click", () => {
  window.location.href = "../pages/login.html";
});

// Search filter
document.getElementById('searchInput').addEventListener('input', function () {
  const filter = this.value.toLowerCase();
  const rows = document.querySelectorAll('#employeeList tr');

  rows.forEach(row => {
    const name = row.querySelector('td').textContent.toLowerCase();
    row.style.display = name.includes(filter) ? '' : 'none';
  });
});

// Download PDF
document.getElementById('downloadPdfBtn').addEventListener('click', () => {
  const element = document.getElementById('employeeTable');

  const opt = {
    margin: 0.5,
    filename: 'employee-details.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
});

// Initial Load
displayEmployees();

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
