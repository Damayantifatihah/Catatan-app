import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNotes } from '../hooks/useNotes';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../constants/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../constants/typography';

function showMessage(title, message) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function NotesScreen({ navigation }) {
  const { notes, loading, error, addNote, editNote, removeNote } = useNotes();
  const { logout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (error) showMessage('Error', error);
  }, [error]);

  function openAddModal() {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setModalVisible(true);
  }

  function openEditModal(note) {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setModalVisible(true);
  }

  async function handleSave() {
    if (!title.trim()) {
      showMessage('Error', 'Judul tidak boleh kosong');
      return;
    }
    const ok = editingNote
      ? await editNote(editingNote.id, { title, content })
      : await addNote({ title, content });
    if (ok) setModalVisible(false);
  }

  function handleDelete(id) {
    if (Platform.OS === 'web') {
      if (window.confirm('Yakin ingin menghapus catatan ini?')) removeNote(id);
    } else {
      Alert.alert('Hapus Catatan', 'Yakin ingin menghapus catatan ini?', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => removeNote(id) },
      ]);
    }
  }

  async function handleLogout() {
    const ok = await logout();
    if (ok) navigation.replace('Login');
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
  <TouchableOpacity onPress={() => navigation.navigate('Todo')}>
    <Text style={styles.link}>To-Do</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={handleLogout}>
    <Text style={styles.logoutText}>Logout</Text>
  </TouchableOpacity>
</View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada catatan. Tambah yuk!</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.noteItem}
            onPress={() => openEditModal(item)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.noteTitle}>{item.title}</Text>
              <Text style={styles.noteContent} numberOfLines={2}>
                {item.content}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Hapus</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingNote ? 'Edit Catatan' : 'Tambah Catatan'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Judul"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Isi catatan"
              value={content}
              onChangeText={setContent}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.modalButtonText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

topBar: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 12,
},
link: {
  color: COLORS.primary,
  fontWeight: FONT_WEIGHT.semibold,
  fontSize: FONT_SIZE.md,
},

  logoutText: {
    color: COLORS.danger,
    fontWeight: FONT_WEIGHT.semibold,
    fontSize: FONT_SIZE.md,
  },
  emptyText: { textAlign: 'center', marginTop: 40, color: COLORS.muted },
  noteItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  noteTitle: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.semibold },
  noteContent: { fontSize: FONT_SIZE.sm, color: COLORS.textSoft, marginTop: 4 },
  deleteButton: { paddingHorizontal: 10, paddingVertical: 6 },
  deleteText: { color: COLORS.danger, fontWeight: FONT_WEIGHT.semibold },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  fabText: { color: COLORS.white, fontSize: FONT_SIZE.fab, lineHeight: FONT_SIZE.fab },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, marginBottom: 14 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: FONT_SIZE.base,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: { backgroundColor: COLORS.neutralBtn },
  saveButton: { backgroundColor: COLORS.primary },
  modalButtonText: { color: COLORS.white, fontWeight: FONT_WEIGHT.semibold },
});