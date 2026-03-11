import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'objective5.sqlite';
const METADATA_TABLE = 'schema_metadata';
const SCHEMA_VERSION_KEY = 'schema_version';
const LATEST_SCHEMA_VERSION = 2;

type Migration = {
  version: number;
  statements: string[];
};

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    statements: [
      `
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL CHECK (length(trim(title)) > 0),
        body TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      `,
      'CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);',
    ],
  },
  {
    version: 2,
    statements: ['CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);'],
  },
];

type NoteRow = {
  id: number;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
};

type CountRow = {
  count: number;
};

type MetadataRow = {
  value: string;
};

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

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initializationPromise: Promise<number> | null = null;

function mapNoteRow(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return databasePromise;
}

async function ensureMetadataTable(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ${METADATA_TABLE} (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}

async function getStoredSchemaVersion(db: SQLite.SQLiteDatabase) {
  const row = await db.getFirstAsync<MetadataRow>(
    `SELECT value FROM ${METADATA_TABLE} WHERE key = ?;`,
    SCHEMA_VERSION_KEY
  );

  if (!row) {
    return 0;
  }

  const parsedVersion = Number.parseInt(row.value, 10);
  return Number.isFinite(parsedVersion) && parsedVersion >= 0 ? parsedVersion : 0;
}

async function setStoredSchemaVersion(db: SQLite.SQLiteDatabase, version: number) {
  await db.runAsync(
    `INSERT INTO ${METADATA_TABLE} (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
    SCHEMA_VERSION_KEY,
    String(version)
  );
}

async function runMigrations() {
  const db = await getDatabase();
  await ensureMetadataTable(db);

  let currentVersion = await getStoredSchemaVersion(db);

  for (const migration of MIGRATIONS) {
    if (migration.version <= currentVersion) {
      continue;
    }

    await db.withTransactionAsync(async () => {
      for (const statement of migration.statements) {
        await db.execAsync(statement);
      }
      await setStoredSchemaVersion(db, migration.version);
    });

    currentVersion = migration.version;
  }

  if (currentVersion > LATEST_SCHEMA_VERSION) {
    throw new Error(
      `Database schema version ${currentVersion} is newer than supported version ${LATEST_SCHEMA_VERSION}.`
    );
  }

  return currentVersion;
}

async function getNoteById(db: SQLite.SQLiteDatabase, noteId: number) {
  const row = await db.getFirstAsync<NoteRow>(
    `
    SELECT
      id,
      title,
      body,
      created_at,
      updated_at
    FROM notes
    WHERE id = ?;
    `,
    noteId
  );

  return row ? mapNoteRow(row) : null;
}

export async function initializeDatabase() {
  if (!initializationPromise) {
    initializationPromise = runMigrations().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}

export async function getSchemaVersion() {
  await initializeDatabase();
  const db = await getDatabase();
  return getStoredSchemaVersion(db);
}

export async function createNote(input: CreateNoteInput) {
  await initializeDatabase();
  const db = await getDatabase();

  const title = input.title.trim();
  if (!title) {
    throw new Error('Note title is required.');
  }

  const body = input.body?.trim() ?? '';
  const now = new Date().toISOString();

  const result = await db.runAsync(
    `
    INSERT INTO notes (title, body, created_at, updated_at)
    VALUES (?, ?, ?, ?);
    `,
    title,
    body,
    now,
    now
  );

  const createdNote = await getNoteById(db, result.lastInsertRowId);
  if (!createdNote) {
    throw new Error('Note creation succeeded but record could not be read back.');
  }

  return createdNote;
}

export async function listNotes() {
  await initializeDatabase();
  const db = await getDatabase();

  const rows = await db.getAllAsync<NoteRow>(
    `
    SELECT
      id,
      title,
      body,
      created_at,
      updated_at
    FROM notes
    ORDER BY updated_at DESC, id DESC;
    `
  );

  return rows.map(mapNoteRow);
}

export async function updateNote(noteId: number, updates: UpdateNoteInput) {
  await initializeDatabase();
  const db = await getDatabase();

  const assignments: string[] = [];
  const params: Array<number | string> = [];

  if (updates.title !== undefined) {
    const title = updates.title.trim();
    if (!title) {
      throw new Error('Updated title cannot be empty.');
    }
    assignments.push('title = ?');
    params.push(title);
  }

  if (updates.body !== undefined) {
    assignments.push('body = ?');
    params.push(updates.body.trim());
  }

  if (assignments.length === 0) {
    return getNoteById(db, noteId);
  }

  assignments.push('updated_at = ?');
  params.push(new Date().toISOString());
  params.push(noteId);

  const result = await db.runAsync(
    `UPDATE notes SET ${assignments.join(', ')} WHERE id = ?;`,
    ...params
  );

  if (result.changes === 0) {
    return null;
  }

  return getNoteById(db, noteId);
}

export async function deleteNote(noteId: number) {
  await initializeDatabase();
  const db = await getDatabase();

  const result = await db.runAsync('DELETE FROM notes WHERE id = ?;', noteId);
  return result.changes > 0;
}

export async function getDatabaseDiagnostics(): Promise<DatabaseDiagnostics> {
  await initializeDatabase();
  const db = await getDatabase();

  const notesTable = await db.getFirstAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'notes';"
  );
  const titleIndex = await db.getFirstAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_notes_title';"
  );
  const updatedAtIndex = await db.getFirstAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_notes_updated_at';"
  );
  const noteCountRow = await db.getFirstAsync<CountRow>('SELECT COUNT(*) AS count FROM notes;');
  const schemaVersion = await getStoredSchemaVersion(db);

  return {
    schemaVersion,
    notesTableExists: Boolean(notesTable),
    titleIndexExists: Boolean(titleIndex),
    updatedAtIndexExists: Boolean(updatedAtIndex),
    noteCount: noteCountRow?.count ?? 0,
  };
}
