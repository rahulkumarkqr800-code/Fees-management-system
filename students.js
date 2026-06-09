// Student management functionality
let students = [];

// DOM elements
const studentForm = document.getElementById('studentForm');
const studentsTableBody = document.getElementById('studentsTable').querySelector('tbody');
const editStudentModal = document.getElementById('editStudentModal');
const editStudentForm = document.getElementById('editStudentForm');
const closeModal = document.querySelector('.close');

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    await loadStudents();
    displayStudents();
    updateStats();
});

// Load students from database
async function loadStudents() {
    try {
        students = await db.getStudents();
    } catch (error) {
        console.error('Error loading students:', error);
        students = [];
    }
}

// Handle student form submission
studentForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const student = {
        name: document.getElementById('studentName').value,
        email: document.getElementById('studentEmail').value,
        phone: document.getElementById('studentPhone').value,
        course: document.getElementById('studentCourse').value,
        year: document.getElementById('studentYear').value
    };

    try {
        await db.addStudent(student);
        await loadStudents();
        displayStudents();
        updateStats();
        studentForm.reset();
        alert('Student added successfully!');
    } catch (error) {
        console.error('Error adding student:', error);
        alert('Error adding student. Please try again.');
    }
});

// Display students
function displayStudents() {
    studentsTableBody.innerHTML = '';

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.phone}</td>
            <td>${student.course}</td>
            <td>${student.year} Year</td>
            <td>
                <button class="action-btn edit-btn" onclick="editStudent(${student.id})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteStudent(${student.id})">Delete</button>
            </td>
        `;
        studentsTableBody.appendChild(row);
    });
}

// Edit student
function editStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        document.getElementById('editStudentId').value = student.id;
        document.getElementById('editStudentName').value = student.name;
        document.getElementById('editStudentEmail').value = student.email;
        document.getElementById('editStudentPhone').value = student.phone;
        document.getElementById('editStudentCourse').value = student.course;
        document.getElementById('editStudentYear').value = student.year;

        editStudentModal.style.display = 'block';
    }
}

// Handle edit student form submission
editStudentForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const studentId = parseInt(document.getElementById('editStudentId').value);
    const studentIndex = students.findIndex(s => s.id === studentId);

    if (studentIndex !== -1) {
        students[studentIndex] = {
            id: studentId,
            name: document.getElementById('editStudentName').value,
            email: document.getElementById('editStudentEmail').value,
            phone: document.getElementById('editStudentPhone').value,
            course: document.getElementById('editStudentCourse').value,
            year: document.getElementById('editStudentYear').value
        };

        localStorage.setItem('students', JSON.stringify(students));
        displayStudents();
        updateStats();
        editStudentModal.style.display = 'none';

        alert('Student updated successfully!');
    }
});

// Delete student
async function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student? This will also remove all associated fee assignments and payments.')) {
        try {
            // Delete student
            await db.deleteStudent(studentId);

            // Remove associated student fees and payments
            const studentFees = await db.getStudentFees();
            const relatedStudentFees = studentFees.filter(sf => sf.studentId === studentId);
            for (const sf of relatedStudentFees) {
                await db.deleteStudentFee(sf.id);
            }

            const payments = await db.getPayments();
            const relatedPayments = payments.filter(p => p.studentId === studentId);
            for (const payment of relatedPayments) {
                await db.deletePayment(payment.id);
            }

            await loadStudents();
            displayStudents();
            updateStats();
            alert('Student deleted successfully!');
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Error deleting student. Please try again.');
        }
    }
}

// Close modal when clicking the close button
closeModal.addEventListener('click', function() {
    editStudentModal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === editStudentModal) {
        editStudentModal.style.display = 'none';
    }
});
