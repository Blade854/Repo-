// إظهار نموذج إضافة تقرير
document.getElementById('btnAddReport').addEventListener('click', () => {
    document.getElementById('addReportForm').classList.remove('hidden');
});

// البحث عن الطلاب
function searchStudent() {
    const query = document.getElementById('studentSearch').value;
    fetch(`/students?query=${query}`)
        .then(response => response.json())
        .then(students => {
            const studentList = document.getElementById('studentList');
            studentList.innerHTML = '';
            students.forEach(student => {
                const li = document.createElement('li');
                li.textContent = `${student.firstName} ${student.lastName}`;
                li.onclick = () => showReportDetails(student.id);
                studentList.appendChild(li);
            });
        });
}

// إظهار تفاصيل التقرير
function showReportDetails(studentId) {
    document.getElementById('reportDetails').classList.remove('hidden');
    // تخزين ID الطالب في حقل مخفي إذا لزم الأمر
}

// إضافة تقرير
function addReport() {
    const reportData = {
        studentId: 1, // يجب استبداله بـ ID الطالب المحدد
        date: document.getElementById('date').value,
        author: document.getElementById('author').value,
        reason: document.getElementById('reason').value,
        actions: Array.from(document.getElementById('actions').selectedOptions).map(option => option.value)
    };
    fetch('/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
    }).then(() => alert('تم إضافة التقرير بنجاح.'));
}

// عرض التقارير
document.getElementById('btnViewReports').addEventListener('click', () => {
    document.getElementById('viewReports').classList.remove('hidden');
});

function searchStudentForReports() {
    const query = document.getElementById('studentSearchReports').value;
    fetch(`/reports?query=${query}`)
        .then(response => response.json())
        .then(reports => {
            const reportsList = document.getElementById('reportsList');
            reportsList.innerHTML = '';
            reports.forEach(report => {
                const li = document.createElement('li');
                li.textContent = `${report.date} - ${report.reason}`;
                reportsList.appendChild(li);
            });
        });
}

// إظهار خيارات استيراد الطلاب
document.getElementById('btnImportStudents').addEventListener('click', () => {
    document.getElementById('importOptions').classList.toggle('hidden');
});

// استيراد الطلاب
document.getElementById('btnImportNew').addEventListener('click', () => {
    const fileInput = document.getElementById('studentFile');
    if (!fileInput.files.length) {
        alert('يرجى اختيار ملف أولاً.');
        return;
    }
    uploadStudents(fileInput.files[0], 'new');
});

document.getElementById('btnUpdateList').addEventListener('click', () => {
    const fileInput = document.getElementById('studentFile');
    if (!fileInput.files.length) {
        alert('يرجى اختيار ملف أولاً.');
        return;
    }
    uploadStudents(fileInput.files[0], 'update');
});

function uploadStudents(file, importType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('importType', importType);

    fetch('/import-students', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('تم استيراد البيانات بنجاح.');
            } else {
                alert('حدث خطأ أثناء الاستيراد.');
            }
        });
}