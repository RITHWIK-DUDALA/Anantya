const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const excelFilePath = path.join(__dirname, '..', 'registrations.xlsx');

/**
 * Appends registration data to the registrations.xlsx file.
 * Creates the file if it doesn't exist.
 * 
 * @param {Object} data Registration data to append
 */
const appendRegistrationToExcel = async (data) => {
  try {
    const workbook = new ExcelJS.Workbook();
    let worksheet;
    
    // Normalize games array to string if it exists
    const gamesString = Array.isArray(data.games) ? data.games.join(', ') : (data.games || '');

    const rowData = {
      Token: data.token || '',
      'Reg ID': data.regId || '',
      Name: data.name || '',
      Email: data.email || '',
      Phone: data.phone || '',
      Department: data.dept || '',
      Year: data.year || '',
      Role: data.role || '',
      Games: gamesString,
      Status: data.status || '',
      Amount: data.amount || 0,
      'Secret Code': data.secretCode || '',
      Discount: data.discountAmount || 0,
      'Registered At': data.registeredAt || new Date().toISOString()
    };

    if (fs.existsSync(excelFilePath)) {
      await workbook.xlsx.readFile(excelFilePath);
      worksheet = workbook.getWorksheet('Registrations');
      if (!worksheet) {
         worksheet = workbook.addWorksheet('Registrations');
      }
    } else {
      worksheet = workbook.addWorksheet('Registrations');
      worksheet.columns = [
        { header: 'Token', key: 'Token', width: 15 },
        { header: 'Reg ID', key: 'Reg ID', width: 40 },
        { header: 'Name', key: 'Name', width: 30 },
        { header: 'Email', key: 'Email', width: 35 },
        { header: 'Phone', key: 'Phone', width: 15 },
        { header: 'Department', key: 'Department', width: 20 },
        { header: 'Year', key: 'Year', width: 10 },
        { header: 'Role', key: 'Role', width: 15 },
        { header: 'Games', key: 'Games', width: 40 },
        { header: 'Status', key: 'Status', width: 15 },
        { header: 'Amount', key: 'Amount', width: 10 },
        { header: 'Secret Code', key: 'Secret Code', width: 15 },
        { header: 'Discount', key: 'Discount', width: 10 },
        { header: 'Registered At', key: 'Registered At', width: 30 },
      ];
    }
    
    // For existing files without defined columns, we might need to add headers manually,
    // but assuming it starts fresh or has headers in row 1, we just add a row.
    // ExcelJS `addRow` handles keys if columns are defined, else it uses array order.
    // If we rely on getWorksheet on existing, and we don't have columns defined,
    // it's safer to just push values. If it was created by us, columns are defined.
    // To be safe and compatible with the previous `xlsx` logic (which just appended json),
    // we'll just add the row using the object.
    
    // Make sure columns are always defined for writing
    if (!worksheet.columns || worksheet.columns.length === 0) {
       worksheet.columns = [
        { header: 'Token', key: 'Token', width: 15 },
        { header: 'Reg ID', key: 'Reg ID', width: 40 },
        { header: 'Name', key: 'Name', width: 30 },
        { header: 'Email', key: 'Email', width: 35 },
        { header: 'Phone', key: 'Phone', width: 15 },
        { header: 'Department', key: 'Department', width: 20 },
        { header: 'Year', key: 'Year', width: 10 },
        { header: 'Role', key: 'Role', width: 15 },
        { header: 'Games', key: 'Games', width: 40 },
        { header: 'Status', key: 'Status', width: 15 },
        { header: 'Amount', key: 'Amount', width: 10 },
        { header: 'Secret Code', key: 'Secret Code', width: 15 },
        { header: 'Discount', key: 'Discount', width: 10 },
        { header: 'Registered At', key: 'Registered At', width: 30 },
      ];
    }
    
    worksheet.addRow(rowData);

    await workbook.xlsx.writeFile(excelFilePath);
    console.log(`Successfully appended registration to Excel: ${data.regId}`);
    
  } catch (error) {
    console.error('Error appending to Excel:', error);
  }
};

module.exports = {
  appendRegistrationToExcel
};
