const LATEST_SCHEMA_VERSION = 2;

export type Note = {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateNoteInput = {
  title: string;
  body?: string;
};

export type UpdateNoteInput = {
  title?: string;
  body?: string;
};

export type DatabaseDiagnostics = {
  schemaVersion: number;
  notesTableExists: boolean;
  titleIndexExists: boolean;
  updatedAtIndexExists: boolean;
  noteCount: number;
};

let schemaVersion = 0;
let nextId = 1;
const notes: Note[] = [];

function nowIso() {
  return new Date().toISOString();
}

function sortNotesDescending(left: Note, right: Note) {
  if (left.updatedAt === right.updatedAt) {
    return right.id - left.id;
  }
  return left.updatedAt < right.updatedAt ? 1 : -1;
}

export async function initializeDatabase() {
  if (schemaVersion < LATEST_SCHEMA_VERSION) {
    schemaVersion = LATEST_SCHEMA_VERSION;
  }
  return schemaVersion;
}

export async function getSchemaVersion() {
  await initializeDatabase();
  return schemaVersion;
}

export async function createNote(input: CreateNoteInput) {
  await initializeDatabase();

  const title = input.title.trim();
  if (!title) {
    throw new Error('Note title is required.');
  }

  const timestamp = nowIso();
  const note: Note = {
    id: nextId,
    title,
    body: input.body?.trim() ?? '',
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  nextId += 1;
  notes.unshift(note);
  return note;
}

export async function listNotes() {
  await initializeDatabase();
  return [...notes].sort(sortNotesDescending);
}

export async function updateNote(noteId: number, updates: UpdateNoteInput) {
  await initializeDatabase();

  const index = notes.findIndex((note) => note.id === noteId);
  if (index < 0) {
    return null;
  }

  const current = notes[index];
  const nextTitle = updates.title !== undefined ? updates.title.trim() : current.title;
  if (!nextTitle) {
    throw new Error('Updated title cannot be empty.');
  }

  const updated: Note = {
    ...current,
    title: nextTitle,
    body: updates.body !== undefined ? updates.body.trim() : current.body,
    updatedAt: nowIso(),
  };

  notes[index] = updated;
  return updated;
}

export async function deleteNote(noteId: number) {
  await initializeDatabase();

  const index = notes.findIndex((note) => note.id === noteId);
  if (index < 0) {
    return false;
  }

  notes.splice(index, 1);
  return true;
}

export async function getDatabaseDiagnostics(): Promise<DatabaseDiagnostics> {
  await initializeDatabase();
  return {
    schemaVersion,
    notesTableExists: true,
    titleIndexExists: true,
    updatedAtIndexExists: true,
    noteCount: notes.length,
  };
}
