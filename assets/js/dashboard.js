// --- Logout Button ---
    document.getElementById("logoutBtn").addEventListener("click", () => {
      // You can clear session/localStorage here if needed
      window.location.href = "../pages/login.html";
    });

    // --- Date & Time ---
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
    updateDateTime();

    // --- Dashboard Data and Chart ---

    let genderChart = null;

    function updateDashboard() {
      // Get employees & attendanceStats from localStorage
      const employees = JSON.parse(localStorage.getItem("employees")) || [];
      const attendanceStats = JSON.parse(localStorage.getItem("attendanceStats")) || { total: 0, present: 0 };

      // Update Total Employees count
      document.getElementById("employeeCount").textContent = employees.length;

      // Calculate attendance percentage safely
      let attendancePercent = 0;
      if (attendanceStats.total > 0) {
        attendancePercent = Math.round((attendanceStats.present / attendanceStats.total) * 100);
      }
      document.getElementById("attendanceCount").textContent = attendancePercent + "%";

      // Calculate male/female counts
      let maleCount = 0;
      let femaleCount = 0;
      employees.forEach(emp => {
        if (emp.gender?.toLowerCase() === "male") maleCount++;
        else if (emp.gender?.toLowerCase() === "female") femaleCount++;
      });

      drawGenderChart(maleCount, femaleCount);
    }

    function drawGenderChart(maleCount, femaleCount) {
      const ctx = document.getElementById('genderChart').getContext('2d');

      // Destroy existing chart instance if any
      if (genderChart) {
        genderChart.destroy();
      }

      genderChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Male', 'Female'],
          datasets: [{
            data: [maleCount, femaleCount],
            backgroundColor: ['#36A2EB', '#FF6384'],
            hoverOffset: 30,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { size: 14 }
              }
            },
            title: {
              display: true,
              text: 'Employee Gender Distribution'
            }
          }
        }
      });
    }

    // Run dashboard update on load
    updateDashboard();

    // Optional: Listen for localStorage changes (if you update employees in another tab)
    window.addEventListener('storage', (e) => {
      if (e.key === 'employees' || e.key === 'attendanceStats') {
        updateDashboard();
      }
    });
