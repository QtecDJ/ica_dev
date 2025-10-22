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
    const data = await sql`SELECT * FROM members WHERE id = ${id}`;
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
    const teamId = formData.get("team_id") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const parentName = formData.get("parent_name") as string;
    const parentEmail = formData.get("parent_email") as string;
    const parentPhone = formData.get("parent_phone") as string;

    await sql`
      INSERT INTO members (first_name, last_name, birth_date, team_id, email, phone, parent_name, parent_email, parent_phone)
      VALUES (${firstName}, ${lastName}, ${birthDate}, ${teamId}, ${email}, ${phone}, ${parentName}, ${parentEmail}, ${parentPhone})
    `;
    
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
    const teamId = formData.get("team_id") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const parentName = formData.get("parent_name") as string;
    const parentEmail = formData.get("parent_email") as string;
    const parentPhone = formData.get("parent_phone") as string;

    await sql`
      UPDATE members 
      SET first_name = ${firstName}, last_name = ${lastName}, birth_date = ${birthDate},
          team_id = ${teamId}, email = ${email}, phone = ${phone},
          parent_name = ${parentName}, parent_email = ${parentEmail}, parent_phone = ${parentPhone}
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
    const teamId = formData.get("team_id") as string;
    const trainingDate = formData.get("training_date") as string;
    const startTime = formData.get("start_time") as string;
    const endTime = formData.get("end_time") as string;
    const location = formData.get("location") as string;
    const notes = formData.get("notes") as string;

    await sql`
      INSERT INTO trainings (team_id, training_date, start_time, end_time, location, notes)
      VALUES (${teamId}, ${trainingDate}, ${startTime}, ${endTime}, ${location}, ${notes})
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
    const teamId = formData.get("team_id") as string;
    const trainingDate = formData.get("training_date") as string;
    const startTime = formData.get("start_time") as string;
    const endTime = formData.get("end_time") as string;
    const location = formData.get("location") as string;
    const notes = formData.get("notes") as string;

    await sql`
      UPDATE trainings 
      SET team_id = ${teamId}, training_date = ${trainingDate}, 
          start_time = ${startTime}, end_time = ${endTime},
          location = ${location}, notes = ${notes}
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
