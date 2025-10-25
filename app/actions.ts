"use server";
import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";

const sql = neon(process.env.DATABASE_URL!);

// Types
export type Team = {
  id: number;
  name: string;
  level: string;
  coach: string;
  created_at: string;
};

export type Member = {
  id: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  team_id: number;
  email: string;
  phone: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
  avatar_url?: string;
  created_at: string;
};

export type Event = {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  event_type: string;
  created_at: string;
};

export type Training = {
  id: number;
  team_id: number;
  training_date: string;
  start_time: string;
  end_time: string;
  location: string;
  notes?: string;
  created_at: string;
};

// ===== TEAMS =====
export async function getTeams() {
  try {
    const data = await sql`SELECT * FROM teams ORDER BY name`;
    return data as Team[];
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
}

export async function getTeam(id: number) {
  try {
    const data = await sql`SELECT * FROM teams WHERE id = ${id}`;
    return data[0] as Team;
  } catch (error) {
    console.error("Error fetching team:", error);
    return null;
  }
}

export async function createTeam(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const level = formData.get("level") as string;
    const coach = formData.get("coach") as string;

    await sql`
      INSERT INTO teams (name, level, coach)
      VALUES (${name}, ${level}, ${coach})
    `;
    
    revalidatePath("/teams");
    return { success: true };
  } catch (error) {
    console.error("Error creating team:", error);
    return { success: false, error: "Failed to create team" };
  }
}

export async function updateTeam(id: number, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const level = formData.get("level") as string;
    const coach = formData.get("coach") as string;

    await sql`
      UPDATE teams 
      SET name = ${name}, level = ${level}, coach = ${coach}
      WHERE id = ${id}
    `;
    
    revalidatePath("/teams");
    return { success: true };
  } catch (error) {
    console.error("Error updating team:", error);
    return { success: false, error: "Failed to update team" };
  }
}

export async function deleteTeam(id: number) {
  try {
    await sql`DELETE FROM teams WHERE id = ${id}`;
    revalidatePath("/teams");
    return { success: true };
  } catch (error) {
    console.error("Error deleting team:", error);
    return { success: false, error: "Failed to delete team" };
  }
}

// ===== MEMBERS =====
export async function getMembers() {
  try {
    const data = await sql`
      SELECT m.*, t.name as team_name 
      FROM members m
      LEFT JOIN teams t ON m.team_id = t.id
      ORDER BY m.last_name, m.first_name
    `;
    return data;
  } catch (error) {
    console.error("Error fetching members:", error);
    return [];
  }
}

export async function getMember(id: number) {
  try {
    const data = await sql`
      SELECT 
        m.*,
        u.role as user_role,
        u.username
      FROM members m
      LEFT JOIN users u ON u.member_id = m.id
      WHERE m.id = ${id}
    `;
    return data[0];
  } catch (error) {
    console.error("Error fetching member:", error);
    return null;
  }
}

export async function createMember(formData: FormData) {
  try {
    const firstName = formData.get("first_name") as string;
    const lastName = formData.get("last_name") as string;
    const birthDate = formData.get("birth_date") as string;
    const teamIdStr = formData.get("team_id") as string;
    const teamId = teamIdStr && teamIdStr !== "" ? parseInt(teamIdStr) : null;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const parentName = formData.get("parent_name") as string;
    const parentEmail = formData.get("parent_email") as string;
    const parentPhone = formData.get("parent_phone") as string;
    const avatarUrl = formData.get("avatar_url") as string;

    // Erstelle das Member
    const newMember = await sql`
      INSERT INTO members (first_name, last_name, birth_date, team_id, email, phone, parent_name, parent_email, parent_phone, avatar_url)
      VALUES (${firstName}, ${lastName}, ${birthDate}, ${teamId}, ${email || null}, ${phone || null}, ${parentName || null}, ${parentEmail || null}, ${parentPhone || null}, ${avatarUrl || null})
      RETURNING id
    `;

    const memberId = newMember[0].id;

    // Wenn parent_email angegeben ist, prüfe/erstelle Parent User
    if (parentEmail && parentEmail.trim() !== '') {
      try {
        // Prüfe ob Parent User bereits existiert
        const existingParent = await sql`
          SELECT id FROM users WHERE email = ${parentEmail} AND role = 'parent'
        `;

        let parentUserId;
        if (existingParent.length === 0) {
          // Erstelle neuen Parent User
          const username = parentEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
          const newParent = await sql`
            INSERT INTO users (username, password_hash, role, name, email)
            VALUES (
              ${username}, 
              '$2a$10$dummy.hash.needs.password.reset', 
              'parent', 
              ${parentName || `${firstName}s Elternteil`}, 
              ${parentEmail}
            ) RETURNING id
          `;
          parentUserId = newParent[0].id;
          console.log(`✅ Created new parent user: ${parentEmail}`);
        } else {
          parentUserId = existingParent[0].id;
        }

        // Verknüpfe Parent mit Child
        // Prüfe ob parent_children Tabelle existiert
        const tableExists = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'parent_children'
          );
        `;

        if (tableExists[0].exists) {
          await sql`
            INSERT INTO parent_children (parent_user_id, child_member_id, relationship_type)
            VALUES (${parentUserId}, ${memberId}, 'parent')
            ON CONFLICT (parent_user_id, child_member_id) DO NOTHING
          `;
          console.log(`✅ Linked parent ${parentEmail} to child ${firstName} ${lastName}`);
        }

      } catch (parentError) {
        console.error("Error creating/linking parent:", parentError);
        // Fehler bei Parent-Erstellung soll Member-Erstellung nicht blockieren
      }
    }
    
    revalidatePath("/members");
    return { success: true };
  } catch (error) {
    console.error("Error creating member:", error);
    return { success: false, error: "Failed to create member" };
  }
}

export async function updateMember(id: number, formData: FormData) {
  try {
    const firstName = formData.get("first_name") as string;
    const lastName = formData.get("last_name") as string;
    const birthDate = formData.get("birth_date") as string;
    const teamIdStr = formData.get("team_id") as string;
    const teamId = teamIdStr && teamIdStr !== "" ? parseInt(teamIdStr) : null;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const parentName = formData.get("parent_name") as string;
    const parentEmail = formData.get("parent_email") as string;
    const parentPhone = formData.get("parent_phone") as string;
    const avatarUrl = formData.get("avatar_url") as string;

    await sql`
      UPDATE members 
      SET first_name = ${firstName}, last_name = ${lastName}, birth_date = ${birthDate},
          team_id = ${teamId}, email = ${email || null}, phone = ${phone || null},
          parent_name = ${parentName || null}, parent_email = ${parentEmail || null}, parent_phone = ${parentPhone || null},
          avatar_url = ${avatarUrl || null}
      WHERE id = ${id}
    `;
    
    revalidatePath("/members");
    return { success: true };
  } catch (error) {
    console.error("Error updating member:", error);
    return { success: false, error: "Failed to update member" };
  }
}

export async function deleteMember(id: number) {
  try {
    await sql`DELETE FROM members WHERE id = ${id}`;
    revalidatePath("/members");
    return { success: true };
  } catch (error) {
    console.error("Error deleting member:", error);
    return { success: false, error: "Failed to delete member" };
  }
}

// ===== EVENTS =====
export async function getEvents() {
  try {
    const data = await sql`SELECT * FROM events ORDER BY event_date DESC`;
    return data as Event[];
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export async function getEvent(id: number) {
  try {
    const data = await sql`SELECT * FROM events WHERE id = ${id}`;
    return data[0] as Event;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

export async function createEvent(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const eventDate = formData.get("event_date") as string;
    const location = formData.get("location") as string;
    const eventType = formData.get("event_type") as string;

    await sql`
      INSERT INTO events (title, description, event_date, location, event_type)
      VALUES (${title}, ${description}, ${eventDate}, ${location}, ${eventType})
    `;
    
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error: "Failed to create event" };
  }
}

export async function updateEvent(id: number, formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const eventDate = formData.get("event_date") as string;
    const location = formData.get("location") as string;
    const eventType = formData.get("event_type") as string;

    await sql`
      UPDATE events 
      SET title = ${title}, description = ${description}, event_date = ${eventDate},
          location = ${location}, event_type = ${eventType}
      WHERE id = ${id}
    `;
    
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, error: "Failed to update event" };
  }
}

export async function deleteEvent(id: number) {
  try {
    await sql`DELETE FROM events WHERE id = ${id}`;
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("Error deleting event:", error);
    return { success: false, error: "Failed to delete event" };
  }
}

// ===== TRAININGS =====
export async function getTrainings() {
  try {
    const data = await sql`
      SELECT t.*, teams.name as team_name
      FROM trainings t
      LEFT JOIN teams ON t.team_id = teams.id
      ORDER BY t.training_date DESC, t.start_time
    `;
    return data;
  } catch (error) {
    console.error("Error fetching trainings:", error);
    return [];
  }
}

export async function getTraining(id: number) {
  try {
    const data = await sql`SELECT * FROM trainings WHERE id = ${id}`;
    return data[0];
  } catch (error) {
    console.error("Error fetching training:", error);
    return null;
  }
}

export async function createTraining(formData: FormData) {
  try {
    const teamIdStr = formData.get("team_id") as string;
    const teamId = teamIdStr && teamIdStr !== "" ? parseInt(teamIdStr) : null;
    const trainingDate = formData.get("training_date") as string;
    const startTime = formData.get("start_time") as string;
    const endTime = formData.get("end_time") as string;
    const location = formData.get("location") as string;
    const notes = formData.get("notes") as string;

    await sql`
      INSERT INTO trainings (team_id, training_date, start_time, end_time, location, notes)
      VALUES (${teamId}, ${trainingDate}, ${startTime}, ${endTime}, ${location}, ${notes || null})
    `;
    
    revalidatePath("/trainings");
    return { success: true };
  } catch (error) {
    console.error("Error creating training:", error);
    return { success: false, error: "Failed to create training" };
  }
}

export async function updateTraining(id: number, formData: FormData) {
  try {
    const teamIdStr = formData.get("team_id") as string;
    const teamId = teamIdStr && teamIdStr !== "" ? parseInt(teamIdStr) : null;
    const trainingDate = formData.get("training_date") as string;
    const startTime = formData.get("start_time") as string;
    const endTime = formData.get("end_time") as string;
    const location = formData.get("location") as string;
    const notes = formData.get("notes") as string;

    await sql`
      UPDATE trainings 
      SET team_id = ${teamId}, training_date = ${trainingDate}, 
          start_time = ${startTime}, end_time = ${endTime},
          location = ${location}, notes = ${notes || null}
      WHERE id = ${id}
    `;
    
    revalidatePath("/trainings");
    return { success: true };
  } catch (error) {
    console.error("Error updating training:", error);
    return { success: false, error: "Failed to update training" };
  }
}

export async function deleteTraining(id: number) {
  try {
    await sql`DELETE FROM trainings WHERE id = ${id}`;
    revalidatePath("/trainings");
    return { success: true };
  } catch (error) {
    console.error("Error deleting training:", error);
    return { success: false, error: "Failed to delete training" };
  }
}

// ===== STATISTICS =====
export async function getStats() {
  try {
    const [teamsCount] = await sql`SELECT COUNT(*) as count FROM teams`;
    const [membersCount] = await sql`SELECT COUNT(*) as count FROM members`;
    const [eventsCount] = await sql`SELECT COUNT(*) as count FROM events`;
    const [trainingsCount] = await sql`SELECT COUNT(*) as count FROM trainings`;

    return {
      teams: teamsCount.count,
      members: membersCount.count,
      events: eventsCount.count,
      trainings: trainingsCount.count,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { teams: 0, members: 0, events: 0, trainings: 0 };
  }
}

// Training Attendance Actions
export type TrainingAttendance = {
  id: number;
  training_id: number;
  member_id: number;
  status: "accepted" | "declined" | "pending";
  comment?: string;
  created_at: string;
};

export async function getTrainingAttendance(trainingId: number) {
  try {
    const attendance = await sql`
      SELECT 
        ta.*,
        m.first_name,
        m.last_name
      FROM training_attendance ta
      JOIN members m ON ta.member_id = m.id
      WHERE ta.training_id = ${trainingId}
      ORDER BY m.last_name, m.first_name
    `;
    return attendance;
  } catch (error) {
    console.error("Error fetching training attendance:", error);
    return [];
  }
}

export async function getMemberAttendance(memberId: number) {
  try {
    const attendance = await sql`
      SELECT 
        ta.*,
        t.training_date,
        t.start_time,
        t.end_time,
        t.location,
        teams.name as team_name
      FROM training_attendance ta
      JOIN trainings t ON ta.training_id = t.id
      LEFT JOIN teams ON t.team_id = teams.id
      WHERE ta.member_id = ${memberId}
      ORDER BY t.training_date DESC, t.start_time DESC
    `;
    return attendance;
  } catch (error) {
    console.error("Error fetching member attendance:", error);
    return [];
  }
}

export async function updateAttendanceStatus(
  trainingId: number,
  memberId: number,
  status: "accepted" | "declined" | "pending",
  comment?: string
) {
  try {
    await sql`
      INSERT INTO training_attendance (training_id, member_id, status, comment)
      VALUES (${trainingId}, ${memberId}, ${status}, ${comment || null})
      ON CONFLICT (training_id, member_id)
      DO UPDATE SET
        status = ${status},
        comment = ${comment || null},
        updated_at = CURRENT_TIMESTAMP
    `;
    revalidatePath(`/trainings/${trainingId}`);
    revalidatePath(`/members/${memberId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating attendance:", error);
    return { success: false, error: "Fehler beim Aktualisieren der Teilnahme" };
  }
}

// Comments Actions
export type Comment = {
  id: number;
  author_id: number;
  member_id?: number;
  training_id?: number;
  content: string;
  is_private: boolean;
  created_at: string;
  author_name?: string;
};

export async function getMemberComments(memberId: number) {
  try {
    const comments = await sql`
      SELECT 
        c.*,
        u.name as author_name
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.member_id = ${memberId}
      ORDER BY c.created_at DESC
    `;
    return comments;
  } catch (error) {
    console.error("Error fetching member comments:", error);
    return [];
  }
}

export async function getTrainingComments(trainingId: number) {
  try {
    const comments = await sql`
      SELECT 
        c.*,
        u.name as author_name
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.training_id = ${trainingId}
      ORDER BY c.created_at DESC
    `;
    return comments;
  } catch (error) {
    console.error("Error fetching training comments:", error);
    return [];
  }
}

export async function createComment(
  authorId: string,
  content: string,
  memberId?: number,
  trainingId?: number,
  isPrivate: boolean = false
) {
  try {
    await sql`
      INSERT INTO comments (author_id, member_id, training_id, content, is_private)
      VALUES (${authorId}, ${memberId || null}, ${trainingId || null}, ${content}, ${isPrivate})
    `;
    if (memberId) revalidatePath(`/members/${memberId}`);
    if (trainingId) revalidatePath(`/trainings/${trainingId}`);
    return { success: true };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { success: false, error: "Fehler beim Erstellen des Kommentars" };
  }
}

// Parent-Children Relationships
export async function getParentChildren(parentUserId: string) {
  try {
    const children = await sql`
      SELECT 
        m.*,
        teams.name as team_name
      FROM parent_children pc
      JOIN members m ON pc.child_member_id = m.id
      LEFT JOIN teams ON m.team_id = teams.id
      WHERE pc.parent_user_id = ${parentUserId}
      ORDER BY m.last_name, m.first_name
    `;
    return children;
  } catch (error) {
    console.error("Error fetching parent children:", error);
    return [];
  }
}

export async function addParentChild(parentUserId: string, childMemberId: number) {
  try {
    await sql`
      INSERT INTO parent_children (parent_user_id, child_member_id)
      VALUES (${parentUserId}, ${childMemberId})
      ON CONFLICT (parent_user_id, child_member_id) DO NOTHING
    `;
    revalidatePath("/members");
    return { success: true };
  } catch (error) {
    console.error("Error adding parent-child relationship:", error);
    return { success: false, error: "Fehler beim Hinzufügen der Beziehung" };
  }
}
