// Update statistics on the home page
function updateStats() {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    const fees = JSON.parse(localStorage.getItem('fees')) || [];
    const studentFees = JSON.parse(localStorage.getItem('studentFees')) || [];

    // Total students
    document.getElementById('totalStudents').textContent = students.length;

    // Total fees collected
    const totalCollected = payments.reduce((sum, payment) => sum + payment.amount, 0);
    document.getElementById('totalCollected').textContent = `₹${totalCollected.toFixed(2)}`;

    // Pending payments
    let pendingAmount = 0;
    studentFees.forEach(studentFee => {
        if (studentFee.status !== 'paid') {
            const fee = fees.find(f => f.id === studentFee.feeId);
            if (fee) {
                const paidAmount = getPaidAmount(studentFee.studentId, studentFee.feeId);
                pendingAmount += fee.amount - paidAmount;
            }
        }
    });
    document.getElementById('pendingPayments').textContent = `₹${pendingAmount.toFixed(2)}`;
}

// Get total paid amount for a student fee
function getPaidAmount(studentId, feeId) {
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    return payments
        .filter(p => p.studentId === studentId && p.feeId === feeId)
        .reduce((total, payment) => total + payment.amount, 0);
}
=======
// Shared functionality for the College Fees Management System

// Update statistics on the home page
async function updateStats() {
    try {
        const students = await db.getStudents();
        const payments = await db.getPayments();
        const fees = await db.getFees();
        const studentFees = await db.getStudentFees();

        // Total students
        const totalStudentsElement = document.getElementById('totalStudents');
        if (totalStudentsElement) {
            totalStudentsElement.textContent = students.length;
        }

        // Total fees collected
        const totalCollectedElement = document.getElementById('totalCollected');
        if (totalCollectedElement) {
            const totalCollected = payments.reduce((sum, payment) => sum + payment.amount, 0);
            totalCollectedElement.textContent = `₹${totalCollected.toFixed(2)}`;
        }

        // Pending payments
        const pendingPaymentsElement = document.getElementById('pendingPayments');
        if (pendingPaymentsElement) {
            let pendingAmount = 0;
            studentFees.forEach(studentFee => {
                if (studentFee.status !== 'paid') {
                    const fee = fees.find(f => f.id === studentFee.feeId);
                    if (fee) {
                        const paidAmount = getPaidAmount(studentFee.studentId, studentFee.feeId, payments);
                        pendingAmount += Math.max(0, fee.amount - paidAmount);
                    }
                }
            });
            pendingPaymentsElement.textContent = `₹${pendingAmount.toFixed(2)}`;
        }
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Get total paid amount for a student fee
function getPaidAmount(studentId, feeId) {
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    return payments
        .filter(p => p.studentId === studentId && p.feeId === feeId)
        .reduce((total, payment) => total + payment.amount, 0);
}

// Format currency
function formatCurrency(amount) {
    return `₹${amount.toFixed(2)}`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Show status with appropriate styling
function getStatusBadge(status) {
    const statusClasses = {
        'pending': 'status-pending',
        'partial': 'status-partial',
        'paid': 'status-paid',
        'completed': 'status-completed'
    };
    return `<span class="${statusClasses[status] || 'status-default'}">${status}</span>`;
}
