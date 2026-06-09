// Payment tracking functionality
let payments = JSON.parse(localStorage.getItem('payments')) || [];

// DOM elements
const paymentForm = document.getElementById('paymentForm');
const paymentsTableBody = document.getElementById('paymentsTable').querySelector('tbody');
const outstandingFeesTableBody = document.getElementById('outstandingFeesTable').querySelector('tbody');
const paymentStudentSelect = document.getElementById('paymentStudent');
const paymentFeeSelect = document.getElementById('paymentFee');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    populateStudentSelect();
    populateFeeSelect();
    displayPayments();
    displayOutstandingFees();
    updateStats();
});

// Populate student select dropdown
function populateStudentSelect() {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    paymentStudentSelect.innerHTML = '<option value="">Choose Student</option>';
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = student.name;
        paymentStudentSelect.appendChild(option);
    });
}

// Populate fee select dropdown
function populateFeeSelect() {
    const fees = JSON.parse(localStorage.getItem('fees')) || [];
    paymentFeeSelect.innerHTML = '<option value="">Choose Fee</option>';
    fees.forEach(fee => {
        const option = document.createElement('option');
        option.value = fee.id;
        option.textContent = fee.name;
        paymentFeeSelect.appendChild(option);
    });
}

// Handle payment form submission
paymentForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const studentId = paymentStudentSelect.value;
    const feeId = paymentFeeSelect.value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const date = document.getElementById('paymentDate').value;
    const method = document.getElementById('paymentMethod').value;
    const notes = document.getElementById('paymentNotes').value;

    const payment = {
        id: Date.now(),
        studentId: parseInt(studentId),
        feeId: parseInt(feeId),
        amount: amount,
        date: date,
        method: method,
        notes: notes,
        status: 'completed'
    };

    payments.push(payment);
    localStorage.setItem('payments', JSON.stringify(payments));

    // Update student fee status
    updateStudentFeeStatus(studentId, feeId, amount);

    paymentForm.reset();
    displayPayments();
    displayOutstandingFees();
    updateStats();

    alert('Payment recorded successfully!');
});

// Display payments
function displayPayments() {
    paymentsTableBody.innerHTML = '';
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const fees = JSON.parse(localStorage.getItem('fees')) || [];

    payments.forEach(payment => {
        const student = students.find(s => s.id === payment.studentId);
        const fee = fees.find(f => f.id === payment.feeId);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student ? student.name : 'Unknown Student'}</td>
            <td>${fee ? fee.name : 'Unknown Fee'}</td>
            <td>₹${payment.amount.toFixed(2)}</td>
            <td>${formatDate(payment.date)}</td>
            <td>${payment.method}</td>
            <td><span class="status-${payment.status}">${payment.status}</span></td>
            <td>
                <button class="action-btn delete-btn" onclick="deletePayment(${payment.id})">Delete</button>
            </td>
        `;
        paymentsTableBody.appendChild(row);
    });
}

// Display outstanding fees
function displayOutstandingFees() {
    outstandingFeesTableBody.innerHTML = '';
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const fees = JSON.parse(localStorage.getItem('fees')) || [];
    const studentFees = JSON.parse(localStorage.getItem('studentFees')) || [];

    studentFees.forEach(studentFee => {
        const student = students.find(s => s.id === studentFee.studentId);
        const fee = fees.find(f => f.id === studentFee.feeId);

        if (student && fee && studentFee.status !== 'paid') {
            const paidAmount = getPaidAmount(studentFee.studentId, studentFee.feeId);
            const remainingAmount = fee.amount - paidAmount;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${fee.name}</td>
                <td>₹${remainingAmount.toFixed(2)}</td>
                <td><span class="status-${studentFee.status}">${studentFee.status}</span></td>
                <td>
                    <button class="action-btn edit-btn" onclick="recordPayment(${studentFee.studentId}, ${studentFee.feeId})">Record Payment</button>
                </td>
            `;
            outstandingFeesTableBody.appendChild(row);
        }
    });
}

// Update student fee status after payment
function updateStudentFeeStatus(studentId, feeId, paymentAmount) {
    const studentFees = JSON.parse(localStorage.getItem('studentFees')) || [];
    const fees = JSON.parse(localStorage.getItem('fees')) || [];

    const studentFeeIndex = studentFees.findIndex(sf => sf.studentId === parseInt(studentId) && sf.feeId === parseInt(feeId));
    const fee = fees.find(f => f.id === parseInt(feeId));

    if (studentFeeIndex !== -1 && fee) {
        const totalPaid = getPaidAmount(studentId, feeId) + paymentAmount;
        studentFees[studentFeeIndex].status = totalPaid >= fee.amount ? 'paid' : 'partial';
        localStorage.setItem('studentFees', JSON.stringify(studentFees));
    }
}

// Get total paid amount for a student fee
function getPaidAmount(studentId, feeId) {
    return payments
        .filter(p => p.studentId === parseInt(studentId) && p.feeId === parseInt(feeId))
        .reduce((total, payment) => total + payment.amount, 0);
}

// Delete payment
function deletePayment(paymentId) {
    if (confirm('Are you sure you want to delete this payment?')) {
        payments = payments.filter(p => p.id !== paymentId);
        localStorage.setItem('payments', JSON.stringify(payments));
        displayPayments();
        displayOutstandingFees();
        updateStats();
    }
}

// Record payment for outstanding fee
function recordPayment(studentId, feeId) {
    paymentStudentSelect.value = studentId;
    paymentFeeSelect.value = feeId;
    document.getElementById('paymentAmount').focus();
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}
