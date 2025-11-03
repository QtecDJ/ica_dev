import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null;
    const format = searchParams.get('format') || 'excel';

    // Get the data
    let reportData;
    if (month) {
      reportData = await getMonthlyReport(year, month);
    } else {
      reportData = await getYearlyReport(year);
    }

    if (format === 'excel') {
      return generateExcelReport(reportData, year, month);
    } else if (format === 'pdf') {
      return generatePDFReport(reportData, year, month);
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateExcelReport(data: any, year: number, month: number | null) {
  const workbook = XLSX.utils.book_new();

  if (month && data) {
    // Monthly report
    const worksheetData = [
      ['Training Bericht - ' + data.month + ' ' + year],
      [''],
      ['Zusammenfassung:'],
      ['Anzahl Trainings:', data.total_trainings],
      ['Anzahl Teilnehmer:', data.total_members],
      ['Durchschnittliche Anwesenheit:', data.overall_attendance_rate.toFixed(1) + '%'],
      [''],
      ['Detaillierte Anwesenheit:'],
      ['Mitglied', 'Team', 'Trainings', 'Teilgenommen', 'Abgesagt', 'Quote (%)']
    ];

    data.attendances.forEach((attendance: any) => {
      worksheetData.push([
        attendance.member_name,
        attendance.team_name,
        attendance.total_trainings,
        attendance.attended,
        attendance.cancelled,
        attendance.attendance_rate.toFixed(1)
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Monatsbericht');
  } else if (Array.isArray(data)) {
    // Yearly report
    const worksheetData = [
      ['Training Jahresbericht - ' + year],
      [''],
      ['Monat', 'Trainings', 'Teilnehmer', 'Anwesenheit (%)']
    ];

    data.forEach((monthData: any) => {
      worksheetData.push([
        monthData.month,
        monthData.total_trainings,
        monthData.total_members,
        monthData.overall_attendance_rate.toFixed(1)
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jahresbericht');

    // Add detailed sheets for each month with data
    data.forEach((monthData: any) => {
      if (monthData.attendances && monthData.attendances.length > 0) {
        const monthWorksheetData = [
          [monthData.month + ' ' + year + ' - Detailbericht'],
          [''],
          ['Mitglied', 'Team', 'Trainings', 'Teilgenommen', 'Abgesagt', 'Quote (%)']
        ];

        monthData.attendances.forEach((attendance: any) => {
          monthWorksheetData.push([
            attendance.member_name,
            attendance.team_name,
            attendance.total_trainings,
            attendance.attended,
            attendance.cancelled,
            attendance.attendance_rate.toFixed(1)
          ]);
        });

        const monthWorksheet = XLSX.utils.aoa_to_sheet(monthWorksheetData);
        XLSX.utils.book_append_sheet(workbook, monthWorksheet, monthData.month);
      }
    });
  }

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=training-report-${year}${month ? `-${month.toString().padStart(2, '0')}` : ''}.xlsx`
    }
  });
}

function generatePDFReport(data: any, year: number, month: number | null) {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text('Training Statistiken', 20, 30);
  
  if (month && data) {
    // Monthly report
    doc.setFontSize(16);
    doc.text(`${data.month} ${year}`, 20, 45);
    
    // Summary
    doc.setFontSize(12);
    doc.text('Zusammenfassung:', 20, 65);
    doc.text(`Anzahl Trainings: ${data.total_trainings}`, 20, 75);
    doc.text(`Anzahl Teilnehmer: ${data.total_members}`, 20, 85);
    doc.text(`Durchschnittliche Anwesenheit: ${data.overall_attendance_rate.toFixed(1)}%`, 20, 95);

    // Table
    const tableData = data.attendances.map((attendance: any) => [
      attendance.member_name,
      attendance.team_name,
      attendance.total_trainings.toString(),
      attendance.attended.toString(),
      attendance.cancelled.toString(),
      attendance.attendance_rate.toFixed(1) + '%'
    ]);

    (doc as any).autoTable({
      head: [['Mitglied', 'Team', 'Trainings', 'Teilgenommen', 'Abgesagt', 'Quote']],
      body: tableData,
      startY: 110,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [100, 100, 100] }
    });
  } else if (Array.isArray(data)) {
    // Yearly report
    doc.setFontSize(16);
    doc.text(`Jahresbericht ${year}`, 20, 45);

    const tableData = data.map((monthData: any) => [
      monthData.month,
      monthData.total_trainings.toString(),
      monthData.total_members.toString(),
      monthData.overall_attendance_rate.toFixed(1) + '%'
    ]);

    (doc as any).autoTable({
      head: [['Monat', 'Trainings', 'Teilnehmer', 'Anwesenheit']],
      body: tableData,
      startY: 65,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [100, 100, 100] }
    });
  }

  const buffer = Buffer.from(doc.output('arraybuffer'));
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=training-report-${year}${month ? `-${month.toString().padStart(2, '0')}` : ''}.pdf`
    }
  });
}

// Copy the helper functions from the main route
async function getMonthlyReport(year: number, month: number) {
  const trainings = await sql`
    SELECT t.*, tm.name as team_name
    FROM trainings t
    JOIN teams tm ON t.team_id = tm.id
    WHERE EXTRACT(YEAR FROM t.date) = ${year}
      AND EXTRACT(MONTH FROM t.date) = ${month}
    ORDER BY t.date DESC
  `;

  if (trainings.length === 0) {
    return null;
  }

  const attendanceData = await sql`
    WITH training_attendance AS (
      SELECT 
        t.id as training_id,
        t.date,
        t.team_id,
        tm.name as team_name,
        m.id as member_id,
        u.name as member_name,
        ta.status,
        CASE 
          WHEN ta.status IS NULL THEN 'not_responded'
          WHEN ta.status = 'attending' THEN 'attended'
          WHEN ta.status = 'not_attending' THEN 'cancelled'
          ELSE 'not_responded'
        END as attendance_status
      FROM trainings t
      JOIN teams tm ON t.team_id = tm.id
      JOIN members m ON m.team_id = t.team_id
      JOIN users u ON m.user_id = u.id
      LEFT JOIN training_attendance ta ON ta.training_id = t.id AND ta.member_id = m.id
      WHERE EXTRACT(YEAR FROM t.date) = ${year}
        AND EXTRACT(MONTH FROM t.date) = ${month}
    )
    SELECT 
      member_id,
      member_name,
      team_name,
      COUNT(*) as total_trainings,
      COUNT(CASE WHEN attendance_status = 'attended' THEN 1 END) as attended,
      COUNT(CASE WHEN attendance_status = 'cancelled' THEN 1 END) as cancelled,
      COUNT(CASE WHEN attendance_status = 'not_responded' THEN 1 END) as not_responded,
      CASE 
        WHEN COUNT(*) > 0 THEN 
          (COUNT(CASE WHEN attendance_status = 'attended' THEN 1 END)::float / COUNT(*)::float * 100)
        ELSE 0 
      END as attendance_rate
    FROM training_attendance
    GROUP BY member_id, member_name, team_name
    ORDER BY attendance_rate DESC, member_name ASC
  `;

  const totalTrainings = trainings.length;
  const totalMembers = attendanceData.length;
  const overallAttendanceRate = attendanceData.length > 0 
    ? attendanceData.reduce((sum, member) => sum + member.attendance_rate, 0) / attendanceData.length
    : 0;

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  return {
    month: monthNames[month - 1],
    year,
    total_trainings: totalTrainings,
    total_members: totalMembers,
    overall_attendance_rate: overallAttendanceRate,
    attendances: attendanceData.map(member => ({
      member_id: Number(member.member_id),
      member_name: String(member.member_name),
      team_name: String(member.team_name),
      total_trainings: Number(member.total_trainings),
      attended: Number(member.attended),
      cancelled: Number(member.cancelled),
      attendance_rate: Number(member.attendance_rate)
    }))
  };
}

async function getYearlyReport(year: number) {
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const yearlyData = [];

  for (let month = 1; month <= 12; month++) {
    const monthlyData = await getMonthlyReport(year, month);
    
    if (monthlyData) {
      yearlyData.push(monthlyData);
    } else {
      yearlyData.push({
        month: monthNames[month - 1],
        year,
        total_trainings: 0,
        total_members: 0,
        overall_attendance_rate: 0,
        attendances: []
      });
    }
  }

  return yearlyData;
}