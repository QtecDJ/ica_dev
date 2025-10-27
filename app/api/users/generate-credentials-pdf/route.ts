import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import jsPDF from 'jspdf';

// Für einfache PDF-Generierung verwenden wir HTML-to-PDF
// In production würde man eine Library wie jsPDF oder puppeteer verwenden

export async function POST(request: Request) {
  const session = (await getServerSession(authOptions)) as Session | null;

  // Check if user is authenticated and is an admin
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Nur Administratoren können PDFs generieren" },
      { status: 403 }
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { userId, username, password, name, email, roles } = await request.json();

    let user;
    let roleInfo;

    // If user data is provided directly (from form), use it
    if (username && password) {
      user = { username, name, email, role: roles?.[0] || 'member' };
      
      // Rollen-Konfiguration für direkte Daten
      const ROLE_CONFIG: Record<string, { label: string; permissions: string[]; description: string }> = {
        admin: {
          label: "Administrator",
          permissions: [
            "Vollzugriff auf alle Funktionen",
            "Benutzer erstellen und verwalten", 
            "System-Einstellungen ändern",
            "Alle Daten einsehen und bearbeiten"
          ],
          description: "Als Administrator haben Sie uneingeschränkten Zugriff auf alle Bereiche des Systems."
        },
        coach: {
          label: "Coach",
          permissions: [
            "Teams verwalten",
            "Trainings planen und durchführen",
            "Kommentare und Bewertungen schreiben",
            "Mitgliederprofile bearbeiten"
          ],
          description: "Als Coach können Sie Ihre Teams verwalten und Trainings durchführen."
        },
        parent: {
          label: "Elternteil",
          permissions: [
            "Profile der eigenen Kinder einsehen",
            "Trainings zu-/absagen für Kinder",
            "Kommunikation mit Coaches",
            "Eigene Kontaktdaten verwalten"
          ],
          description: "Als Elternteil können Sie die Profile Ihrer Kinder einsehen und verwalten."
        },
        member: {
          label: "Mitglied",
          permissions: [
            "Eigenes Profil einsehen",
            "Trainings zu-/absagen",
            "Kommentare lesen",
            "Teamkameraden anzeigen"
          ],
          description: "Als Mitglied können Sie Ihr Profil verwalten und an Trainings teilnehmen."
        }
      };
      
      roleInfo = roles ? {
        label: roles.map((r: string) => ROLE_CONFIG[r]?.label || r).join(', '),
        permissions: roles.flatMap((r: string) => ROLE_CONFIG[r]?.permissions || []),
        description: roles.length > 1 
          ? "Sie haben mehrere Rollen mit verschiedenen Berechtigungen."
          : ROLE_CONFIG[roles[0]]?.description || "Rolle mit spezifischen Berechtigungen."
      } : ROLE_CONFIG.member;
      
    } else {
      // Fallback: Get user data from database
      const userData = await sql`
        SELECT 
          u.id,
          u.username,
          u.name,
          u.email,
          u.role,
          u.created_at,
          m.first_name,
          m.last_name,
          t.name as team_name
        FROM users u
        LEFT JOIN members m ON u.member_id = m.id
        LEFT JOIN teams t ON m.team_id = t.id
        WHERE u.id = ${userId}
      `;

      if (userData.length === 0) {
        return NextResponse.json(
          { error: "Benutzer nicht gefunden" },
          { status: 404 }
        );
      }

      user = userData[0];
      
      // Rollen-Konfiguration für DB-Daten
      const ROLE_CONFIG: Record<string, { label: string; permissions: string[]; description: string }> = {
        admin: {
          label: "Administrator",
          permissions: [
            "Vollzugriff auf alle Funktionen",
            "Benutzer erstellen und verwalten", 
            "System-Einstellungen ändern",
            "Alle Daten einsehen und bearbeiten"
          ],
          description: "Als Administrator haben Sie uneingeschränkten Zugriff auf alle Bereiche des Systems."
        },
        coach: {
          label: "Coach",
          permissions: [
            "Teams verwalten",
            "Trainings planen und durchführen",
            "Kommentare und Bewertungen schreiben",
            "Mitgliederprofile bearbeiten"
          ],
          description: "Als Coach können Sie Ihre Teams verwalten und Trainings durchführen."
        },
        parent: {
          label: "Elternteil",
          permissions: [
            "Profile der eigenen Kinder einsehen",
            "Trainings zu-/absagen für Kinder",
            "Kommunikation mit Coaches",
            "Eigene Kontaktdaten verwalten"
          ],
          description: "Als Elternteil können Sie die Profile Ihrer Kinder einsehen und verwalten."
        },
        member: {
          label: "Mitglied",
          permissions: [
            "Eigenes Profil einsehen",
            "Trainings zu-/absagen",
            "Kommentare lesen",
            "Teamkameraden anzeigen"
          ],
          description: "Als Mitglied können Sie Ihr Profil verwalten und an Trainings teilnehmen."
        }
      };

      roleInfo = ROLE_CONFIG[user.role] || {
        label: user.role,
        permissions: [],
        description: "Rolle mit spezifischen Berechtigungen."
      };
    }

    // Erstelle PDF mit jsPDF - PROFESSIONELLES DESIGN
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // DESIGN KONSTANTEN
    const colors = {
      primary: [26, 35, 126],      // Deep Blue
      secondary: [99, 102, 241],   // Indigo
      accent: [239, 68, 68],       // Red
      success: [34, 197, 94],      // Green
      warning: [245, 158, 11],     // Amber
      gray: [107, 114, 128],       // Gray
      lightGray: [249, 250, 251],  // Light Gray
      white: [255, 255, 255]
    };
    
    // === HEADER SECTION ===
    // Gradient Background Simulation
    for (let i = 0; i < 60; i++) {
      const opacity = (60 - i) / 60;
      const r = colors.primary[0] + (colors.secondary[0] - colors.primary[0]) * (i / 60);
      const g = colors.primary[1] + (colors.secondary[1] - colors.primary[1]) * (i / 60);
      const b = colors.primary[2] + (colors.secondary[2] - colors.primary[2]) * (i / 60);
      doc.setFillColor(r, g, b);
      doc.rect(0, i, pageWidth, 1, 'F');
    }
    
    // Logo/Brand Circle
    doc.setFillColor(...colors.white);
    doc.circle(30, 30, 18, 'F');
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(2);
    doc.circle(30, 30, 18, 'S');
    
    // ICA Logo Text
    doc.setTextColor(...colors.primary);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ICA', 30, 35, { align: 'center' });
    
    // Company Name
    doc.setTextColor(...colors.white);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Infinity Cheer Allstars', pageWidth / 2, 28, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Backoffice Zugangsdaten', pageWidth / 2, 42, { align: 'center' });
    
    // Decorative Line
    doc.setDrawColor(...colors.white);
    doc.setLineWidth(1);
    doc.line(pageWidth / 2 - 40, 48, pageWidth / 2 + 40, 48);
    
    // === MAIN CONTENT ===
    let yPos = 80;
    
    // Welcome Message
    doc.setTextColor(...colors.primary);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`Willkommen, ${user.name || user.username}!`, 25, yPos);
    yPos += 25;
    
    // === CREDENTIALS CARD ===
    // Card Background
    doc.setFillColor(...colors.lightGray);
    doc.setDrawColor(...colors.gray);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, yPos - 10, pageWidth - 40, 110, 8, 8, 'FD');
    
    // Card Header
    doc.setFillColor(...colors.secondary);
    doc.roundedRect(20, yPos - 10, pageWidth - 40, 25, 8, 8, 'F');
    doc.rect(20, yPos + 7, pageWidth - 40, 8, 'F'); // Bottom part of rounded rect
    
    doc.setTextColor(...colors.white);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('🔐 Ihre Zugangsdaten', 30, yPos + 5);
    yPos += 35;
    
    // Username Field
    doc.setTextColor(...colors.gray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('BENUTZERNAME', 30, yPos);
    yPos += 8;
    
    doc.setTextColor(...colors.primary);
    doc.setFontSize(16);
    doc.setFont('courier', 'bold');
    doc.text(user.username, 30, yPos);
    yPos += 20;
    
    // Password Field (if available)
    if (password) {
      // Password Label with Warning
      doc.setFillColor(...colors.accent);
      doc.roundedRect(25, yPos - 5, pageWidth - 50, 30, 4, 4, 'F');
      
      doc.setTextColor(...colors.white);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('⚠️ TEMPORÄRES PASSWORT', 30, yPos + 3);
      
      doc.setFontSize(16);
      doc.setFont('courier', 'bold');
      doc.text(password, 30, yPos + 18);
      yPos += 40;
    }
    
    // Login URL Field
    doc.setTextColor(...colors.gray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('LOGIN-URL', 30, yPos);
    yPos += 8;
    
    doc.setTextColor(...colors.secondary);
    doc.setFontSize(12);
    doc.setFont('courier', 'normal');
    const loginUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    doc.text(`${loginUrl}/login`, 30, yPos);
    yPos += 30;
    
    // === ROLE INFORMATION CARD ===
    // Card Background
    doc.setFillColor(...colors.lightGray);
    doc.setDrawColor(...colors.gray);
    doc.roundedRect(20, yPos - 10, pageWidth - 40, 80, 8, 8, 'FD');
    
    // Card Header
    doc.setFillColor(...colors.success);
    doc.roundedRect(20, yPos - 10, pageWidth - 40, 25, 8, 8, 'F');
    doc.rect(20, yPos + 7, pageWidth - 40, 8, 'F');
    
    doc.setTextColor(...colors.white);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('👤 Ihre Rolle & Berechtigungen', 30, yPos + 5);
    yPos += 30;
    
    // Role Badge
    doc.setFillColor(...colors.secondary);
    const roleText = roleInfo.label;
    const roleWidth = doc.getTextWidth(roleText) + 16;
    doc.roundedRect(30, yPos - 5, roleWidth, 16, 8, 8, 'F');
    
    doc.setTextColor(...colors.white);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(roleText, 38, yPos + 5);
    yPos += 25;
    
    // Permissions (abbreviated for space)
    doc.setTextColor(...colors.gray);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const mainPermissions = roleInfo.permissions.slice(0, 3);
    mainPermissions.forEach((permission: string) => {
      doc.text(`• ${permission}`, 30, yPos);
      yPos += 7;
    });
    
    if (roleInfo.permissions.length > 3) {
      doc.setFont('helvetica', 'italic');
      doc.text(`... und ${roleInfo.permissions.length - 3} weitere Berechtigungen`, 30, yPos);
      yPos += 15;
    }
    
    yPos += 20;
    
    // === SECURITY NOTICE (if password provided) ===
    if (password) {
      // Notice Background
      doc.setFillColor(255, 251, 235); // Amber-50
      doc.setDrawColor(...colors.warning);
      doc.setLineWidth(1);
      doc.roundedRect(20, yPos - 10, pageWidth - 40, 50, 8, 8, 'FD');
      
      // Warning Icon and Title
      doc.setTextColor(...colors.warning);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('🔒 WICHTIGE SICHERHEITSHINWEISE', 30, yPos + 5);
      
      // Security Instructions
      doc.setTextColor(146, 64, 14); // Amber-800
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const securityNotes = [
        '• Ändern Sie das Passwort sofort nach dem ersten Login',
        '• Teilen Sie diese Zugangsdaten mit niemandem',
        '• Bewahren Sie dieses Dokument sicher auf'
      ];
      
      securityNotes.forEach((note, index) => {
        doc.text(note, 30, yPos + 18 + (index * 8));
      });
      
      yPos += 65;
    }
    
    // === INSTRUCTIONS CARD ===
    if (yPos < pageHeight - 100) {
      doc.setFillColor(...colors.lightGray);
      doc.setDrawColor(...colors.gray);
      doc.roundedRect(20, yPos - 10, pageWidth - 40, 70, 8, 8, 'FD');
      
      // Instructions Header
      doc.setFillColor(...colors.primary);
      doc.roundedRect(20, yPos - 10, pageWidth - 40, 25, 8, 8, 'F');
      doc.rect(20, yPos + 7, pageWidth - 40, 8, 'F');
      
      doc.setTextColor(...colors.white);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('🚀 Erste Schritte', 30, yPos + 5);
      yPos += 30;
      
      // Instructions
      doc.setTextColor(...colors.gray);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const instructions = [
        '1. Öffnen Sie die Login-URL in Ihrem Browser',
        '2. Geben Sie Ihren Benutzernamen und das Passwort ein',
        '3. Ändern Sie sofort Ihr Passwort in den Einstellungen',
        '4. Erkunden Sie die verfügbaren Funktionen'
      ];
      
      instructions.forEach((instruction, index) => {
        doc.text(instruction, 30, yPos + (index * 8));
      });
      
      yPos += 45;
    }
    
    // === FOOTER ===
    // Footer Background
    doc.setFillColor(249, 250, 251); // Gray-50
    doc.rect(0, pageHeight - 40, pageWidth, 40, 'F');
    
    // Footer Line
    doc.setDrawColor(...colors.gray);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 35, pageWidth - 20, pageHeight - 35);
    
    // Footer Content
    doc.setTextColor(...colors.gray);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, pageWidth / 2, pageHeight - 25, { align: 'center' });
    
    doc.text('Bei Fragen wenden Sie sich an: support@infinity-cheer-allstars.de', pageWidth / 2, pageHeight - 18, { align: 'center' });
    doc.text('© 2025 Infinity Cheer Allstars - Vertraulich', pageWidth / 2, pageHeight - 11, { align: 'center' });
    
    // Rolle und Berechtigungen
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('👤 Ihre Rolle und Berechtigungen', 20, yPos);
    yPos += 8;
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 15;
    
    // Rolle Badge
    const roleLabel = roleInfo.label;
    doc.setFillColor(0, 123, 255);
    const badgeWidth = doc.getTextWidth(roleLabel) + 20;
    doc.roundedRect(25, yPos - 8, badgeWidth, 16, 8, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(roleLabel, 35, yPos);
    
    doc.setTextColor(0, 0, 0);
    yPos += 25;
    
    // Beschreibung
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const descLines = doc.splitTextToSize(roleInfo.description, pageWidth - 50);
    doc.text(descLines, 25, yPos);
    yPos += descLines.length * 5 + 10;
    
    // Berechtigungen
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Ihre Berechtigungen:', 25, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    roleInfo.permissions.forEach((permission: string, index: number) => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`• ${permission}`, 30, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    
    // Mitgliederdaten falls vorhanden
    if (user.first_name && user.last_name) {
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('👥 Verknüpftes Mitglied', 20, yPos);
      yPos += 8;
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 15;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Name: ${user.first_name} ${user.last_name}`, 25, yPos);
      yPos += 8;
      
      if (user.team_name) {
        doc.text(`Team: ${user.team_name}`, 25, yPos);
        yPos += 15;
      }
    }
    
    // Footer
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }
    
    yPos = pageHeight - 30;
    doc.setFillColor(249, 250, 251);
    doc.rect(0, yPos - 10, pageWidth, 40, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);
    doc.text('📧 Bei Fragen wenden Sie sich bitte an Ihren Administrator', pageWidth / 2, yPos, { align: 'center' });
    doc.text(`🗓️ Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, pageWidth / 2, yPos + 8, { align: 'center' });
    doc.text('💡 Bewahren Sie diese Zugangsdaten sicher auf!', pageWidth / 2, yPos + 16, { align: 'center' });
    
    // PDF als ArrayBuffer generieren
    const pdfBuffer = doc.output('arraybuffer');
    
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="zugangsdaten_${user.username}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Fehler bei der PDF-Generierung:", error);
    return NextResponse.json(
      { error: "Fehler bei der PDF-Generierung" },
      { status: 500 }
    );
  }
}