// Database management using IndexedDB
class FeesDatabase {
    constructor() {
        this.dbName = 'CollegeFeesDB';
        this.version = 1;
        this.db = null;
    }

    // Initialize the database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                if (!db.objectStoreNames.contains('students')) {
                    const studentsStore = db.createObjectStore('students', { keyPath: 'id', autoIncrement: true });
                    studentsStore.createIndex('email', 'email', { unique: true });
                    studentsStore.createIndex('name', 'name', { unique: false });
                }

                if (!db.objectStoreNames.contains('fees')) {
                    const feesStore = db.createObjectStore('fees', { keyPath: 'id', autoIncrement: true });
                    feesStore.createIndex('name', 'name', { unique: false });
                    feesStore.createIndex('type', 'type', { unique: false });
                }

                if (!db.objectStoreNames.contains('studentFees')) {
                    const studentFeesStore = db.createObjectStore('studentFees', { keyPath: 'id', autoIncrement: true });
                    studentFeesStore.createIndex('studentId', 'studentId', { unique: false });
                    studentFeesStore.createIndex('feeId', 'feeId', { unique: false });
                }

                if (!db.objectStoreNames.contains('payments')) {
                    const paymentsStore = db.createObjectStore('payments', { keyPath: 'id', autoIncrement: true });
                    paymentsStore.createIndex('studentId', 'studentId', { unique: false });
                    paymentsStore.createIndex('feeId', 'feeId', { unique: false });
                    paymentsStore.createIndex('date', 'date', { unique: false });
                }
            };
        });
    }

    // Generic CRUD operations
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getById(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async search(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Specific methods for each entity
    async addStudent(student) {
        return this.add('students', student);
    }

    async getStudents() {
        return this.getAll('students');
    }

    async updateStudent(student) {
        return this.update('students', student);
    }

    async deleteStudent(id) {
        return this.delete('students', id);
    }

    async searchStudentsByName(name) {
        return this.search('students', 'name', name);
    }

    async addFee(fee) {
        return this.add('fees', fee);
    }

    async getFees() {
        return this.getAll('fees');
    }

    async updateFee(fee) {
        return this.update('fees', fee);
    }

    async deleteFee(id) {
        return this.delete('fees', id);
    }

    async addStudentFee(studentFee) {
        return this.add('studentFees', studentFee);
    }

    async getStudentFees() {
        return this.getAll('studentFees');
    }

    async updateStudentFee(studentFee) {
        return this.update('studentFees', studentFee);
    }

    async deleteStudentFee(id) {
        return this.delete('studentFees', id);
    }

    async addPayment(payment) {
        return this.add('payments', payment);
    }

    async getPayments() {
        return this.getAll('payments');
    }

    async updatePayment(payment) {
        return this.update('payments', payment);
    }

    async deletePayment(id) {
        return this.delete('payments', id);
    }

    // Utility methods
    async getStudentPayments(studentId) {
        const payments = await this.getPayments();
        return payments.filter(p => p.studentId === studentId);
    }

    async getFeePayments(feeId) {
        const payments = await this.getPayments();
        return payments.filter(p => p.feeId === feeId);
    }

    async getStudentFeePayments(studentId, feeId) {
        const payments = await this.getPayments();
        return payments.filter(p => p.studentId === studentId && p.feeId === feeId);
    }

    async getOutstandingFees() {
        const studentFees = await this.getStudentFees();
        const fees = await this.getFees();
        const payments = await this.getPayments();

        return studentFees.map(studentFee => {
            const fee = fees.find(f => f.id === studentFee.feeId);
            if (!fee) return null;

            const studentPayments = payments.filter(p => p.studentId === studentFee.studentId && p.feeId === studentFee.feeId);
            const paidAmount = studentPayments.reduce((sum, p) => sum + p.amount, 0);
            const remainingAmount = fee.amount - paidAmount;

            return {
                ...studentFee,
                feeName: fee.name,
                feeAmount: fee.amount,
                paidAmount: paidAmount,
                remainingAmount: Math.max(0, remainingAmount)
            };
        }).filter(item => item && item.remainingAmount > 0);
    }

    // Export data
    async exportData() {
        const [students, fees, studentFees, payments] = await Promise.all([
            this.getStudents(),
            this.getFees(),
            this.getStudentFees(),
            this.getPayments()
        ]);

        return {
            students,
            fees,
            studentFees,
            payments,
            exportDate: new Date().toISOString()
        };
    }

    // Import data
    async importData(data) {
        const transaction = this.db.transaction(['students', 'fees', 'studentFees', 'payments'], 'readwrite');

        // Clear existing data
        transaction.objectStore('students').clear();
        transaction.objectStore('fees').clear();
        transaction.objectStore('studentFees').clear();
        transaction.objectStore('payments').clear();

        // Import new data
        const studentsStore = transaction.objectStore('students');
        const feesStore = transaction.objectStore('fees');
        const studentFeesStore = transaction.objectStore('studentFees');
        const paymentsStore = transaction.objectStore('payments');

        data.students.forEach(student => studentsStore.add(student));
        data.fees.forEach(fee => feesStore.add(fee));
        data.studentFees.forEach(studentFee => studentFeesStore.add(studentFee));
        data.payments.forEach(payment => paymentsStore.add(payment));

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }
}

// Global database instance
const db = new FeesDatabase();

// Initialize database when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await db.init();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        alert('Failed to initialize database. Please refresh the page.');
    }
});
