document.addEventListener('DOMContentLoaded', function() {
    // Initialize database if not exists
    if (!localStorage.getItem('hotelReceipts')) {
        localStorage.setItem('hotelReceipts', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([
            { username: 'admin', password: 'admin' }
        ]));
    }
    
    // Login elements
    const loginContainer = document.getElementById('login-container');
    const mainContainer = document.getElementById('main-container');
    const loginForm = document.getElementById('login-form');
    
    // Main app elements
    const logoutBtn = document.getElementById('logout-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const receiptForm = document.getElementById('receipt-form');
    const printReceiptBtn = document.getElementById('print-receipt');
    
    // Reports elements
    const reportsBody = document.getElementById('reports-body');
    const filterReportsBtn = document.getElementById('filter-reports');
    const clearFilterBtn = document.getElementById('clear-filter');
    const reportDateInput = document.getElementById('report-date');
    
    // Login functionality
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            loginContainer.style.display = 'none';
            mainContainer.style.display = 'block';
            loadReports();
        } else {
            alert('Invalid username or password');
        }
    });
    
    // Logout functionality
    logoutBtn.addEventListener('click', function() {
        loginContainer.style.display = 'block';
        mainContainer.style.display = 'none';
        loginForm.reset();
    });
    
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Receipt form submission
    receiptForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const date = document.getElementById('date').value;
        const roomno = document.getElementById('roomno').value;
        const roomtype = document.getElementById('roomtype').value;
        const guestname = document.getElementById('guestname').value;
        const mobileno = document.getElementById('mobileno').value;
        const amount = document.getElementById('amount').value;
        
        // Generate receipt number (timestamp)
        const receiptNo = Date.now();
        
        // Save to database
        const receipts = JSON.parse(localStorage.getItem('hotelReceipts'));
        receipts.push({
            receiptNo,
            date,
            roomno,
            roomtype,
            guestname,
            mobileno,
            amount
        });
        localStorage.setItem('hotelReceipts', JSON.stringify(receipts));
        
        // Display receipt
        document.getElementById('receipt-date').textContent = formatDate(date);
        document.getElementById('receipt-no').textContent = receiptNo;
        document.getElementById('receipt-guestname').textContent = guestname;
        document.getElementById('receipt-mobileno').textContent = mobileno;
        document.getElementById('receipt-roomno').textContent = roomno;
        document.getElementById('receipt-roomtype').textContent = roomtype;
        document.getElementById('receipt-amount').textContent = amount;
        
        // Reset form
        receiptForm.reset();
        document.getElementById('date').valueAsDate = new Date();
    });
    
    // Print receipt
    printReceiptBtn.addEventListener('click', function() {
        window.print();
    });
    
    // Load reports
    function loadReports(filterDate = null) {
        const receipts = JSON.parse(localStorage.getItem('hotelReceipts'));
        reportsBody.innerHTML = '';
        
        receipts.forEach(receipt => {
            if (filterDate && receipt.date !== filterDate) return;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(receipt.date)}</td>
                <td>${receipt.receiptNo}</td>
                <td>${receipt.guestname}</td>
                <td>${receipt.mobileno}</td>
                <td>${receipt.roomno}</td>
                <td>${receipt.roomtype}</td>
                <td>₹${receipt.amount}</td>
                <td><button class="view-receipt" data-id="${receipt.receiptNo}">View</button></td>
            `;
            reportsBody.appendChild(row);
        });
        
        // Add event listeners to view buttons
        document.querySelectorAll('.view-receipt').forEach(btn => {
            btn.addEventListener('click', function() {
                const receiptNo = this.getAttribute('data-id');
                viewReceipt(receiptNo);
            });
        });
    }
    
    // View receipt from reports
    function viewReceipt(receiptNo) {
        const receipts = JSON.parse(localStorage.getItem('hotelReceipts'));
        const receipt = receipts.find(r => r.receiptNo == receiptNo);
        
        if (receipt) {
            document.getElementById('receipt-date').textContent = formatDate(receipt.date);
            document.getElementById('receipt-no').textContent = receipt.receiptNo;
            document.getElementById('receipt-guestname').textContent = receipt.guestname;
            document.getElementById('receipt-mobileno').textContent = receipt.mobileno;
            document.getElementById('receipt-roomno').textContent = receipt.roomno;
            document.getElementById('receipt-roomtype').textContent = receipt.roomtype;
            document.getElementById('receipt-amount').textContent = receipt.amount;
            
            // Switch to receipt tab
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            document.querySelector('.tab-btn[data-tab="receipt"]').classList.add('active');
            document.getElementById('receipt-tab').classList.add('active');
        }
    }
    
    // Filter reports by date
    filterReportsBtn.addEventListener('click', function() {
        if (reportDateInput.value) {
            loadReports(reportDateInput.value);
        }
    });
    
    // Clear filter
    clearFilterBtn.addEventListener('click', function() {
        reportDateInput.value = '';
        loadReports();
    });
    
    // Helper function to format date
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN');
    }
    
    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();
});