import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccessibleButton } from '@/components/accessible-button';
import { ResponsiveContainer } from '@/components/responsive-layout';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppStateContext } from '@/context/app-state-context';
import {
  createNote,
  deleteNote,
  getDatabaseDiagnostics,
  getSchemaVersion,
  initializeDatabase,
  listNotes,
  type DatabaseDiagnostics,
  type Note,
  updateNote,
} from '@/data/notes-repository';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useThemeColor } from '@/hooks/use-theme-color';

function toYesNo(value: boolean) {
  return value ? 'Yes' : 'No';
}

export default function SQLiteScreen() {
  const { getResponsiveGap, getResponsivePadding, isTablet } = useResponsiveLayout();
  const gap = getResponsiveGap();
  const padding = getResponsivePadding();
  const borderColor = useThemeColor({ light: '#d4e0e7', dark: '#374149' }, 'icon');
  const mutedTextColor = useThemeColor({ light: '#5e6770', dark: '#b4bec6' }, 'icon');

  const { reportError, showSnackbar } = useAppStateContext();

  const [schemaVersion, setSchemaVersion] = useState<number | null>(null);
  const [diagnostics, setDiagnostics] = useState<DatabaseDiagnostics | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isBusy, setIsBusy] = useState(false);

  const appendLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((current) => [`${timestamp} - ${message}`, ...current].slice(0, 16));
  }, []);

  const refreshSnapshot = useCallback(async () => {
    const [version, dbDiagnostics, currentNotes] = await Promise.all([
      getSchemaVersion(),
      getDatabaseDiagnostics(),
      listNotes(),
    ]);

    setSchemaVersion(version);
    setDiagnostics(dbDiagnostics);
    setNotes(currentNotes);
  }, []);

  const runAction = useCallback(
    async (label: string, action: () => Promise<void>) => {
      if (isBusy) {
        return;
      }

      setIsBusy(true);
      try {
        await action();
      } catch (error) {
        appendLog(`${label} failed.`);
        reportError(error, `${label} failed. Check the logs on this screen.`);
      } finally {
        setIsBusy(false);
      }
    },
    [appendLog, isBusy, reportError]
  );

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const version = await initializeDatabase();
        if (cancelled) {
          return;
        }

        appendLog(`Database initialized at schema version ${version}.`);
        await refreshSnapshot();
      } catch (error) {
        if (!cancelled) {
          appendLog('Initial SQLite setup failed.');
          reportError(error, 'SQLite setup failed on initial load.');
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [appendLog, refreshSnapshot, reportError]);

  const handleRefresh = useCallback(() => {
    void runAction('Refresh snapshot', async () => {
      await refreshSnapshot();
      appendLog('Snapshot refreshed.');
    });
  }, [appendLog, refreshSnapshot, runAction]);

  const handleCreate = useCallback(() => {
    void runAction('Create note', async () => {
      const created = await createNote({
        title: `SQLite sample ${Date.now()}`,
        body: 'Created from Objective 5 CRUD screen.',
      });
      appendLog(`Create OK -> note ${created.id}.`);
      await refreshSnapshot();
    });
  }, [appendLog, refreshSnapshot, runAction]);

  const handleUpdateLatest = useCallback(() => {
    void runAction('Update latest note', async () => {
      const latestNote = notes[0];
      if (!latestNote) {
        appendLog('Update skipped: no notes to update.');
        return;
      }

      const updated = await updateNote(latestNote.id, {
        title: `${latestNote.title} (updated)`,
        body: `${latestNote.body} Updated at ${new Date().toLocaleTimeString()}.`,
      });

      if (!updated) {
        appendLog(`Update failed: note ${latestNote.id} was not found.`);
        return;
      }

      appendLog(`Update OK -> note ${updated.id}.`);
      await refreshSnapshot();
    });
  }, [appendLog, notes, refreshSnapshot, runAction]);

  const handleDeleteLatest = useCallback(() => {
    void runAction('Delete latest note', async () => {
      const latestNote = notes[0];
      if (!latestNote) {
        appendLog('Delete skipped: no notes to delete.');
        return;
      }

      const deleted = await deleteNote(latestNote.id);
      appendLog(deleted ? `Delete OK -> note ${latestNote.id}.` : 'Delete failed.');
      await refreshSnapshot();
    });
  }, [appendLog, notes, refreshSnapshot, runAction]);

  const handleRunVerification = useCallback(() => {
    void runAction('Objective 5 verification', async () => {
      const startupVersion = await initializeDatabase();
      const secondCheckVersion = await initializeDatabase();
      appendLog(
        `Migration idempotency check -> first: ${startupVersion}, second: ${secondCheckVersion}.`
      );

      const schemaCheck = await getDatabaseDiagnostics();
      appendLog(
        `Schema check -> table: ${toYesNo(schemaCheck.notesTableExists)}, title index: ${toYesNo(schemaCheck.titleIndexExists)}, updated_at index: ${toYesNo(schemaCheck.updatedAtIndexExists)}.`
      );

      const created = await createNote({
        title: `CRUD verification ${Date.now()}`,
        body: 'Temporary row used for Objective 5 verification.',
      });
      appendLog(`CRUD Create -> inserted note ${created.id}.`);

      const rowsAfterCreate = await listNotes();
      const readSucceeded = rowsAfterCreate.some((note) => note.id === created.id);
      appendLog(`CRUD Read -> ${readSucceeded ? 'found created row.' : 'created row missing.'}`);

      const updated = await updateNote(created.id, {
        title: `${created.title} (verified)`,
      });
      appendLog(updated ? `CRUD Update -> updated note ${updated.id}.` : 'CRUD Update -> failed.');

      const deleted = await deleteNote(created.id);
      appendLog(deleted ? 'CRUD Delete -> row removed.' : 'CRUD Delete -> failed.');

      await refreshSnapshot();
      showSnackbar('Objective 5 verification completed.', 'info');
    });
  }, [appendLog, refreshSnapshot, runAction, showSnackbar]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ResponsiveContainer style={{ gap: padding }}>
        <ThemedView style={{ gap }}>
          <ThemedText type="title" accessibilityRole="header">
            Objective 5: SQLite Schema, Migrations, CRUD
          </ThemedText>
          <ThemedText>
            This screen runs SQLite setup, migration checks, and repository CRUD actions from one
            module.
          </ThemedText>
        </ThemedView>

        <ThemedView lightColor="#f6fbfe" darkColor="#1a2429" style={[styles.card, { gap }]}>
          <ThemedText type="subtitle" accessibilityRole="header">
            Database Status
          </ThemedText>
          <ThemedText>Schema version: {schemaVersion ?? 'Loading...'}</ThemedText>
          <ThemedText>Notes table exists: {diagnostics ? toYesNo(diagnostics.notesTableExists) : '...'}</ThemedText>
          <ThemedText>Title index exists: {diagnostics ? toYesNo(diagnostics.titleIndexExists) : '...'}</ThemedText>
          <ThemedText>
            Updated-at index exists: {diagnostics ? toYesNo(diagnostics.updatedAtIndexExists) : '...'}
          </ThemedText>
          <ThemedText>Total notes: {diagnostics ? diagnostics.noteCount : '...'}</ThemedText>
        </ThemedView>

        <ThemedView lightColor="#f6fbfe" darkColor="#1a2429" style={[styles.card, { gap }]}>
          <ThemedText type="subtitle" accessibilityRole="header">
            CRUD Actions
          </ThemedText>
          <View style={{ gap }}>
            <AccessibleButton
              label={isBusy ? 'Working...' : 'Refresh Snapshot'}
              onPress={handleRefresh}
              disabled={isBusy}
              variant="secondary"
              size={isTablet ? 'large' : 'medium'}
              accessibilityHint="Reload schema version, diagnostics, and note rows from SQLite"
            />
            <AccessibleButton
              label={isBusy ? 'Working...' : 'Create Sample Note'}
              onPress={handleCreate}
              disabled={isBusy}
              size={isTablet ? 'large' : 'medium'}
              accessibilityHint="Insert one row in the notes table"
            />
            <AccessibleButton
              label={isBusy ? 'Working...' : 'Update Latest Note'}
              onPress={handleUpdateLatest}
              disabled={isBusy}
              variant="outline"
              size={isTablet ? 'large' : 'medium'}
              accessibilityHint="Update title and body for the most recent note"
            />
            <AccessibleButton
              label={isBusy ? 'Working...' : 'Delete Latest Note'}
              onPress={handleDeleteLatest}
              disabled={isBusy}
              variant="secondary"
              size={isTablet ? 'large' : 'medium'}
              accessibilityHint="Delete the most recent note from the table"
            />
            <AccessibleButton
              label={isBusy ? 'Working...' : 'Run Objective 5 Verification'}
              onPress={handleRunVerification}
              disabled={isBusy}
              variant="outline"
              size={isTablet ? 'large' : 'medium'}
              accessibilityHint="Run migration and CRUD verification checks in sequence"
            />
          </View>
        </ThemedView>

        <ThemedView lightColor="#f6fbfe" darkColor="#1a2429" style={[styles.card, { gap }]}>
          <ThemedText type="subtitle" accessibilityRole="header">
            Current Rows
          </ThemedText>
          {notes.length === 0 ? (
            <ThemedText style={{ color: mutedTextColor }}>
              No rows yet. Create a sample note to test the table.
            </ThemedText>
          ) : (
            notes.slice(0, 6).map((note) => (
              <ThemedView
                key={note.id}
                style={[
                  styles.noteItem,
                  {
                    borderColor,
                  },
                ]}>
                <ThemedText type="defaultSemiBold">
                  #{note.id} {note.title}
                </ThemedText>
                <ThemedText numberOfLines={2}>{note.body || '(empty body)'}</ThemedText>
                <ThemedText style={{ color: mutedTextColor }}>
                  Updated: {new Date(note.updatedAt).toLocaleString()}
                </ThemedText>
              </ThemedView>
            ))
          )}
        </ThemedView>

        <ThemedView lightColor="#f6fbfe" darkColor="#1a2429" style={[styles.card, { gap }]}>
          <ThemedText type="subtitle" accessibilityRole="header">
            Verification Log
          </ThemedText>
          {logs.length === 0 ? (
            <ThemedText style={{ color: mutedTextColor }}>
              No log output yet. Run a CRUD action or full verification.
            </ThemedText>
          ) : (
            logs.map((entry, index) => (
              <ThemedText key={`${entry}-${index}`} style={{ color: mutedTextColor }}>
                {entry}
              </ThemedText>
            ))
          )}
        </ThemedView>
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  noteItem: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
});
